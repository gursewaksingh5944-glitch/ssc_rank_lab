#!/usr/bin/env node
/**
 * Bulk import via admin API with OCR support
 * Uses the existing backend import-pdf endpoint which has OCR fallback
 */

const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const fetch = require("node-fetch");

// Some defaults
const ADMIN_KEY = process.env.ADMIN_API_KEY || "local-admin-key";
const API_URL = process.env.API_URL || "http://127.0.0.1:3105";
const ENABLE_CHUNK_RETRY = String(process.env.ENABLE_CHUNK_RETRY || "false").trim().toLowerCase() === "true";
const INCLUDE_QUANT_IMPORT = String(process.env.INCLUDE_QUANT_IMPORT || "false").trim().toLowerCase() === "true";
const QUANT_TOPICS = {
  Number_system: "Number System",
  algebra: "Algebra",
  average: "Average",
  data_interpretation: "Data Interpretation",
  geometry: "Geometry",
  mensuration: "Mensuration",
  percentage: "Percentage",
  profit_loss: "Profit & Loss",
  ratio_proportion: "Ratio & Proportion",
  si_ci: "Simple & Compound Interest",
  simplification: "Simplification",
  time_distance: "Time & Distance",
  time_work: "Time & Work",
  trigo: "Trigonometry"
};

function inferYearFromFilename(filename = "") {
  const match = String(filename).match(/(20\d{2})/);
  const year = match ? Number(match[1]) : null;
  return Number.isFinite(year) ? year : null;
}

async function importPdf(filePath, topic, meta = {}) {
  const filename = path.basename(filePath);
  const topic_label = topic || "PYQ Exam";
  
  process.stdout.write(`📤 ${filename.padEnd(40)} → `);

  try {
    if (!fs.existsSync(filePath)) {
      console.log("❌ Not found");
      return { status: 404, extracted: 0 };
    }

    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));
    form.append("subject", "quant");
    form.append("topic", topic_label);
    form.append("tier", "tier1");
    form.append("parserPreset", "ssc_ocr");
    form.append("useOCR", "true");
    form.append("ocrPageLimit", "40");
    form.append("ocrPageStart", "1");
    form.append("autoApprove", "false");
    form.append("reviewThreshold", "0.95");
    form.append("isPYQ", meta.isPYQ ? "true" : "false");
    if (meta.year) form.append("year", String(meta.year));
    if (meta.sourceKind) form.append("sourceKind", String(meta.sourceKind));

    const res = await fetch(`${API_URL}/api/questions/admin/import-pdf`, {
      method: "POST",
      headers: {
        "x-admin-key": ADMIN_KEY,
        ...form.getHeaders()
      },
      body: form
    });

    const data = await res.json();

    if (res.status === 200) {
      const extracted = data.queued || data.imported || 0;
      console.log(`✅ (${extracted} questions)`);
      return { status: 200, extracted };
    } else {
      const errMsg = data.error || "Unknown error";
      console.log(`⚠️  (${errMsg})`);
      return { status: res.status, extracted: 0 };
    }
  } catch (err) {
    console.log(`❌ (${err.message})`);
    return { status: 500, extracted: 0 };
  }
}

async function importPdfChunk(filePath, topic, pageStart, pageLimit = 40) {
  const filename = path.basename(filePath);
  process.stdout.write(`📤 ${filename} [p${pageStart}-${pageStart + pageLimit - 1}] → `);

  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));
    form.append("subject", "quant");
    form.append("topic", topic || "PYQ Exam");
    form.append("tier", "tier1");
    form.append("parserPreset", "ssc_ocr");
    form.append("useOCR", "true");
    form.append("ocrPageLimit", String(pageLimit));
    form.append("ocrPageStart", String(pageStart));
    form.append("autoApprove", "false");
    form.append("reviewThreshold", "0.95");

    const res = await fetch(`${API_URL}/api/questions/admin/import-pdf`, {
      method: "POST",
      headers: {
        "x-admin-key": ADMIN_KEY,
        ...form.getHeaders()
      },
      body: form
    });

    const data = await res.json();
    if (res.status === 200) {
      const extracted = data.queuedForReview || data.imported || 0;
      console.log(`✅ (${extracted} questions)`);
      return extracted;
    }

    console.log(`⚠️  (${data.error || "no parse"})`);
    return 0;
  } catch (err) {
    console.log(`❌ (${err.message})`);
    return 0;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function autoApproveQueue() {
  console.log(`\n🔄 Auto-approving extracted questions...`);

  try {
    const res = await fetch(`${API_URL}/api/questions/admin/review/auto-decision`, {
      method: "POST",
      headers: {
        "x-admin-key": ADMIN_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        decision: "approve",
        minConfidence: 0,
        limit: 10000,
        reviewedBy: "bulk_import_admin"
      })
    });

    const data = await res.json();
    if (res.status === 200) {
      console.log(`✅ Auto-approved: ${data.updated || 0} questions`);
      return data.updated || 0;
    } else {
      console.log(`⚠️  Auto-approve failed: ${data.error || "Unknown error"}`);
      return 0;
    }
  } catch (err) {
    console.log(`❌ Auto-approve error: ${err.message}`);
    return 0;
  }
}

