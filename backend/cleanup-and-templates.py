#!/usr/bin/env python3
"""
1. Find and delete questions with garbage/junk Unicode symbols
2. Generate mock test templates from 100% accurate questions
"""
import json
import re
import time
import random
import string

QUESTION_BANK = 'backend/data/question-bank.json'

# ========== PHASE 1: GARBAGE DETECTION & REMOVAL ==========

# Garbage Unicode ranges
GARBAGE_RE = re.compile(
    '['
    '\ufffd'                    # replacement character
    '\u200b-\u200f'             # zero-width chars
    '\u2028-\u2029'             # line/paragraph separator  
    '\ufeff'                    # BOM
    '\U0001d400-\U0001d7ff'     # math alphanumeric (garbled from docx)
    ']'
)

# Legitimate non-ASCII chars we want to KEEP
LEGIT_CHARS = set(
    '°₹²³¹⁴⁵⁶⁷⁸⁹⁰√±×÷≤≥≠≈∞πθαβγδ∠△→←↑↓·—–\u2018\u2019\u201c\u201d…½¼¾⅓⅔£€¥'
    'āīūṛṝḷṃḥśṣṭḍṇñṅ'  # transliteration chars
    'àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ'  # Latin accented
)

def has_garbage(text):
    """Check if text contains garbage symbols."""
    if not text:
        return False, []
    
    reasons = []
    
    # Check for known garbage Unicode
    if GARBAGE_RE.search(text):
        found = GARBAGE_RE.findall(text)
        reasons.append(f"garbage_unicode({len(found)} chars)")
    
    # Check for high ratio of ? that suggests OCR/encoding failure
    # e.g., "If ? + 1 = 5, then ?3 + 1" where ? replaced actual symbols
    
    return len(reasons) > 0, reasons


def check_question_quality(q):
    """Check if a question has garbage in question text or options."""
    text = q.get('question', '')
    options = q.get('options', [])
    all_text = text + ' ' + ' '.join(options)
    
    is_garbage, reasons = has_garbage(all_text)
    
    # Also check for empty/near-empty question text
    if len(text.strip()) < 10:
        is_garbage = True
        reasons.append("question_too_short")
    
    # Check for questions where all options are empty
    non_empty_opts = [o for o in options if o and o.strip()]
    if len(non_empty_opts) < 2:
        is_garbage = True
        reasons.append(f"only_{len(non_empty_opts)}_options")
    
    # Check for duplicate options
    opt_set = set(o.strip().lower() for o in options if o.strip())
    if len(opt_set) < len(non_empty_opts):
        is_garbage = True
        reasons.append("duplicate_options")
    
    return is_garbage, reasons


# ========== PHASE 2: TEMPLATE GENERATION ==========

def gen_id():
    ts = int(time.time() * 1000)
    suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=7))
    return f"{ts}_{suffix}"


