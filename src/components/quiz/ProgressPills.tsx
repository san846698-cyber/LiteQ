"use client";

import { cn } from "@/lib/utils";

interface ProgressPillsProps {
  total: number;
  currentIndex: number;
  /** questionId → isCorrect (undefined = 미답) */
  results: Record<string, boolean | undefined>;
  questionIds: string[];
  onSelect: (index: number) => void;
}

export default function ProgressPills({
  total,
  currentIndex,
  results,
  questionIds,
  onSelect,
}: ProgressPillsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto px-1 py-2">
      {Array.from({ length: total }, (_, i) => {
        const qid = questionIds[i];
        const result = results[qid];
        const isCurrent = i === currentIndex;
        const isAnswered = result !== undefined;

        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={cn(
              "h-2.5 min-w-[20px] flex-1 rounded-full transition-all",
              isCurrent && "ring-2 ring-accent-orange ring-offset-1",
              result === true && "bg-correct",
              result === false && "bg-incorrect",
              !isAnswered && !isCurrent && "bg-border-light",
              !isAnswered && isCurrent && "bg-accent-orange"
            )}
            aria-label={`문제 ${i + 1}`}
          />
        );
      })}
    </div>
  );
}
