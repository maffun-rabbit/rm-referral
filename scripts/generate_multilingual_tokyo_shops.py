#!/usr/bin/env python3
import os
import re
import glob
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KANTO_AREAS = ["ibaraki", "tochigi", "gunma", "saitama", "chiba", "tokyo", "kanagawa"]
PREFECTURES = {
    "ibaraki": {"ja": "茨城県", "en": "Ibaraki", "zh": "茨城县", "ko": "이바라키현", "vi": "Tỉnh Ibaraki", "pt": "Ibaraki"},
    "tochigi": {"ja": "栃木県", "en": "Tochigi", "zh": "栃木县", "ko": "도치기현", "vi": "Tỉnh Tochigi", "pt": "Tochigi"},
    "gunma": {"ja": "群馬県", "en": "Gunma", "zh": "群马县", "ko": "군마현", "vi": "Tỉnh Gunma", "pt": "Gunma"},
    "saitama": {"ja": "埼玉県", "en": "Saitama", "zh": "埼玉县", "ko": "사이타마현", "vi": "Tỉnh Saitama", "pt": "Saitama"},
    "chiba": {"ja": "千葉県", "en": "Chiba", "zh": "千叶县", "ko": "치바현", "vi": "Tỉnh Chiba", "pt": "Chiba"},
    "tokyo": {"ja": "東京", "en": "Tokyo", "zh": "东京都", "ko": "도쿄도", "vi": "Tokyo", "pt": "Tóquio"},
    "kanagawa": {"ja": "神奈川県", "en": "Kanagawa", "zh": "神奈川县", "ko": "가나가와현", "vi": "Tỉnh Kanagawa", "pt": "Kanagawa"},
}
with open(os.path.join(BASE_DIR, "data", "kanto-name-readings.json"), encoding="utf-8") as readings_file:
    NAME_READINGS = json.load(readings_file)

TOKYO_DISTRICTS_MAP = {
    "あきる野市": {"en": "Akiruno City", "zh": "秋留野市", "ko": "아키루노시", "vi": "Thành phố Akiruno", "pt": "Cidade de Akiruno"},
    "三鷹市": {"en": "Mitaka City", "zh": "三鹰市", "ko": "미타카시", "vi": "Thành phố Mitaka", "pt": "Cidade de Mitaka"},
    "世田谷区": {"en": "Setagaya Ward", "zh": "世田谷区", "ko": "세타가야구", "vi": "Quận Setagaya", "pt": "Distrito de Setagaya"},
    "中央区": {"en": "Chuo Ward", "zh": "中央区", "ko": "주오구", "vi": "Quận Chuo", "pt": "Distrito de Chuo"},
    "中野区": {"en": "Nakano Ward", "zh": "中野区", "ko": "나카노구", "vi": "Quận Nakano", "pt": "Distrito de Nakano"},
    "八丈島八丈町": {"en": "Hachijo Town", "zh": "八丈町", "ko": "하치조마치", "vi": "Thị trấn Hachijo", "pt": "Vila de Hachijo"},
    "八王子市": {"en": "Hachioji City", "zh": "八王子市", "ko": "하치오지시", "vi": "Thành phố Hachioji", "pt": "Cidade de Hachioji"},
    "北区": {"en": "Kita Ward", "zh": "北区", "ko": "기타구", "vi": "Quận Kita", "pt": "Distrito de Kita"},
    "千代田区": {"en": "Chiyoda Ward", "zh": "千代田区", "ko": "치요다구", "vi": "Quận Chiyoda", "pt": "Distrito de Chiyoda"},
    "台東区": {"en": "Taito Ward", "zh": "台东区", "ko": "다이토구", "vi": "Quận Taito", "pt": "Distrito de Taito"},
    "品川区": {"en": "Shinagawa Ward", "zh": "品川区", "ko": "시나가와구", "vi": "Quận Shinagawa", "pt": "Distrito de Shinagawa"},
    "国分寺市": {"en": "Kokubunji City", "zh": "国分寺市", "ko": "고쿠분지시", "vi": "Thành phố Kokubunji", "pt": "Cidade de Kokubunji"},
    "国立市": {"en": "Kunitachi City", "zh": "国立市", "ko": "쿠니타치시", "vi": "Thành phố Kunitachi", "pt": "Cidade de Kunitachi"},
    "墨田区": {"en": "Sumida Ward", "zh": "墨田区", "ko": "스미다구", "vi": "Quận Sumida", "pt": "Distrito de Sumida"},
    "多摩市": {"en": "Tama City", "zh": "多摩市", "ko": "타마시", "vi": "Thành phố Tama", "pt": "Cidade de Tama"},
    "大島町": {"en": "Oshima Town", "zh": "大岛町", "ko": "오시마마치", "vi": "Thị trấn Oshima", "pt": "Vila de Oshima"},
    "大田区": {"en": "Ota Ward", "zh": "大田区", "ko": "오타구", "vi": "Quận Ota", "pt": "Distrito de Ota"},
    "小平市": {"en": "Kodaira City", "zh": "小平市", "ko": "코다이라시", "vi": "Thành phố Kodaira", "pt": "Cidade de Kodaira"},
    "小金井市": {"en": "Koganei City", "zh": "小金井市", "ko": "코가네이시", "vi": "Thành phố Koganei", "pt": "Cidade de Koganei"},
    "府中市": {"en": "Fuchu City", "zh": "府中市", "ko": "후추시", "vi": "Thành phố Fuchu", "pt": "Cidade de Fuchu"},
    "文京区": {"en": "Bunkyo Ward", "zh": "文京区", "ko": "분쿄구", "vi": "Quận Bunkyo", "pt": "Distrito de Bunkyo"},
    "新宿区": {"en": "Shinjuku Ward", "zh": "新宿区", "ko": "신주쿠구", "vi": "Quận Shinjuku", "pt": "Distrito de Shinjuku"},
    "日野市": {"en": "Hino City", "zh": "日野市", "ko": "히노시", "vi": "Thành phố Hino", "pt": "Cidade de Hino"},
    "昭島市": {"en": "Akishima City", "zh": "昭岛市", "ko": "아키시마시", "vi": "Thành phố Akishima", "pt": "Cidade de Akishima"},
    "杉並区": {"en": "Suginami Ward", "zh": "杉并区", "ko": "스기나미구", "vi": "Quận Suginami", "pt": "Distrito de Suginami"},
    "東久留米市": {"en": "Higashikurume City", "zh": "东久留米市", "ko": "히가시쿠루메시", "vi": "Thành phố Higashikurume", "pt": "Cidade de Higashikurume"},
    "東大和市": {"en": "Higashiyamato City", "zh": "东大和市", "ko": "히가시야마토시", "vi": "Thành phố Higashiyamato", "pt": "Cidade de Higashiyamato"},
    "東村山市": {"en": "Higashimurayama City", "zh": "东村山市", "ko": "히가시무라야마시", "vi": "Thành phố Higashimurayama", "pt": "Cidade de Higashimurayama"},
    "板橋区": {"en": "Itabashi Ward", "zh": "板桥区", "ko": "이타바시구", "vi": "Quận Itabashi", "pt": "Distrito de Itabashi"},
    "武蔵村山市": {"en": "Musashimurayama City", "zh": "武藏村山市", "ko": "무사시무라야마시", "vi": "Thành phố Musashimurayama", "pt": "Cidade de Musashimurayama"},
    "武蔵野市": {"en": "Musashino City", "zh": "武藏野市", "ko": "무사시노시", "vi": "Thành phố Musashino", "pt": "Cidade de Musashino"},
    "江戸川区": {"en": "Edogawa Ward", "zh": "江户川区", "ko": "에도가와구", "vi": "Quận Edogawa", "pt": "Distrito de Edogawa"},
    "江東区": {"en": "Koto Ward", "zh": "江东区", "ko": "코토구", "vi": "Quận Koto", "pt": "Distrito de Koto"},
    "清瀬市": {"en": "Kiyose City", "zh": "清濑市", "ko": "키요세시", "vi": "Thành phố Kiyose", "pt": "Cidade de Kiyose"},
    "渋谷区": {"en": "Shibuya Ward", "zh": "涩谷区", "ko": "시부야구", "vi": "Quận Shibuya", "pt": "Distrito de Shibuya"},
    "港区": {"en": "Minato Ward", "zh": "港区", "ko": "미나토区", "vi": "Quận Minato", "pt": "Distrito de Minato"},
    "狛江市": {"en": "Komae City", "zh": "狛江市", "ko": "코마에시", "vi": "Thành phố Komae", "pt": "Cidade de Komae"},
    "町田市": {"en": "Machida City", "zh": "町田市", "ko": "마치다시", "vi": "Thành phố Machida", "pt": "Cidade de Machida"},
    "目黒区": {"en": "Meguro Ward", "zh": "目黑区", "ko": "메구로구", "vi": "Quận Meguro", "pt": "Distrito de Meguro"},
    "福生市": {"en": "Fussa City", "zh": "福生市", "ko": "후사시", "vi": "Thành phố Fussa", "pt": "Cidade de Fussa"},
    "稲城市": {"en": "Inagi City", "zh": "稻城市", "ko": "이나기시", "vi": "Thành phố Inagi", "pt": "Cidade de Inagi"},
    "立川市": {"en": "Tachikawa City", "zh": "立川市", "ko": "타치카와시", "vi": "Thành phố Tachikawa", "pt": "Cidade de Tachikawa"},
    "練馬区": {"en": "Nerima Ward", "zh": "练马区", "ko": "네리마구", "vi": "Quận Nerima", "pt": "Distrito de Nerima"},
    "羽村市": {"en": "Hamura City", "zh": "羽村市", "ko": "하무라시", "vi": "Thành phố Hamura", "pt": "Cidade de Hamura"},
    "荒川区": {"en": "Arakawa Ward", "zh": "荒川区", "ko": "아라카와구", "vi": "Quận Arakawa", "pt": "Distrito de Arakawa"},
    "葛飾区": {"en": "Katsushika Ward", "zh": "葛饰区", "ko": "카츠시카구", "vi": "Quận Katsushika", "pt": "Distrito de Katsushika"},
    "西多摩郡日の出町": {"en": "Hinode Town", "zh": "日出町", "ko": "히노데마치", "vi": "Thị trấn Hinode", "pt": "Vila de Hinode"},
    "西多摩郡瑞穂町": {"en": "Mizuho Town", "zh": "瑞穗町", "ko": "미즈호마치", "vi": "Thị trấn Mizuho", "pt": "Vila de Mizuho"},
    "西東京市": {"en": "Nishitokyo City", "zh": "西东京市", "ko": "니시도쿄시", "vi": "Thành phố Nishitokyo", "pt": "Cidade de Nishitokyo"},
    "調布市": {"en": "Chofu City", "zh": "调布市", "ko": "조후시", "vi": "Thành phố Chofu", "pt": "Cidade de Chofu"},
    "豊島区": {"en": "Toshima Ward", "zh": "丰岛区", "ko": "토시마구", "vi": "Quận Toshima", "pt": "Distrito de Toshima"},
    "足立区": {"en": "Adachi Ward", "zh": "足立区", "ko": "아다치구", "vi": "Quận Adachi", "pt": "Distrito de Adachi"},
    "青梅市": {"en": "Ome City", "zh": "青梅市", "ko": "오메시", "vi": "Thành phố Ome", "pt": "Cidade de Ome"}
}

