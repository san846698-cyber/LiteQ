import Link from "next/link";
import { BookOpen, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SUBJECTS = [
  {
    id: "korean",
    label: "국어",
    description: "비문학 3 + 문학 3",
    questionCount: 6,
    estimatedTime: "시간제한 없음",
    completed: false,
    enabled: true,
    href: "/daily/korean",
  },
  {
    id: "english",
    label: "영어",
    description: "읽기 유형 14가지",
    questionCount: 14,
    estimatedTime: "시간제한 없음",
    completed: false,
    enabled: true,
    href: "/daily/english",
  },
  {
    id: "ethics",
    label: "생활과윤리",
    description: "사상가 · 개념 · 입장 비교",
    questionCount: 10,
    estimatedTime: "시간제한 없음",
    completed: false,
    enabled: true,
    href: "/daily/ethics",
  },
  {
    id: "earthscience",
    label: "지구과학1",
    description: "대기 · 해양 · 지질 · 천문",
    questionCount: 10,
    estimatedTime: "시간제한 없음",
    completed: false,
    enabled: true,
    href: "/daily/earthscience",
  },
  {
    id: "math",
    label: "수학",
    description: "수I · 수II · 미적분 · 확통",
    questionCount: 9,
    estimatedTime: "30분",
    completed: false,
    enabled: false,
    href: "/daily/math",
  },
];

export default function DailyPage() {
  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 pt-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">일간지</h1>
        <p className="text-sm text-text-secondary">
          시간 제한 없이 개념을 점검해보세요
        </p>
      </div>

      <div className="space-y-3">
        {SUBJECTS.map((subject) => {
          const Inner = (
            <Card
              className={cn(
                "flex items-center gap-4 p-5 transition-all",
                subject.enabled
                  ? "border-2 hover:border-accent-orange/40 hover:shadow-sm"
                  : "opacity-50"
              )}
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl",
                  subject.enabled ? "bg-accent-orange/10" : "bg-muted"
                )}
              >
                {subject.enabled ? (
                  <BookOpen size={22} className="text-accent-orange" />
                ) : (
                  <Lock size={22} className="text-text-tertiary" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-text-primary">
                    {subject.label}
                  </span>
                  {!subject.enabled && (
                    <Badge variant="secondary" className="text-[10px]">
                      준비 중
                    </Badge>
                  )}
                  {subject.completed && (
                    <Badge className="bg-correct text-white text-[10px]">
                      완료
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-text-secondary">
                  {subject.description}
                </p>
                <p className="mt-1 text-xs text-text-tertiary">
                  {subject.questionCount}문제 · {subject.estimatedTime}
                </p>
              </div>
            </Card>
          );

          if (!subject.enabled) return <div key={subject.id}>{Inner}</div>;

          return (
            <Link key={subject.id} href={subject.href}>
              {Inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
