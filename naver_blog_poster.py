"""
네이버 블로그 스마트에디터 ONE 자동 포스팅 스크립트
링크 카드 생성 기능 포함
"""

import time
import pyperclip
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import undetected_chromedriver as uc


class NaverBlogPoster:
    def __init__(self, headless=False):
        """
        네이버 블로그 포스터 초기화
        
        Args:
            headless: 브라우저를 백그라운드에서 실행할지 여부
        """
        self.driver = None
        self.wait = None
        self.headless = headless
        
    def setup_driver(self):
        """undetected-chromedriver 설정"""
        print("[설정] 브라우저 드라이버 설정 중...")
        
        # Chrome 드라이버 생성 (버전 자동 감지, 재시도 로직 포함)
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # 각 시도마다 새로운 options 객체 생성
                options = uc.ChromeOptions()
                if self.headless:
                    options.add_argument('--headless')
                options.add_argument('--disable-blink-features=AutomationControlled')
                options.add_argument('--disable-dev-shm-usage')
                options.add_argument('--no-sandbox')
                options.add_argument('--disable-gpu')
                options.add_argument('--disable-software-rasterizer')
                options.add_argument('--disable-extensions')
                
                self.driver = uc.Chrome(options=options, version_main=None, use_subprocess=True)
                self.wait = WebDriverWait(self.driver, 20)
                print("[완료] 드라이버 설정 완료")
                return
            except Exception as e:
                if attempt < max_retries - 1:
                    print(f"[재시도] 드라이버 설정 실패 ({attempt + 1}/{max_retries}), 재시도 중...")
                    time.sleep(2)
                else:
                    print(f"[오류] 드라이버 설정 실패: {str(e)}")
                    print("[안내] 다음 사항을 확인해주세요:")
                    print("  1. Chrome 브라우저가 설치되어 있는지 확인")
                    print("  2. Chrome을 최신 버전으로 업데이트")
                    print("  3. 실행 중인 Chrome 프로세스를 모두 종료 후 재시도")
                    print("  4. 방화벽이나 보안 프로그램이 차단하지 않는지 확인")
                    raise
        
    def login(self, naver_id, naver_pw):
        """
        네이버 로그인 (pyperclip 사용)
        
        Args:
            naver_id: 네이버 아이디
            naver_pw: 네이버 비밀번호
        """
        print("[로그인] 네이버 로그인 중...")
        
        # 네이버 로그인 페이지로 이동
        self.driver.get("https://nid.naver.com/nidlogin.login")
        time.sleep(2)
        
        try:
            # 아이디 입력 필드 찾기
            id_input = self.wait.until(
                EC.presence_of_element_located((By.ID, "id"))
            )
            
            # pyperclip을 사용하여 아이디 복사 후 붙여넣기
            pyperclip.copy(naver_id)
            id_input.click()
            time.sleep(0.5)
            id_input.send_keys(Keys.CONTROL, 'v')
            time.sleep(1)
            
            # 비밀번호 입력 필드 찾기
            pw_input = self.driver.find_element(By.ID, "pw")
            
            # pyperclip을 사용하여 비밀번호 복사 후 붙여넣기
            pyperclip.copy(naver_pw)
            pw_input.click()
            time.sleep(0.5)
            pw_input.send_keys(Keys.CONTROL, 'v')
            time.sleep(1)
            
            # 로그인 버튼 클릭
            login_btn = self.driver.find_element(By.ID, "log.login")
            login_btn.click()
            
            # 로그인 완료 대기 (캡차나 추가 인증이 있을 수 있음)
            print("[대기] 로그인 처리 중... (캡차가 나타나면 수동으로 처리해주세요)")
            time.sleep(5)
            
            # 로그인 성공 확인 (블로그 페이지로 이동 확인)
            if "blog.naver.com" in self.driver.current_url or "naver.com" in self.driver.current_url:
                print("[완료] 로그인 완료")
                return True
            else:
                print("[경고] 로그인 상태 확인 필요")
                return False
                
        except Exception as e:
            print(f"[오류] 로그인 중 오류 발생: {str(e)}")
            return False
    
    def navigate_to_editor(self, blog_url=None):
        """
        블로그 에디터 페이지로 이동
        
        Args:
            blog_url: 블로그 주소 (예: https://blog.naver.com/myhealthdaily)
        """
        if blog_url:
            # 직접 글쓰기 페이지로 이동
            write_url = f"{blog_url}?Redirect=Write"
            print(f"[이동] 글쓰기 페이지로 이동 중: {write_url}")
            self.driver.get(write_url)
        else:
            # 블로그 메인으로 이동 후 글쓰기 클릭
            print("[이동] 블로그 글쓰기 페이지로 이동 중...")
            self.driver.get("https://blog.naver.com")
            time.sleep(2)
            
            try:
                write_btn = self.wait.until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, "a[href*='Redirect=Write']"))
                )
                write_btn.click()
            except:
                # 직접 URL로 접근 시도
                self.driver.get("https://blog.naver.com/PostWriteForm.naver")
        
        # 에디터 로드 대기
        time.sleep(3)
        print("[완료] 에디터 페이지 로드 완료")
    
    def input_title(self, title):
        """
        제목 입력
        
        Args:
            title: 블로그 포스트 제목
        """
        print(f"[제목] 제목 입력 중: {title}")
        
        try:
            # 제목 입력 필드 찾기 (스마트에디터 ONE)
            title_selectors = [
                "div[contenteditable='true'].se-title-input",
                "div.se-title-input",
                "input[placeholder*='제목']",
                "div[class*='title']"
            ]
            
            title_element = None
            for selector in title_selectors:
                try:
                    title_element = self.wait.until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                    )
                    break
                except:
                    continue
            
            if not title_element:
                # 더 넓은 범위로 검색
                title_element = self.driver.find_element(By.CSS_SELECTOR, "div[contenteditable='true']")
            
            title_element.click()
            time.sleep(0.5)
            
            # pyperclip을 사용하여 제목 붙여넣기
            pyperclip.copy(title)
            title_element.send_keys(Keys.CONTROL, 'v')
            time.sleep(1)
            
            print("[완료] 제목 입력 완료")
            
        except Exception as e:
            print(f"[경고] 제목 입력 중 오류: {str(e)}")
            # 제목 입력 실패해도 계속 진행
    
    def input_content(self, content_data):
        """
        본문 내용 입력 (텍스트 및 링크 카드)
        
        Args:
            content_data: 콘텐츠 데이터 리스트
                예: [
                    {"type": "text", "value": "본문 내용 1..."},
                    {"type": "link", "value": "https://www.healthline.com/..."},
                    {"type": "text", "value": "본문 내용 2..."}
                ]
        """
        print("[본문] 본문 내용 입력 시작...")
        
        try:
            # 본문 에디터 영역 찾기 (스마트에디터 ONE)
            body_selectors = [
                "div[contenteditable='true'].se-component",
                "div.se-component-content",
                "div[contenteditable='true'][data-placeholder]",
                "div.se-module-text"
            ]
            
            body_element = None
            for selector in body_selectors:
                try:
                    elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    if elements:
                        # contenteditable이 true인 요소 찾기
                        for elem in elements:
                            if elem.get_attribute('contenteditable') == 'true':
                                body_element = elem
                                break
                        if body_element:
                            break
                except:
                    continue
            
            if not body_element:
                # 최후의 수단: 모든 contenteditable 요소 중 본문 영역 찾기
                all_editable = self.driver.find_elements(By.CSS_SELECTOR, "div[contenteditable='true']")
                for elem in all_editable:
                    # 제목이 아닌 본문 영역 찾기
                    if 'title' not in elem.get_attribute('class').lower():
                        body_element = elem
                        break
            
            if not body_element:
                raise Exception("본문 에디터 영역을 찾을 수 없습니다")
            
            # 본문 영역 클릭하여 포커스
            body_element.click()
            time.sleep(1)
            
            # 콘텐츠 데이터 순회하며 입력
            for idx, item in enumerate(content_data):
                item_type = item.get("type")
                item_value = item.get("value")
                
                if item_type == "text":
                    print(f"  [텍스트] 텍스트 입력 중 ({idx + 1}/{len(content_data)})...")
                    pyperclip.copy(item_value)
                    body_element.send_keys(Keys.CONTROL, 'v')
                    time.sleep(1)
                    
                    # 줄바꿈 추가
                    body_element.send_keys(Keys.ENTER)
                    time.sleep(0.5)
                    
                elif item_type == "link":
                    print(f"  [링크] 링크 카드 생성 중 ({idx + 1}/{len(content_data)})...")
                    
                    # URL 입력
                    pyperclip.copy(item_value)
                    body_element.send_keys(Keys.CONTROL, 'v')
                    time.sleep(1)
                    
                    # Enter 키를 눌러 링크 카드 생성
                    body_element.send_keys(Keys.ENTER)
                    time.sleep(2)  # 링크 카드 생성 대기
                    
                    # 추가 대기 (네트워크 지연 고려)
                    try:
                        # 링크 카드가 생성되었는지 확인
                        self.wait.until(
                            EC.presence_of_element_located((By.CSS_SELECTOR, "div.se-component-link, div[class*='link']"))
                        )
                        print(f"    [완료] 링크 카드 생성 완료: {item_value[:50]}...")
                    except:
                        print(f"    [경고] 링크 카드 생성 확인 실패 (계속 진행)")
                    
                    # 줄바꿈 추가
                    body_element.send_keys(Keys.ENTER)
                    time.sleep(0.5)
            
            print("[완료] 본문 내용 입력 완료")
            
        except Exception as e:
            print(f"[오류] 본문 입력 중 오류 발생: {str(e)}")
            raise
    
    def publish(self):
        """포스트 발행"""
        print("[발행] 포스트 발행 중...")
        
        try:
            # 발행 버튼 찾기
            publish_selectors = [
                "button.btn_publish",
                "button[class*='publish']",
                "a[href*='publish']",
                "button:contains('발행')"
            ]
            
            publish_btn = None
            for selector in publish_selectors:
                try:
                    if ':contains' in selector:
                        # XPath로 텍스트 포함 검색
                        publish_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), '발행')]")
                    else:
                        publish_btn = self.wait.until(
                            EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                        )
                    if publish_btn:
                        break
                except:
                    continue
            
            if not publish_btn:
                # 더 넓은 범위로 검색
                buttons = self.driver.find_elements(By.TAG_NAME, "button")
                for btn in buttons:
                    if '발행' in btn.text or 'publish' in btn.text.lower():
                        publish_btn = btn
                        break
            
            if publish_btn:
                publish_btn.click()
                time.sleep(2)
                
                # 발행 설정 창에서 최종 발행 버튼 클릭
                print("  [설정] 발행 설정 확인 중...")
                time.sleep(2)
                
                # 최종 발행 버튼 찾기
                final_publish_selectors = [
                    "button.btn_confirm",
                    "button[class*='confirm']",
                    "button:contains('발행')"
                ]
                
                for selector in final_publish_selectors:
                    try:
                        if ':contains' in selector:
                            final_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), '발행')]")
                        else:
                            final_btn = self.driver.find_element(By.CSS_SELECTOR, selector)
                        
                        if final_btn and final_btn.is_displayed():
                            final_btn.click()
                            print("[완료] 포스트 발행 완료!")
                            time.sleep(3)
                            return True
                    except:
                        continue
                
                print("[경고] 최종 발행 버튼을 찾을 수 없습니다. 수동으로 확인해주세요.")
                return False
            else:
                print("[오류] 발행 버튼을 찾을 수 없습니다.")
                return False
                
        except Exception as e:
            print(f"[오류] 발행 중 오류 발생: {str(e)}")
            print("[경고] 브라우저를 열어둔 상태로 수동 발행을 시도해주세요.")
            return False
    
    def post_blog(self, naver_id, naver_pw, title, content_data, blog_url=None):
        """
        전체 포스팅 프로세스 실행
        
        Args:
            naver_id: 네이버 아이디
            naver_pw: 네이버 비밀번호
            title: 포스트 제목
            content_data: 콘텐츠 데이터 리스트
            blog_url: 블로그 주소 (선택사항)
        """
        try:
            # 드라이버 설정
            self.setup_driver()
            
            # 로그인
            if not self.login(naver_id, naver_pw):
                print("[오류] 로그인 실패. 스크립트를 종료합니다.")
                return False
            
            # 에디터로 이동
            self.navigate_to_editor(blog_url)
            
            # 제목 입력
            self.input_title(title)
            time.sleep(1)
            
            # 본문 입력
            self.input_content(content_data)
            time.sleep(2)
            
            # 발행
            result = self.publish()
            
            if result:
                print("\n[성공] 포스팅이 성공적으로 완료되었습니다!")
            else:
                print("\n[경고] 포스팅 과정에서 문제가 발생했습니다. 브라우저를 확인해주세요.")
            
            # 사용자 확인 대기 (브라우저 닫기 전)
            print("\n[대기] 브라우저를 10초 후에 닫습니다. 확인이 필요하면 스크립트를 중단하세요.")
            time.sleep(10)
            
            return result
            
        except Exception as e:
            print(f"\n[오류] 전체 프로세스 중 오류 발생: {str(e)}")
            print("[경고] 브라우저를 열어둔 상태로 수동으로 작업을 완료해주세요.")
            try:
                input("\n확인을 위해 Enter 키를 누르세요...")
            except (EOFError, KeyboardInterrupt):
                print("\n[종료] 사용자 입력 대기 중단")
            return False
            
        finally:
            if self.driver:
                self.driver.quit()
                print("[종료] 브라우저 종료")


