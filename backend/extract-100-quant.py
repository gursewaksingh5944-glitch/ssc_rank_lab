#!/usr/bin/env python3
"""
Extract 100 Quantitative Aptitude Questions from SSC CGL Tier 2 docx.
Also extract 7 Reasoning questions from the PDF.
Merge both into question-bank.json.
"""

import json
import re
import time
import random
import string
from docx import Document

QUANT_DOCX = r'backend/pyq/quant/100-Quantitative-Aptitude-Questions-With-Solutions-for-SSC-CGL-Tier-2-Exam.docx'
REASONING_PDF = r'backend/pyq/other/Reasoning Questions for SSC CGL Tier - 2 PDF - CLEAN.pdf'
QUESTION_BANK = r'backend/data/question-bank.json'

def gen_id():
    ts = int(time.time() * 1000)
    suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=7))
    return f"{ts}_{suffix}"

# ========== REASONING PDF EXTRACTION ==========
def extract_reasoning():
    import fitz
    doc = fitz.open(REASONING_PDF)
    full_text = ""
    for page in doc:
        full_text += page.get_text()
    doc.close()

    questions = []
    # Split by Q\d+.
    q_blocks = re.split(r'(?=Q\d+\.)', full_text)
    for block in q_blocks:
        block = block.strip()
        if not block:
            continue
        # Match Q number
        m = re.match(r'Q(\d+)\.\s*(.*)', block, re.DOTALL)
        if not m:
            continue
        q_num = int(m.group(1))
        rest = m.group(2).strip()

        # Extract answer
        ans_match = re.search(r'Answer:\s*([A-D])', rest)
        if not ans_match:
            continue
        answer_letter = ans_match.group(1).upper()
        answer_idx = ord(answer_letter) - ord('A')

        # Remove answer line from rest
        rest = rest[:ans_match.start()].strip()

        # Extract options A. B. C. D.
        opts_match = re.split(r'\n\s*([A-D])\.\s*', rest)
        # opts_match: [question_text, 'A', opt_a, 'B', opt_b, 'C', opt_c, 'D', opt_d]
        if len(opts_match) < 9:
            print(f"  Warning: Q{q_num} has {len(opts_match)} parts")
            continue

        q_text = opts_match[0].strip()
        options = []
        for i in range(1, len(opts_match), 2):
            if i + 1 < len(opts_match):
                options.append(opts_match[i + 1].strip())

        if len(options) != 4:
            print(f"  Warning: Q{q_num} has {len(options)} options")
            continue

        # Classify topic
        text_lower = q_text.lower()
        if any(w in text_lower for w in ['ratio', 'age', 'average', 'price', 'rs', 'weight', 'gram']):
            topic = "Arithmetic"
        elif any(w in text_lower for w in ['sitting', 'left', 'right', 'bench', 'position']):
            topic = "Seating Arrangement"
        elif any(w in text_lower for w in ['day', 'week', 'sunday', 'monday', 'yesterday', 'tomorrow']):
            topic = "Calendar"
        elif any(w in text_lower for w in ['interchange', 'sign', 'equation']):
            topic = "Mathematical Operations"
        else:
            topic = "Logical Reasoning"

        questions.append({
            "id": gen_id(),
            "type": "question",
            "examFamily": "ssc",
            "subject": "reasoning",
            "difficulty": "medium",
            "tier": "tier2",
            "questionMode": "objective",
            "topic": topic,
            "subtopic": None,
            "question": q_text,
            "options": options,
            "answerIndex": answer_idx,
            "explanation": "",
            "marks": 2,
            "negativeMarks": 0.5,
            "isChallengeCandidate": False,
            "confidenceScore": 0.95,
            "reviewStatus": "approved",
            "isPYQ": True,
            "year": None,
            "frequency": 1,
            "examName": "SSC CGL Tier 2",
            "questionNumber": q_num,
            "source": {
                "kind": "pyq_pdf",
                "fileName": "Reasoning Questions for SSC CGL Tier - 2 PDF - CLEAN.pdf",
                "importedAt": time.strftime("%Y-%m-%dT%H:%M:%S.000Z")
            },
            "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
            "updatedAt": time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
            "reviewAudit": {
                "reviewedAt": time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                "reviewedBy": "extract-100-quant.py",
                "decision": "approve",
                "rejectReason": ""
            }
        })

    print(f"Reasoning: Extracted {len(questions)} questions")
    return questions


