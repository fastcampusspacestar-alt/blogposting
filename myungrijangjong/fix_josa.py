# -*- coding: utf-8 -*-
"""
케이스 파일 상담 배경 섹션에서 '으로/로' 조사 오류를 수정합니다.
한국어 규칙: 받침 없거나 ㄹ받침이면 '로', 그 외 받침 있으면 '으로'
"""
import re
import glob


def needs_euro(char):
    """True이면 '으로', False이면 '로'를 써야 한다."""
    code = ord(char) - 0xAC00
    if code < 0 or code > 11171:
        return False  # 비한글
    jongseong = code % 28
    # jongseong==0: 받침 없음 → '로'
    # jongseong==8: ㄹ받침    → '로'
    return jongseong not in (0, 8)


def fix_euro(m):
    char = m.group(1)
    if needs_euro(char):
        return m.group(0)   # 으로 유지
    return char + '로'       # 으로 → 로


PATTERN = re.compile(r'([가-힣])으로')
BG_SECTION = re.compile(r'(## 상담 배경.*?)(?=\n## )', re.DOTALL)

files = sorted(glob.glob('content/cases/*.md'))
fixed_files = 0

for fp in files:
    with open(fp, encoding='utf-8') as f:
        text = f.read()

    def fix_section(m):
        return PATTERN.sub(fix_euro, m.group(0))

    new_text = BG_SECTION.sub(fix_section, text)
    if new_text != text:
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(new_text)
        fixed_files += 1

print(f"완료: {fixed_files}개 파일 수정")

