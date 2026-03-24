"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Lightbulb, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RichExplanation } from "@/types/quiz";

interface ExplanationPanelProps {
  explanations: RichExplanation | string[];
  isCorrect: boolean;
  selectedAnswer?: number;
}

/** explanations가 RichExplanation인지 판별 */
function isRich(
  exp: RichExplanation | string[]
): exp is RichExplanation {
  return !Array.isArray(exp) && typeof exp === "object" && "correct" in exp;
}

export default function ExplanationPanel({
  explanations,
  isCorrect,
  selectedAnswer,
}: ExplanationPanelProps) {
  const [open, setOpen] = useState(false);

  // 레거시 string[] 지원
  if (!isRich(explanations)) {
    return (
      <div
        className={cn(
          "rounded-xl border transition-colors",
          isCorrect
            ? "border-correct/20 bg-correct-light/30"
            : "border-incorrect/20 bg-incorrect-light/30"
        )}
      >
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium"
        >
          <Lightbulb
            size={16}
            className={isCorrect ? "text-correct" : "text-incorrect"}
          />
          <span className={isCorrect ? "text-correct" : "text-incorrect"}>
            {isCorrect ? "정답이에요!" : "해설 보기"}
          </span>
          <span className="ml-auto">
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </button>

        {open && (
          <div className="space-y-2 border-t border-border-light/50 px-4 pb-4 pt-3">
            {explanations.map((text, i) => (
              <p
                key={i}
                className="text-sm leading-relaxed text-text-secondary"
              >
                {text}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Rich explanation (DB 기반)
  const { correct, wrong, key_point } = explanations;

  // 오답 시 선택한 선지의 해설 찾기
  const selectedWrongKey =
    selectedAnswer !== undefined ? String(selectedAnswer + 1) : null;
  const selectedWrongText =
    selectedWrongKey && wrong ? wrong[selectedWrongKey] : null;

  return (
    <div
      className={cn(
        "rounded-xl border transition-colors",
        isCorrect
          ? "border-correct/20 bg-correct-light/30"
          : "border-incorrect/20 bg-incorrect-light/30"
      )}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium"
      >
        <Lightbulb
          size={16}
          className={isCorrect ? "text-correct" : "text-incorrect"}
        />
        <span className={isCorrect ? "text-correct" : "text-incorrect"}>
          {isCorrect ? "정답이에요!" : "해설 보기"}
        </span>
        <span className="ml-auto">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-border-light/50 px-4 pb-4 pt-3">
          {/* 정답 해설 */}
          <div>
            <p className="mb-1 text-xs font-semibold text-correct">
              정답 해설
            </p>
            <p className="text-sm leading-relaxed text-text-secondary">
              {correct}
            </p>
          </div>

          {/* 오답 시 — 내가 고른 선지 해설 */}
          {!isCorrect && selectedWrongText && (
            <div>
              <p className="mb-1 text-xs font-semibold text-incorrect">
                내가 고른 선지
              </p>
              <p className="text-sm leading-relaxed text-text-secondary">
                {selectedWrongText}
              </p>
            </div>
          )}

          {/* 나머지 오답 해설 (접이식) */}
          {wrong && Object.keys(wrong).length > 0 && (
            <details className="group">
              <summary className="cursor-pointer text-xs font-medium text-text-tertiary hover:text-text-secondary">
                다른 선지 해설 보기
              </summary>
              <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-border-light">
                {Object.entries(wrong)
                  .filter(([key]) => key !== selectedWrongKey)
                  .map(([key, text]) => (
                    <p
                      key={key}
                      className="text-xs leading-relaxed text-text-tertiary"
                    >
                      {text}
                    </p>
                  ))}
              </div>
            </details>
          )}

          {/* 핵심 포인트 */}
          {key_point && (
            <div className="flex gap-2 rounded-lg bg-accent-orange/5 p-3">
              <Target size={14} className="mt-0.5 shrink-0 text-accent-orange" />
              <p className="text-xs leading-relaxed text-text-primary">
                <span className="font-semibold text-accent-orange">
                  핵심 포인트{" "}
                </span>
                {key_point}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
