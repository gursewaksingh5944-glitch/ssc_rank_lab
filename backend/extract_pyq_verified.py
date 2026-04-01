#!/usr/bin/env python3
import argparse
import io
import json
import re
from collections import Counter
from datetime import UTC, datetime
from pathlib import Path

import fitz  # pymupdf
import pytesseract
from PIL import Image

Image.MAX_IMAGE_PIXELS = None

QUESTION_RE = re.compile(r"^\s*(?:Q\.?\s*No\.?\s*)?(\d{1,4})\s*[\)\].:\-]?\s*(.+)?$", re.IGNORECASE)
OPTION_RE = re.compile(r"^\s*[\[(]?([A-Da-d])[\])\.:\-]?\s+(.+)$")
ANSWER_INLINE_RE = re.compile(
    r"(?:ans(?:wer)?|correct\s*(?:option|answer)|right\s*answer)\s*[:\-]?\s*([A-Da-d])\b",
    re.IGNORECASE,
)
ANSWER_KEY_PAIR_RE = re.compile(r"\b(\d{1,4})\s*[\).:\-]?\s*([A-Da-d])\b")

QUANT_TOPICS = {
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

BOILERPLATE_PATTERNS = [
    "roll no",
    "candidate name",
    "click here",
    "undertaking by the candidate",
    "saved question paper",
    "personal use and self-analysis",
    "commercial or any other purposes",
    "sscexam.",
    "test time and shift",
    "exam level",
    "centre name",
    "part-a",
    "part-b",
    "part-c",
    "part-d",
    "correct option selected",
    "wrong option selected",
    "not answered",
]


def normalize_line(line: str) -> str:
    line = line.replace("\u00ad", "")
    line = line.replace("\u200b", "")
    line = re.sub(r"\s+", " ", line)
    return line.strip()


def looks_sparse(text: str) -> bool:
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    if not lines:
        return True
    avg_len = sum(len(ln) for ln in lines) / len(lines)
    return len(lines) < 80 or avg_len < 14


def extract_text_from_pdf(pdf_path: Path, lang: str) -> str:
    text_chunks = []
    with fitz.open(pdf_path) as doc:
        for page in doc:
            native = (page.get_text("text") or "").strip()
            if native and not looks_sparse(native):
                text_chunks.append(native)
                continue

            pix = page.get_pixmap(dpi=300)
            image = Image.open(io.BytesIO(pix.tobytes("png")))
            ocr_text = pytesseract.image_to_string(
                image,
                lang=lang,
                config="--oem 1 --psm 6",
            )
            text_chunks.append((native + "\n" + ocr_text).strip())

    return "\n".join(text_chunks)


def detect_topic(pdf_path: Path) -> str:
    stem = pdf_path.stem.lower()
    if pdf_path.parent.name.lower() == "quant":
        return QUANT_TOPICS.get(stem, stem.replace("_", " ").title())
    return "Full Exam PDFs"


def is_boilerplate(text: str) -> bool:
    low = text.lower()
    return any(token in low for token in BOILERPLATE_PATTERNS)


def clean_question_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip(" -:|.,")


def clean_option_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip(" -:|.,")


def is_valid_question_text(text: str) -> bool:
    if not text:
        return False
    if len(text) < 12 or len(text) > 400:
        return False
    if is_boilerplate(text):
        return False
    if text.lower().startswith("http") or "www." in text.lower():
        return False
    if text.count("Q.No") > 1:
        return False
    if sum(ch.isalpha() for ch in text) < 8:
        return False
    return True


def is_valid_option_text(text: str) -> bool:
    if not text:
        return False
    if len(text) < 1 or len(text) > 160:
        return False
    if is_boilerplate(text):
        return False
    if text.lower().startswith("http") or "www." in text.lower():
        return False
    if sum(ch.isalpha() for ch in text) < 1:
        return False
    return True


def parse_answer_key(lines: list[str]) -> dict[int, str]:
    answer_map: dict[int, str] = {}
    in_answer_zone = False
    for line in lines:
        low = line.lower()
        if "answer key" in low or "correct option" in low or "answers" in low:
            in_answer_zone = True

        if in_answer_zone:
            for match in ANSWER_KEY_PAIR_RE.finditer(line):
                qnum = int(match.group(1))
                letter = match.group(2).upper()
                answer_map[qnum] = letter

    return answer_map


def make_record(source_file: str, topic: str, current: dict):
    options = [clean_option_text(opt) for opt in current["options"]]
    question = clean_question_text(current["question"])
    answer_option = (current["answer_option"] or "").upper()

    if len(options) != 4:
        return None
    if any(not is_valid_option_text(opt) for opt in options):
        return None
    if answer_option not in {"A", "B", "C", "D"}:
        return None
    if not is_valid_question_text(question):
        return None
    if len(set(opt.lower() for opt in options)) < 4:
        return None

    return {
        "source_pdf": source_file,
        "topic": topic,
        "question_number": current["question_number"],
        "question": question,
        "options": options,
        "answer_option": answer_option,
    }


def parse_questions(text: str, source_file: str, topic: str) -> list[dict]:
    lines = [normalize_line(line) for line in text.splitlines()]
    lines = [line for line in lines if line]

    answer_key_map = parse_answer_key(lines)
    results: list[dict] = []
    seen = set()
    current = None

    def flush_current():
        nonlocal current
        if not current:
            return

        qnum = current["question_number"]
        if not current["answer_option"] and qnum in answer_key_map:
            current["answer_option"] = answer_key_map[qnum]

        record = make_record(source_file, topic, current)
        if record:
            dedupe_key = (
                record["question_number"],
                record["question"].lower(),
                tuple(opt.lower() for opt in record["options"]),
            )
            if dedupe_key not in seen:
                seen.add(dedupe_key)
                results.append(record)

        current = None

    for line in lines:
        q_match = QUESTION_RE.match(line)
        o_match = OPTION_RE.match(line)
        a_match = ANSWER_INLINE_RE.search(line)

        if q_match:
            qnum = int(q_match.group(1))
            qtxt = (q_match.group(2) or "").strip()
            if qtxt and is_boilerplate(qtxt):
                continue

            if current and qnum != current["question_number"]:
                flush_current()

            if not current:
                current = {
                    "question_number": qnum,
                    "question": qtxt,
                    "options": ["", "", "", ""],
                    "answer_option": "",
                }
            elif qtxt and len(current["question"]) < len(qtxt):
                current["question"] = qtxt
            continue

        if current and o_match:
            letter = o_match.group(1).upper()
            option_text = o_match.group(2).strip()
            idx = "ABCD".find(letter)
            if idx >= 0:
                current["options"][idx] = option_text
            continue

        if current and a_match:
            current["answer_option"] = a_match.group(1).upper()
            continue

        if current and not any(current["options"]):
            if len(line) > 2 and not line.lower().startswith("-- ") and not is_boilerplate(line):
                current["question"] = (current["question"] + " " + line).strip()

    flush_current()
    return results


def collect_pdf_paths(pyq_root: Path) -> list[Path]:
    return sorted(pyq_root.rglob("*.pdf"))


def write_per_pdf_output(base_dir: Path, pdf_path: Path, rows: list[dict]) -> None:
    out_dir = base_dir / pdf_path.parent.name
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{pdf_path.stem}.json"
    payload = {
        "source_pdf": pdf_path.name,
        "topic": detect_topic(pdf_path),
        "total_questions": len(rows),
        "questions": rows,
    }
    out_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Extract verified PYQ Q/A-option data with OCR fallback")
    parser.add_argument("--pyq-dir", default="backend/pyq", help="Folder containing PDF files")
    parser.add_argument(
        "--output",
        default="backend/data/pyq_verified_summary.json",
        help="Output summary JSON path",
    )
    parser.add_argument(
        "--per-pdf-dir",
        default="backend/data/pyq_verified",
        help="Directory for one JSON output per PDF",
    )
    parser.add_argument(
        "--tesseract-cmd",
        default=r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        help="Path to tesseract executable",
    )
    parser.add_argument("--lang", default="eng", help="OCR language code")
    args = parser.parse_args()

    pytesseract.pytesseract.tesseract_cmd = args.tesseract_cmd

    pyq_dir = Path(args.pyq_dir)
    output_path = Path(args.output)
    per_pdf_dir = Path(args.per_pdf_dir)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    per_pdf_dir.mkdir(parents=True, exist_ok=True)

    pdf_files = collect_pdf_paths(pyq_dir)
    all_rows = []
    topic_counter: Counter[str] = Counter()
    pdf_counts = {}

    print(f"Found {len(pdf_files)} PDFs under {pyq_dir}")
    for idx, pdf_path in enumerate(pdf_files, start=1):
        print(f"[{idx}/{len(pdf_files)}] {pdf_path.name}")
        try:
            topic = detect_topic(pdf_path)
            text = extract_text_from_pdf(pdf_path, args.lang)
            rows = parse_questions(text, pdf_path.name, topic)
            write_per_pdf_output(per_pdf_dir, pdf_path, rows)
            print(f"  -> verified {len(rows)} questions")
            all_rows.extend(rows)
            pdf_counts[pdf_path.name] = len(rows)
            topic_counter[topic] += len(rows)
        except Exception as exc:
            print(f"  -> failed: {exc}")
            pdf_counts[pdf_path.name] = 0

    payload = {
        "generated_at": datetime.now(UTC).isoformat(),
        "source_dir": str(pyq_dir),
        "total_pdfs": len(pdf_files),
        "total_questions": len(all_rows),
        "questions_by_topic": dict(sorted(topic_counter.items())),
        "questions_by_pdf": dict(sorted(pdf_counts.items())),
    }

    output_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Saved summary to {output_path}")
    print(f"Saved per-PDF files to {per_pdf_dir}")


if __name__ == "__main__":
    main()