LANGUAGES = {
    "en": {
        "code": "en", "locale": "en_US", "name": "English", "flag": "🇺🇸 English",
        "home_title": "Rakuten Mobile Switching Guide", "guide_link_text": "Foreigners SIM Guide",
        "bread_home": "Home", "tokyo_name": "Tokyo",
        "eyebrow_suffix": "Users",
        "h1_suffix": "<br>Before switching to Rakuten Mobile from</h1>",
        "title_suffix": " | Store Guide",
        "desc_template": "Check preparation and steps to switch from {carrier} to Rakuten Mobile keeping your phone number at {shop} ({district}).",
        "lead": "Check online preparation and required items before visiting a store. Clear step-by-step MNP guide to keep your phone number.",
        "cta_benefit_label": "When switching from another carrier", "cta_benefit_pts": "14,000 points",
        "cta_btn": "Check 14,000 Points Benefit →", "cta_sub": "Rakuten Employee Referral Campaign. Terms apply including application, activation, and Rakuten Link call.",
        "card_pill": "Store Info", "dt_address": "Address", "dt_carrier": "Current Carrier",
        "official_link": "Check latest info on official store page ↗", "official_sub": "Business hours, holidays, and services subject to change.",
        "conclusion_h2": "Bottom Line First",
        "conclusion_p1": "When applying for Rakuten Mobile online, MNP One-Stop allows you to switch without obtaining an MNP reservation number in advance.",
        "conclusion_p2": "Procedures vary depending on your contract status and application method. Please check screen instructions and official carrier info.",
        "nav_01": "What to Prepare", "nav_02": "About MNP", "nav_03": "Switching Steps", "nav_04": "Final Check",
        "sec1_label": "01 / PREPARATION", "sec1_h2": "What to Prepare Before Applying",
        "sec1_item1": "Identity Verification Document (Residence Card / Passport)",
        "sec1_item2": "Rakuten ID and Password",
        "sec1_item3": "Credit card, Debit card, or JP bank account details for payment",
        "sec1_item4": "Current phone number and contract owner name",
        "sec1_item5": "Compatible device and SIM lock status check",
        "sec1_aside_h3": "What to check with your current carrier",
        "sec1_aside_p1": "Check your current account contract details, ID, and PIN to make application smoother.",
        "sec1_aside_p2": "If you want to keep your carrier email, check mail porting service terms and deadlines on your official carrier site.",
        "sec2_label": "02 / MNP", "sec2_h2": "Things to Know About MNP Before Visiting a Store",
        "sec2_tag1": "Online Application", "sec2_h3_1": "MNP One-Stop",
        "sec2_p1": "When switching online between eligible carriers, you can complete the transfer directly from the application screen without obtaining an MNP reservation number.",
        "sec2_tag2": "In-Store / Manual", "sec2_h3_2": "Using MNP Reservation Number",
        "sec2_p2": "Depending on your contract or application method, an MNP reservation number may be required. Please apply promptly as reservation numbers expire.",
        "sec2_caution": "※ Once your Rakuten Mobile line is activated via MNP, your previous carrier line will generally be cancelled automatically. Remaining device installments may continue.",
        "sec3_label": "03 / STEPS", "sec3_h2": "Switching Steps for Users of",
        "sec3_step1_h3": "Log in to Referral Campaign", "sec3_step1_p": "Open referral link and log in with your Rakuten ID before applying. Check latest conditions.",
        "sec3_step2_h3": "Apply for Rakuten Mobile", "sec3_step2_p": "Select 'Transfer from another carrier (MNP)' to keep your phone number and enter subscriber info.",
        "sec3_step3_h3": "Proceed with MNP Transfer", "sec3_step3_p": "Follow screen instructions using MNP One-Stop or reservation number.",
        "sec3_step4_h3": "Receive SIM & Activate", "sec3_step4_p": "Set up SIM card or eSIM and verify signal switching and calling.",
        "sec3_step5_h3": "Complete Campaign Terms", "sec3_step5_p": "Make a 10s+ call on Rakuten Link app within the deadline to fulfill point bonus terms!",
        "sec4_label": "04 / FINAL CHECK", "sec4_h2": "Final Confirmation Before Switching",
        "sec4_card1_h3": "Coverage Area", "sec4_card1_p": "Check Rakuten Mobile signal coverage for your home, workplace, and school on the official site.",
        "sec4_card2_h3": "Device & Data Backup", "sec4_card2_p": "Verify phone compatibility and back up photos, contacts, and authentication apps.",
        "sec4_card3_h3": "Remaining Installments", "sec4_card3_p": "Check remaining phone device balances, carrier billing services, and family discount impacts.",
        "nearby_label": "NEARBY RAKUTEN MOBILE", "nearby_h2": "Nearby Rakuten Mobile Shops",
        "nearby_btn_map": "View route on Google Maps ↗", "nearby_btn_official": "Rakuten Mobile Official Store Page ↗",
        "nearby_disclaimer": "Distance is calculated in a straight line from store coordinates. Check Google Maps for actual travel time.",
        "related_h2": "Rakuten Mobile Shops in nearby areas", "related_official": "View all Rakuten Mobile stores on official site ↗",
        "final_eyebrow": "EMPLOYEE REFERRAL CAMPAIGN (CODE: 2162)",
        "final_h2": "Get 14,000 Points when switching from another carrier",
        "final_p": "Check eligibility conditions and point award timing, then log in with your Rakuten ID via the referral link to apply.",
        "final_btn": "Check 14,000 Points Benefit →",
        "footer_disclaimer_1": "This site is independently operated and is not an official site of any carrier or store.",
        "footer_disclaimer_2": "Includes referral links. Please verify latest conditions on official sites at time of application."
    },
    "zh": {
        "code": "zh", "locale": "zh_CN", "name": "中文", "flag": "🇨🇳 中文",
        "home_title": "乐天移动换网指南", "guide_link_text": "外国人办卡指南",
        "bread_home": "首页", "tokyo_name": "东京都",
        "eyebrow_suffix": "用户",
        "h1_suffix": "</span><br>转网至乐天移动前的确认事项</h1>",
        "title_suffix": " | 门店指南",
        "desc_template": "为您整理在 {shop}（{district}）将 {carrier} 电话号码转网至乐天移动的准备与步骤。",
        "lead": "前往门店前，确认可在网上办理的手续与准备材料。为您顺次第整理携号转网（MNP）的完整流程。",
        "cta_benefit_label": "从其他公司携号转网享", "cta_benefit_pts": "14,000 积分",
        "cta_btn": "查看 14,000 积分优惠 →", "cta_sub": "乐天员工推荐活动。需满足申请、开通及 Rakuten Link 通话等条件。",
        "card_pill": "门店信息", "dt_address": "地址", "dt_carrier": "当前通信公司",
        "official_link": "在门店官网查看最新信息 ↗", "official_sub": "营业时间、定期休息日及服务内容可能会有变更。",
        "conclusion_h2": "先说结论",
        "conclusion_p1": "通过网上申请乐天移动时，若支持 MNP One-Stop，无需提前开具 MNP 转出预约号即可办理。",
        "conclusion_p2": "具体手续因契约状况和办理方式而异，请核对页面提示与各大通信公司官方信息。",
        "nav_01": "准备材料", "nav_02": "MNP须知", "nav_03": "转网步骤", "nav_04": "最终确认",
        "sec1_label": "01 / PREPARATION", "sec1_h2": "申请前需要准备的材料",
        "sec1_item1": "身份证明文件（在留卡 / 护照）",
        "sec1_item2": "乐天 ID 和密码",
        "sec1_item3": "用于支付的信用卡、借记卡或银行账户信息",
        "sec1_item4": "目前使用的手机号码与契约者姓名",
        "sec1_item5": "确认适配机型与 SIM 卡解锁状态",
        "sec1_aside_h3": "原通信公司需确认事项",
        "sec1_aside_p1": "提前确认原公司的契约信息、账号及密码，可使办理过程更加顺畅。",
        "sec1_aside_p2": "若希望保留原运营商邮箱，请在原公司官网确认邮箱带走服务的条件与期限。",
        "sec2_label": "02 / MNP", "sec2_h2": "前往门店前需了解的 MNP 知识",
        "sec2_tag1": "网上申请", "sec2_h3_1": "MNP One-Stop 免预约号转网",
        "sec2_p1": "在支持的通信公司之间进行网上转网时，可以直接在乐天移动的申请页面完成转出手续，无需提前开具 MNP 预约号。",
        "sec2_tag2": "门店 / 部分手续", "sec2_h3_2": "使用 MNP 预约号办理",
        "sec2_p2": "根据契约状况或申请方式，可能需要开具预约号。预约号具有有效期限，开具后请尽早提交申请。",
        "sec2_caution": "※ 通过 MNP 开通乐天移动线路后，原运营商线路原则上会自动解约。手机分期余款可能需要继续支付。",
        "sec3_label": "03 / STEPS", "sec3_h2": "转网步骤：",
        "sec3_step1_h3": "登录推荐活动", "sec3_step1_p": "打开推荐链接，在申请前登录乐天 ID，确认最新优惠条件与期限。",
        "sec3_step2_h3": "申请乐天移动", "sec3_step2_p": "选择“他社携号转网（MNP）”，填写契约者个人信息。",
        "sec3_step3_h3": "办理 MNP 转出手续", "sec3_step3_p": "按照页面提示，使用 MNP One-Stop 或预约号完成转出手续。",
        "sec3_step4_h3": "接收 SIM 卡并开通", "sec3_step4_p": "设置 SIM 卡或 eSIM，完成线路切换并测试通话与网络。",
        "sec3_step5_h3": "完成活动领积分条件", "sec3_step5_p": "在规定期限内完成开通，并在 Rakuten Link 上打一次 10 秒以上电话！",
        "sec4_label": "04 / FINAL CHECK", "sec4_h2": "转网前的最终确认",
        "sec4_card1_h3": "信号覆盖区域", "sec4_card1_p": "在官网确认住宅、公司、学校等常用场所的乐天移动信号覆盖情况。",
        "sec4_card2_h3": "机型与数据备份", "sec4_card2_p": "确认手机适配情况，提前备份照片、联系人及身份验证 App 数据。",
        "sec4_card3_h3": "剩余未付账款", "sec4_card3_p": "确认手机分期余款、运营商代扣及家庭优惠等相关影响。",
        "nearby_label": "附近的乐天移动门店", "nearby_h2": "距离附近的乐天移动门店",
        "nearby_btn_map": "在 Google 地图上查看路线 ↗", "nearby_btn_official": "乐天移动官方门店页面 ↗",
        "nearby_disclaimer": "距离为根据两店官方坐标计算的直线距离。实际路线与时间请以 Google 地图为准。",
        "related_h2": "周边乐天移动门店", "related_official": "在官网查看乐天移动所有门店 ↗",
        "final_eyebrow": "EMPLOYEE REFERRAL CAMPAIGN (CODE: 2162)",
        "final_h2": "携号转网可享 14,000 乐天积分",
        "final_p": "请确认优惠条件与积分赠送时间，通过推荐链接登录乐天 ID 提交申请。",
        "final_btn": "查看 14,000 积分优惠 →",
        "footer_disclaimer_1": "本网站由个人独立运营，非各通信公司及门店官方网站。",
        "footer_disclaimer_2": "包含推荐链接。具体条件与信息请以办理时的官网为准。"
    },
    "ko": {
        "code": "ko", "locale": "ko_KR", "name": "한국어", "flag": "🇰🇷 한국어",
        "home_title": "라쿠텐 모바일 번호이동 가이드", "guide_link_text": "외국인 SIM 가이드",
        "bread_home": "홈", "tokyo_name": "도쿄도",
        "eyebrow_suffix": "이용 고객님께",
        "h1_suffix": "</span>에서<br>라쿠텐 모바일로 번호이동 전 확인사항</h1>",
        "title_suffix": " | 매장 가이드",
        "desc_template": "{district} {shop} 이용 고객님을 위해 {carrier}에서 라쿠텐 모바일로 전화번호를 유지하며 번호이동하는 절차를 안내합니다.",
        "lead": "매장 방문 전 온라인으로 처리할 수 있는 절차와 준비물을 확인하세요. 전화번호를 그대로 유지하는 MNP 흐름을 정리합니다.",
        "cta_benefit_label": "타사 번호이동 가입 시", "cta_benefit_pts": "14,000 포인트",
        "cta_btn": "14,000 포인트 혜택 확인하기 →", "cta_sub": "라쿠텐 임직원 소개 캠페인. 신청, 개통, Rakuten Link 통화 등 조건이 적용됩니다.",
        "card_pill": "매장 정보", "dt_address": "소재지", "dt_carrier": "현재 통신사",
        "official_link": "매장 공식 페이지에서 최신 정보 확인 ↗", "official_sub": "영업시간 및 정기휴무일은 변경될 수 있습니다.",
        "conclusion_h2": "결론부터 말씀드리면",
        "conclusion_p1": "라쿠텐 모바일을 온라인으로 신청할 때 MNP 원스톱을 이용하면 사전 MNP 예약번호 발급 없이 진행할 수 있습니다.",
        "conclusion_p2": "계약 상황 및 신청 방법에 따라 절차가 달라지므로 화면 안내와 통신사 공식 정보를 확인해 주세요.",
        "nav_01": "준비물", "nav_02": "MNP 안내", "nav_03": "개통 절차", "nav_04": "최종 확인",
        "sec1_label": "01 / PREPARATION", "sec1_h2": "신청 전 준비해야 할 서류",
        "sec1_item1": "본인 확인 서류 (재류카드 / 여권)",
        "sec1_item2": "라쿠텐 ID 및 비밀번호",
        "sec1_item3": "결제에 사용할 신용카드/체크카드 또는 계좌 정보",
        "sec1_item4": "현재 이용 중인 전화번호 및 계약자 성명",
        "sec1_item5": "호환 기기 및 SIM 락 해제 상태 확인",
        "sec1_aside_h3": "기존 통신사 확인사항",
        "sec1_aside_p1": "기존 통신사의 계약 정보와 ID, 비밀번호를 확인해 두시면 절차가 원활해집니다.",
        "sec1_aside_p2": "통신사 이메일을 유지하고 싶으신 경우 공식 사이트에서 이메일 이식 서비스 조건을 확인하세요.",
        "sec2_label": "02 / MNP", "sec2_h2": "매장 방문 전 알아두어야 할 MNP",
        "sec2_tag1": "온라인 신청", "sec2_h3_1": "MNP 원스톱 (예약번호 불필요)",
        "sec2_p1": "지원 통신사 간 온라인 번호이동 시 라쿠텐 모바일 신청 화면에서 해지 절차를 바로 진행할 수 있어 MNP 예약번호가 필요 없습니다.",
        "sec2_tag2": "매장 / 일부 절차", "sec2_h3_2": "MNP 예약번호 사용 방식",
        "sec2_p2": "계약 상황이나 신청 방법에 따라 예약번호가 필요할 수 있습니다. 유효기간이 있으므로 발급 후 신속히 신청해 주세요.",
        "sec2_caution": "※ MNP로 라쿠텐 모바일이 개통되면 기존 통신사 회선은 원칙적으로 자동 해지됩니다. 단말기 할부금은 계속 청구될 수 있습니다.",
        "sec3_label": "03 / STEPS", "sec3_h2": "이용 고객님의 번호이동 절차:",
        "sec3_step1_h3": "소개 캠페인 로그인", "sec3_step1_p": "소개 링크를 열고 신청 전 라쿠텐 ID로 로그인합니다. 최신 조건과 기한을 확인하세요.",
        "sec3_step2_h3": "라쿠텐 모바일 신청", "sec3_step2_p": "'타사 번호이동(MNP)'을 선택하고 계약자 정보를 입력합니다.",
        "sec3_step3_h3": "MNP 해지 절차 진행", "sec3_step3_p": "화면 안내에 따라 MNP 원스톱 또는 예약번호를 사용해 절차를 진행합니다.",
        "sec3_step4_h3": "SIM 수령 및 개통", "sec3_step4_p": "SIM 카드 또는 eSIM을 설정하고 회선 전환 및 통화/데이터를 확인합니다.",
        "sec3_step5_h3": "캠페인 조건 완료", "sec3_step5_p": "기한 내 개통 후 Rakuten Link 앱으로 10초 이상 통화하여 포인트 지급 조건을 달성하세요!",
        "sec4_label": "04 / FINAL CHECK", "sec4_h2": "번호이동 전 최종 확인",
        "sec4_card1_h3": "통신 커버리지 영역", "sec4_card1_p": "자택, 회사, 학교 등 자주 방문하는 장소의 라쿠텐 모바일 전파 상태를 공식 사이트에서 확인합니다.",
        "sec4_card2_h3": "기기 호환 & 데이터 백업", "sec4_card2_p": "이용 예정 기기의 지원 여부를 확인하고 사진, 연락처, 인증 앱 등을 백업합니다.",
        "sec4_card3_h3": "잔여 할부금 & 결제", "sec4_card3_p": "단말기 잔여 할부금, 통신사 결제, 가족 할인 등의 영향 요소를 확인합니다.",
        "nearby_label": "가까운 라쿠텐 모바일 매장", "nearby_h2": "가까운 라쿠텐 모바일 매장",
        "nearby_btn_map": "Google 지도로 경로 보기 ↗", "nearby_btn_official": "라쿠텐 모바일 공식 매장 페이지 ↗",
        "nearby_disclaimer": "거리 계산은 매장 좌표 기준 직선거리입니다. 실제 이동 시간은 Google 지도를 확인하세요.",
        "related_h2": "인근 라쿠텐 모바일 매장 목록", "related_official": "공식 사이트에서 라쿠텐 모바일 전체 매장 보기 ↗",
        "final_eyebrow": "EMPLOYEE REFERRAL CAMPAIGN (CODE: 2162)",
        "final_h2": "타사 번호이동으로 최대 14,000 포인트 증정",
        "final_p": "적용 조건과 포인트 지급 시기를 확인하신 후 소개 링크에서 라쿠텐 ID로 로그인하여 신청해 주세요.",
        "final_btn": "14,000 포인트 혜택 확인하기 →",
        "footer_disclaimer_1": "본 사이트는 개인이 운영하는 독립 안내 사이트입니다.",
        "footer_disclaimer_2": "포인트 및 계약 조건은 신청 시점의 라쿠텐 모바일 공식 홈페이지를 확인해 주세요."
    },
    "vi": {
        "code": "vi", "locale": "vi_VN", "name": "Tiếng Việt", "flag": "🇻🇳 Tiếng Việt",
        "home_title": "Hướng dẫn chuyển sang Rakuten Mobile", "guide_link_text": "Hướng dẫn người nước ngoài",
        "bread_home": "Trang chủ", "tokyo_name": "TP. Tokyo",
        "eyebrow_suffix": "Khách hàng",
        "h1_suffix": "</span><br>Trước khi chuyển sang Rakuten Mobile</h1>",
        "title_suffix": " | Hướng dẫn cửa hàng",
        "desc_template": "Hướng dẫn chuyển từ {carrier} sang Rakuten Mobile giữ nguyên số tại {shop} ({district}).",
        "lead": "Kiểm tra thủ tục online và giấy tờ cần chuẩn bị trước khi ra cửa hàng. Hướng dẫn quy trình MNP giữ nguyên số điện thoại.",
        "cta_benefit_label": "Chuyển mạng giữ số từ nhà mạng khác", "cta_benefit_pts": "14.000 điểm",
        "cta_btn": "Xem ưu đãi 14.000 điểm →", "cta_sub": "Chương trình Giới thiệu Nhân viên Rakuten. Có áp dụng điều kiện đăng ký, kích hoạt và cuộc gọi Rakuten Link.",
        "card_pill": "Thông tin Cửa hàng", "dt_address": "Địa chỉ", "dt_carrier": "Nhà mạng hiện tại",
        "official_link": "Xem thông tin mới nhất trên trang cửa hàng chính thức ↗", "official_sub": "Giờ làm việc, ngày nghỉ và dịch vụ có thể thay đổi.",
        "conclusion_h2": "Tóm tắt kết luận",
        "conclusion_p1": "Khi đăng ký Rakuten Mobile online, nếu dùng MNP One-Stop, bạn có thể chuyển mạng mà không cần lấy mã MNP trước.",
        "conclusion_p2": "Quy trình có thể khác nhau tùy theo hợp đồng hiện tại. Vui lòng kiểm tra hướng dẫn trên màn hình.",
        "nav_01": "Giấy tờ cần có", "nav_02": "Về MNP", "nav_03": "Các bước chuyển", "nav_04": "Kiểm tra cuối",
        "sec1_label": "01 / PREPARATION", "sec1_h2": "Giấy tờ cần chuẩn bị trước khi đăng ký",
        "sec1_item1": "Giấy tờ xác minh nhân thân (Thẻ ngoại kiều / Hộ chiếu)",
        "sec1_item2": "Tài khoản Rakuten ID & Mật khẩu",
        "sec1_item3": "Thẻ tín dụng, Thẻ ghi nợ hoặc Tài khoản ngân hàng Nhật",
        "sec1_item4": "Số điện thoại hiện tại và Tên người đứng tên hợp đồng",
        "sec1_item5": "Kiểm tra thiết bị tương thích & Trạng thái mở khóa SIM",
        "sec1_aside_h3": "Điều cần kiểm tra với nhà mạng cũ",
        "sec1_aside_p1": "Kiểm tra trước thông tin hợp đồng và tài khoản nhà mạng cũ để làm thủ tục nhanh chóng hơn.",
        "sec1_aside_p2": "Nếu muốn giữ email nhà mạng cũ, hãy tham khảo điều kiện giữ email trên trang web chính thức của nhà mạng cũ.",
        "sec2_label": "02 / MNP", "sec2_h2": "Những điều cần biết về MNP trước khi ra cửa hàng",
        "sec2_tag1": "Đăng ký Online", "sec2_h3_1": "MNP One-Stop (Không cần mã MNP)",
        "sec2_p1": "Khi chuyển mạng online giữa các nhà mạng hỗ trợ, bạn có thể thực hiện thủ tục trực tiếp trên màn hình đăng ký mà không cần mã MNP.",
        "sec2_tag2": "Tại cửa hàng / Thủ tục khác", "sec2_h3_2": "Dùng mã MNP truyền thống",
        "sec2_p2": "Tùy theo hợp đồng hoặc cách đăng ký, bạn có thể cần mã MNP. Mã MNP có hạn sử dụng nên hãy đăng ký ngay sau khi lấy.",
        "sec2_caution": "※ Khi SIM Rakuten Mobile kích hoạt thành công, hợp đồng với nhà mạng cũ sẽ tự động hủy. Tiền trả góp máy vẫn tiếp tục tính.",
        "sec3_label": "03 / STEPS", "sec3_h2": "Quy trình chuyển mạng cho khách hàng của",
        "sec3_step1_h3": "Đăng nhập Link giới thiệu", "sec3_step1_p": "Mở link giới thiệu và đăng nhập Rakuten ID trước khi làm hồ sơ. Kiểm tra hạn ưu đãi.",
        "sec3_step2_h3": "Đăng ký Rakuten Mobile", "sec3_step2_p": "Chọn 'Chuyển mạng giữ số (MNP)' và nhập thông tin người đứng tên.",
        "sec3_step3_h3": "Thực hiện thủ tục MNP", "sec3_step3_p": "Làm theo hướng dẫn trên màn hình dùng MNP One-Stop hoặc mã MNP.",
        "sec3_step4_h3": "Nhận SIM & Kích hoạt", "sec3_step4_p": "Cài đặt SIM/eSIM, chuyển đổi mạng và kiểm tra gọi điện, kết nối mạng.",
        "sec3_step5_h3": "Hoàn tất điều kiện nhận điểm", "sec3_step5_p": "Kích hoạt đúng hạn và thực hiện cuộc gọi 10s+ qua ứng dụng Rakuten Link để nhận điểm!",
        "sec4_label": "04 / FINAL CHECK", "sec4_h2": "Kiểm tra lần cuối trước khi chuyển mạng",
        "sec4_card1_h3": "Vùng phủ sóng", "sec4_card1_p": "Kiểm tra sóng Rakuten Mobile tại nhà, công ty, trường học trên bản đồ phủ sóng chính thức.",
        "sec4_card2_h3": "Thiết bị & Thẻ nhớ/Data", "sec4_card2_p": "Xác nhận điện thoại có tương thích và sao lưu hình ảnh, danh bạ, ứng dụng xác thực.",
        "sec4_card3_h3": "Trả góp còn lại", "sec4_card3_p": "Kiểm tra tiền trả góp máy còn lại, dịch vụ thanh toán qua sim và giảm giá gia đình.",
        "nearby_label": "CỬA HÀNG RAKUTEN MOBILE GẦN ĐÂY", "nearby_h2": "Cửa hàng Rakuten Mobile gần",
        "nearby_btn_map": "Xem đường đi trên Google Maps ↗", "nearby_btn_official": "Trang cửa hàng Rakuten Mobile chính thức ↗",
        "nearby_disclaimer": "Khoảng cách được tính theo đường chim bay. Xem thời gian di chuyển thực tế trên Google Maps.",
        "related_h2": "Các cửa hàng Rakuten Mobile lân cận", "related_official": "Xem tất cả cửa hàng Rakuten Mobile trên trang chính thức ↗",
        "final_eyebrow": "EMPLOYEE REFERRAL CAMPAIGN (CODE: 2162)",
        "final_h2": "Nhận 14.000 điểm khi chuyển mạng giữ số",
        "final_p": "Vui lòng kiểm tra điều kiện nhận điểm và đăng nhập Rakuten ID qua link giới thiệu để làm thủ tục.",
        "final_btn": "Xem ưu đãi 14.000 điểm →",
        "footer_disclaimer_1": "Trang web này được vận hành độc lập, không phải website chính thức của nhà mạng.",
        "footer_disclaimer_2": "Vui lòng kiểm tra lại điều kiện khuyến mãi tại website chính thức vào thời điểm đăng ký."
    },
    "pt": {
        "code": "pt", "locale": "pt_BR", "name": "Português", "flag": "🇧🇷 Português",
        "home_title": "Guia de Migração para Rakuten Mobile", "guide_link_text": "Guia para Estrangeiros",
        "bread_home": "Início", "tokyo_name": "Tóquio",
        "eyebrow_suffix": "Usuários",
        "h1_suffix": "</span><br>Antes de migrar para Rakuten Mobile</h1>",
        "title_suffix": " | Guia de Loja",
        "desc_template": "Guia para migrar da {carrier} para Rakuten Mobile mantendo seu número na {shop} ({district}).",
        "lead": "Confira os preparativos e documentos antes de ir à loja. Guia passo a passo para portabilidade MNP mantendo seu número.",
        "cta_benefit_label": "Portabilidade de outra operadora", "cta_benefit_pts": "14.000 pontos",
        "cta_btn": "Ver Bônus de 14.000 Pontos →", "cta_sub": "Campanha de Indicação de Funcionários Rakuten. Condições aplicáveis incluindo inscrição, ativação e chamada no Rakuten Link.",
        "card_pill": "Dados da Loja", "dt_address": "Endereço", "dt_carrier": "Operadora Atual",
        "official_link": "Ver informações atualizadas no site oficial da loja ↗", "official_sub": "Horários e atendimento sujeitos a alterações.",
        "conclusion_h2": "Resumo Direto",
        "conclusion_p1": "Ao solicitar a Rakuten Mobile online via MNP One-Stop, você pode fazer a portabilidade sem solicitar a senha MNP previamente.",
        "conclusion_p2": "Os procedimentos variam de acordo com o contrato atual. Verifique as instruções da tela.",
        "nav_01": "O que preparar", "nav_02": "Sobre MNP", "nav_03": "Passos da Migração", "nav_04": "Confirmação Final",
        "sec1_label": "01 / PREPARATION", "sec1_h2": "O que preparar antes de solicitar",
        "sec1_item1": "Documento de Identidade (Cartão de Residência / Passaporte)",
        "sec1_item2": "ID e Senha Membro Rakuten",
        "sec1_item3": "Cartão de crédito, débito ou dados da conta bancária japonesa",
        "sec1_item4": "Número de telefone atual e nome do titular do contrato",
        "sec1_item5": "Verificação de aparelho compatível e desbloqueio de SIM",
        "sec1_aside_h3": "O que conferir na operadora atual",
        "sec1_aside_p1": "Confira os dados do contrato, ID e senha da operadora atual para agilizar o processo.",
        "sec1_aside_p2": "Se desejar manter o e-mail da operadora, confira as condições de portabilidade de e-mail no site oficial.",
        "sec2_label": "02 / MNP", "sec2_h2": "O que saber sobre MNP antes de ir à loja",
        "sec2_tag1": "Inscrição Online", "sec2_h3_1": "MNP One-Stop (Sem senha MNP)",
        "sec2_p1": "Ao fazer portabilidade online entre operadoras elegíveis, você pode fazer a transferência diretamente na tela sem senha MNP.",
        "sec2_tag2": "Na loja / Presencial", "sec2_h3_2": "Usando Senha MNP",
        "sec2_p2": "Dependendo do contrato ou forma de inscrição, a senha MNP será necessária. Solicite logo pois ela possui validade.",
        "sec2_caution": "※ Assim que a linha Rakuten Mobile for ativada via MNP, a linha anterior será cancelada automaticamente. Aparelhos parcelados continuarão sendo cobrados.",
        "sec3_label": "03 / STEPS", "sec3_h2": "Passos para migração de clientes da",
        "sec3_step1_h3": "Acesse a Indicação", "sec3_step1_p": "Abra o link de indicação e faça login com seu ID Rakuten antes de solicitar.",
        "sec3_step2_h3": "Solicite a Rakuten Mobile", "sec3_step2_p": "Selecione 'Portabilidade (MNP)' para manter o número e preencha os dados.",
        "sec3_step3_h3": "Faça a Transferência MNP", "sec3_step3_p": "Siga as instruções da tela usando MNP One-Stop ou a senha MNP.",
        "sec3_step4_h3": "Receba o SIM e Ative", "sec3_step4_p": "Configure o SIM/eSIM e faça o teste de ligação e internet.",
        "sec3_step5_h3": "Conclua as Condições", "sec3_step5_p": "Faça uma chamada de 10s+ pelo app Rakuten Link dentro do prazo para garantir os pontos!",
        "sec4_label": "04 / FINAL CHECK", "sec4_h2": "Confirmação final antes de migrar",
        "sec4_card1_h3": "Área de Cobertura", "sec4_card1_p": "Confira a cobertura do sinal da Rakuten Mobile na sua casa, trabalho e escola no site oficial.",
        "sec4_card2_h3": "Aparelho & Backup", "sec4_card2_p": "Confira se o celular é compatível e faça backup de fotos, contatos e aplicativos de autenticação.",
        "sec4_card3_h3": "Cobranças Restantes", "sec4_card3_p": "Confira valores restantes do aparelho parcelado, serviços da operadora e descontos de família.",
        "nearby_label": "LOJAS RAKUTEN MOBILE PRÓXIMAS", "nearby_h2": "Lojas Rakuten Mobile próximas da",
        "nearby_dist_prefix": "Distância em linha reta aprox.", "nearby_btn_map": "Ver rota no Google Maps ↗",
        "nearby_btn_official": "Página Oficial da Loja Rakuten Mobile ↗",
        "nearby_disclaimer": "Distância calculada em linha reta a partir das coordenadas. Confira o tempo real de trajeto no Google Maps.",
        "related_h2": "Lojas Rakuten Mobile nas proximidades de", "related_official": "Ver todas as lojas Rakuten Mobile no site oficial ↗",
        "final_eyebrow": "EMPLOYEE REFERRAL CAMPAIGN (CODE: 2162)",
        "final_h2": "Ganhe 14.000 Pontos na portabilidade",
        "final_p": "Verifique as condições da campanha e acesse o link de indicação com seu ID Rakuten para solicitar.",
        "final_btn": "Ver Bônus de 14.000 Pontos →",
        "footer_disclaimer_1": "Este site é operado de forma independente e não é o site oficial de nenhuma operadora.",
        "footer_disclaimer_2": "Por favor, verifique as condições mais recentes no site oficial ao solicitar."
    }
}

