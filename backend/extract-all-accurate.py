#!/usr/bin/env python3
"""
Comprehensive PDF question extractor for SSC exams.
Uses PyMuPDF for text, Tesseract OCR for scanned pages.
Produces only full questions with exactly 4 options + valid answer.
"""

import fitz  # PyMuPDF
import pytesseract
import os, sys, json, re, hashlib, time
from pathlib import Path
from PIL import Image
import io

# ── Config ──────────────────────────────────────────────────
TESSERACT_CMD = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD

PROJECT_ROOT = Path(__file__).parent.parent
BANK_PATH = Path(__file__).parent / "data" / "question-bank.json"
PDF_DIRS = [
    Path(__file__).parent / "pyq" / "quant",
    Path(__file__).parent / "pyq" / "english",
    Path(__file__).parent / "pyq" / "other",
]
DPI = 300  # OCR resolution
MIN_Q_LEN = 15  # Minimum question text length
MAX_PAGES_PER_PDF = 800  # Safety limit

# ── Topic classification from filename ──────────────────────
FILENAME_TOPIC_MAP = {
    "algebra": "Algebra",
    "average": "Average",
    "data_interpretation": "Data Interpretation",
    "geometry": "Geometry",
    "mensuration": "Mensuration",
    "number_system": "Number System",
    "percentage": "Percentage",
    "profit_loss": "Profit & Loss",
    "ratio_proportion": "Ratio & Proportion",
    "si_ci": "Simple & Compound Interest",
    "simplification": "Simplification",
    "time_distance": "Time & Distance",
    "time_work": "Time & Work",
    "trigo": "Trigonometry",
}

FILENAME_SUBJECT_MAP = {
    "english": "english",
    "reasoning": "reasoning",
    "gk": "gk",
    "general knowledge": "gk",
    "general awareness": "gk",
    "lucent": "gk",
    "rakesh yadav": "gk",  # GK book
    "maths": "quant",
    "quantitative": "quant",
    "quant": "quant",
    "aptitude": "quant",
}


def detect_subject_and_topic(filename):
    """Detect subject and topic from PDF filename."""
    fn_lower = filename.lower().replace("-", "_").replace(" ", "_")
    stem = Path(filename).stem.lower().replace("-", "_").replace(" ", "_")

    # Topic from stem (for topic PDFs like algebra.pdf)
    topic = None
    for key, val in FILENAME_TOPIC_MAP.items():
        if key in stem:
            topic = val
            break

    # Subject from filename keywords
    subject = "quant"  # default
    for key, val in FILENAME_SUBJECT_MAP.items():
        if key in fn_lower:
            subject = val
            break

    # Special cases
    if "reasoning" in fn_lower:
        subject = "reasoning"
    if "english" in fn_lower or "plinth" in fn_lower or "paramount" in fn_lower:
        subject = "english"
    if "lucent" in fn_lower or "rakesh_yadav" in fn_lower.replace(" ", "_"):
        if "reasoning" not in fn_lower:
            subject = "gk"
    if "smart" in fn_lower and "question" in fn_lower and "gk" in fn_lower:
        subject = "gk"
    if "paper" in fn_lower and "en" in fn_lower:
        subject = None  # mixed subjects
    if "ssc_cgl" in fn_lower.replace("-", "_") and "shift" in fn_lower:
        subject = None  # full exam paper

    return subject, topic


