"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuizStore } from "@/stores/quiz-store";
import { fetchDailySet } from "@/lib/supabase/questions";
import ProgressPills from "@/components/quiz/ProgressPills";
import QuestionCard from "@/components/quiz/QuestionCard";
import PassagePanel from "@/components/quiz/PassagePanel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface DailyQuizPageProps {
  subjectKey: string;
  subjectLabel: string;
  backHref?: string;
}

export default function DailyQuizPage({
  subjectKey,
  subjectLabel,
  backHref = "/daily",
}: DailyQuizPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    questions,
    answers,
    currentIndex,
    elapsedSeconds,
    init,
    selectAnswer,
    goTo,
    next,
    prev,
    tick,
  } = useQuizStore();

  useEffect(() => {
    let cancelled = false;

    async function loadQuestions() {
      try {
        setLoading(true);
        setError(null);
        const dailySet = await fetchDailySet(subjectKey);

        if (!cancelled && dailySet.length > 0) {
          init(dailySet);
        } else if (!cancelled) {
          setError("문항을 불러올 수 없습니다.");
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch daily set:", err);
          setError("서버 연결에 실패했습니다.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadQuestions();
    return () => {
      cancelled = true;
    };
  }, [init, subjectKey]);

  useEffect(() => {
    if (loading || questions.length === 0) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick, loading, questions.length]);

  const handleSelect = useCallback(
    (choiceIndex: number) => {
      const q = questions[currentIndex];
      if (!q) return;
      selectAnswer(q.id, choiceIndex);
    },
    [questions, currentIndex, selectAnswer]
  );

  const allAnswered =
    questions.length > 0 &&
    questions.every((q) => answers[q.id] !== undefined);

  const handleFinish = () => {
    router.push(`/daily/${subjectKey}/result`);
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-accent-orange" />
          <p className="text-sm text-text-secondary">문항을 준비하고 있어요...</p>
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-text-secondary">{error || "문항이 없습니다."}</p>
          <Link href={backHref} className="text-sm text-accent-orange underline">
            돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  const resultMap: Record<string, boolean | undefined> = {};
  questions.forEach((q) => {
    resultMap[q.id] = answers[q.id]?.isCorrect;
  });

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-border-light bg-cream/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link
            href={backHref}
            className="flex items-center text-text-secondary hover:text-text-primary"
          >
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-bold text-text-primary">
            {subjectLabel} 일간지
          </h1>
          <span className="text-xs text-text-tertiary">
            {currentIndex + 1} / {questions.length}
          </span>
          <span className="ml-auto font-mono text-sm text-text-secondary">
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </span>
        </div>

        <div className="mx-auto max-w-5xl px-4 pb-2">
          <ProgressPills
            total={questions.length}
            currentIndex={currentIndex}
            results={resultMap}
            questionIds={questions.map((q) => q.id)}
            onSelect={goTo}
          />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-1 gap-6 px-4 py-6">
        {currentQuestion.passageText && (
          <div className="hidden w-[48%] shrink-0 lg:block">
            <div className="sticky top-32">
              <PassagePanel
                passage={currentQuestion.passageText}
                alwaysVisible
              />
            </div>
          </div>
        )}

        <div className="flex-1">
          <QuestionCard
            question={currentQuestion}
            index={currentIndex}
            answer={answers[currentQuestion.id]}
            onSelect={handleSelect}
            instantGrade
          />

          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={prev}
              disabled={currentIndex === 0}
              className="gap-1"
            >
              <ArrowLeft size={16} /> 이전
            </Button>

            {currentIndex < questions.length - 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={next}
                className="gap-1"
              >
                다음 <ArrowRight size={16} />
              </Button>
            ) : allAnswered ? (
              <Button
                onClick={handleFinish}
                className="bg-accent-orange text-white hover:bg-accent-orange-dark"
              >
                결과 보기
              </Button>
            ) : (
              <span className="text-xs text-text-tertiary">
                모든 문제를 풀어주세요
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