# Text used by the shop-specific sections that were added after the first
# multilingual pass. Store names and postal addresses remain in their official
# Japanese notation so visitors can copy them into maps and carrier websites.
SHOP_PAGE_TEXT = {
    "en": {
        "title": "What to check before switching from {shop} ({district}) to Rakuten Mobile | Rakuten Mobile Switching Guide",
        "description": "A guide for {shop} users in {district}: preparation and steps to switch from {carrier} to Rakuten Mobile while keeping your phone number.",
        "in_language": "en",
        "topic_label": "LOCAL TOPICS",
        "hero_heading": "Before switching from<br><span>{shop}</span> to Rakuten Mobile",
        "steps_heading": "How to switch from {shop}",
        "topic_heading": "Latest Rakuten Mobile updates near {district}",
        "opened": "{name} is now open",
        "topic_body": "About {distance} km in a straight line from {shop}. You now have another nearby store where you can ask about Rakuten Mobile in person.",
        "topic_source": "Source: Rakuten Mobile official store information for “{name}”<br>Published: {date}",
        "topic_note": "Store information may change. This local update section does not contain links to external websites.",
        "distance": "Approx. {distance} km in a straight line",
        "nearby_heading": "Rakuten Mobile shops near {shop}",
        "map_title": "Map of {name}",
        "related_heading": "Rakuten Mobile shops near {district}",
        "related_meta": "{district} · approx. {distance} km in a straight line",
        "updated": "Information checked: {date}",
        "floating_label": "Switch from another carrier",
        "floating_points": "14,000 points",
        "floating_button": "View offer →",
    },
    "zh": {
        "title": "从{shop}（{district}）转网至乐天移动前的确认事项 | 乐天移动换网指南",
        "description": "面向{district}{shop}用户，介绍从{carrier}转网至乐天移动并保留原号码所需的准备与办理步骤。",
        "in_language": "zh-CN",
        "topic_label": "本地动态",
        "hero_heading": "从<span>{shop}</span><br>转网至乐天移动前的确认事项",
        "steps_heading": "从{shop}转网的办理步骤",
        "topic_heading": "{district}附近的乐天移动最新动态",
        "opened": "{name}现已开业",
        "topic_body": "距{shop}直线距离约{distance}公里。附近又多了一家可当面咨询乐天移动业务的门店。",
        "topic_source": "来源：乐天移动官网“{name} 门店信息”<br>发布日期：{date}",
        "topic_note": "门店信息可能随时变更。本地动态栏目不设置外部网站链接。",
        "distance": "直线距离约{distance}公里",
        "nearby_heading": "{shop}附近的乐天移动门店",
        "map_title": "{name}地图",
        "related_heading": "{district}附近的乐天移动门店",
        "related_meta": "{district} · 直线距离约{distance}公里",
        "updated": "信息确认日期：{date}",
        "floating_label": "从其他运营商转网",
        "floating_points": "14,000 积分",
        "floating_button": "查看优惠 →",
    },
    "ko": {
        "title": "{shop}({district})에서 라쿠텐 모바일로 번호이동 전 확인사항 | 라쿠텐 모바일 번호이동 가이드",
        "description": "{district}의 {shop} 이용자를 위해 {carrier}에서 전화번호를 유지한 채 라쿠텐 모바일로 번호이동하는 준비와 절차를 안내합니다.",
        "in_language": "ko",
        "topic_label": "지역 소식",
        "hero_heading": "<span>{shop}</span>에서<br>라쿠텐 모바일로 번호이동 전 확인사항",
        "steps_heading": "{shop} 이용자를 위한 번호이동 절차",
        "topic_heading": "{district} 주변 라쿠텐 모바일 최신 소식",
        "opened": "{name} 오픈",
        "topic_body": "{shop}에서 직선거리 약 {distance}km입니다. 가까운 곳에서 라쿠텐 모바일을 대면 상담할 수 있는 매장이 하나 더 늘었습니다.",
        "topic_source": "출처: 라쿠텐 모바일 공식 ‘{name} 매장 정보’<br>게시일: {date}",
        "topic_note": "매장 정보는 변경될 수 있습니다. 지역 소식에는 외부 사이트 링크를 제공하지 않습니다.",
        "distance": "직선거리 약 {distance}km",
        "nearby_heading": "{shop} 근처 라쿠텐 모바일 매장",
        "map_title": "{name} 지도",
        "related_heading": "{district} 주변 라쿠텐 모바일 매장",
        "related_meta": "{district} · 직선거리 약 {distance}km",
        "updated": "정보 확인일: {date}",
        "floating_label": "타사에서 번호이동 시",
        "floating_points": "14,000 포인트",
        "floating_button": "혜택 확인 →",
    },
    "vi": {
        "title": "Điều cần kiểm tra trước khi chuyển từ {shop} ({district}) sang Rakuten Mobile | Hướng dẫn chuyển mạng",
        "description": "Hướng dẫn dành cho người dùng {shop} tại {district}: chuẩn bị và các bước chuyển từ {carrier} sang Rakuten Mobile mà vẫn giữ số điện thoại.",
        "in_language": "vi",
        "topic_label": "TIN ĐỊA PHƯƠNG",
        "hero_heading": "Trước khi chuyển từ<br><span>{shop}</span> sang Rakuten Mobile",
        "steps_heading": "Các bước chuyển mạng từ {shop}",
        "topic_heading": "Tin mới nhất về Rakuten Mobile gần {district}",
        "opened": "{name} đã khai trương",
        "topic_body": "Cách {shop} khoảng {distance} km theo đường chim bay. Bạn có thêm một cửa hàng gần đó để được tư vấn trực tiếp về Rakuten Mobile.",
        "topic_source": "Nguồn: Thông tin cửa hàng chính thức của Rakuten Mobile “{name}”<br>Ngày đăng: {date}",
        "topic_note": "Thông tin cửa hàng có thể thay đổi. Mục tin địa phương này không đặt liên kết đến trang bên ngoài.",
        "distance": "Khoảng {distance} km theo đường chim bay",
        "nearby_heading": "Cửa hàng Rakuten Mobile gần {shop}",
        "map_title": "Bản đồ {name}",
        "related_heading": "Cửa hàng Rakuten Mobile gần {district}",
        "related_meta": "{district} · khoảng {distance} km theo đường chim bay",
        "updated": "Ngày kiểm tra thông tin: {date}",
        "floating_label": "Chuyển mạng giữ số",
        "floating_points": "14.000 điểm",
        "floating_button": "Xem ưu đãi →",
    },
    "pt": {
        "title": "O que verificar antes de mudar da {shop} ({district}) para a Rakuten Mobile | Guia de Migração",
        "description": "Guia para clientes da {shop} em {district}: preparação e etapas para mudar da {carrier} para a Rakuten Mobile mantendo o número.",
        "in_language": "pt-BR",
        "topic_label": "NOVIDADES LOCAIS",
        "hero_heading": "Antes de mudar da<br><span>{shop}</span> para a Rakuten Mobile",
        "steps_heading": "Como mudar da {shop}",
        "topic_heading": "Novidades da Rakuten Mobile perto de {district}",
        "opened": "{name} foi inaugurada",
        "topic_body": "A cerca de {distance} km em linha reta da {shop}. Agora há mais uma loja próxima para consultar pessoalmente sobre a Rakuten Mobile.",
        "topic_source": "Fonte: Informações oficiais da loja “{name}” da Rakuten Mobile<br>Publicado em: {date}",
        "topic_note": "As informações da loja podem mudar. Esta seção de novidades locais não contém links para sites externos.",
        "distance": "Distância em linha reta de aprox. {distance} km",
        "nearby_heading": "Lojas Rakuten Mobile perto da {shop}",
        "map_title": "Mapa da {name}",
        "related_heading": "Lojas Rakuten Mobile perto de {district}",
        "related_meta": "{district} · aprox. {distance} km em linha reta",
        "updated": "Informações verificadas em: {date}",
        "floating_label": "Portabilidade de outra operadora",
        "floating_points": "14.000 pontos",
        "floating_button": "Ver oferta →",
    },
}