def main():
    """메인 실행 함수"""
    
    # 설정 정보
    NAVER_ID = "your_naver_id"  # 네이버 아이디 입력
    NAVER_PW = "your_naver_pw"  # 네이버 비밀번호 입력
    BLOG_URL = "https://blog.naver.com/myhealthdaily"  # 블로그 주소
    
    # 포스트 제목
    POST_TITLE = "건강 정보 포스트"
    
    # 콘텐츠 데이터
    content_data = [
        {"type": "text", "value": "오늘은 건강에 대한 유용한 정보를 공유하겠습니다."},
        {"type": "link", "value": "https://www.healthline.com/nutrition/10-benefits-of-exercise"},
        {"type": "text", "value": "위 링크에서 운동의 10가지 이점에 대해 자세히 알아볼 수 있습니다."},
        {"type": "text", "value": "규칙적인 운동은 건강한 삶의 기초입니다."}
    ]
    
    # 포스터 인스턴스 생성 및 실행
    poster = NaverBlogPoster(headless=False)  # headless=True로 설정하면 백그라운드 실행
    
    poster.post_blog(
        naver_id=NAVER_ID,
        naver_pw=NAVER_PW,
        title=POST_TITLE,
        content_data=content_data,
        blog_url=BLOG_URL
    )


if __name__ == "__main__":
    main()

