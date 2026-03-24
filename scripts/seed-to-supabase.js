/**
 * Seed ALL subjects into Supabase questions table.
 *
 * Subjects handled:
 *   - english  (validated-v2 + generated) — 379 questions
 *   - korean   (generated) — 150 questions
 *   - ethics   (generated) — 50 questions
 *   - earthscience (generated) — 40 questions
 *
 * Usage: node scripts/seed-to-supabase.js
 *
 * Prerequisites: Run supabase/migrations/001_questions.sql first.
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// .env.local에서 직접 읽기
const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^=]+)=(.+)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── English-specific config ───────────────────────────────────────────
const V2_DIR = path.join(__dirname, "..", "data", "csat-english", "validated-v2");
const GEN_DIR = path.join(__dirname, "..", "data", "csat-english", "generated");

const TYPE_DIFFICULTY = {
  18: "easy", 19: "easy", 20: "easy", 22: "easy",
  23: "medium", 29: "medium", 30: "medium",
  31: "hard", 33: "killer", 35: "medium",
  36: "hard", 38: "hard", 40: "medium",
};

const TYPE_SUB_AREA = {
  18: "글의 목적", 19: "심경 변화", 20: "주장", 22: "요지",
  23: "주제", 29: "어법", 30: "어휘",
  31: "빈칸 추론 (단어/구)", 33: "빈칸 추론 (절)",
  35: "무관한 문장", 36: "순서 배열", 38: "문장 삽입", 40: "요약문",
};

const TYPE_TIME = {
  18: 60, 19: 90, 20: 60, 22: 60, 23: 60,
  29: 90, 30: 90, 31: 120, 33: 150,
  35: 90, 36: 120, 38: 120, 40: 120,
};

const DIFF_NORMALIZE = {
  easy: "easy", standard: "medium", medium: "medium",
  hard: "hard", challenging: "hard", killer: "killer",
};

// ─── New subjects config ───────────────────────────────────────────────
const NEW_SUBJECTS = [
  {
    dirName: "csat-korean",
    subjectOverride: "korean",      // use as-is from file
    defaultTime: 120,
  },
  {
    dirName: "csat-ethics",
    subjectOverride: "ethics",
    defaultTime: 90,
  },
  {
    dirName: "csat-earthsci",
    subjectOverride: "earthscience", // map earthsci → earthscience
    defaultTime: 90,
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────

function normalizeAnswer(answer) {
  return answer >= 1 && answer <= 5 ? answer - 1 : answer;
}

// ─── English loaders (existing logic) ──────────────────────────────────

function loadV2() {
  const rows = [];
  const files = fs.readdirSync(V2_DIR).filter(f => f.endsWith(".json"));
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(V2_DIR, file), "utf8"));
    const typeNum = data.typeNumber;
    for (const q of data.questions) {
      rows.push({
        id: crypto.randomUUID(),
        subject: "english",
        area: "읽기",
        sub_area: q.type || TYPE_SUB_AREA[typeNum],
        question_type: `type-${typeNum}`,
        difficulty: DIFF_NORMALIZE[q.difficulty] || DIFF_NORMALIZE[TYPE_DIFFICULTY[typeNum]] || "medium",
        points: q.points || 2,
        passage_text: q.passage || null,
        question_text: q.question,
        choices: q.choices,
        correct_answer: normalizeAnswer(q.answer),
        explanations: q.explanations || null,
        recommended_time: TYPE_TIME[typeNum] || 90,
        concept_tags: [q.type || TYPE_SUB_AREA[typeNum]],
        review_status: "approved",
        created_by: "validated_v2",
      });
    }
  }
  return rows;
}

function loadGenerated() {
  const rows = [];
  const files = fs.readdirSync(GEN_DIR).filter(f => f.endsWith(".json"));
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(GEN_DIR, file), "utf8"));
    const typeNum = data.typeNumber;
    const qs = data.generated || [];
    for (const q of qs) {
      rows.push({
        id: crypto.randomUUID(),
        subject: "english",
        area: "읽기",
        sub_area: q.type || TYPE_SUB_AREA[typeNum],
        question_type: `type-${typeNum}`,
        difficulty: DIFF_NORMALIZE[q.difficulty] || DIFF_NORMALIZE[TYPE_DIFFICULTY[typeNum]] || "medium",
        points: q.points || 2,
        passage_text: q.passage || null,
        question_text: q.question,
        choices: q.choices,
        correct_answer: normalizeAnswer(q.answer),
        explanations: q.explanations || null,
        recommended_time: TYPE_TIME[typeNum] || 90,
        concept_tags: [q.type || TYPE_SUB_AREA[typeNum]],
        review_status: "approved",
        created_by: "ai_generated_v1",
      });
    }
  }
  return rows;
}

// ─── New subjects loader ───────────────────────────────────────────────

function loadNewSubject({ dirName, subjectOverride, defaultTime }) {
  const dir = path.join(__dirname, "..", "data", dirName, "generated");
  if (!fs.existsSync(dir)) {
    console.warn(`  Warning: directory not found — ${dir}`);
    return [];
  }

  const rows = [];
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
    const subject = subjectOverride || data.subject;
    const area = data.area;
    const typeNum = data.typeNumber;
    const qs = data.questions || [];

    for (const q of qs) {
      rows.push({
        id: crypto.randomUUID(),
        subject,
        area,
        sub_area: q.type,
        question_type: `type-${typeNum}`,
        difficulty: DIFF_NORMALIZE[q.difficulty] || "medium",
        points: q.points || 2,
        passage_text: q.passage || null,
        question_text: q.question,
        choices: q.choices,
        correct_answer: normalizeAnswer(q.answer),
        explanations: q.explanations || null,
        recommended_time: defaultTime,
        concept_tags: [q.type],
        review_status: "approved",
        created_by: "generated_v1",
      });
    }
  }

  return rows;
}

// ─── Main ──────────────────────────────────────────────────────────────

async function main() {
  console.log("Loading question data...\n");

  // English
  const v2 = loadV2();
  const gen = loadGenerated();
  console.log(`  english  validated-v2: ${v2.length}`);
  console.log(`  english  generated:    ${gen.length}`);

  // New subjects
  const newSubjectRows = {};
  for (const cfg of NEW_SUBJECTS) {
    const rows = loadNewSubject(cfg);
    newSubjectRows[cfg.subjectOverride] = rows;
    console.log(`  ${cfg.subjectOverride.padEnd(14)} generated:    ${rows.length}`);
  }

  const allEnglish = [...v2, ...gen];
  const allNew = Object.values(newSubjectRows).flat();
  const all = [...allEnglish, ...allNew];
  console.log(`\n  Total to insert: ${all.length}\n`);

  // ── Delete existing seeded data ──────────────────────────────────────
  console.log("Cleaning existing seeded data...");

  // English: delete by validated_v2 and ai_generated_v1
  const { error: delEnErr } = await supabase
    .from("questions")
    .delete()
    .in("created_by", ["validated_v2", "ai_generated_v1"]);

  if (delEnErr) {
    console.error("  Delete english error:", delEnErr.message);
  } else {
    console.log("  Deleted existing english seeds (validated_v2 + ai_generated_v1)");
  }

  // New subjects: delete by generated_v1
  const { error: delNewErr } = await supabase
    .from("questions")
    .delete()
    .eq("created_by", "generated_v1");

  if (delNewErr) {
    console.error("  Delete new subjects error:", delNewErr.message);
  } else {
    console.log("  Deleted existing new subject seeds (generated_v1)");
  }

  // ── Batch INSERT ─────────────────────────────────────────────────────
  console.log("\nInserting questions...");
  const BATCH = 100;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < all.length; i += BATCH) {
    const batch = all.slice(i, i + BATCH);
    const { error } = await supabase.from("questions").insert(batch);

    if (error) {
      console.error(`  Batch ${Math.floor(i / BATCH) + 1} error:`, error.message);
      errors++;
    } else {
      inserted += batch.length;
      process.stdout.write(`  Inserted ${inserted}/${all.length}\r`);
    }
  }

  console.log(`\nDone! Inserted: ${inserted}, Batch errors: ${errors}`);

  // ── Verification ─────────────────────────────────────────────────────
  console.log("\nVerification:");

  const { count: total } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true });
  console.log(`  Total questions in DB: ${total}`);

  // Per-subject counts
  for (const subj of ["english", "korean", "ethics", "earthscience"]) {
    const { count } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("subject", subj);
    console.log(`    ${subj.padEnd(14)}: ${count}`);
  }
}

main().catch(console.error);