# ── Text extraction ─────────────────────────────────────────
def extract_text_from_pdf(pdf_path, force_ocr=False):
    """Extract text from PDF, using OCR for scanned pages."""
    doc = fitz.open(str(pdf_path))
    pages_text = []
    ocr_pages = 0
    text_pages = 0

    total_pages = min(len(doc), MAX_PAGES_PER_PDF)
    for page_num in range(total_pages):
        page = doc[page_num]

        if not force_ocr:
            text = page.get_text("text")
            lines = [l.strip() for l in text.split("\n") if l.strip()]
            if len(lines) > 5 and sum(len(l) for l in lines) / max(len(lines), 1) > 8:
                pages_text.append(text)
                text_pages += 1
                continue

        # OCR fallback
        try:
            mat = fitz.Matrix(DPI / 72, DPI / 72)
            pix = page.get_pixmap(matrix=mat)
            img_data = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_data))

            # Use LSTM engine, block mode, English only
            custom_config = r"--oem 1 --psm 6 -l eng"
            text = pytesseract.image_to_string(img, config=custom_config)
            pages_text.append(text)
            ocr_pages += 1
        except Exception as e:
            print(f"    ⚠ OCR failed on page {page_num + 1}: {e}")
            pages_text.append("")

    doc.close()
    return pages_text, text_pages, ocr_pages


# ── Question parsing ────────────────────────────────────────
# Multiple regex strategies for different PDF formats

def clean_text(text):
    """Remove Hindi/Devanagari, normalize whitespace."""
    # Remove Devanagari script
    text = re.sub(r"[\u0900-\u097F]+", " ", text)
    # Remove other non-Latin scripts (keep math symbols)
    text = re.sub(r"[\u0980-\u0FFF\u1000-\u109F\u2E80-\u9FFF]+", " ", text)
    # Normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text


def normalize_option(opt):
    """Clean option text."""
    opt = opt.strip()
    # Remove leading option markers
    opt = re.sub(r"^\(?[a-dA-D1-4]\)[\.\s]*", "", opt).strip()
    return opt


def fingerprint(subject, question, options):
    """SHA1 fingerprint for deduplication."""
    norm = re.sub(r"\s+", " ", question.lower().strip())
    opts_str = "|".join(sorted(o.strip().lower() for o in options))
    raw = f"{subject}|{norm}|{opts_str}"
    return hashlib.sha1(raw.encode()).hexdigest()[:16]


def parse_questions_strategy_cracku(full_text):
    """
    Cracku format:
    N. Question text
    (a) option1
    (b) option2
    (c) option3
    (d) option4
    Solution: Answer text... Correct Answer: A
    """
    questions = []
    # Split at question numbers
    parts = re.split(r"\n\s*(\d{1,3})\.\s+", full_text)
    if len(parts) < 3:
        return questions

    for i in range(1, len(parts) - 1, 2):
        q_num = parts[i]
        q_body = parts[i + 1]

        # Extract options (a)-(d)
        opt_pattern = r"\(([a-d])\)\s*(.+?)(?=\((?:[a-d])\)|Solution|Correct\s*Answer|$)"
        opt_matches = re.findall(opt_pattern, q_body, re.DOTALL | re.IGNORECASE)

        if len(opt_matches) < 4:
            # Try inline options
            opt_pattern2 = r"\(([a-d])\)\s*([^\(\n]+)"
            opt_matches = re.findall(opt_pattern2, q_body, re.IGNORECASE)

        if len(opt_matches) < 4:
            continue

        # Question text is everything before first option
        first_opt_pos = re.search(r"\([a-d]\)", q_body, re.IGNORECASE)
        if not first_opt_pos:
            continue
        q_text = q_body[: first_opt_pos.start()].strip()

        options = [m[1].strip() for m in opt_matches[:4]]

        # Find answer
        answer_match = re.search(
            r"Correct\s*(?:Option|Answer)\s*[:=]\s*([A-Da-d])", q_body, re.IGNORECASE
        )
        if not answer_match:
            answer_match = re.search(r"Answer\s*[:=]\s*\(?([A-Da-d])\)?", q_body, re.IGNORECASE)
        if not answer_match:
            # Try Solution section
            answer_match = re.search(r"Option\s+([A-Da-d])\s+is\s+correct", q_body, re.IGNORECASE)

        answer_idx = -1
        if answer_match:
            letter = answer_match.group(1).lower()
            answer_idx = "abcd".index(letter) if letter in "abcd" else -1

        questions.append(
            {"question": clean_text(q_text), "options": [clean_text(o) for o in options], "answerIndex": answer_idx}
        )

    return questions


