"use client";

import { Flame } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StreakCardProps {
  streakCount: number;
  longestStreak: number;
}

export default function StreakCard({
  streakCount,
  longestStreak,
}: StreakCardProps) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-orange/10">
        <Flame size={24} className="text-accent-orange" />
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-text-primary">
            {streakCount}
          </span>
          <span className="text-sm text-text-secondary">일 연속</span>
        </div>
        <p className="text-xs text-text-tertiary">
          최장 기록 {longestStreak}일
        </p>
      </div>
      {streakCount > 0 && (
        <p className="text-sm text-text-secondary">
          {streakCount >= 7
            ? "대단해요! 꾸준함이 실력이에요"
            : "오늘도 한 걸음 나아갔어요"}
        </p>
      )}
    </Card>
  );
}
