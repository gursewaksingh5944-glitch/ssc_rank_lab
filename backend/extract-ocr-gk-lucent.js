const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// OCR-based extraction for Lucent GK to recover all questions
async function extractLucentGK() {
  const filePath = "backend/pyq/other/Objective of lucent (english)-signed.pdf";
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
    } else {
      throw new Error("Unsupported pdf-parse API shape");
    }
  } catch (parseErr) {
    console.error("❌ Failed to parse PDF:", parseErr.message);
    process.exit(1);
  }

  // Parse questions using aggressive regex patterns
  // Pattern 1: "1) Option1 2) Option2 3) Option3 4) Option4" (single line)
  // Pattern 2: Multi-line with question followed by options
  // Pattern 3: "Q. N" or "Que. N" formats

  const questions = [];
  const lines = fullText.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Match question number pattern: "1.", "2.", "123.", etc.
    const qnoMatch = line.match(/^(\d+)\)\s*(.+)/);
    if (qnoMatch) {
      const questionText = qnoMatch[2].trim();
      const options = [];
      let answerKey = null;

      // Look ahead for options (a/1, b/2, c/3, d/4 patterns)
      i++;
      let optionCount = 0;
      while (optionCount < 4 && i < lines.length) {
        const optLine = lines[i].trim();
        
        // Match option patterns: (a), (1), (A), [a], etc.
        const optMatch = optLine.match(/^[\(\[]?([a-dA-D1-4])\)?[\]\:]?\s*(.+)/);
        if (optMatch) {
          options.push(optMatch[2].trim());
          optionCount++;
          i++;
        } else if (optionCount === 0) {
          // If we haven't found any options yet, this might be a continuation
          break;
        } else {
          // We have options but hit something else - stop looking
          break;
        }
      }

      // Validate we got a complete question with 4 options
      if (questionText.length > 10 && options.length === 4) {
        questions.push({
          number: qnoMatch[1],
          text: questionText,
          options: options,
          source: "lucent_gk_ocr"
        });
      }
    } else {
      i++;
    }
  }

  console.log(`📄 Lucent GK OCR processed: ${questions.length} potential questions extracted`);

  // Now try to match with answer keys if they exist in the document
  // Look for "Answer Key" or "Answers" patterns
  const answerKeyMatch = fullText.match(/answer\s*key|answers[:\s]+([\d\s\w\)\(\-]+)/gi);
  console.log(`🔑 Answer key sections found: ${answerKeyMatch ? answerKeyMatch.length : 0}`);

  // Load current bank to check for duplicates and add new ones
  let bank = { questions: [] };
  if (fs.existsSync(bankPath)) {
    bank = JSON.parse(fs.readFileSync(bankPath, "utf8"));
  }

  const fingerprints = new Set();
  bank.questions.forEach((q) => {
    const fp = crypto.createHash("sha1")
      .update(`gk|${q.topic}|${q.question}|${q.options.join("|")}`)
      .digest("hex");
    fingerprints.add(fp);
  });

  // Merge new questions
  let added = 0;
  questions.forEach((q) => {
    const fp = crypto.createHash("sha1")
      .update(`gk|General Knowledge|${q.text}|${q.options.join("|")}`)
      .digest("hex");

    if (!fingerprints.has(fp)) {
      const newQuestion = {
        id: `gk_lucent_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
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
        answerIndex: -1, // Will be set manually
        explanation: "",
        marks: 2,
        negativeMarks: 0.5,
        isChallengeCandidate: false,
        confidenceScore: 0.5, // Lower confidence due to OCR + lack of validated answer mapping
        reviewStatus: "pending", // Mark as pending for manual review
        isPYQ: false,
        year: null,
        frequency: 1,
        source: {
          kind: "book_extraction",
          method: "ocr",
          book: "Objective of Lucent GK",
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

  console.log(`✅ OCR extraction complete:`);
  console.log(`   - Questions extracted: ${questions.length}`);
  console.log(`   - New unique questions added: ${added}`);
  console.log(`   - Bank total now: ${bank.questions.length}`);
  console.log(`   - Status: Questions marked as PENDING REVIEW (need manual answer mapping)`);
  
  console.log(`\n⚠️  NEXT STEPS:`);
  console.log(`   1. Manually review extracted questions for accuracy`);
  console.log(`   2. Map answer indices from original book or answer key`);
  console.log(`   3. Change reviewStatus to 'approved' and increase confidenceScore to 0.8+`);
}

extractLucentGK().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
