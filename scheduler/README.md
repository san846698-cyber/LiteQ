# LiteQ 스케줄러

993문항 문제 은행에서 조건에 맞는 세트를 자동 조립합니다.

## 사용법

```bash
# 문제 은행 현황
node scheduler.js --stats

# 부족 영역 확인
node scheduler.js --check-shortage

# 특정 요일 세트 생성
node scheduler.js --day mon
node scheduler.js --day wed --save    # 파일 저장

# 한 주 전체 생성
node scheduler.js --week 2026-03-23 --save

# 특정 날짜
node scheduler.js --day thu --date 2026-04-02 --save
```

## 주간 시간표

| 요일 | 과목 |
|------|------|
| 월 | 국어 일간지 + 수학 일간지 + 지구과학 일간지 |
| 화 | 영어 일간지 + 수학 일간지 + 생윤 일간지 |
| 수 | 국어 일간지 + **수학 모의고사** |
| 목 | 영어 일간지 + 수학 일간지 + 지구과학 일간지 |
| 금 | 국어 일간지 + 수학 일간지 + 생윤 일간지 |
| 토 | **국어 모의고사** + **영어 모의고사** |
| 일 | 휴식 |

## 조립 규칙
- 난이도 배분 준수 (composition)
- topic 중복 제한
- 최근 사용 문항 제외
- 정답 분포 검증 (35% 초과 시 경고)
