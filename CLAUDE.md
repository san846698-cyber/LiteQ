# CLAUDE.md — LiteQ Project Context

## 프로젝트 개요
LiteQ는 AI 기반 초개인화 학습 플랫폼입니다. 수험생이 매일 맞춤형 모의고사를 풀고, 즉각 피드백을 받고, 취약점을 분석받는 서비스입니다.

## MVP 타겟
- 한국 수능 수험생 (고3 + N수생)
- 과목: 국어 → 영어 → 수학 → 탐구 순차 확장
- MVP는 국어 + 영어부터 시작

## 기술 스택
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend & DB**: Supabase (PostgreSQL + pgvector)
- **Auth**: Supabase Auth (카카오/구글 소셜 로그인)
- **AI**: Claude API (Sonnet 4.6 실시간 / Opus Batch 사전생성)
- **Payments**: Stripe (구독 관리 + 7일 무료체험)
- **Push**: 카카오 알림톡 API + Web Push
- **Deploy**: Vercel (프론트) + Supabase (백엔드)
- **State**: Zustand (클라이언트)
- **UI Components**: shadcn/ui + Radix UI

## 디자인 시스템
기존 프로토타입(liteq_daily_일간지_v1.jsx)의 디자인 토큰을 따릅니다:
```
배경: #F5F0E8 (따뜻한 크림)
표면: #FFFFFF
액센트: #C4642A (따뜻한 오렌지)
정답: #2D8B5E (그린)
오답: #C0392B (레드)
텍스트: #1A1915
보조텍스트: #6B6560
폰트: Pretendard (본문), Noto Serif KR (지문)
```

## 브랜드 톤
- 압박을 주지 않는 따뜻한 서비스
- 맞혔을 때: "오늘도 한 걸음 나아갔어요"
- 틀렸을 때: "오늘 발견한 약점이 내일의 무기예요"
- 스트릭 끊겼을 때: "때로는 휴식도 필요하죠"

## 3-Tier 가격 모델
| 티어 | 가격 | 핵심 기능 |
|------|------|-----------|
| Light ($4.99/월) | AI 커리큘럼 배달 | 일간지 + 라이트 모의고사 + 해설 |
| Pro ($19.99/월) | 내 자료 기반 문제 | Light + PDF 업로드 RAG + 요약 PUSH |
| MAX ($29.99/월) | 성과 분석 + 보충 | Pro + SVG 보충자료 + 플래시카드 + 리포트 |

## 핵심 학습 기능
### 일간지 (Daily — 개념 점검)
- 시간 제한 없음, 매일 개념 단위 출제
- 풀이 + 권장 시간 표시
- "나는 이 개념을 알고 있는가?" 점검

### 라이트 모의고사 (Weekly 1~2회 — 실전 감각)
- 전체 타이머 있음 (실제 시험 비율 축소)
- 풀이 + 권장 시간 + 내가 쓴 시간 비교
- "나는 시간 안에 이 문제를 풀 수 있는가?" 훈련

### 과목별 시간 설계
| 과목 | 일간지 | 라이트 모의고사 |
|------|--------|----------------|
| 국어 | 15문제 / 시간제한 없음 | 15문제 / 30분 (페이즈별 차등) |
| 영어 | 14문제 / 시간제한 없음 | 14문제 / 25분 |
| 수학 | Lite 9문제 / Half 18문제 | Lite 30분 / Half 60분 |

