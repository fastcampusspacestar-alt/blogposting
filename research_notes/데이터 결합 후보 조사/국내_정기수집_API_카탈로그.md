# 국내 정기수집 가능 공개 데이터 API·정기 파일 카탈로그와 결합 키

> 조사 기준일: 2026-11-09. 조사 환경 제약: 이 세션에서는 data.go.kr, kosis.kr, ecos.bok.or.kr, sgis.kostat.go.kr, data.seoul.go.kr, opendart.fss.or.kr, developers.naver.com, developers.kakao.com, docs.upbit.com, developers.google.com, mediawiki.org 등 대부분의 공식 문서 호스트가 네트워크 허용 목록 밖이어서 **직접 페이지 열람이 불가**했고, 검색 엔진 결과(공식 페이지 발췌 포함)와 GitHub에 공개된 2차 문서(PublicDataReader, NomaDamas/k-skill, pykrx 등)로 교차 확인했다. 따라서 "갱신주기/트래픽 한도"처럼 상세 페이지의 메타데이터에만 적힌 수치는 일부 확인하지 못했고, 그런 항목은 각 절의 Gaps에 명시했다. 사용자가 해당 호스트를 허용하면 후속 조사로 채울 수 있다.

---

## 공통 전제: 공공데이터포털(data.go.kr) 계정·트래픽·호출 규칙

### Takeaway
공공데이터포털 API는 대부분 "개발계정 일 10,000건(서비스별 상이, 1,000~40,000건)" 자동 승인, 운영계정은 활용사례 등록 후 심의로 상향되는 구조이며, 페이지당 최대 10,000건(서비스별로는 100~1,000건)이고 트래픽 초기화가 자정에 일괄로 이뤄지지 않는다.