AREA_INDEX_TEXT = {
    "en": {"title": "Mobile shops in {area}: switching to Rakuten Mobile | Store Guide", "desc": "Find carrier shops in {area} and check what to prepare before switching to Rakuten Mobile.", "hero": "Before switching to Rakuten Mobile<br><span>from a carrier shop in {area}</span>", "lead": "Choose your current carrier shop to review MNP preparation and switching steps.", "listed": "Listed stores", "filter": "Filter stores", "shown": "stores shown", "search": "Search by store or city", "placeholder": "e.g. city or store name", "all": "All", "unit": "stores", "coverage": "Check Rakuten Mobile coverage by municipality in {area} ↗"},
    "zh": {"title": "{area}手机门店转网至乐天移动 | 门店指南", "desc": "查找{area}的通信运营商门店，并确认转网至乐天移动前需要准备的事项。", "hero": "从{area}的通信运营商门店<br><span>转网至乐天移动前的确认事项</span>", "lead": "请选择目前使用的门店，确认携号转网准备事项与办理步骤。", "listed": "收录门店", "filter": "筛选门店", "shown": "家门店", "search": "按门店或城市搜索", "placeholder": "例如：城市或门店名称", "all": "全部", "unit": "家", "coverage": "按市区町村查看{area}的乐天移动信号覆盖 ↗"},
    "ko": {"title": "{area} 휴대폰 매장에서 라쿠텐 모바일로 번호이동 | 매장 가이드", "desc": "{area}의 통신사 매장을 찾아 라쿠텐 모바일 번호이동 전 준비사항을 확인하세요.", "hero": "{area} 통신사 매장에서<br><span>라쿠텐 모바일로 번호이동하기 전에</span>", "lead": "현재 이용 중인 매장을 선택하여 MNP 준비사항과 번호이동 절차를 확인하세요.", "listed": "등록 매장", "filter": "매장 검색", "shown": "개 매장 표시", "search": "매장명 또는 도시로 검색", "placeholder": "예: 도시 또는 매장명", "all": "전체", "unit": "개", "coverage": "{area}의 라쿠텐 모바일 통신 상태를 지역별로 확인 ↗"},
    "vi": {"title": "Cửa hàng di động tại {area}: chuyển sang Rakuten Mobile | Hướng dẫn", "desc": "Tìm cửa hàng nhà mạng tại {area} và kiểm tra những điều cần chuẩn bị trước khi chuyển sang Rakuten Mobile.", "hero": "Trước khi chuyển sang Rakuten Mobile<br><span>từ cửa hàng nhà mạng tại {area}</span>", "lead": "Chọn cửa hàng hiện tại để xem các bước chuẩn bị và chuyển mạng giữ số MNP.", "listed": "Cửa hàng", "filter": "Lọc cửa hàng", "shown": "cửa hàng hiển thị", "search": "Tìm theo cửa hàng hoặc thành phố", "placeholder": "Ví dụ: thành phố hoặc tên cửa hàng", "all": "Tất cả", "unit": "cửa hàng", "coverage": "Kiểm tra vùng phủ sóng Rakuten Mobile theo địa phương tại {area} ↗"},
    "pt": {"title": "Lojas de celular em {area}: migração para Rakuten Mobile | Guia", "desc": "Encontre lojas de operadoras em {area} e veja o que preparar antes de mudar para a Rakuten Mobile.", "hero": "Antes de mudar para a Rakuten Mobile<br><span>em uma loja de operadora de {area}</span>", "lead": "Escolha a loja da sua operadora atual para conferir a preparação e os passos da portabilidade MNP.", "listed": "Lojas listadas", "filter": "Filtrar lojas", "shown": "lojas exibidas", "search": "Buscar por loja ou cidade", "placeholder": "Ex.: cidade ou nome da loja", "all": "Todas", "unit": "lojas", "coverage": "Verifique o sinal da Rakuten Mobile por município em {area} ↗"},
}

