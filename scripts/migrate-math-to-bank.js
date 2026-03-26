/**
 * 수학 문제 은행 마이그레이션
 * week1~4 JSON + 샘플 → 개별 태그 단위 레코드 배열
 */

const fs = require("fs");
const path = require("path");

const BASE = path.join(__dirname, "..");
const OUT = path.join(BASE, "data/question_bank/math");

// ── topic 약어 매핑 ──
const TOPIC_SHORT = {
  "수열": "seq", "삼각함수": "trig", "지수·로그": "exp", "지수로그": "exp",
  "극한": "lim", "극한·연속": "lim", "연속": "lim", "극한연속": "lim",
  "미분": "diff", "미분-접선": "diff", "미분-증감": "diff", "미분-극값": "diff",
  "적분": "intg", "적분-넓이": "intg",
  "순열·조합": "perm", "경우의 수": "perm", "순열조합": "perm",
  "확률": "prob", "확률·통계": "prob",
  "통계": "stat",
  "확률과통계": "prob",
};

// ── subtype 판별 ──
function classifySubtype(q) {
  const s = (q.stem || "") + " " + (q.tex || "") + " " + (q.type || "") + " " + (q.topic || "");
  const t = q.topic || "";

  // 수열
  if (t.includes("수열") || t.includes("등비급수") || t.includes("시그마")) {
    if (s.includes("등차") && s.includes("합")) return "등차수열_합";
    if (s.includes("등차") && (s.includes("공차") || s.includes("d"))) return "등차수열_공차";
    if (s.includes("등차")) return "등차수열_항";
    if (s.includes("등비급수") || s.includes("무한급수")) return "등비급수";
    if (s.includes("등비") && s.includes("합")) return "등비수열_합";
    if (s.includes("등비") && (s.includes("공비") || s.includes("r"))) return "등비수열_항";
    if (s.includes("등비")) return "등비수열_항";
    if (s.includes("점화") || s.includes("a_{n+1}") || s.includes("귀납")) return "점화식";
    if (s.includes("시그마") || s.includes("\\sum") || s.includes("Σ")) return "시그마";
    if (s.includes("S_") && s.includes("a_")) return "시그마";
    return "수열_기타";
  }

  // 삼각함수
  if (t.includes("삼각")) {
    if (s.includes("합성") || s.includes("asin") || s.includes("sin.*cos.*합")) return "합성";
    if (s.includes("방정식") || s.includes("해") && s.includes("구")) return "삼각방정식";
    if (s.includes("사인법칙")) return "사인법칙";
    if (s.includes("코사인법칙")) return "코사인법칙";
    if (s.includes("넓이") || s.includes("삼각형.*넓이")) return "넓이";
    if (s.includes("최대") || s.includes("최소")) return "최대최소";
    if (s.includes("주기") || s.includes("그래프")) return "주기";
    if (s.includes("그래프")) return "그래프";
    return "삼각함수_기타";
  }

  // 지수·로그
  if (t.includes("지수") || t.includes("로그")) {
    if (s.includes("부등식") && s.includes("로그")) return "로그부등식";
    if (s.includes("부등식") && s.includes("지수")) return "지수부등식";
    if (s.includes("방정식") && s.includes("로그")) return "로그방정식";
    if (s.includes("방정식") && s.includes("지수")) return "지수방정식";
    if (s.includes("그래프")) return "그래프";
    if (s.includes("로그") || s.includes("\\log")) return "로그계산";
    return "지수계산";
  }

  // 극한·연속
  if (t.includes("극한") || t.includes("연속")) {
    if (s.includes("연속") && (s.includes("미분가능") || s.includes("미분"))) return "연속조건";
    if (s.includes("연속")) return "연속조건";
    if (s.includes("부정형") || s.includes("0/0")) return "부정형";
    return "극한계산";
  }

  // 미분
  if (t.includes("미분") || t.includes("도함수")) {
    if (s.includes("함수.*결정") || s.includes("조건.*만족")) return "함수결정";
    if (s.includes("접선")) return "접선";
    if (s.includes("극") && (s.includes("대") || s.includes("소"))) return "극값";
    if (s.includes("최대") || s.includes("최소")) return "최대최소";
    if (s.includes("증가") || s.includes("감소") || s.includes("증감")) return "증감표";
    if (s.includes("그래프") || s.includes("추론")) return "그래프추론";
    if (s.includes("속도") || s.includes("가속도")) return "속도가속도";
    if (s.includes("f'")) return "도함수";
    return "미분_기타";
  }

  // 적분
  if (t.includes("적분")) {
    if (s.includes("넓이") || s.includes("면적")) return "넓이";
    if (s.includes("치환")) return "치환적분";
    if (s.includes("속도") || s.includes("거리")) return "속도거리";
    if (s.includes("극한") || s.includes("\\lim")) return "적분극한복합";
    if (s.includes("부정적분")) return "부정적분";
    return "정적분계산";
  }

  // 순열·조합
  if (t.includes("순열") || t.includes("조합") || t.includes("경우")) {
    if (s.includes("중복조합")) return "중복조합";
    if (s.includes("중복순열")) return "중복순열";
    if (s.includes("같은")) return "같은것순열";
    if (s.includes("분할") || s.includes("조 나누")) return "분할";
    if (s.includes("순열")) return "순열";
    return "조합";
  }

  // 확률
  if (t.includes("확률")) {
    if (s.includes("베이즈") || s.includes("Bayes")) return "베이즈";
    if (s.includes("조건부")) return "조건부확률";
    if (s.includes("독립")) return "독립사건";
    if (s.includes("반복") || s.includes("시행")) return "반복시행";
    if (s.includes("여사건")) return "여사건";
    if (s.includes("덧셈")) return "덧셈정리";
    if (s.includes("곱셈")) return "곱셈정리";
    return "확률_기타";
  }

  // 통계
  if (t.includes("통계") || t.includes("분포") || t.includes("추정")) {
    if (s.includes("모평균")) return "모평균추정";
    if (s.includes("모비율")) return "모비율추정";
    if (s.includes("정규분포") || s.includes("N(")) return "정규분포_표준화";
    if (s.includes("이항분포") && s.includes("분산")) return "이항분포_분산";
    if (s.includes("이항분포")) return "이항분포_기댓값";
    return "통계_기타";
  }

  return "기타";
}

