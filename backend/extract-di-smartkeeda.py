"""
Extract 500 DI questions (100 sets × 5 questions) from Smartkeeda PDF.
Extracts: question text, options, answer key, explanations, and chart images.
Outputs: backend/data/di_extracted.json + public/images/di/*.png
"""

import fitz
import json
import re
import os

PDF_PATH = os.path.join(os.path.dirname(__file__), "pyq", "quant", "Data_Interpretation_Combo_PDF_for_Bank_PO_Pre.pdf")
OUTPUT_JSON = os.path.join(os.path.dirname(__file__), "data", "di_extracted.json")
IMAGE_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images", "di")

# Header image xref that appears on every page (Smartkeeda banner)
HEADER_XREF = 5

def extract_answer_key(pdf):
    """Extract answer key from pages 119-121 (indices 118-120)."""
    answers = {}
    for page_idx in range(118, 121):
        text = pdf[page_idx].get_text()
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        
        # Parse number-answer pairs
        # Format: numbers in groups of 10, then answers in groups of 10
        nums = []
        for line in lines:
            if line in ('A', 'B', 'C', 'D', 'E'):
                if nums:
                    answers[nums.pop(0)] = line
            elif re.match(r'^\d+$', line):
                num = int(line)
                if 1 <= num <= 500:
                    nums.append(num)
    
    print(f"Extracted {len(answers)} answers from answer key")
    return answers

def extract_explanations(pdf):
    """Extract explanations from pages 122-297 (indices 121-296)."""
    explanations = {}
    full_text = ""
    for page_idx in range(121, len(pdf)):
        text = pdf[page_idx].get_text()
        # Clean noise first
        text = re.sub(r'www\.smartkeeda\.com.*?Join us', '', text, flags=re.S)
        text = re.sub(r'SBI \| RBI \|.*?RJS', '', text, flags=re.S)
        text = re.sub(r'https?://[^\s]+', '', text)
        full_text += text + "\n"
    
    # Use "Hence, option X is correct" as delimiter for each explanation
    # Each explanation ends with this marker
    # Split by question number pattern: number followed by period at line start
    # Use a more forgiving pattern
    parts = re.split(r'(?:^|\n)\s*(\d{1,3})\.\s*\n', full_text)
    
    i = 1
    while i < len(parts) - 1:
        q_num = int(parts[i])
        explanation = parts[i + 1].strip()
        explanation = re.sub(r'\s+', ' ', explanation)
        
        if 1 <= q_num <= 500:
            explanations[q_num] = explanation
        i += 2
    
    # If the simple split didn't get enough, also try "Hence, option" markers
    if len(explanations) < 200:
        # Alternative: find all "Hence, option X is correct" blocks
        blocks = re.split(r'(Hence,\s*option\s+[A-E]\s+is\s+correct\.?)', full_text)
        current_q = None
        buffer = ""
        for block in blocks:
            # Check if block starts with a question number
            q_match = re.match(r'\s*(\d{1,3})\.\s*', block)
            if q_match:
                num = int(q_match.group(1))
                if 1 <= num <= 500:
                    current_q = num
                    buffer = block[q_match.end():]
            elif re.match(r'Hence,\s*option', block):
                if current_q and current_q not in explanations:
                    full_expl = (buffer + " " + block).strip()
                    full_expl = re.sub(r'\s+', ' ', full_expl)
                    explanations[current_q] = full_expl
                    current_q = None
                    buffer = ""
            else:
                buffer += " " + block
    
    print(f"Extracted {len(explanations)} explanations")
    return explanations

def extract_images(pdf):
    """Extract chart/diagram images from question pages, save to public/images/di/."""
    os.makedirs(IMAGE_DIR, exist_ok=True)
    
    # Track which images we've already saved (by xref)
    saved_xrefs = {}
    page_images = {}  # page_idx -> list of image filenames
    
    for page_idx in range(1, 118):  # Question pages
        images = pdf[page_idx].get_images(full=True)
        page_imgs = []
        
        for img in images:
            xref = img[0]
            if xref == HEADER_XREF:
                continue  # Skip header banner
            
            if xref in saved_xrefs:
                page_imgs.append(saved_xrefs[xref])
                continue
            
            base_img = pdf.extract_image(xref)
            w = base_img['width']
            h = base_img['height']
            
            # Skip tiny images (icons, bullets, etc.)
            if w < 100 or h < 80:
                continue
            
            ext = base_img['ext']
            filename = f"di_chart_{xref}.{ext}"
            filepath = os.path.join(IMAGE_DIR, filename)
            
            with open(filepath, 'wb') as f:
                f.write(base_img['image'])
            
            saved_xrefs[xref] = filename
            page_imgs.append(filename)
        
        if page_imgs:
            page_images[page_idx] = page_imgs
    
    print(f"Extracted {len(saved_xrefs)} unique chart images")
    return page_images