def normalized_date(value):
    match = re.fullmatch(r'(\d{4})年(\d{1,2})月(\d{1,2})日', value.strip())
    if match:
        year, month, day = match.groups()
        return f'{year}-{int(month):02d}-{int(day):02d}'
    return value

def localized_name(japanese_name):
    return NAME_READINGS["names"].get(japanese_name, japanese_name)

def localized_locality(japanese_locality, lang_code):
    if japanese_locality in TOKYO_DISTRICTS_MAP:
        return TOKYO_DISTRICTS_MAP[japanese_locality].get(lang_code, japanese_locality)
    reading = NAME_READINGS["localities"].get(japanese_locality, japanese_locality)
    suffixes = {
        "en": [(" Shi", " City"), (" Ku", " Ward"), (" Machi", " Town"), (" Cho", " Town"), (" Mura", " Village")],
        "zh": [(" Shi", "市"), (" Ku", "区"), (" Machi", "町"), (" Cho", "町"), (" Mura", "村")],
        "ko": [(" Shi", "시"), (" Ku", "구"), (" Machi", "정"), (" Cho", "정"), (" Mura", "촌")],
        "vi": [(" Shi", " City"), (" Ku", " Ward"), (" Machi", " Town"), (" Cho", " Town"), (" Mura", " Village")],
        "pt": [(" Shi", ""), (" Ku", ""), (" Machi", ""), (" Cho", ""), (" Mura", "")],
    }
    for source, target in suffixes[lang_code]:
        if reading.endswith(source):
            return reading[:-len(source)] + target
    return reading

