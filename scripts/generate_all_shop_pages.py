#!/usr/bin/env python3
import os
import re
import glob

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PREFECTURES_MAP = {
    "hokkaido": {"name_ja": "北海道", "en": "Hokkaido", "zh": "北海道", "ko": "홋카이도", "vi": "Hokkaido", "pt": "Hokkaido"},
    "aomori": {"name_ja": "青森県", "en": "Aomori", "zh": "青森县", "ko": "아오모리현", "vi": "Tỉnh Aomori", "pt": "Aomori"},
    "iwate": {"name_ja": "岩手県", "en": "Iwate", "zh": "岩手县", "ko": "이와테현", "vi": "Tỉnh Iwate", "pt": "Iwate"},
    "miyagi": {"name_ja": "宮城県", "en": "Miyagi", "zh": "宫城县", "ko": "미야기현", "vi": "Tỉnh Miyagi", "pt": "Miyagi"},
    "akita": {"name_ja": "秋田県", "en": "Akita", "zh": "秋田县", "ko": "아키타현", "vi": "Tỉnh Akita", "pt": "Akita"},
    "yamagata": {"name_ja": "山形県", "en": "Yamagata", "zh": "山形县", "ko": "야마가타현", "vi": "Tỉnh Yamagata", "pt": "Yamagata"},
    "fukushima": {"name_ja": "福島県", "en": "Fukushima", "zh": "福岛县", "ko": "후쿠시마현", "vi": "Tỉnh Fukushima", "pt": "Fukushima"},
    "ibaraki": {"name_ja": "茨城県", "en": "Ibaraki", "zh": "茨城县", "ko": "이바라키현", "vi": "Tỉnh Ibaraki", "pt": "Ibaraki"},
    "tochigi": {"name_ja": "栃木県", "en": "Tochigi", "zh": "栃木县", "ko": "토치기현", "vi": "Tỉnh Tochigi", "pt": "Tochigi"},
    "gunma": {"name_ja": "群馬県", "en": "Gunma", "zh": "群马县", "ko": "군마현", "vi": "Tỉnh Gunma", "pt": "Gunma"},
    "saitama": {"name_ja": "埼玉県", "en": "Saitama", "zh": "埼玉县", "ko": "사이타마현", "vi": "Tỉnh Saitama", "pt": "Saitama"},
    "chiba": {"name_ja": "千葉県", "en": "Chiba", "zh": "千叶县", "ko": "치바현", "vi": "Tỉnh Chiba", "pt": "Chiba"},
    "tokyo": {"name_ja": "東京都", "en": "Tokyo", "zh": "东京都", "ko": "도쿄도", "vi": "TP. Tokyo", "pt": "Tóquio"},
    "kanagawa": {"name_ja": "神奈川県", "en": "Kanagawa", "zh": "神奈川县", "ko": "가나가와현", "vi": "Tỉnh Kanagawa", "pt": "Kanagawa"},
    "niigata": {"name_ja": "新潟県", "en": "Niigata", "zh": "新潟县", "ko": "니가타현", "vi": "Tỉnh Niigata", "pt": "Niigata"},
    "toyama": {"name_ja": "富山県", "en": "Toyama", "zh": "富山县", "ko": "도야마현", "vi": "Tỉnh Toyama", "pt": "Toyama"},
    "ishikawa": {"name_ja": "石川県", "en": "Ishikawa", "zh": "石川县", "ko": "이시카와현", "vi": "Tỉnh Ishikawa", "pt": "Ishikawa"},
    "fukui": {"name_ja": "福井県", "en": "Fukui", "zh": "福井县", "ko": "후쿠이현", "vi": "Tỉnh Fukui", "pt": "Fukui"},
    "yamanashi": {"name_ja": "山梨県", "en": "Yamanashi", "zh": "山梨县", "ko": "야마나시현", "vi": "Tỉnh Yamanashi", "pt": "Yamanashi"},
    "nagano": {"name_ja": "長野県", "en": "Nagano", "zh": "长野县", "ko": "나가노현", "vi": "Tỉnh Nagano", "pt": "Nagano"},
    "gifu": {"name_ja": "岐阜県", "en": "Gifu", "zh": "岐阜县", "ko": "기후현", "vi": "Tỉnh Gifu", "pt": "Gifu"},
    "shizuoka": {"name_ja": "静岡県", "en": "Shizuoka", "zh": "静冈县", "ko": "시즈오카현", "vi": "Tỉnh Shizuoka", "pt": "Shizuoka"},
    "aichi": {"name_ja": "愛知県", "en": "Aichi", "zh": "爱知县", "ko": "아이치현", "vi": "Tỉnh Aichi", "pt": "Aichi"},
    "mie": {"name_ja": "三重県", "en": "Mie", "zh": "三重县", "ko": "미에현", "vi": "Tỉnh Mie", "pt": "Mie"},
    "shiga": {"name_ja": "滋賀県", "en": "Shiga", "zh": "滋贺县", "ko": "시가현", "vi": "Tỉnh Shiga", "pt": "Shiga"},
    "kyoto": {"name_ja": "京都府", "en": "Kyoto", "zh": "京都府", "ko": "교토부", "vi": "TP. Kyoto", "pt": "Quioto"},
    "osaka": {"name_ja": "大阪府", "en": "Osaka", "zh": "大阪府", "ko": "오사카부", "vi": "TP. Osaka", "pt": "Osaka"},
    "hyogo": {"name_ja": "兵庫県", "en": "Hyogo", "zh": "兵库县", "ko": "효고현", "vi": "Tỉnh Hyogo", "pt": "Hyogo"},
    "nara": {"name_ja": "奈良県", "en": "Nara", "zh": "奈良县", "ko": "나라현", "vi": "Tỉnh Nara", "pt": "Nara"},
    "wakayama": {"name_ja": "和歌山県", "en": "Wakayama", "zh": "和歌山县", "ko": "와카야마현", "vi": "Tỉnh Wakayama", "pt": "Wakayama"},
    "tottori": {"name_ja": "鳥取県", "en": "Tottori", "zh": "鸟取县", "ko": "돗토리현", "vi": "Tỉnh Tottori", "pt": "Tottori"},
    "shimane": {"name_ja": "島根県", "en": "Shimane", "zh": "岛根县", "ko": "시마네현", "vi": "Tỉnh Shimane", "pt": "Shimane"},
    "okayama": {"name_ja": "岡山県", "en": "Okayama", "zh": "冈山县", "ko": "오카야마현", "vi": "Tỉnh Okayama", "pt": "Okayama"},
    "hiroshima": {"name_ja": "広島県", "en": "Hiroshima", "zh": "广岛县", "ko": "히로시마현", "vi": "Tỉnh Hiroshima", "pt": "Hiroshima"},
    "yamaguchi": {"name_ja": "山口県", "en": "Yamaguchi", "zh": "山口县", "ko": "야마구치현", "vi": "Tỉnh Yamaguchi", "pt": "Yamaguchi"},
    "tokushima": {"name_ja": "徳島県", "en": "Tokushima", "zh": "德岛县", "ko": "도쿠시마현", "vi": "Tỉnh Tokushima", "pt": "Tokushima"},
    "kagawa": {"name_ja": "香川県", "en": "Kagawa", "zh": "香川县", "ko": "카가와현", "vi": "Tỉnh Kagawa", "pt": "Kagawa"},
    "ehime": {"name_ja": "愛媛県", "en": "Ehime", "zh": "爱媛县", "ko": "에히메현", "vi": "Tỉnh Ehime", "pt": "Ehime"},
    "kochi": {"name_ja": "高知県", "en": "Kochi", "zh": "高知县", "ko": "고치현", "vi": "Tỉnh Kochi", "pt": "Kochi"},
    "fukuoka": {"name_ja": "福岡県", "en": "Fukuoka", "zh": "福冈县", "ko": "후쿠오카현", "vi": "Tỉnh Fukuoka", "pt": "Fukuoka"},
    "saga": {"name_ja": "佐賀県", "en": "Saga", "zh": "佐贺县", "ko": "사가현", "vi": "Tỉnh Saga", "pt": "Saga"},
    "nagasaki": {"name_ja": "長崎県", "en": "Nagasaki", "zh": "长崎县", "ko": "나가사키현", "vi": "Tỉnh Nagasaki", "pt": "Nagasaki"},
    "kumamoto": {"name_ja": "熊本県", "en": "Kumamoto", "zh": "熊本县", "ko": "쿠마모토현", "vi": "Tỉnh Kumamoto", "pt": "Kumamoto"},
    "oita": {"name_ja": "大分県", "en": "Oita", "zh": "大分县", "ko": "오이타현", "vi": "Tỉnh Oita", "pt": "Oita"},
    "miyazaki": {"name_ja": "宮崎県", "en": "Miyazaki", "zh": "宫崎县", "ko": "미야자키현", "vi": "Tỉnh Miyazaki", "pt": "Miyazaki"},
    "kagoshima": {"name_ja": "鹿児島県", "en": "Kagoshima", "zh": "鹿儿岛县", "ko": "카고시마현", "vi": "Tỉnh Kagoshima", "pt": "Kagoshima"},
    "okinawa": {"name_ja": "沖縄県", "en": "Okinawa", "zh": "冲绳县", "ko": "오키나와현", "vi": "Tỉnh Okinawa", "pt": "Okinawa"}
}

