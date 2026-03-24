"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  BookOpen,
  Clock,
  BarChart3,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/home", label: "홈", icon: Home },
  { href: "/daily", label: "일간지", icon: BookOpen },
  { href: "/mock", label: "모의고사", icon: Clock },
  { href: "/stats", label: "통계", icon: BarChart3 },
  { href: "/mypage", label: "MY", icon: User },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-light bg-surface safe-bottom">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-[56px] flex-col items-center gap-0.5 py-1 text-[11px] transition-colors",
                isActive
                  ? "text-accent-orange font-semibold"
                  : "text-text-secondary"
              )}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
