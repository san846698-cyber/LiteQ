/**
 * QA Audit — 자동 검수 (구조적 이슈 탐지)
 * 정답 분포, 필드 누락, 스케줄러 호환성, 중복 검출
 */
const fs = require("fs");
const path = require("path");

const BANK = path.join(__dirname, "..", "data", "question_bank");
const OUT = path.join(__dirname, "..", "qa_audit");

const files = {
  "수학": "math/math_questions.json",
  "국어": "korean/kr_questions.json",
  "영어": "english/english_questions.json",
  "지구과학1": "earth_science/earth_questions.json",
  "생활과윤리": "ethics/ethics_questions.json",
};

const allQuestions = [];
const fixList = [];
const stats = { total: 0, bySubject: {}, ansDist: {} };

for (const [subj, file] of Object.entries(files)) {
  const fp = path.join(BANK, file);
  if (!fs.existsSync(fp)) { console.log(`⚠ ${file} not found`); continue; }
  const qs = JSON.parse(fs.readFileSync(fp, "utf8"));
  stats.bySubject[subj] = { total: qs.length, issues: { critical: 0, major: 0, minor: 0, info: 0 } };
  stats.ansDist[subj] = [0, 0, 0, 0, 0];

  for (const q of qs) {
    allQuestions.push({ ...q, _subject: subj });

    // ── 필수 필드 ──
    const required = ["qid", "subject", "stem", "ans", "diff", "mode"];
    for (const f of required) {
      if (q[f] === undefined || q[f] === null || q[f] === "") {
        fixList.push({ qid: q.qid, category: "필드누락", severity: "major", note: `${f} 누락` });
        stats.bySubject[subj].issues.major++;
      }
    }

    // ── choice: opts 5개 확인 ──
    if (q.mode === "choice") {
      if (!q.opts || q.opts.length < 5) {
        fixList.push({ qid: q.qid, category: "스케줄러호환", severity: "major", note: `opts ${q.opts?.length || 0}개 (5개 필요)` });
        stats.bySubject[subj].issues.major++;
      }
      // ans_index 범위
      const idx = q.ans_index ?? q.ans;
      if (typeof idx === "number" && (idx < 0 || idx > 4)) {
        fixList.push({ qid: q.qid, category: "정답범위", severity: "critical", note: `ans_index=${idx} (0~4 필요)` });
        stats.bySubject[subj].issues.critical++;
      }
      // 정답 분포
      if (typeof idx === "number" && idx >= 0 && idx < 5) {
        stats.ansDist[subj][idx]++;
      }
    }

    // ── short: ans 문자열 + 0~999 (수학만) ──
    if (q.mode === "short" && subj === "수학") {
      const n = parseInt(q.ans);
      if (isNaN(n) || n < 0 || n > 999) {
        fixList.push({ qid: q.qid, category: "정답범위", severity: "critical", note: `short ans=${q.ans} (0~999 필요)` });
        stats.bySubject[subj].issues.critical++;
      }
    }

    // ── 빈 tags ──
    if (!q.tags || q.tags.length === 0) {
      fixList.push({ qid: q.qid, category: "태그오류", severity: "minor", note: "tags 비어있음" });
      stats.bySubject[subj].issues.minor++;
    }

    // ── 지구과학: visual_required + image_desc ──
    if (subj === "지구과학1" && q.visual_required && !q.image_desc) {
      fixList.push({ qid: q.qid, category: "필드누락", severity: "major", note: "visual_required=true이나 image_desc 없음" });
      stats.bySubject[subj].issues.major++;
    }

    // ── 국어/영어: passage 확인 ──
    if ((subj === "국어" || subj === "영어") && !q.passage && !q.stem) {
      fixList.push({ qid: q.qid, category: "필드누락", severity: "major", note: "passage+stem 모두 없음" });
      stats.bySubject[subj].issues.major++;
    }

    // ── diff 범위 ──
    if (q.diff < 1 || q.diff > 4) {
      fixList.push({ qid: q.qid, category: "태그오류", severity: "minor", note: `diff=${q.diff} (1~4 범위 밖)` });
      stats.bySubject[subj].issues.minor++;
    }
  }

  stats.total += qs.length;
}

