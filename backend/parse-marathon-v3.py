# -*- coding: utf-8 -*-
"""
Parse marathon questions - V3.
Strategy: Find option blocks (a)(b)(c)(d), then look backward for English Q text.
This avoids the Hindi text interleaving problem entirely.
"""
import json, re, sys
from collections import OrderedDict, Counter

sys.stdout.reconfigure(encoding='utf-8')

INPUT = "backend/data/marathon_columns.txt"

with open(INPUT, 'r', encoding='utf-8') as f:
    full_text = f.read()

# ═══════════════════════════════════════════════════
# Hindi / noise detection
# ═══════════════════════════════════════════════════

DEVANAGARI = re.compile(r'[\u0900-\u097F]')
KRUTIDEV_WORDS = re.compile(
    r';fn|fdlh|vkSj|cjkcj|gksxk|djsa|fdruk|gksr|fdruh|vk;|dke|'
    r'fd;k|tkrk|djds|x;k|D;k|vuqikr|djuk|le;|Hkkx|cpr|fnu|'
    r'gSA|gS]|Kkr|yEck|vf/d|izfr|osru|feJ|la\[;k|ckdh|iznku|'
    r'feyh|eku|tkrh|cuk;|cspk|cpk|eky|feyk|gkfu|C;kt|'
    r'mÙkj|fn;k|xbZ|xbZA|fdrus|feyrs|leku|foØ;|ykHk|fey|'
    r'ykxr|ewY;|csp|dqy|Øe|çfr|fnyk|dVkS|ckn|igys|ckj|okil|'
    r'pky|nwjh|rhljh|igyh|nwljh|okyk|O;fDr|feyk|kwjh|lehdj'
)

def is_likely_hindi(line):
    """Check if a line is Hindi/Krutidev/noise."""
    s = line.strip()
    if not s:
        return True
    if len(s) <= 2:
        return True
    if DEVANAGARI.search(s):
        return True
    hits = len(KRUTIDEV_WORDS.findall(s))
    if hits >= 1:
        return True
    # Lines with semicolons + brackets typical of Krutidev  
    if s.count(';') >= 2 or s.count(']') >= 2 or s.count('\\') >= 2:
        return True
    # Noise headers
    if re.match(r'^Selected|^Aditya|^Smart_E|^Percenta|^SOLUT|^ANSWE|^R KEY|^Daily Practice Q', s):
        return True
    return False


def is_english_text(line):
    """Check if line is English text (question/source)."""
    s = line.strip()
    if not s or len(s) <= 2:
        return False
    if DEVANAGARI.search(s):
        return False
    if KRUTIDEV_WORDS.search(s):
        return False
    # Must have some English words
    words = s.split()
    english_words = sum(1 for w in words if re.match(r'^[A-Za-z]', w))
    return english_words >= 1


# ═══════════════════════════════════════════════════
# Chapter definitions
# ═══════════════════════════════════════════════════

