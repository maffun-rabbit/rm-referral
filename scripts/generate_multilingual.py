import os
import re

BASE_DIR = "/Users/masayuki/Library/CloudStorage/GoogleDrive-maffun@gmail.com/マイドライブ/AI自動整理メモ/10_Projects/RMリファラル/cloudflare-site"

LANGUAGES = {
    "en": {
        "lang_code": "en",
        "og_locale": "en_US",
        "flag": "🇺🇸 English",
        "site_name": "Rakuten Mobile Switching Guide",
        "title_home": "Rakuten Mobile Switching Guide | Check MNP Steps by Carrier, Region & Store",
        "desc_home": "Guide for switching from au, docomo, SoftBank, UQ mobile, Y!mobile, and Aeon Mobile to Rakuten Mobile by region and store.",
        "nav_area": "Search by Prefecture",
        "nav_guide": "Switching Steps",
        "nav_program": "Replacement Program",
        "nav_campaign": "Referral Campaign",
        "hero_eyebrow": "RAKUTEN MOBILE SWITCHING GUIDE",
        "hero_h1": "Switch from your current carrier<br><span>to Rakuten Mobile.</span>",
        "hero_msg": "Region & Store Guide for a Hassle-Free Switch.",
        "hero_lead": "Check MNP preparation and steps to keep your phone number from au, docomo, SoftBank, UQ mobile, Y!mobile, or Aeon Mobile based on your local store.",
        "btn_find_pref": "Search by Prefecture ↓",
        "btn_campaign": "Check Referral Campaign →",
        "start_pill": "Check First",
        "start_h2": "3 Key Points Before Switching",
        "start_1": "Confirm current contract & owner name",
        "start_2": "Check phone, email & remaining device balance",
        "start_3": "Check referral conditions before applying",
        "prog_label": "DEVICE REPLACEMENT PROGRAM",
        "prog_h2": "How to waive up to 24 monthly phone payments.",
        "prog_p": "48 installments, returning the device at month 25. Clear guide to the 'Rakuten Mobile Super Savings Replacement Program'.",
        "prog_btn": "Read Easy Guide →",
        "area_label": "AREA & SHOP GUIDE",
        "area_h2": "Find by Prefecture",
        "area_p": "Select a prefecture or jump to your regional store guide.",
        "pref_label": "Select Prefecture",
        "pref_default": "Please select a prefecture",
        "pref_note": "Selecting a prefecture will navigate to its store list.",
        "region_shortcuts": "Select Region",
        "region_hokkaido_tohoku": "Hokkaido & Tohoku",
        "region_kanto": "Kanto",
        "region_hokuriku": "Hokuriku & Koshinetsu",
        "region_tokai": "Tokai",
        "region_kinki": "Kinki (Kansai)",
        "region_chugoku": "Chugoku",
        "region_shikoku": "Shikoku",
        "region_kyushu": "Kyushu & Okinawa",
        "essential_label": "BEFORE SWITCHING",
        "essential_h2": "Things to Know Before Switching",
        "essential_p": "Check these 3 key points before starting your application.",
        "essential_1_h3": "MNP One-Stop",
        "essential_1_p": "When switching online from eligible carriers, you may skip getting an MNP reservation number.",
        "essential_1_btn": "Check Official Rakuten Mobile ↗",
        "essential_2_h3": "What to Prepare",
        "essential_2_p": "Check ID document, Rakuten ID, payment info, current phone number, and contract name.",
        "essential_3_h3": "Impact on Current Contract",
        "essential_3_p": "Check remaining device installments, carrier email, family discounts, and internet bundle discounts.",
        "camp_label": "REFERRAL CAMPAIGN",
        "camp_h2": "Flow for Using the Referral Campaign",
        "camp_p": "Conditions may change, so check order of application and latest rules.",
        "camp_step_1_h3": "Open Referral Link",
        "camp_step_1_p": "Proceed to campaign page before applying.",
        "camp_step_2_h3": "Log in with Rakuten ID",
        "camp_step_2_p": "Check eligibility and deadline then log in.",
        "camp_step_3_h3": "Apply for Plan",
        "camp_step_3_p": "Select MNP number transfer when applying.",
        "camp_step_4_h3": "Activation & Completion",
        "camp_step_4_p": "Activate within deadline and complete requirements.",
        "camp_btn": "Check Latest Campaign Conditions →",
        "camp_sub": "You will be redirected to Rakuten Mobile campaign page",
        "trust_label": "ABOUT THIS SITE",
        "trust_h2": "Organizing tricky points step-by-step.",
        "trust_p": "Requirements vary depending on carrier and application method. This site organizes key points by store and region.",
        "trust_1": "Links to official store pages",
        "trust_2": "Guides to official site for store hours",
        "trust_3": "Guides for final campaign condition checks",
        "trust_4": "Independently operated, un-affiliated with carriers",
        "faq_label": "FAQ",
        "faq_h2": "Frequently Asked Questions",
        "faq_1_q": "Can I switch without visiting a store?",
        "faq_1_a": "Yes, you can apply and activate completely online. In-person support is also available at Rakuten Mobile Shops.",
        "faq_2_q": "Do I need an MNP reservation number?",
        "faq_2_a": "For online MNP One-Stop applications, reservation numbers may not be needed.",
        "faq_3_q": "Can I keep my current phone number?",
        "faq_3_a": "Yes, select MNP transfer when applying to keep your current number.",
        "faq_4_q": "What happens to my remaining device balance?",
        "faq_4_a": "Remaining installments may continue with your old carrier even after switching.",
        "faq_5_q": "When should I click the referral link?",
        "faq_5_a": "Open the referral link and log in with your Rakuten ID before starting your application.",
        "final_eyebrow": "READY WHEN YOU ARE",
        "final_h2": "Start by searching from your area and store.",
        "final_p": "Select your store to check preparation and steps.",
        "final_btn": "Choose Area ↑",
        "updated": "Information checked date: 2026-08-19",
        "footer_disclaimer_1": "This site is independently operated and is not an official site of any carrier or store.",
        "footer_disclaimer_2": "Contains referral links. Please verify latest conditions on official sites at time of application.",
        
        # Tokyo Specific
        "tokyo_title": "How to Switch to Rakuten Mobile from Mobile Shops in Tokyo | Store Guide",
        "tokyo_desc": "Tokyo au, docomo, SoftBank, UQ mobile, Y!mobile, and Aeon Mobile stores listed by region. Check MNP preparation for each store.",
        "tokyo_breadcrumb": "Tokyo",
        "tokyo_hero_eyebrow": "TOKYO SHOP GUIDE",
        "tokyo_hero_h1": "Before switching to Rakuten Mobile<br><span>from Tokyo carrier shops</span>",
        "tokyo_hero_lead": "Preparation guide for au, docomo, SoftBank, UQ mobile, Y!mobile, and Aeon Mobile users in Tokyo. Choose your current store below.",
        "tokyo_count": "Listed Stores",
        "tokyo_coverage_link": "Check Rakuten Mobile signal status by municipality in Tokyo ↗",
        "tokyo_finder_label": "SHOP FINDER",
        "tokyo_finder_h2": "Filter Stores",
        "tokyo_search_placeholder": "e.g. Shinjuku, Shibuya, Store Name",
        "tokyo_filter_all": "All",
        "tokyo_stores_suffix": "Stores"
    },
    "zh": {
        "lang_code": "zh",
        "og_locale": "zh_CN",
        "flag": "🇨🇳 中文",
        "site_name": "乐天移动换网指南",
        "title_home": "乐天移动换网指南 | 按运营商、地区和门店确认MNP转网步骤",
        "desc_home": "按地区和门店为您指引从au、docomo、SoftBank、UQ mobile、Y!mobile、永旺移动转网至乐天移动的准备与手续。",
        "nav_area": "按都道府县查找",
        "nav_guide": "转网步骤",
        "nav_program": "换新超值计划",
        "nav_campaign": "推荐活动",
        "hero_eyebrow": "RAKUTEN MOBILE SWITCHING GUIDE",
        "hero_h1": "从现有的运营商<br><span>转网至乐天移动。</span>",
        "hero_msg": "按地区与门店指引，顺畅无忧地完成转网。",
        "hero_lead": "帮助您了解如何保留原有电话号码，从au、docomo、SoftBank、UQ mobile、Y!mobile、永旺移动转网至乐天移动。",
        "btn_find_pref": "按都道府县查找 ↓",
        "btn_campaign": "查看推荐优惠活动 →",
        "start_pill": "首先确认",
        "start_h2": "转网前的3大要点",
        "start_1": "确认当前合同内容与户名",
        "start_2": "确认手机、邮箱及设备尾款",
        "start_3": "申请前确认推荐优惠条件",
        "prog_label": "DEVICE REPLACEMENT PROGRAM",
        "prog_h2": "最多免除24期手机分期付款的机制。",
        "prog_p": "48期分期、第25个月归还手机。通俗易懂地为您整理“乐天移动超值换新计划”的注意事项。",
        "prog_btn": "阅读详细讲解 →",
        "area_label": "AREA & SHOP GUIDE",
        "area_h2": "按都道府县查找",
        "area_p": "选择都道府县或从地区列表中查看附近门店指南。",
        "pref_label": "选择都道府县",
        "pref_default": "请选择都道府县",
        "pref_note": "选择后将跳转至该地区的门店列表。",
        "region_shortcuts": "选择地区",
        "region_hokkaido_tohoku": "北海道・东北",
        "region_kanto": "关东",
        "region_hokuriku": "北陆・甲信越",
        "region_tokai": "东海",
        "region_kinki": "近畿（关西）",
        "region_chugoku": "中国",
        "region_shikoku": "四国",
        "region_kyushu": "九州・冲绳",
        "essential_label": "BEFORE SWITCHING",
        "essential_h2": "转网前需了解的事项",
        "essential_p": "开始申请前，建议先确认以下3点。",
        "essential_1_h3": "MNP一站式转网",
        "essential_1_p": "在支持的运营商进行在线转网时，无需提前获取MNP预约码。",
        "essential_1_btn": "前往乐天移动官网确认 ↗",
        "essential_2_h3": "所需准备材料",
        "essential_2_p": "确认身份证明文件、乐天ID、支付信息、当前电话号码及合同户名。",
        "essential_3_h3": "对现有合同的影响",
        "essential_3_p": "确认设备分期余额、运营商邮箱、亲友优惠及宽带绑定优惠的影响。",
        "camp_label": "REFERRAL CAMPAIGN",
        "camp_h2": "使用推荐优惠活动的流程",
        "camp_p": "优惠内容可能发生变更，请务必确认申请顺序与最新条件。",
        "camp_step_1_h3": "打开推荐链接",
        "camp_step_1_p": "在申请前进入活动页面。",
        "camp_step_2_h3": "登录乐天ID",
        "camp_step_2_p": "确认符合条件及截止日期后登录。",
        "camp_step_3_h3": "申请套餐",
        "camp_step_3_p": "选择MNP号码携转。",
        "camp_step_4_h3": "开通与达成条件",
        "camp_step_4_p": "在期限内开通并完成所需的使用条件。",
        "camp_btn": "查看最新活动条件 →",
        "camp_sub": "将跳转至乐天移动活动页面",
        "trust_label": "ABOUT THIS SITE",
        "trust_h2": "理清繁琐步骤，按顺序指引的指南网站。",
        "trust_p": "根据您目前的运营商和申请方式，所需确认事项有所不同。本网站以地区和门店为入口，整理申请前需确认的内容。",
        "trust_1": "链接至各门店官方页面",
        "trust_2": "营业时间引导至官网确认",
        "trust_3": "引导确认最终活动条件",
        "trust_4": "个人独立运营，与各通信公司无关",
        "faq_label": "FAQ",
        "faq_h2": "常见问题",
        "faq_1_q": "不去门店也能办理转网吗？",
        "faq_1_a": "是的，可以在线完成从申请到开通的全过程。如果希望面对面咨询，也可以选择去乐天移动门店。",
        "faq_2_q": "必须要有MNP预约码吗？",
        "faq_2_a": "如果使用支持MNP一站式服务的运营商在网上申请，可能不需要预约码。",
        "faq_3_q": "能保留现在的电话号码吗？",
        "faq_3_a": "只要选择从其他公司转网（MNP）并完成手续，即可保留原有号码。",
        "faq_4_q": "手机未还清的分期款项怎么办？",
        "faq_4_a": "即使更换了通信公司，原有的手机分期付款仍可能需要继续向原公司缴纳。",
        "faq_5_q": "什么时候打开推荐链接？",
        "faq_5_a": "请在申请乐天移动之前打开推荐链接，并登录乐天ID确认最新条件。",
        "final_eyebrow": "READY WHEN YOU ARE",
        "final_h2": "首先，从地区和门店开始查找吧。",
        "final_p": "选择您正在使用的门店，确认转网前需准备的事项与步骤。",
        "final_btn": "选择地区 ↑",
        "updated": "信息确认日期：2026-08-19",
        "footer_disclaimer_1": "本网站由个人运营，非各通信公司及展示门店的官方网站。",
        "footer_disclaimer_2": "本网站包含推荐链接。优惠条件与门店信息请以办理时的官网为准。",
        
        # Tokyo Specific
        "tokyo_title": "在东京手机门店办理转网至乐天移动的方法 | 门店指南",
        "tokyo_desc": "按地区汇总东京都内的au、docomo、SoftBank、UQ mobile、Y!mobile、永旺移动门店。按门店确认转网准备与MNP手续。",
        "tokyo_breadcrumb": "东京",
        "tokyo_hero_eyebrow": "TOKYO SHOP GUIDE",
        "tokyo_hero_h1": "在东京都的运营商门店<br><span>办理转网至乐天移动前</span>",
        "tokyo_hero_lead": "面向使用au、docomo、SoftBank、UQ mobile、Y!mobile、永旺移动的用户，整理了去门店前需要确认的转网准备。",
        "tokyo_count": "收录门店",
        "tokyo_coverage_link": "按市区町村确认东京都的乐天移动信号覆盖情况 ↗",
        "tokyo_finder_label": "SHOP FINDER",
        "tokyo_finder_h2": "筛选门店",
        "tokyo_search_placeholder": "例：新宿、涩谷、门店名称",
        "tokyo_filter_all": "全部",
        "tokyo_stores_suffix": "家门店"
    },
    "ko": {
        "lang_code": "ko",
        "og_locale": "ko_KR",
        "flag": "🇰🇷 한국어",
        "site_name": "라쿠텐 모바일 번호이동 가이드",
        "title_home": "라쿠텐 모바일 번호이동 가이드 | 통신사·지역·매장별 MNP 절차 안내",
        "desc_home": "au, docomo, SoftBank, UQ mobile, Y!mobile, 이온 모바일에서 라쿠텐 모바일로의 번호이동 준비 및 절차를 지역 및 매장별로 안내합니다.",
        "nav_area": "지역(도도부현)으로 찾기",
        "nav_guide": "번호이동 절차",
        "nav_program": "기기 변경 혜택",
        "nav_campaign": "추천 캠페인",
        "hero_eyebrow": "RAKUTEN MOBILE SWITCHING GUIDE",
        "hero_h1": "현재 이용 중인 통신사에서<br><span>라쿠텐 모바일로.</span>",
        "hero_msg": "지역 및 매장별 가이드로 헤매지 않고 번호이동.",
        "hero_lead": "au, docomo, SoftBank, UQ mobile, Y!mobile, 이온 모바일에서 쓰던 번호 그대로 이동하기 위한 사전 준비 및 절차를 매장별로 확인하세요.",
        "btn_find_pref": "지역(도도부현)으로 찾기 ↓",
        "btn_campaign": "추천 캠페인 혜택 확인 →",
        "start_pill": "먼저 확인",
        "start_h2": "번호이동 전 3가지 체크포인트",
        "start_1": "현재 계약 내용 및 명의 확인",
        "start_2": "단말기, 이메일, 잔여 할부금 확인",
        "start_3": "신청 전 추천 조건 및 혜택 확인",
        "prog_label": "DEVICE REPLACEMENT PROGRAM",
        "prog_h2": "스마트폰 비용 최대 24회분 면제 혜택.",
        "prog_p": "48개월 할부, 25개월 차 단말기 반납. 조금 복잡해 보이는 '라쿠텐 모바일 기기 변경 프로그램'을 주의사항과 함께 알기 쉽게 정리했습니다.",
        "prog_btn": "가이드 읽기 →",
        "area_label": "AREA & SHOP GUIDE",
        "area_h2": "지역(도도부현)으로 찾기",
        "area_p": "지역을 선택하거나 목록에서 가까운 매장 가이드로 이동하세요.",
        "pref_label": "지역 선택",
        "pref_default": "지역(도도부현)을 선택해 주세요",
        "pref_note": "선택하시면 해당 지역의 매장 목록으로 이동합니다.",
        "region_shortcuts": "권역 선택",
        "region_hokkaido_tohoku": "홋카이도·토호쿠",
        "region_kanto": "간토",
        "region_hokuriku": "호쿠리쿠·코신에츠",
        "region_tokai": "토카이",
        "region_kinki": "킨키(간사이)",
        "region_chugoku": "추고쿠",
        "region_shikoku": "시코쿠",
        "region_kyushu": "큐슈·오키나와",
        "essential_label": "BEFORE SWITCHING",
        "essential_h2": "번호이동 전 알아두어야 할 사항",
        "essential_p": "신청하기 전에 아래 3가지를 미리 확인해 두시면 안심할 수 있습니다.",
        "essential_1_h3": "MNP 원스톱 신청",
        "essential_1_p": "지원 대상 통신사에서 온라인으로 신청할 경우, MNP 예약번호 발급 없이 진행할 수 있습니다.",
        "essential_1_btn": "라쿠텐 모바일 공식 확인 ↗",
        "essential_2_h3": "사전 준비물",
        "essential_2_p": "신분증, 라쿠텐 ID, 결제 정보, 현재 전화번호 및 계약 명의를 확인하세요.",
        "essential_3_h3": "기존 계약 영향",
        "essential_3_p": "단말기 잔여 할부금, 통신사 이메일, 가족 할인, 인터넷 결합 할인에 대한 영향을 확인하세요.",
        "camp_label": "REFERRAL CAMPAIGN",
        "camp_h2": "추천 캠페인 참여 절차",
        "camp_p": "혜택 내용은 변경될 수 있으므로 신청 순서와 최신 조건을 확인하는 것이 중요합니다.",
        "camp_step_1_h3": "추천 링크 접속",
        "camp_step_1_p": "신청 전에 캠페인 페이지로 이동합니다.",
        "camp_step_2_h3": "라쿠텐 ID 로그인",
        "camp_step_2_p": "대상 조건 및 기한을 확인하고 로그인합니다.",
        "camp_step_3_h3": "요금제 신청",
        "camp_step_3_p": "MNP 번호이동을 선택하여 신청합니다.",
        "camp_step_4_h3": "개통 및 조건 완료",
        "camp_step_4_p": "기한 내 개통 및 필요한 이용 조건을 완료합니다.",
        "camp_btn": "최신 캠페인 조건 확인 →",
        "camp_sub": "라쿠텐 모바일 캠페인 페이지로 이동합니다",
        "trust_label": "ABOUT THIS SITE",
        "trust_h2": "헷갈리기 쉬운 포인트를 차근차근 정리해 드립니다.",
        "trust_p": "현재 통신사, 신청 방법, 계약 상황에 따라 확인 사항이 달라집니다. 본 사이트는 지역과 매장을 기준으로 신청 전 체크리스트를 알기 쉽게 안내합니다.",
        "trust_1": "각 매장의 공식 페이지 링크 제공",
        "trust_2": "영업시간 정보 공식 사이트 확인 안내",
        "trust_3": "최종 캠페인 조건 확인 안내",
        "trust_4": "통신사와 무관한 독립 개인 운영 사이트",
        "faq_label": "FAQ",
        "faq_h2": "자주 묻는 질문",
        "faq_1_q": "매장에 가지 않고도 번호이동이 가능한가요?",
        "faq_1_a": "네, 온라인으로 신청부터 개통까지 진행할 수 있습니다. 대면 상담을 원하시면 라쿠텐 모바일 매장을 방문하실 수도 있습니다.",
        "faq_2_q": "MNP 예약번호가 반드시 필요한가요?",
        "faq_2_a": "MNP 원스톱을 지원하는 통신사에서 온라인으로 신청하는 경우 예약번호가 필요 없습니다.",
        "faq_3_q": "지금 쓰던 전화번호 그대로 쓸 수 있나요?",
        "faq_3_a": "네, 번호이동(MNP)을 선택하여 절차를 완료하시면 현재 번호 그대로 이용 가능합니다.",
        "faq_4_q": "단말기 잔여 할부금은 어떻게 되나요?",
        "faq_4_a": "통신사를 변경하더라도 기존 기기 할부금은 이전 통신사로 계속 납부될 수 있습니다.",
        "faq_5_q": "추천 링크는 언제 접속해야 하나요?",
        "faq_5_a": "라쿠텐 모바일을 신청하기 전에 추천 링크를 열고 라쿠텐 ID로 로그인해 최신 조건을 확인하세요.",
        "final_eyebrow": "READY WHEN YOU ARE",
        "final_h2": "우선, 가까운 지역과 매장부터 찾아보세요.",
        "final_p": "이용 중인 매장을 선택하여 사전 준비물과 절차를 확인하실 수 있습니다.",
        "final_btn": "지역 선택 ↑",
        "updated": "정보 확인일: 2026-08-19",
        "footer_disclaimer_1": "본 사이트는 개인이 운영하며, 각 통신사 및 매장의 공식 사이트가 아닙니다.",
        "footer_disclaimer_2": "본 사이트에는 추천 링크가 포함되어 있습니다. 조건 및 매장 정보는 신청 시점의 공식 사이트에서 확인해 주세요.",
        
        # Tokyo Specific
        "tokyo_title": "도쿄 대리점에서 라쿠텐 모바일로 번호이동하는 방법 | 매장별 가이드",
        "tokyo_desc": "도쿄 내 au, docomo, SoftBank, UQ mobile, Y!mobile, 이온 모바일 매장을 지역별로 안내합니다. 매장별 사전 준비 및 MNP 절차를 확인하세요.",
        "tokyo_breadcrumb": "도쿄",
        "tokyo_hero_eyebrow": "TOKYO SHOP GUIDE",
        "tokyo_hero_h1": "도쿄 대리점에서<br><span>라쿠텐 모바일로 변경하기 전에</span>",
        "tokyo_hero_lead": "도쿄에서 au, docomo, SoftBank, UQ mobile, Y!mobile, 이온 모바일을 이용 중이신 분들을 위한 매장 방문 전 체크리스트입니다.",
        "tokyo_count": "등록 매장",
        "tokyo_coverage_link": "도쿄 각 지역(시·구·정·촌)별 라쿠텐 모바일 수신 상태 확인 ↗",
        "tokyo_finder_label": "SHOP FINDER",
        "tokyo_finder_h2": "매장 검색 및 필터",
        "tokyo_search_placeholder": "예: 신주쿠, 시부야, 매장명",
        "tokyo_filter_all": "전체",
        "tokyo_stores_suffix": "개 매장"
    },
    "vi": {
        "lang_code": "vi",
        "og_locale": "vi_VN",
        "flag": "🇻🇳 Tiếng Việt",
        "site_name": "Hướng dẫn chuyển sang Rakuten Mobile",
        "title_home": "Hướng dẫn chuyển sang Rakuten Mobile | Quy trình MNP theo nhà mạng & khu vực",
        "desc_home": "Hướng dẫn chuẩn bị và thủ tục MNP chuyển từ au, docomo, SoftBank, UQ mobile, Y!mobile, Aeon Mobile sang Rakuten Mobile theo cửa hàng và khu vực.",
        "nav_area": "Tìm theo tỉnh/thành",
        "nav_guide": "Quy trình chuyển mạng",
        "nav_program": "Đổi máy ưu đãi",
        "nav_campaign": "Khuyến mãi giới thiệu",
        "hero_eyebrow": "RAKUTEN MOBILE SWITCHING GUIDE",
        "hero_h1": "Chuyển từ nhà mạng hiện tại<br><span>sang Rakuten Mobile.</span>",
        "hero_msg": "Hướng dẫn chi tiết theo khu vực & cửa hàng.",
        "hero_lead": "Hướng dẫn giữ nguyên số điện thoại khi chuyển từ au, docomo, SoftBank, UQ mobile, Y!mobile, Aeon Mobile sang Rakuten Mobile.",
        "btn_find_pref": "Tìm theo tỉnh/thành ↓",
        "btn_campaign": "Xem khuyến mãi giới thiệu →",
        "start_pill": "Kiểm tra trước",
        "start_h2": "3 lưu ý quan trọng trước khi chuyển mạng",
        "start_1": "Xác nhận hợp đồng & tên chính chủ",
        "start_2": "Kiểm tra điện thoại, email & nợ máy",
        "start_3": "Kiểm tra điều kiện nhận thưởng trước khi đăng ký",
        "prog_label": "DEVICE REPLACEMENT PROGRAM",
        "prog_h2": "Cơ chế miễn thanh toán lên tới 24 tháng tiền máy.",
        "prog_p": "Trả góp 48 tháng, trả máy ở tháng 25. Giải thích dễ hiểu về chương trình đổi máy siêu tiết kiệm của Rakuten Mobile.",
        "prog_btn": "Đọc hướng dẫn chi tiết →",
        "area_label": "AREA & SHOP GUIDE",
        "area_h2": "Tìm theo tỉnh/thành",
        "area_p": "Chọn tỉnh/thành phố để xem danh sách cửa hàng gần nhất.",
        "pref_label": "Chọn tỉnh/thành",
        "pref_default": "Vui lòng chọn tỉnh/thành phố",
        "pref_note": "Chọn để chuyển đến danh sách cửa hàng tại tỉnh/thành đó.",
        "region_shortcuts": "Chọn vùng",
        "region_hokkaido_tohoku": "Hokkaido & Tohoku",
        "region_kanto": "Kanto",
        "region_hokuriku": "Hokuriku & Koshinetsu",
        "region_tokai": "Tokai",
        "region_kinki": "Kinki (Kansai)",
        "region_chugoku": "Chugoku",
        "region_shikoku": "Shikoku",
        "region_kyushu": "Kyushu & Okinawa",
        "essential_label": "BEFORE SWITCHING",
        "essential_h2": "Điều cần biết trước khi chuyển mạng",
        "essential_p": "Hãy kiểm tra 3 điểm này trước khi bắt đầu đăng ký.",
        "essential_1_h3": "MNP One-Stop",
        "essential_1_p": "Khi đăng ký online từ các nhà mạng hỗ trợ, bạn không cần lấy mã MNP.",
        "essential_1_btn": "Xem tại trang chính thức Rakuten Mobile ↗",
        "essential_2_h3": "Giấy tờ cần chuẩn bị",
        "essential_2_p": "Chuẩn bị giấy tờ tùy thân, Rakuten ID, thông tin thanh toán & số điện thoại.",
        "essential_3_h3": "Ảnh hưởng đến hợp đồng cũ",
        "essential_3_p": "Kiểm tra tiền nợ máy trả góp, email nhà mạng, giảm giá gia đình & internet.",
        "camp_label": "REFERRAL CAMPAIGN",
        "camp_h2": "Quy trình nhận khuyến mãi giới thiệu",
        "camp_p": "Điều kiện có thể thay đổi, hãy kiểm tra thứ tự đăng ký và quy định mới nhất.",
        "camp_step_1_h3": "Mở link giới thiệu",
        "camp_step_1_p": "Truy cập trang khuyến mãi trước khi đăng ký.",
        "camp_step_2_h3": "Đăng nhập Rakuten ID",
        "camp_step_2_p": "Kiểm tra điều kiện và thời hạn trước khi đăng nhập.",
        "camp_step_3_h3": "Đăng ký gói cước",
        "camp_step_3_p": "Chọn chuyển mạng giữ nguyên số (MNP).",
        "camp_step_4_h3": "Kích hoạt & hoàn thành",
        "camp_step_4_p": "Kích hoạt SIM trong thời hạn và hoàn thành yêu cầu.",
        "camp_btn": "Xem điều kiện khuyến mãi mới nhất →",
        "camp_sub": "Bạn sẽ được chuyển đến trang khuyến mãi chính thức",
        "trust_label": "ABOUT THIS SITE",
        "trust_h2": "Trang web tổng hợp hướng dẫn từng bước rõ ràng.",
        "trust_p": "Thông tin chuẩn bị tùy thuộc vào nhà mạng hiện tại và phương thức đăng ký của bạn. Trang web này giúp bạn dễ dàng tra cứu theo khu vực.",
        "trust_1": "Có link truy cập trang chính thức của cửa hàng",
        "trust_2": "Hướng dẫn xem giờ mở cửa chính xác trên trang chính thức",
        "trust_3": "Hướng dẫn kiểm tra điều kiện khuyến mãi cuối cùng",
        "trust_4": "Trang web cá nhân độc lập, không thuộc nhà mạng",
        "faq_label": "FAQ",
        "faq_h2": "Câu hỏi thường gặp",
        "faq_1_q": "Tôi có thể đăng ký mà không cần ra cửa hàng không?",
        "faq_1_a": "Có, bạn có thể đăng ký và kích hoạt hoàn toàn online. Nếu muốn tư vấn trực tiếp, bạn có thể đến Rakuten Mobile Shop.",
        "faq_2_q": "Có bắt buộc phải lấy mã MNP không?",
        "faq_2_a": "Nếu đăng ký online qua dịch vụ MNP One-Stop, bạn không cần mã MNP.",
        "faq_3_q": "Tôi có giữ lại được số điện thoại cũ không?",
        "faq_3_a": "Có, chỉ cần chọn chuyển mạng giữ số (MNP) khi đăng ký.",
        "faq_4_q": "Tiền trả góp máy cũ sẽ xử lý thế nào?",
        "faq_4_a": "Dù đã chuyển mạng, bạn vẫn cần tiếp tục trả nợ máy cho nhà mạng cũ.",
        "faq_5_q": "Khi nào nên bấm vào link giới thiệu?",
        "faq_5_a": "Hãy mở link giới thiệu và đăng nhập Rakuten ID trước khi tiến hành đăng ký gói cước.",
        "final_eyebrow": "READY WHEN YOU ARE",
        "final_h2": "Bắt đầu bằng việc tìm kiếm khu vực & cửa hàng.",
        "final_p": "Chọn cửa hàng bạn đang dùng để xem danh sách chuẩn bị và các bước thực hiện.",
        "final_btn": "Chọn khu vực ↑",
        "updated": "Ngày cập nhật thông tin: 19/08/2026",
        "footer_disclaimer_1": "Trang web này do cá nhân vận hành, không phải trang chính thức của nhà mạng hay cửa hàng.",
        "footer_disclaimer_2": "Trang web có chứa link giới thiệu. Vui lòng kiểm tra lại điều kiện chính xác tại thời điểm đăng ký trên trang chính thức.",
        
        # Tokyo Specific
        "tokyo_title": "Cách chuyển sang Rakuten Mobile từ các cửa hàng tại Tokyo | Hướng dẫn",
        "tokyo_desc": "Danh sách cửa hàng au, docomo, SoftBank, UQ mobile, Y!mobile, Aeon Mobile tại Tokyo. Xem hướng dẫn chuẩn bị MNP cho từng cửa hàng.",
        "tokyo_breadcrumb": "Tokyo",
        "tokyo_hero_eyebrow": "TOKYO SHOP GUIDE",
        "tokyo_hero_h1": "Trước khi chuyển sang Rakuten Mobile<br><span>từ cửa hàng tại Tokyo</span>",
        "tokyo_hero_lead": "Hướng dẫn chuẩn bị cho khách hàng đang dùng au, docomo, SoftBank, UQ mobile, Y!mobile, Aeon Mobile tại Tokyo.",
        "tokyo_count": "Cửa hàng",
        "tokyo_coverage_link": "Kiểm tra sóng Rakuten Mobile tại các quận/huyện Tokyo ↗",
        "tokyo_finder_label": "SHOP FINDER",
        "tokyo_finder_h2": "Tìm kiếm cửa hàng",
        "tokyo_search_placeholder": "Ví dụ: Shinjuku, Shibuya, tên cửa hàng",
        "tokyo_filter_all": "Tất cả",
        "tokyo_stores_suffix": "cửa hàng"
    },
    "pt": {
        "lang_code": "pt",
        "og_locale": "pt_BR",
        "flag": "🇧🇷 Português",
        "site_name": "Guia de Migração para Rakuten Mobile",
        "title_home": "Guia de Migração para Rakuten Mobile | Passo a passo MNP por Operadora e Região",
        "desc_home": "Guia de preparação e procedimentos MNP para mudar da au, docomo, SoftBank, UQ mobile, Y!mobile ou Aeon Mobile para a Rakuten Mobile.",
        "nav_area": "Buscar por Província",
        "nav_guide": "Passos da Migração",
        "nav_program": "Programa de Troca",
        "nav_campaign": "Campanha de Indicação",
        "hero_eyebrow": "RAKUTEN MOBILE SWITCHING GUIDE",
        "hero_h1": "Mude da sua operadora atual<br><span>para a Rakuten Mobile.</span>",
        "hero_msg": "Guia prático por região e loja para uma migração sem complicações.",
        "hero_lead": "Confira como manter seu número de telefone ao mudar da au, docomo, SoftBank, UQ mobile, Y!mobile ou Aeon Mobile.",
        "btn_find_pref": "Buscar por Província ↓",
        "btn_campaign": "Ver Campanha de Indicação →",
        "start_pill": "Confira Primeiro",
        "start_h2": "3 Pontos Chave Antes de Mudar",
        "start_1": "Confira o contrato atual e o titular",
        "start_2": "Verifique o aparelho, e-mail e saldo devedor",
        "start_3": "Confira as condições da indicação antes de solicitar",
        "prog_label": "DEVICE REPLACEMENT PROGRAM",
        "prog_h2": "Como isentar até 24 parcelas do seu celular.",
        "prog_p": "Pagamento em 48x e devolução do aparelho no 25º mês. Entenda o programa de troca com desconto da Rakuten Mobile.",
        "prog_btn": "Ler Guia Explicativo →",
        "area_label": "AREA & SHOP GUIDE",
        "area_h2": "Buscar por Província",
        "area_p": "Escolha a província ou navegue pelas regiões para encontrar a loja mais próxima.",
        "pref_label": "Selecione a Província",
        "pref_default": "Selecione uma província",
        "pref_note": "Ao selecionar, você será redirecionado para a lista de lojas da província.",
        "region_shortcuts": "Selecione a Região",
        "region_hokkaido_tohoku": "Hokkaido e Tohoku",
        "region_kanto": "Kanto",
        "region_hokuriku": "Hokuriku e Koshinetsu",
        "region_tokai": "Tokai",
        "region_kinki": "Kinki (Kansai)",
        "region_chugoku": "Chugoku",
        "region_shikoku": "Shikoku",
        "region_kyushu": "Kyushu e Okinawa",
        "essential_label": "BEFORE SWITCHING",
        "essential_h2": "O que Saber Antes da Migração",
        "essential_p": "Recomendamos verificar estes 3 pontos antes de iniciar a solicitação.",
        "essential_1_h3": "MNP One-Stop",
        "essential_1_p": "Ao solicitar online através de operadoras compatíveis, não é necessário emitir o código MNP.",
        "essential_1_btn": "Ver no Site Oficial Rakuten Mobile ↗",
        "essential_2_h3": "Documentos Necessários",
        "essential_2_p": "Prepare documento de identidade, Rakuten ID, dados de pagamento e número atual.",
        "essential_3_h3": "Impacto no Contrato Atual",
        "essential_3_p": "Verifique parcelas restantes do aparelho, e-mail da operadora e descontos de combo.",
        "camp_label": "REFERRAL CAMPAIGN",
        "camp_h2": "Como Usar a Campanha de Indicação",
        "camp_p": "As condições podem mudar, por isso é importante verificar a ordem de inscrição e as regras atuais.",
        "camp_step_1_h3": "Abra o Link de Indicação",
        "camp_step_1_p": "Acesse a página da campanha antes de fazer a solicitação.",
        "camp_step_2_h3": "Faça Login com o Rakuten ID",
        "camp_step_2_p": "Confira as condições e prazos antes de fazer o login.",
        "camp_step_3_h3": "Solicite o Plano",
        "camp_step_3_p": "Selecione a portabilidade numérica (MNP).",
        "camp_step_4_h3": "Ativação e Conclusão",
        "camp_step_4_p": "Ative a linha dentro do prazo e cumpra os requisitos.",
        "camp_btn": "Ver Últimas Condições da Campanha →",
        "camp_sub": "Você será redirecionado para o site oficial da Rakuten Mobile",
        "trust_label": "ABOUT THIS SITE",
        "trust_h2": "Um site que organiza pontos importantes passo a passo.",
        "trust_p": "Os requisitos variam de acordo com a operadora atual e o método de solicitação. Este site organiza tudo por região e loja.",
        "trust_1": "Links para as páginas oficiais das lojas",
        "trust_2": "Orientação para verificar horários no site oficial",
        "trust_3": "Orientação para checagem final dos benefícios",
        "trust_4": "Site independente, sem vínculo com as operadoras",
        "faq_label": "FAQ",
        "faq_h2": "Perguntas Frequentes",
        "faq_1_q": "Posso mudar de operadora sem ir à loja?",
        "faq_1_a": "Sim, você pode fazer todo o processo online. Se preferir atendimento presencial, pode ir a uma loja Rakuten Mobile.",
        "faq_2_q": "O código MNP é obrigatório?",
        "faq_2_a": "Para solicitações online via MNP One-Stop, o código de reserva pode não ser necessário.",
        "faq_3_q": "Posso manter meu número de telefone atual?",
        "faq_3_a": "Sim, basta selecionar a portabilidade (MNP) ao solicitar o plano.",
        "faq_4_q": "O que acontece com o saldo do celular antigo?",
        "faq_4_a": "Mesmo trocando de operadora, o pagamento das parcelas do aparelho continua na operadora antiga.",
        "faq_5_q": "Quando devo acessar o link de indicação?",
        "faq_5_a": "Acesse o link de indicação e faça login com seu Rakuten ID antes de iniciar o pedido.",
        "final_eyebrow": "READY WHEN YOU ARE",
        "final_h2": "Comece buscando pela sua região e loja.",
        "final_p": "Escolha sua loja atual para verificar a preparação e os passos necessários.",
        "final_btn": "Escolher Região ↑",
        "updated": "Data de verificação: 19/08/2026",
        "footer_disclaimer_1": "Este site é gerido de forma independente e não é um site oficial das operadoras ou lojas.",
        "footer_disclaimer_2": "Contém links de indicação. Verifique os termos atualizados nos sites oficiais ao solicitar.",
        
        # Tokyo Specific
        "tokyo_title": "Como Mudar para a Rakuten Mobile em Lojas de Tóquio | Guia de Lojas",
        "tokyo_desc": "Lista de lojas au, docomo, SoftBank, UQ mobile, Y!mobile e Aeon Mobile em Tóquio. Confira os passos da migração MNP.",
        "tokyo_breadcrumb": "Tóquio",
        "tokyo_hero_eyebrow": "TOKYO SHOP GUIDE",
        "tokyo_hero_h1": "Antes de mudar para a Rakuten Mobile<br><span>em lojas de Tóquio</span>",
        "tokyo_hero_lead": "Guia de preparação para clientes da au, docomo, SoftBank, UQ mobile, Y!mobile e Aeon Mobile em Tóquio.",
        "tokyo_count": "Lojas Listadas",
        "tokyo_coverage_link": "Verifique o sinal da Rakuten Mobile nos bairros e cidades de Tóquio ↗",
        "tokyo_finder_label": "SHOP FINDER",
        "tokyo_finder_h2": "Filtrar Lojas",
        "tokyo_search_placeholder": "Ex: Shinjuku, Shibuya, nome da loja",
        "tokyo_filter_all": "Todas",
        "tokyo_stores_suffix": "lojas"
    }
}

