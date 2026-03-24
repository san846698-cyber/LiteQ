"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuizStore } from "@/stores/quiz-store";
import { fetchDailySet, SUBJECT_CONFIGS } from "@/lib/supabase/questions";
import ProgressPills from "@/components/quiz/ProgressPills";
import QuestionCard from "@/components/quiz/QuestionCard";
import PassagePanel from "@/components/quiz/PassagePanel";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  Send,
  Timer,
  Clock,
  Loader2,
  Play,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type TimerMode = "free" | "timed";

interface MockQuizPageProps {
  subjectKey: string;
  subjectLabel: string;
}

// ─── 시작 전 모드 선택 ──────────────────────────────
function StartScreen({
  subjectLabel,
  questionCount,
  timeLimitMin,
  mode,
  setMode,
  onStart,
  loading,
  error,
}: {
  subjectLabel: string;
  questionCount: number;
  timeLimitMin: number;
  mode: TimerMode;
  setMode: (m: TimerMode) => void;
  onStart: () => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-xl font-bold text-text-primary">
            {subjectLabel} 라이트 모의고사
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            {questionCount}문항 · 선택 후 일괄 채점
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-medium text-text-tertiary">타이머 모드 선택</p>
          <button
            onClick={() => setMode("free")}
            className={cn(
              "flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all",
              mode === "free"
                ? "border-accent-orange bg-accent-orange/5"
                : "border-border-light bg-surface hover:border-accent-orange/30"
            )}
          >
            <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", mode === "free" ? "bg-accent-orange text-white" : "bg-muted text-text-secondary")}>
              <Timer size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-text-primary">자유 모드</p>
              <p className="mt-0.5 text-xs text-text-secondary">시간 제한 없이 풀기 · 경과시간 측정</p>
            </div>
            {mode === "free" && <div className="h-3 w-3 rounded-full bg-accent-orange" />}
          </button>

          <button
            onClick={() => setMode("timed")}
            className={cn(
              "flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all",
              mode === "timed"
                ? "border-accent-orange bg-accent-orange/5"
                : "border-border-light bg-surface hover:border-accent-orange/30"
            )}
          >
            <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", mode === "timed" ? "bg-accent-orange text-white" : "bg-muted text-text-secondary")}>
              <Clock size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-text-primary">실전 모드</p>
              <p className="mt-0.5 text-xs text-text-secondary">{timeLimitMin}분 제한 · 시간 종료 시 자동 제출</p>
            </div>
            {mode === "timed" && <div className="h-3 w-3 rounded-full bg-accent-orange" />}
          </button>
        </div>

        {error && <p className="text-center text-sm text-incorrect">{error}</p>}

        <Button
          onClick={onStart}
          disabled={loading}
          className="w-full gap-2 bg-accent-orange py-6 text-base font-bold text-white hover:bg-accent-orange-dark"
        >
          {loading ? (
            <><Loader2 size={20} className="animate-spin" /> 문항 준비 중...</>
          ) : (
            <><Play size={20} /> 시작하기</>
          )}
        </Button>

        <Link href="/mock" className="block text-center text-xs text-text-tertiary hover:text-text-secondary">
          돌아가기
        </Link>
      </div>
    </div>
  );
}