def bilingual_markup(japanese_name):
    reading = localized_name(japanese_name)
    return f'<span class="localized-shop-name">{reading}</span><small class="official-shop-name" lang="ja">{japanese_name}</small>'

def translate_shop_content(ja_content, area, lang_code, t):
    content = ja_content
    page_text = SHOP_PAGE_TEXT[lang_code]
    identity_match = re.search(
        r'<p class="eyebrow">([^・<]+)・([^<]+)をご利用の方へ</p>.*?'
        r'<h1><span>(.*?)</span>から<br>楽天モバイルへ乗り換える前に</h1>',
        content,
        flags=re.DOTALL,
    )
    if not identity_match:
        raise ValueError("Could not identify shop page content")

    district_ja, carrier, shop_name = identity_match.groups()
    district = localized_locality(district_ja, lang_code)
    shop_reading = localized_name(shop_name)
    translated_title = page_text["title"].format(shop=shop_reading, district=district, carrier=carrier)
    translated_description = page_text["description"].format(shop=shop_reading, district=district, carrier=carrier)
    ja_path_match = re.search(rf'<link rel="canonical" href="https://rm-referral\.maffun\.workers\.dev(/{area}/[^\"]+)">', content)
    if not ja_path_match:
        raise ValueError("Could not identify canonical shop path")
    localized_url = f'https://rm-referral.maffun.workers.dev/{lang_code}{ja_path_match.group(1)}'

    content = re.sub(r'<html lang="ja">', f'<html lang="{lang_code}">', content)
    content = re.sub(r'<meta property="og:locale" content=".*?">', f'<meta property="og:locale" content="{t["locale"]}">', content)
    content = re.sub(r'<title>.*?</title>', f'<title>{translated_title}</title>', content, count=1)
    content = re.sub(r'<meta name="description" content=".*?">', f'<meta name="description" content="{translated_description}">', content, count=1)
    content = re.sub(r'<link rel="canonical" href=".*?">', f'<link rel="canonical" href="{localized_url}">', content, count=1)
    content = re.sub(r'<meta property="og:title" content=".*?">', f'<meta property="og:title" content="{translated_title}">', content, count=1)
    content = re.sub(r'<meta property="og:description" content=".*?">', f'<meta property="og:description" content="{translated_description}">', content, count=1)
    content = re.sub(r'<meta property="og:url" content=".*?">', f'<meta property="og:url" content="{localized_url}">', content, count=1)

    def translate_schema(match):
        data = json.loads(match.group(1))
        if data.get("@type") == "WebPage":
            data.update({
                "name": translated_title,
                "description": translated_description,
                "url": localized_url,
                "inLanguage": page_text["in_language"],
            })
        elif data.get("@type") == "BreadcrumbList":
            items = data.get("itemListElement", [])
            if len(items) >= 3:
                items[0].update({"name": t["bread_home"], "item": f"https://rm-referral.maffun.workers.dev/{lang_code}/"})
                items[1].update({"name": PREFECTURES[area][lang_code], "item": f"https://rm-referral.maffun.workers.dev/{lang_code}/{area}/"})
                items[2]["name"] = f'{shop_reading} ({shop_name})'
                items[2]["item"] = localized_url
        return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + '</script>'

    content = re.sub(r'<script type="application/ld\+json">(.*?)</script>', translate_schema, content)

    # Eyebrow & Headline District replacement
    content = content.replace(f'<p class="eyebrow">{district_ja}・', f'<p class="eyebrow">{district} · ')

    content = content.replace('をご利用の方へ</p>', f' {t["eyebrow_suffix"]}</p>')
    
    content = re.sub(
        r'<h1><span>.*?</span>から<br>楽天モバイルへ乗り換える前に</h1>',
        f'<h1>{page_text["hero_heading"].format(shop=shop_reading)}<small class="official-shop-name" lang="ja">{shop_name}</small></h1>',
        content,
        count=1,
    )

    # Breadcrumbs
    content = content.replace('aria-label="パンくずリスト"', f'aria-label="Breadcrumb"')
    content = content.replace('<a href="/">トップ</a>', f'<a href="/{lang_code}/">{t["bread_home"]}</a>')
    content = re.sub(
        rf'<a href="/{area}/">.*?</a>',
        f'<a href="/{lang_code}/{area}/">{PREFECTURES[area][lang_code]}</a>',
        content,
        count=1,
    )
    content = content.replace(f'<span>{shop_name}</span>', f'<span>{shop_reading} ({shop_name})</span>', 1)

    # Hero Lead & Buttons
    content = content.replace('<p class="lead">店舗へ行く前に、オンラインでできる手続きと準備するものを確認。電話番号を引き継ぐMNPの流れを、順番に整理します。</p>', f'<p class="lead">{t["lead"]}</p>')
    content = content.replace('<div class="cta-benefit"><span>他社から乗り換えなら</span><strong>14,000<small>ポイント</small></strong></div>', f'<div class="cta-benefit"><span>{t["cta_benefit_label"]}</span><strong>{t["cta_benefit_pts"]}</strong></div>')
    content = content.replace('14,000ポイント特典を確認する <span aria-hidden="true">→</span>', f'{t["cta_btn"]}')
    content = content.replace('<p class="small">楽天従業員紹介キャンペーン。適用には申し込み・利用開始・Rakuten Link通話などの条件があります。</p>', f'<p class="small">{t["cta_sub"]}</p>')

    # Card Table
    content = content.replace('<p class="pill">掲載店舗情報</p>', f'<p class="pill">{t["card_pill"]}</p>')
    content = content.replace(f'<aside class="shop-card">\n        <p class="pill">{t["card_pill"]}</p>\n        <h2>{shop_name}</h2>', f'<aside class="shop-card">\n        <p class="pill">{t["card_pill"]}</p>\n        <h2>{bilingual_markup(shop_name)}</h2>')
    content = content.replace('<dt>所在地</dt>', f'<dt>{t["dt_address"]}</dt>')
    content = content.replace('<dt>現在の通信会社</dt>', f'<dt>{t["dt_carrier"]}</dt>')
    content = content.replace('店舗公式ページで最新情報を確認 <span>↗</span>', f'{t["official_link"]}')
    content = content.replace('<p class="small">営業時間・定休日・受付内容は変更される場合があります。</p>', f'<p class="small">{t["official_sub"]}</p>')

    # Conclusion Answer Band
    content = content.replace('<h2>先に結論</h2>', f'<h2>{t["conclusion_h2"]}</h2>')
    content = content.replace('<p><strong>楽天モバイルをオンラインで申し込む場合、MNPワンストップを利用できれば、MNP予約番号を事前に発行せず進められます。</strong></p>', f'<p><strong>{t["conclusion_p1"]}</strong></p>')
    content = content.replace('<p>契約状況や申込方法によって手続きが異なるため、画面の案内と各社の公式情報を確認してください。</p>', f'<p>{t["conclusion_p2"]}</p>')

    # Section Nav
    content = content.replace('aria-label="ページ内メニュー"', 'aria-label="Section Navigation"')
    content = content.replace('<b>01</b><span>準備するもの</span>', f'<b>01</b><span>{t["nav_01"]}</span>')
    content = content.replace('<b>02</b><span>MNPの考え方</span>', f'<b>02</b><span>{t["nav_02"]}</span>')
    content = content.replace('<b>03</b><span>乗り換え手順</span>', f'<b>03</b><span>{t["nav_03"]}</span>')
    content = content.replace('<b>04</b><span>最終確認</span>', f'<b>04</b><span>{t["nav_04"]}</span>')

    # Section 1: Preparation
    content = content.replace('<p class="section-label">01 / PREPARATION</p>', f'<p class="section-label">{t["sec1_label"]}</p>')
    content = content.replace('<h2>申し込み前に準備するもの</h2>', f'<h2>{t["sec1_h2"]}</h2>')
    content = content.replace('<li>本人確認書類</li>', f'<li>{t["sec1_item1"]}</li>')
    content = content.replace('<li>楽天IDとパスワード</li>', f'<li>{t["sec1_item2"]}</li>')
    content = content.replace('<li>支払いに使うカードまたは口座情報</li>', f'<li>{t["sec1_item3"]}</li>')
    content = content.replace('<li>現在利用中の電話番号と契約名義</li>', f'<li>{t["sec1_item4"]}</li>')
    content = content.replace('<li>対応端末・SIMロック状態の確認</li>', f'<li>{t["sec1_item5"]}</li>')

    content = re.sub(
        r'<aside class="note-card">\s*<h3>.*?側で確認しておくこと</h3>\s*<p>.*?</p>\s*<p>.*?</p>\s*</aside>',
        '<aside class="note-card">\n'
        f'          <h3>{t["sec1_aside_h3"]}</h3>\n'
        f'          <p>{t["sec1_aside_p1"]}</p>\n'
        f'          <p>{t["sec1_aside_p2"]}</p>\n'
        '        </aside>',
        content,
        flags=re.DOTALL,
    )

    # Section 2: MNP
    content = content.replace('<p class="section-label">02 / MNP</p>', f'<p class="section-label">{t["sec2_label"]}</p>')
    content = content.replace('<h2>店舗へ行く前に知っておきたいMNP</h2>', f'<h2>{t["sec2_h2"]}</h2>')
    content = content.replace('<p class="tag">オンライン申込</p>', f'<p class="tag">{t["sec2_tag1"]}</p>')
    content = content.replace('<h3>MNPワンストップ</h3>', f'<h3>{t["sec2_h3_1"]}</h3>')
    content = content.replace('<p>対応する通信会社間のオンライン手続きでは、乗り換え先の申込画面から転出手続きを進められます。MNP予約番号が不要になる場合があります。</p>', f'<p>{t["sec2_p1"]}</p>')
    content = content.replace('<p class="tag">店舗・一部手続き</p>', f'<p class="tag">{t["sec2_tag2"]}</p>')
    content = content.replace('<h3>MNP予約番号を使う方法</h3>', f'<h3>{t["sec2_h3_2"]}</h3>')
    content = content.replace('<p>契約状況や申込方法によっては予約番号が必要です。有効期限があるため、発行後は早めに申し込みを進めます。</p>', f'<p>{t["sec2_p2"]}</p>')
    content = content.replace('<p class="caution">※ MNPで楽天モバイルの回線が開通すると、原則として乗り換え元の対象回線は解約されます。端末の分割残債や付帯サービスは別に残る場合があります。</p>', f'<p class="caution">{t["sec2_caution"]}</p>')

    # Section 3: Steps
    content = content.replace('<p class="section-label">03 / STEPS</p>', f'<p class="section-label">{t["sec3_label"]}</p>')
    content = re.sub(
        r'<h2>.*?を利用中の方の乗り換え手順</h2>',
        f'<h2>{page_text["steps_heading"].format(shop=shop_reading)}<small class="official-shop-name" lang="ja">{shop_name}</small></h2>',
        content,
        count=1,
    )
    content = content.replace('<h3>紹介キャンペーンへログイン</h3>', f'<h3>{t["sec3_step1_h3"]}</h3>')
    content = content.replace('<p>紹介リンクを開き、申し込み前に楽天IDでログインします。最新の対象条件と期限を確認してください。</p>', f'<p>{t["sec3_step1_p"]}</p>')
    content = content.replace('<h3>楽天モバイルを申し込む</h3>', f'<h3>{t["sec3_step2_h3"]}</h3>')
    content = content.replace('<p>電話番号を引き継ぐ場合は「他社から乗り換え（MNP）」を選び、契約者情報を入力します。</p>', f'<p>{t["sec3_step2_p"]}</p>')
    content = content.replace('<h3>MNP転出手続きを進める</h3>', f'<h3>{t["sec3_step3_h3"]}</h3>')
    content = content.replace('<p>申込画面の案内に沿って、MNPワンストップまたは予約番号を使った手続きを行います。</p>', f'<p>{t["sec3_step3_p"]}</p>')
    content = content.replace('<h3>SIMを受け取り、開通する</h3>', f'<h3>{t["sec3_step4_h3"]}</h3>')
    content = content.replace('<p>SIMカードまたはeSIMを設定し、回線切り替えと通話・通信の確認を行います。</p>', f'<p>{t["sec3_step4_p"]}</p>')
    content = content.replace('<h3>キャンペーン条件を完了する</h3>', f'<h3>{t["sec3_step5_h3"]}</h3>')
    content = content.replace('<p>期限内の開通やRakuten Linkでの通話など、申し込み時点の条件を忘れずに達成します。</p>', f'<p>{t["sec3_step5_p"]}</p>')

    # Section 4: Final Check
    content = content.replace('<p class="section-label">04 / FINAL CHECK</p>', f'<p class="section-label">{t["sec4_label"]}</p>')
    content = content.replace('<h2>乗り換え前の最終確認</h2>', f'<h2>{t["sec4_h2"]}</h2>')
    content = content.replace('<h3>対応エリア</h3>', f'<h3>{t["sec4_card1_h3"]}</h3>')
    content = content.replace('<p>自宅・勤務先・通学先など、よく使う場所の楽天モバイル通信エリアを公式サイトで確認します。</p>', f'<p>{t["sec4_card1_p"]}</p>')
    content = content.replace('<h3>端末とデータ</h3>', f'<h3>{t["sec4_card2_h3"]}</h3>')
    content = content.replace('<p>利用予定端末の対応状況を確認し、写真や連絡先、認証アプリなどをバックアップします。</p>', f'<p>{t["sec4_card2_p"]}</p>')
    content = content.replace('<h3>残る支払い</h3>', f'<h3>{t["sec4_card3_h3"]}</h3>')
    content = content.replace('<p>端末代の分割残債、キャリア決済、家族割やセット割への影響を確認します。</p>', f'<p>{t["sec4_card3_p"]}</p>')

    # Nearby Shop & Buttons
    content = content.replace('<p class="section-label">NEARBY RAKUTEN MOBILE</p>', f'<p class="section-label">{t["nearby_label"]}</p>')
    content = content.replace('Googleマップで経路を見る <span aria-hidden="true">↗</span>', f'{t["nearby_btn_map"]}')
    content = content.replace('楽天モバイル公式店舗ページ <span>↗</span>', f'{t["nearby_btn_official"]}')
    content = content.replace('<p class="small">距離は両店舗の公式座標から算出した直線距離です。実際の移動距離・時間はGoogleマップで確認してください。</p>', f'<p class="small">{t["nearby_disclaimer"]}</p>')
    content = content.replace('楽天モバイルの全店舗を公式サイトで見る ↗', f'{t["related_official"]}')

    # Local updates and shop-specific nearby information.
    content = content.replace('<p class="section-label">LOCAL TOPICS</p>', f'<p class="section-label">{page_text["topic_label"]}</p>')
    content = re.sub(
        r'<h2 id="local-topics-heading">.*?周辺の楽天モバイル最新トピック</h2>',
        f'<h2 id="local-topics-heading">{page_text["topic_heading"].format(district=district)}</h2>',
        content,
    )
    content = re.sub(
        r'<time datetime="([^"]+)">.*?</time>',
        lambda m: f'<time datetime="{m.group(1)}">{m.group(1)}</time>',
        content,
    )
    content = re.sub(
        r'<h3>(.*?)がオープン</h3>',
        lambda m: f'<h3>{page_text["opened"].format(name=localized_name(m.group(1)))}<small class="official-shop-name" lang="ja">{m.group(1)}</small></h3>',
        content,
    )
    content = re.sub(
        r'<p>(.*?)から直線距離約([0-9.]+)km。近隣で楽天モバイルを対面相談できる店舗の選択肢が増えました。</p>',
        lambda m: f'<p>{page_text["topic_body"].format(shop=localized_name(m.group(1)), distance=m.group(2))}</p>',
        content,
    )
    content = re.sub(
        r'<p class="local-topic-source">元情報：楽天モバイル公式「(.*?) 店舗情報」<br>公開日：([^<]+)</p>',
        lambda m: f'<p class="local-topic-source">{page_text["topic_source"].format(name=f"{localized_name(m.group(1))} ({m.group(1)})", date=normalized_date(m.group(2)))}</p>',
        content,
    )
    content = content.replace(
        '<p class="topic-source">店舗情報は閲覧時点で変更される場合があります。地域トピックから外部サイトへのリンクは設置していません。</p>',
        f'<p class="topic-source">{page_text["topic_note"]}</p>',
    )
    content = re.sub(
        r'<p class="pill">直線距離 約([0-9.]+)km</p>',
        lambda m: f'<p class="pill">{page_text["distance"].format(distance=m.group(1))}</p>',
        content,
    )
    content = re.sub(
        r'<h2>.*?から近い楽天モバイルショップ</h2>',
        f'<h2>{page_text["nearby_heading"].format(shop=shop_reading)}<small class="official-shop-name" lang="ja">{shop_name}</small></h2>',
        content,
    )
    content = re.sub(
        r'<iframe class="shop-map" title="(.*?)の地図"',
        lambda m: f'<iframe class="shop-map" title="{page_text["map_title"].format(name=localized_name(m.group(1)))}"',
        content,
    )
    content = re.sub(
        r'<section class="related-section">\s*<h2>.*?周辺の楽天モバイルショップ</h2>',
        f'<section class="related-section">\n      <h2>{page_text["related_heading"].format(district=district)}</h2>',
        content,
    )
    content = re.sub(
        r'<span class="shop-link-meta">([^<・]+)・直線距離 約([0-9.]+)km</span>',
        lambda m: f'<span class="shop-link-meta">{page_text["related_meta"].format(district=localized_locality(m.group(1), lang_code), distance=m.group(2))}</span>',
        content,
    )
    content = re.sub(
        r'<div class="nearby-shop-card">([\s\S]*?)<h3>(.*?)</h3>',
        lambda m: f'<div class="nearby-shop-card">{m.group(1)}<h3>{bilingual_markup(m.group(2))}</h3>',
        content,
        count=1,
    )
    content = re.sub(
        r'<span class="shop-link-name">(.*?)</span>',
        lambda m: f'<span class="shop-link-name">{bilingual_markup(m.group(1))}</span>',
        content,
    )

    # Final CTA & Footer
    content = content.replace('<p class="eyebrow">楽天従業員紹介キャンペーン</p>', f'<p class="eyebrow">{t["final_eyebrow"]}</p>')
    content = content.replace('<h2>他社から乗り換えで<br>14,000ポイント</h2>', f'<h2>{t["final_h2"]}</h2>')
    content = content.replace('<p>適用条件やポイント進呈時期を確認し、紹介リンクから楽天IDでログインして申し込みへ進んでください。</p>', f'<p>{t["final_p"]}</p>')
    content = content.replace('<p>当サイトは個人が運営しており、各通信会社および掲載店舗の公式サイトではありません。</p>', f'<p>{t["footer_disclaimer_1"]}</p>')
    content = content.replace('<p>当サイトには紹介リンクが含まれます。条件や店舗情報は、申し込み時点の各公式サイトでご確認ください。</p>', f'<p>{t["footer_disclaimer_2"]}</p>')
    content = content.replace('<p><strong>楽天モバイル乗り換えガイド</strong></p>', f'<p><strong>{t["home_title"]}</strong></p>')
    content = re.sub(
        r'<p class="updated">情報確認日：([^<]+)</p>',
        lambda m: f'<p class="updated">{page_text["updated"].format(date=m.group(1))}</p>',
        content,
    )
    content = re.sub(
        r'<aside class="floating-cta" data-floating-cta aria-hidden="true">\s*'
        r'<p><span>他社から乗り換えで</span><strong>14,000ポイント</strong></p>\s*'
        r'<a ([^>]+)>特典を確認する <span aria-hidden="true">→</span></a>',
        lambda m: '<aside class="floating-cta" data-floating-cta aria-hidden="true">\n'
        f'      <p><span>{page_text["floating_label"]}</span><strong>{page_text["floating_points"]}</strong></p>\n'
        f'      <a {m.group(1)}>{page_text["floating_button"]}</a>',
        content,
    )

    return content

