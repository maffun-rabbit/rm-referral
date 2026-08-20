#!/usr/bin/env python3
import os
import re
import glob

BASE_DIR = "/Users/masayuki/Library/CloudStorage/GoogleDrive-maffun@gmail.com/マイドライブ/AI自動整理メモ/10_Projects/RMリファラル/cloudflare-site"

LANGUAGES = {
    "en": {
        "code": "en", "locale": "en_US", "name": "English", "flag": "🇺🇸 English",
        "home_title": "Rakuten Mobile Switching Guide", "guide_link_text": "Foreigners SIM Guide",
        "bread_home": "Home", "tokyo_name": "Tokyo",
        "eyebrow_suffix": "Users", "h1_before": "Before switching to Rakuten Mobile from",
        "cta_benefit_label": "When switching from another carrier", "cta_benefit_pts": "14,000 points",
        "cta_btn": "Check 14,000 Points Benefit →", "cta_sub": "Rakuten Employee Referral Campaign. Conditions apply.",
        "card_pill": "Store Info", "dt_address": "Address", "dt_carrier": "Current Carrier",
        "official_link": "Check latest info on official store page ↗", "official_sub": "Business hours and services subject to change.",
        "conclusion_h2": "Bottom Line First", "conclusion_p1": "When applying for Rakuten Mobile online, MNP One-Stop allows you to switch without obtaining an MNP reservation number in advance.",
        "conclusion_p2": "Procedures vary depending on your contract status and application method. Please check screen instructions and carrier official info.",
        "nav_01": "What to Prepare", "nav_02": "About MNP", "nav_03": "Switching Steps", "nav_04": "Final Check",
        "sec1_label": "01 / PREPARATION", "sec1_h2": "What to Prepare Before Applying",
        "sec1_item1": "Identity Verification Document (Residence Card / Passport)",
        "sec1_item2": "Rakuten ID and Password",
        "sec1_item3": "Credit card, Debit card, or JP bank account details for payment",
        "sec1_item4": "Current phone number and contract owner name",
        "sec1_item5": "Compatible device and SIM lock status check",
        "sec2_label": "02 / MNP", "sec2_h2": "Things to Know About MNP Before Visiting a Store",
        "sec3_label": "03 / STEPS", "sec3_h2": "Switching Steps for Users of",
        "sec4_label": "04 / FINAL CHECK", "sec4_h2": "Final Confirmation Before Switching",
        "final_eyebrow": "EMPLOYEE REFERRAL CAMPAIGN (CODE: 2162)",
        "final_h2": "Get 14,000 Points when switching from another carrier",
        "final_p": "Check eligibility conditions and point award timing, then log in with your Rakuten ID via the referral link to apply.",
        "final_btn": "Check 14,000 Points Benefit →", "footer_disclaimer_1": "This site is independently operated and is not an official site of any carrier or store.",
        "footer_disclaimer_2": "Includes referral links. Please verify latest conditions on official sites at time of application."
    },
    "zh": {
        "code": "zh", "locale": "zh_CN", "name": "中文", "flag": "🇨🇳 中文",
        "home_title": "乐天移动换网指南", "guide_link_text": "外国人办卡指南",
        "bread_home": "首页", "tokyo_name": "东京都",
        "eyebrow_suffix": "用户", "h1_before": "从",
        "cta_benefit_label": "从其他公司携号转网可享", "cta_benefit_pts": "14,000 积分",
        "cta_btn": "查看 14,000 积分优惠 →", "cta_sub": "乐天员工推荐活动。适用条件请参照官方说明。",
        "card_pill": "门店信息", "dt_address": "地址", "dt_carrier": "当前通信公司",
        "official_link": "在门店官网查看最新信息 ↗", "official_sub": "营业时间与服务内容可能会有变更。",
        "conclusion_h2": "先说结论", "conclusion_p1": "通过网上申请乐天移动时，若支持 MNP One-Stop，无需提前开具 MNP 转出预约号即可办理。",
        "conclusion_p2": "具体手续因契约状况和办理方式而异，请核对页面提示与各大通信公司官方信息。",
        "nav_01": "准备材料", "nav_02": "MNP须知", "nav_03": "转网步骤", "nav_04": "最终确认",
        "sec1_label": "01 / PREPARATION", "sec1_h2": "申请前需要准备的材料",
        "sec1_item1": "身份证明文件（在留卡 / 护照）",
        "sec1_item2": "乐天 ID 和密码",
        "sec1_item3": "用于支付的信用卡、借记卡或银行账户信息",
        "sec1_item4": "目前使用的手机号码与契约者姓名",
        "sec1_item5": "确认适配机型与 SIM 卡解锁状态",
        "sec2_label": "02 / MNP", "sec2_h2": "前往门店前需了解的 MNP 知识",
        "sec3_label": "03 / STEPS", "sec3_h2": "用户转网步骤：",
        "sec4_label": "04 / FINAL CHECK", "sec4_h2": "转网前的最终确认",
        "final_eyebrow": "EMPLOYEE REFERRAL CAMPAIGN (CODE: 2162)",
        "final_h2": "携号转网可享 14,000 乐天积分",
        "final_p": "请确认优惠条件与积分赠送时间，通过推荐链接登录乐天 ID 提交申请。",
        "final_btn": "查看 14,000 积分优惠 →", "footer_disclaimer_1": "本网站由个人独立运营，非各通信公司及门店官方网站。",
        "footer_disclaimer_2": "包含推荐链接。具体条件与信息请以办理时的官网为准。"
    },
    "ko": {
        "code": "ko", "locale": "ko_KR", "name": "한국어", "flag": "🇰🇷 한국어",
        "home_title": "라쿠텐 모바일 번호이동 가이드", "guide_link_text": "외국인 SIM 가이드",
        "bread_home": "홈", "tokyo_name": "도쿄도",
        "eyebrow_suffix": "이용 고객님께", "h1_before": "",
        "cta_benefit_label": "타사 번호이동 가입 시", "cta_benefit_pts": "14,000 포인트",
        "cta_btn": "14,000 포인트 혜택 확인하기 →", "cta_sub": "라쿠텐 임직원 소개 캠페인. 개통 및 이용 조건이 적용됩니다.",
        "card_pill": "매장 정보", "dt_address": "소재지", "dt_carrier": "현재 통신사",
        "official_link": "매장 공식 페이지에서 최신 정보 확인 ↗", "official_sub": "영업시간 및 정기휴무일은 변경될 수 있습니다.",
        "conclusion_h2": "결론부터 말씀드리면", "conclusion_p1": "라쿠텐 모바일을 온라인으로 신청할 때 MNP 원스톱을 이용하면 사전 MNP 예약번호 발급 없이 진행할 수 있습니다.",
        "conclusion_p2": "계약 상황 및 신청 방법에 따라 절차가 달라지므로 화면 안내와 통신사 공식 정보를 확인해 주세요.",
        "nav_01": "준비물", "nav_02": "MNP 안내", "nav_03": "개통 절차", "nav_04": "최종 확인",
        "sec1_label": "01 / PREPARATION", "sec1_h2": "신청 전 준비해야 할 서류",
        "sec1_item1": "본인 확인 서류 (재류카드 / 여권)",
        "sec1_item2": "라쿠텐 ID 및 비밀번호",
        "sec1_item3": "결제에 사용할 신용카드/체크카드 또는 계좌 정보",
        "sec1_item4": "현재 이용 중인 전화번호 및 계약자 성명",
        "sec1_item5": "호환 기기 및 SIM 락 해제 상태 확인",
        "sec2_label": "02 / MNP", "sec2_h2": "매장 방문 전 알아두어야 할 MNP",
        "sec3_label": "03 / STEPS", "sec3_h2": "이용 고객님의 번호이동 절차:",
        "sec4_label": "04 / FINAL CHECK", "sec4_h2": "번호이동 전 최종 확인",
        "final_eyebrow": "EMPLOYEE REFERRAL CAMPAIGN (CODE: 2162)",
        "final_h2": "타사 번호이동으로 최대 14,000 포인트 증정",
        "final_p": "적용 조건과 포인트 지급 시기를 확인하신 후 소개 링크에서 라쿠텐 ID로 로그인하여 신청해 주세요.",
        "final_btn": "14,000 포인트 혜택 확인하기 →", "footer_disclaimer_1": "본 사이트는 개인이 운영하는 독립 안내 사이트입니다.",
        "footer_disclaimer_2": "포인트 및 계약 조건은 신청 시점의 라쿠텐 모바일 공식 홈페이지를 확인해 주세요."
    },
    "vi": {
        "code": "vi", "locale": "vi_VN", "name": "Tiếng Việt", "flag": "🇻🇳 Tiếng Việt",
        "home_title": "Hướng dẫn chuyển sang Rakuten Mobile", "guide_link_text": "Hướng dẫn người nước ngoài",
        "bread_home": "Trang chủ", "tokyo_name": "TP. Tokyo",
        "eyebrow_suffix": "Khách hàng", "h1_before": "Trước khi chuyển sang Rakuten Mobile từ",
        "cta_benefit_label": "Chuyển mạng giữ số từ nhà mạng khác", "cta_benefit_pts": "14.000 điểm",
        "cta_btn": "Xem ưu đãi 14.000 điểm →", "cta_sub": "Chương trình Giới thiệu Nhân viên Rakuten. Có áp dụng điều kiện.",
        "card_pill": "Thông tin Cửa hàng", "dt_address": "Địa chỉ", "dt_carrier": "Nhà mạng hiện tại",
        "official_link": "Xem thông tin mới nhất trên trang cửa hàng chính thức ↗", "official_sub": "Giờ làm việc và dịch vụ có thể thay đổi.",
        "conclusion_h2": "Tóm tắt kết luận", "conclusion_p1": "Khi đăng ký Rakuten Mobile online, nếu dùng MNP One-Stop, bạn có thể chuyển mạng mà không cần lấy mã MNP trước.",
        "conclusion_p2": "Quy trình có thể khác nhau tùy theo hợp đồng hiện tại. Vui lòng kiểm tra hướng dẫn trên màn hình.",
        "nav_01": "Giấy tờ cần có", "nav_02": "Về MNP", "nav_03": "Các bước chuyển", "nav_04": "Kiểm tra cuối",
        "sec1_label": "01 / PREPARATION", "sec1_h2": "Giấy tờ cần chuẩn bị trước khi đăng ký",
        "sec1_item1": "Giấy tờ xác minh nhân thân (Thẻ ngoại kiều / Hộ chiếu)",
        "sec1_item2": "Tài khoản Rakuten ID & Mật khẩu",
        "sec1_item3": "Thẻ tín dụng, Thẻ ghi nợ hoặc Tài khoản ngân hàng Nhật",
        "sec1_item4": "Số điện thoại hiện tại và Tên người đứng tên hợp đồng",
        "sec1_item5": "Kiểm tra thiết bị tương thích & Trạng thái mở khóa SIM",
        "sec2_label": "02 / MNP", "sec2_h2": "Những điều cần biết về MNP trước khi ra cửa hàng",
        "sec3_label": "03 / STEPS", "sec3_h2": "Quy trình chuyển mạng cho khách hàng của",
        "sec4_label": "04 / FINAL CHECK", "sec4_h2": "Kiểm tra lần cuối trước khi chuyển mạng",
        "final_eyebrow": "EMPLOYEE REFERRAL CAMPAIGN (CODE: 2162)",
        "final_h2": "Nhận 14.000 điểm khi chuyển mạng giữ số",
        "final_p": "Vui lòng kiểm tra điều kiện nhận điểm và đăng nhập Rakuten ID qua link giới thiệu để làm thủ tục.",
        "final_btn": "Xem ưu đãi 14.000 điểm →", "footer_disclaimer_1": "Trang web này được vận hành độc lập, không phải website chính thức của nhà mạng.",
        "footer_disclaimer_2": "Vui lòng kiểm tra lại điều kiện khuyến mãi tại website chính thức vào thời điểm đăng ký."
    },
    "pt": {
        "code": "pt", "locale": "pt_BR", "name": "Português", "flag": "🇧🇷 Português",
        "home_title": "Guia de Migração para Rakuten Mobile", "guide_link_text": "Guia para Estrangeiros",
        "bread_home": "Início", "tokyo_name": "Tóquio",
        "eyebrow_suffix": "Usuários", "h1_before": "Antes de migrar para Rakuten Mobile da",
        "cta_benefit_label": "Portabilidade de outra operadora", "cta_benefit_pts": "14.000 pontos",
        "cta_btn": "Ver Bônus de 14.000 Pontos →", "cta_sub": "Campanha de Indicação de Funcionários Rakuten. Condições aplicáveis.",
        "card_pill": "Dados da Loja", "dt_address": "Endereço", "dt_carrier": "Operadora Atual",
        "official_link": "Ver informações atualizadas no site oficial da loja ↗", "official_sub": "Horários e atendimento sujeitos a alterações.",
        "conclusion_h2": "Resumo Direto", "conclusion_p1": "Ao solicitar a Rakuten Mobile online via MNP One-Stop, você pode fazer a portabilidade sem solicitar a senha MNP previamente.",
        "conclusion_p2": "Os procedimentos variam de acordo com o contrato atual. Verifique as instruções da tela.",
        "nav_01": "O que preparar", "nav_02": "Sobre MNP", "nav_03": "Passos da Migração", "nav_04": "Confirmação Final",
        "sec1_label": "01 / PREPARATION", "sec1_h2": "O que preparar antes de solicitar",
        "sec1_item1": "Documento de Identidade (Cartão de Residência / Passaporte)",
        "sec1_item2": "ID e Senha Membro Rakuten",
        "sec1_item3": "Cartão de crédito, débito ou dados da conta bancária japonesa",
        "sec1_item4": "Número de telefone atual e nome do titular do contrato",
        "sec1_item5": "Verificação de aparelho compatível e desbloqueio de SIM",
        "sec2_label": "02 / MNP", "sec2_h2": "O que saber sobre MNP antes de ir à loja",
        "sec3_label": "03 / STEPS", "sec3_h2": "Passos para migração de clientes da",
        "sec4_label": "04 / FINAL CHECK", "sec4_h2": "Confirmação final antes de migrar",
        "final_eyebrow": "EMPLOYEE REFERRAL CAMPAIGN (CODE: 2162)",
        "final_h2": "Ganhe 14.000 Pontos na portabilidade",
        "final_p": "Verifique as condições da campanha e acesse o link de indicação com seu ID Rakuten para solicitar.",
        "final_btn": "Ver Bônus de 14.000 Pontos →", "footer_disclaimer_1": "Este site é operado de forma independente e não é o site oficial de nenhuma operadora.",
        "footer_disclaimer_2": "Por favor, verifique as condições mais recentes no site oficial ao solicitar."
    }
}

