/**
 * 모든 과목의 JSON 문항 데이터를 TypeScript seed 파일로 변환
 * → src/data/{subject}-seed.ts 생성
 *
 * Usage: node scripts/build-local-seeds.js
 */

const fs = require("fs");
const path = require("path");

const SUBJECTS = [
  {
    key: "korean",
    dir: "data/csat-korean/generated-v2",
    subject: "korean",
    area: null, // file-level area 사용
    defaultTime: 120,
  },
  {
    key: "english-v2",
    dir: "data/csat-english/validated-v2",
    subject: "english",
    area: "읽기",
    defaultTime: 90,
  },
  {
    key: "english-gen",
    dir: "data/csat-english/generated",
    subject: "english",
    area: "읽기",
    defaultTime: 90,
  },
  {
    key: "ethics",
    dir: "data/csat-ethics/generated",
    subject: "ethics",
    area: null,
    defaultTime: 90,
  },
  {
    key: "earthscience",
    dir: "data/csat-earthsci/generated",
    subject: "earthscience",
    area: null,
    defaultTime: 90,
  },
];

const DIFF_NORMALIZE = {
  easy: "easy",
  standard: "medium",
  medium: "medium",
  hard: "hard",
  challenging: "hard",
  killer: "killer",
};

function loadQuestions(cfg) {
  const dir = path.join(__dirname, "..", cfg.dir);
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const questions = [];

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
    const typeNum = data.typeNumber;
    const fileArea = data.area || cfg.area || "";
    const qs = data.questions || data.generated || [];

    for (const q of qs) {
      const answer = q.answer >= 1 && q.answer <= 5 ? q.answer - 1 : q.answer;
      const difficulty = DIFF_NORMALIZE[q.difficulty] || "medium";

      questions.push({
        id: q.id || `${cfg.subject}-${typeNum}-${questions.length}`,
        subject: cfg.subject,
        area: fileArea,
        subArea: q.type || "",
        questionType: `type-${typeNum}`,
        difficulty,
        points: q.points || 2,
        passageText: q.passage || null,
        questionText: q.question,
        choices: q.choices,
        correctAnswer: answer,
        explanations: q.explanations || [],
        recommendedTime: cfg.defaultTime,
        conceptTags: [q.type || ""],
      });
    }
  }

  return questions;
}

function writeTS(outPath, varName, questions) {
  const json = JSON.stringify(questions, null, 2);
  const content = `import type { Question } from "@/types/quiz";

/** Auto-generated from JSON data — ${questions.length} questions */
export const ${varName}: Question[] = ${json} as Question[];
`;
  fs.writeFileSync(outPath, content, "utf8");
  console.log(`  ${outPath}: ${questions.length} questions`);
}

// Main
console.log("Building local seed files...\n");

const outDir = path.join(__dirname, "..", "src", "data");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// English: merge v2 + gen
const engV2 = loadQuestions(SUBJECTS.find((s) => s.key === "english-v2"));
const engGen = loadQuestions(SUBJECTS.find((s) => s.key === "english-gen"));
const english = [...engV2, ...engGen];
writeTS(path.join(outDir, "english-seed.ts"), "ENGLISH_SEED", english);

// Korean
const korean = loadQuestions(SUBJECTS.find((s) => s.key === "korean"));
writeTS(path.join(outDir, "korean-seed.ts"), "KOREAN_SEED", korean);

// Ethics
const ethics = loadQuestions(SUBJECTS.find((s) => s.key === "ethics"));
writeTS(path.join(outDir, "ethics-seed.ts"), "ETHICS_SEED", ethics);

// Earth Science
const earthsci = loadQuestions(SUBJECTS.find((s) => s.key === "earthscience"));
writeTS(path.join(outDir, "earthscience-seed.ts"), "EARTHSCIENCE_SEED", earthsci);

console.log(`\nTotal: ${english.length + korean.length + ethics.length + earthsci.length} questions`);
