# 마이그레이션 로그

## 실행 정보
- 실행일: 2026-03-26
- 스크립트: `scripts/migrate-math-to-bank.js`
- 입력: 30개 JSON 파일 (week1~4 × 7 + 샘플 2)

## 변환 과정

1. 30개 소스 파일에서 questions 배열 추출
2. 각 문항에 대해:
   - stem/tex/type 분석으로 subtype 자동 분류
   - stem/solTex에서 키워드 기반 tags 추출
   - topic 약어 + subtype + diff + 순번으로 qid 생성
   - mode에 따라 ans_index 설정 (choice: 0-based, short: null)
3. 전체 309 레코드를 math_questions.json에 저장

## 수정 사항

| # | QID | 이슈 | 수정 내용 |
|---|-----|------|-----------|
| 1 | math_misc_점화식_d2_002 | ans_index=5 (범위 초과) | 4로 수정 (⑤ = 0-based 4) |

## 검증 결과

| 항목 | 결과 |
|------|------|
| 입력 = 출력 (309) | ✓ |
| QID 유일성 | ✓ (0 중복) |
| 필수 필드 누락 | ✓ (0건) |
| 빈 tags | ✓ (0건) |
| choice ans_index 0~4 | ✓ (1건 수정 후) |
| short ans 0~999 | ✓ (0건) |