CHAPTERS = [
    (1, "Percentage-01", "Percentage", (4, 5)),
    (2, "Percentage-02", "Percentage", (6, 10)),
    (3, "Percentage-03", "Percentage", (11, 18)),
    (4, "Profit and Loss-01", "Profit and Loss", (19, 23)),
    (5, "Profit and Loss-02", "Profit and Loss", (24, 26)),
    (6, "Profit and Loss-03", "Profit and Loss", (27, 30)),
    (7, "Profit and Loss-04", "Profit and Loss", (31, 34)),
    (8, "Discount-01", "Discount", (35, 39)),
    (9, "Discount-02", "Discount", (40, 44)),
    (10, "Algebra-01", "Algebra", (45, 50)),
    (11, "Algebra-02", "Algebra", (51, 53)),
    (12, "Algebra-03", "Algebra", (54, 58)),
    (13, "Mock Test-01", "Mock Test", (59, 61)),
    (14, "Algebra-04", "Algebra", (62, 66)),
    (15, "Simple Interest-01", "Simple Interest", (67, 70)),
    (16, "Simple Interest-02", "Simple Interest", (71, 74)),
    (17, "Compound Interest-01", "Compound Interest", (75, 78)),
    (18, "Compound Interest-02", "Compound Interest", (79, 84)),
    (19, "Installment SI & CI", "Installment", (85, 89)),
    (20, "Mock Test-02", "Mock Test", (90, 92)),
    (21, "Simplification-01", "Simplification", (93, 96)),
    (22, "Simplification-02", "Simplification", (97, 101)),
    (23, "Number System-01", "Number System", (102, 104)),
    (24, "Number System-02", "Number System", (105, 107)),
    (25, "Number System-03", "Number System", (108, 111)),
    (26, "Number System-04", "Number System", (112, 118)),
    (27, "Trigonometry-01", "Trigonometry", (119, 123)),
    (28, "Trigonometry-02", "Trigonometry", (124, 129)),
    (29, "Trigonometry-03", "Trigonometry", (130, 133)),
    (30, "Trigonometry-04", "Trigonometry", (134, 140)),
    (31, "Mock Test-03", "Mock Test", (141, 143)),
    (32, "Ratio", "Ratio", (144, 155)),
    (33, "Proportion Age Partnership", "Proportion and Age", (156, 166)),
    (34, "Mixture & Alligation", "Mixture and Alligation", (167, 175)),
    (35, "Average", "Average", (176, 188)),
    (36, "Time & Work", "Time and Work", (189, 201)),
    (37, "Coordinate Geometry", "Coordinate Geometry", (202, 218)),
    (38, "Pipe & Cistern", "Pipe and Cistern", (219, 233)),
    (39, "Mock Test-04", "Mock Test", (234, 236)),
    (40, "Mock Test-05", "Mock Test", (237, 240)),
    (41, "Statistics", "Statistics", (241, 256)),
    (42, "Time & Distance", "Speed, Time and Distance", (257, 265)),
    (43, "Train Boat & Stream", "Boat and Stream", (266, 279)),
    (44, "Geometry", "Geometry", (280, 295)),
    (45, "Mensuration 2D & 3D", "Mensuration", (296, 315)),
    (46, "TOP 30 RRB NTPC GL 2025", "Mixed", (316, 319)),
    (47, "TOP 25 Arithmetic RRB NTPC UGL", "Mixed", (320, 327)),
    (48, "TOP 25 Advance RRB NTPC UGL", "Mixed", (328, 334)),
]


# ═══════════════════════════════════════════════════
# Page text extraction
# ═══════════════════════════════════════════════════

def get_chapter_text(start_page, end_page):
    parts = []
    for pg in range(start_page, end_page + 1):
        for side in ['LEFT', 'RIGHT']:
            marker = f"--- PAGE {pg} {side} ---\n"
            idx = full_text.find(marker)
            if idx < 0:
                continue
            content_start = idx + len(marker)
            next_marker = re.search(r'--- PAGE \d+ (?:LEFT|RIGHT) ---', full_text[content_start:])
            if next_marker:
                content = full_text[content_start:content_start + next_marker.start()]
            else:
                content = full_text[content_start:]
            parts.append(content)
    return '\n'.join(parts)


# ═══════════════════════════════════════════════════
# Answer key extraction  
# ═══════════════════════════════════════════════════

def extract_answer_keys(chapter_text):
    answers = {}
    # Find answer key blocks
    for m in re.finditer(r'A?ANSWE', chapter_text):
        block = chapter_text[m.start():m.start()+2000]
        for am in re.finditer(r'(\d{1,3})\.\s*\(?([abcd])\)?', block):
            qnum = int(am.group(1))
            if 1 <= qnum <= 100:
                answers[qnum] = am.group(2)
    
    # Dense answer lines without header
    for line in chapter_text.split('\n'):
        entries = re.findall(r'(\d{1,3})\.\s*\(([abcd])\)', line)
        if len(entries) >= 3:
            for qnum_s, letter in entries:
                qnum = int(qnum_s)
                if 1 <= qnum <= 100:
                    answers[qnum] = letter
    
    return answers


# ═══════════════════════════════════════════════════
# Core parser: options-first approach
# ═══════════════════════════════════════════════════