# ========== 100 QUANT EXTRACTION ==========
def extract_quant():
    doc = Document(QUANT_DOCX)
    paras = doc.paragraphs

    # --- Phase 1: Classify each paragraph ---
    SOL_START = 596  # Solutions section starts here

    # Flatten question-section paragraphs into annotated entries
    entries = []
    for i, p in enumerate(paras[3:SOL_START]):
        idx = i + 3
        txt = p.text.strip()
        style = p.style.name if p.style else ''
        if not txt:
            entries.append({'idx': idx, 'type': 'empty', 'text': '', 'style': style})
            continue

        # Check if it's an option line with (a)/(b)/(c)/(d) inline
        has_b = bool(re.search(r'\(b\)\s*', txt, re.I))
        has_cd = bool(re.match(r'^\s*\(([c-d])\)', txt, re.I))
        has_a_labeled = bool(re.match(r'^\s*\(a\)\s+', txt, re.I))

        if has_b or has_a_labeled:
            entries.append({'idx': idx, 'type': 'options_inline', 'text': txt, 'style': style})
        elif has_cd:
            entries.append({'idx': idx, 'type': 'options_cd', 'text': txt, 'style': style})
        elif style == 'Heading 1':
            entries.append({'idx': idx, 'type': 'heading', 'text': txt, 'style': style})
        elif txt.lower().startswith('directions') or txt.lower().startswith('note'):
            entries.append({'idx': idx, 'type': 'direction', 'text': txt, 'style': style})
        else:
            entries.append({'idx': idx, 'type': 'text', 'text': txt, 'style': style})

    # --- Phase 2: Group into question blocks ---
    # A question block = [text entries...] + [option entries]
    # Options come as: options_inline (has (b)) + options_cd (has (c)/(d))
    # OR: 4 consecutive short text entries (separate-line options like Q6)

    questions_raw = []

    def split_inline_options(line):
        """Split a line like '20,28  (b) 15,21' into option texts."""
        opts = []
        # Find all (letter) positions
        markers = list(re.finditer(r'\(([a-d])\)\s*', line, re.I))
        if not markers:
            return [line.strip()]

        # Text before first marker could be option (a) without label
        before = line[:markers[0].start()].strip()
        if before:
            opts.append(before)

        for mi, m in enumerate(markers):
            start = m.end()
            end = markers[mi + 1].start() if mi + 1 < len(markers) else len(line)
            opt_text = line[start:end].strip().rstrip(',').strip()
            if opt_text:
                opts.append(opt_text)

        return opts

    i = 0
    q_text_parts = []
    direction_text = ""

    while i < len(entries):
        e = entries[i]

        if e['type'] in ('empty', 'heading'):
            i += 1
            continue

        if e['type'] == 'direction':
            direction_text = e['text']
            i += 1
            continue

        if e['type'] == 'text':
            # Could be question text, question continuation, or separate-line option
            # Check if next entries form separate-line options (4 short texts in a row)
            if e['style'] == 'List Paragraph' and len(e['text']) > 20:
                # Looks like question text - start collecting
                q_text_parts = [e['text']]
                i += 1
                # Collect continuations
                while i < len(entries) and entries[i]['type'] == 'text' and len(entries[i]['text']) > 0:
                    next_e = entries[i]
                    # Is this a continuation of question text or a separate-line option?
                    if len(next_e['text']) < 50 and next_e['style'] == 'List Paragraph':
                        # Could be separate-line option - check if we have 3-4 consecutive short ones
                        look_ahead = []
                        for j in range(4):
                            if i + j < len(entries) and entries[i + j]['type'] == 'text' and \
                               len(entries[i + j]['text']) < 50:
                                look_ahead.append(entries[i + j])
                            else:
                                break
                        if len(look_ahead) >= 3:
                            # These are separate-line options
                            opts = [la['text'] for la in look_ahead[:4]]
                            q_text = ' '.join(q_text_parts)
                            questions_raw.append({'text': q_text, 'options': opts})
                            q_text_parts = []
                            i += len(look_ahead[:4])
                            break
                        else:
                            # Short text but not enough for separate options - could be continuation
                            q_text_parts.append(next_e['text'])
                            i += 1
                    elif next_e['style'] in ('Body Text', 'Normal') and len(next_e['text']) < 100:
                        q_text_parts.append(next_e['text'])
                        i += 1
                    else:
                        break
                continue

            elif e['style'] in ('Body Text', 'Normal'):
                # Body text - might be question continuation
                if q_text_parts:
                    q_text_parts.append(e['text'])
                i += 1
                continue
            else:
                i += 1
                continue

        if e['type'] == 'options_inline':
            # Options with (b) marker - extract options
            opts_line1 = split_inline_options(e['text'])
            i += 1

            # Look for (c)/(d) line
            while i < len(entries) and entries[i]['type'] == 'empty':
                i += 1

            opts_line2 = []
            if i < len(entries) and entries[i]['type'] == 'options_cd':
                opts_line2 = split_inline_options(entries[i]['text'])
                i += 1
            elif i < len(entries) and entries[i]['type'] == 'options_inline':
                # Sometimes (c) and (d) are on an inline line too
                opts_line2 = split_inline_options(entries[i]['text'])
                i += 1

            all_opts = opts_line1 + opts_line2

            if q_text_parts:
                q_text = ' '.join(q_text_parts)
                questions_raw.append({'text': q_text, 'options': all_opts[:4]})
                q_text_parts = []
            else:
                # Orphan options - maybe displaced from earlier question
                # Save them for matching later
                questions_raw.append({'text': '[ORPHAN OPTIONS]', 'options': all_opts[:4]})

            continue

        if e['type'] == 'options_cd':
            # Orphan (c)/(d) line without preceding (a)/(b)
            i += 1
            continue

        i += 1

    print(f"Phase 2: Found {len(questions_raw)} raw question blocks")

    # Remove orphan and heading entries
    questions_clean = []
    for q in questions_raw:
        if q['text'] == '[ORPHAN OPTIONS]':
            continue
        if '100 Quantitative Aptitude' in q['text']:
            continue
        if len(q['options']) < 2:
            continue
        questions_clean.append(q)

    print(f"  After cleanup: {len(questions_clean)} questions")

    # --- Phase 3: Extract answers from solutions ---
    # Use List Paragraph (letter): as primary answer markers
    # Skip Heading 2 (letter): that appear within solution blocks (they're sub-references)
    ans_re = re.compile(r'^\s*(?:(\d+)[\.\s]+)?\(([a-d])\)\s*:', re.I)

    # Collect List Paragraph answers in sequence
    lp_answers = []
    for i, p in enumerate(paras[SOL_START:]):
        txt = p.text.strip()
        style = p.style.name if p.style else ''
        m = ans_re.match(txt)
        if m and style == 'List Paragraph':
            letter = m.group(2).lower()
            explicit_q = int(m.group(1)) if m.group(1) else None
            lp_answers.append({
                'para': i + SOL_START,
                'letter': letter,
                'explicit_q': explicit_q,
                'text': txt[:80]
            })

    print(f"Phase 3: Found {len(lp_answers)} List Paragraph answer markers")

    # Also collect Heading 2 answers as secondary
    h2_answers = []
    for i, p in enumerate(paras[SOL_START:]):
        txt = p.text.strip()
        style = p.style.name if p.style else ''
        m = ans_re.match(txt)
        if m and style == 'Heading 2':
            letter = m.group(2).lower()
            explicit_q = int(m.group(1)) if m.group(1) else None
            h2_answers.append({
                'para': i + SOL_START,
                'letter': letter,
                'explicit_q': explicit_q,
            })

    print(f"  Found {len(h2_answers)} Heading 2 answer markers (secondary)")

    # Build sequential answer list from LP answers
    # LP answers are most reliable for sequential mapping
    seq_answers = [a['letter'] for a in lp_answers]

    # Validate: Q2 answer should be (b) based on explicit "2. (b):"
    # The explicit Q2=(b) is in Heading 2, so let's check LP answer #2
    print(f"  LP answers sequence (first 15): {[a['letter'] for a in lp_answers[:15]]}")

    if len(seq_answers) < len(questions_clean):
        print(f"  WARNING: {len(seq_answers)} answers for {len(questions_clean)} questions")

    # --- Phase 4: Build question objects ---
    now = time.strftime("%Y-%m-%dT%H:%M:%S.000Z")
    questions = []

    for qi, qr in enumerate(questions_clean):
        q_num = qi + 1
        q_text = qr['text']
        options = qr['options']

        # Pad options if less than 4
        while len(options) < 4:
            options.append("")

        # Get answer - mark ALL as needs_review since answer mapping is unreliable
        ans_letter = seq_answers[qi] if qi < len(seq_answers) else None
        if ans_letter:
            ans_idx = ord(ans_letter) - ord('a')
            confidence = 0.6  # Lower confidence due to unreliable answer mapping
            review = "needs_review"
        else:
            ans_idx = 0
            confidence = 0.3
            review = "needs_review"

        # Check for empty options
        empty_opts = sum(1 for o in options if not o)
        if empty_opts > 0:
            confidence = 0.3

        # Classify topic
        text_lower = q_text.lower()
        if any(w in text_lower for w in ['age', 'years ago', 'years hence', 'present age']):
            topic = "Ages"
        elif any(w in text_lower for w in ['ratio', 'proportion']):
            topic = "Ratio & Proportion"
        elif any(w in text_lower for w in ['average']):
            topic = "Average"
        elif any(w in text_lower for w in ['speed', 'train', 'km/h', 'distance', 'time taken']):
            topic = "Speed, Time & Distance"
        elif any(w in text_lower for w in ['interest', 'principal', 'annum', 'compound']):
            topic = "Interest"
        elif any(w in text_lower for w in ['profit', 'loss', 'selling price', 'cost price', 'discount', 'marked price']):
            topic = "Profit & Loss"
        elif any(w in text_lower for w in ['percentage', '%']):
            topic = "Percentage"
        elif any(w in text_lower for w in ['lcm', 'hcf', 'divisible', 'remainder', 'factor', 'prime']):
            topic = "Number System"
        elif any(w in text_lower for w in ['triangle', 'circle', 'area', 'perimeter', 'radius', 'diameter',
                                            'cone', 'sphere', 'cylinder', 'volume', 'surface', 'tangent',
                                            'chord', 'hexagon', 'square']):
            topic = "Geometry & Mensuration"
        elif any(w in text_lower for w in ['sin', 'cos', 'tan', 'sec', 'cosec', 'cot', 'elevation',
                                            'depression', 'angle', 'ladder', 'tower', 'building']):
            topic = "Trigonometry"
        elif any(w in text_lower for w in ['simplif', 'value of', 'expression', 'equal to']):
            topic = "Simplification"
        elif any(w in text_lower for w in ['pipe', 'cistern', 'fill', 'work', 'days to complete', 'efficiency']):
            topic = "Work & Time"
        elif any(w in text_lower for w in ['alloy', 'mixture', 'solution', 'copper', 'zinc']):
            topic = "Mixture & Alligation"
        elif any(w in text_lower for w in ['company', 'employee', 'officer', 'worker', 'bar graph']):
            topic = "Data Interpretation"
        else:
            topic = "Arithmetic"

        questions.append({
            "id": gen_id(),
            "type": "question",
            "examFamily": "ssc",
            "subject": "quantitative aptitude",
            "difficulty": "medium",
            "tier": "tier2",
            "questionMode": "objective",
            "topic": topic,
            "subtopic": None,
            "question": q_text,
            "options": options[:4],
            "answerIndex": ans_idx,
            "explanation": "",
            "marks": 2,
            "negativeMarks": 0.5,
            "isChallengeCandidate": False,
            "confidenceScore": confidence,
            "reviewStatus": review,
            "isPYQ": True,
            "year": None,
            "frequency": 1,
            "examName": "SSC CGL Tier 2",
            "questionNumber": q_num,
            "source": {
                "kind": "pyq_pdf",
                "fileName": "100-Quantitative-Aptitude-Questions-With-Solutions-for-SSC-CGL-Tier-2-Exam.docx",
                "importedAt": now
            },
            "createdAt": now,
            "updatedAt": now,
            "reviewAudit": {
                "reviewedAt": now,
                "reviewedBy": "extract-100-quant.py",
                "decision": "needs_review",
                "rejectReason": "Auto-extracted from messy docx format - answer and options need manual verification"
            }
        })

    print(f"Phase 4: Built {len(questions)} question objects")
    return questions