def make_templates(questions):
    """Generate mock test templates from clean, accurate questions."""
    
    # Group by subject and tier
    by_subject = {}
    for q in questions:
        subj = q.get('subject', 'unknown')
        tier = q.get('tier', 'unknown')
        key = (subj, tier)
        if key not in by_subject:
            by_subject[key] = []
        by_subject[key].append(q)
    
    print("\nAvailable question pools:")
    for (subj, tier), qs in sorted(by_subject.items()):
        approved = sum(1 for q in qs if q.get('reviewStatus') == 'approved')
        has4opts = sum(1 for q in qs if len([o for o in q.get('options',[]) if o.strip()]) == 4)
        print(f"  {subj} ({tier}): {len(qs)} total, {approved} approved, {has4opts} with 4 options")
    
    # Filter to only high-quality questions: approved, 4 non-empty options, confidence >= 0.7
    def is_template_ready(q):
        if q.get('reviewStatus') != 'approved':
            return False
        opts = q.get('options', [])
        non_empty = [o for o in opts if o and o.strip()]
        if len(non_empty) < 4:
            return False
        if q.get('confidenceScore', 0) < 0.7:
            return False
        # Answer index must be valid
        ai = q.get('answerIndex', -1)
        if ai < 0 or ai >= len(opts):
            return False
        return True
    
    ready = {}
    for (subj, tier), qs in by_subject.items():
        pool = [q for q in qs if is_template_ready(q)]
        if pool:
            ready[(subj, tier)] = pool
    
    print("\nTemplate-ready pools:")
    for (subj, tier), pool in sorted(ready.items()):
        print(f"  {subj} ({tier}): {len(pool)} questions")
    
    templates = []
    
    # --- TIER 1 TEMPLATES ---
    # SSC CGL Tier 1: 100 questions (25 each: quant, english, reasoning, gk)
    t1_quant = ready.get(('quant', 'tier1'), [])
    t1_english = ready.get(('english', 'tier1'), [])
    t1_reasoning = ready.get(('reasoning', 'tier1'), [])
    t1_gk = ready.get(('gk', 'tier1'), [])
    
    # How many full Tier 1 tests can we make?
    t1_capacity = min(
        len(t1_quant) // 25 if t1_quant else 0,
        len(t1_english) // 25 if t1_english else 0,
        len(t1_reasoning) // 25 if t1_reasoning else 0,
        len(t1_gk) // 25 if t1_gk else 0,
    )
    
    print(f"\nTier 1 full test capacity: {t1_capacity} tests")
    print(f"  quant: {len(t1_quant)} (need 25/test)")
    print(f"  english: {len(t1_english)} (need 25/test)")
    print(f"  reasoning: {len(t1_reasoning)} (need 25/test)")
    print(f"  gk: {len(t1_gk)} (need 25/test)")
    
    # Shuffle pools
    random.seed(42)  # reproducible
    random.shuffle(t1_quant)
    random.shuffle(t1_english)
    random.shuffle(t1_reasoning)
    random.shuffle(t1_gk)
    
    for i in range(t1_capacity):
        template = {
            "id": gen_id(),
            "name": f"SSC CGL Tier 1 - Mock Test {i+1}",
            "examFamily": "ssc",
            "examType": "CGL",
            "tier": "tier1",
            "duration": 60,  # 60 minutes
            "totalMarks": 200,
            "sections": [
                {
                    "name": "General Intelligence & Reasoning",
                    "subject": "reasoning",
                    "questionCount": 25,
                    "marksPerQuestion": 2,
                    "negativeMarks": 0.5,
                    "questionIds": [q['id'] for q in t1_reasoning[i*25:(i+1)*25]]
                },
                {
                    "name": "General Awareness",
                    "subject": "gk",
                    "questionCount": 25,
                    "marksPerQuestion": 2,
                    "negativeMarks": 0.5,
                    "questionIds": [q['id'] for q in t1_gk[i*25:(i+1)*25]]
                },
                {
                    "name": "Quantitative Aptitude",
                    "subject": "quant",
                    "questionCount": 25,
                    "marksPerQuestion": 2,
                    "negativeMarks": 0.5,
                    "questionIds": [q['id'] for q in t1_quant[i*25:(i+1)*25]]
                },
                {
                    "name": "English Comprehension",
                    "subject": "english",
                    "questionCount": 25,
                    "marksPerQuestion": 2,
                    "negativeMarks": 0.5,
                    "questionIds": [q['id'] for q in t1_english[i*25:(i+1)*25]]
                }
            ],
            "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
            "source": "auto_generated"
        }
        templates.append(template)
    
    # --- TIER 2 TEMPLATES ---
    # SSC CGL Tier 2 Paper 1: Session-I (Maths 30 + Reasoning 30 + English 45 + GK 25 = 130 Qs, 390 marks)
    # Session-II (Quant 30 + English 45 + GK 25 = 100 Qs)
    # Simplified: We'll make subject-wise practice sets from Tier 2 pool
    
    t2_quant = ready.get(('quant', 'tier2'), [])
    t2_english = ready.get(('english', 'tier2'), [])
    t2_reasoning = ready.get(('reasoning', 'tier2'), [])
    t2_gk = ready.get(('gk', 'tier2'), [])
    
    random.shuffle(t2_quant)
    random.shuffle(t2_english)
    random.shuffle(t2_reasoning)
    random.shuffle(t2_gk)
    
    print(f"\nTier 2 pools:")
    print(f"  quant: {len(t2_quant)}")
    print(f"  english: {len(t2_english)}")
    print(f"  reasoning: {len(t2_reasoning)}")
    print(f"  gk: {len(t2_gk)}")
    
    # Tier 2 Maths practice sets (30 questions each)
    t2_math_sets = len(t2_quant) // 30
    for i in range(t2_math_sets):
        template = {
            "id": gen_id(),
            "name": f"SSC CGL Tier 2 - Maths Practice Set {i+1}",
            "examFamily": "ssc",
            "examType": "CGL",
            "tier": "tier2",
            "duration": 30,
            "totalMarks": 90,
            "sections": [{
                "name": "Mathematical Abilities",
                "subject": "quant",
                "questionCount": 30,
                "marksPerQuestion": 3,
                "negativeMarks": 1,
                "questionIds": [q['id'] for q in t2_quant[i*30:(i+1)*30]]
            }],
            "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
            "source": "auto_generated"
        }
        templates.append(template)
    
    # Tier 2 English practice sets (45 questions each)
    t2_eng_sets = len(t2_english) // 45
    for i in range(t2_eng_sets):
        template = {
            "id": gen_id(),
            "name": f"SSC CGL Tier 2 - English Practice Set {i+1}",
            "examFamily": "ssc",
            "examType": "CGL",
            "tier": "tier2",
            "duration": 30,
            "totalMarks": 135,
            "sections": [{
                "name": "English Language & Comprehension",
                "subject": "english",
                "questionCount": 45,
                "marksPerQuestion": 3,
                "negativeMarks": 1,
                "questionIds": [q['id'] for q in t2_english[i*45:(i+1)*45]]
            }],
            "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
            "source": "auto_generated"
        }
        templates.append(template)
    
    # Tier 2 full mock (if we have enough: 30 quant + 30 reasoning + 45 english + 25 gk = 130)
    t2_full_capacity = min(
        len(t2_quant) // 30 if t2_quant else 0,
        len(t2_english) // 45 if t2_english else 0,
        # reasoning and gk may be 0 for tier2 - make partial mocks without them
    )
    
    # Make Tier 2 Session-I style mocks (Quant + English)
    t2_combined = min(len(t2_quant) // 30, len(t2_english) // 45)
    # Use questions AFTER the ones used for practice sets to avoid overlap
    q_offset = t2_math_sets * 30
    e_offset = t2_eng_sets * 45
    remaining_q = t2_quant[q_offset:]
    remaining_e = t2_english[e_offset:]
    
    t2_combo = min(len(remaining_q) // 30, len(remaining_e) // 45)
    for i in range(t2_combo):
        template = {
            "id": gen_id(),
            "name": f"SSC CGL Tier 2 - Combined Mock {i+1} (Maths + English)",
            "examFamily": "ssc",
            "examType": "CGL",
            "tier": "tier2",
            "duration": 60,
            "totalMarks": 225,
            "sections": [
                {
                    "name": "Mathematical Abilities",
                    "subject": "quant",
                    "questionCount": 30,
                    "marksPerQuestion": 3,
                    "negativeMarks": 1,
                    "questionIds": [q['id'] for q in remaining_q[i*30:(i+1)*30]]
                },
                {
                    "name": "English Language & Comprehension",
                    "subject": "english",
                    "questionCount": 45,
                    "marksPerQuestion": 3,
                    "negativeMarks": 1,
                    "questionIds": [q['id'] for q in remaining_e[i*45:(i+1)*45]]
                }
            ],
            "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
            "source": "auto_generated"
        }
        templates.append(template)
    
    # Subject-wise topic practice sets (10 questions each by topic)
    for (subj, tier), pool in sorted(ready.items()):
        by_topic = {}
        for q in pool:
            topic = q.get('topic', 'General')
            if topic not in by_topic:
                by_topic[topic] = []
            by_topic[topic].append(q)
        
        for topic, topic_qs in sorted(by_topic.items()):
            if len(topic_qs) >= 10:
                random.shuffle(topic_qs)
                sets_count = len(topic_qs) // 10
                for s in range(min(sets_count, 3)):  # max 3 sets per topic
                    template = {
                        "id": gen_id(),
                        "name": f"{topic} Practice ({tier.replace('tier','Tier ')}) - Set {s+1}",
                        "examFamily": "ssc",
                        "examType": "CGL",
                        "tier": tier,
                        "duration": 15,
                        "totalMarks": 20 if tier == 'tier1' else 30,
                        "sections": [{
                            "name": topic,
                            "subject": subj,
                            "questionCount": 10,
                            "marksPerQuestion": 2 if tier == 'tier1' else 3,
                            "negativeMarks": 0.5 if tier == 'tier1' else 1,
                            "questionIds": [q['id'] for q in topic_qs[s*10:(s+1)*10]]
                        }],
                        "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                        "source": "auto_generated"
                    }
                    templates.append(template)
    
    return templates


# ========== MAIN ==========
if __name__ == '__main__':
    with open(QUESTION_BANK, 'r', encoding='utf-8') as f:
        bank = json.load(f)
    
    total = len(bank['questions'])
    print(f"Total questions: {total}")
    
    # Phase 1: Find and remove garbage
    print("\n" + "="*60)
    print("PHASE 1: GARBAGE DETECTION")
    print("="*60)
    
    clean = []
    garbage = []
    for q in bank['questions']:
        is_bad, reasons = check_question_quality(q)
        if is_bad:
            garbage.append((q, reasons))
        else:
            clean.append(q)
    
    print(f"\nGarbage questions: {len(garbage)}")
    for i, (q, reasons) in enumerate(garbage[:20]):
        print(f"  {i+1}. [{q['subject']}] {reasons}")
        print(f"     Q: {q['question'][:80]}")
        opts = q.get('options', [])
        empty = sum(1 for o in opts if not o or not o.strip())
        if empty:
            print(f"     ({empty} empty options)")
    if len(garbage) > 20:
        print(f"  ... and {len(garbage)-20} more")
    
    # Remove garbage
    bank['questions'] = clean
    bank['updatedAt'] = time.strftime("%Y-%m-%dT%H:%M:%S.000000+00:00")
    
    with open(QUESTION_BANK, 'w', encoding='utf-8') as f:
        json.dump(bank, f, ensure_ascii=False, indent=2)
    
    print(f"\nRemoved {len(garbage)} garbage questions")
    print(f"Clean questions remaining: {len(clean)}")
    
    # Phase 2: Generate templates
    print("\n" + "="*60)
    print("PHASE 2: TEMPLATE GENERATION")
    print("="*60)
    
    templates = make_templates(clean)
    
    # Categorize templates
    full_mocks = [t for t in templates if 'Mock Test' in t['name'] or 'Combined Mock' in t['name']]
    practice_sets = [t for t in templates if 'Practice Set' in t['name']]
    topic_sets = [t for t in templates if 'Practice (' in t['name']]
    
    print(f"\n{'='*60}")
    print(f"TEMPLATES GENERATED")
    print(f"{'='*60}")
    print(f"Full Mock Tests: {len(full_mocks)}")
    for t in full_mocks:
        total_q = sum(s['questionCount'] for s in t['sections'])
        print(f"  - {t['name']} ({total_q} Qs, {t['totalMarks']} marks, {t['duration']} min)")
    
    print(f"\nSubject Practice Sets: {len(practice_sets)}")
    for t in practice_sets:
        total_q = sum(s['questionCount'] for s in t['sections'])
        print(f"  - {t['name']} ({total_q} Qs)")
    
    print(f"\nTopic-wise Practice: {len(topic_sets)}")
    for t in topic_sets:
        print(f"  - {t['name']} (10 Qs)")
    
    print(f"\nTotal templates: {len(templates)}")
    
    # Save templates
    output = {
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
        "totalTemplates": len(templates),
        "templates": templates
    }
    
    with open('backend/data/test-templates.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"\nSaved to backend/data/test-templates.json")
    
    # Final summary
    print(f"\n{'='*60}")
    print(f"FINAL SUMMARY")
    print(f"{'='*60}")
    subjects = {}
    for q in clean:
        s = q.get('subject', 'unknown')
        subjects[s] = subjects.get(s, 0) + 1
    print(f"Question bank: {len(clean)} clean questions")
    for s, c in sorted(subjects.items()):
        print(f"  {s}: {c}")
    print(f"Templates: {len(templates)} test papers ready")