def find_option_blocks(text):
    """Find all (a)...(b)...(c)...(d)... option blocks in text.
    Returns list of (start_of_a, end_of_d_option, options_list)."""
    
    # Pre-clean: remove stray single-char lines that appear between options
    # These are PDF artifacts from the other column
    lines = text.split('\n')
    cleaned_lines = []
    for line in lines:
        s = line.strip()
        # Skip standalone single chars (but keep numbers, keep option lines)
        if len(s) == 1 and s.isalpha():
            continue
        cleaned_lines.append(line)
    text = '\n'.join(cleaned_lines)
    
    opt_re = re.compile(r'\(([abcd])\)\s*')
    matches = list(opt_re.finditer(text))
    
    blocks = []
    used = set()
    
    for i in range(len(matches)):
        if i in used:
            continue
        if i + 3 >= len(matches):
            break
        
        a, b, c, d = matches[i], matches[i+1], matches[i+2], matches[i+3]
        if [a.group(1), b.group(1), c.group(1), d.group(1)] != ['a', 'b', 'c', 'd']:
            continue
        
        # Options should be reasonably close together (within ~500 chars)
        if d.start() - a.start() > 500:
            continue
        
        oa = text[a.end():b.start()].strip()
        ob = text[b.end():c.start()].strip()
        oc = text[c.end():d.start()].strip()
        
        # (d) option: take until next newline or end of reasonable content
        od_text = text[d.end():]
        od_lines = od_text.split('\n')
        od = od_lines[0].strip() if od_lines else ''
        if not od and len(od_lines) > 1:
            od = od_lines[1].strip()
        od_end = len(od) + 1
        
        # Clean single stray chars and Krutidev from options
        def clean_opt(o):
            o = re.sub(r'\n', ' ', o).strip()
            # Remove Krutidev/noise words first
            o = KRUTIDEV_WORDS.sub('', o).strip()
            o = DEVANAGARI.sub('', o).strip()
            # Remove noise fragments
            for noise in ['Percenta', 'Daily Practice', 'Selected', 'Aditya', 'ANSWE', 'SOLUT', 'R KEY', 'Smart_E']:
                idx = o.find(noise)
                if idx >= 0:
                    o = o[:idx].strip()
            # Remove isolated single chars (upper or lower) - PDF artifacts from other column
            o = re.sub(r'(?<=\s)[A-Za-z](?=\s)', '', o)   # mid-text single chars
            o = re.sub(r'\s+[a-zA-Z]$', '', o)             # trailing single char
            o = re.sub(r'^[A-Za-z]\s+(?=[A-Z0-9`₹(])', '', o)  # leading single char
            o = re.sub(r'\s{2,}', ' ', o).strip()
            return o
        
        oa = clean_opt(oa)
        ob = clean_opt(ob) 
        oc = clean_opt(oc)
        od = clean_opt(od)
        
        # Collapse whitespace
        oa = re.sub(r'\s{2,}', ' ', oa).strip()
        ob = re.sub(r'\s{2,}', ' ', ob).strip()
        oc = re.sub(r'\s{2,}', ' ', oc).strip()
        od = re.sub(r'\s{2,}', ' ', od).strip()
        
        if oa and ob and oc and od:
            blocks.append((a.start(), d.end() + od_end, [oa, ob, oc, od]))
            used.update([i, i+1, i+2, i+3])
    
    return blocks