## 프로젝트 구조
```
liteq/
├── CLAUDE.md                    # 이 파일
├── next.config.js
├── tailwind.config.js
├── package.json
│
├── public/
│   └── icons/                   # PWA 아이콘
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx           # 루트 레이아웃
│   │   ├── page.tsx             # 랜딩 페이지
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (main)/              # 인증 후 메인 앱 (하단 탭 네비게이션)
│   │   │   ├── layout.tsx       # 하단 탭바 레이아웃
│   │   │   ├── home/page.tsx    # 홈 (오늘의 학습)
│   │   │   ├── daily/           # 일간지
│   │   │   │   ├── page.tsx     # 과목 선택
│   │   │   │   └── [subject]/   # 국어/영어/수학
│   │   │   │       ├── page.tsx # 문제 풀이 화면
│   │   │   │       └── result/page.tsx
│   │   │   ├── mock/            # 라이트 모의고사
│   │   │   │   ├── page.tsx
│   │   │   │   └── [subject]/page.tsx
│   │   │   ├── stats/page.tsx   # 학습 통계
│   │   │   └── mypage/page.tsx  # 마이페이지
│   │   └── onboarding/
│   │       └── page.tsx         # 온보딩 (시험+D-Day 설정)
│   │
│   ├── components/
│   │   ├── ui/                  # shadcn/ui 컴포넌트
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx    # 하단 탭 네비게이션
│   │   │   ├── Header.tsx
│   │   │   └── MobileDrawer.tsx
│   │   ├── quiz/
│   │   │   ├── PassagePanel.tsx      # 지문 표시 (국어/영어)
│   │   │   ├── QuestionCard.tsx      # 문제 카드
│   │   │   ├── ChoiceButton.tsx      # 선지 버튼
│   │   │   ├── ExplanationPanel.tsx  # 해설 패널
│   │   │   ├── Timer.tsx             # 타이머 (라이트 모의고사용)
│   │   │   ├── ProgressBar.tsx       # 진행 상태
│   │   │   └── ResultScreen.tsx      # 결과 화면
│   │   ├── home/
│   │   │   ├── DdayBanner.tsx
│   │   │   ├── StreakCard.tsx
│   │   │   ├── TodayMission.tsx
│   │   │   └── WeeklyProgress.tsx
│   │   └── stats/
│   │       ├── AccuracyChart.tsx
│   │       ├── WeakPointCard.tsx
│   │       └── SubjectProgress.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── ai/
│   │   │   ├── generate-questions.ts   # Claude API 문제 생성
│   │   │   └── check-answer.ts
│   │   └── utils/
│   │       ├── timer.ts
│   │       ├── spaced-repetition.ts    # SR 알고리즘
│   │       └── curriculum.ts           # 커리큘럼 생성
│   │
│   ├── stores/
│   │   ├── quiz-store.ts        # 퀴즈 상태 관리
│   │   ├── user-store.ts        # 유저 상태
│   │   └── app-store.ts         # 앱 전역 상태
│   │
│   ├── types/
│   │   ├── quiz.ts
│   │   ├── user.ts
│   │   └── curriculum.ts
│   │
│   └── styles/
│       └── globals.css
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_users.sql
│   │   ├── 002_questions.sql
│   │   ├── 003_attempts.sql
│   │   ├── 004_curriculum.sql
│   │   └── 005_streaks.sql
│   └── seed.sql
│
└── docs/
    ├── PRD.md
    ├── 수능_국어_구성.md
    ├── 수능_영어_구성.md
    ├── 수능_수학_구성.md
    └── 차별화_전략.md
```

## DB 스키마 (핵심 테이블)

### users
```sql
id UUID PRIMARY KEY,
email TEXT UNIQUE,
name TEXT,
avatar_url TEXT,
target_exam TEXT DEFAULT 'suneung',   -- 목표 시험
d_day DATE,                           -- D-Day
tier TEXT DEFAULT 'light',            -- light / pro / max
streak_count INT DEFAULT 0,
longest_streak INT DEFAULT 0,
created_at TIMESTAMPTZ DEFAULT now()
```

