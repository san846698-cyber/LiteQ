/**
 * validated-v2 + generated 문항을 supabase/seed.sql로 변환
 *
 * - answer를 0-indexed로 통일
 * - explanations를 JSONB 구조 그대로 저장
 * - generated 문항에는 difficulty/id가 없으므로 자동 할당
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const V2_DIR = path.join(__dirname, '..', 'data', 'csat-english', 'validated-v2');
const GEN_DIR = path.join(__dirname, '..', 'data', 'csat-english', 'generated');
const OUT_FILE = path.join(__dirname, '..', 'supabase', 'seed.sql');

// 유형번호 → 난이도 매핑 (generated용, 수능 기준)
const TYPE_DIFFICULTY = {
  18: 'easy',    // 글의 목적
  19: 'easy',    // 심경 변화
  20: 'easy',    // 주장
  22: 'easy',    // 요지
  23: 'medium',  // 주제
  29: 'medium',  // 어법
  30: 'medium',  // 어휘
  31: 'hard',    // 빈칸 단어/구
  33: 'killer',  // 빈칸 절
  35: 'medium',  // 무관한 문장
  36: 'hard',    // 순서 배열
  38: 'hard',    // 문장 삽입
  40: 'medium',  // 요약문
};

// 유형번호 → sub_area 매핑
const TYPE_SUB_AREA = {
  18: '글의 목적',
  19: '심경 변화',
  20: '주장',
  22: '요지',
  23: '주제',
  29: '어법',
  30: '어휘',
  31: '빈칸 추론 (단어/구)',
  33: '빈칸 추론 (절)',
  35: '무관한 문장',
  36: '순서 배열',
  38: '문장 삽입',
  40: '요약문',
};

// 유형번호 → 권장시간 (초)
const TYPE_TIME = {
  18: 60, 19: 90, 20: 60, 22: 60, 23: 60,
  29: 90, 30: 90, 31: 120, 33: 150,
  35: 90, 36: 120, 38: 120, 40: 120,
};

function generateUUID() {
  return crypto.randomUUID();
}

function escapeSQL(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + str.replace(/'/g, "''") + "'";
}

function toJSONB(obj) {
  if (obj === null || obj === undefined) return 'NULL';
  return escapeSQL(JSON.stringify(obj));
}

/**
 * validated-v2 문항에서 answer가 1-indexed인지 확인하고 0-indexed로 변환
 * v2 데이터: answer=1 → 첫 번째 선택지 (0-indexed: 0)
 */
function normalizeAnswer(answer) {
  // v2 데이터는 1-indexed (1~5)
  // DB에는 0-indexed (0~4)로 저장
  if (answer >= 1 && answer <= 5) {
    return answer - 1;
  }
  return answer; // 이미 0-indexed인 경우
}

// difficulty 정규화: standard→medium, challenging→hard
const DIFFICULTY_NORMALIZE = {
  easy: 'easy',
  standard: 'medium',
  medium: 'medium',
  hard: 'hard',
  challenging: 'hard',
  killer: 'killer',
};

function normalizeDifficulty(diff) {
  return DIFFICULTY_NORMALIZE[diff] || 'medium';
}

function processV2Files() {
  const questions = [];
  const files = fs.readdirSync(V2_DIR).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(V2_DIR, file), 'utf8'));
    const typeNum = data.typeNumber;

    for (const q of data.questions) {
      questions.push({
        id: generateUUID(),
        subject: 'english',
        area: '읽기',
        sub_area: q.type || TYPE_SUB_AREA[typeNum],
        question_type: `type-${typeNum}`,
        difficulty: normalizeDifficulty(q.difficulty || TYPE_DIFFICULTY[typeNum] || 'medium'),
        points: q.points || 2,
        passage_text: q.passage || null,
        question_text: q.question,
        choices: q.choices,
        correct_answer: normalizeAnswer(q.answer),
        explanations: q.explanations || null,
        recommended_time: TYPE_TIME[typeNum] || 90,
        concept_tags: [q.type || TYPE_SUB_AREA[typeNum]],
        created_by: 'validated_v2',
      });
    }
  }

  return questions;
}

