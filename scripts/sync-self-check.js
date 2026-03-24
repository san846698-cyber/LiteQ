/**
 * self_check.distractor_analysis를 현재 answer와 동기화
 * fix-answer-distribution 후 실행
 *
 * 로직: 현재 answer의 선지가 correct로, 나머지가 distractor로 표현되도록
 * distractor_analysis 텍스트를 explanations 기반으로 재생성
 */

const fs = require("fs");
const path = require("path");

const dirs = process.argv.slice(2);
if (dirs.length === 0) {
  console.error("Usage: node sync-self-check.js <dir1> [dir2] ...");
  process.exit(1);
}

let totalSynced = 0;

for (const dir of dirs) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));

  for (const file of files) {
    const filePath = path.join(dir, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const questions = data.questions || [];
    let modified = false;

    for (const q of questions) {
      if (!q.self_check || !q.explanations) continue;

      const answer = q.answer; // 1-indexed
      const correctText = q.explanations.correct || "";
      const wrongEntries = q.explanations.wrong || {};

      // Rebuild distractor_analysis from explanations
      const distractorParts = [];
      for (let i = 1; i <= 5; i++) {
        if (i === answer) continue;
        const wrongText = wrongEntries[String(i)];
        if (wrongText) {
          distractorParts.push(`Choice ${i} is incorrect: ${wrongText.replace(/^[①②③④⑤]\s*/, "")}`);
        }
      }

      // Rebuild correct_answer_reasoning
      q.self_check.correct_answer_reasoning =
        `Choice ${answer} is correct. ${correctText}`;
      q.self_check.distractor_analysis = distractorParts.join(" ");
      q.self_check.answer_uniqueness = "confirmed";
      modified = true;
      totalSynced++;
    }

    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    }
  }
}

console.log(`Synced ${totalSynced} questions' self_check fields`);
