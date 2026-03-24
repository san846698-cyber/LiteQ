"use client";

import Link from "next/link";
import { BookOpen, ChevronRight, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Mission {
  subject: string;
  label: string;
  questionCount: number;
  completed: boolean;
  href: string;
}

interface TodayMissionProps {
  missions: Mission[];
}

export default function TodayMission({ missions }: TodayMissionProps) {
  const completedCount = missions.filter((m) => m.completed).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-primary">오늘의 학습</h2>
        <span className="text-sm text-text-secondary">
          {completedCount}/{missions.length} 완료
        </span>
      </div>

      <div className="space-y-2">
        {missions.map((mission) => (
          <Link key={mission.subject} href={mission.href}>
            <Card
              className={cn(
                "flex items-center gap-3 p-4 transition-colors",
                mission.completed
                  ? "bg-correct-light/50 border-correct/20"
                  : "hover:border-accent-orange/30"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  mission.completed
                    ? "bg-correct/10"
                    : "bg-accent-orange/10"
                )}
              >
                {mission.completed ? (
                  <CheckCircle2 size={20} className="text-correct" />
                ) : (
                  <BookOpen size={20} className="text-accent-orange" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary">
                    {mission.label}
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                  >
                    {mission.questionCount}문제
                  </Badge>
                </div>
                <p className="text-xs text-text-secondary">
                  {mission.completed
                    ? "완료했어요!"
                    : "시간 제한 없이 풀어보세요"}
                </p>
              </div>

              {!mission.completed && (
                <ChevronRight size={18} className="text-text-tertiary" />
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
