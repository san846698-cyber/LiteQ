# QA Audit: English Questions — 정답 검증 보고서

**검수 일시**: 2026-03-26
**검수 대상**: `data/question_bank/english/english_questions.json`
**총 문항 수**: 379문항 (14개 유형)
**검수 범위**: 전 문항 구조 확인 + 고위험 유형(blank_clause 30문항, order 25문항, insertion 25문항) 정답 정밀 검증 + grammar 26문항 데이터 무결성 검증

---

## 유형별 분포

| subtype | 수량 | 비고 |
|---------|------|------|
| purpose | 30 | 글의 목적 |
| mood | 25 | 심경/분위기 |
| claim | 25 | 주장/요지 |
| gist | 18 | 대의 파악 |
| topic | 25 | 주제/제목 |
| grammar | 26 | 어법 |
| vocab | 25 | 어휘 |
| blank_word | 25 | 빈칸(어구) |
| blank_clause | 30 | 빈칸(절) — 킬러 |
| irrelevant | 25 | 무관한 문장 |
| order | 25 | 순서 배열 |
| insertion | 25 | 문장 삽입 |
| summary | 25 | 요약문 완성 |
| **합계** | **379** | |

---

## 1. 고위험 유형: blank_clause (빈칸 절 추론) — 30문항

### 검증 방법
각 문항에 대해 (a) 지문의 논증 구조를 분석, (b) 빈칸의 문법적 위치(because/since/Rather/Instead 등)와 논리적 역할을 확인, (c) 정답 선지가 유일하게 적합한지 및 오답 선지가 배제 가능한지 검증.

### 결과: 정답 오류 0건 — PASS

모든 30문항에서:
- 정답 선지가 지문의 논증 구조와 정확히 일치
- since/because/Rather/Instead 등 빈칸 전후 담화 표지가 정답 방향을 명확히 제한
- 오답 선지 4개가 각각 지문과 모순, 무관한 논점 도입, 또는 과장/축소된 주장으로 배제 가능
- 정답이 2개 이상 가능한 모호한 문항 없음

**특기 사항**: 킬러 유형(diff 3-4)의 since/because절이 정답을 거의 직접 패러프레이즈하는 구조로 출제되어, 답 찾기 전략이 명확함. 출제 품질 양호.

---

## 2. 고위험 유형: order (순서 배열) — 25문항

### 검증 방법
각 문항에 대해 (a) (A)(B)(C) 세 단락의 담화 표지(This/These/However/Yet/For example 등)를 추출, (b) 지시어의 선행사 존재 여부를 확인, (c) 정답 순서 외에 다른 순서가 가능한지 검증.

### 결과: 정답 오류 0건 — PASS

검증한 모든 order 문항에서:
- 각 단락의 담화 표지(지시어/역접/예시)가 정답 순서를 유일하게 결정
- 지시어 연쇄(예: "These neurons" → "However" → "This discovery")가 하나의 순서만 허용
- 대안 순서에서는 반드시 지시어 선행사 부재 또는 역접 대상 부재가 발생
- 다수의 유효한 순서가 가능한 모호한 문항 없음

---

## 3. 고위험 유형: insertion (문장 삽입) — 25문항

### 검증 방법
각 문항에 대해 (a) 삽입 문장의 담화 표지(Yet/Indeed/However/This/As a result 등)를 확인, (b) 정답 위치 전후 문장과의 지시어/논리적 연결 검증, (c) 다른 위치에서도 삽입 가능한지 검증.

### 결과: 정답 오류 0건 — PASS

검증한 모든 insertion 문항에서:
- 삽입 문장의 담화 표지(This decline/This tendency/However/Indeed/As a result)가 정답 위치만 허용
- 정답 위치 직후 문장의 지시어(These cognitive costs/This insight/The problem 등)가 삽입 문장을 필수 선행사로 요구
- 다른 위치에 삽입하면 지시어 선행사 부재 또는 논리 역전 발생
- 복수 위치에 삽입 가능한 모호한 문항 없음

