-- 001_questions.sql
-- LiteQ questions 테이블 생성

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject TEXT NOT NULL,                    -- korean / english / math
  area TEXT,                                -- 독서/문학/선택 or 읽기
  sub_area TEXT,                            -- 세부 영역 (글의 목적, 심경 변화 등)
  question_type TEXT,                       -- type-18, type-19 등
  difficulty TEXT NOT NULL DEFAULT 'medium', -- easy / medium / hard / killer
  points INT DEFAULT 2,
  week_target INT,                          -- 커리큘럼 주차
  passage_text TEXT,                        -- 지문
  question_text TEXT NOT NULL,              -- 발문
  choices JSONB NOT NULL,                   -- ["선지1","선지2",...]
  correct_answer INT NOT NULL,              -- 정답 인덱스 (0-based)
  explanations JSONB,                       -- { correct, wrong, key_point }
  recommended_time INT,                     -- 권장 시간 (초)
  concept_tags TEXT[],                      -- SR 알고리즘용 태그
  review_status TEXT DEFAULT 'approved',
  created_by TEXT DEFAULT 'opus_batch',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스: 과목 + 난이도 + 유형별 조회 최적화
CREATE INDEX idx_questions_subject ON questions(subject);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_question_type ON questions(question_type);
CREATE INDEX idx_questions_subject_difficulty ON questions(subject, difficulty);
