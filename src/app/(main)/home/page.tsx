import DdayBanner from "@/components/home/DdayBanner";
import StreakCard from "@/components/home/StreakCard";
import TodayMission from "@/components/home/TodayMission";
import WeeklyProgress from "@/components/home/WeeklyProgress";

// TODO: Supabase 연동 후 실제 데이터로 교체
const MOCK_USER = {
  name: "수험생",
  dDay: "2026-11-19",
  streakCount: 5,
  longestStreak: 12,
};

const MOCK_MISSIONS = [
  {
    subject: "korean",
    label: "국어 일간지",
    questionCount: 15,
    completed: false,
    href: "/daily/korean",
  },
  {
    subject: "english",
    label: "영어 일간지",
    questionCount: 14,
    completed: false,
    href: "/daily/english",
  },
];

const MOCK_WEEKLY = [true, true, true, true, false, false, false];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 pt-6">
      {/* 인사 */}
      <div>
        <p className="text-sm text-text-secondary">안녕하세요</p>
        <h1 className="text-xl font-bold text-text-primary">
          {MOCK_USER.name}님, 오늘도 화이팅!
        </h1>
      </div>

      {/* D-Day 배너 */}
      <DdayBanner dDay={MOCK_USER.dDay} />

      {/* 스트릭 */}
      <StreakCard
        streakCount={MOCK_USER.streakCount}
        longestStreak={MOCK_USER.longestStreak}
      />

      {/* 오늘의 학습 */}
      <TodayMission missions={MOCK_MISSIONS} />

      {/* 주간 진행 */}
      <WeeklyProgress days={MOCK_WEEKLY} />
    </div>
  );
}
