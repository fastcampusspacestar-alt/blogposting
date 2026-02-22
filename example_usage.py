"""
네이버 블로그 포스팅 사용 예시
"""

from naver_blog_poster import NaverBlogPoster

# 설정 정보
NAVER_ID = "facamstarship"  # 실제 네이버 아이디로 변경
NAVER_PW = "asdfasdf11@"  # 실제 네이버 비밀번호로 변경
BLOG_URL = "https://blog.naver.com/myhealthdaily"  # 본인의 블로그 주소로 변경

# 포스트 제목
POST_TITLE = "[거북목 예방] 스마트폰 사용 시 목 건강을 지키는 올바른 자세"

# 거북목 교정을 위한 모니터 높이 설정법 콘텐츠 데이터
content_data = [
    {
        "type": "text", 
        "value": "[거북목 탈출] 전문가가 권장하는 올바른 모니터 높이 설정 가이드\n\n현대인들에게 거북목(Forward Head Posture)은 피할 수 없는 숙명처럼 여겨지곤 합니다. 하지만 단순히 목이 뻐근한 문제를 넘어, 방치할 경우 경추 디스크와 만성 두통의 원인이 됩니다. 오늘은 세계적인 의료 기관들이 권장하는 가장 과학적인 모니터 세팅 방법을 정리해 드립니다.\n\n"
    },
    {
        "type": "link", 
        "value": "https://www.mayoclinic.org/healthy-lifestyle/adult-health/in-depth/office-ergonomics/art-20046169"
    },
    {
        "type": "text", 
        "value": "\n\n1. 시선 각도가 척추 건강을 결정합니다.\n미국의 권위 있는 의료 기관인 Mayo Clinic에서는 사무실 에르고노믹스의 핵심으로 '눈높이'를 꼽습니다. 모니터의 상단 1/3 지점이 내 눈과 수평이 되어야 목에 가해지는 하중이 가장 적습니다.\n\n2. 모니터와의 거리와 각도\n- 거리: 팔을 앞으로 뻗었을 때 모니터 화면에 손끝이 살짝 닿는 정도(약 50~70cm)가 적당합니다.\n- 각도: 화면을 약 10~20도 정도 뒤로 기울이면 목 근육의 긴장을 이완하는 데 도움이 됩니다.\n\n"
    },
    {
        "type": "link", 
        "value": "https://pubmed.ncbi.nlm.nih.gov/25393825/"
    },
    {
        "type": "text", 
        "value": "\n\n3. 과학적 근거: 왜 높여야 하는가?\n위 NCBI 연구 데이터에 따르면, 고개가 60도 숙여질 때 경추가 감당해야 하는 무게는 약 27kg(60파운드)에 달합니다. 이는 7살 아이를 목에 태우고 있는 것과 같은 무게입니다.\n\n4. 실천 가능한 꿀팁\n- 모니터 받침대나 두꺼운 책을 활용해 눈높이를 반드시 맞추세요.\n- 노트북 사용자라면 별도의 키보드와 마우스를 구비하고 거치대를 사용하는 것만으로도 거북목 위험을 50% 이상 낮출 수 있습니다.\n\n지금 바로 모니터 높이를 5cm만 높여보세요. 작은 변화가 여러분의 평생 목 건강을 결정합니다.\n"
    }
]

# 포스터 인스턴스 생성
# headless=False: 브라우저를 보면서 실행 (디버깅 용이)
# headless=True: 백그라운드에서 실행 (빠르지만 확인 어려움)
poster = NaverBlogPoster(headless=False)

# 포스팅 실행
poster.post_blog(
    naver_id=NAVER_ID,
    naver_pw=NAVER_PW,
    title=POST_TITLE,
    content_data=content_data,
    blog_url=BLOG_URL
)