LANGUAGES = {
    "en": {"code": "en", "locale": "en_US", "name": "English", "flag": "🇺🇸 English", "guide_link_text": "Foreigners SIM Guide", "home_title": "Rakuten Mobile Switching Guide", "bread_home": "Home", "filter_label": "Filter Stores", "search_placeholder": "Search by store or city..."},
    "zh": {"code": "zh", "locale": "zh_CN", "name": "中文", "flag": "🇨🇳 中文", "guide_link_text": "外国人办卡指南", "home_title": "乐天移动换网指南", "bread_home": "首页", "filter_label": "筛选门店", "search_placeholder": "按门店或城市搜索..."},
    "ko": {"code": "ko", "locale": "ko_KR", "name": "한국어", "flag": "🇰🇷 한국어", "guide_link_text": "외국인 SIM 가이드", "home_title": "라쿠텐 모바일 번호이동 가이드", "bread_home": "홈", "filter_label": "매장 검색", "search_placeholder": "매장명 또는 지역 검색..."},
    "vi": {"code": "vi", "locale": "vi_VN", "name": "Tiếng Việt", "flag": "🇻🇳 Tiếng Việt", "guide_link_text": "Hướng dẫn người nước ngoài", "home_title": "Hướng dẫn chuyển sang Rakuten Mobile", "bread_home": "Trang chủ", "filter_label": "Lọc cửa hàng", "search_placeholder": "Tìm theo tên cửa hàng hoặc khu vực..."},
    "pt": {"code": "pt", "locale": "pt_BR", "name": "Português", "flag": "🇧🇷 Português", "guide_link_text": "Guia para Estrangeiros", "home_title": "Guia de Migração para Rakuten Mobile", "bread_home": "Início", "filter_label": "Filtrar Lojas", "search_placeholder": "Buscar por loja ou cidade..."}
}

