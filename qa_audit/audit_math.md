# 수학 QA Audit (309문항)

**감사일**: 2026-03-26
**파일**: `data/question_bank/math/math_questions.json`

---

## 검증 결과 요약
- 검증 문항: 309
- 정답 오류: **1건**
- 복수 정답 의심: 0건
- 형식 오류: **1건** (단답형 답이 정수가 아님)
- 태그 오류: 0건
- 풀이 누락: ~49건 (week2 일부 문항 solution/solTex 빈 문자열)

---

## Critical Issues (정답 오류)

### [FAIL] qid: math_misc_극한계산_d2_001
- **diff**: 2 | **mode**: choice | **source**: week3_week3_fri_daily (source_id: 5)
- **문제**: `lim(n->inf) (1/n) * sum_{k=1}^{n} 3(k/n)^2`
- **현재 ans**: "2" (ans_index: 2) -> 선지 ③ 2
- **올바른 답**: ② 1 (ans_index: 1)
- **근거**: 구분구적법에 의해 해당 극한은 `int_0^1 3x^2 dx = [x^3]_0^1 = 1` 이다. 풀이(solution)에서도 답이 1로 계산되어 있으나, ans/ans_index가 잘못 기록되어 있다.
- **수정 필요**: `"ans": "1"`, `"ans_index": 1`

---

## Warnings (형식 오류)

### [WARNING] qid: math_lim_극한계산_d2_001
- **diff**: 2 | **mode**: short | **source**: week1_week1_sun_daily (source_id: 6)
- **문제**: 급수 `sum_{n=1}^{inf} 1/(n(n+2))`의 값
- **현재 ans**: "3/4"
- **이슈**: 단답형(short) 문항의 답은 0~999 정수여야 하나, 분수("3/4")로 기록되어 있음.
- **수학적 정답은 올바름**: 3/4이 맞다.
- **수정 제안**: 문제를 "... 의 값을 p/q (기약분수)라 할 때, p+q의 값을 구하시오"로 변경하여 ans="7"로 정수화하거나, choice 모드로 변경.

---

## 풀이 누락 (Empty Solutions)

week2_week2_fri_daily의 7문항 (source_id: 1~7)에 해당하는 문항들의 `solution`과 `solTex` 필드가 빈 문자열("")이다. 정답 자체는 검증 결과 올바르나, 학생용 해설이 제공되지 않는 상태이다.

해당 문항 qid 목록:
- math_misc_주기_d1_001 (ans: ⑤ 3pi -- 올바름)
- math_misc_부정형_d1_001 (ans: 6 -- 올바름)
- math_misc_주기_d2_001 (ans: ② 4 -- 올바름, M=3, m=-1, T=2이므로 합=4)
- math_misc_점화식_d2_001 (ans: 31 -- 올바름, a1=1, a2=3, a3=7, a4=15, a5=31)
- math_misc_미분기타_d2_001 (ans: ③ 6 -- 올바름, f'(-1)=0에서 a=6)
- math_misc_미분기타_d2_002 (ans: 4 -- 올바름, 극댓값6-극솟값2=4)
- math_misc_도함수_d3_001 (ans: 13 -- 올바름)

---

## 고난도(diff=3, 4) 문항 집중 검증 결과

### diff=4 문항 (KILLER 급)

| qid | 정답 검증 | 풀이 검증 |
|-----|-----------|-----------|
| math_seq_점화식_d4_001 (ans: 215) | OK - 주기10, 합75, 총215 | OK |
| math_misc_미분기타_d4_001 (ans: 9) | OK - c=1/2, f(2)=9 | OK |
| math_seq_점화식_d4_002 (ans: 223) | OK - 주기8, 합36, 총223 | OK |
| math_intg_정적분계산_d4_001 (ans: 24) | OK - f'(x)=6x, f(3)=24 | OK |
| math_seq_점화식_d4_003 (ans: 196) | OK - 주기7, 합35, 총196 | OK |
| math_intg_정적분계산_d4_002 (ans: 28) | OK - a=-4, f(4)=28 | OK |
| math_prob_베이즈_d4_001 (ans: 400) | OK - P(A|흰)=2/5, 1000p=400 | OK |
| math_seq_점화식_d4_004 (ans: 306) | OK - 주기12, 합102, 총306 | OK |
| math_intg_넓이_d4_001 (ans: 108) | OK - 접선y=16, 넓이108 | OK |

### diff=3 문항 (주요 항목 발췌)

| qid | 정답 검증 | 비고 |
|-----|-----------|------|
| math_diff_도함수_d3_001 (ans: 56) | OK | f(5)=125-75+6=56 |
| math_seq_시그마_d3_001 (ans: 115) | OK | a_{2k}=8k-1, 합=115 |
| math_seq_시그마_d3_002 (ans: 35) | OK | a_n=4n+3, a_8=35 |
| math_diff_도함수_d3_002 (ans: ③ 1) | OK | f(2)=8-12+5=1 |
| math_intg_넓이_d3_001 (ans: 64) | OK | S=32/3, 6S=64 |
| math_prob_조건부확률_d3_001 (ans: ① 3/4) | OK | P(A|W)=3/4 |
| math_misc_확률기타_d3_001 (ans: 22) | OK | 0.8185, 8+1+8+5=22 |
| math_lim_연속조건_d3_001 (ans: 3) | OK | f(1)+f'(2)=2+1=3 |
| math_diff_극값_d3_001 (ans: 1) | OK | a=-4, b=5, a+b=1 |
| math_misc_등비수열합_d3_001 (ans: 378) | OK | r=2, a1=6, S6=378 |
| math_misc_등비급수_d3_001 (ans: 625) | OK | r=5/8, 1000r=625 |
| math_misc_삼각방정식_d3_001 (ans: 63) | OK | 7해, S=21pi/2, 6S/pi=63 |
| math_misc_극한계산_d3_001 (ans: 32) | OK | p=4sqrt2/3, 9p^2=32 |
| math_misc_점화식_d3_001 (ans: 2) | OK | 주기3 합0, a13=2 |

---

## 복수 정답 의심
해당 사항 없음 (0건)

---

## 태그 오류
해당 사항 없음 (0건)

---

## PASS/FAIL 판정

### CONDITIONAL PASS

- **정답 오류 1건** 수정 필수: `math_misc_극한계산_d2_001`의 ans를 "1" (ans_index: 1)로 변경
- **형식 오류 1건** 수정 권장: `math_lim_극한계산_d2_001`의 단답형 분수 답을 정수화
- **풀이 누락 7건** 보충 권장: week2_fri_daily 문항들의 solution 작성

수정 완료 후 PASS 부여 가능.