def generate_lang_select_html(current_page_type, target_lang):
    path_suffix = "" if current_page_type == "home" else "tokyo/"
    
    options = [
        f'<option value="/{path_suffix}"{" selected" if target_lang == "ja" else ""}>🇯🇵 日本語</option>',
        f'<option value="/en/{path_suffix}"{" selected" if target_lang == "en" else ""}>🇺🇸 English</option>',
        f'<option value="/zh/{path_suffix}"{" selected" if target_lang == "zh" else ""}>🇨🇳 中文</option>',
        f'<option value="/ko/{path_suffix}"{" selected" if target_lang == "ko" else ""}>🇰🇷 한국어</option>',
        f'<option value="/vi/{path_suffix}"{" selected" if target_lang == "vi" else ""}>🇻🇳 Tiếng Việt</option>',
        f'<option value="/pt/{path_suffix}"{" selected" if target_lang == "pt" else ""}>🇧🇷 Português</option>',
    ]
    return '\n        '.join(options)

def process_home_page(lang_code, t):
    with open(os.path.join(BASE_DIR, "index.html"), "r", encoding="utf-8") as f:
        content = f.read()

    # Replace html lang tag
    content = re.sub(r'<html lang="ja">', f'<html lang="{t["lang_code"]}">', content)
    
    # Replace title and description
    content = re.sub(r'<title>.*?</title>', f'<title>{t["title_home"]}</title>', content)
    content = re.sub(r'<meta name="description" content=".*?">', f'<meta name="description" content="{t["desc_home"]}">', content)
    content = re.sub(r'<link rel="canonical" href=".*?">', f'<link rel="canonical" href="https://rm-referral.maffun.workers.dev/{lang_code}/">', content)
    content = re.sub(r'<meta property="og:locale" content=".*?">', f'<meta property="og:locale" content="{t["og_locale"]}">', content)
    content = re.sub(r'<meta property="og:title" content=".*?">', f'<meta property="og:title" content="{t["title_home"]}">', content)
    content = re.sub(r'<meta property="og:description" content=".*?">', f'<meta property="og:description" content="{t["desc_home"]}">', content)
    content = re.sub(r'<meta property="og:url" content=".*?">', f'<meta property="og:url" content="https://rm-referral.maffun.workers.dev/{lang_code}/">', content)
    
    # Site Name
    content = content.replace('<a class="site-name" href="/">楽天モバイル乗り換えガイド</a>', f'<a class="site-name" href="/{lang_code}/">{t["site_name"]}</a>')
    content = content.replace('<strong>楽天モバイル乗り換えガイド</strong>', f'<strong>{t["site_name"]}</strong>')

    # Nav
    content = content.replace('<a href="#area">都道府県から探す</a>', f'<a href="#area">{t["nav_area"]}</a>')
    content = content.replace('<a href="#switching-guide">乗り換え手順</a>', f'<a href="#switching-guide">{t["nav_guide"]}</a>')
    content = content.replace('<a href="/guide/replacement-program/">買い替え超トク</a>', f'<a href="/guide/replacement-program/">{t["nav_program"]}</a>')
    content = content.replace('<a href="#campaign">紹介キャンペーン</a>', f'<a href="#campaign">{t["nav_campaign"]}</a>')

    # Hero
    content = content.replace('<p class="eyebrow">RAKUTEN MOBILE SWITCHING GUIDE</p>', f'<p class="eyebrow">{t["hero_eyebrow"]}</p>')
    content = content.replace('<h1>今の携帯会社から<br><span>楽天モバイルへ。</span></h1>', f'<h1>{t["hero_h1"]}</h1>')
    content = content.replace('<p class="home-hero-message">迷わず乗り換えるための、地域・店舗別ガイド。</p>', f'<p class="home-hero-message">{t["hero_msg"]}</p>')
    content = content.replace('<p class="lead">au・ドコモ・ソフトバンク・UQ mobile・Y!mobile・イオンモバイルから電話番号を引き継ぐ準備と手順を、普段利用する店舗から確認できます。</p>', f'<p class="lead">{t["hero_lead"]}</p>')
    content = content.replace('都道府県から探す <span aria-hidden="true">↓</span>', f'{t["btn_find_pref"]} <span aria-hidden="true">↓</span>')
    content = content.replace('紹介キャンペーンを確認 <span aria-hidden="true">→</span>', f'{t["btn_campaign"]} <span aria-hidden="true">→</span>')
    
    # Start Card
    content = content.replace('<p class="pill">はじめに確認</p>', f'<p class="pill">{t["start_pill"]}</p>')
    content = content.replace('<h2>乗り換え前の3つのポイント</h2>', f'<h2>{t["start_h2"]}</h2>')
    content = content.replace('<span>今の契約内容と名義を確認</span>', f'<span>{t["start_1"]}</span>')
    content = content.replace('<span>端末・メール・残債を確認</span>', f'<span>{t["start_2"]}</span>')
    content = content.replace('<span>申し込み前に紹介条件を確認</span>', f'<span>{t["start_3"]}</span>')

    # Program promo
    content = content.replace('<p class="section-label">DEVICE REPLACEMENT PROGRAM</p>', f'<p class="section-label">{t["prog_label"]}</p>')
    content = content.replace('<h2>スマホ代、最大24回分の<br>支払いが不要になる仕組み。</h2>', f'<h2>{t["prog_h2"]}</h2>')
    content = content.replace('<p>48回払い、25カ月目、製品の返却。少し難しく見える「楽天モバイル買い替え超トクプログラム」を、注意点も含めてやさしく整理しました。</p>', f'<p>{t["prog_p"]}</p>')
    content = content.replace('やさしい解説を読む <span aria-hidden="true">→</span>', f'{t["prog_btn"]}')

    # Area Section
    content = content.replace('<p class="section-label">AREA &amp; SHOP GUIDE</p><h2>都道府県から探す</h2>', f'<p class="section-label">{t["area_label"]}</p><h2>{t["area_h2"]}</h2>')
    content = content.replace('<p>都道府県を選ぶか、地方別の一覧からお近くの店舗ガイドへ進めます。</p>', f'<p>{t["area_p"]}</p>')
    content = content.replace('<label for="prefecture-select">都道府県を選択</label>', f'<label for="prefecture-select">{t["pref_label"]}</label>')
    content = content.replace('<option value="">都道府県を選択してください</option>', f'<option value="">{t["pref_default"]}</option>')
    content = content.replace('<p>選択すると、その都道府県の店舗一覧へ移動します。</p>', f'<p>{t["pref_note"]}</p>')
    content = content.replace('aria-label="地方を選択"', f'aria-label="{t["region_shortcuts"]}"')
    
    # Regions
    content = content.replace('<b>北海道・東北</b>', f'<b>{t["region_hokkaido_tohoku"]}</b>')
    content = content.replace('<b>関東</b>', f'<b>{t["region_kanto"]}</b>')
    content = content.replace('<b>北陸・甲信越</b>', f'<b>{t["region_hokuriku"]}</b>')
    content = content.replace('<b>東海</b>', f'<b>{t["region_tokai"]}</b>')
    content = content.replace('<b>近畿</b>', f'<b>{t["region_kinki"]}</b>')
    content = content.replace('<b>中国</b>', f'<b>{t["region_chugoku"]}</b>')
    content = content.replace('<b>四国</b>', f'<b>{t["region_shikoku"]}</b>')
    content = content.replace('<b>九州・沖縄</b>', f'<b>{t["region_kyushu"]}</b>')

    # Pref links prefix path update
    content = content.replace('href="/tokyo/"', f'href="/{lang_code}/tokyo/"')

    # Essentials
    content = content.replace('<p class="section-label">BEFORE SWITCHING</p><h2>乗り換え前に知っておきたいこと</h2>', f'<p class="section-label">{t["essential_label"]}</p><h2>{t["essential_h2"]}</h2>')
    content = content.replace('<p>申し込みを始める前に、まずこの3点を確認しておくと安心です。</p>', f'<p>{t["essential_p"]}</p>')
    content = content.replace('<h3>MNPワンストップ</h3>', f'<h3>{t["essential_1_h3"]}</h3>')
    content = content.replace('<p>対応する携帯会社からオンラインで乗り換える場合、MNP予約番号を取得せず手続きを進められることがあります。</p>', f'<p>{t["essential_1_p"]}</p>')
    content = content.replace('楽天モバイル公式で確認 ↗', f'{t["essential_1_btn"]}')
    content = content.replace('<h3>準備するもの</h3>', f'<h3>{t["essential_2_h3"]}</h3>')
    content = content.replace('<p>本人確認書類、楽天ID、支払い情報、現在利用中の電話番号と契約名義を確認します。</p>', f'<p>{t["essential_2_p"]}</p>')
    content = content.replace('<h3>今の契約への影響</h3>', f'<h3>{t["essential_3_h3"]}</h3>')
    content = content.replace('<p>端末の分割残債、キャリアメール、家族割、固定回線とのセット割などへの影響を確認します。</p>', f'<p>{t["essential_3_p"]}</p>')

    # Campaign
    content = content.replace('<p class="section-label">REFERRAL CAMPAIGN</p>', f'<p class="section-label">{t["camp_label"]}</p>')
    content = content.replace('<h2>紹介キャンペーンを利用する流れ</h2>', f'<h2>{t["camp_h2"]}</h2>')
    content = content.replace('<p>特典内容は変わることがあるため、金額だけでなく申し込み順と最新条件を確認することが大切です。</p>', f'<p>{t["camp_p"]}</p>')
    content = content.replace('<h3>紹介リンクを開く</h3>', f'<h3>{t["camp_step_1_h3"]}</h3>')
    content = content.replace('<p>申し込み前にキャンペーンページへ進みます。</p>', f'<p>{t["camp_step_1_p"]}</p>')
    content = content.replace('<h3>楽天IDでログイン</h3>', f'<h3>{t["camp_step_2_h3"]}</h3>')
    content = content.replace('<p>対象条件と期限を確認してログインします。</p>', f'<p>{t["camp_step_2_p"]}</p>')
    content = content.replace('<h3>プランを申し込む</h3>', f'<h3>{t["camp_step_3_h3"]}</h3>')
    content = content.replace('<p>MNPの場合は電話番号の引き継ぎを選択します。</p>', f'<p>{t["camp_step_3_p"]}</p>')
    content = content.replace('<h3>開通・条件達成</h3>', f'<h3>{t["camp_step_4_h3"]}</h3>')
    content = content.replace('<p>期限内に開通し、必要な利用条件を完了します。</p>', f'<p>{t["camp_step_4_p"]}</p>')
    content = content.replace('最新のキャンペーン条件を確認 <span aria-hidden="true">→</span>', f'{t["camp_btn"]}')
    content = content.replace('<p>楽天モバイルのキャンペーンページへ移動します</p>', f'<p>{t["camp_sub"]}</p>')

    # Trust
    content = content.replace('<p class="section-label">ABOUT THIS SITE</p>', f'<p class="section-label">{t["trust_label"]}</p>')
    content = content.replace('<h2>迷いやすいポイントを、順番に整理するサイトです。</h2>', f'<h2>{t["trust_h2"]}</h2>')
    content = content.replace('<p>乗り換えでは、現在の携帯会社、申込方法、契約状況によって必要な確認が変わります。このサイトでは、地域と店舗を入口にして、申し込み前に確認したい内容をできるだけ分かりやすく整理しています。</p>', f'<p>{t["trust_p"]}</p>')
    content = content.replace('<li><span>✓</span>各店舗の公式ページへリンク</li>', f'<li><span>✓</span>{t["trust_1"]}</li>')
    content = content.replace('<li><span>✓</span>変わりやすい営業時間は公式確認を案内</li>', f'<li><span>✓</span>{t["trust_2"]}</li>')
    content = content.replace('<li><span>✓</span>キャンペーン条件の最終確認を案内</li>', f'<li><span>✓</span>{t["trust_3"]}</li>')
    content = content.replace('<li><span>✓</span>各通信会社・掲載店舗とは無関係の個人運営</li>', f'<li><span>✓</span>{t["trust_4"]}</li>')

    # FAQ
    content = content.replace('<p class="section-label">FAQ</p><h2>よくある質問</h2>', f'<p class="section-label">{t["faq_label"]}</p><h2>{t["faq_h2"]}</h2>')
    content = content.replace('店舗へ行かずに乗り換えられる？', t["faq_1_q"])
    content = content.replace('オンラインで申し込みから開通まで進められます。対面で相談したい場合は楽天モバイルショップでの申し込みも選べます。', t["faq_1_a"])
    content = content.replace('MNP予約番号は必要？', t["faq_2_q"])
    content = content.replace('MNPワンストップに対応した携帯会社からオンラインで申し込む場合は、予約番号が不要になることがあります。店舗での申し込みなど、手続き方法によって異なります。', t["faq_2_a"])
    content = content.replace('今の電話番号は引き継げる？', t["faq_3_q"])
    content = content.replace('他社からの乗り換え（MNP）を選択し、手続きを完了すれば現在の電話番号を引き継げます。', t["faq_3_a"])
    content = content.replace('端末代の残りはどうなる？', t["faq_4_q"])
    content = content.replace('回線を乗り換えても、端末の分割残債は元の携帯会社へ支払いが続く場合があります。現在の契約内容を確認してください。', t["faq_4_a"])
    content = content.replace('紹介リンクはいつ開く？', t["faq_5_q"])
    content = content.replace('楽天モバイルを申し込む前に紹介リンクを開き、楽天IDでログインして最新の条件を確認してください。', t["faq_5_a"])

    # Final CTA
    content = content.replace('<p class="eyebrow">READY WHEN YOU ARE</p>', f'<p class="eyebrow">{t["final_eyebrow"]}</p>')
    content = content.replace('<h2>まずは、地域と店舗から探してみよう。</h2>', f'<h2>{t["final_h2"]}</h2>')
    content = content.replace('<p>利用中の店舗を選び、乗り換え前に準備するものと手順を確認できます。</p>', f'<p>{t["final_p"]}</p>')
    content = content.replace('地域を選ぶ <span aria-hidden="true">↑</span>', f'{t["final_btn"]}')
    content = content.replace('<p class="updated">情報確認日：2026-08-19</p>', f'<p class="updated">{t["updated"]}</p>')

    # Footer
    content = content.replace('<p>当サイトは個人が運営しており、各通信会社および掲載店舗の公式サイトではありません。</p>', f'<p>{t["footer_disclaimer_1"]}</p>')
    content = content.replace('<p>当サイトには紹介リンクが含まれます。条件や店舗情報は、申し込み時点の各公式サイトでご確認ください。</p>', f'<p>{t["footer_disclaimer_2"]}</p>')

    # Language Selector dropdown replacement
    old_lang_selector = '''    <div class="lang-selector-wrap">
      <select class="lang-selector" onchange="if(this.value) location.href=this.value;" aria-label="Language / 言語">
        <option value="/" selected>🇯🇵 日本語</option>
        <option value="/en/">🇺🇸 English</option>
        <option value="/zh/">🇨🇳 中文</option>
        <option value="/ko/">🇰🇷 한국어</option>
        <option value="/vi/">🇻🇳 Tiếng Việt</option>
        <option value="/pt/">🇧🇷 Português</option>
      </select>
    </div>'''
    
    new_lang_selector = f'''    <div class="lang-selector-wrap">
      <select class="lang-selector" onchange="if(this.value) location.href=this.value;" aria-label="Language">
        {generate_lang_select_html("home", lang_code)}
      </select>
    </div>'''
    
    content = content.replace(old_lang_selector, new_lang_selector)

    # Save file
    out_path = os.path.join(BASE_DIR, lang_code, "index.html")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Generated {out_path}")

