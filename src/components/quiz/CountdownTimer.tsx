"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  /** 총 시간 (초) */
  totalSeconds: number;
  /** 시간 종료 콜백 */
  onTimeUp: () => void;
  /** 일시정지 */
  paused?: boolean;
}

export default function CountdownTimer({
  totalSeconds,
  onTimeUp,
  paused = false,
}: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    if (paused || remaining <= 0) return;
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [paused, remaining, onTimeUp]);

  const ratio = remaining / totalSeconds;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-sm font-bold transition-colors",
        ratio > 0.5 && "bg-surface text-text-primary",
        ratio <= 0.5 && ratio > 0.2 && "bg-accent-orange/10 text-accent-orange",
        ratio <= 0.2 && "bg-incorrect-light text-incorrect animate-pulse"
      )}
    >
      <Clock size={16} />
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </div>
  );
}
