# -*- coding: utf-8 -*-
"""
기존 케이스 파일들의 '상담 배경' 섹션을 다양한 템플릿으로 재생성합니다.
프론트매터에서 메타데이터를 읽어 각 파일에 맞는 배경을 새로 작성합니다.
"""

import os
import re
import glob
import random

CONTENT_DIR = os.path.join(os.path.dirname(__file__), "content", "cases")

# ─── 시대 이벤트 ─────────────────────────────────────────────
CASE_EVENTS_BY_ERA = {
    2015: ["메르스 사태", "부동산 침체", "전세난", "청년 실업"],
    2016: ["박근혜 탄핵 정국", "사드 배치 논란", "구조조정 한파"],
    2017: ["촛불혁명", "조선업 불황", "자영업 위기"],
    2018: ["남북 정상회담 이후 불확실성", "암호화폐 광풍", "부동산 급등"],
    2019: ["한일 무역 갈등", "자영업 폐업 급증", "취업난 심화"],
    2020: ["코로나19 대유행", "주식 폭락 후 급등", "언택트 전환"],
    2021: ["부동산 폭등", "코인 붐", "대기업 채용 축소"],
    2022: ["금리 인상 충격", "러시아·우크라이나 전쟁", "물가 급등"],
    2023: ["고금리 지속", "부동산 역전세", "AI 혁명 시작"],
    2024: ["총선 정국", "AI 일자리 위협", "내수 침체"],
    2025: ["불확실한 경제", "기후 변화", "고령화 가속"],
}

SEASONS = ["봄", "여름", "가을", "겨울"]
MONTHS_KR = ["1월", "2월", "3월", "4월", "5월", "6월",
             "7월", "8월", "9월", "10월", "11월", "12월"]

# ─── 오프닝 스타일 ───────────────────────────────────────────
BACKGROUND_OPENINGS = [
    lambda d: (
        f"{d['year']}년, {d['era_event']}의 여파가 채 가시지 않던 시절이었다. "
        f"{d['region']}에서 찾아온 {d['surename']}씨는 당시 {d['age']}세, "
        f"{d['problem']} 문제로 이 문을 두드렸다."
    ),
    lambda d: (
        f"{d['year']}년 {d['month']}의 상담이었다. "
        f"{d['region']} 출신 {d['surename']}씨(당시 {d['age']}세)는 "
        f"{d['problem']} 문제로 수소문 끝에 찾아왔다고 했다."
    ),
    lambda d: (
        f"{d['surename']}씨가 처음 연락을 해온 것은 {d['year']}년 {d['season']}이었다. "
        f"{d['region']} 거주, 당시 {d['age']}세. "
        f"지인의 소개로 {d['problem']} 문제를 들고 찾아왔다."
    ),
    lambda d: (
        f"{d['year']}년, 낯선 번호로 먼저 전화가 왔다. "
        f"조심스럽게 상담 가능 여부를 묻더니, 며칠 뒤 직접 문을 두드렸다. "
        f"{d['region']}에서 온 {d['surename']}씨, {d['age']}세였다. "
        f"화두는 {d['problem']}이었다."
    ),
    lambda d: (
        f"몇 해를 망설였다고 했다. "
        f"명리학을 믿지 않는 편이었는데, {d['problem']} 문제가 도무지 풀리지 않자 "
        f"마지막 수단으로 찾아왔다는 것이었다. {d['year']}년 {d['season']}, "
        f"{d['region']}에 사는 {d['surename']}씨(당시 {d['age']}세)의 이야기다."
    ),
    lambda d: (
        f"{d['year']}년 {d['season']}, {d['surename']}씨가 {d['problem']}을 들고 "
        f"상담실 문을 두드렸다. {d['region']} 거주, 당시 {d['age']}세."
    ),
    lambda d: (
        f"{d['era_event']}{_josa_ro(d['era_event'])} 세상이 뒤숭숭하던 {d['year']}년이었다. "
        f"그 무렵 {d['region']}의 {d['surename']}씨({d['age']}세)가 찾아왔다. "
        f"오랜 {d['problem']} 문제로 더는 혼자 감당이 안 된다며."
    ),
    lambda d: (
        f"{d['surename']}씨를 처음 만난 것은 {d['year']}년 {d['season']}이었다. "
        f"{d['region']} 거주, 당시 {d['age']}세. "
        f"이번 상담의 주제는 {d['problem']}이었다."
    ),
    lambda d: (
        f"{d['year']}년 {d['month']}, {d['surename']}씨는 혼자 오지 않았다. "
        f"가족과 함께 {d['region']}에서 먼 길을 달려온 것이었다. "
        f"당시 {d['age']}세. {d['problem']}으로 가정 전체가 흔들리고 있었다."
    ),
    lambda d: (
        f"{d['year']}년 {d['season']}, 블로그 글을 보고 찾아왔다고 했다. "
        f"{d['region']} 출신 {d['surename']}씨, 당시 {d['age']}세. "
        f"{d['problem']} 문제로 한동안 인터넷을 뒤지다 이곳까지 오게 됐다는 것이었다."
    ),
]