def parse_questions(pdf, page_images):
    """Parse all question text from pages 2-118 into sets."""
    # Collect all question text
    full_text = ""
    page_boundaries = []
    
    for page_idx in range(1, 118):
        text = pdf[page_idx].get_text()
        # Clean footer/header noise
        text = re.sub(r'www\.smartkeeda\.com.*?Join us', '', text, flags=re.S)
        text = re.sub(r'SBI \| RBI \|.*?RJS', '', text, flags=re.S)
        text = re.sub(r'https?://[^\s]+', '', text)
        text = re.sub(r'Warning:.*?admin@smartkeeda\.com', '', text, flags=re.S)
        text = re.sub(r'Date Interpretation Questions for Bank PO Pre Exams\.', '', text)
        page_boundaries.append((len(full_text), page_idx))
        full_text += text + "\n"
    
    # Split into sets
    set_pattern = r'(?:^|\n)\s*(?:SET\s*[-–—]\s*(\d+))'
    set_splits = list(re.finditer(set_pattern, full_text, re.I))
    
    # Also find "Directions" as set boundaries for sets without explicit SET markers
    dir_pattern = r'(?:^|\n)\s*Directions?\s*:'
    dir_splits = list(re.finditer(dir_pattern, full_text, re.I))
    
    print(f"Found {len(set_splits)} SET markers, {len(dir_splits)} Direction markers")
    
    # Build set boundaries using SET markers
    sets = []
    
    # If we have SET markers, use them
    if len(set_splits) >= 2:
        # First set might not have a SET marker (starts from beginning)
        # Check if there's content before the first SET marker
        first_set_start = set_splits[0].start()
        
        # Check for a Directions block before the first SET marker
        pre_content = full_text[:first_set_start].strip()
        if 'Directions' in pre_content or 'Direction' in pre_content:
            sets.append({
                'set_num': 1,
                'start': 0,
                'end': first_set_start
            })
        
        for i, match in enumerate(set_splits):
            set_num = int(match.group(1))
            start = match.start()
            end = set_splits[i + 1].start() if i + 1 < len(set_splits) else len(full_text)
            sets.append({
                'set_num': set_num,
                'start': start,
                'end': end
            })
    
    print(f"Identified {len(sets)} question sets")
    
    # Parse each set
    parsed_sets = []
    
    for s in sets:
        set_text = full_text[s['start']:s['end']].strip()
        set_num = s['set_num']
        
        # Extract directions (everything before first question number)
        # Questions start with "N." pattern at line beginning
        first_q = re.search(r'\n\s*(\d+)\.\s*\n', set_text)
        if first_q:
            q_start_num = int(first_q.group(1))
        else:
            # Try inline question pattern
            first_q = re.search(r'\n\s*(\d+)\.\s+\S', set_text)
            if first_q:
                q_start_num = int(first_q.group(1))
            else:
                print(f"  WARNING: No questions found in set {set_num}")
                continue
        
        directions = set_text[:first_q.start()].strip()
        # Clean SET header from directions
        directions = re.sub(r'^SET\s*[-–—]\s*\d+\s*', '', directions, flags=re.I).strip()
        
        # Find which page this set starts on (for image mapping)
        set_abs_pos = s['start']
        set_page = 1
        for pos, pidx in page_boundaries:
            if pos <= set_abs_pos:
                set_page = pidx
        
        # Get images for this set (check the set's pages)
        set_images = []
        for pos, pidx in page_boundaries:
            if s['start'] <= pos < s['end']:
                if pidx in page_images:
                    for img in page_images[pidx]:
                        if img not in set_images:
                            set_images.append(img)
        # Also check the page where the set starts
        if set_page in page_images:
            for img in page_images[set_page]:
                if img not in set_images:
                    set_images.insert(0, img)
        
        # Parse individual questions
        questions_text = set_text[first_q.start():]
        
        # Expected question number range for this set
        expected_start = (set_num - 1) * 5 + 1
        expected_end = set_num * 5
        valid_range = set(range(expected_start, expected_end + 1))
        
        # Split questions by their number pattern
        q_splits = list(re.finditer(r'(?:^|\n)\s*(\d+)\.\s*(?:\n|\s)', questions_text))
        
        # Filter to only valid question numbers for this set
        q_splits = [m for m in q_splits if int(m.group(1)) in valid_range]
        
        questions = []
        for qi, qm in enumerate(q_splits):
            q_num = int(qm.group(1))
            q_start = qm.end()
            q_end = q_splits[qi + 1].start() if qi + 1 < len(q_splits) else len(questions_text)
            q_text = questions_text[q_start:q_end].strip()
            
            # Parse options (A. B. C. D. E.)
            # Try multiple patterns
            options = []
            q_body = q_text
            
            # Pattern 1: Options on separate lines - allow no space after dot (e.g., "B.15")
            opt_pattern = r'(?:^|\n)\s*([A-E])\.[\s]*(.+?)(?=\n\s*[A-E]\.[\s]*\S|\Z)'
            opt_matches = list(re.finditer(opt_pattern, q_text, re.S))
            
            if len(opt_matches) < 4:
                # Pattern 2: Options inline
                opt_pattern2 = r'(?:^|\n)\s*([A-E])\.[\s]*(.+?)(?=\s+[A-E]\.[\s]*\S|\Z)'
                opt_matches = list(re.finditer(opt_pattern2, q_text, re.S))
            
            if len(opt_matches) < 4:
                # Pattern 3: Simple line-by-line
                opt_pattern3 = r'([A-E])\.[\s]*(.+)'
                opt_matches = list(re.finditer(opt_pattern3, q_text))
            
            if opt_matches and len(opt_matches) >= 4:
                q_body = q_text[:opt_matches[0].start()].strip()
                for om in opt_matches:
                    opt_text = om.group(2).strip()
                    opt_text = re.sub(r'\s+', ' ', opt_text)
                    # Remove trailing noise (footer text)
                    opt_text = re.sub(r'\s*Join us.*$', '', opt_text)
                    opt_text = re.sub(r'\s*www\.smartkeeda.*$', '', opt_text)
                    options.append(opt_text)
            
            if options:
                questions.append({
                    'num': q_num,
                    'question': q_body,
                    'options': options
                })
            else:
                print(f"  WARNING: Could not parse options for Q{q_num} in set {set_num}")
        
        parsed_sets.append({
            'set_num': set_num,
            'directions': directions,
            'images': set_images,
            'questions': questions,
            'first_q_num': q_start_num
        })
    
    return parsed_sets

