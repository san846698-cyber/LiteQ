#!/usr/bin/env node
/**
 * LiteQ 스케줄러 — 993문항 문제 은행에서 자동 세트 조립
 *
 * Usage:
 *   node scheduler.js --stats
 *   node scheduler.js --check-shortage
 *   node scheduler.js --day mon
 *   node scheduler.js --day mon --save
 *   node scheduler.js --week 2026-03-23 --save
 */

const fs = require("fs");
const path = require("path");

// ── Question Bank ──
class QuestionBank {
  constructor() { this.questions = []; this._index = {}; }

  load(basePath) {
    this.questions = []; this._index = {};
    for (const dir of fs.readdirSync(basePath)) {
      const dp = path.join(basePath, dir);
      if (!fs.statSync(dp).isDirectory()) continue;
      for (const f of fs.readdirSync(dp)) {
        if (!f.endsWith("_questions.json")) continue;
        const data = JSON.parse(fs.readFileSync(path.join(dp, f), "utf8"));
        for (const q of data) { this.questions.push(q); this._index[q.qid] = q; }
      }
    }
    console.log(`Loaded ${this.questions.length} questions`);
  }

  filter({ subject, unit, diff, mode, excludeQids, excludeRecentDays } = {}) {
    return this.questions.filter(q => {
      if (subject && q.subject !== subject) return false;
      if (unit && !q.unit?.includes(unit)) return false;
      if (diff != null) {
        const diffs = Array.isArray(diff) ? diff : [diff];
        if (!diffs.includes(q.diff)) return false;
      }
      if (mode && q.mode !== mode) return false;
      if (excludeQids && excludeQids.has(q.qid)) return false;
      if (excludeRecentDays && q.last_used) {
        const days = (Date.now() - new Date(q.last_used).getTime()) / 86400000;
        if (days < excludeRecentDays) return false;
      }
      return q.status === "approved";
    });
  }

  getByTags(tags, { subject, excludeQids } = {}) {
    const tagSet = new Set(tags);
    return this.questions
      .filter(q => {
        if (subject && q.subject !== subject) return false;
        if (excludeQids && excludeQids.has(q.qid)) return false;
        return (q.tags || []).some(t => tagSet.has(t));
      })
      .sort((a, b) => (a.used_count || 0) - (b.used_count || 0));
  }

  markUsed(qid) {
    const q = this._index[qid];
    if (q) { q.used_count = (q.used_count || 0) + 1; q.last_used = new Date().toISOString().slice(0, 10); }
  }

  getStats() {
    const s = { total: this.questions.length, bySubject: {}, byDiff: {} };
    for (const q of this.questions) {
      s.bySubject[q.subject] = (s.bySubject[q.subject] || 0) + 1;
      s.byDiff[q.diff] = (s.byDiff[q.diff] || 0) + 1;
    }
    return s;
  }
}

// ── Shuffle ──
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Assembler ──
function assembleDailyOrMock(bank, config) {
  const usedQids = new Set();
  const topicCounts = {};
  const topicMax = config.topic_max_repeat || 99;
  const selected = [];

  for (const comp of config.composition || []) {
    const diffs = Array.isArray(comp.diff) ? comp.diff : [comp.diff];
    let candidates = bank.filter({
      subject: config.subject,
      diff: diffs,
      excludeQids: usedQids,
      excludeRecentDays: config.exclude_recent_days,
    });
    candidates = shuffle(candidates).sort((a, b) => (a.used_count || 0) - (b.used_count || 0));

    const modeMix = comp.mode_mix || {};
    const modeCounts = {};
    let picked = 0;

    for (const q of candidates) {
      if (picked >= comp.count) break;
      if (usedQids.has(q.qid)) continue;
      const topic = q.topic || "";
      if (topic && (topicCounts[topic] || 0) >= topicMax) continue;

      if (Object.keys(modeMix).length > 0) {
        const m = q.mode || "choice";
        if ((modeCounts[m] || 0) >= (modeMix[m] || 0)) continue;
        modeCounts[m] = (modeCounts[m] || 0) + 1;
      }

      selected.push(q);
      usedQids.add(q.qid);
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      picked++;
    }

    // Fill remaining if mode_mix was too strict
    if (picked < comp.count) {
      for (const q of candidates) {
        if (picked >= comp.count) break;
        if (usedQids.has(q.qid)) continue;
        selected.push(q);
        usedQids.add(q.qid);
        picked++;
      }
    }
  }

  if (config.sort_by_difficulty) {
    selected.sort((a, b) => (a.diff || 0) - (b.diff || 0));
  }

  return selected;
}

function assembleWeekly(bank, config, wrongTags = []) {
  const total = config.total;
  const wrongRatio = config.wrong_tag_ratio || 0.6;
  const usedQids = new Set();
  const selected = [];

  if (wrongTags.length > 0) {
    const wrongCount = Math.round(total * wrongRatio);
    const wrongCandidates = bank.getByTags(wrongTags, { subject: config.subject, excludeQids: usedQids });
    for (const q of wrongCandidates.slice(0, wrongCount)) {
      selected.push(q); usedQids.add(q.qid);
    }
  }

  const remaining = total - selected.length;
  if (remaining > 0) {
    const pool = shuffle(bank.filter({
      subject: config.subject, excludeQids: usedQids,
      excludeRecentDays: config.exclude_recent_days,
    }));
    for (const q of pool.slice(0, remaining)) {
      selected.push(q); usedQids.add(q.qid);
    }
  }

  if (config.sort_by_difficulty) selected.sort((a, b) => (a.diff || 0) - (b.diff || 0));
  return selected;
}