// ── tags 추출 ──
function extractTags(q) {
  const s = (q.stem || "") + " " + (q.tex || "") + " " + (q.solution || "") + " " + (q.solTex || "");
  const tags = new Set();

  const patterns = [
    [/등차수열/g, "등차수열"], [/등비수열/g, "등비수열"], [/등비급수/g, "등비급수"],
    [/공차/g, "공차"], [/공비/g, "공비"], [/일반항/g, "일반항"],
    [/S_|수열의\s*합/g, "수열의합"], [/점화식|a_{n\+1}/g, "점화식"],
    [/\\sum|시그마|Σ/g, "시그마"], [/sin|cos|tan/g, "삼각함수"],
    [/합성/g, "삼각합성"], [/사인법칙/g, "사인법칙"], [/코사인법칙/g, "코사인법칙"],
    [/log|\\log/g, "로그"], [/지수/g, "지수"],
    [/f'|도함수/g, "도함수"], [/접선/g, "접선"],
    [/극대|극소|극값/g, "극값"], [/최대|최소/g, "최대최소"],
    [/증가|감소|증감/g, "증감"], [/\\int|적분/g, "적분"],
    [/넓이|면적/g, "넓이"], [/속도|거리/g, "속도거리"],
    [/연속/g, "연속"], [/극한|\\lim/g, "극한"],
    [/P\(|확률/g, "확률"], [/조건부|P\(.*\|/g, "조건부확률"],
    [/독립/g, "독립사건"], [/\\binom|C_|조합/g, "조합"],
    [/이항분포|B\(/g, "이항분포"], [/정규분포|N\(/g, "정규분포"],
    [/표준화|Z\s*=/g, "표준화"], [/모평균/g, "모평균추정"],
  ];

  for (const [re, tag] of patterns) {
    if (re.test(s)) tags.add(tag);
  }

  return tags.size > 0 ? [...tags] : [q.topic || "수학"];
}

// ── 메인 ──
const allQuestions = [];
const seqCounters = {}; // topic_subtype_diff → count

// 소스 파일 수집
const sources = [];

// week1~4
for (let w = 1; w <= 4; w++) {
  const dir = path.join(BASE, `data/csat-math/week${w}`);
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));
  for (const f of files) {
    sources.push({ file: path.join(dir, f), source: `week${w}_${f.replace(".json", "")}` });
  }
}

// 샘플
const sampleDir = path.join(BASE, "data/csat-math");
["math_일간지_sample.json", "math_라이트모의고사_sample.json"].forEach(f => {
  const fp = path.join(sampleDir, f);
  if (fs.existsSync(fp)) sources.push({ file: fp, source: f.replace(".json", "") });
});

let totalInput = 0;

for (const { file, source } of sources) {
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const qs = data.questions || [];
  totalInput += qs.length;

  for (const q of qs) {
    const topicKey = q.topic || q.unit || "기타";
    const topicShort = TOPIC_SHORT[topicKey] || TOPIC_SHORT[q.topic] || "misc";
    const subtype = classifySubtype(q);
    const diff = q.diff || 2;
    const subtypeShort = subtype.replace(/[_·]/g, "").slice(0, 12);

    // seq counter
    const counterKey = `${topicShort}_${subtypeShort}_d${diff}`;
    seqCounters[counterKey] = (seqCounters[counterKey] || 0) + 1;
    const seq = String(seqCounters[counterKey]).padStart(3, "0");

    const qid = `math_${topicShort}_${subtypeShort}_d${diff}_${seq}`;

    const record = {
      qid,
      subject: "수학",
      unit: q.unit || "수학",
      topic: q.topic || "",
      subtype,
      diff,
      pts: q.pts || 2,
      mode: q.mode || "short",
      rec_time: q.rec || "2:00",
      stem: q.stem || "",
      tex: q.tex || null,
      opts: q.opts || null,
      ans: String(q.ans),
      solution: q.solution || "",
      solTex: q.solTex || "",
      solNote: q.solNote || null,
      tags: extractTags(q),
      ans_index: q.mode === "choice" ? q.ans : null,
      status: "approved",
      source: source,
      source_id: q.id,
      created_at: data.meta?.date || data.date || "2026-03-23",
      used_count: 0,
      last_used: null,
    };

    allQuestions.push(record);
  }
}

// 출력
fs.writeFileSync(
  path.join(OUT, "math_questions.json"),
  JSON.stringify(allQuestions, null, 2),
  "utf8"
);

console.log(`Input: ${totalInput} questions from ${sources.length} files`);
console.log(`Output: ${allQuestions.length} records`);
console.log(`Match: ${totalInput === allQuestions.length ? "✓" : "⚠ MISMATCH"}`);

// ── 통계 ──
const stats = {
  total: allQuestions.length,
  byUnit: {}, byTopic: {}, byDiff: {}, byMode: {}, bySubtype: {},
};

for (const q of allQuestions) {
  stats.byUnit[q.unit] = (stats.byUnit[q.unit] || 0) + 1;
  stats.byTopic[q.topic] = (stats.byTopic[q.topic] || 0) + 1;
  stats.byDiff[q.diff] = (stats.byDiff[q.diff] || 0) + 1;
  stats.byMode[q.mode] = (stats.byMode[q.mode] || 0) + 1;
  stats.bySubtype[q.subtype] = (stats.bySubtype[q.subtype] || 0) + 1;
}

console.log("\n=== Unit ===");
Object.entries(stats.byUnit).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log(`  ${k}: ${v}`));
console.log("\n=== Diff ===");
Object.entries(stats.byDiff).sort((a,b)=>a[0]-b[0]).forEach(([k,v])=>console.log(`  diff=${k}: ${v}`));
console.log("\n=== Mode ===");
Object.entries(stats.byMode).forEach(([k,v])=>console.log(`  ${k}: ${v}`));
console.log("\n=== Top subtypes ===");
Object.entries(stats.bySubtype).sort((a,b)=>b[1]-a[1]).slice(0,20).forEach(([k,v])=>console.log(`  ${k}: ${v}`));

// qid 중복 체크
const qids = allQuestions.map(q => q.qid);
const dupes = qids.filter((id, i) => qids.indexOf(id) !== i);
console.log("\n=== QID duplicates ===");
console.log(dupes.length === 0 ? "  None ✓" : `  ${dupes.length} duplicates: ${dupes.slice(0,5).join(", ")}`);

// 빈 tags 체크
const emptyTags = allQuestions.filter(q => !q.tags || q.tags.length === 0);
console.log("\n=== Empty tags ===");
console.log(emptyTags.length === 0 ? "  None ✓" : `  ${emptyTags.length} records`);

// 필수 필드 체크
const missingFields = [];
const required = ["qid","subject","unit","topic","subtype","diff","pts","mode","stem","ans","status"];
for (const q of allQuestions) {
  for (const f of required) {
    if (q[f] === undefined || q[f] === null || q[f] === "") {
      missingFields.push(`${q.qid}: missing ${f}`);
    }
  }
}
console.log("\n=== Missing required fields ===");
console.log(missingFields.length === 0 ? "  None ✓" : `  ${missingFields.length} issues`);

// choice ans_index 범위 체크
const badAnsIdx = allQuestions.filter(q => q.mode === "choice" && (q.ans_index < 0 || q.ans_index > 4));
console.log("\n=== Choice ans_index out of range ===");
console.log(badAnsIdx.length === 0 ? "  None ✓" : `  ${badAnsIdx.length} issues`);

// short ans 범위 체크
const badShortAns = allQuestions.filter(q => {
  if (q.mode !== "short") return false;
  const n = parseInt(q.ans);
  return isNaN(n) || n < 0 || n > 999;
});
console.log("\n=== Short ans out of range ===");
console.log(badShortAns.length === 0 ? "  None ✓" : badShortAns.map(q => `  ${q.qid}: ${q.ans}`).join("\n"));

// JSON 통계 저장
fs.writeFileSync(
  path.join(OUT, "math_stats.json"),
  JSON.stringify(stats, null, 2),
  "utf8"
);
