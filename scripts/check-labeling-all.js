/**
 * 전 과목 라벨링 검증 스크립트
 * 영어 check-labeling.js와 동일한 로직을 국어/사탐/과탐에도 적용
 *
 * Usage: node scripts/check-labeling-all.js
 */

const fs = require("fs");
const path = require("path");

const SUBJECTS = [
  { name: "국어", dir: "data/csat-korean/generated" },
  { name: "생활과윤리", dir: "data/csat-ethics/generated" },
  { name: "지구과학1", dir: "data/csat-earthsci/generated" },
];

function checkFile(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const questions = data.questions || [];
  const issues = [];
  let checked = 0;
  let fixed = 0;

  for (const q of questions) {
    if (!q.choices || !q.self_check) continue;
    checked++;

    const answerIdx = q.answer;
    const answerText = q.choices[answerIdx - 1] || "";
    const sc = q.self_check;
    const reasoning = sc.correct_answer_reasoning || sc.reasoning || "";
    const dAnalysis = sc.distractor_analysis || "";
    const dStr = typeof dAnalysis === "string" ? dAnalysis : JSON.stringify(dAnalysis);

    // Strategy 1: Check best matching choice in reasoning
    let bestMatch = -1;
    let bestScore = 0;
    for (let i = 0; i < q.choices.length; i++) {
      const choice = q.choices[i];
      let score = 0;
      if (reasoning.includes(choice)) score += 10;
      if (reasoning.includes(choice.substring(0, Math.min(40, choice.length)))) score += 5;
      if (choice.length < 100) {
        const patterns = [`'${choice}'`, `"${choice}"`, `correct answer is ${choice}`];
        for (const pat of patterns) {
          if (reasoning.toLowerCase().includes(pat.toLowerCase())) score += 8;
        }
      }
      if (score > bestScore) { bestScore = score; bestMatch = i; }
    }

    // Strategy 2: Answer shouldn't be in distractor analysis as wrong
    const answerInDistractors = dStr.includes(`Choice ${answerIdx}`) &&
      (dStr.includes("wrong") || dStr.includes("incorrect"));

    let mismatch = false;
    let suggestedAnswer = answerIdx;
    let reason = "";

    if (bestMatch >= 0 && bestScore > 5 && (bestMatch + 1) !== answerIdx) {
      mismatch = true;
      suggestedAnswer = bestMatch + 1;
      reason = `reasoning references choice ${bestMatch + 1} (score: ${bestScore}), answer says ${answerIdx}`;
    }
    if (answerInDistractors) {
      mismatch = true;
      reason += (reason ? " | " : "") + `answer ${answerIdx} in distractor_analysis as incorrect`;
    }

    // Basic checks
    if (answerIdx < 1 || answerIdx > 5) {
      issues.push({ id: q.id, issue: `Invalid answer index: ${answerIdx}` });
    }
    if (q.choices.length !== 5) {
      issues.push({ id: q.id, issue: `Wrong choice count: ${q.choices.length}` });
    }
    if (!q.explanations || !q.explanations.correct) {
      issues.push({ id: q.id, issue: "Missing explanations.correct" });
    }

    if (mismatch) {
      fixed++;
      issues.push({
        id: q.id,
        issue: `Labeling mismatch: ${reason}`,
        originalAnswer: answerIdx,
        suggestedAnswer,
      });
      q.answer = suggestedAnswer;
    }
  }

  if (fixed > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  return { checked, fixed, issues };
}

// Main
console.log("=== LiteQ 전 과목 라벨링 검증 ===\n");

const report = {};
for (const subj of SUBJECTS) {
  const dirPath = path.join(__dirname, "..", subj.dir);
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠ ${subj.name}: 디렉토리 없음 (${subj.dir})`);
    continue;
  }

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".json"));
  let totalChecked = 0;
  let totalFixed = 0;
  let totalQuestions = 0;
  const allIssues = [];

  for (const file of files) {
    const result = checkFile(path.join(dirPath, file));
    totalChecked += result.checked;
    totalFixed += result.fixed;
    totalQuestions += result.checked;
    if (result.issues.length > 0) {
      allIssues.push({ file, issues: result.issues });
    }
  }

  const passRate = totalChecked > 0
    ? ((totalChecked - totalFixed) / totalChecked * 100).toFixed(1)
    : "N/A";

  report[subj.name] = {
    files: files.length,
    totalQuestions,
    checked: totalChecked,
    fixed: totalFixed,
    passRate: `${passRate}%`,
  };

  console.log(`${subj.name}:`);
  console.log(`  파일: ${files.length}개`);
  console.log(`  문항: ${totalQuestions}개`);
  console.log(`  검증: ${totalChecked}개 | 수정: ${totalFixed}개`);
  console.log(`  통과율: ${passRate}%`);

  if (allIssues.length > 0) {
    for (const { file, issues } of allIssues) {
      for (const iss of issues) {
        console.log(`    ⚠ ${file} → ${iss.id}: ${iss.issue}`);
      }
    }
  }
  console.log();
}

console.log("=== 요약 ===");
console.log(JSON.stringify(report, null, 2));
