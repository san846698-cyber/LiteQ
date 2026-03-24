"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// ── Mock Data ──
const WEEKLY_DATA: Record<string, { week: string; accuracy: number }[]> = {
  korean: [
    { week: "1주차", accuracy: 62 },
    { week: "2주차", accuracy: 68 },
    { week: "3주차", accuracy: 71 },
    { week: "4주차", accuracy: 75 },
  ],
  english: [
    { week: "1주차", accuracy: 55 },
    { week: "2주차", accuracy: 60 },
    { week: "3주차", accuracy: 67 },
    { week: "4주차", accuracy: 72 },
  ],
};

const WEAK_POINTS: Record<string, { type: string; accuracy: number }[]> = {
  korean: [
    { type: "빈칸 추론", accuracy: 35 },
    { type: "어휘·어법", accuracy: 42 },
    { type: "문학 감상", accuracy: 50 },
  ],
  english: [
    { type: "빈칸 추론 (절)", accuracy: 30 },
    { type: "문장 삽입", accuracy: 40 },
    { type: "순서 배열", accuracy: 45 },
  ],
};

const STREAK_CALENDAR = (() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();
  // 랜덤 학습일 생성 (mock)
  const studied = new Set([1, 2, 3, 5, 6, 7, 8, 10, 11, 13, 14, 15, 17, 18, 19, 20, 21]);
  return { year, month, daysInMonth, today, studied };
})();

const MONTH_NAMES = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

export default function StatsPage() {
  const [subject, setSubject] = useState<"korean" | "english">("english");

  const weeklyData = WEEKLY_DATA[subject] ?? [];
  const weakPoints = WEAK_POINTS[subject] ?? [];
  const { year, month, daysInMonth, today, studied } = STREAK_CALENDAR;

  // 달력 첫 요일 (월=0)
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 pt-6">
      <h1 className="text-xl font-bold text-text-primary">학습 통계</h1>

      {/* 과목 탭 */}
      <Tabs
        value={subject}
        onValueChange={(v) => setSubject(v as "korean" | "english")}
      >
        <TabsList className="w-full">
          <TabsTrigger value="korean" className="flex-1">국어</TabsTrigger>
          <TabsTrigger value="english" className="flex-1">영어</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 주간 정답률 차트 */}
      <Card className="p-5">
        <h3 className="mb-4 text-sm font-bold text-text-primary">
          주간 정답률 추이
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 12, fill: "#6B6560" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: "#6B6560" }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #E5E0D8",
                  fontSize: "12px",
                }}
                formatter={(value) => [`${value}%`, "정답률"]}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#C4642A"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#C4642A" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 취약 유형 TOP 3 */}
      <Card className="p-5">
        <h3 className="mb-4 text-sm font-bold text-text-primary">
          취약 유형 TOP 3
        </h3>
        <div className="space-y-3">
          {weakPoints.map((wp, i) => (
            <div
              key={wp.type}
              className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-orange/10 text-xs font-bold text-accent-orange">
                {i + 1}
              </span>
              <div className="flex-1">
                <span className="text-sm font-medium text-text-primary">
                  {wp.type}
                </span>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border-light">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      wp.accuracy >= 50 ? "bg-accent-orange" : "bg-incorrect"
                    )}
                    style={{ width: `${wp.accuracy}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-bold text-text-secondary">
                {wp.accuracy}%
              </span>
              <Badge className="bg-accent-orange/10 text-accent-orange text-[10px] border-0">
                집중 학습
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* 스트릭 캘린더 */}
      <Card className="p-5">
        <h3 className="mb-4 text-sm font-bold text-text-primary">
          {MONTH_NAMES[month]} 학습 캘린더
        </h3>
        <div className="grid grid-cols-7 gap-1 text-center">
          {["월", "화", "수", "목", "금", "토", "일"].map((d) => (
            <span key={d} className="pb-1 text-[10px] font-medium text-text-tertiary">
              {d}
            </span>
          ))}
          {/* 빈 칸 */}
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`e-${i}`} />
          ))}
          {/* 날짜 */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const isStudied = studied.has(day);
            const isToday = day === today;
            return (
              <div
                key={day}
                className={cn(
                  "flex h-8 w-8 mx-auto items-center justify-center rounded-full text-xs transition-colors",
                  isStudied && "bg-correct text-white",
                  !isStudied && day <= today && "bg-muted text-text-tertiary",
                  !isStudied && day > today && "text-text-tertiary",
                  isToday && !isStudied && "ring-2 ring-accent-orange"
                )}
              >
                {day}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 누적 진도율 */}
      <Card className="p-5">
        <h3 className="mb-3 text-sm font-bold text-text-primary">누적 학습 진도</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>전체 커리큘럼</span>
            <span>34%</span>
          </div>
          <Progress value={34} className="h-2.5" />
          <p className="text-xs text-text-tertiary">
            총 120개 개념 중 41개 완료
          </p>
        </div>
      </Card>
    </div>
  );
}