### Cited Findings
- 금융위원회 공공데이터 FAQ: 개발계정과 운영계정은 제공 데이터가 동일하며 일일 호출 가능 건수만 다르다. 개발계정 일 최대 10,000건, 운영계정 일 최대 100,000건. 한도 초과 시 추가 호출은 오류, 다음 날 재적용. 트래픽 초기화는 자정에 일괄 초기화되는 방식이 아니라 시스템 처리에 따라 순차 반영 — [금융위원회 FAQ](https://fsc.go.kr/in060501)
- 공공데이터포털 목록 표기 예: 개발계정 신청 가능 트래픽 10,000, 운영계정은 "활용사례 등록시 신청하면 트래픽 증가 가능" — [data.go.kr 공공데이터포털 검색 서비스 페이지](https://www.data.go.kr/data/15112888/openapi.do)
- 한 페이지당 조회 건수(numOfRows)는 최대 10,000건이며 초과 설정 시 10,000건까지만 응답, 대량 데이터는 pageNo를 증가시켜 분할 조회 — [공공데이터 이용가이드](https://www.data.go.kr/ugs/selectPublicDataUseGuideView.do)
- 개발계정 승인은 자동 처리이며 가이드에 따라 "평일 기준 10분~3일" 또는 "법적으로 최대 열흘"로 설명이 갈린다 — [wikidocs 공공데이터포털 API 키 발급 가이드](https://wikidocs.net/292158); [tilnote](https://tilnote.io/pages/6a74b3816a3236abc1b4bc20)
- 공통 오류코드: 22 = 서비스 일일 호출 허용량 초과(초기화 후 재시도 또는 트래픽 증가 신청), 23 = 초당 호출 허용량 초과(잠시 대기 후 재시도), 12 = 폐기된 서비스, 30/31/32 = 키 미등록·기한만료·도메인 불일치 — [data.go.kr 오류코드(법정동 속성 API 페이지)](https://data.go.kr/data/15124020/openapi.do)
- PublicDataReader 문서: 인증키 발급 후 "보통 1~2시간 내 호출 가능, 일부 API는 24시간 이상" — [PublicDataReader TransactionPrice.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/TransactionPrice.md)
- 2026-07-31 이후 네이버 신규 키는 NAVER API HUB에서 발급(종량제), 이전 키는 개발자센터 — [네이버 API HUB 안내(ncloud docs)](https://guide.ncloud-docs.com/docs/apihub-overview)

### Inferences
- 개인/소규모 팀의 일 단위 배치 수집은 개발계정 한도(1,000~40,000건/일)로 대부분 충분하지만, 실거래가처럼 "시군구×월" 조합을 전국 단위로 긁는 작업은 250개 시군구×12개 상품만 해도 하루 3,000콜이 되므로 한도를 서비스별로 확인하고 증분 수집(변경분 위주) 설계가 필요하다.
- 포털의 "업데이트 주기: 실시간" 표기는 "원천 시스템이 바뀌면 API도 즉시 반영된다"는 뜻이지 데이터가 실시간으로 생성된다는 의미가 아니다(실거래가는 신고 기한 30일 때문에 한 달 이상 시차를 두고 채워진다).

### Gaps
- 서비스별 정확한 개발계정 한도(1,000 vs 10,000 vs 40,000)와 "업데이트 주기" 표기는 각 상세 페이지에서만 확인 가능하며, 이 세션에서는 data.go.kr 접근이 차단되어 전수 확인하지 못했다.

---

## KQ1. 공공데이터포털 인기 API 각각의 갱신주기·결합키·한도

### Takeaway
국토부 실거래가(12종)는 시군구 5자리+계약년월 단위 조회에 법정동·지번·(아파트 매매만) 도로명코드·단지일련번호를 담고 있어 건축물대장(시군구+법정동+번/지→PNU)과 지번 결합이 가능하고, 상가정보·국민연금·전기차충전소·에어코리아 등은 시군구/법정동/행정동코드 또는 좌표를 공통 키로 가진다. 다만 갱신주기·한도는 포털 상세 페이지에만 적혀 있어 상당수는 2차 문서로만 확인했다.

### Cited Findings

#### 카탈로그 표 (공공데이터포털·중앙기관)

| # | 데이터명 (제공기관) | 접근 방식 | 인증·한도·비용 | 갱신주기·시차 | 결합 키 | 과거 이력 | 출처 |
|---|---|---|---|---|---|---|---|
| 1 | 아파트 매매 실거래가 상세 (국토교통부) | REST (apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev) | data.go.kr 키, 개발계정 일 10,000건(블로그), 페이지 최대 1,000, 무료 | 포털 표기 "실시간"(오피스텔 전월세 페이지 기준) | 지역코드(시군구 5), 법정동명, 법정동코드 일체, 지번, 도로명·도로명코드·건물본번/부번코드, 단지일련번호, 계약년월일, 층, 전용면적, 등기일자 | LAWD_CD+DEAL_YMD로 과거 월 조회 가능(해제여부·해제사유발생일 포함) | [wikidocs](https://wikidocs.net/342597); [TransactionPrice.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/TransactionPrice.md); [data.go.kr 15126468](https://www.data.go.kr/data/15126468/openapi.do) |
| 2 | 아파트 전월세 (국토부) | REST | 동일 | 동일 | 지역코드, 법정동, 지번, 아파트명, 건축년도, 층, 전용면적, 계약구분/기간, 갱신요구권사용, 종전계약보증금/월세 | 과거 월 조회 가능 | [data.go.kr 15126474](https://www.data.go.kr/data/15126474/openapi.do) |
| 3 | 분양입주권(분양권전매) 매매 (국토부) | REST | 동일 | 동일 | 지역코드, 시군구, 법정동, 지번, 단지, 층 | 가능 | [data.go.kr 15126471](https://www.data.go.kr/data/15126471/openapi.do) |
| 4 | 오피스텔 매매 / 전월세 (국토부) | REST | 개발계정 10,000건, 운영계정 활용사례 등록 시 상향, 업데이트 주기 "실시간" | 동일 | 지역코드, 시군구, 법정동, 지번, 단지, 건축년도, 층 | 가능 | [data.go.kr 15126464](https://www.data.go.kr/data/15126464/openapi.do); [15126475](https://www.data.go.kr/data/15126475/openapi.do) |
| 5 | 연립다세대 매매 / 전월세 (국토부) | REST | 동일 | 동일 | 지역코드, 법정동, 지번, 건물명, 대지권면적 | 가능 | [15126467](https://www.data.go.kr/data/15126467/openapi.do); [15126473](https://www.data.go.kr/data/15126473/openapi.do) |
| 6 | 단독다가구 매매 / 전월세 (국토부) | REST | 동일 | 동일 | 지역코드, 법정동, 지번(매매만; 전월세는 지번 없음), 주택유형 | 가능 | [15126465](https://www.data.go.kr/data/15126465/openapi.do); [15126472](https://www.data.go.kr/data/15126472/openapi.do) |
| 7 | 토지 매매 (국토부) | REST | 동일 | 동일 | 지역코드, 시군구, 법정동, 지번, 용도지역, 지목 | 가능 | [15126466](https://www.data.go.kr/data/15126466/openapi.do) |
| 8 | 상업업무용 / 공장창고등 매매 (국토부) | REST | 동일 | 동일 | 지역코드, 시군구, 법정동, 지번, 건물주용도, 용도지역 | 가능 | [15126463](https://www.data.go.kr/data/15126463/openapi.do); [15126470](https://www.data.go.kr/data/15126470/openapi.do) |
| 9 | 건축HUB 건축물대장정보 10종 (국토부) | REST getBrTitleInfo 등 | data.go.kr 키, numOfRows 최대 100(2차 문서) | 미확인 | sigunguCd(5)+bjdongCd(5)+platGbCd+bun+ji → PNU 19자리, 관리건축물대장PK(mgmBldrgstPk), 도로명대지위치, 새주소도로코드·새주소법정동코드·본번·부번, 사용승인일 | 현재 대장 스냅샷(이력은 사용승인일·변동일 필드로만) | [data.go.kr 15134735](https://www.data.go.kr/data/15134735/openapi.do); [k-skill building-register-search](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/building-register-search.md); [BuildingLedger.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/BuildingLedger.md) |
| 10 | 건축물 소유자정보 (국토부) | REST | data.go.kr 키 | 미확인 | mgm_bldrgst_pk, 소유구분, 지분, 변동원인일 | 변동원인일 필드 | [data.go.kr 15021136](https://www.data.go.kr/data/15021136/openapi.do) |
| 11 | 토지임야정보 (국토부) | REST | data.go.kr 키 | 데이터기준일자(lastUpdtDt) 필드 | PNU(pnu), 법정동코드(ldCode), 지번, 지목, 면적, 소유구분 | 현재 스냅샷 | [data.go.kr 15057917](https://www.data.go.kr/data/15057917/openapi.do); [LandForestLedger.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/LandForestLedger.md) |
| 12 | 토지소유정보 (국토부) | REST | data.go.kr 키 | lastUpdtDt | PNU, 법정동코드 10자리, 공시지가, 소유권변동일자/원인 | 변동일자 필드 | [data.go.kr 15058047](https://www.data.go.kr/data/15058047/openapi.do); [LandOwnership.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/LandOwnership.md) |
| 13 | 국민연금 가입 사업장 내역 V2 (국민연금공단) | REST apis.data.go.kr/B552015/NpsBplcInfoInqireServiceV2 | data.go.kr 키, 활용신청 필수(미신청 시 403) | 자료생성년월 단위(월별 취득·상실 시계열 제공) | 사업자등록번호 **앞 6자리만**, 사업장명, 법정동주소코드, 가입자수, 당월고지금액 | 월별 시계열 제공 | [data.go.kr 3046071 소개(k-skill)](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/national-pension-workplace.md); [data.go.kr 파일데이터](https://www.data.go.kr/data/3070507/fileData.do) |
| 14 | 국세청 사업자등록정보 진위확인·상태조회 (국세청) | REST POST, 1회 최대 100건 | data.go.kr 키 | 조회 시점 상태 | 사업자등록번호 10자리(b_no), 법인등록번호(corp_no, 진위확인 선택), b_stt 납세자상태, tax_type, end_dt 폐업일 | 현재 상태만(폐업일은 제공) | [data.go.kr 15081808](https://www.data.go.kr/data/15081808/openapi.do); [Nts.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/Nts.md) |
| 15 | 금융위 기업기본정보 V2 (금융위원회) | REST GetCorpBasicInfoService_V2/getCorpOutline_V2 | data.go.kr 키, 15043184 활용신청 | 미확인 | 법인등록번호 crno 13자리, 법인명 corpNm(검색 키는 이 둘뿐), 응답에 bzno(사업자번호) | 미확인 | [data.go.kr 15043184(k-skill)](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/fsc-corporate-info.md) |
| 16 | 심평원 병원정보서비스 / 약국정보서비스 (건강보험심사평가원) | REST getHospBasisList, getParmacyBasisList | data.go.kr 키 | 공식 주기 미확인(판매 페이지 주장 "일 1회") | 요양기관기호 ykiho는 **1:1 매칭된 암호화 값**(복호화·원 요양기호 미제공), 시도/시군구코드, 주소, 좌표 | 현재 스냅샷(요양기관 상세현황 파일은 분기별·연말 추출) | [data.go.kr 약국정보 15001673](https://www.data.go.kr/biz/dcat/metadata/15001673.do); [요양기관 상세현황 15051059](https://www.data.go.kr/dcat/metadata/15051059) |
| 17 | 식품안전나라 OpenAPI (식약처) | REST openapi.foodsafetykorea.go.kr/api/{키}/{서비스ID}/json/{시작}/{끝} (샘플: /api/sample/I0490/json/1/5) | 식품안전나라 회원가입 후 키 1개로 전 서비스(I0040, I0050, I0490, I2620 등) 호출 | 미확인 | 서비스별 상이(인허가번호, 업소명, 제품명, 바코드 등) | 회수·부적합 이력은 누적 목록 | [k-skill mfds-food-safety](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/mfds-food-safety.md); [skillselion 요약](https://skillselion.com/skills/nomadamas/k-skill/mfds-food-safety) |
| 18 | 에어코리아 측정소별 실시간 측정정보 (한국환경공단) | REST | data.go.kr 키, 개발계정 승인 후 약 1시간 내 호출 | 1시간 평균값은 보정 후 매시 5분 제공, 확정자료 아님(확정은 에어코리아 통계정보) | 측정소명(stationName), 시도명, 측정일시(dataTime), TM좌표 기반 근접 측정소 | 서울시 Sheet/OpenAPI는 최근 1개월만 — 직접 쌓아야 함 | [서울 OA-23044](https://data.seoul.go.kr/dataList/OA-23044/S/1/datasetView.do); [data.go.kr 측정소정보 메타](https://www.data.go.kr/biz/dcat/metadata/15073877.do); [wikidocs](https://wikidocs.net/110747) |
| 19 | 전기차 충전소 정보 (환경부) | REST getChargerInfo / getChargerStatus | data.go.kr 키, 15076352 별도 활용신청, numOfRows 10~9999 | 미확인(상태 API는 period 1~10 파라미터) | zcode 시도 2자리, zscode 시군구 5자리, statId, chgerId, lat/lng, addr | 상태는 현재 스냅샷 → 직접 적재 필요; 표준데이터 15013115 CSV는 기준일 시점 | [k-skill ev-charger-nearby](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/ev-charger-nearby.md) |
| 20 | 기상청 ASOS 일자료 / 시간자료 / AWS (기상청) | REST | data.go.kr 키 | 시간자료 종료일은 D-1까지 | 지점번호 stnIds(예: 서울 108), 일시; 동일 지점번호라도 기간별 위치가 다를 수 있어 지점정보 API로 위경도 이력 확인 필요 | 과거 기간 조회 가능 | [ASOS 일자료 15059093](https://www.data.go.kr/en/data/15059093/openapi.do); [ASOS 시간자료 15057210](https://www.data.go.kr/data/15057210/openapi.do); [AWS 15057084](https://www.data.go.kr/data/15057084/openapi.do) |
| 21 | 기상청 단기예보·초단기실황/예보 (기상청) | REST getVilageFcst, getUltraSrtNcst 등 | data.go.kr 키 | 초단기실황 매시 정각 발표 후 ~10분, 초단기예보 :30 발표 후 ~15분, 단기예보 발표 후 ~10분 뒤 가용; 이전 호출 시 NODATA | 격자 nx/ny(5km), base_date/base_time, 카테고리(TMP, SKY, PTY, POP…) | 예보는 발표 시점 스냅샷 → 직접 적재 | [k-skill korea-weather](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/korea-weather.md) |
| 22 | 한국전력 가구 평균 전력사용량 등 (한국전력공사) | REST(전력데이터개방포털 API) | 전력데이터개방포털(bigdata.kepco.co.kr) 가입 후 사용, 무료, JSON/XML; 일부 데이터는 데이터안심구역 전용 | 미확인 | 지역 단위(설명에 세부 코드 미기재), 지역본부 관할구분(시간별) | 미확인 | [data.go.kr 15101404](https://www.data.go.kr/data/15101404/openapi.do); [시간별 전력사용량 메타](https://www.data.go.kr/dcat/metadata/15150724) |
| 23 | 소상공인 상가(상권)정보 API (소상공인시장진흥공단) | REST apis.data.go.kr/B553077/api/open/sdsc2 — 상권(지정/반경/사각형/행정구역), 상가(단일/건물/지번/행정동/상권/반경/사각형/다각형/업종별/수정일자), 업종분류 | data.go.kr 키 | 분기(파일 메타 "분기", 2026-06-30 기준 스냅샷이 2026-08-05 수정) | 상가업소번호, 상권업종 대(2)/중(4)/소(6)분류코드, 행정동코드(adongCd), 건물관리번호, 지번코드, 좌표 | API는 현재 스냅샷+"수정일자상가" 조회; 파일은 최신 분기만 배포 | [data.go.kr 15012005](https://www.data.go.kr/data/15012005/openapi.do); [SmallShop.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/SmallShop.md); [파일 메타 15083033](https://www.data.go.kr/catalog/15083033/fileData.json) |
| 24 | 소상공인 상가정보 공개 파일 (동일) | 정기 파일(17개 시도별 zip, 비회원 다운로드 가능) | 무료, 인증 불필요 | 분기 | 상가업소번호, 상호, 상권업종소분류코드, 행정동, 경도/위도 (사업자번호·개업일 없음) | 포털엔 최신 분기만 → 과거 스냅샷 직접 보관 필요 | [k-skill store-longevity-radar](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/store-longevity-radar.md) |
| 25 | 지방행정인허가 LOCALDATA (행정안전부) | 무인증 파일 서버 file.localdata.go.kr/file/download/{업종slug}/info?orgCode={지자체코드} (CP949 CSV, Referer 헤더 필요) + 2026-01부터 data.go.kr 통합 API 209종 | 무료 | 매일 갱신, 2일 전 기준 현행화; 인허가 195종은 과거 이력 제공 | 영업상태, 인허가일자, 폐업일자, 도로명/지번주소, 업태구분 (사업자등록번호 없음) | 과거 이력 제공(195종) | [k-skill localdata-business-status](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/localdata-business-status.md); [경향신문 2026-01](https://www.khan.co.kr/article/202601251400011/); [뉴스서울](https://newsseoul.co.kr/news/view/1065579617179088) |
| 26 | 구조동물(유기동물) 조회 / 분실동물 조회 (농림축산검역본부) | REST (시도·시군구·보호소·품종 코드 조회 API 별도 제공) | data.go.kr 키 | 미확인 | 시도코드, 시군구코드, 보호소번호, 품종코드, 접수일 | 공고 기간 조회 | [data.go.kr 15098931](https://www.data.go.kr/data/15098931/openapi.do); [15141910](https://www.data.go.kr/data/15141910/openapi.do) |
| 27 | 나라장터 입찰공고정보 (조달청) | REST apis.data.go.kr/1230000/ad/BidPublicInfoService (getBidPblancListInfoServcPPSSrch 등) | data.go.kr 키; 개발계정 일 1,000건(2차 문서) | 공고 게시 즉시 | 공고번호(bidNtceNo), 수요기관코드, 입찰일시 | 기간 조회 가능 | [Nara MCP README](https://glama.ai/mcp/servers/@Datajang/mcp-narajangteo/blob/55133d2ce4f3687c60640271eac660bc31a43109/README.md) |
| 28 | 나라장터 발주계획현황 (조달청) | REST OrderPlanSttusService | data.go.kr 키, 15129462 활용신청 | 발주년월·게시일시 | 기관코드, 사업명, bidNtceNoList | 발주년월 조회 | [k-skill g2b-order-plan-search](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/g2b-order-plan-search.md) |
| 29 | 청약홈 청약접수 경쟁률·특별공급 신청현황 / 분양정보 (한국부동산원) | REST JSON+XML | 무료, 개발계정 40,000건, 운영단계 심의승인, 업데이트 "실시간" | 공고·접수 즉시 | 주택관리번호·공고번호, 시도, 공급위치 | 과거 공고 조회 | [data.go.kr 15098905](https://www.data.go.kr/data/15098905/openapi.do); [분양정보 파일 15088658](https://www.data.go.kr/data/15088658/fileData.do) |
| 30 | 온비드 공매물건 5종(캠코공매물건, 이용기관공매물건, 정부재산정보, 물건정보, 온비드코드) (한국자산관리공사) + 차세대 온비드 입찰결과 | REST | data.go.kr 키 | 미확인 | 물건관리번호 CLTR_MNMT_NO, 공고번호 PLNM_NO, 공매번호 PBCT_NO, 지번/도로명주소, 시도·시군구·읍면동 코드(온비드코드 서비스) | 입찰이력 API는 같은 회차가 중복 반환, 정상 매각 완료 건은 목록에서 빠짐(2차 문서) | [Kamco.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/Kamco.md); [data.go.kr 15157222](https://www.data.go.kr/data/15157222/openapi.do); [onbid MCP 메모](https://glama.ai/mcp/servers/rghioydk2w) |
| 31 | 고용24 OPEN API 채용·직업정보 (한국고용정보원) | REST(고용24 OPEN API) | 미확인 | 미확인 | 고용24 직업코드 ↔ 표준직업분류 매핑 파일 제공 | 미확인 | [data.go.kr 직업코드 매핑 15158873](https://www.data.go.kr/biz/dcat/metadata/15158873.do) |
| 32 | KAMIS 농산물 유통정보 OpenAPI (한국농수산식품유통공사) | REST dailyPriceByCategoryList 등 | KAMIS 인증키(p_cert_key, p_cert_id) | 일별 조사가격, 전일/1주/1개월/1년/평년 비교 제공 | 부류코드(p_item_category_code), 도소매 구분(p_product_cls_code), 지역코드(p_country_code), 조사일자 | 과거 일자 조회 가능 | [k-skill kamis-food-price](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/kamis-food-price.md); [KAMIS 공식 OpenAPI 안내](https://www.kamis.or.kr/customer/reference/openapi_list.do?action=detail&boardno=1) |
| 33 | 오피넷 유가정보 OpenAPI (한국석유공사) | REST aroundAll.do, detailById.do, areaCode.do 등 | 오피넷 인증키(apiId 발급 페이지), 무료 | 일별 갱신(지자체 연계 데이터 설명) | 주유소 ID, 지역코드, KATEC 좌표(WGS84 아님), 유종 | 공식 과거 이력 엔드포인트 미확인 → 일별 적재 권장 | [k-skill cheap-gas-nearby](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/cheap-gas-nearby.md); [data.go.kr 오피넷 주유소 상세 15076636](https://www.data.go.kr/data/15076636/openapi.do); [시도별 평균가격 15163154](https://www.data.go.kr/catalog/15163154/openapi.json) |
| 34 | KOBIS 영화관입장권통합전산망 OpenAPI (영화진흥위원회) | REST searchDailyBoxOfficeList.json, searchMovieInfo.json | 회원가입 후 키, 심사 없음, 공개된 일별 한도 수치 없음(2차 자료) | 상영 마감·보정으로 익일 오전까지 통계 계속 갱신 | targetDt(일자), movieCd(영화코드), 순위 | 과거 일자 조회 가능 | [yozm 기사](https://yozm.wishket.com/magazine/detail/3920/); [wikidocs](https://wikidocs.net/48297) |
| 35 | KOPIS 공연예술통합전산망 OpenAPI (예술경영지원센터) | REST pblprfr(공연목록), pblprfr/{mt20id}, prfplc(시설), prfplc/{mt10id} | KOPIS 회원가입 후 이용신청 키; 도메인은 kopis.or.kr(www 리다이렉트 시 차단) | 미확인 | 공연ID mt20id, 시설ID mt10id, 지역코드, 공연기간 | 기간 조회 가능 | [k-skill kopis](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/kopis-performance-search.md); [KOPIS OpenAPI 안내](https://www.kopis.or.kr/por/cs/openapi/openApiInfo.do?menuId=MNU_00074) |
| 36 | 도서관 정보나루 API (국립중앙도서관) | REST | 기본 일 500회, 마이페이지에서 서버 IP 등록 시 일 30,000회; 2023-11-20부터 무제한 중단; 키 승인 보통 익일 오전(2차 자료) | 대출 현황은 실제와 시차 | ISBN13, 도서관코드(libCode), 지역코드(region/dtl_region) | 인기대출도서 등 기간 조회 | [data4library MCP 소개](https://llmbase.ai/mcp-servers/data4library/); [k-skill library-book-search](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/library-book-search.md); [공식 API 안내](https://www.data4library.kr/apiUtilization) |
| 37 | 인천공항 운항현황(D-3~D+6)·승객예고 출입국장별 (인천국제공항공사) | REST | 승객예고 API: 개발계정 일 1,000, 운영계정 신청 시 일 1,000,000 | 운항현황은 H-2~H+2, D~D+1 등 창 단위 실시간 | 편명, 항공사, 출입국장, 시각 | 실시간 창만 제공 → 직접 적재 | [data.go.kr 승객예고(검색 결과; 정확한 데이터셋 번호 확인 필요)](https://www.data.go.kr/data/15095066/openapi.do); [GitHub 예제](https://github.com/youni202/incheon-airport-info-app) |
| 38 | 한국관광공사 TourAPI 4.0 KorService2 (한국관광공사) | REST apis.data.go.kr/B551011/KorService2 (areaCode2, ldongCode2, areaBasedList2, locationBasedList2, areaBasedSyncList2 등), 매뉴얼 Ver 4.3(2025-05-12) | data.go.kr 키; 일일 트래픽 초과 시 차단 가능(수치 미확인) | 콘텐츠 수정일(modifiedtime) 기준 동기화 목록 제공 | 지역코드(areaCode), 법정동코드(ldongCode2), 콘텐츠ID(contentid), 좌표(mapx/mapy) | areaBasedSyncList2로 변경분 동기화 | [TourAPI 라이브러리](https://github.com/JoMingyu/TourAPI); [studygov 안내](https://studygov.kr/blog/13071-tourism-info-service/) |
| 39 | 나이스 교육정보 개방포털 OpenAPI (교육부) — 학교기본정보 schoolInfo, 급식식단 mealServiceDietInfo 등 | REST | 나이스 개방포털 키(공공데이터포털에도 등록), 이용허락범위 제한 없음 | 급식은 일별(MLSV_YMD) | 시도교육청코드(ATPT_OFCDC_SC_CODE)+표준학교코드(SD_SCHUL_CODE) | 과거 일자 조회 | [data.go.kr 15139198](https://data.go.kr/data/15139198/openapi.do); [neis-api 라이브러리](https://github.com/my-school-info/neis-api) |
| 40 | 국가법령정보 공동활용 OpenAPI (법제처) | REST open.law.go.kr lawSearch.do / lawService.do, target=law/eflaw/prec/detc/expc/admrul/ordin/trty | OC(가입 이메일 ID) + 호출 서버 공인 IP/도메인 등록 필요, 무료, 승인 1~2일 또는 즉시(자료 상이) | 현행 기준 | 법령ID, MST, LID, 조문 JO | 시행일 법령(eflaw)으로 시점별 조회 가능 | [k-skill korean-law-search](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/korean-law-search.md); [law.go.kr 안내](https://law.go.kr/LSW/information.do); [anythingmcp 가이드](https://anythingmcp.com/ja/marketplace/korea-law) |
| 41 | 열린국회정보 OpenAPI (국회사무처) | REST open.assembly.go.kr/portal/openapi/{서비스명} (ALLBILLV2, BILLINFODETAIL, 표결 등) | 인증키, 일 트래픽 초과 시 ERROR-337 | 의안 발의·표결 즉시 | BILL_ID, 대수(AGE/ERACO), 의원코드 | 대수별 과거 조회 | [k-skill assembly-bill-vote-search](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/assembly-bill-vote-search.md) |
| 42 | 한국천문연구원 특일정보(공휴일) (KASI) | REST getRestDeInfo 등 | data.go.kr 키, 15012690 | 연 단위 고시 | locdate(YYYYMMDD), isHoliday | 과거 연도 조회 | [k-skill korean-holiday-calendar](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/korean-holiday-calendar.md) |
| 43 | 건강검진기관·장기요양기관 (국민건강보험공단) | REST | data.go.kr 키, 15059029·15154419 각각 활용신청 | 미확인 | 시도/시군구코드, 기관 요양기호, 주소 | 현재 스냅샷 | [k-skill nhis-care-checkup-search](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/nhis-care-checkup-search.md) |
| 44 | 한국부동산원 R-ONE 부동산 종합정보 14종(분양정보, 청약경쟁률, 청약당첨정보, 공동주택단지정보, 공동주택실거래가격지수, 주택/주간아파트/오피스텔/월세/상업용임대 가격동향, 부동산거래, 지가변동률, 연령대별부동산거래, 녹색건축인증) | REST, 10,000행 단위 페이징 | data.go.kr 키 | 주간/월간 통계 | 지역코드, 단지코드(공동주택단지정보), 통계표 ID | 시계열 제공 | [Reb.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/Reb.md) |

#### 보충 발견
- 실거래가 조회 키는 법정동 10자리가 아닌 **법정동코드 앞 5자리(시군구)** LAWD_CD와 계약년월 6자리 DEAL_YMD — [wikidocs 공공데이터 API 이해하기](https://wikidocs.net/342597)
- 아파트 매매 상세 API 응답(32개 컬럼)에만 도로명·도로명코드·도로명건물본번호코드·등기일자가 있고, 전월세·연립·오피스텔은 지번까지만 제공한다 — [TransactionPrice.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/TransactionPrice.md)
- 건축물대장 PNU 구성: 시군구코드 5 + 법정동코드 5 + 토지구분 1 + 번 4 + 지 4 = 19자리. 토지구분은 PNU에서 1(일반)/2(산)이지만 건축물대장 API의 platGbCd는 0/1로 쓰이므로 변환 필요 — [k-skill building-register-search](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/building-register-search.md); 토지소유정보 문서는 대지구분코드 0→1, 1→2, 2→3 변환을 설명 — [LandOwnership.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/LandOwnership.md)
- 상권업종분류는 표준산업분류 기반 대분류 10·중분류 75·소분류 247(코드 2/4/6자리)이며, KSIC 10차 연계표는 업종 정제 때문에 상권업종분류와 다를 수 있다 — [서울 열린데이터광장 상권 공지](https://data.seoul.go.kr/bsp/wgs/dataView/data300View/10011.do); [data.go.kr 15083033 카탈로그](https://www.data.go.kr/catalog/15083033/fileData.json)
- 상가정보 파일 활용 시 "0건이면 코드체계 변경을 의심"해야 하며, 문구·완구 업종은 2022년 이전 코드가 달랐다 — [k-skill store-longevity-radar](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/store-longevity-radar.md)
- 지방행정인허가: 기존 197종에서 209종 전체로 API 개방, 인허가 195종은 과거 이력까지 제공, 기존 localdata 포털은 2026-04-15까지 병행 운영 예정 — [경향신문](https://www.khan.co.kr/article/202601251400011/); [뉴스서울](https://newsseoul.co.kr/news/view/1065579617179088)
- 국민연금 사업장 API는 사업자등록번호 앞 6자리만 노출하므로 상호명 매칭이 필수이고, 법인·일정 규모 이상 사업장 위주라 소규모 개인사업장은 조회되지 않을 수 있다 — [k-skill national-pension-workplace](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/national-pension-workplace.md)
- 심평원 약국정보서비스 요양기호는 "1:1로 매칭한 암호화된 요양기호"로만 제공되고 별도 복호화 방법이나 원 요양기호는 제공하지 않는다 — [data.go.kr 15001673 메타](https://www.data.go.kr/biz/dcat/metadata/15001673.do)
- 관세청 시도별 품목 수출입 API: 매월 15일경 신고 정정·취하를 반영해 전월까지 자료를 현행화, 주기 1개월; HS 2·4·6·10단위 집계 — [data.go.kr 15101607](https://www.data.go.kr/data/15101607/openapi.do); [15101641(영문)](https://www.data.go.kr/en/data/15101641/openapi.do)
- 2026-09-01부터 시·군·구 기준 HSK 10단위 통계 비공개, HS 2·4·6단위는 중량 제외 수출입액만 제공, 시·도 및 국가 단위는 기존대로 — [스마트투데이](https://www.smarttoday.co.kr/ko-kr/articles/111033)
- 네이버 검색 API HUB 등장으로 고용24는 아님; 고용24 OPEN API의 직업코드는 "직업정보 수집·연계 서비스 개발 시 검색 파라미터로 활용"되며 표준직업분류와의 매핑 파일이 있다 — [data.go.kr 15158873](https://www.data.go.kr/biz/dcat/metadata/15158873.do)

### Inferences
- 실거래가(법정동명+지번) ↔ 건축물대장(법정동코드+번/지) 결합은 "법정동명→법정동코드 10자리" 변환 테이블(KQ5)이 있어야 하며, 아파트 매매만 도로명코드를 주므로 비아파트는 지번 결합이 유일한 경로다.
- 상가정보(사업자번호 없음)·LOCALDATA(사업자번호 없음)·국민연금(앞 6자리)·국세청(10자리 입력 필요)은 서로 완전한 식별자 결합이 불가능하고, 상호명+주소/좌표 근접 매칭이 현실적인 결합 방식이다.
- 에어코리아·전기차충전기 상태·인천공항 운항현황·오피넷 가격·단기예보처럼 "최근 창(window)만 주는" API는 스케줄러로 매시/매일 적재해야 이력이 생긴다.

### Gaps
- data.go.kr 접근 차단으로 각 API 상세 페이지의 "업데이트 주기"·"개발계정 트래픽" 수치를 1차 소스로 확인하지 못했다(실거래가 10,000건, 나라장터 1,000건, 청약홈 40,000건, 인천공항 1,000건 등은 2차 자료 또는 검색 발췌).
- 건축물대장·전기차충전소·온비드·구조동물·고용24·KEPCO·KOPIS·TourAPI의 공식 갱신주기와 일 한도 수치는 찾지 못했다.
- KOBIS "일 3,000회" 한도는 어떤 자료에서도 확인되지 않았다(한 기사는 "공개된 일별 한도 수치 없음"이라고 명시).
- 한국전력 전력데이터개방포털의 법정동 단위 월별 전력사용량 API 명세는 확인하지 못했다(가입 후 매뉴얼 pptx에서 확인 필요).
- 고용24 채용공고 API 자체의 엔드포인트·갱신주기·한도는 미확인.
- 심평원 병원정보서비스의 data.go.kr 데이터셋 번호는 확인하지 못했다(약국 15001673만 확인).

---

## KQ2. 통계 API(KOSIS, ECOS, SGIS, e-나라지표, 국세통계, 고용행정통계, 관세청)

### Takeaway
KOSIS·ECOS는 무료 키 기반 REST로 orgId/tblId 또는 통계표코드+주기코드로 시계열을 받으며(1회 응답 셀/행 제한 있음), e-나라지표는 비상업 목적 한정·12개월 승인 갱신 구조다. SGIS·국세통계·고용행정통계는 공식 문서를 열지 못해 한도·시차를 확인하지 못했다.

### Cited Findings
- KOSIS OpenAPI: 인증키 무료, kosis.kr/openapi 회원가입 후 활용신청; orgId 기본 101(통계청), tblId 예 DT_1IN0001; 서비스는 통계목록(vwCd, parentListId), 통계자료(필수 orgId, tblId, objL1, itmId, prdSe; 선택 objL2~8; 기간은 startPrdDe/endPrdDe 또는 newEstPrdCnt/prdInterval), 통계표설명(자료갱신일 포함), 통합검색; 응답은 ORG_ID, TBL_ID, C1~C8(분류코드), ITM_ID, UNIT_NM, PRD_SE, PRD_DE, DT — [kosis R 패키지 README](https://search.r-project.org/CRAN/packages/kosis/readme/README.html); [PublicDataReader Kosis.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/kosis/Kosis.md)
- KOSIS 한도(2차 문서): 분당 1,000건 호출 한도, 1회 응답 40,000셀 제한(초과 시 코드 31/41 → 기간·분류 분할 또는 대용량(userStatsId) 서비스), 코드 40 = 호출 한도 초과, prdSe는 M/Q/S/Y/F/IR — [k-skill kosis-stats](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/kosis-stats.md)
- KOSIS 오류코드: 10/11 인증키 누락·만료, 21 잘못된 요청변수 — [kosis R 패키지](https://ftp.fau.de/cran/web/packages/kosis/readme/README.html); 공식 매뉴얼 PDF — [openApi_manual_v1.0.pdf](https://kosis.kr/openapi/file/openApi_manual_v1.0.pdf)
- ECOS: URL은 경로 세그먼트형 `https://ecos.bok.or.kr/api/StatisticSearch/{키}/json/kr/{start}/{end}/{STAT_CODE}/{CYCLE}/{START}/{END}/`, 주기 A/S/Q/M/SM/D, 서비스는 StatisticTableList, StatisticItemList, StatisticSearch, KeyStatisticList(100대 지표), StatisticWord, 통계메타DB; 응답 STAT_CODE, ITEM_CODE1~4, TIME, DATA_VALUE; 데모키 `sample`은 호출당 최대 10행(ERROR-301), 개인키는 ecos.bok.or.kr/api 무료 발급; 과도한 호출 시 ERROR-602 — [k-skill bok-ecos-stats](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/bok-ecos-stats.md); [PublicDataReader ecos.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/ecos/ecos.md); [Apify ECOS 액터(ERROR-602 언급)](https://apify.com/nexgendata/korea-bok-monetary-policy-ecos)
- e-나라지표(지표누리) OpenAPI: 인증키 필요, 활용기간 승인일로부터 12개월(이후 1년 자동연장, 테스트 목적은 1개월 후 재승인), 원칙적으로 비상업적 연구·교육·공공서비스 한정(상업적 이용은 별도 계약·사전 승인), 출처 표시(지표누리·국가데이터처) 의무, JSON/XML — [index.go.kr Open API 안내](https://www.index.go.kr/unity/openApi/openApiIntro.do?cdNo=410)
- 관세청 수출입 통계: 매월 15일경 정정·취하 반영해 전월까지 현행화, 주기 1개월, HS 2/4/6/10단위, 2026-09-01부터 시군구 HSK10 비공개 — [data.go.kr 15101607](https://www.data.go.kr/data/15101607/openapi.do); [스마트투데이](https://www.smarttoday.co.kr/ko-kr/articles/111033); 무역협회 K-stat 통계 안내 — [stat.kita.net 가이드](https://stat.kita.net/stat/guide/guide_19.screen)
- 한국부동산원 R-ONE: 14개 통계 서비스, 10,000행 페이징(청약경쟁률 아파트 30,042행 예시) — [Reb.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/Reb.md)
- KB부동산 주택가격동향(민간 통계, 키 불필요): 주간/월간 매매·전세 지수, 5분위, PIR 등; 입력 시도코드 2자리, 출력 지역코드 10자리(서울 1100000000, 강동구 1174000000, 전국 0000000000) → 법정동코드 체계와 호환 — [Kbland.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/kbland/Kbland.md)

### Inferences
- KOSIS·ECOS·R-ONE·KB는 모두 "통계표코드+지역코드+시점" 구조라서 지역코드를 법정동코드 앞자리(시도 2/시군구 5)로 정규화하면 실거래가·상가정보 등 마이크로데이터와 시군구 단위로 결합할 수 있다.
- e-나라지표는 상업적 이용 제한이 명시돼 있어 블로그·상업 서비스용 결합 분석에는 KOSIS 원표를 우선 쓰는 편이 안전하다.

### Gaps
- KOSIS의 공식 일일 호출 한도 수치는 1차 문서에서 확인하지 못했다(2차 문서의 "분당 1,000건, 40,000셀"만 확보).
- ECOS 개인키의 일 호출 한도·1회 최대 행 수는 미확인(ERROR-602 존재만 확인).
- SGIS(통계지리정보서비스) 개발자 가이드(accessToken, 행정동↔법정동 변환 API, 호출 한도, 인구통계 기준연도)는 검색·접근 모두 실패해 아무것도 확인하지 못했다. 훈련 지식상 consumer_key/secret으로 accessToken(유효 4시간)을 받는 구조이나 **출처 미확보로 검증 필요**.
- 국세통계포털(TASIS) OpenAPI, 고용행정통계(eis.work24) OpenAPI의 존재 여부·신청 방법·시차는 검색 결과에 전혀 나오지 않았다.
- 관세청 월별 잠정치(10일 단위 잠정치)의 정확한 최초 공개일은 확인하지 못했다(15일경 현행화만 확인).

---

## KQ3. 지자체 API(서울 열린데이터광장, 경기데이터드림, 부산 등) 중 정기 갱신되는 것

### Takeaway
서울 열린데이터광장은 지하철 월별 승하차(매월 5일 전월 갱신), 따릉이 실시간(bikeList), 실시간 도시데이터(5분 갱신, 15분 지연) 등 명확한 주기의 데이터가 있으나 생활인구는 "현행화 중지 및 개편" 공지가 떠 있고, 경기데이터드림은 호출 횟수 무제한·1회 1,000건이 공식 확인된다.

### Cited Findings
- 서울 지하철 호선별 역별 시간대별 승하차 인원: 매월 5일 전월 데이터로 갱신(갱신주기 "매월 5일"), Sheet는 최대 1,000건 노출, 전체는 CSV 다운로드 안내 — [서울 OA-12252](https://data.seoul.go.kr/dataList/OA-12252/S/1/datasetView.do)
- PublicDataReader의 서울 교통 모듈: 지하철승하차(호선별 역별), 버스승하차(노선별 정류장별)를 일자(예 20211001) 단위로 조회 — [Transportation.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/seoul/Transportation.md)
- 서울시 생활인구·생활이동(집계구) 데이터 "서비스 현행화 중지 및 개편 안내" 공지 존재; [내국인] 행정동별 서울 생활인구(250m) 등 데이터셋 목록은 존재 — [서울 열린데이터광장 공지](https://data.seoul.go.kr/dataList/10288/S/2/datasetView.do); [data.seoul.go.kr](https://data.seoul.go.kr/)
- 따릉이: bikeList(실시간 대여정보), tbCycleStationInfo(대여소 마스터); 응답에 rackTotCnt, parkingBikeTotCnt; startIndex/endIndex 범위 지정 — [k-skill seoul-bike](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/seoul-bike.md)
- 서울 실시간 도시데이터(citydata_ppltn): 121개 핫스팟, 5분 갱신, 호출 시점 기준 약 15분 전 값, 통신 신호 기반 추계치, 01~05시 미제공 가능, 일일 호출 할당량 초과 시 익일 재시도 — [k-skill seoul-density](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/seoul-density.md)
- 서울 에어코리아 연계 데이터: 매시 5분 제공, 최근 1개월치만 Sheet/OpenAPI 제공 — [서울 OA-23044](https://data.seoul.go.kr/dataList/OA-23044/S/1/datasetView.do)
- 서울 상권 공지: 상권업종분류 대10/중75/소247 — [서울 열린데이터광장 상권분석](https://data.seoul.go.kr/bsp/wgs/dataView/data300View/10011.do)
- 서울시 일자리포털 데이터셋은 "갱신주기 매일 1회" 표기(고용24와 별개) — [서울 OA-23047](https://data.seoul.go.kr/dataList/OA-23047/S/1/datasetView.do)
- 경기데이터드림(경기데이터플랫폼) OpenAPI: "OpenAPI 요청 횟수에 제한을 두고 있지 않다", pSize 1회 최대 1,000건(pIndex로 분할), 인증키 없으면 sample로 5건만, 로그인 후 활용용도·URL 입력 시 자동 발급 — [data.gg.go.kr 이용안내](https://data.gg.go.kr/portal/openapi/usagePage.do)
- 열린데이터광장 일부 2차 자료: 전체 서비스 중 OpenAPI 제공 비중 34%(비공식) — [glama MCP 소개](https://glama.ai/mcp/servers/lfjodn5y96)

### Inferences
- 서울 지하철 월별 승하차(역명·호선)와 상가정보(좌표)·생활인구(행정동)를 결합하려면 "역↔행정동/좌표" 매핑 테이블을 별도로 만들어야 하며, 역ID 체계가 데이터셋마다 달라 역명 정규화가 필요하다.
- 생활인구는 개편 중이므로 과거 파일은 미리 내려받아 보관하고, 개편 후 스키마(집계구/행정동/250m 격자)가 바뀔 가능성에 대비해야 한다.

### Gaps
- 서울 열린데이터광장 OpenAPI의 1회 최대 1,000건·일 호출 한도는 공식 이용안내 페이지를 열지 못해 확인하지 못했다(Sheet 1,000건 노출만 확인).
- 따릉이 대여이력(월별 CSV) 제공 방식·갱신 시점, 우리마을가게 상권분석서비스 API의 분기 갱신 여부는 검색 예산 소진으로 확인하지 못했다.
- 부산 빅데이터 혁신 플랫폼·부산 공공데이터 API의 정기 갱신 데이터와 한도는 검색 결과에 없었다.

---

## KQ4. 민간 공개 API(네이버·카카오·업비트·금융위·DART·KRX·Wikimedia·YouTube)의 한도와 키

### Takeaway
네이버 검색 API는 일 25,000회(카테고리 공유), 데이터랩은 일 1,000회(구 체계) 또는 API HUB 월 50,000건/API(신 체계, 종량제), DART는 약 20,000건/일 부근에서 020 오류, YouTube는 일 10,000 units(search.list 100)가 확인된다. 카카오·업비트·Wikimedia는 공식 수치 페이지를 열지 못해 2차 자료 수준이다.

### Cited Findings
- 네이버 검색 Open API(뉴스/블로그/쇼핑 등): 일 25,000회가 전 검색 카테고리 공유, display 1~100, start 최대 1000, sort sim/date; 429(오류 010)는 대기 후 재시도; 오류 024 인증 실패, SE05 권한 누락 — [k-skill naver-news-search](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/naver-news-search.md)
- 네이버 데이터랩 검색어트렌드: 애플리케이션당 일 1,000건(월 30,000건) 이내에서 조정 가능, 결과 데이터 저장·재사용 금지 조항 — [digitalmarketer 검색광고 API 가이드](https://www.digitalmarketer.co.kr/insights/naver-search-ad-api-data-for-non-developers); 블로그: 검색어트렌드·쇼핑인사이트 일 1,000회 — [digitalmarketer 데이터랩 가이드](https://www.digitalmarketer.co.kr/insights/naver-datalab-api-data-for-non-developers)
- NAVER API HUB(신규 체계): 발급 키 하나로 여러 API 연동, 사용량 기반 종량제; 검색어트렌드·쇼핑인사이트는 엔드포인트·파라미터가 다르고 월 호출 한도(각 50,000건)가 API별로 별도 산정; 2026-07-31 이전 키는 개발자센터, 이후 신규 키는 API HUB — [ncloud apihub overview](https://guide.ncloud-docs.com/docs/apihub-overview); [searchtrend-use](https://guide.ncloud-docs.com/docs/searchtrend-use); [openads](https://openads.co.kr/content/contentDetail?contsId=9746)
- 네이버 검색광고 API: searchad.naver.com 가입 → manage.searchad.naver.com 도구 > API 관리에서 라이선스·시크릿 발급, 심사 없음, 요청마다 HMAC-SHA256 서명; 오류 429 "Too many requests already exist", 1016 "Too many connections", 503 정기점검; 키워드 입력 오류 7001(포함 키워드 개수 초과), 7002(중복) — [naver/searchad-apidoc README](https://github.com/naver/searchad-apidoc); [오류코드 맵](https://github.com/naver/searchad-apidoc/blob/master/NaverSA_API_Error_Code_MAP.md); [digitalmarketer](https://www.digitalmarketer.co.kr/insights/naver-search-ad-api-data-for-non-developers)
- 카카오 로컬 API: 주소 검색(지번·도로명·좌표·우편번호·빌딩명 반환), coord2address, coord2region(법정동/행정동 변환), 키워드·카테고리 검색; REST API 키 인증; 월간·일간 쿼터 적용(수치는 앱 관리 페이지 [통계]>[쿼터]에서 확인, "일간 쿼터는 추후 변경될 수 있음"); 카카오맵 API는 첫 활성화 앱에만 무료 쿼터, 2026-07-21부터 사용 방법·무료 쿼터 제공 방식 변경; 소진 시 429 — [kakao local common](https://developers.kakao.com/docs/latest/ko/local/common); [kakao quota](https://developers.kakao.com/docs/latest/ko/getting-started/quota); [k-skill kakao-map(모빌리티 일 ~1,000건)](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/kakao-map.md); 좌표 저장 가능 여부 문의 스레드 — [devtalk](https://devtalk.kakao.com/t/api/151497)
- 업비트: 캔들 API 호출당 최대 200개(count≤200, to 파라미터로 과거 이어받기), 초(Second)·연(Year) 캔들 추가; 요청 수 제한은 2차 문서 기준 시세 API 분당 600회·초당 10회, Remaining-Req 헤더 — [docs.upbit 캔들 CSV 튜토리얼](https://docs.upbit.com/kr/docs/how-to-download-candle-data); [분 캔들 레퍼런스](https://docs.upbit.com/kr/v1.5.9/reference/분minute-캔들-1); [changelog](https://docs.upbit.com/kr/changelog/year_sec_candles); [upbit-client-docs(2차)](https://ujhin.github.io/upbit-client-docs)
- DART OpenAPI: corp_code는 종목코드(6자리)와 별개인 8자리 고유번호, corpCode.xml ZIP(약 30MB, 상장+비상장 전체); list.json은 corp_code 없이 bgn_de~end_de 3개월 이내 제한; fnlttSinglAcntAll.json(bsns_year, reprt_code, fs_div CFS/OFS); 오류 020(요청 제한 초과)은 "일반적으로 20,000건 이상 요청" 시 발생, 키별 한도 상이, 사용량은 오픈API 이용현황 페이지 — [k-skill k-dart](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/k-dart.md); [wikidocs OpenDART](https://wikidocs.net/336171); [thenextgennexus 가이드](https://thenextgennexus.com/ko/guides/dart-api/)
- KRX: 공식 Open API(openapi.krx.co.kr) 회원가입 → 마이페이지 인증키 신청(승인 약 1일) → 서비스이용>주식에서 API 이용신청; 대상 6종(유가증권·코스닥·코넥스 일별매매정보, 종목기본정보) — [korea-stock-mcp README](https://github.com/jjlabsio/korea-stock-mcp); [k-skill korean-stock-search](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/korean-stock-search.md)
- KRX 비공식(pykrx): KRX 정보데이터시스템·네이버 스크래핑, 일부 API는 KRX 로그인(KRX_ID/PW) 필요, 공매도는 T+2 이후만, 당일 최종 매매내역은 18시 이후, 휴일은 빈 결과, 요청 간 1초 지연 권고 — [pykrx README](https://github.com/sharebook-kr/pykrx)
- 금융위원회 기업기본정보: 검색 키 crno(법인등록번호 13자리)·corpNm, 응답에 bzno — [k-skill fsc-corporate-info](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/fsc-corporate-info.md); 금융위 공공데이터 개발/운영계정 10,000/100,000건 — [fsc.go.kr FAQ](https://fsc.go.kr/in060501)
- Wikimedia Pageviews REST API: per-article 엔드포인트 `/metrics/pageviews/per-article/{project}/all-access/user/{article}/daily/...`, 요청당 1페이지; REST API 문서상 100 req/s 한도(IP 단위, 초과 시 일정 시간 스로틀), 2026-03 코멘트에서는 광고된 한도를 지켜도 429 발생 보고; 2016년 자료는 10 req/s; 연락처 포함 User-Agent 요구 — [Phabricator T219857](https://phabricator.wikimedia.org/T219857); [Phabricator T144865](https://phabricator.wikimedia.org/T144865); [gwern 스크립트 주석](https://www.gwern.net/wiki/User:Dsimic/Traffic_stats_calculation); [Nexla 커넥터 문서](https://docs.nexla.com/user-guides/connectors/wikipedia_pageviews_api)
- YouTube Data API v3: 신규 프로젝트 기본 할당 — search.list 100회, videos.insert 100회, 그 외 엔드포인트 합산 일 10,000 units; search.list 100 units, videos.list 1 unit(ID 50개 배치 가능) — [Getting started](https://developers.google.com/youtube/v3/getting-started); [Quota cost](https://developers.google.com/youtube/v3/determine_quota_cost); 2차: videos.insert가 2026-06-01에 1,600→1 unit으로 변경 주장(공식 미확인) — [activepieces](https://www.activepieces.com/blog/youtube-api-quota-exceeded-how-to-fix-and-avoid-it)

### Inferences
- 데이터랩 검색어트렌드는 "상대값(ratio)"이고 약관상 저장·재사용 금지 조항이 있으므로 DB 적재형 결합 분석에 쓰려면 약관 재확인이 필요하다(신 API HUB 약관은 미확인).
- 네이버 검색광고 키워드도구는 월간 검색수의 "직전 30일 스냅샷"만 주는 것으로 알려져 있어 매월 1회 적재해 이력을 만들어야 하나, 이번 조사에서는 명세를 열지 못해 Gap으로 남긴다.
- DART corpCode.xml(종목코드↔고유번호)과 금융위 기업기본정보(법인등록번호↔사업자번호)를 이으면 "종목코드→법인등록번호→사업자등록번호→국세청 상태" 체인이 가능하지만, corpCode.xml에 법인등록번호가 포함되는지는 확인하지 못했다(아래 Gap).

### Gaps
- 네이버 검색광고 키워드도구(RelKwdStat, /keywordstool) 응답 필드·호출 제한·과거 월 제공 여부는 명세 사이트(naver.github.io) 접근 차단으로 미확인.
- 카카오 로컬 API의 구체적 일/월 쿼터 수치는 공식 문서에 명시돼 있지 않고 앱 콘솔에서만 확인 가능(외주 페이지의 "월 10만 건"은 비공식).
- 업비트 공식 "요청 수 제한" 페이지는 접근 불가로 초당 10회/분당 600회는 2차 자료 수준.
- DART corpCode.xml의 modify_date 필드, 법인등록번호 포함 여부, 공식 일 한도 수치(20,000은 2차 자료) 미확인.
- 금융위 주식시세정보·KRX상장종목정보 API의 데이터셋 번호·응답 필드(srtnCd, isinCd 등)·갱신주기는 검색 예산 소진으로 확인하지 못했다.
- 금융데이터거래소(FinDATA)의 무료 데이터/오픈API 현황은 조사하지 못했다.
- Wikimedia 현재 공식 rate limit 페이지(Wikimedia_APIs/Rate_limits)는 접근 차단으로 미확인.

---

## KQ5. 코드 매핑 자원(법정동코드, 행정동↔법정동, 도로명주소 DB, PNU, KSIC, HS코드, 종목코드↔법인등록번호)과 행정동 개편 이력 관리

### Takeaway
법정동코드 전체자료는 행정표준코드관리시스템·공공데이터포털에서 받되 "말소 코드(사용여부)·생성일자"를 함께 보관해야 하고, 행정동↔법정동 매핑은 지자체 행정기관코드 파일 또는 커뮤니티 정리본(WooilJeong/code JSON)으로 확보 가능하며, PNU는 시군구5+법정동5+구분1+번4+지4로 조립한다. 종목코드↔고유번호는 DART corpCode.xml, 고유번호/법인명↔법인등록번호는 금융위 기업기본정보로 잇는다.

### Cited Findings
- 법정동코드 전체자료: 행정안전부 '행정표준코드관리시스템'과 공공데이터포털에서 최신 데이터 조회·다운로드 가능; 포털 자료 항목은 법정동코드, 주소명, 사용여부 — [data.go.kr 법정동코드 메타 15155315](https://www.data.go.kr/dcat/metadata/15155315); [15149334](https://www.data.go.kr/biz/dcat/metadata/15149334.do)
- 행정동↔법정동 매핑 예: 경기도 행정기관 코드 자료는 행정동코드, 시군구명, 읍면동명, 법정동코드를 포함("법정동과 행정동 간 코드 매핑은 행정데이터 통합 관리와 기관 간 자료 연계에 필수") — [data.go.kr 15156058](https://www.data.go.kr/dcat/metadata/15156058)
- 변경이력 예: 하남시 법정동코드 자료에 코드생성일자(변경이력)가 포함돼 1988~2019년 신설·조정 시점 추적 가능 — [data.go.kr 15153034](https://www.data.go.kr/biz/dcat/metadata/15153034.do)
- 국토교통부 법정동 속성 API(무료, 이용허락 제한 없음) 존재 — [data.go.kr 15124020](https://data.go.kr/data/15124020/openapi.do)
- PublicDataReader의 code_bdong()/code_hdong()/code_hdong_bdong()은 GitHub `WooilJeong/code` 저장소의 JSON(code_bdong.json, code_hdong.json, code_hdong_bdong.json)을 내려받아 DataFrame으로 변환 — [PublicDataReader utils/code.py](https://github.com/WooilJeong/PublicDataReader/blob/main/PublicDataReader/utils/code.py)
- PNU 19자리 = 시군구코드 5 + 법정동코드 5 + 토지구분 1(1 일반/2 산) + 번 4 + 지 4; 건축물대장 platGbCd(0/1)·대지구분코드(0 대지/1 산/2 블록)와 변환 규칙 — [k-skill building-register-search](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/building-register-search.md); [LandOwnership.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/LandOwnership.md)
- V-World 연속지적도(LP_PA_CBND_BUBUN)는 attrFilter `pnu:like:…`로 PNU 필지 조회, 시군구 경계는 `sig_cd:=:41135`(5자리) 조회 — [VworldData.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/vworld/VworldData.md)
- 카카오 coord2region API로 좌표→법정동/행정동 변환 가능 — [k-skill kakao-map](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/kakao-map.md); [kakao local](https://developers.kakao.com/docs/latest/ko/local/common)
- TourAPI 4.0에 법정동코드 조회(ldongCode2) 엔드포인트 — [TourAPI 라이브러리](https://github.com/JoMingyu/TourAPI)
- 상권업종분류↔KSIC 10차 연계표가 상가정보 파일에 포함되나 정제 때문에 차이 가능 — [data.go.kr 15083033](https://www.data.go.kr/catalog/15083033/fileData.json)
- 고용24 직업코드↔표준직업분류 매핑 파일 — [data.go.kr 15158873](https://www.data.go.kr/biz/dcat/metadata/15158873.do)
- DART corpCode.xml: 8자리 corp_code를 회사명 또는 종목코드로 찾는 용도, 약 30MB — [k-skill k-dart](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/k-dart.md); [wikidocs](https://wikidocs.net/336171)
- 금융위 기업기본정보: crno(법인등록번호 13자리)와 bzno(사업자등록번호) 동시 제공, "crno는 사업자등록번호와 별개" — [k-skill fsc-corporate-info](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/fsc-corporate-info.md)
- 국세청 진위확인은 corp_no(법인등록번호 13자리)를 선택 입력으로 받는다 — [k-skill nts-business-registration](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/nts-business-registration.md)
- KB부동산 지역코드는 10자리(법정동코드 체계와 동일한 자릿수: 서울 1100000000) — [Kbland.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/kbland/Kbland.md)
- 기상청 지점번호는 동일 번호라도 기간별 위치가 다를 수 있어 지점정보 서비스로 위경도 이력을 관리해야 한다 — [data.go.kr ASOS 시간자료 15057210](https://www.data.go.kr/data/15057210/openapi.do)

### Inferences
- 행정동 개편 이력 관리: (1) 매월 법정동코드 전체자료를 내려받아 "사용여부·생성일자" 컬럼을 포함한 SCD(Slowly Changing Dimension) 테이블로 적재하고, (2) 행정동↔법정동 매핑도 기준월 컬럼을 붙여 버전별로 보관하며, (3) 통계(KOSIS·주민등록)와 마이크로데이터(상가·실거래)를 결합할 때는 "해당 월의 매핑 버전"을 조인 키에 포함하는 방식이 필요하다. 말소된 법정동(사용여부=미사용)을 지우지 말고 유지해야 과거 실거래가의 법정동명이 매칭된다.
- 좌표가 있는 데이터(상가, 충전소, 병원, 관광지)는 카카오 coord2region 또는 V-World 경계 폴리곤과의 공간조인으로 법정동/행정동을 재부여하면 개편 영향을 덜 받는다.

### Gaps
- 행정표준코드관리시스템(code.go.kr)의 실제 다운로드 페이지·파일 포맷·월별 변경분 제공 방식은 직접 확인하지 못했다(검색 결과는 포털 메타데이터만).
- 도로명주소 DB(juso.go.kr 전체분·월변동분, 건물관리번호↔법정동코드), 주민등록 인구통계(jumin.mois.go.kr 행정동 월별 연령·성별), KSIC 10차 분류표(kssc.kostat.go.kr), HS코드 품목분류표(관세법령정보포털)는 **검색 예산 소진으로 조사하지 못했다**. 이는 후속 조사 1순위다.
- 통계청 SGIS의 행정동↔법정동 변환 API 및 행정구역 경계 연도별 제공 여부 미확인.
- WooilJeong/code JSON의 원 출처 기관·갱신 시점은 코드에 명시되지 않아(실행 시 출력되는 name 값으로 확인) 신뢰성 검증이 필요하다.

---

## 결합 키별 "같은 키를 공유하는 데이터 소스 묶음"

### Takeaway
가장 넓게 공유되는 키는 시군구코드 5자리(법정동코드 앞 5자리)와 좌표(WGS84)이며, 법정동코드 10자리·지번/PNU는 부동산 계열, 사업자/법인등록번호는 기업 계열, 날짜는 전 소스 공통이다. 아래 묶음은 위 KQ1~KQ5에서 인용한 소스를 키별로 재배열한 것이다.

### Cited Findings
- **시군구코드 5자리(법정동코드 앞 5자리)**: 실거래가 12종(LAWD_CD) — [TransactionPrice.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/TransactionPrice.md); 건축물대장 sigunguCd — [15134735](https://www.data.go.kr/data/15134735/openapi.do); 전기차충전소 zscode — [k-skill ev](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/ev-charger-nearby.md); 구조동물 시군구코드 API — [15098931](https://www.data.go.kr/data/15098931/openapi.do); 건보 검진기관 siGunGuCd — [k-skill nhis](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/nhis-care-checkup-search.md); V-World sig_cd — [VworldData.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/vworld/VworldData.md); 상가정보 signguCd/행정구역상권 — [SmallShop.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/SmallShop.md); 관세청 시군구 통계(2026-09부터 HSK10 비공개) — [스마트투데이](https://www.smarttoday.co.kr/ko-kr/articles/111033); KB부동산 10자리 지역코드(시군구 단위) — [Kbland.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/kbland/Kbland.md); 온비드 시도·시군구·읍면동 코드 — [Kamco.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/Kamco.md)
- **법정동코드 10자리 / 법정동명**: 실거래가(법정동명+법정동코드 일체, 아파트 매매) — [TransactionPrice.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/TransactionPrice.md); 건축물대장 bjdongCd·새주소법정동코드 — [BuildingLedger.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/BuildingLedger.md); 토지임야·토지소유 ldCode — [LandForestLedger.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/LandForestLedger.md); 국민연금 사업장 법정동주소코드 — [k-skill nps](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/national-pension-workplace.md); TourAPI ldongCode2 — [TourAPI](https://github.com/JoMingyu/TourAPI); 카카오 coord2region(b_code) — [kakao local](https://developers.kakao.com/docs/latest/ko/local/common); 법정동코드 마스터 — [data.go.kr 15155315](https://www.data.go.kr/dcat/metadata/15155315)
- **행정동코드**: 상가정보 adongCd(행정동상가) — [SmallShop.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/SmallShop.md); 서울 생활인구(행정동별) — [data.seoul.go.kr](https://data.seoul.go.kr/); 행정기관코드(행정동↔법정동) — [data.go.kr 15156058](https://www.data.go.kr/dcat/metadata/15156058); 카카오 coord2region(h_code) — [k-skill kakao-map](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/kakao-map.md)
- **PNU / 지번(번·지)**: 실거래가 지번 — [TransactionPrice.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/TransactionPrice.md); 건축물대장 번·지·platGbCd — [k-skill building](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/building-register-search.md); 토지임야·토지소유 pnu — [15057917](https://www.data.go.kr/data/15057917/openapi.do), [15058047](https://www.data.go.kr/data/15058047/openapi.do); V-World 연속지적도 pnu — [VworldData.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/vworld/VworldData.md); 상가정보 지번코드/지번상가 — [SmallShop.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/SmallShop.md); 온비드 지번주소 LDNM_ADRS — [Kamco.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/Kamco.md)
- **도로명주소 / 도로명코드 / 건물관리번호**: 아파트 매매 실거래가(도로명코드·건물본번/부번코드) — [TransactionPrice.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/TransactionPrice.md); 건축물대장 도로명대지위치·새주소도로코드 — [BuildingLedger.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/BuildingLedger.md); 상가정보 건물관리번호(건물상가 조회 키) — [SmallShop.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/SmallShop.md); LOCALDATA 도로명주소 — [k-skill localdata](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/localdata-business-status.md); 온비드 NMRD_ADRS — [Kamco.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/Kamco.md); 카카오 주소검색(도로명·지번·우편번호·좌표) — [kakao local](https://developers.kakao.com/docs/latest/ko/local/common)
- **좌표(WGS84 경위도; 오피넷은 KATEC, 에어코리아는 TM)**: 상가정보 경도/위도 — [k-skill store](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/store-longevity-radar.md); 전기차충전소 lat/lng — [k-skill ev](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/ev-charger-nearby.md); TourAPI mapx/mapy — [TourAPI](https://github.com/JoMingyu/TourAPI); 따릉이 대여소 — [k-skill seoul-bike](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/seoul-bike.md); 오피넷 KATEC — [k-skill gas](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/cheap-gas-nearby.md); 에어코리아 TM 근접측정소 — [15073877](https://www.data.go.kr/biz/dcat/metadata/15073877.do); 기상청 격자 nx/ny(5km)·ASOS 지점 위경도 — [k-skill weather](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/korea-weather.md), [15057210](https://www.data.go.kr/data/15057210/openapi.do); 카카오 로컬(좌표 변환 허브) — [kakao local](https://developers.kakao.com/docs/latest/ko/local/common)
- **사업자등록번호(10자리)**: 국세청 상태조회(완전) — [15081808](https://www.data.go.kr/data/15081808/openapi.do); 국민연금 사업장(앞 6자리만) — [k-skill nps](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/national-pension-workplace.md); 금융위 기업기본정보 bzno — [k-skill fsc](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/fsc-corporate-info.md); 상가정보·LOCALDATA는 **미보유** — [k-skill store](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/store-longevity-radar.md), [k-skill localdata](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/localdata-business-status.md)
- **법인등록번호(13자리)**: 금융위 기업기본정보 crno — [k-skill fsc](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/fsc-corporate-info.md); 국세청 진위확인 corp_no(입력) — [k-skill nts](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/nts-business-registration.md)
- **종목코드(6자리) / DART 고유번호(8자리) / KRX 표준코드**: DART corpCode.xml(종목코드↔corp_code) — [k-skill k-dart](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/k-dart.md); KRX Open API 종목기본정보·일별매매정보(단축코드·표준코드) — [korea-stock-mcp](https://github.com/jjlabsio/korea-stock-mcp), [k-skill krx](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/korean-stock-search.md); pykrx 티커 — [pykrx](https://github.com/sharebook-kr/pykrx)
- **ISBN13**: 도서관 정보나루(ISBN13, libCode, 지역코드) — [k-skill library](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/library-book-search.md)
- **HS코드**: 관세청 수출입 통계(HS 2/4/6/10) — [15101607](https://www.data.go.kr/data/15101607/openapi.do); K-stat — [stat.kita.net](https://stat.kita.net/stat/guide/guide_19.screen)
- **KSIC 표준산업분류**: 상가정보 상권업종분류↔KSIC10 연계표 — [15083033](https://www.data.go.kr/catalog/15083033/fileData.json); 직업분류 매핑(고용24) — [15158873](https://www.data.go.kr/biz/dcat/metadata/15158873.do)
- **콘텐츠/객체 ID(소스 고유 키)**: KOBIS movieCd — [wikidocs](https://wikidocs.net/48297); KOPIS mt20id/mt10id — [k-skill kopis](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/kopis-performance-search.md); TourAPI contentid — [TourAPI](https://github.com/JoMingyu/TourAPI); 나라장터 bidNtceNo — [Nara MCP](https://glama.ai/mcp/servers/@Datajang/mcp-narajangteo/blob/55133d2ce4f3687c60640271eac660bc31a43109/README.md); 온비드 CLTR_MNMT_NO/PLNM_NO/PBCT_NO — [Kamco.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/Kamco.md); 열린국회 BILL_ID — [k-skill assembly](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/assembly-bill-vote-search.md); 법령 ID/MST — [k-skill law](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/korean-law-search.md); 학교코드 SD_SCHUL_CODE — [neis-api](https://github.com/my-school-info/neis-api); 기상 지점번호 stnIds — [15059093](https://www.data.go.kr/en/data/15059093/openapi.do)
- **날짜/시각(전 소스 공통, 특히 일 단위)**: KOBIS targetDt, KAMIS 조사일, 오피넷 일별, 에어코리아 dataTime(매시), 서울 citydata PPLTN_TIME(5분), 업비트 캔들(to), Wikimedia daily, 기상청 base_date/base_time, 실거래가 계약년월일·등기일자, 공휴일 locdate — 출처는 각 KQ 표 참조; 공휴일 캘린더 — [k-skill holiday](https://raw.githubusercontent.com/NomaDamas/k-skill/main/docs/features/korean-holiday-calendar.md)
- **연령대·성별**: 네이버 데이터랩 검색어트렌드(device, gender, ages 파라미터) — [digitalmarketer](https://www.digitalmarketer.co.kr/insights/naver-datalab-api-data-for-non-developers); 서울 생활인구(내국인 연령·성별) — [data.seoul.go.kr](https://data.seoul.go.kr/); R-ONE 연령대별 부동산거래 — [Reb.md](https://github.com/WooilJeong/PublicDataReader/blob/main/assets/docs/portal/Reb.md); 국민연금 연령별 가입종별 평균소득(연간 파일) — [data.go.kr 15094029](https://www.data.go.kr/data/15094029/fileData.do)

### Inferences
- 결합 허브 역할을 할 수 있는 소스는 세 가지다: (a) 법정동코드 마스터+행정동 매핑(지역 축), (b) 카카오 로컬/V-World(좌표↔주소↔코드 변환), (c) DART corpCode+금융위 기업기본정보+국세청(기업 식별자 축). 이 셋을 먼저 적재하면 나머지 소스는 대부분 한 홉으로 붙는다.
- "같은 키를 공유"해도 코드 버전(법정동 개편, 상권업종분류 개편, 기상 지점 이동)이 다르면 조인이 어긋나므로, 각 소스의 적재 시점과 코드 버전을 함께 저장하는 것이 결합 분석의 전제다.

### Gaps
- 주민등록 인구통계(행정동·연령·성별 월별), 도로명주소 DB, KSIC·HS 분류표 원본, SGIS 경계 데이터는 조사하지 못해 묶음에서 빠졌다(후속 조사 필요).
- 심평원 요양기호가 암호화되어 있어 건보공단 검진기관(hmcNo)과의 기관 단위 결합 가능 여부는 미확인.
