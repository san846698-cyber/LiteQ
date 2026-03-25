#!/bin/bash
# 모든 국어 PDF를 병렬로 JSON 추출
cd "$(dirname "$0")/.."
SRC="수능국어+모의고사"
OUT="data/csat-korean/raw"
mkdir -p "$OUT"

# 중복(1) 제외한 고유 PDF 목록
files=(
  "2023년-고3-3월-모의고사-국어-문제.pdf|2023-3-학평"
  "2023년-고3-4월-모의고사-국어-문제.pdf|2023-4-학평"
  "2023년-고3-7월-모의고사-국어-문제.pdf|2023-7-학평"
  "2023학년도-10월-고3-국어-문제.pdf|2022-10-학평"
  "2024_10-고3-국어영역-문제지.pdf|2024-10-학평"
  "2024년-고3-5월-모의고사-국어-문제.pdf|2024-5-학평"
  "2024년-고3-7월-모의고사-국어-문제.pdf|2024-7-학평"
  "2024학년도-6월-모의평가-국어-문제.pdf|2023-6-모평"
  "2024학년도-9월-모의평가-국어-문제.pdf|2023-9-모평"
  "2024학년도-대학수학능력시험-국어-문제.pdf|2023-11-수능"
  "2025년-5월-고3-모의고사-국어-문제공통.pdf|2025-5-학평공통"
  "2025년-5월-고3-모의고사-국어-문제언어와매체.pdf|2025-5-학평언매"
  "2025년-5월-고3-모의고사-국어-문제화법과작문.pdf|2025-5-학평화작"
  "2025년-9월-고3-모의고사-국어-문제.pdf|2025-9-학평"
  "2025년-고3-10월-모의고사-국어-문제.pdf|2025-10-학평"
  "2025년-고3-7월_국어-문제.pdf|2025-7-학평"
  "2025학년도-6월-모의평가-국어-문제.pdf|2024-6-모평"
  "2025학년도-9월-모의평가-국어-문제.pdf|2024-9-모평"
  "2025학년도-대학수학능력시험-국어-문제.pdf|2024-11-수능"
  "2026년-고3-3월-모의고사-국어-문제.pdf|2026-3-학평"
  "2026학년도-6월-모의평가-국어-문제.pdf|2025-6-모평"
  "2026학년도-대학수학능력시험-국어-문제.pdf|2025-11-수능"
)

pids=()
for entry in "${files[@]}"; do
  IFS='|' read -r fname outname <<< "$entry"
  node --no-warnings scripts/extract-korean-pdf.mjs \
    "$SRC/$fname" "$OUT/$outname.json" &
  pids+=($!)
done

# Wait for all
for pid in "${pids[@]}"; do
  wait "$pid"
done

echo ""
echo "=== Summary ==="
total=0
for entry in "${files[@]}"; do
  IFS='|' read -r fname outname <<< "$entry"
  f="$OUT/$outname.json"
  if [ -f "$f" ]; then
    cnt=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$f','utf8')).totalQuestions)")
    echo "$outname: $cnt questions"
    total=$((total + cnt))
  else
    echo "$outname: FAILED"
  fi
done
echo "Total: $total questions from ${#files[@]} PDFs"
