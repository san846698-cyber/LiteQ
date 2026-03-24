import { getSupabase } from "./client";
import type { Question, Difficulty, Subject } from "@/types/quiz";

/** Supabase 환경변수가 설정되어 있는지 확인 */
function hasSupabaseConfig(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** DB row → 앱 Question 변환 */
function mapRow(row: Record<string, unknown>): Question {
  return {
    id: row.id as string,
    subject: row.subject as Question["subject"],
    area: (row.area as string) || "",
    subArea: row.sub_area as string | undefined,
    questionType: row.question_type as string,
    difficulty: row.difficulty as Difficulty,
    points: row.points as number,
    passageText: row.passage_text as string | undefined,
    questionText: row.question_text as string,
    choices: row.choices as string[],
    correctAnswer: row.correct_answer as number,
    explanations: row.explanations as Question["explanations"],
    recommendedTime: row.recommended_time as number | undefined,
    conceptTags: row.concept_tags as string[] | undefined,
  };
}

/** 과목별 일간지 설정 */
export interface SubjectConfig {
  subject: Subject;
  dbSubject: string; // DB의 subject 컬럼값
  label: string;
  totalQuestions: number;
  slots: { difficulty: Difficulty[]; count: number }[];
  timeLimitSeconds: number | null; // 모의고사 제한시간
}

export const SUBJECT_CONFIGS: Record<string, SubjectConfig> = {
  korean: {
    subject: "korean",
    dbSubject: "korean",
    label: "국어",
    totalQuestions: 15,
    slots: [
      { difficulty: ["easy"], count: 3 },
      { difficulty: ["medium"], count: 7 },
      { difficulty: ["hard", "killer"], count: 5 },
    ],
    timeLimitSeconds: 30 * 60,
  },
  english: {
    subject: "english",
    dbSubject: "english",
    label: "영어",
    totalQuestions: 14,
    slots: [
      { difficulty: ["easy"], count: 5 },
      { difficulty: ["medium"], count: 5 },
      { difficulty: ["hard", "killer"], count: 4 },
    ],
    timeLimitSeconds: 25 * 60,
  },
  ethics: {
    subject: "ethics",
    dbSubject: "ethics",
    label: "생활과윤리",
    totalQuestions: 10,
    slots: [
      { difficulty: ["easy"], count: 3 },
      { difficulty: ["medium"], count: 4 },
      { difficulty: ["hard", "killer"], count: 3 },
    ],
    timeLimitSeconds: 15 * 60,
  },
  earthscience: {
    subject: "earthscience",
    dbSubject: "earthscience",
    label: "지구과학1",
    totalQuestions: 10,
    slots: [
      { difficulty: ["easy"], count: 3 },
      { difficulty: ["medium"], count: 4 },
      { difficulty: ["hard", "killer"], count: 3 },
    ],
    timeLimitSeconds: 15 * 60,
  },
};

/**
 * 범용 일간지 세트 구성
 * 난이도 배분 + 유형 겹치지 않게 + 안 푼 문항 우선
 */
export async function fetchDailySet(
  subjectKey: string,
  attemptedIds: string[] = []
): Promise<Question[]> {
  const config = SUBJECT_CONFIGS[subjectKey];
  if (!config) throw new Error(`Unknown subject: ${subjectKey}`);

  // Supabase 미설정 시 로컬 seed fallback (영어만)
  if (!hasSupabaseConfig()) {
    console.warn("[LiteQ] Supabase not configured — using local seed data");
    if (subjectKey === "english") {
      const { ENGLISH_DAILY_SET } = await import("@/data/english-daily-set");
      return ENGLISH_DAILY_SET;
    }
    return [];
  }

  const selected: Question[] = [];
  const usedTypes = new Set<string>();

  for (const slot of config.slots) {
    let query = getSupabase()
      .from("questions")
      .select("*")
      .eq("subject", config.dbSubject)
      .in("difficulty", slot.difficulty)
      .eq("review_status", "approved");

    if (attemptedIds.length > 0) {
      query = query.not("id", "in", `(${attemptedIds.join(",")})`);
    }

    if (usedTypes.size > 0) {
      query = query.not(
        "question_type",
        "in",
        `(${[...usedTypes].join(",")})`
      );
    }

    const { data, error } = await query.limit(50);
    if (error) {
      console.error("Supabase query error:", error);
      continue;
    }
    if (!data || data.length === 0) continue;

    const shuffled = data.sort(() => Math.random() - 0.5);
    let picked = 0;
    for (const row of shuffled) {
      if (picked >= slot.count) break;
      const type = row.question_type as string;
      if (usedTypes.has(type)) continue;
      usedTypes.add(type);
      selected.push(mapRow(row));
      picked++;
    }
  }

  // 부족하면 유형 제약 완화
  if (selected.length < config.totalQuestions) {
    const selectedIds = new Set(selected.map((q) => q.id));
    const { data: extra } = await getSupabase()
      .from("questions")
      .select("*")
      .eq("subject", config.dbSubject)
      .eq("review_status", "approved")
      .limit(50);

    if (extra) {
      const shuffled = extra.sort(() => Math.random() - 0.5);
      for (const row of shuffled) {
        if (selected.length >= config.totalQuestions) break;
        if (selectedIds.has(row.id as string)) continue;
        selected.push(mapRow(row));
        selectedIds.add(row.id as string);
      }
    }
  }

  return selected.slice(0, config.totalQuestions);
}

/** 하위호환: 영어 일간지 전용 */
export async function fetchDailyEnglishSet(
  attemptedIds: string[] = []
): Promise<Question[]> {
  return fetchDailySet("english", attemptedIds);
}

/** 특정 문항 조회 */
export async function fetchQuestionById(
  id: string
): Promise<Question | null> {
  const { data, error } = await getSupabase()
    .from("questions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return mapRow(data);
}
