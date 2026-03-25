/**
 * 국어 기출 JSON → 유형별 분류
 * 수능 국어 문항 번호 기반 영역/유형 매핑
 *
 * Usage: node scripts/classify-korean.mjs
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "fs";
import { join } from "path";

const RAW_DIR = "data/csat-korean/raw";
const OUT_DIR = "data/csat-korean/by-type";
mkdirSync(OUT_DIR, { recursive: true });

/**
 * 수능/모평 국어 문항번호 → 유형 매핑
 *
 * 2022~2025 기준 (통합형 + 선택과목):
 * 1~3:  독서(인문/사회/과학/기술/예술) - 내용일치, 추론
 * 4~9:  독서(법/경제/과학) - 추론, 비판, 어휘, 구조
 * 10~17: 독서(과학/기술) - 추론, 비판, 어휘
 * 18~21: 문학(현대시/고전시) - 표현상특징, 시어해석, 작품비교
 * 22~26: 문학(소설/수필) - 서술자시점, 외적준거적용, 작품비교
 * 27~34: 문학(고전소설/현대소설) - 서술자시점, 표현상특징
 * 35~37: 선택(화작) - 화법전략, 작문원리
 * 38~42: 선택(화작/언매) - 화법전략, 작문원리, 음운변동, 문장구조
 * 43~45: 선택(언매) - 음운변동, 문장구조, 담화/매체
 *
 * 문항별 세부 유형은 발문 키워드로 판별
 */

// 발문 키워드 기반 유형 분류
function classifyByQuestion(num, questionText) {
  const q = questionText || "";

  // 선택과목 영역 (35~45)
  if (num >= 35) {
    if (/음운|음절|발음|표준 발음|비음|유음|경음|격음|탈락|첨가|축약|교체/.test(q))
      return { area: "선택-언매", type: "음운변동" };
    if (/문장|주어|서술어|목적어|관형|부사|피동|사동|겹문장|안은|이어진|높임|시제|접속/.test(q))
      return { area: "선택-언매", type: "문장구조" };
    if (/담화|매체|표현 전략|기사|보도|인터넷|게시판|뉴스|광고|영상/.test(q))
      return { area: "선택-언매", type: "담화매체" };
    if (/화법|대화|토의|토론|발표|면접|협상|연설|듣기|말하기/.test(q))
      return { area: "선택-화작", type: "화법전략" };
    if (/작문|초고|고쳐|쓰기|글쓰기|개요|수정|윗글.*작문/.test(q))
      return { area: "선택-화작", type: "작문원리" };
    // 기본
    if (num <= 39) return { area: "선택-화작", type: "화법전략" };
    return { area: "선택-언매", type: "문장구조" };
  }

  // 문학 영역 (보통 18~34, 그러나 지문 세트에 따라 다를 수 있음)
  if (num >= 18 && num <= 34) {
    if (/표현상|표현.*특징|표현 방법|서술.*특징/.test(q))
      return { area: "문학", type: "표현상특징" };
    if (/시어|시구|시적|비유|상징|이미지|함축/.test(q))
      return { area: "문학", type: "시어해석" };
    if (/비교|공통점|차이점|\(가\).*\(나\)|㉠.*㉡/.test(q))
      return { area: "문학", type: "작품비교" };
    if (/<\s*보기\s*>|외적.*준거|비평|관점/.test(q))
      return { area: "문학", type: "외적준거적용" };
    if (/서술자|시점|화자|서술 방식|서술상/.test(q))
      return { area: "문학", type: "서술자시점" };
    if (/일치|적절|이해.*내용/.test(q))
      return { area: "문학", type: "내용이해" };
    return { area: "문학", type: "내용이해" };
  }

  // 독서 영역 (1~17)
  if (/일치|일치하지|않는/.test(q) && !/추론|이해.*내용/.test(q))
    return { area: "독서", type: "내용일치" };
  if (/추론|추리|미루어|알 수 있|짐작/.test(q))
    return { area: "독서", type: "추론" };
  if (/비판|반론|평가|문제점|반박|약점/.test(q))
    return { area: "독서", type: "비판평가" };
  if (/어휘|의미|ⓐ|ⓑ|ⓒ|밑줄|바꾸어|문맥/.test(q))
    return { area: "독서", type: "어휘의미" };
  if (/구조|전개|글의 구성|서술 방식|논증|설명 방식/.test(q))
    return { area: "독서", type: "구조전개" };
  if (/<\s*보기\s*>/.test(q))
    return { area: "독서", type: "추론" };

  return { area: "독서", type: "내용일치" };
}

// 모든 raw JSON 읽기
const files = readdirSync(RAW_DIR).filter((f) => f.endsWith(".json"));
const byType = {};
let totalQ = 0;

for (const file of files) {
  const data = JSON.parse(readFileSync(join(RAW_DIR, file), "utf8"));
  const source = `${data.year}-${data.month}-${data.examType}`;

  for (const q of data.questions) {
    const { area, type } = classifyByQuestion(q.number, q.question);
    const key = `${area}--${type}`;
    if (!byType[key]) byType[key] = { area, type, questions: [] };
    byType[key].questions.push({
      ...q,
      source,
      area,
      type,
    });
    totalQ++;
  }
}

// 유형별 파일 저장
console.log("=== 유형별 분류 결과 ===\n");
const summary = [];

for (const [key, data] of Object.entries(byType).sort()) {
  const safeName = key.replace(/[^a-zA-Z가-힣]/g, "-").replace(/-+/g, "-");
  const outPath = join(OUT_DIR, `${safeName}.json`);
  writeFileSync(outPath, JSON.stringify(data, null, 2), "utf8");
  console.log(`${data.area} > ${data.type}: ${data.questions.length}문항 → ${outPath}`);
  summary.push({ area: data.area, type: data.type, count: data.questions.length });
}

console.log(`\n총 ${totalQ}문항, ${Object.keys(byType).length}개 유형`);

// 영역별 요약
const byArea = {};
for (const s of summary) {
  if (!byArea[s.area]) byArea[s.area] = 0;
  byArea[s.area] += s.count;
}
console.log("\n영역별 합계:");
for (const [area, count] of Object.entries(byArea)) {
  console.log(`  ${area}: ${count}문항`);
}
