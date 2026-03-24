import Link from "next/link";
import { Clock, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SUBJECTS = [
  {
    id: "korean",
    label: "국어",
    description: "독서 · 문학 15문항",
    questionCount: 15,
    timeLimit: "30분",
    enabled: true,
    href: "/mock/korean",
  },
  {
    id: "english",
    label: "영어",
    description: "읽기 유형 14문항",
    questionCount: 14,
    timeLimit: "25분",
    enabled: true,
    href: "/mock/english",
  },
  {
    id: "ethics",
    label: "생활과윤리",
    description: "사상가 · 개념 10문항",
    questionCount: 10,
    timeLimit: "15분",
    enabled: true,
    href: "/mock/ethics",
  },
  {
    id: "earthscience",
    label: "지구과학1",
    description: "대기 · 해양 · 천문 10문항",
    questionCount: 10,
    timeLimit: "15분",
    enabled: true,
    href: "/mock/earthscience",
  },
  {
    id: "math",
    label: "수학",
    description: "Lite 9문항",
    questionCount: 9,
    timeLimit: "30분",
    enabled: false,
    href: "/mock/math",
  },
];

export default function MockPage() {
  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 pt-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">라이트 모의고사</h1>
        <p className="text-sm text-text-secondary">
          시간 제한 안에서 실전 감각을 훈련하세요
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
                  <Clock size={22} className="text-accent-orange" />
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
                </div>
                <p className="text-xs text-text-secondary">
                  {subject.description}
                </p>
                <p className="mt-1 text-xs text-text-tertiary">
                  {subject.questionCount}문제 · {subject.timeLimit} 제한
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
