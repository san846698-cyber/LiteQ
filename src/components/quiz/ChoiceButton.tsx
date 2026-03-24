"use client";

import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface ChoiceButtonProps {
  index: number;
  text: string;
  selected: boolean;
  /** null = 미채점, true = 정답, false = 오답 */
  result: boolean | null;
  correctIndex: number;
  disabled: boolean;
  onClick: () => void;
}

const LABELS = ["①", "②", "③", "④", "⑤"];

export default function ChoiceButton({
  index,
  text,
  selected,
  result,
  correctIndex,
  disabled,
  onClick,
}: ChoiceButtonProps) {
  const isCorrectChoice = index === correctIndex;
  const showCorrect = result !== null && isCorrectChoice;
  const showWrong = result === false && selected;

  // 선지가 짧은 기호(①~⑤, 숫자, 단일 문자 등)인지 판별
  const isShortLabel = text.length <= 3;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border-2 px-5 text-left transition-all",
        isShortLabel
          ? "h-14 justify-center text-[20px] font-bold"
          : "items-start py-3.5 text-[15px] leading-relaxed",
        // 기본 상태
        !selected && result === null && "border-transparent bg-surface hover:border-accent-orange/30",
        // 선택됨 (채점 전)
        selected && result === null && "border-accent-orange bg-accent-orange/5",
        // 정답
        showCorrect && "border-correct bg-correct-light",
        // 오답
        showWrong && "border-incorrect bg-incorrect-light",
        // 미선택 + 채점 완료
        !selected && result !== null && !isCorrectChoice && "border-transparent bg-surface opacity-50",
        disabled && "cursor-default"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          showCorrect && "bg-correct text-white",
          showWrong && "bg-incorrect text-white",
          !showCorrect && !showWrong && "bg-muted text-text-secondary"
        )}
      >
        {showCorrect ? (
          <Check size={14} strokeWidth={3} />
        ) : showWrong ? (
          <X size={14} strokeWidth={3} />
        ) : (
          LABELS[index]
        )}
      </span>
      <span className="flex-1">{text}</span>
    </button>
  );
}