// ── Validator ──
function validateSet(questions, config) {
  const errors = [];
  if (questions.length !== config.total) errors.push(`문항 수: ${questions.length}/${config.total}`);

  for (const comp of config.composition || []) {
    const diffs = Array.isArray(comp.diff) ? comp.diff : [comp.diff];
    const actual = questions.filter(q => diffs.includes(q.diff)).length;
    if (actual !== comp.count) errors.push(`diff=${comp.diff}: ${actual}/${comp.count}`);
  }

  const choiceQs = questions.filter(q => q.mode === "choice");
  if (choiceQs.length >= 5) {
    const dist = {};
    choiceQs.forEach(q => { dist[q.ans_index] = (dist[q.ans_index] || 0) + 1; });
    for (let i = 0; i < 5; i++) {
      if ((dist[i] || 0) / choiceQs.length > 0.35) errors.push(`정답 ${i+1}번 편중`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// ── Configs ──
const CONFIGS = {
  MATH_DAILY: { subject: "수학", total: 7, time_limit: null, est_time: "20분", composition: [
    { diff: 1, pts: 2, count: 2, mode_mix: { choice: 1, short: 1 } },
    { diff: 2, pts: 3, count: 4, mode_mix: { choice: 2, short: 2 } },
    { diff: 3, pts: 4, count: 1, mode_mix: { short: 1 } },
  ], topic_max_repeat: 2, exclude_recent_days: 7 },

  MATH_MOCK: { subject: "수학", total: 18, time_limit: 60, est_time: "60분", composition: [
    { diff: 1, pts: 2, count: 2 },
    { diff: 2, pts: 3, count: 9 },
    { diff: [3, 4], pts: 4, count: 7 },
  ], sort_by_difficulty: true, exclude_recent_days: 14, killer_count: { min: 2, max: 3 } },

  KR_DAILY: { subject: "국어", total: 6, time_limit: null, est_time: "15분", composition: [
    { diff: 1, count: 2 }, { diff: 2, count: 2 }, { diff: [3, 4], count: 2 },
  ], exclude_recent_days: 7 },

  KR_MOCK: { subject: "국어", total: 15, time_limit: 30, est_time: "30분", composition: [
    { diff: 1, count: 4 }, { diff: 2, count: 6 }, { diff: [3, 4], count: 5 },
  ], sort_by_difficulty: true, exclude_recent_days: 14 },

  EN_DAILY: { subject: "영어", total: 14, time_limit: null, est_time: "25분", composition: [
    { diff: 1, count: 5 }, { diff: 2, count: 5 }, { diff: [3, 4], count: 4 },
  ], exclude_recent_days: 7 },

  EN_MOCK: { subject: "영어", total: 14, time_limit: 25, est_time: "25분", composition: [
    { diff: 1, count: 5 }, { diff: 2, count: 5 }, { diff: [3, 4], count: 4 },
  ], sort_by_difficulty: true, exclude_recent_days: 14 },

  ETHICS_DAILY: { subject: "생활과윤리", total: 10, time_limit: null, est_time: "20분", composition: [
    { diff: 1, count: 3 }, { diff: 2, count: 4 }, { diff: [3, 4], count: 3 },
  ], exclude_recent_days: 7 },

  EARTH_DAILY: { subject: "지구과학1", total: 10, time_limit: null, est_time: "20분", composition: [
    { diff: 1, count: 3 }, { diff: 2, count: 4 }, { diff: [3, 4], count: 3 },
  ], exclude_recent_days: 7 },
};

// ── Schedule ──
const SCHEDULE = {
  mon: [
    { type: "daily", config: CONFIGS.KR_DAILY },
    { type: "daily", config: CONFIGS.MATH_DAILY },
    { type: "daily", config: CONFIGS.EARTH_DAILY },
  ],
  tue: [
    { type: "daily", config: CONFIGS.EN_DAILY },
    { type: "daily", config: CONFIGS.MATH_DAILY },
    { type: "daily", config: CONFIGS.ETHICS_DAILY },
  ],
  wed: [
    { type: "daily", config: CONFIGS.KR_DAILY },
    { type: "mock", config: CONFIGS.MATH_MOCK },
  ],
  thu: [
    { type: "daily", config: CONFIGS.EN_DAILY },
    { type: "daily", config: CONFIGS.MATH_DAILY },
    { type: "daily", config: CONFIGS.EARTH_DAILY },
  ],
  fri: [
    { type: "daily", config: CONFIGS.KR_DAILY },
    { type: "daily", config: CONFIGS.MATH_DAILY },
    { type: "daily", config: CONFIGS.ETHICS_DAILY },
  ],
  sat: [
    { type: "mock", config: CONFIGS.KR_MOCK },
    { type: "mock", config: CONFIGS.EN_MOCK },
  ],
  sun: null,
};

const DAY_NAMES = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

// ── Generate Day ──
function generateDay(bank, dayName, dateStr) {
  const schedule = SCHEDULE[dayName];
  if (!schedule) { console.log(`  ${dayName}: 휴식일`); return null; }

  const sets = [];
  let totalQ = 0;

  for (const entry of schedule) {
    const config = entry.config;
    const questions = entry.type === "weekly"
      ? assembleWeekly(bank, config, [])
      : assembleDailyOrMock(bank, config);

    const result = validateSet(questions, config);
    const mark = result.valid ? "✓" : "⚠";
    if (!result.valid) result.errors.forEach(e => console.log(`    ${e}`));

    questions.forEach(q => bank.markUsed(q.qid));
    sets.push({ subject: config.subject, type: entry.type, total: questions.length,
      est_time: config.est_time, time_limit: config.time_limit, questions });
    totalQ += questions.length;
    console.log(`  ${mark} ${config.subject} ${entry.type}: ${questions.length}/${config.total}`);
  }

  return {
    meta: { date: dateStr, day: dayName, total_questions: totalQ,
      sets: sets.map(s => ({ subject: s.subject, type: s.type, total: s.total, est_time: s.est_time })) },
    sets: sets.map(s => ({ subject: s.subject, type: s.type, questions: s.questions })),
  };
}

// ── CLI ──
const args = process.argv.slice(2);
const flags = {};
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith("--")) {
    const key = args[i].slice(2);
    flags[key] = (i + 1 < args.length && !args[i + 1]?.startsWith("--")) ? args[++i] : true;
  }
}

const bank = new QuestionBank();
bank.load(path.join(__dirname, "..", "data", "question_bank"));

if (flags.stats) {
  const s = bank.getStats();
  console.log("\n=== LiteQ 문제 은행 현황 ===");
  Object.entries(s.bySubject).sort((a, b) => b[1] - a[1]).forEach(([subj, cnt]) => {
    const qs = bank.filter({ subject: subj });
    const diffs = {};
    qs.forEach(q => { diffs[q.diff] = (diffs[q.diff] || 0) + 1; });
    const d = Object.entries(diffs).sort((a, b) => a[0] - b[0]).map(([k, v]) => `d${k}:${v}`).join(" ");
    console.log(`  ${subj.padEnd(12)} ${String(cnt).padStart(4)}문항  (${d})`);
  });
  console.log(`  ${"─".repeat(40)}`);
  console.log(`  ${"총계".padEnd(12)} ${String(s.total).padStart(4)}문항`);
  process.exit(0);
}

if (flags["check-shortage"]) {
  console.log("\n=== 부족 영역 (4주 운영 기준) ===");
  const reqs = { "수학": 284, "국어": 120, "영어": 200, "생활과윤리": 80, "지구과학1": 80 };
  for (const [subj, needed] of Object.entries(reqs)) {
    const total = bank.filter({ subject: subj }).length;
    if (total < needed) console.log(`  ⚠ ${subj}: ${total}문항 / 필요 ${needed} → ${needed - total}문항 부족`);
    else console.log(`  ✓ ${subj}: ${total}문항 (충분)`);
  }
  process.exit(0);
}

if (flags.day) {
  const dayName = flags.day;
  const dateStr = flags.date || new Date().toISOString().slice(0, 10);
  console.log(`\n=== ${dateStr} (${dayName}) 세트 생성 ===`);
  const output = generateDay(bank, dayName, dateStr);
  if (output && flags.save) {
    const outDir = path.join(__dirname, "output");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const fname = `${dateStr}_${dayName}.json`;
    fs.writeFileSync(path.join(outDir, fname), JSON.stringify(output, null, 2), "utf8");
    console.log(`\n저장: output/${fname}`);
  }
  if (output) console.log(`\n총 ${output.meta.total_questions}문항 생성`);
  process.exit(0);
}

if (flags.week) {
  const start = new Date(flags.week);
  console.log(`\n=== ${flags.week} 주간 세트 생성 ===\n`);
  let weekTotal = 0;
  for (let i = 0; i < 7; i++) {
    const dt = new Date(start); dt.setDate(dt.getDate() + i);
    const dayName = DAY_NAMES[dt.getDay() === 0 ? 6 : dt.getDay() - 1];
    const dateStr = dt.toISOString().slice(0, 10);
    console.log(`--- ${dateStr} (${dayName}) ---`);
    const output = generateDay(bank, dayName, dateStr);
    if (output) {
      weekTotal += output.meta.total_questions;
      if (flags.save) {
        const outDir = path.join(__dirname, "output");
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(path.join(outDir, `${dateStr}_${dayName}.json`), JSON.stringify(output, null, 2), "utf8");
      }
    }
    console.log();
  }
  console.log(`주간 총 ${weekTotal}문항 생성`);
  process.exit(0);
}

// Default
const s = bank.getStats();
console.log(`\n문제 은행: ${s.total}문항. --stats, --day, --week 옵션을 사용하세요.`);