def update_individual_shop_pages():
    print("Updating individual shop pages with multilingual headers & language selectors...")
    count = 0
    # Find all shop index.html files (depth 3 or more: pref/carrier/shop/index.html)
    shop_files = glob.glob(f"{BASE_DIR}/*/*/*/index.html")
    for filepath in shop_files:
        rel_path = os.path.relpath(filepath, BASE_DIR)
        parts = rel_path.split("/")
        # Skip existing foreign language top folders
        if parts[0] in LANGUAGES:
            continue
        
        pref_slug = parts[0]
        if pref_slug not in PREFECTURES_MAP:
            continue
        
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # Update or inject Language Selector in site-header
        pref_info = PREFECTURES_MAP[pref_slug]
        pref_name_ja = pref_info["name_ja"]
        shop_rel_url = f"/{rel_path.replace('index.html', '')}"

        new_header = f'''  <header class="site-header">
    <a class="site-name" href="/">楽天モバイル乗り換えガイド</a>
    <div style="display:flex;align-items:center;gap:16px;">
      <a class="header-link" href="/en/guide/foreigners/">SIM Guide for Foreigners</a>
      <a class="header-link" href="/{pref_slug}/">{pref_name_ja}の店舗一覧</a>
      <div class="lang-selector-wrap">
        <select class="lang-selector" onchange="if(this.value) location.href=this.value;" aria-label="Language">
          <option value="{shop_rel_url}" selected>🇯🇵 日本語</option>
          <option value="/en/guide/foreigners/">🇺🇸 English</option>
          <option value="/zh/guide/foreigners/">🇨🇳 中文</option>
          <option value="/ko/guide/foreigners/">🇰🇷 한국어</option>
          <option value="/vi/guide/foreigners/">🇻🇳 Tiếng Việt</option>
          <option value="/pt/guide/foreigners/">🇧🇷 Português</option>
        </select>
      </div>
    </div>
  </header>'''

        content = re.sub(r'<header class="site-header">.*?</header>', new_header, content, flags=re.DOTALL)
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        count += 1

    print(f"Successfully updated {count} individual shop pages.")