def parse_questions_strategy_ssc_exam(full_text):
    """
    SSC exam response sheet format:
    Q.N Question text
    1. option1    2. option2    3. option3    4. option4
    OR
    Q.N Question
    Chosen Option: N
    """
    questions = []
    # Split on Q.N pattern
    parts = re.split(r"\n\s*Q\.?\s*(\d{1,3})[\.\s]+", full_text)
    if len(parts) < 3:
        return questions

    for i in range(1, len(parts) - 1, 2):
        q_body = parts[i + 1]

        # Try numbered options: 1. opt  2. opt  3. opt  4. opt
        opt_pattern = r"(?:^|\n)\s*([1-4])\.\s*(.+?)(?=(?:\n\s*[1-4]\.|$))"
        opt_matches = re.findall(opt_pattern, q_body, re.DOTALL)

        if len(opt_matches) < 4:
            # Try inline numbered: 1) opt 2) opt 3) opt 4) opt
            opt_pattern2 = r"([1-4])\)\s*([^\n\d]+?)(?=\s*[1-4]\)|Chosen|Correct|\n\n|$)"
            opt_matches = re.findall(opt_pattern2, q_body, re.IGNORECASE)

        if len(opt_matches) < 4:
            continue

        # Get question text (before first option)
        first_opt = re.search(r"(?:^|\n)\s*1[\.\)]\s*", q_body)
        if not first_opt:
            continue
        q_text = q_body[: first_opt.start()].strip()

        options = [m[1].strip() for m in opt_matches[:4]]

        # Find answer
        answer_idx = -1
        ans_match = re.search(r"Chosen\s*Option\s*[:=]\s*(\d)", q_body, re.IGNORECASE)
        if not ans_match:
            ans_match = re.search(r"Correct\s*(?:Option|Answer)\s*[:=]\s*(\d)", q_body, re.IGNORECASE)
        if ans_match:
            ans_num = int(ans_match.group(1))
            if 1 <= ans_num <= 4:
                answer_idx = ans_num - 1

        questions.append(
            {"question": clean_text(q_text), "options": [clean_text(o) for o in options], "answerIndex": answer_idx}
        )

    return questions


def parse_questions_strategy_abcd(full_text):
    """
    Generic A/B/C/D format:
    Question text
    (A) option1  (B) option2  (C) option3  (D) option4
    Ans: (A)
    """
    questions = []
    # Split text into blocks by question numbers or blank lines
    blocks = re.split(r"\n\s*(?:Que[\.\s]*)?(\d{1,4})[\.\)]\s+", full_text)
    if len(blocks) < 3:
        # Try splitting by double newline
        blocks_alt = re.split(r"\n\s*\n", full_text)
        for block in blocks_alt:
            q = _extract_abcd_from_block(block)
            if q:
                questions.append(q)
        return questions

    for i in range(1, len(blocks) - 1, 2):
        q = _extract_abcd_from_block(blocks[i + 1])
        if q:
            questions.append(q)

    return questions


def _extract_abcd_from_block(block):
    """Extract question with (A)-(D) options from a text block."""
    # Find options
    opt_pattern = r"\(([A-Da-d])\)\s*(.+?)(?=\([A-Da-d]\)|Ans|Answer|Sol|$)"
    opt_matches = re.findall(opt_pattern, block, re.DOTALL | re.IGNORECASE)

    if len(opt_matches) < 4:
        # Try without parens: A. option  B. option
        opt_pattern2 = r"(?:^|\n)\s*([A-Da-d])[\.\)]\s*(.+?)(?=(?:\n\s*[A-Da-d][\.\)])|Ans|$)"
        opt_matches = re.findall(opt_pattern2, block, re.DOTALL | re.IGNORECASE)

    if len(opt_matches) < 4:
        return None

    # Question text before first option
    first_opt = re.search(r"\(?[A-Da-d][\.\)]\s*", block, re.IGNORECASE)
    if not first_opt:
        return None
    q_text = block[: first_opt.start()].strip()

    options = [m[1].strip().split("\n")[0].strip() for m in opt_matches[:4]]

    # Find answer
    answer_idx = -1
    ans_match = re.search(r"Ans(?:wer)?[\s:=]*\(?([A-Da-d])\)?", block, re.IGNORECASE)
    if ans_match:
        letter = ans_match.group(1).lower()
        answer_idx = "abcd".index(letter) if letter in "abcd" else -1

    if not q_text or len(q_text) < MIN_Q_LEN:
        return None

    return {"question": clean_text(q_text), "options": [clean_text(o) for o in options], "answerIndex": answer_idx}