if __name__ == '__main__':
    print("=" * 60)
    print("EXTRACTING REASONING QUESTIONS")
    print("=" * 60)
    reasoning_qs = extract_reasoning()
    for q in reasoning_qs:
        print(f"  Q{q['questionNumber']}: {q['question'][:60]}... -> ({chr(q['answerIndex']+65)})")

    print()
    print("=" * 60)
    print("EXTRACTING 100 QUANT QUESTIONS")
    print("=" * 60)
    quant_qs = extract_quant()

    # Show sample
    print("\nSample questions:")
    for q in quant_qs[:5]:
        print(f"  Q{q['questionNumber']}: {q['question'][:60]}...")
        for oi, opt in enumerate(q['options']):
            marker = " <--" if oi == q['answerIndex'] else ""
            print(f"    ({chr(oi+97)}) {opt[:40]}{marker}")
        print(f"    Status: {q['reviewStatus']}, Confidence: {q['confidenceScore']}")

    print(f"\nQuestions with empty options:")
    for q in quant_qs:
        empty = sum(1 for o in q['options'] if not o)
        if empty:
            print(f"  Q{q['questionNumber']}: {empty} empty options")

    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"{'='*60}")
    print(f"Reasoning: {len(reasoning_qs)} questions")
    print(f"Quant: {len(quant_qs)} questions")
    print(f"Total new: {len(reasoning_qs) + len(quant_qs)}")

    # Save intermediate results
    all_new = reasoning_qs + quant_qs
    with open('backend/data/new_extractions.json', 'w', encoding='utf-8') as f:
        json.dump(all_new, f, ensure_ascii=False, indent=2)
    print(f"Saved to backend/data/new_extractions.json")

    # --- Merge into question bank ---
    print(f"\n{'='*60}")
    print(f"MERGING INTO QUESTION BANK")
    print(f"{'='*60}")

    with open(QUESTION_BANK, 'r', encoding='utf-8') as f:
        bank = json.load(f)

    existing_count = len(bank['questions'])
    print(f"Existing questions: {existing_count}")

    # Check for duplicates by matching question text (first 80 chars)
    existing_texts = set()
    for q in bank['questions']:
        existing_texts.add(q['question'][:80].lower().strip())

    added = 0
    skipped = 0
    for q in all_new:
        key = q['question'][:80].lower().strip()
        if key in existing_texts:
            skipped += 1
            continue
        bank['questions'].append(q)
        existing_texts.add(key)
        added += 1

    bank['updatedAt'] = time.strftime("%Y-%m-%dT%H:%M:%S.000000+00:00")

    with open(QUESTION_BANK, 'w', encoding='utf-8') as f:
        json.dump(bank, f, ensure_ascii=False, indent=2)

    final_count = len(bank['questions'])
    print(f"Added: {added} new questions")
    print(f"Skipped: {skipped} duplicates")
    print(f"Final question bank: {final_count} questions")

    # Count by subject
    subjects = {}
    for q in bank['questions']:
        subj = q.get('subject', 'unknown')
        subjects[subj] = subjects.get(subj, 0) + 1
    print(f"\nBy subject:")
    for s, c in sorted(subjects.items()):
        print(f"  {s}: {c}")

    # Count by tier
    tiers = {}
    for q in bank['questions']:
        t = q.get('tier', 'unknown')
        tiers[t] = tiers.get(t, 0) + 1
    print(f"\nBy tier:")
    for t, c in sorted(tiers.items()):
        print(f"  {t}: {c}")

    # Count needs_review
    nr = sum(1 for q in bank['questions'] if q.get('reviewStatus') == 'needs_review')
    print(f"\nNeeds review: {nr}")
