# LiteQ 통합 문제 스키마 제안서

## 공통 필드 (전 과목)

```json
{
  "qid": "string (고유 식별자)",
  "subject": "string (수학|국어|영어|생활과윤리|지구과학1)",
  "unit": "string (대단원)",
  "topic": "string (중단원)",
  "subtype": "string (세부 유형)",
  "diff": "number (1=기본, 2=표준, 3=도전, 4=킬러)",
  "pts": "number (배점)",
  "mode": "string (choice|short|set)",
  "rec_time": "string (권장 시간 MM:SS)",
  "stem": "string (발문/문제 텍스트)",
  "tex": "string|null (LaTeX 수식, 수학 전용)",
  "passage": "string|null (지문, 국어/영어용)",
  "opts": "string[]|null (선지 배열, choice 모드)",
  "ans": "string (정답)",
  "ans_index": "number|null (객관식 0-based 인덱스)",
  "solution": "string (풀이 텍스트)",
  "solTex": "string|null (풀이 LaTeX)",
  "solNote": "string|null (추가 팁)",
  "explanations": "object|null (국어/영어용 RichExplanation)",
  "tags": "string[] (개념 태그)",
  "status": "string (draft|approved|retired)",
  "source": "string (출처 파일명)",
  "source_id": "number|string (원본 문항 ID)",
  "created_at": "string (생성일 YYYY-MM-DD)",
  "used_count": "number (사용 횟수)",
  "last_used": "string|null (마지막 사용일)"
}
```

## 과목별 확장 필드

### 수학
- `tex`: LaTeX 수식 (KaTeX 호환) — **필수**
- `solTex`: 풀이 LaTeX — **필수**
- `passage`: null (미사용)
- `explanations`: null (미사용, solution/solTex로 대체)

### 국어
- `passage`: 지문 텍스트 — **필수** (독서/문학)
- `passage_type`: "독서|문학|선택-화작|선택-언매"
- `passage_group`: "string (같은 지문 세트 ID)" — 지문 1개에 문항 여러 개 연결
- `explanations`: `{ correct, wrong: {1:..., 2:...}, key_point }` — **필수**
- `tex`: null (미사용)
- `solTex`: null (미사용)

### 영어
- `passage`: 영어 지문 — **필수**
- `passage_word_count`: number (지문 단어 수)
- `passage_group`: "string (같은 지문 세트 ID)"
- `explanations`: `{ correct, wrong, key_point }` — **필수**

### 탐구 (생윤/지학)
- `passage`: 지문/상황 설명 (있으면)
- `image_ref`: "string|null (시각 자료 참조, 향후 확장)"
- `explanations`: `{ correct, wrong, key_point }` — **필수**

## QID 생성 규칙

```
{subject}_{topic_short}_{subtype_short}_{diff}_{seq}

과목별 prefix:
- math_ (수학)
- kor_ (국어)
- eng_ (영어)
- eth_ (생활과윤리)
- es_ (지구과학1)
```

## mode 값

| mode | 설명 | 해당 과목 |
|------|------|-----------|
| choice | 5지선다 객관식 | 전 과목 |
| short | 단답형 (0~999 자연수) | 수학 |
| set | 지문+다중 문항 세트 | 국어, 영어 (향후) |

## 호환성 요약

| 필드 | 수학 | 국어 | 영어 | 탐구 |
|------|------|------|------|------|
| tex/solTex | ✓ | - | - | - |
| passage | - | ✓ | ✓ | △ |
| passage_group | - | ✓ | ✓ | - |
| explanations | - | ✓ | ✓ | ✓ |
| image_ref | - | - | - | △ |
| ans_index | ✓ | ✓ | ✓ | ✓ |

(`-` = null, `△` = 선택적)
