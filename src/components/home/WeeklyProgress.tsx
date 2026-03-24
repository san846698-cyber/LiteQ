"use client";

import { cn } from "@/lib/utils";

interface WeeklyProgressProps {
  /** 월~일 완료 여부 배열 (7개) */
  days: boolean[];
}

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

export default function WeeklyProgress({ days }: WeeklyProgressProps) {
  const todayIndex = (new Date().getDay() + 6) % 7; // 월=0, 일=6

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-text-primary">이번 주 진행</h2>
      <div className="flex items-center justify-between rounded-2xl bg-surface p-4">
        {DAY_LABELS.map((label, i) => {
          const isToday = i === todayIndex;
          const isDone = days[i];
          const isFuture = i > todayIndex;

          return (
            <div key={label} className="flex flex-col items-center gap-2">
              <span
                className={cn(
                  "text-xs",
                  isToday ? "font-bold text-accent-orange" : "text-text-tertiary"
                )}
              >
                {label}
              </span>
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                  isDone && "bg-correct text-white",
                  !isDone && isToday && "bg-accent-orange text-white",
                  !isDone && !isToday && !isFuture && "bg-incorrect-light text-incorrect",
                  isFuture && !isDone && "bg-muted text-text-tertiary"
                )}
              >
                {isDone ? "✓" : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
