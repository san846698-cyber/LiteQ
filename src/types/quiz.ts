export type Subject = 'korean' | 'english' | 'math' | 'ethics' | 'earthscience';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'killer';
export type SessionType = 'daily' | 'mock' | 'weekly';

/** DB explanations JSONB 구조 */
export interface RichExplanation {
  correct: string;
  wrong: Record<string, string>;
  key_point: string;
}

export interface Question {
  id: string;
  subject: Subject;
  area: string;
  subArea?: string;
  questionType: string;
  difficulty: Difficulty;
  points: number;
  passageText?: string;
  questionText: string;
  choices: string[];
  correctAnswer: number;
  explanations: RichExplanation | string[];
  recommendedTime?: number; // seconds
  conceptTags?: string[];
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number; // seconds
}

export interface QuizSession {
  id: string;
  subject: Subject;
  sessionType: SessionType;
  questions: Question[];
  answers: Record<string, QuizAnswer>;
  startedAt: Date;
  completedAt?: Date;
}