# ─── 첫인상 묘사 ─────────────────────────────────────────────
FIRST_IMPRESSIONS = [
    "문을 열고 들어서는 표정부터 이미 많이 지쳐 있었다. 두 손에 꼭 쥔 노트에는 미리 적어온 질문들이 빼곡했다.",
    "자리에 앉자마자 눈물을 보였다. 그 정도로 오랜 기간 홀로 짊어져 온 고민이었다.",
    "첫인상은 침착해 보였지만, 말문을 열자마자 목이 메었다. 평소 감정을 드러내지 않는 사람이라 했다.",
    "눈빛이 또렷했다. 이미 오래 생각해온 사람의 눈빛이었다. 의자에 앉으면서도 시선이 흔들리지 않았다.",
    "준비해 온 듯 작은 서류봉투를 꺼내 들었다. 기사 스크랩, 메모지, 그리고 본인이 직접 뽑아 온 사주 자료까지 들어 있었다.",
    "한동안 아무 말도 하지 않았다. 그냥 앉아서 창밖을 바라보다가, 천천히 입을 열었다.",
    "잠을 며칠째 제대로 못 잔 기색이 역력했다. 목소리도 낮게 가라앉아 있었고, 간간이 눈을 비볐다.",
    "두 시간 넘게 걸렸다고 했다. 그러고도 찾아오지 않으면 후회할 것 같아서 왔다는 말이 인상에 남았다.",
    "간단한 인사 뒤 곧바로 본론으로 들어갔다. 길게 이야기할 여유가 없다는 듯이.",
    "혼자였다. 들어오면서도 몇 번이나 뒤를 돌아봤다. 아무에게도 여기 온다고 말하지 않은 것 같았다.",
    "가방 끈을 쥔 손이 하얗게 굳어 있었다. 자리에 앉고 나서야 조금씩 긴장이 풀리는 것이 보였다.",
    "솔직히 믿지는 않는다고 먼저 말했다. 그러나 여기까지 온 것 자체가 이미 대답이었다.",
]

# ─── 의뢰인 발언 ─────────────────────────────────────────────
CLIENT_QUOTES = {
    "사업·재물": [
        "\"이 사업, 계속 끌고 가야 하는 겁니까, 아니면 이쯤에서 접어야 합니까?\"",
        "\"동업자가 배신한 겁니까? 명식에서 그게 보입니까?\"",
        "\"올해 안에 한 번 더 기회가 오겠습니까?\"",
        "\"돈이 들어오다가 막히는 이유가 명식에 있는 겁니까?\"",
        "\"창업 시기가 잘못된 겁니까?\"",
    ],
    "결혼·부부": [
        "\"이 사람과 끝까지 같이 가야 합니까?\"",
        "\"헤어지는 게 맞는 방향인지, 아닌지 그것만 알려 주세요.\"",
        "\"명식에서 이혼이 보입니까?\"",
        "\"이 사람이 진짜 제 짝이 맞습니까?\"",
        "\"결혼을 해야 나아지는 겁니까, 혼자가 낫습니까?\"",
    ],
    "직업·취업": [
        "\"지금 회사를 떠나야 할 때입니까, 아직 아닙니까?\"",
        "\"이번 면접, 붙겠습니까?\"",
        "\"저는 이 일이 맞는 사람입니까?\"",
        "\"승진이 계속 밀리는 게 제 사주 탓입니까?\"",
        "\"이직하면 더 나아집니까?\"",
    ],
    "건강·수명": [
        "\"수술을 해야 합니까, 버텨야 합니까?\"",
        "\"언제쯤 좋아집니까? 끝이 보이질 않습니다.\"",
        "\"명식에서 큰 병이 보입니까?\"",
        "\"이 몸이 언제까지 버텨줄지 모르겠습니다.\"",
        "\"가족한테 짐이 되는 건지 걱정됩니다.\"",
    ],
    "자녀·교육": [
        "\"이 아이 진로를 어떻게 잡아줘야 합니까?\"",
        "\"올해 입시, 좋은 결과가 있겠습니까?\"",
        "\"제 사주가 아이한테까지 영향을 미치는 겁니까?\"",
        "\"아이가 왜 이렇게 힘들어하는지 이유가 있습니까?\"",
        "\"부모로서 어떻게 도와줘야 합니까?\"",
    ],
    "이사·풍수": [
        "\"지금 집 방향이 잘못된 겁니까?\"",
        "\"올해 이사를 해도 됩니까?\"",
        "\"이사를 가야 기운이 바뀝니까? 아니면 그냥 버텨야 합니까?\"",
        "\"이사한 뒤로 계속 안 좋은 일이 생깁니다.\"",
        "\"어느 방향으로 가야 좋겠습니까?\"",
    ],
    "시험·시험운": [
        "\"이번이 마지막 도전입니다. 됩니까?\"",
        "\"제 사주에 시험 합격이 보입니까?\"",
        "\"몇 번을 더 도전해야 합니까?\"",
        "\"준비는 다 했습니다. 운이 따라주겠습니까?\"",
        "\"이 시험이 제 길이 맞습니까?\"",
    ],
    "연애·이성": [
        "\"이 사람을 잡아야 합니까, 보내야 합니까?\"",
        "\"저는 언제 좋은 사람을 만납니까?\"",
        "\"상대방이 저를 진지하게 생각하고 있습니까?\"",
        "\"연인이 생기면 제 운이 바뀝니까?\"",
        "\"이 인연, 억지로 유지해야 합니까?\"",
    ],
    "default": [
        "\"선생님, 저는 언제 이 고비가 끝납니까?\"",
        "\"지금 제가 어떤 시기를 지나고 있는 겁니까?\"",
        "\"이 상황이 제 팔자입니까?\"",
        "\"어떻게 하면 됩니까?\"",
        "\"명식에서 답이 보입니까?\"",
    ],
}


