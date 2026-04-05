# -*- coding: utf-8 -*-
"""
Bulk extract questions from all unprocessed PDF files.
Handles Cracku-format PDFs (Maths, Reasoning, AAO) with A/B/C/D + Answer pattern.
"""
import json, os, re, sys, glob
import pdfplumber

sys.stdout.reconfigure(encoding='utf-8')

OTHER_DIR = "backend/pyq/other"
OUTPUT = "backend/data/cracku_extracted.json"

# ═══════════════════════════════════════════════════
# Already imported sources (skip these)
# ═══════════════════════════════════════════════════
ALREADY_IMPORTED = {
    "SSC CGL Tier-2 19-February-2018 English by Cracku.pdf",
    "SSC CGL Tier-2 21-February-2018 English by Cracku.pdf",
    "SSC CGL Tier-2 2010 English by Cracku (1).pdf",
    "SSC CGL Tier-2 2010 English by Cracku.pdf",
    "SSC CGL Tier-2 11th September 2019 English by Cracku.pdf",
    "SSC CGL Tier-2 12th September 2019 English by Cracku.pdf",
    "SSC CGL Tier-2 29th January 2022 English by Cracku.pdf",
    "SSC CGL Tier-2 8th August 2022 English by Cracku.pdf",
    # Big books/already processed
    "English Plinth to Paramount by Neetu Singh.pdf  SSC CGL   UPSC - IAS.pdf",
    "best-4000-smart-question-bank-ssc-general-knowledge-in-english-next-generation-smartbook-by-testbook-and-s-chand-026cc109.pdf",
    "Rakesh Yadav Reasoning Book Pdf.pdf",
    "GS in English Rakesh Yadav- sscstudy.pdf",
    "toaz.info-a-modern-approach-to-verbal-and-non-verbal-reasoning-pr_073f08ee3e68fcdfac618eaea070198b.pdf",
    "18-Jan-Paper-I-EN.pdf",
    "18-Jan-Paper-I-HN-1.pdf",
    "20-Jan-Paper-I-EN.pdf",
    "20-Jan-Paper-I-HN-1.pdf",
    # Hindi papers
    # Image-based CGL shift papers (no text extractable)
    "ssc-cgl-12th-sep-shift-1.pdf",
    "ssc-cgl-12th-sep-shift-2.pdf",
    "ssc-cgl-12th-sep-shift-3.pdf",
    "ssc-cgl-13th-sep-shift-1.pdf",
    "ssc-cgl-13th-sep-shift-2.pdf",
    "ssc-cgl-13th-sep-shift-3.pdf",
    "ssc-cgl-14th-sep-shift-1.pdf",
    "ssc-cgl-14th-sep-shift-2.pdf",
    "ssc-cgl-15th-sep-shift-1-2025.pdf",
    "ssc-cgl-16th-sep-shift-1.pdf",
    "ssc-cgl-19th-sep-shift-1.pdf",
    "ssc-cgl-20th-sep-shift-1.pdf",
    # Big books needing special handling
    "Objective of lucent (english)-signed.pdf",
    "SSC Reasoning 7000+ Objective Questions - Bilingual.pdf",
}

# Deduplicate: skip (1) copies if we have the original
SKIP_DUPES = {
    "SSC CGL Tier-2 11th September 2019 Maths by Cracku (1).pdf",  # dupe of non-(1)
    "SSC CGL Tier-2 13th September 2019 Maths by Cracku (1).pdf",  # dupe of non-(1)
}


def detect_subject(filename):
    """Detect subject from filename."""
    fn = filename.lower()
    if 'maths' in fn or 'math' in fn:
        return 'quant'
    elif 'english' in fn:
        return 'english'
    elif 'reasoning' in fn:
        return 'reasoning'
    elif 'audit officer' in fn or 'finance' in fn or 'aao' in fn:
        return 'gk'  # Finance/Accounts → GK
    return 'quant'  # default


