#!/usr/bin/env python3
"""静的ページ組み立て: _bodies/*.html を共通シェル(ナビ・ドロワー・フッター)に流し込む。"""
import pathlib

ROOT = pathlib.Path(__file__).parent
SITE = "GitHub活用 | G-Apps.jp アカデミー"

PAGES = [
    ("index",  None,          "home",        "Overview"),
    ("sec00",  "SECTION 00",  "person_add",  "§0 アカウント作成手順"),
    ("sec01",  "SECTION 01",  "fact_check",  "§1 はじめる前のチェック"),
    ("sec02",  "SECTION 02",  "school",      "§2 GitHubの基礎"),
    ("sec03",  "SECTION 03",  "history_edu", "§3 教材の「最新版どれ?」をなくす"),
    ("sec04",  "SECTION 04",  "public",      "§4 教科サイトをWeb公開"),
    ("sec05",  "SECTION 05",  "auto_stories","§5 探究を1人1リポジトリで残す"),
    ("sec06",  "SECTION 06",  "rate_review", "§6 生徒同士のレビューをプルリクで回す"),
    ("sec07",  "SECTION 07",  "shield",      "§7 生徒に使わせる日のルールづくり"),
    ("screens", "REFERENCE",  "monitor",     "図解 画面の見方"),
    ("faq",    "Q&A",         "help",        "Q&A よくある質問"),
]

def nav_html(active):
    drop = "\n".join(
        f'            <a href="{p}.html" class="nav-dropdown-item">\n'
        f'              <span class="material-symbols-outlined">{icon}</span>{label}\n'
        f'            </a>'
        for p, _, icon, label in PAGES[1:]
    )
    drawer_items = "\n".join(
        f'      <a href="{p}.html" class="drawer-link{" active" if p == active else ""}">\n'
        f'        <span class="material-symbols-outlined">{icon}</span> {label}\n'
        f'      </a>'
        for p, _, icon, label in PAGES[1:]
    )
    ov_active = " active" if active == "index" else ""
    return f'''  <nav class="nav" id="nav">
    <div class="nav-inner">
      <a href="index.html" class="nav-logo">
        <span class="nav-logo-icon">G</span>
        <span>G-Apps.jp アカデミー</span>
      </a>
      <div class="nav-menu">
        <a href="index.html" class="nav-link{ov_active}">Overview</a>
        <div class="nav-dropdown">
          <span class="nav-dropdown-trigger">Workshop
            <span class="material-symbols-outlined">expand_more</span>
          </span>
          <div class="nav-dropdown-menu">
{drop}
          </div>
        </div>
      </div>
      <div class="nav-actions">
        <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
          <span class="material-symbols-outlined icon-moon">dark_mode</span>
          <span class="material-symbols-outlined icon-sun">light_mode</span>
        </button>
        <button class="nav-toggle" id="navToggle" aria-label="Toggle menu">
          <span class="material-symbols-outlined">menu</span>
        </button>
      </div>
    </div>
  </nav>

  <div class="drawer-backdrop" id="drawerBackdrop"></div>
  <div class="drawer" id="drawer">
    <div class="drawer-header">
      <span class="drawer-title">Menu</span>
      <button class="drawer-close" id="drawerClose">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="drawer-content">
      <a href="index.html" class="drawer-link{ov_active}">
        <span class="material-symbols-outlined">home</span> Overview
      </a>
      <div class="drawer-divider"></div>
      <span class="drawer-section-label">Workshop</span>
{drawer_items}
    </div>
  </div>
'''

def page_nav(idx):
    if idx == 0:
        return ""
    prev_p, _, _, prev_l = PAGES[idx - 1]
    parts = ['      <div class="page-nav">']
    if idx == 1:
        parts.append('        <a href="index.html"><span class="material-symbols-outlined">arrow_back</span> Overview</a>')
    else:
        parts.append(f'        <a href="{prev_p}.html"><span class="material-symbols-outlined">arrow_back</span> {prev_l}</a>')
    if idx + 1 < len(PAGES):
        next_p, _, _, next_l = PAGES[idx + 1]
        parts.append(f'        <a href="{next_p}.html">{next_l} <span class="material-symbols-outlined">arrow_forward</span></a>')
    else:
        parts.append('        <a href="index.html">Overviewへ戻る <span class="material-symbols-outlined">arrow_forward</span></a>')
    parts.append("      </div>")
    return "\n".join(parts)

HEAD = '''<!DOCTYPE html>
<html lang="ja" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='12' fill='%231A73E8'/><text x='32' y='45' font-size='38' font-family='sans-serif' font-weight='bold' fill='white' text-anchor='middle'>G</text></svg>">
  <title>{title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@400;700&family=BIZ+UDGothic:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
  <link rel="stylesheet" href="css/style.css?v=20260819">
</head>
<body>
  <div class="page-transition-overlay">
    <span class="transition-text">G-Apps.jp アカデミー</span>
  </div>

'''

FOOT = '''
  <footer class="footer">
    <div class="container">
      <div class="footer-bottom">
        <p class="footer-copyright">G-Apps.jp アカデミー 2026 / スクールエージェント株式会社</p>
      </div>
    </div>
  </footer>

  <div class="toast" id="toast">
    <span class="material-symbols-outlined">check_circle</span> Copied
  </div>

  <script src="js/main.js?v=20260819"></script>
  <script src="js/copy.js?v=20260819"></script>
</body>
</html>
'''

for idx, (page, _, _, label) in enumerate(PAGES):
    body = (ROOT / "_bodies" / f"{page}.html").read_text()
    body = body.replace("{{PAGE_NAV}}", page_nav(idx))
    title = SITE if page == "index" else f"{label} | {SITE}"
    html = HEAD.format(title=title) + nav_html(page) + body + FOOT
    (ROOT / f"{page}.html").write_text(html)
    print(f"built {page}.html ({len(html.splitlines())} lines)")