def _josa_ro(word):
    """단어 끝 글자에 따라 '으로' 또는 '로' 반환."""
    if not word:
        return "로"
    code = ord(word[-1]) - 0xAC00
    if code < 0 or code > 11171:
        return "로"
    jongseong = code % 28
    return "로" if jongseong in (0, 8) else "으로"


def make_background_section(year, era_event, region, surename, age, problem, consult_type):
    season = random.choice(SEASONS)
    month = random.choice(MONTHS_KR)
    d = dict(year=year, era_event=era_event, region=region,
             surename=surename, age=age, problem=problem,
             season=season, month=month)
    opening = random.choice(BACKGROUND_OPENINGS)(d)
    impression = random.choice(FIRST_IMPRESSIONS)
    quotes = CLIENT_QUOTES.get(consult_type, CLIENT_QUOTES["default"])
    quote = random.choice(quotes)
    return f"## 상담 배경\n\n{opening}\n\n{impression}\n\n{quote}\n"


def parse_frontmatter(content):
    """프론트매터에서 필드 추출"""
    fm = {}
    m = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not m:
        return fm
    for line in m.group(1).splitlines():
        kv = re.match(r'^(\w+):\s*"?([^"]*)"?', line)
        if kv:
            fm[kv.group(1)] = kv.group(2).strip()
    return fm


def extract_age_from_title(title):
    """제목에서 나이 추출 시도"""
    m = re.search(r'당시\s*(\d+)세', title)
    if m:
        return int(m.group(1))
    return random.randint(28, 68)


def extract_region_from_excerpt(excerpt):
    """excerpt에서 지역 추출"""
    regions = ["서울", "경기도", "인천", "부산", "대구", "대전", "광주",
               "울산", "세종", "강원", "충북", "충남", "전북", "전남",
               "경북", "경남", "제주"]
    for r in regions:
        if r in excerpt:
            return r
    return "전국"


# ── 교체 패턴: '## 상담 배경' ~ '## 사주 명식 분석' 사이 ────
BG_PATTERN = re.compile(
    r'(## 상담 배경\n)(.*?)(\n## 사주 명식 분석)',
    re.DOTALL
)

fixed = 0
skipped = 0
errors = 0

md_files = glob.glob(os.path.join(CONTENT_DIR, "*.md"))
print(f"대상: {len(md_files)}개 케이스 파일")

for filepath in sorted(md_files):
    filename = os.path.basename(filepath)
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        if "## 상담 배경" not in content:
            skipped += 1
            continue

        fm = parse_frontmatter(content)
        year = int(fm.get("caseYear", "2020"))
        consult_type = fm.get("consultType", "default")
        excerpt = fm.get("excerpt", "")

        # 기존 배경 섹션에서 메타데이터 추출
        bg_match = BG_PATTERN.search(content)
        if not bg_match:
            skipped += 1
            continue

        old_bg = bg_match.group(2)

        # 지역, 성씨, 나이, 문제 추출 (기존 내용 파싱)
        region_m = re.search(r'(\S+에서|(\S+) 거주|\S+ 출신)', old_bg)
        region = "전국"
        for r in ["서울", "경기도", "인천", "부산", "대구", "대전", "광주",
                  "울산", "강원", "충북", "충남", "전북", "전남",
                  "경북", "경남", "제주"]:
            if r in old_bg:
                region = r
                break

        surename_m = re.search(r'([가-힣]{1,2})씨', old_bg)
        surename = surename_m.group(1) if surename_m else "의뢰인"

        age_m = re.search(r'당시\s*(\d+)세', old_bg)
        age = int(age_m.group(1)) if age_m else random.randint(28, 68)

        problem_m = re.search(r'([가-힣\s·]{2,10})\s*문제로', old_bg)
        problem = problem_m.group(1).strip() if problem_m else "삶의 전환점"

        era_events = CASE_EVENTS_BY_ERA.get(year, ["당시 사회적 상황"])
        era_event = random.choice(era_events)

        new_bg = make_background_section(
            year, era_event, region, surename, age, problem, consult_type
        )

        new_content = BG_PATTERN.sub(
            lambda m: new_bg + m.group(3),
            content
        )

        if new_content == content:
            skipped += 1
            continue

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)

        fixed += 1

    except Exception as e:
        print(f"  [ERROR] {filename}: {e}")
        errors += 1

print(f"\n완료: 수정 {fixed}개 / 변경없음 {skipped}개 / 오류 {errors}개")

