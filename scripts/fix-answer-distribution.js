/**
 * 정답 위치 균등 분배 보정
 * 각 파일 내 10문항에서 각 위치(1~5)가 2번씩 나오도록 조정
 * 선지 순서를 섞어서 정답 위치를 변경 (내용은 유지)
 *
 * Usage: node scripts/fix-answer-distribution.js <directory>
 */

const fs = require("fs");
const path = require("path");

const dir = process.argv[2];
if (!dir) {
  console.error("Usage: node fix-answer-distribution.js <directory>");
  process.exit(1);
}

const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));
let totalFixed = 0;

for (const file of files) {
  const filePath = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const questions = data.questions || [];
  if (questions.length === 0) continue;

  // 목표: 각 위치(1~5)가 2번씩
  const targetPerPos = Math.floor(questions.length / 5);
  const targetPositions = [];
  for (let pos = 1; pos <= 5; pos++) {
    for (let i = 0; i < targetPerPos; i++) {
      targetPositions.push(pos);
    }
  }
  // 남은 자리 랜덤 채우기
  while (targetPositions.length < questions.length) {
    targetPositions.push(Math.floor(Math.random() * 5) + 1);
  }
  // 셔플
  for (let i = targetPositions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [targetPositions[i], targetPositions[j]] = [targetPositions[j], targetPositions[i]];
  }

  let fileFixed = 0;
  for (let qi = 0; qi < questions.length; qi++) {
    const q = questions[qi];
    const currentAnswer = q.answer; // 1-indexed
    const targetPos = targetPositions[qi]; // 1-indexed

    if (currentAnswer === targetPos) continue;

    // 선지 순서를 바꿔서 정답을 targetPos로 이동
    const correctIdx = currentAnswer - 1;
    const targetIdx = targetPos - 1;
    const choices = [...q.choices];

    // swap
    [choices[correctIdx], choices[targetIdx]] = [choices[targetIdx], choices[correctIdx]];

    // wrong explanations의 키도 업데이트
    if (q.explanations && q.explanations.wrong) {
      const oldWrong = { ...q.explanations.wrong };
      const newWrong = {};

      // 매핑: 기존 위치 → 새 위치
      const posMap = {};
      for (let i = 0; i < 5; i++) posMap[i] = i;
      posMap[correctIdx] = targetIdx;
      posMap[targetIdx] = correctIdx;

      for (const [oldKey, text] of Object.entries(oldWrong)) {
        const oldIdx = parseInt(oldKey) - 1;
        const newIdx = posMap[oldIdx] !== undefined ? posMap[oldIdx] : oldIdx;
        const newKey = String(newIdx + 1);
        // 해설 텍스트에서 번호 참조 업데이트
        let newText = text;
        const circledNums = ["①", "②", "③", "④", "⑤"];
        if (newText.startsWith(circledNums[oldIdx])) {
          newText = circledNums[newIdx] + newText.slice(1);
        }
        newWrong[newKey] = newText;
      }
      q.explanations.wrong = newWrong;
    }

    q.choices = choices;
    q.answer = targetPos;
    fileFixed++;
  }

  if (fileFixed > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    totalFixed += fileFixed;
    console.log(`${file}: ${fileFixed} questions repositioned`);
  } else {
    console.log(`${file}: already balanced`);
  }
}

console.log(`\nTotal repositioned: ${totalFixed}`);