def generate_shop_pages():
    print("Generating translated Tokyo shop pages for all 5 foreign languages...")
    ja_shop_files = glob.glob(f"{BASE_DIR}/tokyo/*/*/index.html")
    print(f"Found {len(ja_shop_files)} Japanese Tokyo shop pages.")

    total_created = 0

    for filepath in ja_shop_files:
        rel_path = os.path.relpath(filepath, BASE_DIR) # e.g. tokyo/au/au-shop-akiruno/index.html
        with open(filepath, "r", encoding="utf-8") as f:
            ja_content = f.read()

        # Update Japanese shop page header lang selector
        ja_lang_selector = f'''      <div class="lang-selector-wrap">
        <select class="lang-selector" onchange="if(this.value) location.href=this.value;" aria-label="Language">
          <option value="/{rel_path.replace('index.html', '')}" selected>🇯🇵 日本語</option>
          <option value="/en/{rel_path.replace('index.html', '')}">🇺🇸 English</option>
          <option value="/zh/{rel_path.replace('index.html', '')}">🇨🇳 中文</option>
          <option value="/ko/{rel_path.replace('index.html', '')}">🇰🇷 한국어</option>
          <option value="/vi/{rel_path.replace('index.html', '')}">🇻🇳 Tiếng Việt</option>
          <option value="/pt/{rel_path.replace('index.html', '')}">🇧🇷 Português</option>
        </select>
      </div>'''

        ja_header = f'''  <header class="site-header">
    <a class="site-name" href="/">楽天モバイル乗り換えガイド</a>
    <div style="display:flex;align-items:center;gap:16px;">
      <a class="header-link" href="/en/guide/foreigners/">SIM Guide for Foreigners</a>
      <a class="header-link" href="/tokyo/">東京の店舗一覧</a>
{ja_lang_selector}
    </div>
  </header>'''

        ja_content_updated = re.sub(r'<header class="site-header">.*?</header>', ja_header, ja_content, flags=re.DOTALL)
        
        # Add hreflang links to Japanese page
        hreflangs_ja = f'''  <link rel="canonical" href="https://rm-referral.maffun.workers.dev/{rel_path.replace('index.html', '')}">
  <link rel="alternate" hreflang="ja" href="https://rm-referral.maffun.workers.dev/{rel_path.replace('index.html', '')}">
  <link rel="alternate" hreflang="en" href="https://rm-referral.maffun.workers.dev/en/{rel_path.replace('index.html', '')}">
  <link rel="alternate" hreflang="zh" href="https://rm-referral.maffun.workers.dev/zh/{rel_path.replace('index.html', '')}">
  <link rel="alternate" hreflang="ko" href="https://rm-referral.maffun.workers.dev/ko/{rel_path.replace('index.html', '')}">
  <link rel="alternate" hreflang="vi" href="https://rm-referral.maffun.workers.dev/vi/{rel_path.replace('index.html', '')}">
  <link rel="alternate" hreflang="pt" href="https://rm-referral.maffun.workers.dev/pt/{rel_path.replace('index.html', '')}">'''

        ja_content_updated = re.sub(r'<link rel="canonical" href=".*?">', hreflangs_ja, ja_content_updated)

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(ja_content_updated)

        # Now generate the 5 foreign language versions!
        for lang_code, t in LANGUAGES.items():
            out_dir = os.path.join(BASE_DIR, lang_code, os.path.dirname(rel_path))
            os.makedirs(out_dir, exist_ok=True)
            out_file = os.path.join(out_dir, "index.html")

            shop_url = f"/{lang_code}/{rel_path.replace('index.html', '')}"

            content = ja_content_updated
            content = re.sub(r'<html lang="ja">', f'<html lang="{lang_code}">', content)
            content = re.sub(r'<meta property="og:locale" content=".*?">', f'<meta property="og:locale" content="{t["locale"]}">', content)
            content = re.sub(r'<link rel="canonical" href=".*?">', f'<link rel="canonical" href="https://rm-referral.maffun.workers.dev{shop_url}">', content)

            # Update site header & lang selector
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
      <a class="header-link" href="/{lang_code}/tokyo/">{t["tokyo_name"]}</a>
{lang_selector_html}
    </div>
  </header>'''

            content = re.sub(r'<header class="site-header">.*?</header>', header_lang, content, flags=re.DOTALL)

            # Update breadcrumbs
            content = content.replace('<a href="/">トップ</a>', f'<a href="/{lang_code}/">{t["bread_home"]}</a>')
            content = content.replace('<a href="/tokyo/">東京</a>', f'<a href="/{lang_code}/tokyo/">{t["tokyo_name"]}</a>')

            with open(out_file, "w", encoding="utf-8") as f:
                f.write(content)
            total_created += 1

    print(f"Successfully generated {total_created} shop pages across 5 foreign languages!")

if __name__ == "__main__":
    generate_shop_pages()