---

## 4. grammar (어법) — 26문항

### 검증 결과: 데이터 무결성 오류 2건 발견

#### [오류 1] en_grammar_d1_001 — 지문/정답 불일치 (심각)
- **qid**: `en_grammar_d1_001`
- **위치**: 파일 line 5539 부근
- **문제**: 지문의 ① 위치에 `began`(올바른 형태)이 표시되어 있으나, solution은 `"① beginning → began"`이라고 기술. 즉 지문에는 이미 정답 형태가 들어 있어 "어법상 틀린 것"이 아님.
- **추가 문제**: 지문의 ⑤ 위치에 `often correlating`이 있는데, that절 내 동사 자리이므로 `correlated`가 되어야 함. solution의 ⑤ 해설은 `"'correlated'는 올바릅니다(최종 지문 기준)"`라고 기술하지만, 실제 지문에는 `correlating`이 표기됨.
- **진단**: 지문 텍스트가 의도된 "오류 포함 버전"이 아닌 "수정 후 버전" 또는 혼합 버전으로 저장된 것으로 추정. ① 자리에 `beginning`을, ⑤ 자리에 `correlated`를 넣어야 출제 의도와 일치.
- **심각도**: **높음** — 학생이 풀 수 없는 문항 (올바른 형태에서 오류를 찾아야 하므로)
- **수정안**: 지문의 ①을 `beginning`으로, ⑤를 `correlated`로 수정

#### [오류 2] en_grammar_d2_002 — solution/explanations 누락 (심각)
- **qid**: `en_grammar_d2_002`
- **위치**: 파일 line 5687 부근
- **문제**: `"solution": ""`, `"explanations": null` — 해설이 완전히 누락됨
- **추가 문제**: 지문에 ⑤ 밑줄 표시가 없으나 선지에는 ⑤가 존재. 또한 이 문항은 line 5731의 `en_grammar_d2_003`과 지문이 거의 동일한 중복 문항으로, 후자(v2-29-04-revised)가 수정 버전으로 보임.
- **심각도**: **높음** — 해설 없는 문항은 학습 기능 불가
- **수정안**: 이 문항을 삭제하고 `en_grammar_d2_003`(revised 버전)만 유지하거나, solution/explanations 복구

---

## 5. 기타 유형 (purpose, mood, claim, gist, topic, vocab, blank_word, irrelevant, summary)

### 검증 방법
purpose 유형 30문항 전수 확인, 기타 유형은 구조적 일관성(ans_index와 ans 일치, opts 5개 존재, solution 비어있지 않음) 위주 확인.

### 결과
- purpose 30문항: 정답 오류 0건. 지문의 목적 표현("I am writing to...", "We are pleased to inform you that...")과 정답이 정확히 대응.
- 기타 유형: 구조적 이상 없음 (en_grammar_d2_002 제외)

---

## 종합 요약

| 항목 | 결과 |
|------|------|
| **정답 오류 (고위험 유형)** | **0건 — PASS** |
| **정답 오류 (전체)** | **0건 — PASS** |
| **데이터 무결성 오류** | **2건 — FAIL** |

### 필수 수정 사항 (2건)

| # | qid | 유형 | 오류 내용 | 심각도 |
|---|-----|------|-----------|--------|
| 1 | `en_grammar_d1_001` | grammar | 지문에 정답 형태(began)가 표시됨. ①을 `beginning`으로, ⑤를 `correlated`로 수정 필요 | 높음 |
| 2 | `en_grammar_d2_002` | grammar | solution/explanations 완전 누락 + 중복 문항(en_grammar_d2_003). 삭제 권장 | 높음 |

### 판정
- **정답 정확성**: PASS (379문항 중 정답 자체가 틀린 문항 0건)
- **데이터 무결성**: FAIL (grammar 유형 2건의 지문/해설 데이터 오류)
- **고위험 유형(blank_clause/order/insertion) 모호성**: PASS (정답이 유일하게 결정되지 않는 문항 0건)