def build_question_bank(parsed_sets, answers, explanations):
    """Build question bank entries from parsed data."""
    questions = []
    answer_map = {'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4}
    
    for s in parsed_sets:
        for q in s['questions']:
            q_num = q['num']
            
            # Build question text with passage
            passage = s['directions']
            
            # Get answer
            answer_letter = answers.get(q_num)
            if answer_letter:
                ans_idx = answer_map.get(answer_letter, 0)
            else:
                print(f"  WARNING: No answer for Q{q_num}")
                ans_idx = 0
            
            # Validate answer index against options count
            if ans_idx >= len(q['options']):
                print(f"  WARNING: Answer index {ans_idx} out of range for Q{q_num} (has {len(q['options'])} options)")
                continue
            
            # Get explanation
            explanation = explanations.get(q_num, "")
            
            # Build image references
            diagram = None
            if s['images']:
                diagram = s['images'][0]  # Primary chart for this set
            
            entry = {
                'set_num': s['set_num'],
                'q_num': q_num,
                'passage': passage,
                'question': q['question'],
                'options': q['options'],
                'answerIndex': ans_idx,
                'explanation': explanation,
                'diagram': diagram,
                'all_images': s['images']
            }
            questions.append(entry)
    
    return questions

def main():
    print(f"Opening PDF: {PDF_PATH}")
    pdf = fitz.open(PDF_PATH)
    print(f"Total pages: {len(pdf)}")
    
    # Step 1: Extract answer key
    print("\n--- Extracting Answer Key ---")
    answers = extract_answer_key(pdf)
    
    # Verify some answers
    print(f"Q1={answers.get(1)}, Q2={answers.get(2)}, Q500={answers.get(500)}")
    
    # Step 2: Extract images
    print("\n--- Extracting Images ---")
    page_images = extract_images(pdf)
    
    # Step 3: Extract explanations
    print("\n--- Extracting Explanations ---")
    explanations = extract_explanations(pdf)
    
    # Step 4: Parse questions
    print("\n--- Parsing Questions ---")
    parsed_sets = parse_questions(pdf, page_images)
    
    # Step 5: Build question bank
    print("\n--- Building Question Bank ---")
    all_questions = build_question_bank(parsed_sets, answers, explanations)
    
    print(f"\nTotal questions extracted: {len(all_questions)}")
    print(f"Sets extracted: {len(parsed_sets)}")
    
    # Show stats
    with_diagrams = sum(1 for q in all_questions if q['diagram'])
    with_explanations = sum(1 for q in all_questions if q['explanation'])
    five_opt = sum(1 for q in all_questions if len(q['options']) == 5)
    four_opt = sum(1 for q in all_questions if len(q['options']) == 4)
    
    print(f"With diagrams: {with_diagrams}")
    print(f"With explanations: {with_explanations}")
    print(f"5-option questions: {five_opt}")
    print(f"4-option questions: {four_opt}")
    
    # Save extracted data
    output = {
        'total': len(all_questions),
        'sets': len(parsed_sets),
        'source': 'Data_Interpretation_Combo_PDF_for_Bank_PO_Pre.pdf',
        'questions': all_questions
    }
    
    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\nSaved to: {OUTPUT_JSON}")
    
    # Show first few questions as samples
    print("\n--- Sample Questions ---")
    for q in all_questions[:3]:
        print(f"\nQ{q['q_num']} (Set {q['set_num']}):")
        print(f"  Passage: {q['passage'][:150]}...")
        print(f"  Question: {q['question'][:100]}")
        print(f"  Options: {q['options']}")
        print(f"  Answer: {q['answerIndex']} ({chr(65 + q['answerIndex'])})")
        print(f"  Diagram: {q['diagram']}")
    
    pdf.close()

if __name__ == "__main__":
    main()