// ── QID 중복 ──
const qidCounts = {};
allQuestions.forEach(q => { qidCounts[q.qid] = (qidCounts[q.qid] || 0) + 1; });
const dupeQids = Object.entries(qidCounts).filter(([_, c]) => c > 1);
if (dupeQids.length > 0) {
  for (const [qid, cnt] of dupeQids) {
    fixList.push({ qid, category: "QID중복", severity: "major", note: `${cnt}회 중복` });
  }
}

// ── 정답 분포 출력 ──
console.log("\n=== 정답 분포 ===");
for (const [subj, dist] of Object.entries(stats.ansDist)) {
  const total = dist.reduce((a, b) => a + b, 0);
  if (total === 0) continue;
  const line = dist.map((v, i) => `${["①","②","③","④","⑤"][i]}${v}(${(v/total*100).toFixed(1)}%)`).join(" ");
  const maxPct = Math.max(...dist) / total * 100;
  const pass = maxPct < 30 ? "✓" : "⚠";
  console.log(`  ${subj}: ${line} max:${maxPct.toFixed(1)}% ${pass}`);
}

// ── 중복 문항 검출 (같은 과목 내 stem 유사도) ──
const dupeWarnings = [];
for (const [subj, file] of Object.entries(files)) {
  const fp = path.join(BANK, file);
  if (!fs.existsSync(fp)) continue;
  const qs = JSON.parse(fs.readFileSync(fp, "utf8"));
  for (let i = 0; i < qs.length; i++) {
    for (let j = i + 1; j < qs.length; j++) {
      if (qs[i].subtype === qs[j].subtype && qs[i].diff === qs[j].diff) {
        const s1 = (qs[i].stem || "").slice(0, 50);
        const s2 = (qs[j].stem || "").slice(0, 50);
        // Simple word overlap
        const w1 = new Set(s1.split(/\s+/));
        const w2 = new Set(s2.split(/\s+/));
        const overlap = [...w1].filter(w => w2.has(w)).length;
        const sim = overlap / Math.max(w1.size, w2.size, 1);
        if (sim > 0.7 && w1.size > 3) {
          dupeWarnings.push({ a: qs[i].qid, b: qs[j].qid, sim: (sim * 100).toFixed(0) + "%" });
        }
      }
    }
  }
}

// ── 요약 출력 ──
const criticalTotal = fixList.filter(f => f.severity === "critical").length;
const majorTotal = fixList.filter(f => f.severity === "major").length;
const minorTotal = fixList.filter(f => f.severity === "minor").length;

console.log("\n=== QA Audit 요약 ===");
console.log(`총 문항: ${stats.total}`);
console.log(`Critical: ${criticalTotal}, Major: ${majorTotal}, Minor: ${minorTotal}`);
console.log(`QID 중복: ${dupeQids.length}건`);
console.log(`중복 의심 쌍: ${dupeWarnings.length}건`);
console.log(`오류율: ${((criticalTotal + majorTotal) / stats.total * 100).toFixed(2)}%`);
console.log(`판정: ${criticalTotal === 0 && majorTotal <= 5 ? "PASS ✓" : "REVIEW NEEDED"}`);

// ── 과목별 요약 ──
console.log("\n=== 과목별 ===");
for (const [subj, s] of Object.entries(stats.bySubject)) {
  const { critical, major, minor } = s.issues;
  console.log(`  ${subj}: ${s.total}문항, C:${critical} M:${major} m:${minor}`);
}

// ── 저장 ──
fs.writeFileSync(path.join(OUT, "fix_list.json"), JSON.stringify(fixList, null, 2), "utf8");
fs.writeFileSync(path.join(OUT, "stats.json"), JSON.stringify({ ...stats, dupeWarnings, dupeQids: dupeQids.map(d => d[0]) }, null, 2), "utf8");

if (criticalTotal > 0) {
  console.log("\n=== Critical 이슈 상세 ===");
  fixList.filter(f => f.severity === "critical").forEach(f => console.log(`  ${f.qid}: ${f.note}`));
}
if (majorTotal > 0) {
  console.log("\n=== Major 이슈 상세 ===");
  fixList.filter(f => f.severity === "major").slice(0, 20).forEach(f => console.log(`  ${f.qid}: ${f.note}`));
}
