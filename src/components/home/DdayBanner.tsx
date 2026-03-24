"use client";

import { CalendarDays } from "lucide-react";

interface DdayBannerProps {
  dDay: string; // ISO date string
  examName?: string;
}

export default function DdayBanner({
  dDay,
  examName = "2026 수능",
}: DdayBannerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dDay);
  target.setHours(0, 0, 0, 0);
  const diff = Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const dDayText = diff > 0 ? `D-${diff}` : diff === 0 ? "D-Day" : `D+${Math.abs(diff)}`;

  return (
    <div className="flex items-center justify-between rounded-2xl bg-accent-orange px-5 py-4 text-white">
      <div className="flex items-center gap-3">
        <CalendarDays size={20} />
        <span className="text-sm font-medium opacity-90">{examName}</span>
      </div>
      <span className="text-2xl font-bold tracking-tight">{dDayText}</span>
    </div>
  );
}
