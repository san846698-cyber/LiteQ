"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, ChevronLeft } from "lucide-react";

const STEPS = ["목표 시험", "D-Day", "과목 선택", "알림 설정"] as const;

const EXAMS = [
  { id: "suneung", label: "수능", description: "대학수학능력시험" },
  { id: "sat", label: "SAT", description: "Coming Soon", disabled: true },
  { id: "toefl", label: "TOEFL", description: "Coming Soon", disabled: true },
];

const SUBJECTS_OPTIONS = [
  { id: "korean", label: "국어" },
  { id: "english", label: "영어" },
  { id: "math", label: "수학" },
  { id: "science", label: "과학탐구" },
  { id: "social", label: "사회탐구" },
];

const ALARM_TIMES = [
  "오전 7시",
  "오전 8시",
  "오전 9시",
  "오후 6시",
  "오후 9시",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [exam, setExam] = useState("suneung");
  const [dDay, setDDay] = useState("2026-11-19");
  const [subjects, setSubjects] = useState<Set<string>>(
    new Set(["korean", "english"])
  );
  const [alarmTime, setAlarmTime] = useState("오전 8시");

  const toggleSubject = (id: string) => {
    setSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canProceed = () => {
    if (step === 0) return !!exam;
    if (step === 1) return !!dDay;
    if (step === 2) return subjects.size > 0;
    return true;
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      // 온보딩 완료
      router.push("/home");
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-12">
        {/* 진행 도트 */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 rounded-full transition-all",
                i === step ? "w-8 bg-accent-orange" : "w-2 bg-border-light",
                i < step && "w-2 bg-correct"
              )}
            />
          ))}
        </div>

        {/* 스텝 제목 */}
        <h1 className="mb-2 text-2xl font-bold text-text-primary">
          {step === 0 && "목표 시험을 선택하세요"}
          {step === 1 && "시험 날짜를 설정하세요"}
          {step === 2 && "공부할 과목을 선택하세요"}
          {step === 3 && "알림 시간을 선택하세요"}
        </h1>
        <p className="mb-6 text-sm text-text-secondary">
          {step === 0 && "맞춤형 커리큘럼을 위해 필요해요"}
          {step === 1 && "D-Day 카운트다운을 시작할게요"}
          {step === 2 && "복수 선택 가능해요"}
          {step === 3 && "매일 학습 알림을 보내드릴게요"}
        </p>

        {/* 스텝 본문 */}
        <div className="flex-1">
          {/* Step 0: 목표 시험 */}
          {step === 0 && (
            <div className="space-y-3">
              {EXAMS.map((e) => (
                <button
                  key={e.id}
                  disabled={e.disabled}
                  onClick={() => !e.disabled && setExam(e.id)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all",
                    exam === e.id
                      ? "border-accent-orange bg-accent-orange/5"
                      : "border-transparent bg-surface",
                    e.disabled && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full border-2",
                      exam === e.id
                        ? "border-accent-orange bg-accent-orange"
                        : "border-border-light"
                    )}
                  >
                    {exam === e.id && (
                      <Check size={14} className="text-white" strokeWidth={3} />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-text-primary">{e.label}</p>
                    <p className="text-xs text-text-secondary">
                      {e.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 1: D-Day */}
          {step === 1 && (
            <Card className="p-6">
              <label className="mb-2 block text-sm font-medium text-text-secondary">
                시험 날짜
              </label>
              <input
                type="date"
                value={dDay}
                onChange={(e) => setDDay(e.target.value)}
                className="w-full rounded-xl border border-border-light bg-surface px-4 py-3 text-text-primary outline-none focus:border-accent-orange focus:ring-2 focus:ring-accent-orange/20"
              />
              {dDay && (
                <p className="mt-3 text-center text-sm text-text-secondary">
                  D-
                  {Math.max(
                    0,
                    Math.ceil(
                      (new Date(dDay).getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24)
                    )
                  )}
                  일 남았어요
                </p>
              )}
            </Card>
          )}

          {/* Step 2: 과목 선택 */}
          {step === 2 && (
            <div className="grid grid-cols-2 gap-3">
              {SUBJECTS_OPTIONS.map((s) => {
                const selected = subjects.has(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSubject(s.id)}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-5 text-sm font-bold transition-all",
                      selected
                        ? "border-accent-orange bg-accent-orange/5 text-accent-orange"
                        : "border-transparent bg-surface text-text-secondary"
                    )}
                  >
                    {selected && <Check size={16} strokeWidth={3} />}
                    {s.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 3: 알림 시간 */}
          {step === 3 && (
            <div className="space-y-3">
              {ALARM_TIMES.map((time) => (
                <button
                  key={time}
                  onClick={() => setAlarmTime(time)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all",
                    alarmTime === time
                      ? "border-accent-orange bg-accent-orange/5"
                      : "border-transparent bg-surface"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full border-2",
                      alarmTime === time
                        ? "border-accent-orange bg-accent-orange"
                        : "border-border-light"
                    )}
                  >
                    {alarmTime === time && (
                      <Check
                        size={14}
                        className="text-white"
                        strokeWidth={3}
                      />
                    )}
                  </div>
                  <span className="font-medium text-text-primary">{time}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-3 py-6">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="gap-1"
            >
              <ChevronLeft size={16} /> 이전
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1 gap-1 bg-accent-orange text-white hover:bg-accent-orange-dark"
          >
            {step === STEPS.length - 1 ? "시작하기" : "다음"}
            {step < STEPS.length - 1 && <ChevronRight size={16} />}
          </Button>
        </div>
      </div>
    </div>
  );
}