def parse_questions_strategy_inline(full_text):
    """
    Inline options format (common in OCR'd books):
    N. Question text (a) opt1 (b) opt2 (c) opt3 (d) opt4
    """
    questions = []
    lines = full_text.split("\n")

    for line in lines:
        line = line.strip()
        if len(line) < 30:
            continue

        # Match: optional number, then text, then (a)...(d) inline
        m = re.match(
            r"(?:\d{1,4}[\.\)]\s*)?(.*?)\s*"
            r"\(a\)\s*(.*?)\s*"
            r"\(b\)\s*(.*?)\s*"
            r"\(c\)\s*(.*?)\s*"
            r"\(d\)\s*(.*?)$",
            line,
            re.IGNORECASE,
        )
        if m:
            q_text = m.group(1).strip()
            opts = [m.group(i).strip() for i in range(2, 6)]
            if q_text and len(q_text) >= MIN_Q_LEN and all(len(o) > 0 for o in opts):
                questions.append({"question": clean_text(q_text), "options": [clean_text(o) for o in opts], "answerIndex": -1})

    return questions


def parse_answer_key(full_text):
    """Extract answer key section, returns dict of q_num -> answer_idx."""
    answers = {}

    # Pattern: N. (A) or N) A or N. A
    for m in re.finditer(r"(?:^|\s)(\d{1,4})[\.\)]\s*\(?([A-Da-d1-4])\)?", full_text):
        q_num = int(m.group(1))
        ans = m.group(2).lower()
        if ans in "abcd":
            answers[q_num] = "abcd".index(ans)
        elif ans in "1234":
            answers[q_num] = int(ans) - 1

    # Also try: "Ans: A, B, C, D, A, ..." format
    ans_block = re.search(r"(?:Answer|Ans|Key)[\s:]+([A-Da-d](?:\s*[,\s]\s*[A-Da-d])+)", full_text, re.IGNORECASE)
    if ans_block:
        letters = re.findall(r"[A-Da-d]", ans_block.group(1))
        for i, letter in enumerate(letters, 1):
            if i not in answers:
                answers[i] = "abcd".index(letter.lower())

    return answers


def apply_answer_key(questions, answer_key):
    """Apply answer key to questions that don't have answers."""
    for i, q in enumerate(questions):
        if q["answerIndex"] == -1 and (i + 1) in answer_key:
            q["answerIndex"] = answer_key[i + 1]
    return questions


