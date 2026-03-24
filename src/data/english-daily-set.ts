import { ENGLISH_DAILY_SEED } from "./english-daily-seed";
import type { Question } from "@/types/quiz";

/**
 * 영어 일간지 14문항 세트 구성
 *
 * 순서:
 *  1. 글의 목적 (easy)        → gen-01  [index 0]
 *  2. 심경 변화 (easy)        → gen-06  [index 5]
 *  3. 주장 (easy)             → gen-11  [index 10]
 *  4. 요지 (easy)             → gen-16  [index 15]
 *  5. 어법 판단 (medium)      → gen-26  [index 25]  ← 내용 일치 없으므로 어법으로 대체
 *  6. 주제 (medium)           → gen-21  [index 20]
 *  7. 무관한 문장 (medium)    → gen-46  [index 45]
 *  8. 요약 추론 (medium)      → gen-61  [index 60]
 *  9. 어휘 판단 (medium)      → gen-31  [index 30]
 * 10. 주제/제목 #2 (medium)   → gen-22  [index 21]
 * 11. 순서 배열 (hard)        → gen-51  [index 50]
 * 12. 문장 삽입 (hard)        → gen-56  [index 55]
 * 13. 빈칸 단어/구 (hard)     → gen-36  [index 35]
 * 14. 빈칸 절 (killer)        → gen-41  [index 40]
 */

// 14문항 인덱스 (ENGLISH_DAILY_SEED 배열 기준)
const DAILY_SET_INDICES = [
  0,   // 1. 글의 목적 (easy)
  5,   // 2. 심경 변화 (easy)
  10,  // 3. 주장 (easy)
  15,  // 4. 요지 (easy)
  25,  // 5. 어법 (medium)
  20,  // 6. 주제 (medium)
  45,  // 7. 무관한 문장 (medium)
  60,  // 8. 요약 추론 (medium)
  30,  // 9. 어휘 (medium)
  21,  // 10. 주제 #2 (medium)
  50,  // 11. 순서 배열 (hard)
  55,  // 12. 문장 삽입 (hard)
  35,  // 13. 빈칸 단어/구 (hard)
  40,  // 14. 빈칸 절 (killer)
];

// ID를 재부여하여 일간지 내 순번으로 사용
export const ENGLISH_DAILY_SET: Question[] = DAILY_SET_INDICES.map(
  (seedIdx, setIdx) => ({
    ...ENGLISH_DAILY_SEED[seedIdx],
    id: `daily-eng-${String(setIdx + 1).padStart(2, "0")}`,
  })
);