def generate_prefecture_pages():
    print("Generating 47 prefecture pages for all foreign languages...")
    generated_count = 0

    for pref_slug, pref_info in PREFECTURES_MAP.items():
        ja_file = os.path.join(BASE_DIR, pref_slug, "index.html")
        if not os.path.exists(ja_file):
            continue

        with open(ja_file, "r", encoding="utf-8") as f:
            ja_content = f.read()

        for lang_code, lang_info in LANGUAGES.items():
            out_dir = os.path.join(BASE_DIR, lang_code, pref_slug)
            os.makedirs(out_dir, exist_ok=True)
            out_file = os.path.join(out_dir, "index.html")

            pref_name_lang = pref_info.get(lang_code, pref_info["name_ja"])
            pref_url = f"/{lang_code}/{pref_slug}/"

            content = ja_content
            content = re.sub(r'<html lang="ja">', f'<html lang="{lang_code}">', content)
            
            # Title & Meta
            title_text = f"Switching to Rakuten Mobile from Shops in {pref_name_lang} | Store Guide"
            desc_text = f"Carrier store guide for {pref_name_lang} ({lang_info['name']}). Check MNP preparation before switching to Rakuten Mobile."
            content = re.sub(r'<title>.*?</title>', f'<title>{title_text}</title>', content)
            content = re.sub(r'<meta name="description" content=".*?">', f'<meta name="description" content="{desc_text}">', content)
            content = re.sub(r'<link rel="canonical" href=".*?">', f'<link rel="canonical" href="https://rm-referral.maffun.workers.dev{pref_url}">', content)
            content = re.sub(r'<meta property="og:locale" content=".*?">', f'<meta property="og:locale" content="{lang_info["locale"]}">', content)
            content = re.sub(r'<meta property="og:title" content=".*?">', f'<meta property="og:title" content="{title_text}">', content)
            content = re.sub(r'<meta property="og:description" content=".*?">', f'<meta property="og:description" content="{desc_text}">', content)
            content = re.sub(r'<meta property="og:url" content=".*?">', f'<meta property="og:url" content="https://rm-referral.maffun.workers.dev{pref_url}">', content)

            # Alternate Hreflang
            hreflangs = f'''  <link rel="canonical" href="https://rm-referral.maffun.workers.dev{pref_url}">
  <link rel="alternate" hreflang="ja" href="https://rm-referral.maffun.workers.dev/{pref_slug}/">
  <link rel="alternate" hreflang="en" href="https://rm-referral.maffun.workers.dev/en/{pref_slug}/">
  <link rel="alternate" hreflang="zh" href="https://rm-referral.maffun.workers.dev/zh/{pref_slug}/">
  <link rel="alternate" hreflang="ko" href="https://rm-referral.maffun.workers.dev/ko/{pref_slug}/">
  <link rel="alternate" hreflang="vi" href="https://rm-referral.maffun.workers.dev/vi/{pref_slug}/">
  <link rel="alternate" hreflang="pt" href="https://rm-referral.maffun.workers.dev/pt/{pref_slug}/">'''
            content = re.sub(r'<link rel="canonical" href=".*?">', hreflangs, content)

            # Header
            header_html = f'''  <header class="site-header">
    <a class="site-name" href="/{lang_code}/">{lang_info["home_title"]}</a>
    <div style="display:flex;align-items:center;gap:16px;">
      <a class="header-link" href="/{lang_code}/guide/foreigners/">{lang_info["guide_link_text"]}</a>
      <a class="header-link" href="/{lang_code}/{pref_slug}/">{pref_name_lang}</a>
      <div class="lang-selector-wrap">
        <select class="lang-selector" onchange="if(this.value) location.href=this.value;" aria-label="Language">
          <option value="/{pref_slug}/">🇯🇵 日本語</option>
          <option value="/en/{pref_slug}/" {"selected" if lang_code == "en" else ""}>🇺🇸 English</option>
          <option value="/zh/{pref_slug}/" {"selected" if lang_code == "zh" else ""}>🇨🇳 中文</option>
          <option value="/ko/{pref_slug}/" {"selected" if lang_code == "ko" else ""}>🇰🇷 한국어</option>
          <option value="/vi/{pref_slug}/" {"selected" if lang_code == "vi" else ""}>🇻🇳 Tiếng Việt</option>
          <option value="/pt/{pref_slug}/" {"selected" if lang_code == "pt" else ""}>🇧🇷 Português</option>
        </select>
      </div>
    </div>
  </header>'''
            content = re.sub(r'<header class="site-header">.*?</header>', header_html, content, flags=re.DOTALL)

            # Breadcrumbs
            bread_html = f'<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/{lang_code}/">{lang_info["bread_home"]}</a><span>›</span><span>{pref_name_lang}</span></nav>'
            content = re.sub(r'<nav class="breadcrumb".*?</nav>', bread_html, content, flags=re.DOTALL)

            # Search Placeholder
            content = content.replace('placeholder="例：新宿、渋谷、店舗名"', f'placeholder="{lang_info["search_placeholder"]}"')

            with open(out_file, "w", encoding="utf-8") as f:
                f.write(content)
            generated_count += 1

    print(f"Successfully generated {generated_count} prefecture pages.")

def update_home_page_pref_links():
    print("Updating prefecture links in homepage for all foreign languages...")
    for lang_code in LANGUAGES:
        home_file = os.path.join(BASE_DIR, lang_code, "index.html")
        if not os.path.exists(home_file):
            continue
        with open(home_file, "r", encoding="utf-8") as f:
            content = f.read()

        for pref_slug in PREFECTURES_MAP:
            # Replace /pref_slug/ with /{lang_code}/pref_slug/
            content = re.sub(f'href="/{pref_slug}/"', f'href="/{lang_code}/{pref_slug}/"', content)

        with open(home_file, "w", encoding="utf-8") as f:
            f.write(content)
    print("Successfully updated homepage prefecture links.")

if __name__ == "__main__":
    update_individual_shop_pages()
    generate_prefecture_pages()
    update_home_page_pref_links()
