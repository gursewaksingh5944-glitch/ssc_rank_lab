#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

let pdfParse = null;
try {
  pdfParse = require("pdf-parse");
} catch (err) {
  console.error("pdf-parse is required:", err.message);
  process.exit(1);
}

function normalizeLine(line = "") {
  return String(line)
    .replace(/\u00ad/g, "")
    .replace(/\u200b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function questionFingerprint(q) {
  const text = String(q.question || "").toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
  const opts = (Array.isArray(q.options) ? q.options : [])
    .map((o) => String(o || "").toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim())
    .join("|");
  return crypto.createHash("sha1").update(`${q.subject}|${q.topic}|${text}|${opts}`).digest("hex");
}

function parseInlineOptions(text) {
  const out = [];
  const re = /\(([a-dA-D])\)\s*([^()]{1,180}?)(?=\s*\([a-dA-D]\)|$)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const idx = "abcd".indexOf(String(m[1] || "").toLowerCase());
    if (idx < 0) continue;
    out[idx] = normalizeLine(m[2]);
  }
  return out.filter(Boolean);
}

function parseBookText(rawText, subject) {
  const lines = String(rawText || "")
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter(Boolean);

  const chapters = [];
  let chapter = { title: subject === "reasoning" ? "Reasoning" : "General Knowledge", questions: [], answers: new Map() };
  let inAnswerKey = false;
  let current = null;

  const flushCurrent = () => {
    if (!current) return;
    current.question = normalizeLine(current.question);
    current.options = (current.options || []).map(normalizeLine).filter(Boolean);
    if (current.question && current.options.length >= 2) {
      chapter.questions.push(current);
    }
    current = null;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (/^chapter\b/i.test(line) || /^CHAPTER\b/.test(line)) {
      flushCurrent();
      if (chapter.questions.length > 0 || chapter.answers.size > 0) {
        chapters.push(chapter);
      }
      let title = "";
      for (let j = i + 1; j <= i + 4 && j < lines.length; j += 1) {
        const cand = lines[j];
        if (/^--\s*\d+\s*of\s*\d+/.test(cand)) continue;
        if (/^(CHAPTER|Type\s*-|ANSWER)/i.test(cand)) continue;
        if (cand.length >= 3) {
          title = cand;
          break;
        }
      }
      chapter = { title: title || chapter.title || (subject === "reasoning" ? "Reasoning" : "General Knowledge"), questions: [], answers: new Map() };
      inAnswerKey = false;
      continue;
    }

    if (/answer\s*key|answer\s*keys|solutions?/i.test(line)) {
      flushCurrent();
      inAnswerKey = true;
      continue;
    }

    if (inAnswerKey) {
      const pairRe = /(\d{1,4})\s*[.):-]\s*\(?([a-dA-D])\)?/g;
      let m;
      let any = false;
      while ((m = pairRe.exec(line)) !== null) {
        const qn = Number(m[1]);
        const ai = "abcd".indexOf(String(m[2] || "").toLowerCase());
        if (qn > 0 && ai >= 0) {
          chapter.answers.set(qn, ai);
          any = true;
        }
      }
      if (!any && /^--\s*\d+\s*of\s*\d+/i.test(line)) {
        // keep answer mode across page markers
      }
      continue;
    }

    const qm = line.match(/^(\d{1,4})[.)]\s+(.{3,})$/);
    if (qm) {
      flushCurrent();
      current = {
        qnum: Number(qm[1]),
        question: qm[2],
        options: []
      };

      const inline = parseInlineOptions(qm[2]);
      if (inline.length >= 2) {
        current.options = inline;
        current.question = qm[2].replace(/\([a-dA-D]\).*/, "").trim();
      }
      continue;
    }

    if (!current) continue;

    const inlineOpts = parseInlineOptions(line);
    if (inlineOpts.length >= 2) {
      current.options = inlineOpts;
      continue;
    }

    const optStart = line.match(/^([a-dA-D])[.)]\s+(.{1,200})$/);
    if (optStart) {
      const idx = "abcd".indexOf(String(optStart[1]).toLowerCase());
      current.options[idx] = normalizeLine(optStart[2]);
      continue;
    }

    if (current.options.length === 0 && line.length > 2 && !/^--\s*\d+\s*of\s*\d+/.test(line)) {
      current.question = `${current.question} ${line}`.trim();
    }
  }

  flushCurrent();
  if (chapter.questions.length > 0 || chapter.answers.size > 0) chapters.push(chapter);

  return chapters;
}

