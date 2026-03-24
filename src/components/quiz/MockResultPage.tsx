"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuizStore } from "@/stores/quiz-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, RotateCcw, Check, X, Timer, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import ExplanationPanel from "@/components/quiz/ExplanationPanel";

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "쉬움",
  medium: "보통",
  hard: "어려움",
  killer: "킬러",
};

function formatTime(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

interface MockResultPageProps {
  subjectKey: string;
  subjectLabel: string;
}

export default function MockResultPage({ subjectKey, subjectLabel }: MockResultPageProps) {
  const router = useRouter();
  const { questions, answers, elapsedSeconds, timerMode, timeLimitSeconds, reset } = useQuizStore();

  useEffect(() => {
    if (questions.length === 0) {
      router.replace(`/mock/${subjectKey}`);
    }
  }, [questions, router, subjectKey]);

  const stats = useMemo(() => {
    if (questions.length === 0) return null;
    const total = questions.length;
    const correctCount = Object.values(answers).filter((a) => a.isCorrect).length;
    const accuracy = Math.round((correctCount / total) * 100);

    const byDifficulty: Record<string, { total: number; correct: number }> = {};
    questions.forEach((q) => {
      if (!byDifficulty[q.difficulty]) byDifficulty[q.difficulty] = { total: 0, correct: 0 };
      byDifficulty[q.difficulty].total++;
      if (answers[q.id]?.isCorrect) byDifficulty[q.difficulty].correct++;
    });

    const totalRecommended = questions.reduce((sum, q) => sum + (q.recommendedTime ?? 90), 0);
    return { total, correctCount, accuracy, byDifficulty, totalRecommended };
  }, [questions, answers]);

  if (!stats) return null;
  const timeDiff = elapsedSeconds - stats.totalRecommended;

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
      {/* 점수 요약 */}
      <Card className="flex flex-col items-center gap-4 p-6">
        <div className="relative h-36 w-36">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#E5E0D8" strokeWidth="12" />
            <circle cx="50" cy="50" r="42" fill="none"
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
            <p className="text-lg font-bold text-text-primary">{formatTime(elapsedSeconds)}</p>
            <p className="text-xs text-text-secondary">소요시간</p>
          </div>
        </div>

        <Badge variant="secondary" className={cn("gap-1 text-xs", timerMode === "timed" ? "bg-accent-orange/10 text-accent-orange" : "bg-muted text-text-secondary")}>
          {timerMode === "timed" ? <Clock size={12} /> : <Timer size={12} />}
          {timerMode === "timed" ? "실전 모드" : "자유 모드"}
          {timerMode === "timed" && timeLimitSeconds && <span>· {Math.floor(timeLimitSeconds / 60)}분</span>}
        </Badge>

        <div className="w-full rounded-lg bg-muted/50 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">내 소요시간</span>
            <span className="font-bold text-text-primary">{formatTime(elapsedSeconds)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-text-secondary">총 권장시간</span>
            <span className="font-bold text-text-primary">{formatTime(stats.totalRecommended)}</span>
          </div>
          <div className="mt-2 border-t border-border-light pt-2 text-center">
            <span className={cn("text-sm font-bold", timeDiff <= 0 ? "text-correct" : timeDiff <= 120 ? "text-accent-orange" : "text-incorrect")}>
              {timeDiff <= 0 ? `${formatTime(Math.abs(timeDiff))} 빠르게 완료!` : `${formatTime(timeDiff)} 초과`}
            </span>
          </div>
        </div>
      </Card>

      {/* 시간 분석 */}
      <Card className="p-5">
        <h3 className="mb-4 text-sm font-bold text-text-primary">문제별 시간 분석</h3>
        <div className="space-y-3">
          {questions.map((q, i) => {
            const answer = answers[q.id];
            const myTime = answer?.timeSpent ?? 0;
            const recTime = q.recommendedTime ?? 90;
            const maxTime = Math.max(myTime, recTime, 1);
            const ratio = myTime / recTime;
            return (
              <div key={q.id} className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-5 font-bold text-text-secondary">{i + 1}</span>
                  <span className="flex-1 truncate text-text-primary">{q.subArea}</span>
                  <span className={cn("text-[10px] font-medium", ratio <= 1 ? "text-correct" : ratio <= 1.5 ? "text-accent-orange" : "text-incorrect")}>
                    {ratio <= 1 ? "빠름" : ratio <= 1.5 ? "보통" : "느림"}
                  </span>
                  {answer?.isCorrect ? <Check size={12} className="text-correct" /> : <X size={12} className="text-incorrect" />}
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 text-right text-[10px] text-text-tertiary">권장</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-border-light" style={{ width: `${(recTime / maxTime) * 100}%` }} />
                  </div>
                  <span className="w-10 text-right text-[10px] text-text-tertiary">{formatTime(recTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 text-right text-[10px] text-text-tertiary">나</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full rounded-full", ratio <= 1 ? "bg-correct" : ratio <= 1.5 ? "bg-accent-orange" : "bg-incorrect")} style={{ width: `${(myTime / maxTime) * 100}%` }} />
                  </div>
                  <span className="w-10 text-right text-[10px] text-text-tertiary">{formatTime(myTime)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 난이도별 */}
      <Card className="p-5">
        <h3 className="mb-4 text-sm font-bold text-text-primary">난이도별 분석</h3>
        <div className="space-y-3">
          {(["easy", "medium", "hard", "killer"] as const).map((diff) => {
            const data = stats.byDifficulty[diff];
            if (!data) return null;
            const rate = Math.round((data.correct / data.total) * 100);
            return (
              <div key={diff} className="flex items-center gap-3">
                <span className="w-12 text-xs font-medium text-text-secondary">{DIFFICULTY_LABEL[diff]}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className={cn("h-full rounded-full", rate >= 70 ? "bg-correct" : rate >= 40 ? "bg-accent-orange" : "bg-incorrect")} style={{ width: `${rate}%` }} />
                </div>
                <span className="w-16 text-right text-xs text-text-secondary">{data.correct}/{data.total} ({rate}%)</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 문제별 결과 + 해설 */}
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
                  <Badge variant="secondary" className={cn("text-[10px]",
                    q.difficulty === "easy" && "bg-correct/10 text-correct",
                    q.difficulty === "medium" && "bg-accent-orange/10 text-accent-orange",
                    q.difficulty === "hard" && "bg-incorrect/10 text-incorrect",
                    q.difficulty === "killer" && "bg-purple-100 text-purple-700"
                  )}>
                    {DIFFICULTY_LABEL[q.difficulty]}
                  </Badge>
                  {answer?.isCorrect ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-correct"><Check size={14} className="text-white" strokeWidth={3} /></div>
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-incorrect"><X size={14} className="text-white" strokeWidth={3} /></div>
                  )}
                </div>
                {answer && (
                  <div className="mt-2 px-3">
                    <ExplanationPanel explanations={q.explanations} isCorrect={answer.isCorrect} selectedAnswer={answer.selectedAnswer} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="flex gap-3 pb-8">
        <Button variant="outline" className="flex-1 gap-2" onClick={() => { reset(); router.push(`/mock/${subjectKey}`); }}>
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
