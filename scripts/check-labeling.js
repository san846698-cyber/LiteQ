const fs = require("fs");
const path = require("path");

const V2_DIR = path.join(__dirname, "..", "data", "csat-english", "validated-v2");
const FIXES_PATH = path.join(__dirname, "..", "data", "csat-english", "labeling-fixes.json");

const files = fs.readdirSync(V2_DIR).filter(f => f.endsWith(".json"));
const allFixes = [];
let totalChecked = 0;
let totalFixed = 0;

for (const file of files) {
  const filePath = path.join(V2_DIR, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const questions = data.questions || [];
  let fileModified = false;

  for (const q of questions) {
    if (!q.choices || !q.self_check) continue;
    totalChecked++;

    const answerIdx = q.answer; // 1-indexed
    const answerText = q.choices[answerIdx - 1] || "";

    // Extract referenced answer text from self_check
    const sc = q.self_check;
    const reasoning = sc.correct_answer_reasoning || sc.reasoning || sc.correctAnswerReasoning || "";
    const mainPoint = sc.mainPoint || "";

    // Strategy 1: Check if the answer choice text appears in the reasoning
    const answerInReasoning = reasoning.includes(answerText) ||
                               reasoning.includes(answerText.substring(0, 30));

    // Strategy 2: For each choice, check if it's more strongly referenced
    let bestMatch = -1;
    let bestScore = 0;

    for (let i = 0; i < q.choices.length; i++) {
      const choice = q.choices[i];
      let score = 0;

      // Check if choice text (or significant substring) appears in reasoning as "correct"
      if (reasoning.includes(choice)) score += 10;
      if (reasoning.includes(choice.substring(0, Math.min(40, choice.length)))) score += 5;

      // For type-33/31 blank questions, check if the choice word appears as the answer
      if (choice.length < 100) {
        // Short choices - check exact match patterns
        const quotedPatterns = [
          `'${choice}'`, `"${choice}"`, `"${choice}"`,
          `correct answer is ${choice}`, `answer is "${choice}"`,
          `(${choice})`, `— ${choice}`, `: ${choice}`
        ];
        for (const pat of quotedPatterns) {
          if (reasoning.toLowerCase().includes(pat.toLowerCase())) score += 8;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = i;
      }
    }

    // Strategy 3: Check distractor_analysis - the answer should NOT appear there as "wrong"
    const dAnalysis = sc.distractor_analysis || sc.distractorAnalysis || "";
    const dStr = typeof dAnalysis === "string" ? dAnalysis : JSON.stringify(dAnalysis);

    // If the current answer's choice text appears in distractor analysis as being wrong
    const answerInDistractors = dStr.includes(`Choice ${answerIdx}`) &&
                                 (dStr.includes("wrong") || dStr.includes("incorrect") || dStr.includes("contradicts"));

    // Determine if there's a mismatch
    let mismatch = false;
    let suggestedAnswer = answerIdx;
    let reason = "";

    // Case 1: Another choice is much more strongly referenced as correct
    if (bestMatch >= 0 && bestScore > 5 && (bestMatch + 1) !== answerIdx) {
      // Verify the best match isn't just mentioned in distractor analysis
      const bestChoiceText = q.choices[bestMatch];
      const bestInDistractors = dStr.includes(bestChoiceText.substring(0, 30));

      if (!bestInDistractors || bestScore > 15) {
        mismatch = true;
        suggestedAnswer = bestMatch + 1;
        reason = `self_check references choice ${bestMatch + 1} ("${bestChoiceText.substring(0, 50)}...") as correct (score: ${bestScore}), but answer field says ${answerIdx}`;
      }
    }

    // Case 2: Current answer text is explicitly called wrong in distractor analysis
    if (answerInDistractors) {
      mismatch = true;
      reason += (reason ? " | " : "") + `Current answer choice ${answerIdx} appears in distractor_analysis as incorrect`;
    }

    if (mismatch) {
      totalFixed++;
      const fix = {
        file,
        questionId: q.id,
        type: q.type,
        originalAnswer: answerIdx,
        correctedAnswer: suggestedAnswer,
        reason,
        choiceOriginal: answerText.substring(0, 60),
        choiceCorrected: q.choices[suggestedAnswer - 1]?.substring(0, 60) || "N/A"
      };
      allFixes.push(fix);

      // Apply fix
      q.answer = suggestedAnswer;
      fileModified = true;
    }
  }

  if (fileModified) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  }
}

// Save fixes report
const report = {
  checkedAt: new Date().toISOString(),
  totalQuestionsChecked: totalChecked,
  totalFixesApplied: totalFixed,
  fixRate: `${((totalFixed / totalChecked) * 100).toFixed(1)}%`,
  fixes: allFixes
};

fs.writeFileSync(FIXES_PATH, JSON.stringify(report, null, 2), "utf-8");

console.log(`Checked: ${totalChecked} questions`);
console.log(`Fixed: ${totalFixed} labeling errors (${report.fixRate})`);
if (allFixes.length > 0) {
  console.log("\nFixes:");
  for (const fix of allFixes) {
    console.log(`  ${fix.questionId} (${fix.file}): answer ${fix.originalAnswer} → ${fix.correctedAnswer}`);
    console.log(`    ${fix.reason}`);
  }
}