def detect_topic(question_text, subject):
    """Try to detect topic from question content."""
    qt = question_text.lower()
    if subject == 'quant':
        topic_map = {
            'interest': 'Simple Interest',
            'profit': 'Profit and Loss', 'loss': 'Profit and Loss',
            'discount': 'Discount',
            'percentage': 'Percentage', 'percent': 'Percentage',
            'ratio': 'Ratio',
            'speed': 'Speed, Time and Distance', 'distance': 'Speed, Time and Distance',
            'train': 'Speed, Time and Distance', 'boat': 'Boat and Stream',
            'pipe': 'Pipe and Cistern', 'cistern': 'Pipe and Cistern',
            'average': 'Average', 'mean': 'Average',
            'triangle': 'Geometry', 'circle': 'Geometry', 'angle': 'Geometry',
            'area': 'Mensuration', 'volume': 'Mensuration', 'surface': 'Mensuration',
            'cylinder': 'Mensuration', 'cone': 'Mensuration', 'sphere': 'Mensuration',
            'algebra': 'Algebra',
            'sin': 'Trigonometry', 'cos': 'Trigonometry', 'tan': 'Trigonometry',
            'lcm': 'Number System', 'hcf': 'Number System', 'divisible': 'Number System',
            'remainder': 'Number System', 'prime': 'Number System',
            'age': 'Proportion and Age',
            'mixture': 'Mixture and Alligation', 'alligation': 'Mixture and Alligation',
            'work': 'Time and Work',
            'simplif': 'Simplification',
            'compound interest': 'Compound Interest',
        }
        for keyword, topic in topic_map.items():
            if keyword in qt:
                return topic
        return 'Quant Mixed'
    elif subject == 'reasoning':
        return 'Reasoning'
    elif subject == 'gk':
        return 'General Knowledge'
    return 'Mixed'


def extract_year_from_filename(filename):
    """Extract exam year from filename."""
    m = re.search(r'(20\d{2})', filename)
    return int(m.group(1)) if m else None


def parse_cracku_pdf(filepath):
    """Parse a Cracku-format PDF. Returns list of questions."""
    filename = os.path.basename(filepath)
    subject = detect_subject(filename)
    year = extract_year_from_filename(filename)
    
    # Extract all text
    all_text = ""
    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            all_text += text + "\n"
    
    if len(all_text.strip()) < 100:
        return []
    
    # Clean common noise
    all_text = re.sub(r'Downloaded from cracku\.in\s*\.?', '', all_text)
    all_text = re.sub(r'All rights reserved.*?support@cracku\.in', '', all_text, flags=re.DOTALL)
    all_text = re.sub(r'SSC CGL Free Mock Test.*?\n', '\n', all_text)
    all_text = re.sub(r'\d+ SSC Mocks for just.*?\n', '\n', all_text)
    all_text = re.sub(r'SSC CGL Previous Papers.*?\n', '\n', all_text)
    all_text = re.sub(r'Take Free SSC.*?\n', '\n', all_text)
    all_text = re.sub(r'Free SSC.*?\n', '\n', all_text)
    all_text = re.sub(r'SSC CHSL Free Mock Test.*?\n', '\n', all_text)
    all_text = re.sub(r'SSC Free Preparation App.*?\n', '\n', all_text)
    all_text = re.sub(r'SSC CHSL Prevoius Papers.*?\n', '\n', all_text)
    all_text = re.sub(r'cracku\.in', '', all_text)
    
    questions = []
    lines = all_text.split('\n')
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Match question start: "N. question text" or "Question N"
        qm = re.match(r'(?:Question\s+)?(\d{1,3})\.\s+(.*)', line)
        if not qm:
            # Also match "Question N" (no dot) for Reasoning PDFs
            qm2 = re.match(r'^Question\s+(\d{1,3})$', line)
            if qm2:
                qnum = int(qm2.group(1))
                q_parts = []
            else:
                i += 1
                continue
        else:
            qnum = int(qm.group(1))
            q_parts = [qm.group(2).strip()]
        
        # Collect question text lines until we hit option A
        j = i + 1
        while j < len(lines):
            s = lines[j].strip()
            if re.match(r'^[A-D]\s+\S', s):  # Option line
                break
            if re.match(r'^Answer:', s):
                break
            if s and not re.match(r'^Explanation:', s):
                q_parts.append(s)
            j += 1
        
        q_text = ' '.join(q_parts).strip()
        q_text = re.sub(r'\s{2,}', ' ', q_text)
        
        # Now parse options A, B, C, D
        options = {}
        while j < len(lines):
            s = lines[j].strip()
            opt_match = re.match(r'^([A-D])\s+(.*)', s)
            if opt_match:
                letter = opt_match.group(1)
                opt_text = opt_match.group(2).strip()
                # Collect continuation lines for this option
                k = j + 1
                while k < len(lines):
                    ns = lines[k].strip()
                    if re.match(r'^[A-D]\s+\S', ns) or re.match(r'^Answer:', ns):
                        break
                    if ns and not re.match(r'^Explanation:', ns):
                        opt_text += ' ' + ns
                    k += 1
                options[letter] = re.sub(r'\s{2,}', ' ', opt_text).strip()
                j = k
            elif re.match(r'^Answer:\s*([A-D])', s):
                break
            else:
                j += 1
        
        # Parse answer
        answer = None
        if j < len(lines):
            ans_match = re.match(r'^Answer:\s*([A-D])', lines[j].strip())
            if ans_match:
                answer = ans_match.group(1)
                j += 1
        
        i = j  # Move past this question
        
        # Validate: need question text + all 4 options + answer
        if not answer or len(options) < 4 or len(q_text) < 10:
            continue
        
        opt_a = options.get('A', '')
        opt_b = options.get('B', '')
        opt_c = options.get('C', '')
        opt_d = options.get('D', '')
        
        if not opt_a or not opt_b or not opt_c or not opt_d:
            continue
        
        # Truncate options that are too long (explanation leaked in)
        for opt_key in ['A', 'B', 'C', 'D']:
            o = options[opt_key]
            # If option contains "Answer:" or a question number, truncate
            trunc = re.search(r'\b(?:Answer:|Explanation:|\d{1,3}\.\s+[A-Z])', o)
            if trunc:
                options[opt_key] = o[:trunc.start()].strip()
        
        opt_a = options.get('A', '')
        opt_b = options.get('B', '')
        opt_c = options.get('C', '')
        opt_d = options.get('D', '')
        
        # Remove exam header from question text
        q_text = re.sub(r'^SSC CGL Tier-2.*?(?:Maths|English|Reasoning|Accounts|Finance)\s*', '', q_text).strip()
        
        answer_index = ord(answer) - ord('A')
        topic = detect_topic(q_text, subject)
        
        questions.append({
            'num': qnum,
            'question': q_text,
            'options': [opt_a, opt_b, opt_c, opt_d],
            'answer_index': answer_index,
            'answer_letter': answer.lower(),
            'subject': subject,
            'topic': topic,
            'source_file': filename,
            'year': year,
            'is_pyq': True,
        })
    
    return questions


