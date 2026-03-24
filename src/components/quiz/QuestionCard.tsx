"use client";

import type { Question, QuizAnswer } from "@/types/quiz";
import ChoiceButton from "./ChoiceButton";
import ExplanationPanel from "./ExplanationPanel";
import PassagePanel from "./PassagePanel";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: Question;
  index: number;
  answer?: QuizAnswer;
  onSelect: (choiceIndex: number) => void;
  /** 모의고사 모드에서는 즉시 채점 안 함 */
  instantGrade?: boolean;
}

const DIFFICULTY_MAP: Record<string, { label: string; className: string }> = {
  easy: { label: "쉬움", className: "bg-correct/10 text-correct" },
  medium: { label: "보통", className: "bg-accent-orange/10 text-accent-orange" },
  hard: { label: "어려움", className: "bg-incorrect/10 text-incorrect" },
  killer: { label: "킬러", className: "bg-purple-100 text-purple-700" },
};

export default function QuestionCard({
  question,
  index,
  answer,
  onSelect,
  instantGrade = true,
}: QuestionCardProps) {
  const isAnswered = !!answer;
  const graded = instantGrade && isAnswered;
  const diff = DIFFICULTY_MAP[question.difficulty];

  return (
    <div className="space-y-4">
      {/* 문제 헤더 */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-accent-orange">
          Q{index + 1}
        </span>
        <Badge variant="secondary" className={cn("text-[10px]", diff?.className)}>
          {diff?.label}
        </Badge>
        <Badge variant="secondary" className="text-[10px]">
          {question.subArea}
        </Badge>
        {question.recommendedTime && (
          <span className="ml-auto text-xs text-text-tertiary">
            권장 {Math.floor(question.recommendedTime / 60)}분{" "}
            {question.recommendedTime % 60 > 0
              ? `${question.recommendedTime % 60}초`
              : ""}
          </span>
        )}
      </div>

      {/* 모바일 지문 버튼 */}
      {question.passageText && (
        <div className="lg:hidden">
          <PassagePanel passage={question.passageText} />
        </div>
      )}

      {/* 발문 */}
      <p className="whitespace-pre-line text-[15px] font-medium leading-relaxed text-text-primary">
        {question.questionText}
      </p>

      {/* 선지 */}
      <div className="space-y-2 px-1">
        {question.choices.map((choice, i) => (
          <ChoiceButton
            key={i}
            index={i}
            text={choice}
            selected={answer?.selectedAnswer === i}
            result={graded ? answer!.isCorrect : null}
            correctIndex={question.correctAnswer}
            disabled={graded}
            onClick={() => !isAnswered && onSelect(i)}
          />
        ))}
      </div>

      {/* 해설 */}
      {graded && (
        <ExplanationPanel
          explanations={question.explanations}
          isCorrect={answer!.isCorrect}
          selectedAnswer={answer!.selectedAnswer}
        />
      )}
    </div>
  );
}