def find_question_for_options(text, opt_start):
    """Look backward from option start to find the question number and text."""
    # Look at text before options
    before = text[:opt_start]
    
    # Find the last question number "N. " before options  
    q_matches = list(re.finditer(r'(?:^|\n)(\d{1,3})\.\s+', before))
    if not q_matches:
        return None, None, None
    
    last_q = q_matches[-1]
    qnum = int(last_q.group(1))
    q_start = last_q.end()
    
    # Get text between question number and options
    raw_text = before[q_start:].strip()
    
    # Split into lines and keep only English
    lines = raw_text.split('\n')
    english_lines = []
    for line in lines:
        s = line.strip()
        if not s:
            continue
        if is_likely_hindi(s):
            continue
        # Skip single chars (PDF artifacts)
        if len(s) <= 2 and not re.match(r'\d+$', s):
            continue
        english_lines.append(s)
    
    q_text = ' '.join(english_lines).strip()
    
    # Extract exam source
    exam_source = None
    source_pat = re.compile(
        r'((?:SSC|DP|CGL|CHSL|CPO|MTS|ShSC)\s+\w+.*?\d{2,4}(?:/\d{2,4}){0,2}(?:\s*\(Shift-\d+\)?)?)',
        re.IGNORECASE
    )
    sm = source_pat.search(q_text)
    if sm:
        exam_source = sm.group(1).strip()
        # Fix common OCR errors
        exam_source = exam_source.replace('ShSC', 'SSC')
        exam_source = re.sub(r'\($', '', exam_source).strip()
        q_text = q_text[:sm.start()] + q_text[sm.end():]
        q_text = q_text.strip()
    
    # Final cleanup
    q_text = re.sub(r'\s{2,}', ' ', q_text).strip()
    
    # Remove known Krutidev fragments that slipped past line filter
    q_text = KRUTIDEV_WORDS.sub('', q_text).strip()
    
    # Remove trailing garbage after last sentence-ending punctuation
    # Find last ? or : or . or ) that likely ends the real question
    for punc in ['?', ':', '.']:
        idx = q_text.rfind(punc)
        if idx >= 0 and idx > len(q_text) * 0.4:  # Must be past midpoint
            trailing = q_text[idx+1:].strip()
            if trailing:
                # Check if trailing text is meaningful English or garbage
                alpha_count = sum(1 for c in trailing if c.isalpha())
                words = trailing.split()
                has_exam_name = bool(re.search(r'(?:SSC|CGL|CHSL|CPO|MTS|TIER|ShSC|RRB|NTPC)', trailing, re.I))
                # Garbage: short, mostly single chars, no real words, or exam source remnants
                is_garbage = (
                    len(trailing) < 60 and (
                        all(len(w) <= 3 for w in words) or
                        alpha_count < len(trailing) * 0.3 or
                        len(words) <= 4 or
                        has_exam_name
                    )
                )
                if is_garbage:
                    q_text = q_text[:idx+1].strip()
                    break
    
    # Remove trailing single uppercase/lowercase letters
    q_text = re.sub(r'\s+[A-Za-z]\s*$', '', q_text).strip()
    # Remove trailing Roman numerals / source fragments
    q_text = re.sub(r'\s+(?:II|III|IV|VI|VII|VIII)\.?\s*$', '', q_text).strip()
    # Remove trailing ".?" double punctuation
    q_text = re.sub(r'\.\?$', '?', q_text)
    # Remove leading garbage
    q_text = re.sub(r'^[^A-Za-z0-9(₹`"]+', '', q_text).strip()
    q_text = re.sub(r'\s{2,}', ' ', q_text).strip()
    
    if len(q_text) < 10:
        return None, None, None
    
    # Skip answer key fragments mistakenly parsed as questions
    if re.match(r'^\(?[abcd]\)?\s+\d', q_text):
        return None, None, None
    
    # Skip truncated math questions (mostly formula fragments)
    if len(q_text) < 30 and not any(c in q_text for c in ['?', ':']):
        return None, None, None
    
    return qnum, q_text, exam_source


def parse_chapter(chapter_text, chapter_name):
    """Parse questions using options-first approach."""
    answer_keys = extract_answer_keys(chapter_text)
    
    # Strip answer key sections from question parsing
    # Remove ANSWER KEY blocks but be conservative - only remove the key lines
    lines = chapter_text.split('\n')
    clean_lines = []
    in_ans_key = False
    for line in lines:
        s = line.strip()
        if 'ANSWE' in s or 'R KEY' in s:
            in_ans_key = True
            continue
        if in_ans_key:
            # Dense answer entries
            if len(re.findall(r'\d{1,3}\.\s*\([abcd]\)', s)) >= 2:
                continue
            # Single answer entry
            if re.match(r'^\d{1,3}\.\s*\([abcd]\)', s):
                continue
            # Exit answer key mode on real content
            in_ans_key = False
        clean_lines.append(line)
    clean_for_parse = '\n'.join(clean_lines)
    
    # Find option blocks
    opt_blocks = find_option_blocks(clean_for_parse)
    
    questions = []
    seen_nums = set()
    
    for opt_start, opt_end, opts in opt_blocks:
        qnum, q_text, exam_source = find_question_for_options(clean_for_parse, opt_start)
        if qnum is None:
            continue
        if qnum in seen_nums:
            continue  # Duplicate
        seen_nums.add(qnum)
        
        ans = answer_keys.get(qnum)
        
        questions.append({
            'num': qnum,
            'question': q_text,
            'options': opts,
            'answer_letter': ans,
            'exam_source': exam_source,
        })
    
    # Sort by question number
    questions.sort(key=lambda q: q['num'])
    return questions, answer_keys


