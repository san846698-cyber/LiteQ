"use client";

import { create } from "zustand";
import type { Question, QuizAnswer } from "@/types/quiz";

export type TimerMode = "free" | "timed";

interface QuizState {
  questions: Question[];
  answers: Record<string, QuizAnswer>;
  currentIndex: number;
  startedAt: Date | null;
  elapsedSeconds: number;
  isCompleted: boolean;
  timerMode: TimerMode;
  timeLimitSeconds: number | null; // 실전 모드 제한 시간

  // 문제별 타이머 (모의고사용)
  questionStartTime: number | null;

  // Actions
  init: (questions: Question[], timerMode?: TimerMode, timeLimitSeconds?: number | null) => void;
  selectAnswer: (questionId: string, selectedAnswer: number) => void;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  tick: () => void;
  complete: () => void;
  reset: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  questions: [],
  answers: {},
  currentIndex: 0,
  startedAt: null,
  elapsedSeconds: 0,
  isCompleted: false,
  timerMode: "free",
  timeLimitSeconds: null,
  questionStartTime: null,

  init: (questions, timerMode = "free", timeLimitSeconds = null) =>
    set({
      questions,
      answers: {},
      currentIndex: 0,
      startedAt: new Date(),
      elapsedSeconds: 0,
      isCompleted: false,
      timerMode,
      timeLimitSeconds,
      questionStartTime: Date.now(),
    }),

  selectAnswer: (questionId, selectedAnswer) => {
    const { questions, questionStartTime } = get();
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const timeSpent = questionStartTime
      ? Math.round((Date.now() - questionStartTime) / 1000)
      : 0;

    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: {
          questionId,
          selectedAnswer,
          isCorrect: selectedAnswer === question.correctAnswer,
          timeSpent,
        },
      },
    }));
  },

  goTo: (index) =>
    set({ currentIndex: index, questionStartTime: Date.now() }),

  next: () =>
    set((state) => ({
      currentIndex: Math.min(
        state.currentIndex + 1,
        state.questions.length - 1
      ),
      questionStartTime: Date.now(),
    })),

  prev: () =>
    set((state) => ({
      currentIndex: Math.max(state.currentIndex - 1, 0),
      questionStartTime: Date.now(),
    })),

  tick: () => set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 })),

  complete: () => set({ isCompleted: true }),

  reset: () =>
    set({
      questions: [],
      answers: {},
      currentIndex: 0,
      startedAt: null,
      elapsedSeconds: 0,
      isCompleted: false,
      timerMode: "free",
      timeLimitSeconds: null,
      questionStartTime: null,
    }),
}));
