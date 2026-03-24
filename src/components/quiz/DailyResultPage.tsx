"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuizStore } from "@/stores/quiz-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, RotateCcw, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ExplanationPanel from "@/components/quiz/ExplanationPanel";

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "쉬움",
  medium: "보통",
  hard: "어려움",
  killer: "킬러",
};

const ENCOURAGEMENT = [
  { min: 0, max: 40, message: "오늘 발견한 약점이 내일의 무기예요" },
  { min: 41, max: 60, message: "조금만 더 힘내면 크게 성장할 거예요" },
  { min: 61, max: 80, message: "꾸준히 실력이 쌓이고 있어요!" },
  { min: 81, max: 100, message: "오늘도 한 걸음 나아갔어요!" },
];

interface DailyResultPageProps {
  subjectKey: string;
  subjectLabel: string;
}

export default function DailyResultPage({
  subjectKey,
  subjectLabel,
}: DailyResultPageProps) {
  const router = useRouter();
  const { questions, answers, elapsedSeconds, reset } = useQuizStore();

  useEffect(() => {
    if (questions.length === 0) {
      router.replace(`/daily/${subjectKey}`);
    }
  }, [questions, router, subjectKey]);

  const stats = useMemo(() => {
    if (questions.length === 0) return null;

    const total = questions.length;
    const correctCount = Object.values(answers).filter(
      (a) => a.isCorrect
    ).length;
    const accuracy = Math.round((correctCount / total) * 100);

    const byDifficulty: Record<string, { total: number; correct: number }> = {};
    questions.forEach((q) => {
      if (!byDifficulty[q.difficulty]) {
        byDifficulty[q.difficulty] = { total: 0, correct: 0 };
      }
      byDifficulty[q.difficulty].total++;
      if (answers[q.id]?.isCorrect) {
        byDifficulty[q.difficulty].correct++;
      }
    });

    return { total, correctCount, accuracy, byDifficulty };
  }, [questions, answers]);

  if (!stats) return null;

  const encouragement =
    ENCOURAGEMENT.find(
      (e) => stats.accuracy >= e.min && stats.accuracy <= e.max
    )?.message || "수고했어요!";

  const totalMinutes = Math.floor(elapsedSeconds / 60);
  const totalSecs = elapsedSeconds % 60;

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
      {/* 점수 요약 */}
      <Card className="flex flex-col items-center gap-4 p-6">
        <div className="relative h-36 w-36">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#E5E0D8" strokeWidth="12" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke={stats.accuracy >= 60 ? "#2D8B5E" : "#C4642A"}
              strokeWidth="12" strokeLinecap="round"
              strokeDasharray={`${stats.accuracy * 2.64} ${264 - stats.accuracy * 2.64}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-text-primary">{stats.accuracy}%</span>
            <span className="text-xs text-text-secondary">정답률</span>
          </div>
        </div>
        <p className="text-sm font-medium text-accent-orange">{encouragement}</p>
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-lg font-bold text-correct">{stats.correctCount}</p>
            <p className="text-xs text-text-secondary">정답</p>
          </div>
          <div className="h-10 w-px bg-border-light" />
          <div>
            <p className="text-lg font-bold text-incorrect">{stats.total - stats.correctCount}</p>
            <p className="text-xs text-text-secondary">오답</p>
          </div>
          <div className="h-10 w-px bg-border-light" />
          <div>
            <p className="text-lg font-bold text-text-primary">
              {totalMinutes}:{String(totalSecs).padStart(2, "0")}
            </p>
            <p className="text-xs text-text-secondary">소요시간</p>
          </div>
        </div>
      </Card>

      {/* 난이도별 분석 */}
      <Card className="p-5">
        <h3 className="mb-4 text-sm font-bold text-text-primary">난이도별 분석</h3>
        <div className="space-y-3">
          {(["easy", "medium", "hard", "killer"] as const).map((diff) => {
            const data = stats.byDifficulty[diff];
            if (!data) return null;
            const rate = Math.round((data.correct / data.total) * 100);
            return (
              <div key={diff} className="flex items-center gap-3">
                <span className="w-12 text-xs font-medium text-text-secondary">
                  {DIFFICULTY_LABEL[diff]}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      rate >= 70 ? "bg-correct" : rate >= 40 ? "bg-accent-orange" : "bg-incorrect"
                    )}
                    style={{ width: `${rate}%` }}
                  />
                </div>
                <span className="w-16 text-right text-xs text-text-secondary">
                  {data.correct}/{data.total} ({rate}%)
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 문제별 결과 */}
      <Card className="p-5">
        <h3 className="mb-4 text-sm font-bold text-text-primary">문제별 결과</h3>
        <div className="space-y-4">
          {questions.map((q, i) => {
            const answer = answers[q.id];
            return (
              <div key={q.id}>
                <div className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/50">
                  <span className="w-6 text-center text-xs font-bold text-text-secondary">{i + 1}</span>
                  <span className="flex-1 text-sm text-text-primary">{q.subArea}</span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px]",
                      q.difficulty === "easy" && "bg-correct/10 text-correct",
                      q.difficulty === "medium" && "bg-accent-orange/10 text-accent-orange",
                      q.difficulty === "hard" && "bg-incorrect/10 text-incorrect",
                      q.difficulty === "killer" && "bg-purple-100 text-purple-700"
                    )}
                  >
                    {DIFFICULTY_LABEL[q.difficulty]}
                  </Badge>
                  {answer?.isCorrect ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-correct">
                      <Check size={14} className="text-white" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-incorrect">
                      <X size={14} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
                {answer && (
                  <div className="mt-2 px-3">
                    <ExplanationPanel
                      explanations={q.explanations}
                      isCorrect={answer.isCorrect}
                      selectedAnswer={answer.selectedAnswer}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 버튼 */}
      <div className="flex gap-3 pb-8">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => {
            reset();
            router.push(`/daily/${subjectKey}`);
          }}
        >
          <RotateCcw size={16} /> 다시 풀기
        </Button>
        <Link href="/home" className="flex-1">
          <Button className="w-full gap-2 bg-accent-orange text-white hover:bg-accent-orange-dark">
            <Home size={16} /> 홈으로
          </Button>
        </Link>
      </div>
    </div>
  );
}
