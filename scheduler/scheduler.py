#!/usr/bin/env python3
"""
LiteQ 스케줄러 — 993문항 문제 은행에서 자동 세트 조립

Usage:
  python scheduler.py --day mon
  python scheduler.py --date 2026-03-23
  python scheduler.py --week 2026-03-23
  python scheduler.py --subject 수학 --type daily
  python scheduler.py --subject 수학 --type weekly --wrong-tags "수열,점화식"
  python scheduler.py --stats
  python scheduler.py --check-shortage
"""

import argparse
import json
import os
import sys
from datetime import datetime, timedelta

# Add scheduler dir to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from question_bank import QuestionBank
from assembler import SetAssembler
from schedule import WEEKLY_SCHEDULE, DAY_NAMES
from configs import *


def get_bank_path():
    return os.path.join(os.path.dirname(__file__), "..", "data", "question_bank")


def get_output_path():
    return os.path.join(os.path.dirname(__file__), "output")


def load_bank():
    bank = QuestionBank()
    bank.load(get_bank_path())
    return bank


def generate_day(bank, day_name, date_str=None, wrong_tags=None):
    """특정 요일의 세트 생성"""
    schedule = WEEKLY_SCHEDULE.get(day_name)
    if schedule is None:
        print(f"{day_name}: 휴식일 (세트 없음)")
        return None

    assembler = SetAssembler(bank)
    sets = []
    total_q = 0

    for entry in schedule:
        set_type = entry["type"]
        config = entry["config"]

        if set_type == "daily":
            questions = assembler.assemble_daily(config)
        elif set_type == "mock":
            questions = assembler.assemble_mock(config)
        elif set_type == "weekly":
            questions = assembler.assemble_weekly(config, wrong_tags or [])
        else:
            continue

        # Validate
        result = assembler.validate(questions, config)
        status = "✓" if result["valid"] else "⚠"
        if not result["valid"]:
            for err in result["errors"]:
                print(f"  {config['subject']} {err}")

        # Mark used
        for q in questions:
            bank.mark_used(q["qid"])

        sets.append({
            "subject": config["subject"],
            "type": set_type,
            "total": len(questions),
            "est_time": config.get("est_time", ""),
            "time_limit": config.get("time_limit"),
            "valid": result["valid"],
            "questions": questions,
        })
        total_q += len(questions)
        print(f"  {status} {config['subject']} {set_type}: {len(questions)}/{config['total']}문항")

    output = {
        "meta": {
            "date": date_str or datetime.now().strftime("%Y-%m-%d"),
            "day": day_name,
            "sets": [{
                "subject": s["subject"],
                "type": s["type"],
                "total": s["total"],
                "est_time": s["est_time"],
                "time_limit": s["time_limit"],
            } for s in sets],
            "total_questions": total_q,
        },
        "sets": [{
            "subject": s["subject"],
            "type": s["type"],
            "questions": s["questions"],
        } for s in sets],
    }

    return output


def print_stats(bank):
    """문제 은행 현황"""
    stats = bank.get_stats()
    print("\n=== LiteQ 문제 은행 현황 ===")
    for subj, count in sorted(stats["by_subject"].items(), key=lambda x: -x[1]):
        # Get diff breakdown
        subj_qs = bank.filter(subject=subj)
        diffs = {}
        for q in subj_qs:
            d = q.get("diff", 0)
            diffs[d] = diffs.get(d, 0) + 1
        diff_str = " ".join(f"d{k}:{v}" for k, v in sorted(diffs.items()))
        print(f"  {subj:12s} {count:4d}문항  ({diff_str})")
    print(f"  {'─' * 40}")
    print(f"  {'총계':12s} {stats['total']:4d}문항")


def check_shortage(bank):
    """부족 영역 확인 (4주 운영 기준)"""
    print("\n=== 부족 영역 (4주 운영 기준) ===")

    requirements = {
        "수학": {"total_needed": 284, "diff4_needed": 20},
        "국어": {"total_needed": 120, "diff4_needed": 0},
        "영어": {"total_needed": 200, "diff4_needed": 0},
        "생활과윤리": {"total_needed": 80, "diff4_needed": 0},
        "지구과학1": {"total_needed": 80, "diff4_needed": 0},
    }

    for subj, req in requirements.items():
        qs = bank.filter(subject=subj)
        total = len(qs)
        needed = req["total_needed"]
        if total < needed:
            print(f"  ⚠ {subj}: {total}문항 / 필요 {needed} → {needed - total}문항 부족")
        else:
            print(f"  ✓ {subj}: {total}문항 (충분)")


def main():
    parser = argparse.ArgumentParser(description="LiteQ 스케줄러")
    parser.add_argument("--day", help="요일 (mon~sun)")
    parser.add_argument("--date", help="날짜 (YYYY-MM-DD)")
    parser.add_argument("--week", help="주 시작일 (YYYY-MM-DD)")
    parser.add_argument("--subject", help="과목")
    parser.add_argument("--type", help="유형 (daily/mock/weekly)")
    parser.add_argument("--wrong-tags", help="오답 태그 (쉼표 구분)")
    parser.add_argument("--stats", action="store_true", help="문제 은행 현황")
    parser.add_argument("--check-shortage", action="store_true", help="부족 영역 확인")
    parser.add_argument("--save", action="store_true", help="결과를 파일로 저장")
    args = parser.parse_args()

    bank = load_bank()

    if args.stats:
        print_stats(bank)
        return

    if args.check_shortage:
        check_shortage(bank)
        return

    # Single day
    if args.day or args.date:
        day_name = args.day
        date_str = args.date

        if date_str and not day_name:
            dt = datetime.strptime(date_str, "%Y-%m-%d")
            day_name = DAY_NAMES[dt.weekday()]

        if not day_name:
            day_name = DAY_NAMES[datetime.now().weekday()]
            date_str = datetime.now().strftime("%Y-%m-%d")

        print(f"\n=== {date_str or 'today'} ({day_name}) 세트 생성 ===")
        output = generate_day(bank, day_name, date_str,
                              wrong_tags=args.wrong_tags.split(",") if args.wrong_tags else None)

        if output and args.save:
            out_dir = get_output_path()
            os.makedirs(out_dir, exist_ok=True)
            fname = f"{date_str or day_name}.json"
            with open(os.path.join(out_dir, fname), "w", encoding="utf-8") as f:
                json.dump(output, f, ensure_ascii=False, indent=2)
            print(f"\n저장: output/{fname}")

        if output:
            total = output["meta"]["total_questions"]
            print(f"\n총 {total}문항 생성 완료")

        return

    # Full week
    if args.week:
        start = datetime.strptime(args.week, "%Y-%m-%d")
        print(f"\n=== {args.week} 주간 세트 생성 ===\n")
        week_total = 0

        for i in range(7):
            dt = start + timedelta(days=i)
            day_name = DAY_NAMES[dt.weekday()]
            date_str = dt.strftime("%Y-%m-%d")
            print(f"--- {date_str} ({day_name}) ---")
            output = generate_day(bank, day_name, date_str)
            if output:
                week_total += output["meta"]["total_questions"]
                if args.save:
                    out_dir = get_output_path()
                    os.makedirs(out_dir, exist_ok=True)
                    fname = f"{date_str}_{day_name}.json"
                    with open(os.path.join(out_dir, fname), "w", encoding="utf-8") as f:
                        json.dump(output, f, ensure_ascii=False, indent=2)
            print()

        print(f"주간 총 {week_total}문항 생성")
        return

    # Default: show stats
    print_stats(bank)
    check_shortage(bank)


if __name__ == "__main__":
    main()
