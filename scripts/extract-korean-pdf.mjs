/**
 * 국어 기출 PDF → JSON 변환
 * pdfjs-dist로 텍스트 추출 후 문항 파싱
 *
 * Usage: node scripts/extract-korean-pdf.mjs <pdf_path> <output_json>
 */

import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { readFileSync, writeFileSync } from "fs";

const pdfPath = process.argv[2];
const outPath = process.argv[3];

if (!pdfPath || !outPath) {
  console.error("Usage: node extract-korean-pdf.mjs <pdf> <output.json>");
  process.exit(1);
}

// 파일명에서 메타데이터 추출
function parseMeta(filename) {
  // 패턴들:
  // 2026학년도-대학수학능력시험-국어-문제.pdf → year=2025, month=11, type=수능
  // 2025학년도-6월-모의평가-국어-문제.pdf → year=2024, month=6, type=모평
  // 2025년-고3-7월_국어-문제.pdf → year=2025, month=7, type=학평
  // 2024_10-고3-국어영역-문제지.pdf → year=2024, month=10, type=학평

  let year, month, type;
  const base = filename.replace(/\.pdf$/i, "");

  // 학년도 → 실시 연도 = 학년도 - 1
  const suneungMatch = base.match(/(\d{4})학년도.*대학수학능력시험/);
  if (suneungMatch) {
    year = parseInt(suneungMatch[1]) - 1;
    month = 11;
    type = "수능";
    return { year, month, type };
  }

  const mopyeongMatch = base.match(/(\d{4})학년도.*(\d+)월.*모의평가/);
  if (mopyeongMatch) {
    year = parseInt(mopyeongMatch[1]) - 1;
    month = parseInt(mopyeongMatch[2]);
    type = "모평";
    return { year, month, type };
  }

  // 일반 모의고사 (교육청)
  const hakpyeongMatch = base.match(/(\d{4})년.*?(\d+)월/);
  if (hakpyeongMatch) {
    year = parseInt(hakpyeongMatch[1]);
    month = parseInt(hakpyeongMatch[2]);
    type = "학평";
    return { year, month, type };
  }

  const underscoreMatch = base.match(/(\d{4})_(\d+)/);
  if (underscoreMatch) {
    year = parseInt(underscoreMatch[1]);
    month = parseInt(underscoreMatch[2]);
    type = "학평";
    return { year, month, type };
  }

  return { year: 0, month: 0, type: "unknown" };
}

async function extractPages(pdfPath) {
  const data = new Uint8Array(readFileSync(pdfPath));
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item) => item.str).join(" ");
    pages.push(text);
  }
  return pages.join("\n");
}

function parseQuestions(fullText) {
  const questions = [];

  // 문항 번호 패턴: "1." ~ "45." (수능 국어는 보통 1~45번)
  // 선지 패턴: ① ② ③ ④ ⑤
  const circled = ["①", "②", "③", "④", "⑤"];

  // 문항 시작점 찾기
  const qStarts = [];
  const qPattern = /(?:^|\s)(\d{1,2})\s*\.\s+/g;
  let match;
  while ((match = qPattern.exec(fullText)) !== null) {
    const num = parseInt(match[1]);
    if (num >= 1 && num <= 45) {
      qStarts.push({ num, index: match.index });
    }
  }

  // 중복 제거: 같은 번호가 여러 번 나오면 첫 번째만
  const seen = new Set();
  const uniqueStarts = qStarts.filter((s) => {
    if (seen.has(s.num)) return false;
    seen.add(s.num);
    return true;
  });

  for (let qi = 0; qi < uniqueStarts.length; qi++) {
    const start = uniqueStarts[qi].index;
    const end =
      qi + 1 < uniqueStarts.length
        ? uniqueStarts[qi + 1].index
        : fullText.length;
    const block = fullText.slice(start, end).trim();
    const num = uniqueStarts[qi].num;

    // 선지 추출
    const choices = [];
    for (let ci = 0; ci < 5; ci++) {
      const cStart = block.indexOf(circled[ci]);
      if (cStart === -1) continue;
      const cEnd =
        ci < 4 ? block.indexOf(circled[ci + 1], cStart) : block.length;
      const choiceText = block
        .slice(cStart + 1, cEnd !== -1 ? cEnd : undefined)
        .trim()
        .replace(/\s+/g, " ");
      choices.push(choiceText);
    }

    // 발문 추출 (문항번호 ~ 첫 번째 선지 사이)
    const firstChoice = block.indexOf(circled[0]);
    const questionText =
      firstChoice > 0
        ? block
            .slice(0, firstChoice)
            .replace(/^\d{1,2}\s*\.\s*/, "")
            .trim()
            .replace(/\s+/g, " ")
        : "";

    // 배점 추출: [3점] 또는 [2점]
    const pointsMatch = block.match(/\[\s*(\d)\s*점\s*\]/);
    const points = pointsMatch ? parseInt(pointsMatch[1]) : 2;

    if (choices.length >= 4) {
      questions.push({
        number: num,
        question: questionText.slice(0, 500),
        choices: choices.slice(0, 5),
        points,
      });
    }
  }

  return questions;
}

async function main() {
  const filename = pdfPath.split("/").pop().split("\\").pop();
  const meta = parseMeta(filename);

  console.error(`Processing: ${filename}`);
  console.error(`  Meta: ${meta.year}-${meta.month}월 ${meta.type}`);

  const fullText = await extractPages(pdfPath);
  console.error(`  Text length: ${fullText.length}`);

  const questions = parseQuestions(fullText);
  console.error(`  Questions found: ${questions.length}`);

  const output = {
    source: filename,
    year: meta.year,
    month: meta.month,
    examType: meta.type,
    subject: "korean",
    totalQuestions: questions.length,
    questions,
  };

  writeFileSync(outPath, JSON.stringify(output, null, 2), "utf8");
  console.log(
    `${filename} → ${questions.length} questions → ${outPath}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
