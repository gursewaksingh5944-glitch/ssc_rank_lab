#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const API_URL = process.env.API_URL || "http://127.0.0.1:10000";
const ADMIN_KEY = process.env.ADMIN_API_KEY || "local-admin-key";

function inferYearFromFilename(filename = "") {
  const match = String(filename).match(/(20\d{2})/);
  const year = match ? Number(match[1]) : null;
  return Number.isFinite(year) ? year : null;
}

async function importOne(filePath) {
  const fileName = path.basename(filePath);
  const topic = `SSC CGL PYQ - ${fileName.replace(/\.pdf$/i, "")}`;
  const year = inferYearFromFilename(fileName);

  const data = fs.readFileSync(filePath);
  const file = new File([data], fileName, { type: "application/pdf" });
  const form = new FormData();
  form.append("file", file);
  form.append("subject", "quant");
  form.append("topic", topic);
  form.append("tier", "tier1");
  form.append("parserPreset", "ssc_ocr");
  form.append("useOCR", "true");
  form.append("ocrPageLimit", "40");
  form.append("ocrPageStart", "1");
  form.append("isPYQ", "true");
  form.append("sourceKind", "pyq_pdf");
  if (year) form.append("year", String(year));

  const res = await fetch(`${API_URL}/api/questions/admin/import-pdf`, {
    method: "POST",
    headers: { "x-admin-key": ADMIN_KEY },
    body: form
  });
  const payload = await res.json().catch(() => ({}));

  const imported = Number(payload.imported || 0);
  const queued = Number(payload.queuedForReview || 0);
  if (res.ok) {
    console.log(`${fileName}: imported=${imported}, queued=${queued}, source=${payload.extractionSource || "unknown"}`);
    return { imported, queued };
  }

  console.log(`${fileName}: failed (${res.status}) ${payload.error || "unknown error"}`);
  return { imported: 0, queued: 0 };
}

async function autoApproveAll() {
  const res = await fetch(`${API_URL}/api/questions/admin/review/auto-decision`, {
    method: "POST",
    headers: {
      "x-admin-key": ADMIN_KEY,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      decision: "approve",
      minConfidence: 0,
      limit: 50000,
      reviewedBy: "bulk_pyq_import"
    })
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.error || `auto-approve failed (${res.status})`);
  }
  return Number(payload.updated || 0);
}

async function main() {
  const dir = path.join(__dirname, "pyq", "other");
  const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".pdf")).sort();

  console.log(`Importing ${files.length} PYQ PDFs from ${dir}`);
  let importedTotal = 0;
  let queuedTotal = 0;

  for (const fileName of files) {
    const filePath = path.join(dir, fileName);
    const result = await importOne(filePath);
    importedTotal += result.imported;
    queuedTotal += result.queued;
  }

  const approved = await autoApproveAll();

  console.log(`Done. imported=${importedTotal}, queued=${queuedTotal}, autoApproved=${approved}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