def parse_aao_pdf(filepath):
    """Parse AAO paper - same Cracku format, just different subject."""
    return parse_cracku_pdf(filepath)


# ═══════════════════════════════════════════════════
# Process all files
# ═══════════════════════════════════════════════════

all_questions = []
file_stats = []

for fn in sorted(os.listdir(OTHER_DIR)):
    if not fn.endswith('.pdf'):
        continue
    if fn in ALREADY_IMPORTED:
        continue
    if fn in SKIP_DUPES:
        continue
    
    filepath = os.path.join(OTHER_DIR, fn)
    
    if 'Audit Officer' in fn:
        qs = parse_aao_pdf(filepath)
    else:
        qs = parse_cracku_pdf(filepath)
    
    if qs:
        all_questions.extend(qs)
        file_stats.append((fn, len(qs), qs[0]['subject']))
    else:
        file_stats.append((fn, 0, '?'))

# Summary
print(f"\n{'='*80}")
print(f"CRACKU EXTRACTION SUMMARY")
print(f"{'='*80}")
print(f"{'File':<70} {'Qs':>4} {'Subject':<10}")
print(f"{'-'*70} {'-'*4} {'-'*10}")
total = 0
for fn, nq, subj in file_stats:
    flag = ' ⚠' if nq == 0 else ''
    print(f"{fn[:70]:<70} {nq:>4} {subj:<10}{flag}")
    total += nq

print(f"{'-'*70} {'-'*4}")
print(f"{'TOTAL':<70} {total:>4}")

# Subject breakdown
subjects = {}
for q in all_questions:
    subjects[q['subject']] = subjects.get(q['subject'], 0) + 1
print(f"\nBy subject: {dict(subjects)}")

# Topic breakdown
topics = {}
for q in all_questions:
    topics[q['topic']] = topics.get(q['topic'], 0) + 1
print(f"\nBy topic:")
for t, c in sorted(topics.items(), key=lambda x: -x[1]):
    print(f"  {t}: {c}")

# Save
with open(OUTPUT, 'w', encoding='utf-8') as f:
    json.dump(all_questions, f, ensure_ascii=False, indent=2)

print(f"\nSaved {len(all_questions)} questions to {OUTPUT}")

# Show samples
print(f"\n{'='*80}")
print("SAMPLES:")
for q in all_questions[:5]:
    print(f"\n[{q['source_file'][:50]}] Q{q['num']}. {q['question'][:120]}")
    for i, o in enumerate(q['options']):
        mark = ' ✓' if i == q['answer_index'] else ''
        print(f"  ({chr(65+i)}) {o[:70]}{mark}")
