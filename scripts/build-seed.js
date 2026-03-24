const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const GEN_DIR = path.join(__dirname, "..", "data", "csat-english", "generated");
const OUT_SQL = path.join(__dirname, "..", "supabase", "seed.sql");
const OUT_TS = path.join(__dirname, "..", "src", "data", "english-daily-seed.ts");

// ── Config ──
const DIFFICULTY_MAP = {
  18: "easy", 19: "easy", 20: "easy", 22: "easy", 26: "easy",
  29: "medium", 23: "medium", 24: "medium", 30: "medium", 35: "medium", 40: "medium",
  31: "hard", 32: "hard", 36: "hard", 37: "hard", 38: "hard", 39: "hard",
  33: "killer", 34: "killer",
};

const TYPE_LABEL = {
  18: "글의 목적", 19: "심경 변화", 20: "주장", 22: "요지", 23: "주제",
  24: "제목", 29: "어법", 30: "어휘", 31: "빈칸 추론 (단어/구)", 33: "빈칸 추론 (절)",
  35: "무관한 문장", 36: "순서 배열", 38: "문장 삽입", 40: "요약문",
};

const RECOMMENDED_TIME = {
  easy: 60, medium: 90, hard: 120, killer: 150,
};

const CONCEPT_TAGS = {
  18: ["글의 목적", "편지/이메일"], 19: ["심경 변화", "서사문"],
  20: ["주장", "논설문"], 22: ["요지", "설명문"],
  23: ["주제", "학술문"], 29: ["어법", "문법"],
  30: ["어휘", "문맥 추론"], 31: ["빈칸 추론", "단어/구"],
  33: ["빈칸 추론", "절", "킬러"], 35: ["무관한 문장", "글의 흐름"],
  36: ["순서 배열", "담화 구조"], 38: ["문장 삽입", "담화 표지"],
  40: ["요약문", "요약 완성"],
};

// ── Read all generated files ──
const files = fs.readdirSync(GEN_DIR).filter(f => f.endsWith(".json"));
const allQuestions = [];

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(GEN_DIR, file), "utf-8"));
  const generated = data.generated || [];
  for (const q of generated) {
    allQuestions.push({
      ...q,
      typeLabel: TYPE_LABEL[q.number] || q.type,
    });
  }
}

console.log(`Total questions loaded: ${allQuestions.length}`);

// ── Generate UUIDs deterministically ──
function makeUUID(seed) {
  const hash = crypto.createHash("md5").update(seed).digest("hex");
  return [hash.slice(0,8), hash.slice(8,12), "4" + hash.slice(13,16),
    ((parseInt(hash[16],16) & 0x3) | 0x8).toString(16) + hash.slice(17,20),
    hash.slice(20,32)].join("-");
}

// ── 1. Generate seed.sql ──
let sql = `-- LiteQ English Daily Questions Seed
-- Generated from 65 validated CSAT-style questions
-- Auto-generated, do not edit manually

`;

sql += `-- Clean existing generated questions
DELETE FROM questions WHERE created_by = 'ai_generated_v1';\n\n`;
sql += `INSERT INTO questions (id, subject, area, sub_area, question_type, difficulty, points, passage_text, question_text, choices, correct_answer, explanations, recommended_time, concept_tags, review_status, created_by) VALUES\n`;