def process_tokyo_page(lang_code, t):
    with open(os.path.join(BASE_DIR, "tokyo", "index.html"), "r", encoding="utf-8") as f:
        content = f.read()

    # Replace html lang tag
    content = re.sub(r'<html lang="ja">', f'<html lang="{t["lang_code"]}">', content)
    
    # Replace title and description
    content = re.sub(r'<title>.*?</title>', f'<title>{t["tokyo_title"]}</title>', content)
    content = re.sub(r'<meta name="description" content=".*?">', f'<meta name="description" content="{t["tokyo_desc"]}">', content)
    content = re.sub(r'<link rel="canonical" href=".*?">', f'<link rel="canonical" href="https://rm-referral.maffun.workers.dev/{lang_code}/tokyo/">', content)
    content = re.sub(r'<meta property="og:locale" content=".*?">', f'<meta property="og:locale" content="{t["og_locale"]}">', content)
    content = re.sub(r'<meta property="og:title" content=".*?">', f'<meta property="og:title" content="{t["tokyo_title"]}">', content)
    content = re.sub(r'<meta property="og:description" content=".*?">', f'<meta property="og:description" content="{t["tokyo_desc"]}">', content)
    content = re.sub(r'<meta property="og:url" content=".*?">', f'<meta property="og:url" content="https://rm-referral.maffun.workers.dev/{lang_code}/tokyo/">', content)

    # Site Name & Header Link
    content = content.replace('<a class="site-name" href="/">楽天モバイル乗り換えガイド</a>', f'<a class="site-name" href="/{lang_code}/">{t["site_name"]}</a>')
    content = content.replace('<a class="header-link" href="/tokyo/">東京の店舗一覧</a>', f'<a class="header-link" href="/{lang_code}/tokyo/">{t["tokyo_breadcrumb"]}</a>')
    content = content.replace('<nav class="breadcrumb" aria-label="パンくずリスト"><a href="/">トップ</a><span>›</span><span>東京</span></nav>', f'<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/{lang_code}/">Home</a><span>›</span><span>{t["tokyo_breadcrumb"]}</span></nav>')

    # Hero
    content = content.replace('<p class="eyebrow">TOKYO SHOP GUIDE</p>', f'<p class="eyebrow">{t["tokyo_hero_eyebrow"]}</p>')
    content = content.replace('<h1>東京都のキャリアショップから<br><span>楽天モバイルへ乗り換える前に</span></h1>', f'<h1>{t["tokyo_hero_h1"]}</h1>')
    content = content.replace('<p class="lead">au・ドコモ・ソフトバンク・UQ mobile・Y!mobile・イオンモバイルを利用中の方向けに、店舗へ行く前に確認したい乗り換え準備をまとめました。現在利用している店舗から選んでください。</p>', f'<p class="lead">{t["tokyo_hero_lead"]}</p>')
    content = content.replace('<span>掲載店舗</span>', f'<span>{t["tokyo_count"]}</span>')
    content = content.replace('東京都の楽天モバイル電波状況を市区町村から確認する <span aria-hidden="true">↗</span>', f'{t["tokyo_coverage_link"]}')

    # Shop Finder
    content = content.replace('<p class="section-label">SHOP FINDER</p><h2>店舗を絞り込む</h2>', f'<p class="section-label">{t["tokyo_finder_label"]}</p><h2>{t["tokyo_finder_h2"]}</h2>')
    content = content.replace('placeholder="例：新宿、渋谷、店舗名"', f'placeholder="{t["tokyo_search_placeholder"]}"')
    content = content.replace('店舗名・市区町村から検索', f'Search by store or district')
    content = content.replace('すべて <small>', f'{t["tokyo_filter_all"]} <small>')
    content = content.replace('店舗を表示</p>', f'{t["tokyo_stores_suffix"]}</p>')

    # Language Selector dropdown replacement
    old_lang_selector = '''      <div class="lang-selector-wrap">
        <select class="lang-selector" onchange="if(this.value) location.href=this.value;" aria-label="Language / 言語">
          <option value="/tokyo/" selected>🇯🇵 日本語</option>
          <option value="/en/tokyo/">🇺🇸 English</option>
          <option value="/zh/tokyo/">🇨🇳 中文</option>
          <option value="/ko/tokyo/">🇰🇷 한국어</option>
          <option value="/vi/tokyo/">🇻🇳 Tiếng Việt</option>
          <option value="/pt/tokyo/">🇧🇷 Português</option>
        </select>
      </div>'''
    
    new_lang_selector = f'''      <div class="lang-selector-wrap">
        <select class="lang-selector" onchange="if(this.value) location.href=this.value;" aria-label="Language">
          {generate_lang_select_html("tokyo", lang_code)}
        </select>
      </div>'''
    
    content = content.replace(old_lang_selector, new_lang_selector)

    # Save file
    out_path = os.path.join(BASE_DIR, lang_code, "tokyo", "index.html")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Generated {out_path}")

def main():
    for lang_code, t in LANGUAGES.items():
        process_home_page(lang_code, t)
        process_tokyo_page(lang_code, t)

if __name__ == "__main__":
    main()
