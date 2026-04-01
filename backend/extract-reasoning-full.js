#!/usr/bin/env node
const fs = require("fs");
const crypto = require("crypto");

// Aggressive extraction from reasoning PDF with all available patterns
async function extractReasoningFull() {
  const filePath = "backend/pyq/other/SSC Reasoning 7000+ Objective Questions - Bilingual.pdf";
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
    console.error("❌ Could not extract text from reasoning PDF");
    process.exit(1);
  }

  console.log(`📄 Extracted text length: ${fullText.length} chars`);

  // Aggressive pattern matching for all question formats in reasoning
  const questions = new Map(); // Use Map to avoid duplicates by question text hash

  const lines = fullText.split("\n");

  // Pattern 1: "1) option1 2) option2 3) option3 4) option4" (inline format)
  // Pattern 2: "Q.123 Question text\nA) option\nB) option\nC) option\nD) option"
  // Pattern 3: "(A) option (B) option (C) option (D) option"
  // Pattern 4: "Que. N ..." with numbered/lettered options below

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    // Try Pattern 1: "N) text here"
    const basicMatch = line.match(/^(\d+)\)\s*(.{10,250}?)(?:\s+[1-4]\)|$)/);
    if (basicMatch) {
      const qText = basicMatch[2].trim();
      if (qText.length > 10) {
        // Look ahead for options
        let optionLines = [];
        let j = i + 1;
        while (j < lines.length && optionLines.length < 5 && j < i + 10) {
          const optLine = lines[j].trim();
          // Match option patterns
          const optMatch = optLine.match(/^[\[\(]?([A-D1-4])\)?[\]]?\s*[.:\-]?\s*(.{5,200}?)$/);
          if (optMatch) {
            optionLines.push(optMatch[2].trim());
            j++;
            if (optionLines.length === 4) break;
          } else if (optionLines.length > 0 && optLine.length === 0) {
            // Empty line after options, stop
            break;
          } else if (optionLines.length > 0 && !optLine.match(/^[\[\(]?[A-D1-4]/)) {
            // Non-option line after we started collecting, stop
            break;
          } else {
            j++;
          }
        }

        if (optionLines.length === 4) {
          const hash = crypto.createHash("sha1")
            .update(`reasoning|${qText}|${optionLines.join("|")}`)
            .digest("hex");
          if (!questions.has(hash)) {
            questions.set(hash, {
              number: basicMatch[1],
              text: qText,
              options: optionLines,
              source: "reasoning_aggressive_extract"
            });
          }
        }
      }
    }

    // Try Pattern 2: "Q. N Question" or "Que. N Question"
    const qMatch = line.match(/^(?:Q\.|Que\.)\s*(\d+)\s*(.{10,250})/i);
    if (qMatch) {
      const qText = qMatch[2].trim().slice(0, 200);
      let optionLines = [];
      let j = i + 1;
      while (j < lines.length && optionLines.length < 5 && j < i + 15) {
        const optLine = lines[j].trim();
        const optMatch = optLine.match(/^[\(\[]?([A-D])\)?[\]\.]?\s*(.+?)$/i);
        if (optMatch && optMatch[2].length > 2) {
          optionLines.push(optMatch[2].trim().slice(0, 150));
          j++;
          if (optionLines.length === 4) break;
        } else if (optionLines.length > 0 && optLine.length === 0) {
          break;
        } else if (optionLines.length > 0 && !optLine.match(/^[\(\[]?[A-D]/i)) {
          break;
        } else {
          j++;
        }
      }

      if (optionLines.length === 4) {
        const hash = crypto.createHash("sha1")
          .update(`reasoning|${qText}|${optionLines.join("|")}`)
          .digest("hex");
        if (!questions.has(hash)) {
          questions.set(hash, {
            number: qMatch[1],
            text: qText,
            options: optionLines,
            source: "reasoning_aggressive_extract"
          });
        }
      }
    }

    i++;
  }

  console.log(`✅ Aggressive extraction found: ${questions.size} unique questions`);

  // Load current bank
  let bank = { questions: [] };
  if (fs.existsSync(bankPath)) {
    bank = JSON.parse(fs.readFileSync(bankPath, "utf8"));
  }

  const fingerprints = new Set();
  bank.questions.forEach((q) => {
    if (q.subject === "reasoning") {
      const fp = crypto.createHash("sha1")
        .update(`${q.subject}|${q.topic}|${q.question}|${q.options.join("|")}`)
        .digest("hex");
      fingerprints.add(fp);
    }
  });

  console.log(`📦 Existing reasoning questions in bank: ${bank.questions.filter(q => q.subject === "reasoning").length}`);

  // Merge new questions
  let added = 0;
  questions.forEach((q) => {
    const fp = crypto.createHash("sha1")
      .update(`reasoning|${q.text}|${q.options.join("|")}`)
      .digest("hex");

    if (!fingerprints.has(fp)) {
      const newQuestion = {
        id: `reasoning_full_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        type: "question",
        examFamily: "ssc",
        subject: "reasoning",
        difficulty: "medium",
        tier: "tier1",
        questionMode: "objective",
        topic: "Logical Reasoning",
        subtopic: null,
        question: q.text,
        options: q.options,
        answerIndex: -1, // Will be set manually or via automated matching
        explanation: "",
        marks: 2,
        negativeMarks: 0.5,
        isChallengeCandidate: false,
        confidenceScore: 0.3, // Lower confidence until answers are validated
        reviewStatus: "pending", // Pending manual answer mapping
        isPYQ: false,
        year: null,
        frequency: 1,
        source: {
          kind: "book_extraction",
          method: "full_text_pattern_match",
          book: "SSC Reasoning 7000+ Objective Questions",
          extractedAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      bank.questions.push(newQuestion);
      fingerprints.add(fp);
      added++;
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

  console.log(`\n✅ Full extraction complete:`);
  console.log(`   - Total unique questions found in PDF: ${questions.size}`);
  console.log(`   - New unique questions added to bank: ${added}`);
  console.log(`   - Bank total now: ${bank.questions.length}`);
  console.log(`\n📊 Updated distribution:`);
  Object.keys(bySubject).sort().forEach(s => {
    console.log(`   - ${s}: ${bySubject[s]}`);
  });

  console.log(`\n⚠️  STATUS: These questions have confidence=0.3 and status=PENDING (no answer keys mapped yet)`);
  console.log(`           Use chapter-key extractor to find answers, or manual review`);
}

extractReasoningFull().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