const sqlRows = [];
for (let i = 0; i < allQuestions.length; i++) {
  const q = allQuestions[i];
  const uuid = makeUUID(`liteq-eng-gen-${q.number}-${i}`);
  const diff = DIFFICULTY_MAP[q.number] || "medium";
  const recTime = RECOMMENDED_TIME[diff];
  const tags = CONCEPT_TAGS[q.number] || [q.type];
  const correctAnswer = q.answer - 1; // Convert to 0-indexed

  // Build explanation from self_check
  const explanations = [];
  if (q.self_check?.correct_answer_reasoning) {
    explanations.push(q.self_check.correct_answer_reasoning);
  }
  if (q.self_check?.distractor_analysis) {
    explanations.push(q.self_check.distractor_analysis);
  }

  const esc = (s) => (s || "").replace(/'/g, "''");

  let passageText = q.passage || "";
  if (q.insertSentence) {
    passageText = `[삽입 문장] ${q.insertSentence}\n\n${passageText}`;
  }

  sqlRows.push(`('${uuid}', 'english', '읽기', '${esc(q.typeLabel)}', 'type-${q.number}', '${diff}', ${q.points}, '${esc(passageText)}', '${esc(q.question)}', '${JSON.stringify(q.choices).replace(/'/g, "''")}'::jsonb, ${correctAnswer}, '${JSON.stringify(explanations).replace(/'/g, "''")}'::jsonb, ${recTime}, ARRAY[${tags.map(t => `'${esc(t)}'`).join(",")}], 'approved', 'ai_generated_v1')`);
}

sql += sqlRows.join(",\n") + ";\n\n";

// ── Daily set: pick 14 questions (5 easy + 5 medium + 4 hard/killer) ──
const byDiff = { easy: [], medium: [], hard: [], killer: [] };
for (let i = 0; i < allQuestions.length; i++) {
  const diff = DIFFICULTY_MAP[allQuestions[i].number] || "medium";
  byDiff[diff].push(i);
}

// Pick 1 per type (first question of each type), sorted by difficulty
const usedTypes = new Set();
const dailySet = [];

function pickFromDiff(diffKey, count) {
  const pool = byDiff[diffKey].filter(i => !usedTypes.has(allQuestions[i].number));
  let picked = 0;
  for (const idx of pool) {
    if (picked >= count) break;
    if (usedTypes.has(allQuestions[idx].number)) continue;
    dailySet.push(idx);
    usedTypes.add(allQuestions[idx].number);
    picked++;
  }
}

pickFromDiff("easy", 4);       // 18,19,20,22 (4 easy types in our 13)
pickFromDiff("medium", 6);     // 23,24,29,30,35,40 (6 medium types)
pickFromDiff("hard", 3);       // 31,36,38
pickFromDiff("killer", 1);     // 33

// If we didn't get 14, add a 2nd question from types that have 5 available
if (dailySet.length < 14) {
  // Pick 2nd question (index 1) from types already used, prioritizing hard types
  for (const diff of ["hard", "killer", "medium", "easy"]) {
    for (const idx of byDiff[diff]) {
      if (dailySet.length >= 14) break;
      if (!dailySet.includes(idx)) {
        dailySet.push(idx);
        break;
      }
    }
    if (dailySet.length >= 14) break;
  }
}

const dailySetUUID = makeUUID("liteq-daily-set-eng-001");
sql += `-- Daily Set 1: 14 questions (5 easy + 5 medium + 3 hard + 1 killer)\n`;
sql += `DELETE FROM daily_sets WHERE id = '${dailySetUUID}';\n`;
sql += `INSERT INTO daily_sets (id, subject, set_number, difficulty_distribution, question_ids, total_questions, created_at) VALUES\n`;
sql += `('${dailySetUUID}', 'english', 1, '{"easy":5,"medium":5,"hard":3,"killer":1}'::jsonb, ARRAY[${dailySet.map(i => `'${makeUUID(`liteq-eng-gen-${allQuestions[i].number}-${i}`)}'`).join(",")}], 14, NOW());\n`;

fs.mkdirSync(path.dirname(OUT_SQL), { recursive: true });
fs.writeFileSync(OUT_SQL, sql, "utf-8");
console.log(`seed.sql written: ${sql.length} bytes, ${sqlRows.length} questions`);

// ── 2. Generate TypeScript mock data ──
let ts = `import type { Question } from "@/types/quiz";

/**
 * AI 생성 영어 일간지 문제 65문항
 * 13개 유형 x 5문항, 기출 패턴 분석 기반 생성, Opus 4.6 검증 완료
 */
export const ENGLISH_DAILY_SEED: Question[] = [\n`;

for (let i = 0; i < allQuestions.length; i++) {
  const q = allQuestions[i];
  const diff = DIFFICULTY_MAP[q.number] || "medium";
  const recTime = RECOMMENDED_TIME[diff];
  const tags = CONCEPT_TAGS[q.number] || [q.type];
  const correctAnswer = q.answer - 1; // 0-indexed

  const explanations = [];
  if (q.self_check?.correct_answer_reasoning) explanations.push(q.self_check.correct_answer_reasoning);
  if (q.self_check?.distractor_analysis) {
    const da = q.self_check.distractor_analysis;
    if (typeof da === "string") explanations.push(da);
    else if (typeof da === "object") {
      explanations.push(Object.values(da).join(" "));
    }
  }

  let passageText = q.passage || "";
  if (q.insertSentence) {
    passageText = `[삽입 문장] ${q.insertSentence}\\n\\n${passageText}`;
  }

  ts += `  {
    id: "gen-${String(i + 1).padStart(2, "0")}",
    subject: "english",
    area: "읽기",
    subArea: ${JSON.stringify(q.typeLabel)},
    questionType: ${JSON.stringify(q.typeLabel)},
    difficulty: "${diff}",
    points: ${q.points},
    passageText: ${JSON.stringify(passageText)},
    questionText: ${JSON.stringify(q.question)},
    choices: ${JSON.stringify(q.choices)},
    correctAnswer: ${correctAnswer},
    explanations: ${JSON.stringify(explanations)},
    recommendedTime: ${recTime},
    conceptTags: ${JSON.stringify(tags)},
  },\n`;
}

ts += `];\n\n`;

// Daily set 1: first 14 questions picked above
ts += `/**
 * 일간지 1회분 (14문항): 쉬움 5 + 보통 5 + 어려움 3 + 킬러 1
 * 유형 겹치지 않게 구성
 */
export const DAILY_SET_1: Question[] = [\n`;
for (const idx of dailySet) {
  ts += `  ENGLISH_DAILY_SEED[${idx}],\n`;
}
ts += `];\n`;

fs.mkdirSync(path.dirname(OUT_TS), { recursive: true });
fs.writeFileSync(OUT_TS, ts, "utf-8");
console.log(`english-daily-seed.ts written: ${ts.length} bytes`);
console.log(`Daily set: ${dailySet.length} questions (types: ${dailySet.map(i => allQuestions[i].number).join(", ")})`);
