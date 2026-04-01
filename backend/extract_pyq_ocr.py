#!/usr/bin/env python3
import argparse
import io
import json
import re
from pathlib import Path

import fitz  # pymupdf
import pytesseract
from PIL import Image


QUESTION_RE = re.compile(r"^\s*(?:Q\.?\s*No\.?\s*)?(\d{1,4})\s*[\)\].:\-]?\s*(.+)?$", re.IGNORECASE)
OPTION_RE = re.compile(r"^\s*[\[(]?([A-Da-d])[\])\.:\-]?\s+(.+)$")
ANSWER_INLINE_RE = re.compile(
    r"(?:ans(?:wer)?|correct\s*(?:option|answer)|right\s*answer)\s*[:\-]?\s*([A-Da-d])\b",
    re.IGNORECASE,
)
ANSWER_KEY_PAIR_RE = re.compile(r"\b(\d{1,4})\s*[\).:\-]?\s*([A-Da-d])\b")


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


def extract_text_from_pdf(pdf_path: Path, tesseract_cmd: str, lang: str) -> str:
    text_chunks = []
    with fitz.open(pdf_path) as doc:
        for page in doc:
            native = page.get_text("text") or ""
            native = native.strip()

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


def parse_answer_key(lines):
    answer_map = {}
    in_answer_zone = False
    for line in lines:
        low = line.lower()
        if "answer key" in low or "correct option" in low or "answers" in low:
            in_answer_zone = True

        if in_answer_zone:
            for m in ANSWER_KEY_PAIR_RE.finditer(line):
                qnum = int(m.group(1))
                letter = m.group(2).upper()
                answer_map[qnum] = letter

    return answer_map


def parse_questions(text: str, source_file: str):
    lines = [normalize_line(ln) for ln in text.splitlines()]
    lines = [ln for ln in lines if ln]

    answer_key_map = parse_answer_key(lines)
    results = []
    current = None

    def flush_current():
        nonlocal current
        if not current:
            return
        if current["question"] and sum(1 for o in current["options"] if o) >= 2:
            qnum = current["question_number"]
            if not current["answer_option"] and qnum in answer_key_map:
                current["answer_option"] = answer_key_map[qnum]

            results.append(
                {
                    "source_pdf": source_file,
                    "question_number": qnum,
                    "question": current["question"],
                    "options": [o for o in current["options"] if o],
                    "answer_option": current["answer_option"] or "",
                }
            )
        current = None

    for line in lines:
        q_match = QUESTION_RE.match(line)
        o_match = OPTION_RE.match(line)
        a_match = ANSWER_INLINE_RE.search(line)

        if q_match:
            qnum = int(q_match.group(1))
            qtxt = (q_match.group(2) or "").strip()

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
            text_opt = o_match.group(2).strip()
            idx = "ABCD".find(letter)
            if idx >= 0:
                current["options"][idx] = text_opt
            continue

        if current and a_match:
            current["answer_option"] = a_match.group(1).upper()
            continue

        if current and not o_match:
            # Continue multiline question statements until first option appears.
            if not any(current["options"]):
                if len(line) > 2 and not line.lower().startswith("-- "):
                    current["question"] = (current["question"] + " " + line).strip()

    flush_current()
    return results


def collect_pdf_paths(pyq_root: Path):
    return sorted(pyq_root.rglob("*.pdf"))


def main():
    parser = argparse.ArgumentParser(description="Extract PYQ Q/A-option data with OCR fallback")
    parser.add_argument("--pyq-dir", default="backend/pyq", help="Folder containing PDF files")
    parser.add_argument(
        "--output",
        default="backend/data/pyq_qa_ocr.json",
        help="Output JSON path",
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
    output_path.parent.mkdir(parents=True, exist_ok=True)

    pdf_files = collect_pdf_paths(pyq_dir)
    all_rows = []

    print(f"Found {len(pdf_files)} PDFs under {pyq_dir}")
    for idx, pdf_path in enumerate(pdf_files, start=1):
        print(f"[{idx}/{len(pdf_files)}] {pdf_path.name}")
        try:
            text = extract_text_from_pdf(pdf_path, args.tesseract_cmd, args.lang)
            rows = parse_questions(text, pdf_path.name)
            print(f"  -> extracted {len(rows)} questions")
            all_rows.extend(rows)
        except Exception as exc:
            print(f"  -> failed: {exc}")

    payload = {
        "generated_at": __import__("datetime").datetime.utcnow().isoformat() + "Z",
        "source_dir": str(pyq_dir),
        "total_pdfs": len(pdf_files),
        "total_questions": len(all_rows),
        "questions": all_rows,
    }

    output_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Saved {len(all_rows)} questions to {output_path}")


if __name__ == "__main__":
    main()
