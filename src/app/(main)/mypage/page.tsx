"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Bell,
  BookX,
  HelpCircle,
  LogOut,
  ChevronRight,
  Crown,
} from "lucide-react";

// Mock 데이터
const USER = {
  name: "수험생",
  email: "student@example.com",
  tier: "light" as const,
  avatarInitial: "수",
};

const TIER_LABEL: Record<string, { label: string; color: string }> = {
  light: { label: "Light", color: "bg-border-light text-text-secondary" },
  pro: { label: "Pro", color: "bg-accent-orange/10 text-accent-orange" },
  max: { label: "MAX", color: "bg-purple-100 text-purple-700" },
};

const MENU_ITEMS = [
  { icon: CalendarDays, label: "D-Day 변경", href: "#" },
  { icon: Bell, label: "알림 설정", href: "#" },
  { icon: BookX, label: "오답 노트", href: "#" },
  { icon: HelpCircle, label: "고객센터", href: "#" },
];

export default function MyPage() {
  const tier = TIER_LABEL[USER.tier];

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 pt-6">
      <h1 className="text-xl font-bold text-text-primary">마이페이지</h1>

      {/* 프로필 */}
      <Card className="flex items-center gap-4 p-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-orange text-xl font-bold text-white">
          {USER.avatarInitial}
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold text-text-primary">{USER.name}</p>
          <p className="text-xs text-text-secondary">{USER.email}</p>
        </div>
        <Badge className={tier.color + " border-0"}>
          {tier.label}
        </Badge>
      </Card>

      {/* 구독 카드 */}
      <Card className="space-y-3 p-5">
        <div className="flex items-center gap-2">
          <Crown size={18} className="text-accent-orange" />
          <span className="text-sm font-bold text-text-primary">구독 관리</span>
        </div>
        <p className="text-xs text-text-secondary">
          현재 <strong>{tier.label}</strong> 티어를 사용 중이에요.
          Pro로 업그레이드하면 PDF 업로드와 RAG 기반 문제를 이용할 수 있어요.
        </p>
        <Button className="w-full bg-accent-orange text-white hover:bg-accent-orange-dark">
          Pro 업그레이드 — $19.99/월
        </Button>
      </Card>

      {/* 메뉴 리스트 */}
      <Card className="divide-y divide-border-light p-0">
        {MENU_ITEMS.map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/50"
          >
            <Icon size={18} className="text-text-secondary" />
            <span className="flex-1 text-sm text-text-primary">{label}</span>
            <ChevronRight size={16} className="text-text-tertiary" />
          </button>
        ))}
      </Card>

      {/* 로그아웃 */}
      <button className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm text-incorrect transition-colors hover:bg-incorrect-light">
        <LogOut size={16} />
        로그아웃
      </button>
    </div>
  );
}
