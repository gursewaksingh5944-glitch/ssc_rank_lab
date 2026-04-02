#!/usr/bin/env node
/**
 * Dry-run analysis of Number_system.pdf
 * Counts how many questions can be extracted with exact known answers
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

let PDFParse;
try {
  const mod = require("pdf-parse");
  PDFParse = mod.PDFParse || mod;
} catch (e) {
  console.error("pdf-parse not available");
  process.exit(1);
}

function qFingerprint(text) {
  const t = (text || "").toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
  return crypto.createHash("sha1").update(t).digest("hex");
}

async function run() {
  const pdfPath = path.join(__dirname, "pyq", "quant", "Number_system.pdf");
  const buf = fs.readFileSync(pdfPath);

  let rawText = "";
  const parser = new PDFParse({ data: buf });
  const result = await parser.getText();
  rawText = result.text || "";
  await parser.destroy();

  console.log("PDF text length:", rawText.length);
  const lines = rawText.split("\n");
  console.log("Total lines:", lines.length);

  // ── 1. Parse answer key from solution section ──
  // Solutions have format like "55. (a)", "69. (c)", "88. (©)" etc.
  const answers = new Map();

  // Find solution section (after page 5 marker or ~halfway)
  let solStartIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/--\s*[56]\s*of\s*10/.test(lines[i])) { solStartIdx = i; break; }
  }
  if (solStartIdx === 0) solStartIdx = Math.floor(lines.length / 2);

  // Parse solution section lines that start with "N." 
  for (let i = solStartIdx; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!/^\d{1,3}\./.test(trimmed)) continue;

    const numMatch = trimmed.match(/^(\d{1,3})\./);
    if (!numMatch) continue;
    const qn = parseInt(numMatch[1]);
    if (qn < 1 || qn > 200) continue;
    if (answers.has(qn)) continue;

    const rest = trimmed.slice(numMatch[0].length).trim();
    const restBuf = Buffer.from(rest.slice(0, 10));
    const hex = restBuf.toString("hex");

    // Decode answer from bytes:
    // (a) = 286129, (@) = 284029, @ = 40, @) = 4029
    // (b) = 286229, ® = c2ae, ®) = c2ae29
    // (c) = 286329, (¢) = 28c2a229, © = c2a9, (o) = 286f29
    // (d) = 286429
    // () = 2829 = empty/unknown
    
    let idx = -1;
    if (hex.startsWith("2861") || hex.startsWith("2840") || hex === "40" || hex.startsWith("4029")) {
      idx = 0; // a
    } else if (hex.startsWith("2862") || hex.startsWith("c2ae")) {
      idx = 1; // b
    } else if (hex.startsWith("2863") || hex.startsWith("28c2a2") || hex.startsWith("c2a9") || hex.startsWith("286f")) {
      idx = 2; // c
    } else if (hex.startsWith("2864")) {
      idx = 3; // d
    }
    // 2829 = () empty, skip
    // 2830 = (0 = could be (c) OCR, but ambiguous

    if (idx >= 0) answers.set(qn, idx);
  }

  // Also scan inline answer patterns like "57. (a) text..."
  const fullText = rawText;
  const inlineRx = /(?:^|\n)\s*(\d{1,3})\.\s*\(([a-d])\)/gi;
  let m;
  while ((m = inlineRx.exec(fullText)) !== null) {
    const qn = parseInt(m[1]);
    if (qn >= 1 && qn <= 200) {
      const idx = { a: 0, b: 1, c: 2, d: 3 }[m[2].toLowerCase()];
      if (idx !== undefined && !answers.has(qn)) answers.set(qn, idx);
    }
  }

  console.log("\n=== ANSWER KEY ===");
  console.log("Total answer entries parsed:", answers.size);
  const sortedAns = [...answers.entries()].sort((a, b) => a[0] - b[0]);
  console.log("Answers:", sortedAns.map(([q, i]) => `${q}:${"abcd"[i]}`).join(", "));

  // ── 2. Extract question blocks ──
  // First, heavy OCR normalization for option markers
  let norm = rawText;
  
  // Normalize each line for OCR artifacts (same approach as deep-extract-quant)
  const normLines = norm.split("\n").map(line => {
    let s = line
      .replace(/\r/g, "")
      // (a) variants
      .replace(/\(@\)/g, "(a)").replace(/\( @\)/g, "(a)")
      .replace(/\(@\s/g, "(a) ").replace(/\(@([^)a-z])/g, "(a)$1")
      .replace(/\(8\)/g, "(a)").replace(/\(4\)/g, "(a)").replace(/\(A\)/g, "(a)")
      // (b) variants
      .replace(/®\)/g, "(b)").replace(/®(\s)/g, "(b)$1").replace(/\(B\)/g, "(b)")
      // (c) variants
      .replace(/\(¢\)/g, "(c)").replace(/\(©\)/g, "(c)")
      .replace(/©(\s)/g, "(c)$1")
      .replace(/\(0\)/g, "(c)").replace(/\(C\)/g, "(c)")
      // (d) variants
      .replace(/\(D\)/g, "(d)");

    // Handle multi-byte OCR sequences: ┬⌐ = ©(c), ┬« = ®(b), ┬ó = £(a-ish)
    s = s.replace(/\(┬⌐\)/g, "(c)").replace(/\(┬⌐/g, "(c)").replace(/┬⌐/g, "(c)")
      .replace(/\(┬«\)/g, "(b)").replace(/\(┬«/g, "(b)").replace(/┬«/g, "(b)")
      .replace(/\(┬ó\)/g, "(a)").replace(/\(┬ó/g, "(a)").replace(/┬ó/g, "(a)");

    // Handle bare @ as option (a) on option-like lines
    const isOptLine = /\(b\)|®|\(c\)|\(d\)/i.test(s);
    if (isOptLine) {
      s = s.replace(/(^|\s)@(\s)/g, "$1(a)$2");
      s = s.replace(/(^|\s)®(\s|$)/g, "$1(b)$2");
      s = s.replace(/(^|\s)©(\s|$)/g, "$1(c)$2");
    }

    // Also replace standalone ® ) patterns 
    s = s.replace(/\)\s+\)/g, ") ");

    return s.replace(/\s{2,}/g, " ").trim();
  });

  // Merge lines where (a) appears but (b) doesn't yet
  const merged = [];
  for (let i = 0; i < normLines.length; i++) {
    let cur = normLines[i];
    if (/\(a\)/i.test(cur) && !/\(b\)/i.test(cur)) {
      let j = i + 1;
      while (j <= i + 3 && j < normLines.length) {
        cur = cur + " " + normLines[j];
        j++;
        if (/\(b\)/i.test(cur)) { i = j - 1; break; }
      }
    }
    merged.push(cur);
  }

  const questions = [];
  const seenFP = new Set();

  for (let i = 0; i < merged.length; i++) {
    const line = merged[i];
    if (!/\(a\)/i.test(line) || !/\(b\)/i.test(line)) continue;

    // Find all (a) positions
    const aPositions = [];
    let rx = /\(a\)/gi;
    while ((m = rx.exec(line)) !== null) aPositions.push(m.index);

    for (const aPos of aPositions) {
      const nextA = line.indexOf("(a)", aPos + 3);
      const seg = nextA > aPos ? line.slice(aPos, nextA) : line.slice(aPos);

      // Extract options
      const optMatch = seg.match(/\(a\)\s*(.{1,120}?)\s*\(b\)\s*(.{1,120}?)(?:\s*\(c\)\s*(.{0,120}?))?(?:\s*\(d\)\s*(.{0,120}))?$/i)
        || seg.match(/\(a\)\s*(.{1,120}?)\s*\(b\)\s*(.{1,120}?)\s*\(c\)\s*(.{0,120}?)\s*\(d\)\s*(.{0,120})/i);
      if (!optMatch) continue;

      const opts = [optMatch[1], optMatch[2], optMatch[3], optMatch[4]]
        .map(o => (o || "").replace(/\([a-d]\).*$/i, "").replace(/\(SSC[^)]*\)/gi, "").trim())
        .filter(Boolean);
      if (opts.length < 2) continue;

      // Find question text (before (a) on this line + look back)
      const beforeOpt = line.slice(0, aPos).trim();
      const accumLines = [];
      let qNum = -1;

      const leadNum = beforeOpt.match(/(\d{1,3})[.)]\s+(.{5,})/);
      if (leadNum) {
        qNum = parseInt(leadNum[1]);
        accumLines.push(leadNum[2]);
      } else if (beforeOpt.length > 8) {
        accumLines.push(beforeOpt);
      }

      if (qNum < 0 || accumLines.length === 0) {
        for (let k = i - 1; k >= Math.max(0, i - 8); k--) {
          const prev = merged[k];
          if (!prev || prev.length < 3) break;
          if (/\(a\)/i.test(prev) && /\(b\)/i.test(prev)) break;
          if (/^CHAPTER|^NUMBER SYSTEM/i.test(prev)) break;
          if (/^--\s*\d+\s*of\s*\d+/.test(prev)) break;

          const nm = prev.match(/(\d{1,3})[.)]\s+(.{5,})/);
          if (nm) {
            qNum = parseInt(nm[1]);
            accumLines.unshift(nm[2]);
            break;
          }
          accumLines.unshift(prev);
        }
      }

      if (accumLines.length === 0) continue;

      let qText = accumLines.join(" ").replace(/\s+/g, " ")
        .replace(/\(SSC[^)]{0,80}\)/gi, "").trim();
      if (!qText || qText.length < 8) continue;

      // Dedup
      const fp = qFingerprint(qText);
      if (seenFP.has(fp)) continue;
      seenFP.add(fp);

      const ansIdx = qNum > 0 ? (answers.get(qNum) ?? -1) : -1;
      questions.push({ qNum, question: qText, options: opts, answerIndex: ansIdx });
    }
  }

  // ── 3. Check against existing bank ──
  const bank = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "question-bank.json"), "utf8")).questions;
  const existingFPs = new Set();
  for (const q of bank) existingFPs.add(qFingerprint(q.question));

  const withAnswer = questions.filter(q => q.answerIndex >= 0);
  const withoutAnswer = questions.filter(q => q.answerIndex < 0);
  const newWithAnswer = withAnswer.filter(q => !existingFPs.has(qFingerprint(q.question)));
  const newWithoutAnswer = withoutAnswer.filter(q => !existingFPs.has(qFingerprint(q.question)));
  const duplicates = questions.filter(q => existingFPs.has(qFingerprint(q.question)));

  console.log("\n=== EXTRACTION RESULTS ===");
  console.log("Total questions parsed:", questions.length);
  console.log("  With exact answer:", withAnswer.length);
  console.log("  Without answer:", withoutAnswer.length);
  console.log("\n=== DEDUPLICATION ===");
  console.log("Already in bank (duplicates):", duplicates.length);
  console.log("NEW with exact answer:", newWithAnswer.length);
  console.log("NEW without answer:", newWithoutAnswer.length);

  console.log("\n=== ANSWER COVERAGE BY QUESTION ===");
  const noAnsList = withoutAnswer.map(q => q.qNum).filter(n => n > 0).sort((a, b) => a - b);
  console.log("Q#s without answers:", noAnsList.join(", "));

  console.log("\n=== SAMPLE QUESTIONS WITH ANSWERS ===");
  newWithAnswer.slice(0, 5).forEach((q, i) => {
    console.log(`\n${i + 1}. [Q${q.qNum}] ${q.question}`);
    q.options.forEach((o, j) => console.log(`   ${"ABCD"[j]}. ${o}${j === q.answerIndex ? " ✓" : ""}`));
  });

  console.log("\n=== FINAL SUMMARY ===");
  console.log(`Can add ${newWithAnswer.length} NEW questions with KNOWN EXACT answers`);
  console.log(`Can add ${newWithoutAnswer.length} more if answer unknown is acceptable`);
  console.log(`${duplicates.length} questions already exist in the bank`);
}

run().catch(e => console.error(e));