function processGeneratedFiles() {
  const questions = [];
  const files = fs.readdirSync(GEN_DIR).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(GEN_DIR, file), 'utf8'));
    const typeNum = data.typeNumber;
    const qs = data.generated || [];

    for (let i = 0; i < qs.length; i++) {
      const q = qs[i];
      questions.push({
        id: generateUUID(),
        subject: 'english',
        area: '읽기',
        sub_area: q.type || TYPE_SUB_AREA[typeNum],
        question_type: `type-${typeNum}`,
        difficulty: normalizeDifficulty(q.difficulty || TYPE_DIFFICULTY[typeNum] || 'medium'),
        points: q.points || 2,
        passage_text: q.passage || null,
        question_text: q.question,
        choices: q.choices,
        correct_answer: normalizeAnswer(q.answer),
        explanations: q.explanations || null,
        recommended_time: TYPE_TIME[typeNum] || 90,
        concept_tags: [q.type || TYPE_SUB_AREA[typeNum]],
        created_by: 'ai_generated_v1',
      });
    }
  }

  return questions;
}

function generateInsert(q) {
  const tags = q.concept_tags
    ? `ARRAY[${q.concept_tags.map(t => escapeSQL(t)).join(',')}]`
    : 'NULL';

  return `(${escapeSQL(q.id)}, ${escapeSQL(q.subject)}, ${escapeSQL(q.area)}, ${escapeSQL(q.sub_area)}, ${escapeSQL(q.question_type)}, ${escapeSQL(q.difficulty)}, ${q.points}, ${q.passage_text !== null ? escapeSQL(q.passage_text) : 'NULL'}, ${escapeSQL(q.question_text)}, ${toJSONB(q.choices)}::jsonb, ${q.correct_answer}, ${toJSONB(q.explanations)}::jsonb, ${q.recommended_time}, ${tags}, ${escapeSQL('approved')}, ${escapeSQL(q.created_by)})`;
}

function main() {
  console.log('Processing validated-v2 files...');
  const v2Questions = processV2Files();
  console.log(`  → ${v2Questions.length} questions`);

  console.log('Processing generated files...');
  const genQuestions = processGeneratedFiles();
  console.log(`  → ${genQuestions.length} questions`);

  const allQuestions = [...v2Questions, ...genQuestions];
  console.log(`Total: ${allQuestions.length} questions`);

  // 난이도 분포
  const diffCount = {};
  for (const q of allQuestions) {
    diffCount[q.difficulty] = (diffCount[q.difficulty] || 0) + 1;
  }
  console.log('Difficulty distribution:', diffCount);

  // 유형 분포
  const typeCount = {};
  for (const q of allQuestions) {
    typeCount[q.sub_area] = (typeCount[q.sub_area] || 0) + 1;
  }
  console.log('Type distribution:', typeCount);

  // SQL 생성
  let sql = `-- LiteQ English Questions Seed
-- Auto-generated from validated-v2 (${v2Questions.length}) + generated (${genQuestions.length}) = ${allQuestions.length} questions
-- Generated at: ${new Date().toISOString()}
-- Answer indexing: 0-based (0~4)

-- Clean existing seeded questions
DELETE FROM questions WHERE created_by IN ('validated_v2', 'ai_generated_v1');

INSERT INTO questions (id, subject, area, sub_area, question_type, difficulty, points, passage_text, question_text, choices, correct_answer, explanations, recommended_time, concept_tags, review_status, created_by) VALUES\n`;

  const values = allQuestions.map(q => generateInsert(q));
  sql += values.join(',\n') + ';\n';

  fs.writeFileSync(OUT_FILE, sql, 'utf8');
  console.log(`\nSeed SQL written to: ${OUT_FILE}`);
  console.log(`File size: ${(Buffer.byteLength(sql) / 1024).toFixed(1)} KB`);
}

main();
