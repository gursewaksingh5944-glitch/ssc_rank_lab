#!/usr/bin/env node
const fs = require("fs");
const crypto = require("crypto");

// Extract all GK questions from Rakesh Yadav GS in English book
async function extractRakeshYadavGK() {
  const filePath = "backend/pyq/other/GS in English Rakesh Yadav- sscstudy.pdf";
  const bankPath = "backend/data/question-bank.json";

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  let pdfParse;
  try {
    pdfParse = require("pdf-parse");
  } catch (err) {
    console.error("❌ pdf-parse not installed");
    process.exit(1);
  }

  // Read PDF
  const pdfBuffer = fs.readFileSync(filePath);
  let fullText = "";
  
  try {
    if (typeof pdfParse === "function") {
      const d = await pdfParse(pdfBuffer);
      fullText = String(d.text || "");
    } else if (pdfParse && typeof pdfParse.PDFParse === "function") {
      const parser = new pdfParse.PDFParse({ data: pdfBuffer });
      const out = await parser.getText();
      await parser.destroy?.();
      fullText = String(out?.text || out || "");
    }
  } catch (parseErr) {
    console.log("⚠️  PDF parse warning:", parseErr.message);
  }

  if (!fullText || fullText.length < 100) {
    console.error("❌ Could not extract text from Rakesh Yadav PDF");
    process.exit(1);
  }

  console.log(`📄 Extracted text length: ${fullText.length} chars`);

  // Extract questions using multiple strategies
  const questions = new Map(); // Map by question hash to avoid duplicates

  const lines = fullText.split("\n").map(l => l.trim()).filter(Boolean);

  console.log(`📋 Found ${lines.length} non-empty lines`);

  // Strategy 1: "N. Question text?" with options below
  let i = 0;
  let extractedByStrategy = { strategy1: 0, strategy2: 0, strategy3: 0 };

  while (i < lines.length) {
    const line = lines[i];

    // STRATEGY 1: "N. Question" (with period or no period)
    let match = line.match(/^(\d{1,4})\.\s*(.{10,300}?)(?:\?\s*)?$/);
    if (match && !line.match(/^(\d{1,4})\.\s*\(/) && !line.match(/^\d{1,4}\.\s*[A-D]\)/)) {
      const qNum = match[1];
      const qText = match[2].trim();
      
      if (qText.length > 15) {
        // Look ahead for options
        let options = [];
        let j = i + 1;
        let optionStartIndex = -1;

        while (j < lines.length && options.length < 4 && j < i + 15) {
          const optLine = lines[j];
          const optMatch = optLine.match(/^\(?([A-D])\)?\s*(.+?)$/i);
          
          if (optMatch && optMatch[2].length > 2) {
            if (optionStartIndex === -1) optionStartIndex = j;
            options.push(optMatch[2].trim().slice(0, 200));
            j++;
            if (options.length === 4) break;
          } else if (options.length > 0 && !optLine.match(/^\(?[A-D]\)?/i)) {
            // Non-option line after we started - stop
            break;
          } else {
            j++;
          }
        }

        if (options.length === 4) {
          const hash = crypto.createHash("sha1")
            .update(`gk|rakesh|${qText}|${options.join("|")}`)
            .digest("hex");

          if (!questions.has(hash)) {
            questions.set(hash, {
              number: qNum,
              text: qText,
              options: options,
              answerIndex: -1,
              source: "rakesh_yadav_strategy1"
            });
            extractedByStrategy.strategy1++;
          }
          i = j;
          continue;
        }
      }
    }

    // STRATEGY 2: "Question text with (a) opt1 (b) opt2 (c) opt3 (d) opt4" inline
    match = line.match(/^(.{20,250}?)\s*\(([A-D])\)\s*(.+?)\s*\(([A-D])\)\s*(.+?)\s*\(([A-D])\)\s*(.+?)\s*\(([A-D])\)\s*(.+?)$/i);
    if (match && !line.match(/^\d+\./)) {
      const qText = match[1].trim();
      const options = [match[3].trim(), match[5].trim(), match[7].trim(), match[9].trim()];
      
      if (qText.length > 15 && options.every(o => o.length > 2)) {
        const hash = crypto.createHash("sha1")
          .update(`gk|rakesh|${qText}|${options.join("|")}`)
          .digest("hex");

        if (!questions.has(hash)) {
          questions.set(hash, {
            number: i,
            text: qText,
            options: options,
            answerIndex: -1,
            source: "rakesh_yadav_strategy2"
          });
          extractedByStrategy.strategy2++;
        }
      }
    }

    // STRATEGY 3: Q. N format with options below
    match = line.match(/^(?:Q\.|Q |Ques\.?)\s*(\d+)\s*(.{10,300})/i);
    if (match) {
      const qNum = match[1];
      const qText = match[2].trim();
      
      if (qText.length > 10) {
        let options = [];
        let j = i + 1;
        
        while (j < lines.length && options.length < 4 && j < i + 12) {
          const optLine = lines[j];
          const optMatch = optLine.match(/^\(?([A-D])\)?\s*(.+)/i);
          
          if (optMatch && optMatch[2].length > 2) {
            options.push(optMatch[2].trim().slice(0, 200));
            j++;
            if (options.length === 4) break;
          } else if (options.length > 0 && !optLine.match(/^\(?[A-D]\)?/i)) {
            break;
          } else {
            j++;
          }
        }

        if (options.length === 4) {
          const hash = crypto.createHash("sha1")
            .update(`gk|rakesh|${qText}|${options.join("|")}`)
            .digest("hex");

          if (!questions.has(hash)) {
            questions.set(hash, {
              number: qNum,
              text: qText,
              options: options,
              answerIndex: -1,
              source: "rakesh_yadav_strategy3"
            });
            extractedByStrategy.strategy3++;
          }
          i = j;
          continue;
        }
      }
    }

    i++;
  }

  console.log(`\n✅ Extraction results by strategy:`);
  console.log(`   - Strategy 1 (N. Question): ${extractedByStrategy.strategy1}`);
  console.log(`   - Strategy 2 (Inline options): ${extractedByStrategy.strategy2}`);
  console.log(`   - Strategy 3 (Q. N format): ${extractedByStrategy.strategy3}`);
  console.log(`   - Total unique questions: ${questions.size}`);

  // Load current bank
  let bank = { questions: [] };
  if (fs.existsSync(bankPath)) {
    bank = JSON.parse(fs.readFileSync(bankPath, "utf8"));
  }

  // Track existing GK questions
  const existingGK = bank.questions.filter(q => q.subject === "gk").length;
  console.log(`\n📦 Current bank GK count: ${existingGK}`);

  const fingerprints = new Set();
  bank.questions.forEach((q) => {
    if (q.subject === "gk") {
      const fp = crypto.createHash("sha1")
        .update(`gk|${q.topic}|${q.question}|${q.options.join("|")}`)
        .digest("hex");
      fingerprints.add(fp);
    }
  });

  // Merge new questions
  let added = 0;
  let skipped = 0;
  questions.forEach((q) => {
    const fp = crypto.createHash("sha1")
      .update(`gk|General Knowledge|${q.text}|${q.options.join("|")}`)
      .digest("hex");

    if (!fingerprints.has(fp)) {
      const newQuestion = {
        id: `gk_rakesh_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        type: "question",
        examFamily: "ssc",
        subject: "gk",
        difficulty: "medium",
        tier: "tier1",
        questionMode: "objective",
        topic: "General Knowledge",
        subtopic: null,
        question: q.text,
        options: q.options,
        answerIndex: q.answerIndex, // -1 (needs manual mapping)
        explanation: "",
        marks: 2,
        negativeMarks: 0.5,
        isChallengeCandidate: false,
        confidenceScore: 0.6, // Medium confidence - needs answer mapping
        reviewStatus: "pending", // Pending answer key mapping
        isPYQ: false,
        year: null,
        frequency: 1,
        source: {
          kind: "book_extraction",
          method: "pattern_matching",
          book: "GS in English Rakesh Yadav",
          strategy: q.source,
          extractedAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      bank.questions.push(newQuestion);
      fingerprints.add(fp);
      added++;
    } else {
      skipped++;
    }
  });

  // Save updated bank
  fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2));

  // Recount by subject
  const bySubject = {};
  bank.questions.forEach(q => {
    if (!bySubject[q.subject]) bySubject[q.subject] = 0;
    bySubject[q.subject]++;
  });

  console.log(`\n✅ FINAL RESULTS:`);
  console.log(`   - Total extracted from PDF: ${questions.size}`);
  console.log(`   - Duplicates skipped: ${skipped}`);
  console.log(`   - New questions added to bank: ${added}`);
  console.log(`   - Bank total now: ${bank.questions.length}`);
  
  console.log(`\n📊 Updated distribution:`);
  Object.keys(bySubject).sort().forEach(s => {
    console.log(`   - ${s}: ${bySubject[s]}`);
  });

  console.log(`\n⚠️  STATUS: Extracted questions have answerIndex=-1 (no answer mapping)`);
  console.log(`   - These need manual review to set correct answer indices`);
  console.log(`   - Confidence is set to 0.6 (medium) in pending status`);
  console.log(`   - Will not be served in exams until manually approved with valid answers`);
}

extractRakeshYadavGK().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
