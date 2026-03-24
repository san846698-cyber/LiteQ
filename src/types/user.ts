export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  targetExam: string;
  dDay: string; // ISO date
  tier: 'light' | 'pro' | 'max';
  streakCount: number;
  longestStreak: number;
  createdAt: string;
}