def translate_area_index(area, lang_code, t):
    source_file = os.path.join(BASE_DIR, area, "index.html")
    with open(source_file, encoding="utf-8") as file:
        content = file.read()
    text = AREA_INDEX_TEXT[lang_code]
    area_name = PREFECTURES[area][lang_code]
    title = text["title"].format(area=area_name)
    description = text["desc"].format(area=area_name)
    url = f'https://rm-referral.maffun.workers.dev/{lang_code}/{area}/'
    count = len([p for p in glob.glob(f'{BASE_DIR}/{area}/*/*/index.html') if f'{os.sep}coverage{os.sep}' not in p])

    content = content.replace('<html lang="ja">', f'<html lang="{lang_code}">')
    content = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', content, count=1)
    content = re.sub(r'<meta name="description" content=".*?">', f'<meta name="description" content="{description}">', content, count=1)
    content = re.sub(r'<link rel="canonical" href=".*?">', f'<link rel="canonical" href="{url}">', content, count=1)
    content = re.sub(r'<meta property="og:locale" content=".*?">', f'<meta property="og:locale" content="{t["locale"]}">', content, count=1)
    content = re.sub(r'<meta property="og:title" content=".*?">', f'<meta property="og:title" content="{title}">', content, count=1)
    content = re.sub(r'<meta property="og:description" content=".*?">', f'<meta property="og:description" content="{description}">', content, count=1)
    content = re.sub(r'<meta property="og:url" content=".*?">', f'<meta property="og:url" content="{url}">', content, count=1)
    alternates = "\n".join(
        [f'  <link rel="alternate" hreflang="ja" href="https://rm-referral.maffun.workers.dev/{area}/">'] +
        [f'  <link rel="alternate" hreflang="{code}" href="https://rm-referral.maffun.workers.dev/{code}/{area}/">' for code in LANGUAGES]
    )
    content = re.sub(r'\s*<link rel="alternate" hreflang="(?:ja|en|zh|ko|vi|pt)"[^>]*>', '', content)
    content = re.sub(r'(<link rel="canonical"[^>]*>)', rf'\1\n{alternates}', content, count=1)

    def update_schema(match):
        data = json.loads(match.group(1))
        data.update({"name": title, "description": description, "url": url, "inLanguage": SHOP_PAGE_TEXT[lang_code]["in_language"]})
        return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + '</script>'
    content = re.sub(r'<script type="application/ld\+json">(.*?)</script>', update_schema, content)

    selector = f'''<div class="lang-selector-wrap"><select class="lang-selector" onchange="if(this.value) location.href=this.value;" aria-label="Language">
      <option value="/{area}/">🇯🇵 日本語</option>
      <option value="/en/{area}/" {"selected" if lang_code == "en" else ""}>🇺🇸 English</option>
      <option value="/zh/{area}/" {"selected" if lang_code == "zh" else ""}>🇨🇳 中文</option>
      <option value="/ko/{area}/" {"selected" if lang_code == "ko" else ""}>🇰🇷 한국어</option>
      <option value="/vi/{area}/" {"selected" if lang_code == "vi" else ""}>🇻🇳 Tiếng Việt</option>
      <option value="/pt/{area}/" {"selected" if lang_code == "pt" else ""}>🇧🇷 Português</option>
    </select></div>'''
    header = f'''<header class="site-header"><a class="site-name" href="/{lang_code}/">{t["home_title"]}</a><div style="display:flex;align-items:center;gap:16px;"><a class="header-link" href="/{lang_code}/guide/foreigners/">{t["guide_link_text"]}</a><a class="header-link" href="/{lang_code}/{area}/">{area_name}</a>{selector}</div></header>'''
    content = re.sub(r'<header class="site-header">.*?</header>', header, content, flags=re.DOTALL)
    content = re.sub(r'<nav class="breadcrumb".*?</nav>', f'<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/{lang_code}/">{t["bread_home"]}</a><span>›</span><span>{area_name}</span></nav>', content, count=1, flags=re.DOTALL)
    content = re.sub(r'<h1>.*?</h1>', f'<h1>{text["hero"].format(area=area_name)}</h1>', content, count=1, flags=re.DOTALL)
    content = re.sub(r'<p class="lead">.*?</p>', f'<p class="lead">{text["lead"]}</p>', content, count=1, flags=re.DOTALL)
    content = re.sub(r'<div class="count-row"><div><strong>\d+</strong><span>.*?</span></div>', f'<div class="count-row"><div><strong>{count}</strong><span>{text["listed"]}</span></div>', content, count=1)
    content = re.sub(r'<a class="coverage-index-link".*?</a>', f'<a class="coverage-index-link" href="/{area}/coverage/" target="_blank" rel="noopener">{text["coverage"].format(area=area_name)}</a>', content, count=1)
    content = content.replace('<h2>店舗を絞り込む</h2>', f'<h2>{text["filter"]}</h2>')
    content = re.sub(r'(<strong data-result-count>\d+</strong>)店舗を表示', rf'\1{text["shown"]}', content)
    content = content.replace('<span>店舗名・市区町村から検索</span>', f'<span>{text["search"]}</span>')
    content = re.sub(r'placeholder="[^"]+"', f'placeholder="{text["placeholder"]}"', content, count=1)
    content = re.sub(r'(<button type="button" data-carrier-filter="all"[^>]*>).*?(<small>)', rf'\1{text["all"]} \2', content, count=1)
    content = content.replace('<small>店舗</small>', f'<small>{text["unit"]}</small>')
    content = re.sub(r'<summary><span>(.*?)</span>', lambda m: f'<summary><span>{localized_locality(m.group(1), lang_code)}</span>', content)
    content = re.sub(r'<span class="shop-link-name">(.*?)<em ', lambda m: f'<span class="shop-link-name">{bilingual_markup(m.group(1))}<em ', content)
    content = re.sub(r'<span class="shop-link-meta">(.*?)</span>', lambda m: f'<span class="shop-link-meta">{localized_locality(m.group(1), lang_code)}</span>', content)
    content = re.sub(r'href="/' + area + r'/((?:au|docomo|softbank|uqmobile|ymobile|aeonmobile)/)', f'href="/{lang_code}/{area}/\\1', content)
    content = content.replace('>ドコモ<', '>docomo<').replace('>ソフトバンク<', '>SoftBank<').replace('>イオンモバイル<', '>AEON Mobile<')
    content = content.replace('<p><strong>楽天モバイル乗り換えガイド</strong></p>', f'<p><strong>{t["home_title"]}</strong></p>')
    content = content.replace('<p>当サイトは個人が運営しており、各通信会社および掲載店舗の公式サイトではありません。</p>', f'<p>{t["footer_disclaimer_1"]}</p>')
    content = content.replace('<p>当サイトには紹介リンクが含まれます。条件や店舗情報は、申し込み時点の各公式サイトでご確認ください。</p>', f'<p>{t["footer_disclaimer_2"]}</p>')
    return content

