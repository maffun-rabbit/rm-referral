#!/usr/bin/env python3
import os
import re
import glob

BASE_DIR = "/Users/masayuki/Library/CloudStorage/GoogleDrive-maffun@gmail.com/マイドライブ/AI自動整理メモ/10_Projects/RMリファラル/cloudflare-site"

LANGUAGES = {
    "en": {"code": "en", "locale": "en_US", "name": "English", "flag": "🇺🇸 English", "guide_link_text": "Foreigners SIM Guide", "home_title": "Rakuten Mobile Switching Guide", "bread_home": "Home", "tokyo_title": "Tokyo", "filter_label": "Filter Stores", "search_placeholder": "Search by store or district..."},
    "zh": {"code": "zh", "locale": "zh_CN", "name": "中文", "flag": "🇨🇳 中文", "guide_link_text": "外国人办卡指南", "home_title": "乐天移动换网指南", "bread_home": "首页", "tokyo_title": "东京都", "filter_label": "筛选门店", "search_placeholder": "按门店或区域搜索..."},
    "ko": {"code": "ko", "locale": "ko_KR", "name": "한국어", "flag": "🇰🇷 한국어", "guide_link_text": "외국인 SIM 가이드", "home_title": "라쿠텐 모바일 번호이동 가이드", "bread_home": "홈", "tokyo_title": "도쿄도", "filter_label": "매장 검색", "search_placeholder": "매장명 또는 지역 검색..."},
    "vi": {"code": "vi", "locale": "vi_VN", "name": "Tiếng Việt", "flag": "🇻🇳 Tiếng Việt", "guide_link_text": "Hướng dẫn người nước ngoài", "home_title": "Hướng dẫn chuyển sang Rakuten Mobile", "bread_home": "Trang chủ", "tokyo_title": "TP. Tokyo", "filter_label": "Lọc cửa hàng", "search_placeholder": "Tìm theo tên cửa hàng hoặc khu vực..."},
    "pt": {"code": "pt", "locale": "pt_BR", "name": "Português", "flag": "🇧🇷 Português", "guide_link_text": "Guia para Estrangeiros", "home_title": "Guia de Migração para Rakuten Mobile", "bread_home": "Início", "tokyo_title": "Tóquio", "filter_label": "Filtrar Lojas", "search_placeholder": "Buscar por loja ou bairro..."}
}

def update_tokyo_shop_pages():
    print("Updating all Tokyo shop pages with multilingual headers & language selectors...")
    tokyo_shop_files = glob.glob(f"{BASE_DIR}/tokyo/*/*/index.html")
    count = 0

    for filepath in tokyo_shop_files:
        rel_path = os.path.relpath(filepath, BASE_DIR)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        shop_rel_url = f"/{rel_path.replace('index.html', '')}"

        new_header = f'''  <header class="site-header">
    <a class="site-name" href="/">楽天モバイル乗り換えガイド</a>
    <div style="display:flex;align-items:center;gap:16px;">
      <a class="header-link" href="/en/guide/foreigners/">SIM Guide for Foreigners</a>
      <a class="header-link" href="/tokyo/">東京の店舗一覧</a>
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

    print(f"Successfully updated {count} Tokyo shop pages.")

def update_tokyo_hub_pages():
    print("Updating Tokyo prefecture hub pages across all 5 foreign languages...")
    for lang_code, lang_info in LANGUAGES.items():
        tokyo_hub = os.path.join(BASE_DIR, lang_code, "tokyo", "index.html")
        if not os.path.exists(tokyo_hub):
            continue
        with open(tokyo_hub, "r", encoding="utf-8") as f:
            content = f.read()

        # Update link to Foreigners SIM guide in header
        new_header_link = f'<a class="header-link" href="/{lang_code}/guide/foreigners/">{lang_info["guide_link_text"]}</a>'
        if f'href="/{lang_code}/guide/foreigners/"' not in content:
            content = content.replace(f'<a class="header-link" href="/{lang_code}/tokyo/">', f'{new_header_link}\n      <a class="header-link" href="/{lang_code}/tokyo/">')

        with open(tokyo_hub, "w", encoding="utf-8") as f:
            f.write(content)
    print("Successfully updated Tokyo hub pages.")

if __name__ == "__main__":
    update_tokyo_shop_pages()
    update_tokyo_hub_pages()
