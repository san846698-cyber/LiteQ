"use client";

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { BookOpen } from "lucide-react";

interface PassagePanelProps {
  passage: string;
  /** 데스크탑에서 항상 보이는 패널 */
  alwaysVisible?: boolean;
}

export default function PassagePanel({
  passage,
  alwaysVisible = false,
}: PassagePanelProps) {
  // 데스크탑 — 항상 보이는 패널
  if (alwaysVisible) {
    return (
      <div className="flex h-full flex-col overflow-y-auto rounded-2xl border border-border-light bg-surface p-6">
        <h3 className="mb-4 text-sm font-semibold text-text-secondary">
          지문
        </h3>
        <p className="whitespace-pre-line font-serif text-[15px] leading-7 text-text-primary">
          {passage}
        </p>
      </div>
    );
  }

  // 모바일 — 드로어
  return (
    <Sheet>
      <SheetTrigger
        render={
          <button className="flex items-center gap-1.5 rounded-full border border-border-light bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent-orange hover:text-accent-orange" />
        }
      >
        <BookOpen size={14} />
        지문 보기
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[75dvh] rounded-t-3xl">
        <SheetTitle className="text-sm font-semibold text-text-secondary">
          지문
        </SheetTitle>
        <div className="overflow-y-auto px-1 pb-8 pt-2">
          <p className="whitespace-pre-line font-serif text-[15px] leading-7 text-text-primary">
            {passage}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