### questions
```sql
id UUID PRIMARY KEY,
subject TEXT NOT NULL,          -- korean / english / math
area TEXT,                      -- 독서/문학/선택 or 읽기 유형
sub_area TEXT,                  -- 세부 영역
question_type TEXT,             -- 내용일치/빈칸추론 등
difficulty TEXT,                -- easy/medium/hard
points INT DEFAULT 2,
week_target INT,                -- 커리큘럼 주차
passage_text TEXT,              -- 지문
question_text TEXT NOT NULL,    -- 발문
choices JSONB NOT NULL,         -- ["선지1","선지2",...]
correct_answer INT NOT NULL,    -- 정답 인덱스
explanations JSONB,             -- ["해설1","해설2",...]
recommended_time INT,           -- 권장 시간 (초)
concept_tags TEXT[],            -- SR 알고리즘용 태그
review_status TEXT DEFAULT 'draft',
created_by TEXT DEFAULT 'opus_batch'
```

### attempts
```sql
id UUID PRIMARY KEY,
user_id UUID REFERENCES users(id),
question_id UUID REFERENCES questions(id),
session_type TEXT,             -- daily / mock / weekly
selected_answer INT,
is_correct BOOLEAN,
time_spent INT,                -- 소요 시간 (초)
created_at TIMESTAMPTZ DEFAULT now()
```

### daily_sessions
```sql
id UUID PRIMARY KEY,
user_id UUID REFERENCES users(id),
subject TEXT,
session_date DATE,
total_questions INT,
correct_count INT,
total_time INT,
completed BOOLEAN DEFAULT false,
created_at TIMESTAMPTZ DEFAULT now()
```

## 페이지별 구현 명세

### 1. 홈 화면 (/home)
- D-Day 카운트다운 배너 (최상단)
- 스트릭 카드 (연속 학습일 + 불꽃 아이콘)
- 오늘의 미션 카드 (일간지 국어/영어 미완료 표시)
- 주간 진행률 (월~일 도트 표시)
- 이번 주 라이트 모의고사 알림

### 2. 일간지 (/daily/[subject])
- 데스크탑: 좌측 지문 + 우측 문제 (split view)
- 모바일: 문제 목록 + 지문 드로어
- 선지 클릭 즉시 채점 + 해설 토글
- 상단 진행 pill 표시
- 결과 화면: 정답률 + 영역별 분석 + 격려 메시지

### 3. 라이트 모의고사 (/mock/[subject])
- 전체 타이머 (상단 고정)
- 문제별 시간 기록 (백그라운드)
- 모든 문제 풀이 후 일괄 채점
- 결과: 정답/오답 + 권장시간 vs 내 시간 비교
- 시간 분석 차트

### 4. 통계 (/stats)
- 과목별 정답률 추이 (최근 4주)
- 취약 유형 TOP 5
- 누적 학습 진도율
- 스트릭 캘린더

### 5. 마이페이지 (/mypage)
- 프로필 + 구독 티어
- D-Day 수정
- 알림 설정
- 오답 노트
- 로그아웃

## 모바일 퍼스트 설계 원칙
- 하단 탭 네비게이션 (홈/일간지/모의고사/통계/MY)
- 모든 터치 타겟 최소 44px
- 스와이프 제스처 지원 (문제 간 이동)
- 안전 영역(Safe Area) 고려
- 다크모드 미지원 (MVP에서는 라이트만)

## 코딩 컨벤션
- TypeScript strict mode
- 컴포넌트: PascalCase, 파일명도 PascalCase
- 유틸/훅: camelCase
- Tailwind 클래스 순서: layout → spacing → sizing → typography → colors → effects
- 한글 주석 사용 가능 (팀 내부 프로젝트)
- 에러 바운더리 필수 적용
- 로딩 상태는 Skeleton UI 사용

## 개발 순서 (Claude Code에서)
1. `npx create-next-app@latest liteq` — 프로젝트 생성
2. Tailwind + shadcn/ui 설정
3. 디자인 시스템 (colors, fonts, tokens) 세팅
4. 하단 탭 레이아웃 + 라우팅
5. 홈 화면 UI
6. 일간지 — 영어 과목 (지문+문제 풀이 풀 플로우)
7. 결과 화면
8. 라이트 모의고사 (타이머 포함)
9. 통계 대시보드
10. Supabase 연동 (Auth + DB)
11. 온보딩 플로우
12. PWA 설정 (manifest + service worker)