// ─── 메인 ────────────────────────────────────────────
export default function MockQuizPage({ subjectKey, subjectLabel }: MockQuizPageProps) {
  const config = SUBJECT_CONFIGS[subjectKey];
  const timedSeconds = config?.timeLimitSeconds || 25 * 60;
  const timeLimitMin = Math.floor(timedSeconds / 60);

  const router = useRouter();
  const [phase, setPhase] = useState<"select" | "quiz">("select");
  const [timerMode, setTimerMode] = useState<TimerMode>("free");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(timedSeconds);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    questions, answers, currentIndex, elapsedSeconds,
    init, selectAnswer, goTo, next, prev, tick, complete,
  } = useQuizStore();

  const handleStart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const set = await fetchDailySet(subjectKey);
      if (set.length === 0) { setError("문항을 불러올 수 없습니다."); return; }
      init(set, timerMode, timerMode === "timed" ? timedSeconds : null);
      setCountdown(timedSeconds);
      setSubmitted(false);
      setPhase("quiz");
    } catch {
      setError("서버 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [init, subjectKey, timerMode, timedSeconds]);

  const handleSubmit = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);
    if (countdownRef.current) clearInterval(countdownRef.current);
    complete();
    router.push(`/mock/${subjectKey}/result`);
  }, [complete, router, submitted, subjectKey]);

  useEffect(() => {
    if (phase !== "quiz" || submitted) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [phase, tick, submitted]);

  useEffect(() => {
    if (phase !== "quiz" || timerMode !== "timed" || submitted) return;
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [phase, timerMode, submitted, handleSubmit]);

  const handleSelect = useCallback(
    (choiceIndex: number) => {
      const q = questions[currentIndex];
      if (!q || submitted) return;
      selectAnswer(q.id, choiceIndex);
    },
    [questions, currentIndex, selectAnswer, submitted]
  );

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id] !== undefined);

  if (phase === "select") {
    return (
      <StartScreen
        subjectLabel={subjectLabel}
        questionCount={config?.totalQuestions || 14}
        timeLimitMin={timeLimitMin}
        mode={timerMode}
        setMode={setTimerMode}
        onStart={handleStart}
        loading={loading}
        error={error}
      />
    );
  }

  if (questions.length === 0) return null;
  const currentQuestion = questions[currentIndex];

  const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const ratio = countdown / timedSeconds;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-border-light bg-cream/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link href="/mock" className="flex items-center text-text-secondary hover:text-text-primary">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-bold text-text-primary">{subjectLabel} 라이트 모의고사</h1>
          <span className="text-xs text-text-tertiary">{currentIndex + 1} / {questions.length}</span>
          <div className="ml-auto">
            {timerMode === "free" ? (
              <div className="flex items-center gap-2 rounded-full bg-surface px-4 py-1.5 font-mono text-sm font-bold text-text-secondary">
                <Timer size={16} />{fmtTime(elapsedSeconds)}
              </div>
            ) : (
              <div className={cn(
                "flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-sm font-bold transition-colors",
                ratio > 0.5 && "bg-surface text-text-primary",
                ratio <= 0.5 && ratio > 0.2 && "bg-accent-orange/10 text-accent-orange",
                ratio <= 0.2 && "bg-incorrect-light text-incorrect animate-pulse"
              )}>
                <Clock size={16} />{fmtTime(countdown)}
              </div>
            )}
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-4 pb-2">
          <div className="flex items-center gap-1.5 overflow-x-auto px-1 py-2">
            {questions.map((q, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2.5 min-w-[20px] flex-1 rounded-full transition-all ${
                  i === currentIndex
                    ? "ring-2 ring-accent-orange ring-offset-1 bg-accent-orange"
                    : answers[q.id]
                      ? "bg-accent-orange/40"
                      : "bg-border-light"
                }`}
                aria-label={`문제 ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-1 gap-6 px-4 py-6">
        {currentQuestion.passageText && (
          <div className="hidden w-[48%] shrink-0 lg:block">
            <div className="sticky top-32">
              <PassagePanel passage={currentQuestion.passageText} alwaysVisible />
            </div>
          </div>
        )}
        <div className="flex-1">
          <QuestionCard
            question={currentQuestion}
            index={currentIndex}
            answer={answers[currentQuestion.id]}
            onSelect={handleSelect}
            instantGrade={false}
          />
          <div className="mt-8 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={prev} disabled={currentIndex === 0} className="gap-1">
              <ArrowLeft size={16} /> 이전
            </Button>
            {currentIndex < questions.length - 1 ? (
              <Button variant="outline" size="sm" onClick={next} className="gap-1">
                다음 <ArrowRight size={16} />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!allAnswered} className="gap-2 bg-accent-orange text-white hover:bg-accent-orange-dark">
                <Send size={16} /> 제출하기
              </Button>
            )}
          </div>
          {currentIndex === questions.length - 1 && !allAnswered && (
            <p className="mt-3 text-center text-xs text-text-tertiary">
              아직 풀지 않은 문제가 있어요 ({questions.length - Object.keys(answers).length}문제 남음)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
