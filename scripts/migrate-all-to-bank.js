/**
 * 전 과목 문제 은행 마이그레이션
 * 국어 215 + 영어 379 + 생윤 50 + 지구과학 40 = 684문항
 * → question_bank/{subject}/questions.json
 */

const fs = require("fs");
const path = require("path");

const BASE = path.join(__dirname, "..");
const BANK = path.join(BASE, "data/question_bank");

// ── 유틸 ──
function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

function wordCount(text) {
  if (!text) return 0;
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

// ── 국어 ──
function migrateKorean() {
  const seedFile = path.join(BASE, "src/data/korean-seed.ts");
  const content = fs.readFileSync(seedFile, "utf8");
  // Extract JSON array from TS
  const match = content.match(/\: Question\[\] = (\[[\s\S]*\]) as Question\[\]/);
  if (!match) { console.error("Cannot parse korean-seed.ts"); return []; }
  const questions = JSON.parse(match[1]);

  const TOPIC_SHORT = {
    "내용일치": "match", "추론": "infer", "어휘의미": "vocab", "비판평가": "critic",
    "구조전개": "struct", "내용이해": "understand", "외적준거적용": "external",
    "작품비교": "compare", "시어해석": "imagery", "표현상특징": "express",
    "서술자시점": "narrator", "화법전략": "speech", "작문원리": "writing",
    "문장구조": "syntax", "담화매체": "discourse", "음운변동": "phonology",
  };

  const counters = {};
  const records = [];
  let passageCounter = 0;

  for (const q of questions) {
    const area = q.area || "";
    let passageType = "reading";
    if (area.includes("문학")) passageType = "literature";
    else if (area.includes("선택")) passageType = "select";

    const subArea = q.subArea || q.questionType || "";
    const topicShort = TOPIC_SHORT[subArea] || subArea.replace(/[^a-z]/gi, "").slice(0, 10) || "misc";
    const diff = q.difficulty === "easy" ? 1 : q.difficulty === "medium" ? 2 : q.difficulty === "hard" ? 3 : q.difficulty === "killer" ? 4 : 2;

    const key = `${topicShort}_d${diff}`;
    counters[key] = (counters[key] || 0) + 1;
    const seq = String(counters[key]).padStart(3, "0");
    const qid = `kr_${topicShort}_d${diff}_${seq}`;

    passageCounter++;
    const passageId = q.passageText ? `kr_passage_${String(passageCounter).padStart(3, "0")}` : null;

    // Extract tags from subArea + area
    const tags = [subArea, area].filter(Boolean);
    if (q.conceptTags) tags.push(...q.conceptTags);

    // Explanations handling
    let explanations = null;
    if (q.explanations && typeof q.explanations === "object" && q.explanations.correct) {
      explanations = q.explanations;
    }

    records.push({
      qid,
      subject: "국어",
      unit: area || "국어",
      topic: subArea || "",
      subtype: subArea || "기타",
      diff,
      pts: q.points || 2,
      mode: "choice",
      rec_time: q.recommendedTime ? `${Math.floor(q.recommendedTime / 60)}:${String(q.recommendedTime % 60).padStart(2, "0")}` : "2:00",
      stem: q.questionText || "",
      passage: q.passageText || null,
      passage_type: passageType,
      passage_meta: subArea,
      passage_id: passageId,
      opts: q.choices ? q.choices.map((c, i) => `${["①","②","③","④","⑤"][i]} ${c}`) : null,
      ans: String(q.correctAnswer),
      ans_index: q.correctAnswer,
      solution: explanations ? explanations.correct : "",
      explanations: explanations,
      solTex: null,
      solNote: explanations ? explanations.key_point : null,
      tags: [...new Set(tags)],
      status: "approved",
      source: `korean-seed`,
      source_id: q.id,
      created_at: "2026-03-26",
      used_count: 0,
      last_used: null,
    });
  }

  return records;
}

// ── 영어 ──
function migrateEnglish() {
  const seedFile = path.join(BASE, "src/data/english-seed.ts");
  const content = fs.readFileSync(seedFile, "utf8");
  const match = content.match(/\: Question\[\] = (\[[\s\S]*\]) as Question\[\]/);
  if (!match) { console.error("Cannot parse english-seed.ts"); return []; }
  const questions = JSON.parse(match[1]);

  const TYPE_SHORT = {
    "type-18": "purpose", "type-19": "mood", "type-20": "claim",
    "type-22": "gist", "type-23": "topic", "type-29": "grammar",
    "type-30": "vocab", "type-31": "blank_word", "type-33": "blank_clause",
    "type-35": "irrelevant", "type-36": "order", "type-38": "insertion",
    "type-40": "summary",
  };

  const counters = {};
  const records = [];
  let passageCounter = 0;

  for (const q of questions) {
    const typeShort = TYPE_SHORT[q.questionType] || q.questionType || "misc";
    const diff = q.difficulty === "easy" ? 1 : q.difficulty === "medium" ? 2 : q.difficulty === "hard" ? 3 : q.difficulty === "killer" ? 4 : 2;

    const key = `${typeShort}_d${diff}`;
    counters[key] = (counters[key] || 0) + 1;
    const seq = String(counters[key]).padStart(3, "0");
    const qid = `en_${typeShort}_d${diff}_${seq}`;

    passageCounter++;
    const passageId = q.passageText ? `en_passage_${String(passageCounter).padStart(3, "0")}` : null;

    const tags = [q.subArea || "", q.questionType || ""].filter(Boolean);
    if (q.conceptTags) tags.push(...q.conceptTags);

    let explanations = null;
    if (q.explanations && typeof q.explanations === "object" && q.explanations.correct) {
      explanations = q.explanations;
    }

    records.push({
      qid,
      subject: "영어",
      unit: q.area || "읽기",
      topic: q.subArea || "",
      subtype: typeShort,
      diff,
      pts: q.points || 2,
      mode: "choice",
      rec_time: q.recommendedTime ? `${Math.floor(q.recommendedTime / 60)}:${String(q.recommendedTime % 60).padStart(2, "0")}` : "1:30",
      stem: q.questionText || "",
      passage: q.passageText || null,
      passage_type: "reading",
      passage_meta: q.subArea || "",
      passage_id: passageId,
      word_count: wordCount(q.passageText),
      opts: q.choices ? q.choices.map((c, i) => `${["①","②","③","④","⑤"][i]} ${c}`) : null,
      ans: String(q.correctAnswer),
      ans_index: q.correctAnswer,
      solution: explanations ? explanations.correct : "",
      explanations: explanations,
      solTex: null,
      solNote: explanations ? explanations.key_point : null,
      tags: [...new Set(tags)],
      status: "approved",
      source: "english-seed",
      source_id: q.id,
      created_at: "2026-03-26",
      used_count: 0,
      last_used: null,
    });
  }

  return records;
}

// ── 생활과윤리 ──
function migrateEthics() {
  const seedFile = path.join(BASE, "src/data/ethics-seed.ts");
  const content = fs.readFileSync(seedFile, "utf8");
  const match = content.match(/\: Question\[\] = (\[[\s\S]*\]) as Question\[\]/);
  if (!match) { console.error("Cannot parse ethics-seed.ts"); return []; }
  const questions = JSON.parse(match[1]);

  const counters = {};
  const records = [];

  for (const q of questions) {
    const subArea = q.subArea || q.questionType || "기타";
    const topicShort = subArea.replace(/\s/g, "_").slice(0, 15) || "misc";
    const diff = q.difficulty === "easy" ? 1 : q.difficulty === "medium" ? 2 : q.difficulty === "hard" ? 3 : q.difficulty === "killer" ? 4 : 2;

    const key = `${topicShort}_d${diff}`;
    counters[key] = (counters[key] || 0) + 1;
    const seq = String(counters[key]).padStart(3, "0");
    const qid = `ethics_${topicShort}_d${diff}_${seq}`;

    const tags = [subArea].filter(Boolean);
    if (q.conceptTags) tags.push(...q.conceptTags);

    // Extract thinker from passage/stem
    let thinker = null;
    const text = (q.passageText || "") + " " + (q.questionText || "");
    const thinkers = ["칸트", "밀", "벤담", "롤스", "아리스토텔레스", "공자", "맹자", "노자", "장자", "싱어", "레오폴드"];
    for (const t of thinkers) {
      if (text.includes(t)) { thinker = t; tags.push(t); break; }
    }

    let explanations = null;
    if (q.explanations && typeof q.explanations === "object" && q.explanations.correct) {
      explanations = q.explanations;
    }

    records.push({
      qid,
      subject: "생활과윤리",
      unit: q.area || "윤리",
      topic: subArea,
      subtype: subArea,
      diff,
      pts: q.points || 2,
      mode: "choice",
      rec_time: q.recommendedTime ? `${Math.floor(q.recommendedTime / 60)}:${String(q.recommendedTime % 60).padStart(2, "0")}` : "1:30",
      stem: q.questionText || "",
      passage: q.passageText || null,
      passage_id: q.passageText ? `eth_passage_${String(records.length + 1).padStart(3, "0")}` : null,
      thinker,
      opts: q.choices ? q.choices.map((c, i) => `${["①","②","③","④","⑤"][i]} ${c}`) : null,
      ans: String(q.correctAnswer),
      ans_index: q.correctAnswer,
      solution: explanations ? explanations.correct : "",
      explanations: explanations,
      solTex: null,
      solNote: explanations ? explanations.key_point : null,
      tags: [...new Set(tags)],
      status: "approved",
      source: "ethics-seed",
      source_id: q.id,
      created_at: "2026-03-26",
      used_count: 0,
      last_used: null,
    });
  }

  return records;
}

// ── 지구과학 ──
function migrateEarthScience() {
  const seedFile = path.join(BASE, "src/data/earthscience-seed.ts");
  const content = fs.readFileSync(seedFile, "utf8");
  const match = content.match(/\: Question\[\] = (\[[\s\S]*\]) as Question\[\]/);
  if (!match) { console.error("Cannot parse earthscience-seed.ts"); return []; }
  const questions = JSON.parse(match[1]);

  const counters = {};
  const records = [];

  for (const q of questions) {
    const subArea = q.subArea || q.questionType || "기타";
    const topicShort = subArea.replace(/\s/g, "_").slice(0, 15) || "misc";
    const diff = q.difficulty === "easy" ? 1 : q.difficulty === "medium" ? 2 : q.difficulty === "hard" ? 3 : q.difficulty === "killer" ? 4 : 2;

    const key = `${topicShort}_d${diff}`;
    counters[key] = (counters[key] || 0) + 1;
    const seq = String(counters[key]).padStart(3, "0");
    const qid = `earth_${topicShort}_d${diff}_${seq}`;

    const tags = [subArea].filter(Boolean);
    if (q.conceptTags) tags.push(...q.conceptTags);

    // Check if visual content is referenced
    const text = (q.passageText || "") + " " + (q.questionText || "");
    const visualRequired = /그래프|도표|그림|HR도|H-R도|단면도/.test(text);

    let explanations = null;
    if (q.explanations && typeof q.explanations === "object" && q.explanations.correct) {
      explanations = q.explanations;
    }

    records.push({
      qid,
      subject: "지구과학1",
      unit: q.area || "지구과학",
      topic: subArea,
      subtype: subArea,
      diff,
      pts: q.points || 2,
      mode: "choice",
      rec_time: q.recommendedTime ? `${Math.floor(q.recommendedTime / 60)}:${String(q.recommendedTime % 60).padStart(2, "0")}` : "1:30",
      stem: q.questionText || "",
      passage: q.passageText || null,
      image_ref: null,
      image_desc: visualRequired ? "텍스트 기반 자료 설명 포함" : null,
      visual_required: visualRequired,
      opts: q.choices ? q.choices.map((c, i) => `${["①","②","③","④","⑤"][i]} ${c}`) : null,
      ans: String(q.correctAnswer),
      ans_index: q.correctAnswer,
      solution: explanations ? explanations.correct : "",
      explanations: explanations,
      solTex: null,
      solNote: explanations ? explanations.key_point : null,
      tags: [...new Set(tags)],
      status: "approved",
      source: "earthscience-seed",
      source_id: q.id,
      created_at: "2026-03-26",
      used_count: 0,
      last_used: null,
    });
  }

  return records;
}

// ── 메인 실행 ──
console.log("=== 전 과목 문제 은행 마이그레이션 ===\n");

const subjects = [
  { name: "국어", dir: "korean", fn: migrateKorean, expected: 215 },
  { name: "영어", dir: "english", fn: migrateEnglish, expected: 379 },
  { name: "생활과윤리", dir: "ethics", fn: migrateEthics, expected: 50 },
  { name: "지구과학1", dir: "earth_science", fn: migrateEarthScience, expected: 40 },
];

let grandTotal = 0;
const allQids = new Set();
const globalStats = {};

for (const sub of subjects) {
  const outDir = path.join(BANK, sub.dir);
  ensureDir(outDir);

  const records = sub.fn();
  grandTotal += records.length;

  // Save
  fs.writeFileSync(path.join(outDir, `${sub.dir === "earth_science" ? "earth" : sub.dir === "korean" ? "kr" : sub.dir}_questions.json`), JSON.stringify(records, null, 2), "utf8");

  // Validate
  const dupeQids = records.filter(r => allQids.has(r.qid)).map(r => r.qid);
  records.forEach(r => allQids.add(r.qid));

  const emptyTags = records.filter(r => !r.tags || r.tags.length === 0).length;
  const missingFields = records.filter(r => !r.qid || !r.subject || !r.stem || r.ans === undefined).length;
  const badAns = records.filter(r => r.mode === "choice" && (r.ans_index === null || r.ans_index === undefined || r.ans_index < 0 || r.ans_index > 4)).length;

  console.log(`${sub.name}: ${records.length}문항 (기대 ${sub.expected}) ${records.length === sub.expected ? "✓" : "⚠"}`);
  console.log(`  QID 중복: ${dupeQids.length}, 빈tags: ${emptyTags}, 필드누락: ${missingFields}, 정답범위: ${badAns}`);

  // Stats
  const stats = { total: records.length, byDiff: {}, bySubtype: {} };
  records.forEach(r => {
    stats.byDiff[r.diff] = (stats.byDiff[r.diff] || 0) + 1;
    stats.bySubtype[r.subtype] = (stats.bySubtype[r.subtype] || 0) + 1;
  });
  globalStats[sub.name] = stats;
}

// 수학 기존
const mathQs = JSON.parse(fs.readFileSync(path.join(BANK, "math/math_questions.json"), "utf8"));
mathQs.forEach(r => allQids.add(r.qid));
grandTotal += mathQs.length;
globalStats["수학"] = { total: mathQs.length };

console.log(`\n=== 전 과목 통합 ===`);
console.log(`총 문항: ${grandTotal} (수학 ${mathQs.length} + 나머지 ${grandTotal - mathQs.length})`);
console.log(`전체 QID 유일성: ${allQids.size === grandTotal ? "✓" : "⚠ 중복 " + (grandTotal - allQids.size) + "건"}`);

// Save global stats
fs.writeFileSync(path.join(BANK, "total_stats.json"), JSON.stringify({ grandTotal, allQidCount: allQids.size, bySubject: globalStats }, null, 2), "utf8");

console.log("\n완료.");
