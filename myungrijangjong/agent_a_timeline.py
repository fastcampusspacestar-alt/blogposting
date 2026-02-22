# -*- coding: utf-8 -*-
"""
[논리 에이전트] 시점 오류 전수 감사 및 수정
==============================================
점검 항목:
  1. post date > CURRENT_DATE  →  과거 날짜로 조정
  2. 후일담 연도 > 2025         →  2025로 상한 고정
  3. 후일담 연도 ≤ caseYear    →  caseYear+1로 보정
     (상담 당해나 그 이전에 후일담이 오는 구조적 오류)
  4. excerpt 의 "찾아 찾아왔다" 중복 표현 → "찾아왔다" 정제
  5. 상담 배경에 "선생님…이 고비가 끝납니까?" 잔류 여부 재확인
"""

import os
import re
import glob
from datetime import date

CONTENT_DIR = os.path.join(os.path.dirname(__file__), "content")
CURRENT_YEAR = 2025
TODAY = date(2025, 12, 31)           # 발행 기준일 상한

# ── 날짜 파싱 ────────────────────────────────────────────────
DATE_FIELD  = re.compile(r'^(date:\s*"?)(\d{4}-\d{2}-\d{2})("?)$', re.MULTILINE)
CASE_YEAR   = re.compile(r'^caseYear:\s*"?(\d{4})"?$', re.MULTILINE)
FOLLOWUP_YR = re.compile(r'^(\d{4})년, [가-힣]+씨로부터 소식이 왔다\.', re.MULTILINE)
DOUBLE_COME = re.compile(r'찾아 찾아왔다')
FIXED_QUOTE = re.compile(r'"선생님, 저는 언제 이 고비가 끝납니까\?"')

stats = {"date_fixed": 0, "followup_fixed": 0, "double_fixed": 0,
         "quote_found": 0, "total": 0, "errors": 0}


def clamp_date(d_str: str) -> str:
    """YYYY-MM-DD 문자열이 TODAY를 초과하면 TODAY로 클램핑."""
    try:
        d = date.fromisoformat(d_str)
        if d > TODAY:
            # 같은 월일, 연도만 상한 조정
            new_year = min(d.year, TODAY.year)
            return f"{new_year}-{d.month:02d}-{d.day:02d}"
    except ValueError:
        pass
    return d_str


def fix_file(filepath: str):
    with open(filepath, encoding="utf-8") as f:
        content = f.read()

    original = content
    stats["total"] += 1

    # ── 1. 발행일 미래 → 과거 조정 ──────────────────────────
    def replace_date(m):
        fixed = clamp_date(m.group(2))
        if fixed != m.group(2):
            stats["date_fixed"] += 1
        return m.group(1) + fixed + m.group(3)

    content = DATE_FIELD.sub(replace_date, content)

    # ── 2 & 3. 후일담 연도 검증 ─────────────────────────────
    case_year_m = CASE_YEAR.search(content)
    if case_year_m:
        case_year = int(case_year_m.group(1))

        def fix_followup(m):
            fu_year = int(m.group(1))
            changed = False
            # 후일담 ≤ 상담연도 → 상담연도+1
            if fu_year <= case_year:
                fu_year = case_year + 1
                changed = True
            # 후일담 > 2025 → 2025
            if fu_year > CURRENT_YEAR:
                fu_year = CURRENT_YEAR
                changed = True
            if changed:
                stats["followup_fixed"] += 1
            return m.group(0).replace(m.group(1), str(fu_year))

        content = FOLLOWUP_YR.sub(fix_followup, content)

    # ── 4. "찾아 찾아왔다" 중복 표현 제거 ───────────────────
    if DOUBLE_COME.search(content):
        content = DOUBLE_COME.sub("찾아왔다", content)
        stats["double_fixed"] += 1

    # ── 5. 구형 고정 발언 잔류 확인 (수정 없이 카운트) ───────
    if FIXED_QUOTE.search(content):
        stats["quote_found"] += 1

    # ── 저장 ────────────────────────────────────────────────
    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)


# 모든 카테고리 파일 순회
for pattern in ["cases/*.md", "theory/*.md", "analysis/*.md",
                "seasonal/*.md", "essays/*.md"]:
    for fp in sorted(glob.glob(os.path.join(CONTENT_DIR, pattern))):
        try:
            fix_file(fp)
        except Exception as e:
            stats["errors"] += 1

print(f"점검 완료 ({stats['total']}개 파일)")
print(f"  발행일 수정       : {stats['date_fixed']}건")
print(f"  후일담 연도 수정  : {stats['followup_fixed']}건")
print(f"  중복 표현 수정    : {stats['double_fixed']}건")
print(f"  구형 고정 발언    : {stats['quote_found']}건 (잔류)")
print(f"  오류              : {stats['errors']}건")