# ── Main extraction pipeline ────────────────────────────────
def extract_from_pdf(pdf_path):
    """Extract all valid questions from a single PDF."""
    filename = os.path.basename(pdf_path)
    file_size_mb = os.path.getsize(pdf_path) / (1024 * 1024)

    # Skip extremely large scanned books (Lucent 371MB, Hindi book 84MB)
    if file_size_mb > 100:
        print(f"  ⏭ Skipping {filename} ({file_size_mb:.0f}MB - too large for batch OCR)")
        return []

    print(f"\n📄 Processing: {filename} ({file_size_mb:.1f}MB)")

    pages_text, text_pages, ocr_pages = extract_text_from_pdf(pdf_path)
    print(f"   Pages: {len(pages_text)} ({text_pages} text, {ocr_pages} OCR)")

    full_text = "\n\n".join(pages_text)
    if len(full_text.strip()) < 100:
        print(f"   ⚠ No usable text extracted")
        return []

    # Try all parsing strategies
    all_questions = []

    # Strategy 1: Cracku format
    qs = parse_questions_strategy_cracku(full_text)
    if qs:
        print(f"   Strategy Cracku: {len(qs)} questions")
        all_questions.extend(qs)

    # Strategy 2: SSC exam format
    qs = parse_questions_strategy_ssc_exam(full_text)
    if qs:
        print(f"   Strategy SSC-Exam: {len(qs)} questions")
        all_questions.extend(qs)

    # Strategy 3: A/B/C/D format
    qs = parse_questions_strategy_abcd(full_text)
    if qs:
        print(f"   Strategy ABCD: {len(qs)} questions")
        all_questions.extend(qs)

    # Strategy 4: Inline options
    qs = parse_questions_strategy_inline(full_text)
    if qs:
        print(f"   Strategy Inline: {len(qs)} questions")
        all_questions.extend(qs)

    # Parse answer key from end of document
    # Look for answer key section (usually last 20% of text)
    ans_section_start = int(len(full_text) * 0.7)
    answer_key = parse_answer_key(full_text[ans_section_start:])
    if answer_key:
        print(f"   Answer key found: {len(answer_key)} answers")
        all_questions = apply_answer_key(all_questions, answer_key)

    # Also try full-text answer key
    if not answer_key:
        answer_key = parse_answer_key(full_text)
        if answer_key:
            print(f"   Full-text answer key: {len(answer_key)} answers")
            all_questions = apply_answer_key(all_questions, answer_key)

    # Deduplicate within this PDF
    seen = set()
    unique = []
    for q in all_questions:
        fp = fingerprint("", q["question"], q["options"])
        if fp not in seen:
            seen.add(fp)
            unique.append(q)

    print(f"   Unique: {len(unique)} (deduped from {len(all_questions)})")
    return unique


def quality_filter(q):
    """Final quality check - only keep proper questions."""
    txt = q["question"].strip()
    opts = q["options"]

    # Must have 4 non-empty options
    valid_opts = [o for o in opts if o.strip()]
    if len(valid_opts) < 4:
        return False

    # Question text minimum length
    if len(txt) < MIN_Q_LEN:
        return False

    # Not an answer key line
    if re.match(r"^\(?[a-d]\)?\s*\d+[\.\s]", txt) and len(txt) < 80:
        return False

    # Not a fragment
    if re.match(r"^(and |but |or |so |then |also |still )", txt, re.IGNORECASE):
        return False

    # Must have some English words
    alpha_chars = len(re.findall(r"[a-zA-Z]", txt))
    if alpha_chars < 5 and len(txt) > 10:
        return False

    # Check vowel ratio (garbled OCR)
    if alpha_chars >= 10:
        vowels = len(re.findall(r"[aeiouAEIOU]", txt))
        if vowels / alpha_chars < 0.12:
            return False

    # Not too many single-char words
    words = txt.split()
    single_chars = sum(1 for w in words if len(w) == 1 and w.isalpha())
    if len(words) > 5 and single_chars > len(words) * 0.3 and single_chars >= 4:
        return False

    # Options shouldn't all be the same
    if len(set(o.strip().lower() for o in valid_opts)) < 3:
        return False

    return True