async function extractText(pdfPath) {
  const buffer = fs.readFileSync(pdfPath);
  if (typeof pdfParse === "function") {
    const d = await pdfParse(buffer);
    return String(d.text || "");
  }
  if (pdfParse && typeof pdfParse.PDFParse === "function") {
    const parser = new pdfParse.PDFParse({ data: buffer });
    const out = await parser.getText();
    await parser.destroy?.();
    return String(out?.text || out || "");
  }
  throw new Error("Unsupported pdf-parse API shape");
}

function toTitle(input = "") {
  return String(input || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

async function main() {
  const pdfPath = process.argv[2];
  const subject = String(process.argv[3] || "reasoning").trim().toLowerCase();
  const topicFallback = String(process.argv[4] || (subject === "reasoning" ? "Reasoning" : "General Knowledge")).trim();
  if (!pdfPath) {
    console.error("Usage: node backend/extract-chapter-key-book.js <pdfPath> <subject> [topicFallback]");
    process.exit(1);
  }

  const absPdf = path.resolve(pdfPath);
  if (!fs.existsSync(absPdf)) {
    console.error("PDF not found:", absPdf);
    process.exit(1);
  }

  const rawText = await extractText(absPdf);
  const chapters = parseBookText(rawText, subject);

  const bankPath = path.join(__dirname, "data", "question-bank.json");
  const rawBank = JSON.parse(fs.readFileSync(bankPath, "utf8"));
  const isArray = Array.isArray(rawBank);
  const bank = isArray ? { updatedAt: new Date().toISOString(), questions: rawBank } : rawBank;
  bank.questions = Array.isArray(bank.questions) ? bank.questions : [];

  const seen = new Set(bank.questions.map((q) => questionFingerprint(q)));
  const now = new Date().toISOString();
  let added = 0;
  let mapped = 0;
  let ambiguousSkipped = 0;

  for (const ch of chapters) {
    const topic = toTitle(ch.title || topicFallback) || topicFallback;
    const byNum = new Map();
    ch.questions.forEach((q) => {
      if (!byNum.has(q.qnum)) byNum.set(q.qnum, []);
      byNum.get(q.qnum).push(q);
    });

    for (const [qnum, answerIndex] of ch.answers.entries()) {
      const rows = byNum.get(qnum) || [];
      if (rows.length !== 1) {
        if (rows.length > 1) ambiguousSkipped += 1;
        continue;
      }
      const row = rows[0];
      if (!Array.isArray(row.options) || row.options.length < 2) continue;
      if (!(Number.isInteger(answerIndex) && answerIndex >= 0 && answerIndex < row.options.length)) continue;

      const item = {
        id: `q_${subject}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        type: "question",
        examFamily: "ssc",
        subject,
        difficulty: "medium",
        tier: "tier1",
        questionMode: "objective",
        topic,
        subtopic: topic,
        question: row.question,
        options: row.options,
        answerIndex,
        explanation: "",
        marks: 2,
        negativeMarks: 0.5,
        isChallengeCandidate: false,
        confidenceScore: 0.95,
        reviewStatus: "approved",
        isPYQ: false,
        year: null,
        frequency: 1,
        source: {
          kind: "chapter_answer_key_pdf",
          fileName: path.basename(absPdf),
          chapter: topic,
          extractedBy: "extract-chapter-key-book",
          importedAt: now
        },
        createdAt: now,
        updatedAt: now
      };

      const fp = questionFingerprint(item);
      mapped += 1;
      if (seen.has(fp)) continue;
      seen.add(fp);
      bank.questions.push(item);
      added += 1;
    }
  }

  bank.updatedAt = new Date().toISOString();
  fs.writeFileSync(bankPath, JSON.stringify(isArray ? bank.questions : bank, null, 2), "utf8");

  console.log(`Chapters detected: ${chapters.length}`);
  console.log(`Answer mappings attempted: ${mapped}`);
  console.log(`Ambiguous skipped: ${ambiguousSkipped}`);
  console.log(`Added new verified questions: ${added}`);
  console.log(`Bank total: ${bank.questions.length}`);
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
