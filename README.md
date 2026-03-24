# LiteQ — AI 기반 초개인화 수능 학습 플랫폼

매일 맞춤형 모의고사를 풀고, 즉각 피드백을 받고, 취약점을 분석받는 서비스입니다.

## 기술 스택

- **Frontend**: Next.js 16 (App Router) + Tailwind CSS v4
- **Backend & DB**: Supabase (PostgreSQL)
- **State**: Zustand
- **UI**: shadcn/ui + Radix UI
- **Deploy**: Vercel

## 지원 과목

| 과목 | 일간지 | 모의고사 | DB 문항 수 |
|------|--------|---------|-----------|
| 국어 | 15문항 | 15문항 / 30분 | 150 |
| 영어 | 14문항 | 14문항 / 25분 | 379 |
| 생활과윤리 | 10문항 | 10문항 / 15분 | 50 |
| 지구과학1 | 10문항 | 10문항 / 15분 | 40 |

## 로컬 개발

```bash
npm install

cp .env.local.example .env.local
# .env.local에 Supabase URL과 Anon Key 입력

npm run dev
```

## Supabase 설정

### 1. 테이블 생성

Supabase Dashboard → SQL Editor에서 `supabase/migrations/001_questions.sql` 실행.

### 2. RLS 정책

```sql
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON questions FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete" ON questions FOR DELETE USING (true);
```

### 3. 문항 적재 (619문항)

```bash
node scripts/seed-to-supabase.js
```

## Vercel 배포

### 방법 1: Git 연동 (권장)

1. GitHub에 레포 push
2. [vercel.com](https://vercel.com) → **Add New Project** → 레포 선택
3. **Environment Variables** 추가:

   | 변수명 | 값 | 예시 |
   |--------|---|------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | `https://xxxxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbGciOi...` |

4. **Deploy** 클릭

> `NEXT_PUBLIC_` 접두사가 있어야 클라이언트에서 접근 가능합니다.

### 방법 2: Vercel CLI

```bash
npx vercel login
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel --prod
```

## 프로젝트 구조

```
src/
├── app/(main)/          # 메인 앱 (하단 탭 네비게이션)
│   ├── daily/           # 일간지 — 4과목
│   ├── mock/            # 라이트 모의고사 — 4과목
│   ├── home/            # 홈 대시보드
│   ├── stats/           # 학습 통계
│   └── mypage/          # 마이페이지
├── components/quiz/     # 퀴즈 컴포넌트 (범용)
├── lib/supabase/        # Supabase 클라이언트 + 쿼리
├── stores/              # Zustand 스토어
└── types/               # TypeScript 타입

data/
├── csat-english/        # 영어 문항 (379)
├── csat-korean/         # 국어 문항 (150)
├── csat-ethics/         # 생활과윤리 문항 (50)
└── csat-earthsci/       # 지구과학1 문항 (40)

scripts/
├── seed-to-supabase.js          # 전 과목 DB 적재
├── check-labeling-all.js        # 라벨링 검증
└── fix-answer-distribution.js   # 정답 위치 균등 보정
```
