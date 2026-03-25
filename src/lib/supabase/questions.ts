import type { Question, Difficulty, Subject } from "@/types/quiz";

/** 과목별 설정 */
export interface SubjectConfig {
  subject: Subject;
  label: string;
  totalQuestions: number;
  slots: { difficulty: Difficulty[]; count: number }[];
  timeLimitSeconds: number | null;
}

export const SUBJECT_CONFIGS: Record<string, SubjectConfig> = {
  korean: {
    subject: "korean",
    label: "국어",
    totalQuestions: 6,
    slots: [
      { difficulty: ["easy"], count: 2 },
      { difficulty: ["medium"], count: 2 },
      { difficulty: ["hard", "killer"], count: 2 },
    ],
    timeLimitSeconds: null, // 일간지: 시간제한 없음
  },
  english: {
    subject: "english",
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

/** 과목별 로컬 seed 로더 */
async function loadLocalSeed(subjectKey: string): Promise<Question[]> {
  switch (subjectKey) {
    case "korean": {
      const { KOREAN_SEED } = await import("@/data/korean-seed");
      return KOREAN_SEED;
    }
    case "english": {
      const { ENGLISH_SEED } = await import("@/data/english-seed");
      return ENGLISH_SEED;
    }
    case "ethics": {
      const { ETHICS_SEED } = await import("@/data/ethics-seed");
      return ETHICS_SEED;
    }
    case "earthscience": {
      const { EARTHSCIENCE_SEED } = await import("@/data/earthscience-seed");
      return EARTHSCIENCE_SEED;
    }
    default:
      return [];
  }
}

/** 셔플 유틸 */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 국어 영역 키워드 판별 */
const KOREAN_READING_AREAS = ["독서", "선택-화작", "선택-언매"];
const KOREAN_LIT_AREAS = ["문학"];

function isKoreanReading(q: Question): boolean {
  return KOREAN_READING_AREAS.some((a) => q.area.includes(a)) ||
    q.subArea?.includes("독서") || false;
}

function isKoreanLit(q: Question): boolean {
  return KOREAN_LIT_AREAS.some((a) => q.area.includes(a)) ||
    q.subArea?.includes("문학") || false;
}

/**
 * 일간지/모의고사 세트 구성 (로컬 데이터)
 * 국어: 비문학 3 + 문학 3 = 6문제 (지문 단위 혼합)
 * 기타: 난이도 배분 + 유형 비중복 + 셔플
 */
export async function fetchDailySet(
  subjectKey: string,
): Promise<Question[]> {
  const config = SUBJECT_CONFIGS[subjectKey];
  if (!config) throw new Error(`Unknown subject: ${subjectKey}`);

  const allQuestions = await loadLocalSeed(subjectKey);
  if (allQuestions.length === 0) return [];

  // 국어: 비문학 3 + 문학 3 혼합
  if (subjectKey === "korean") {
    const reading = shuffle(allQuestions.filter(isKoreanReading));
    const lit = shuffle(allQuestions.filter(isKoreanLit));
    const usedTypes = new Set<string>();
    const selected: Question[] = [];

    // 비문학 3문제 (유형 비중복)
    for (const q of reading) {
      if (selected.length >= 3) break;
      if (usedTypes.has(q.questionType)) continue;
      usedTypes.add(q.questionType);
      selected.push(q);
    }

    // 문학 3문제 (유형 비중복)
    for (const q of lit) {
      if (selected.length >= 6) break;
      if (usedTypes.has(q.questionType)) continue;
      usedTypes.add(q.questionType);
      selected.push(q);
    }

    // 부족하면 채우기
    if (selected.length < 6) {
      const ids = new Set(selected.map((q) => q.id));
      for (const q of shuffle(allQuestions)) {
        if (selected.length >= 6) break;
        if (ids.has(q.id)) continue;
        selected.push(q);
        ids.add(q.id);
      }
    }

    return selected;
  }

  // 기타 과목: 기존 난이도 배분 로직
  const selected: Question[] = [];
  const usedTypes = new Set<string>();

  for (const slot of config.slots) {
    const pool = shuffle(
      allQuestions.filter(
        (q) =>
          (slot.difficulty as string[]).includes(q.difficulty) &&
          !usedTypes.has(q.questionType)
      )
    );

    let picked = 0;
    for (const q of pool) {
      if (picked >= slot.count) break;
      if (usedTypes.has(q.questionType)) continue;
      usedTypes.add(q.questionType);
      selected.push(q);
      picked++;
    }
  }

  // 부족하면 유형 제약 완화
  if (selected.length < config.totalQuestions) {
    const selectedIds = new Set(selected.map((q) => q.id));
    const remaining = shuffle(
      allQuestions.filter((q) => !selectedIds.has(q.id))
    );
    for (const q of remaining) {
      if (selected.length >= config.totalQuestions) break;
      selected.push(q);
    }
  }

  return selected.slice(0, config.totalQuestions);
}

/** 하위호환 */
export async function fetchDailyEnglishSet(): Promise<Question[]> {
  return fetchDailySet("english");
}