# ═══════════════════════════════════════════════════
# Process all chapters
# ═══════════════════════════════════════════════════

all_questions = []
chapter_stats = []

for ch_num, ch_name, topic, (start_pg, end_pg) in CHAPTERS:
    ch_text = get_chapter_text(start_pg, end_pg)
    questions, answer_keys = parse_chapter(ch_text, ch_name)
    
    with_ans = sum(1 for q in questions if q['answer_letter'])
    without_ans = sum(1 for q in questions if not q['answer_letter'])
    
    for q in questions:
        q['chapter'] = ch_name
        q['topic'] = topic
    
    all_questions.extend(questions)
    chapter_stats.append((ch_num, ch_name, topic, len(questions), with_ans, without_ans, len(answer_keys)))

# Print summary
print(f"\n{'='*80}")
print(f"EXTRACTION SUMMARY")
print(f"{'='*80}")
print(f"{'Ch':>3} {'Chapter':<35} {'Topic':<25} {'Qs':>4} {'Ans':>4} {'NoAns':>5} {'Keys':>4}")
print(f"{'-'*3} {'-'*35} {'-'*25} {'-'*4} {'-'*4} {'-'*5} {'-'*4}")

total_q = total_ans = total_noans = 0
for ch_num, ch_name, topic, nq, wa, woa, nk in chapter_stats:
    flag = ' ⚠' if woa > 3 or nq == 0 else ''
    print(f"{ch_num:>3} {ch_name:<35} {topic:<25} {nq:>4} {wa:>4} {woa:>5} {nk:>4}{flag}")
    total_q += nq
    total_ans += wa
    total_noans += woa

print(f"{'-'*3} {'-'*35} {'-'*25} {'-'*4} {'-'*4} {'-'*5}")
print(f"{'':>3} {'TOTAL':<35} {'':>25} {total_q:>4} {total_ans:>4} {total_noans:>5}")

# Save
with open('backend/data/marathon_parsed.json', 'w', encoding='utf-8') as f:
    json.dump(all_questions, f, ensure_ascii=False, indent=2)

print(f"\nSaved {len(all_questions)} questions to marathon_parsed.json")

# Quality check
krutidev_check = re.compile(r';fn|fdlh|vkSj|gksxk|djsa|fdruk|gSA|gS]|Kkr|vuqikr|djuk|cpr')
hindi_q = sum(1 for q in all_questions if krutidev_check.search(q['question']) or DEVANAGARI.search(q['question']))
hindi_o = sum(1 for q in all_questions if any(krutidev_check.search(o) or DEVANAGARI.search(o) for o in q['options']))
long_o = sum(1 for q in all_questions if any(len(o) > 80 for o in q['options']))
empty_o = sum(1 for q in all_questions if any(not o.strip() for o in q['options']))

print(f"\nQUALITY:")
print(f"  Hindi in questions: {hindi_q}")
print(f"  Hindi in options:   {hindi_o}")
print(f"  Long options (>80): {long_o}")
print(f"  Empty options:      {empty_o}") 
print(f"  No answer key:      {total_noans}")
clean_count = len(all_questions) - hindi_q - hindi_o - long_o - empty_o
print(f"  Clean:              {clean_count}")

# Samples
print(f"\n{'='*80}")
print("SAMPLES:")
for q in all_questions[:10]:
    ans = q['answer_letter'] or '?'
    print(f"\n[{q['chapter']}] Q{q['num']}. {q['question'][:140]}")
    for i, o in enumerate(q['options']):
        mark = ' ✓' if q['answer_letter'] and i == ord(q['answer_letter']) - ord('a') else ''
        print(f"  ({chr(ord('a')+i)}) {o[:60]}{mark}")
    if q.get('exam_source'):
        print(f"  Source: {q['exam_source']}")