def run():
    print("Translating full body text for all Kanto shop pages...")
    ja_shop_files = []
    for area in KANTO_AREAS:
        ja_shop_files.extend(
            path for path in glob.glob(f"{BASE_DIR}/{area}/*/*/index.html")
            if f"{os.sep}coverage{os.sep}" not in path
        )

    total_translated = 0

    for filepath in ja_shop_files:
        rel_path = os.path.relpath(filepath, BASE_DIR)
        area = rel_path.split(os.sep)[0]
        with open(filepath, "r", encoding="utf-8") as f:
            ja_content = f.read()

        page_path = "/" + rel_path.replace("index.html", "")
        ja_alternates = "\n".join(
            [f'  <link rel="alternate" hreflang="ja" href="https://rm-referral.maffun.workers.dev{page_path}">'] +
            [f'  <link rel="alternate" hreflang="{code}" href="https://rm-referral.maffun.workers.dev/{code}{page_path}">' for code in LANGUAGES]
        )
        ja_content = re.sub(r'\s*<link rel="alternate" hreflang="(?:ja|en|zh|ko|vi|pt)"[^>]*>', '', ja_content)
        ja_content = re.sub(r'(<link rel="canonical"[^>]*>)', rf'\1\n{ja_alternates}', ja_content, count=1)
        ja_selector = f'''<div class="lang-selector-wrap">
        <select class="lang-selector" onchange="if(this.value) location.href=this.value;" aria-label="Language">
          <option value="{page_path}" selected>🇯🇵 日本語</option>
          <option value="/en{page_path}">🇺🇸 English</option>
          <option value="/zh{page_path}">🇨🇳 中文</option>
          <option value="/ko{page_path}">🇰🇷 한국어</option>
          <option value="/vi{page_path}">🇻🇳 Tiếng Việt</option>
          <option value="/pt{page_path}">🇧🇷 Português</option>
        </select>
      </div>'''
        ja_content = re.sub(r'<div class="lang-selector-wrap">.*?</div>', ja_selector, ja_content, count=1, flags=re.DOTALL)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(ja_content)

        for lang_code, t in LANGUAGES.items():
            out_file = os.path.join(BASE_DIR, lang_code, rel_path)
            os.makedirs(os.path.dirname(out_file), exist_ok=True)
            translated_html = translate_shop_content(ja_content, area, lang_code, t)

            alternates = "\n".join(
                [f'  <link rel="alternate" hreflang="ja" href="https://rm-referral.maffun.workers.dev{page_path}">'] +
                [f'  <link rel="alternate" hreflang="{code}" href="https://rm-referral.maffun.workers.dev/{code}{page_path}">' for code in LANGUAGES]
            )
            translated_html = re.sub(r'\s*<link rel="alternate" hreflang="(?:ja|en|zh|ko|vi|pt)"[^>]*>', '', translated_html)
            translated_html = re.sub(r'(<link rel="canonical"[^>]*>)', rf'\1\n{alternates}', translated_html, count=1)
                
            # Header link & lang selector update
            lang_selector_html = f'''      <div class="lang-selector-wrap">
        <select class="lang-selector" onchange="if(this.value) location.href=this.value;" aria-label="Language">
          <option value="/{rel_path.replace('index.html', '')}">🇯🇵 日本語</option>
          <option value="/en/{rel_path.replace('index.html', '')}" {"selected" if lang_code == "en" else ""}>🇺🇸 English</option>
          <option value="/zh/{rel_path.replace('index.html', '')}" {"selected" if lang_code == "zh" else ""}>🇨🇳 中文</option>
          <option value="/ko/{rel_path.replace('index.html', '')}" {"selected" if lang_code == "ko" else ""}>🇰🇷 한국어</option>
          <option value="/vi/{rel_path.replace('index.html', '')}" {"selected" if lang_code == "vi" else ""}>🇻🇳 Tiếng Việt</option>
          <option value="/pt/{rel_path.replace('index.html', '')}" {"selected" if lang_code == "pt" else ""}>🇧🇷 Português</option>
        </select>
      </div>'''

            header_lang = f'''  <header class="site-header">
    <a class="site-name" href="/{lang_code}/">{t["home_title"]}</a>
    <div style="display:flex;align-items:center;gap:16px;">
      <a class="header-link" href="/{lang_code}/guide/foreigners/">{t["guide_link_text"]}</a>
      <a class="header-link" href="/{lang_code}/{area}/">{PREFECTURES[area][lang_code]}</a>
{lang_selector_html}
    </div>
  </header>'''

            translated_html = re.sub(r'<header class="site-header">.*?</header>', header_lang, translated_html, flags=re.DOTALL)

            with open(out_file, "w", encoding="utf-8") as f:
                f.write(translated_html)
            total_translated += 1

    for area in KANTO_AREAS:
        for lang_code, t in LANGUAGES.items():
            out_file = os.path.join(BASE_DIR, lang_code, area, "index.html")
            os.makedirs(os.path.dirname(out_file), exist_ok=True)
            with open(out_file, "w", encoding="utf-8") as file:
                file.write(translate_area_index(area, lang_code, t))

    print(f"Successfully translated body content for {total_translated} shop pages!")

if __name__ == "__main__":
    run()