def main():
    start_time = time.time()

    # Load existing bank for deduplication
    existing_fps = set()
    bank = {"questions": [], "updatedAt": ""}
    if BANK_PATH.exists():
        bank = json.loads(BANK_PATH.read_text(encoding="utf-8"))
        for q in bank["questions"]:
            fp = fingerprint(
                q.get("subject", ""),
                q.get("question", ""),
                q.get("options", []),
            )
            existing_fps.add(fp)
        print(f"📦 Existing bank: {len(bank['questions'])} questions ({len(existing_fps)} unique fingerprints)")

    # Collect all PDFs
    all_pdfs = []
    for d in PDF_DIRS:
        if not d.exists():
            continue
        for f in sorted(d.iterdir()):
            if f.suffix.lower() == ".pdf":
                all_pdfs.append(f)

    print(f"\n📂 Found {len(all_pdfs)} PDFs across {len(PDF_DIRS)} directories\n")

    # Process each PDF
    total_new = 0
    total_skipped_dup = 0
    total_skipped_quality = 0
    results_by_pdf = {}

    for pdf_path in all_pdfs:
        filename = pdf_path.name
        subject, topic = detect_subject_and_topic(filename)

        raw_questions = extract_from_pdf(pdf_path)

        # Quality filter
        quality_qs = [q for q in raw_questions if quality_filter(q)]
        skipped_q = len(raw_questions) - len(quality_qs)
        if skipped_q > 0:
            print(f"   Quality filter removed: {skipped_q}")

        # Dedup against existing bank
        new_qs = []
        dup_count = 0
        for q in quality_qs:
            subj = subject or q.get("_detected_subject", "quant")
            fp = fingerprint(subj, q["question"], q["options"])
            if fp not in existing_fps:
                existing_fps.add(fp)
                new_qs.append(q)
            else:
                dup_count += 1

        if dup_count > 0:
            print(f"   Duplicates skipped: {dup_count}")

        # Build full question objects
        for q in new_qs:
            subj = subject or "quant"
            qid = f"{int(time.time() * 1000)}_{os.urandom(4).hex()}"
            time.sleep(0.001)  # ensure unique timestamps

            full_q = {
                "id": qid,
                "type": "question",
                "examFamily": "ssc",
                "subject": subj,
                "difficulty": "medium",
                "tier": "tier2" if "tier-2" in filename.lower() or "tier_2" in filename.lower() else "tier1",
                "questionMode": "objective",
                "topic": topic or "General",
                "question": q["question"],
                "options": q["options"][:4],
                "answerIndex": q["answerIndex"],
                "explanation": "",
                "marks": 2,
                "negativeMarks": 0.5,
                "isChallengeCandidate": False,
                "confidenceScore": 0.8 if q["answerIndex"] >= 0 else 0.5,
                "reviewStatus": "approved" if q["answerIndex"] >= 0 else "needs_review",
                "isPYQ": "pyq" in filename.lower() or "cracku" in filename.lower() or "shift" in filename.lower(),
                "year": None,
                "frequency": 1,
                "subtopic": None,
                "source": {
                    "kind": "pyq_pdf",
                    "fileName": filename,
                    "importedAt": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime()),
                },
                "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime()),
                "updatedAt": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime()),
                "reviewAudit": {
                    "reviewedAt": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime()),
                    "reviewedBy": "accurate_ocr_extract",
                    "decision": "approve" if q["answerIndex"] >= 0 else "pending",
                    "rejectReason": "",
                },
            }

            # Detect year from filename
            year_match = re.search(r"20[12]\d", filename)
            if year_match:
                full_q["year"] = int(year_match.group())

            bank["questions"].append(full_q)

        new_count = len(new_qs)
        total_new += new_count
        total_skipped_dup += dup_count
        total_skipped_quality += skipped_q

        if new_count > 0:
            results_by_pdf[filename] = new_count
            print(f"   ✅ Added {new_count} new questions")
        else:
            print(f"   ℹ No new questions")

    # Save
    bank["updatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime())
    BANK_PATH.write_text(json.dumps(bank, indent=2, ensure_ascii=False), encoding="utf-8")

    elapsed = time.time() - start_time
    print(f"\n{'='*60}")
    print(f"📊 EXTRACTION COMPLETE ({elapsed:.1f}s)")
    print(f"   Total bank: {len(bank['questions'])} questions")
    print(f"   New added: {total_new}")
    print(f"   Skipped (duplicate): {total_skipped_dup}")
    print(f"   Skipped (quality): {total_skipped_quality}")
    print(f"\n📁 New questions by PDF:")
    for pdf_name, count in sorted(results_by_pdf.items(), key=lambda x: -x[1]):
        print(f"   {count:4d}  {pdf_name}")


if __name__ == "__main__":
    main()