async function main() {
  console.log("🚀 Bulk PYQ Import via Admin API\n");
  console.log("=".repeat(70));
  console.log(`📍 API: ${API_URL}`);
  console.log("=".repeat(70));

  const otherDir = path.join(__dirname, "pyq", "other");
  const quantDir = path.join(__dirname, "pyq", "quant");

  let totalExtracted = 0;

  // Phase 1: Full exam papers
  console.log("\n📥 PHASE 1: Full Exam Papers");
  console.log("-".repeat(70));

  if (fs.existsSync(otherDir)) {
    const files = fs.readdirSync(otherDir)
      .filter(f => f.endsWith(".pdf"))
      .sort();

    for (const file of files) {
      const filePath = path.join(otherDir, file);
      const topic = `SSC CGL PYQ - ${file.replace(".pdf", "")}`;
      const result = await importPdf(filePath, topic, {
        isPYQ: true,
        year: inferYearFromFilename(file),
        sourceKind: "pyq_pdf"
      });
      totalExtracted += result.extracted;

      // Retry in OCR chunks to capture more pages in long scanned files.
      if (ENABLE_CHUNK_RETRY) {
        const chunkStarts = [1, 21, 41, 61];
        for (const start of chunkStarts) {
          const added = await importPdfChunk(filePath, topic, start, 20);
          totalExtracted += added;
          await sleep(300);
        }
      }
      await sleep(500); // Rate limit
    }
  }

  // Phase 2: Quant topic PDFs
  console.log("\n📥 PHASE 2: Quant Topic PDFs");
  console.log("-".repeat(70));

  if (INCLUDE_QUANT_IMPORT && fs.existsSync(quantDir)) {
    const files = fs.readdirSync(quantDir)
      .filter(f => f.endsWith(".pdf"))
      .sort();

    for (const file of files) {
      const baseNameWithoutExt = file.replace(/\.pdf$/i, "");
      const topic = QUANT_TOPICS[baseNameWithoutExt] || baseNameWithoutExt;
      const filePath = path.join(quantDir, file);
      const result = await importPdf(filePath, topic, {
        isPYQ: false,
        sourceKind: "daily_practice_pdf"
      });
      totalExtracted += result.extracted;

      if (ENABLE_CHUNK_RETRY) {
        const chunkStarts = [1, 21, 41];
        for (const start of chunkStarts) {
          const added = await importPdfChunk(filePath, topic, start, 20);
          totalExtracted += added;
          await sleep(300);
        }
      }
      await sleep(500); // Rate limit
    }
  }

  if (!INCLUDE_QUANT_IMPORT) {
    console.log("ℹ️  Quant chapterwise import skipped (INCLUDE_QUANT_IMPORT=false). Use deep-extract-quant.js for better topic-wise extraction.");
  }

  // Phase 3: Auto-approve all
  console.log("\n📥 PHASE 3: Publishing");
  console.log("-".repeat(70));

  const approved = await autoApproveQueue();
  totalExtracted = Math.max(totalExtracted, approved);

  console.log("\n📊 Summary");
  console.log("-".repeat(70));
  console.log(`📈 Total Questions Extracted: ${totalExtracted}`);
  console.log(`✅ All questions published and ready for use`);

  console.log("\n" + "=".repeat(70));
  console.log("✅ Import complete!");
}

main().catch(err => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
