import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const prefectureArg = process.argv.find((arg) => arg.startsWith("--prefecture="));
const prefectureName = prefectureArg?.slice("--prefecture=".length) ?? "北海道";
const prefectures = {
  北海道: { slug: "hokkaido", label: "北海道", shortLabel: "北海道", english: "HOKKAIDO", expectedShops: 309 },
  青森県: { slug: "aomori", label: "青森県", shortLabel: "青森", english: "AOMORI", expectedShops: 57 },
  岩手県: { slug: "iwate", label: "岩手県", shortLabel: "岩手", english: "IWATE", expectedShops: 62 },
  宮城県: { slug: "miyagi", label: "宮城県", shortLabel: "宮城", english: "MIYAGI", expectedShops: 123 },
  秋田県: { slug: "akita", label: "秋田県", shortLabel: "秋田", english: "AKITA", expectedShops: 46 },
  山形県: { slug: "yamagata", label: "山形県", shortLabel: "山形", english: "YAMAGATA", expectedShops: 59 },
  福島県: { slug: "fukushima", label: "福島県", shortLabel: "福島", english: "FUKUSHIMA", expectedShops: 98 },
  新潟県: { slug: "niigata", label: "新潟県", shortLabel: "新潟", english: "NIIGATA", expectedShops: 94 },
  栃木県: { slug: "tochigi", label: "栃木県", shortLabel: "栃木", english: "TOCHIGI", expectedShops: 78 },
  群馬県: { slug: "gunma", label: "群馬県", shortLabel: "群馬", english: "GUNMA", expectedShops: 83 },
  茨城県: { slug: "ibaraki", label: "茨城県", shortLabel: "茨城", english: "IBARAKI", expectedShops: 118 },
  埼玉県: { slug: "saitama", label: "埼玉県", shortLabel: "埼玉", english: "SAITAMA", expectedShops: 253 },
  千葉県: { slug: "chiba", label: "千葉県", shortLabel: "千葉", english: "CHIBA", expectedShops: 227 },
  東京都: { slug: "tokyo", label: "東京都", shortLabel: "東京", english: "TOKYO", expectedShops: 539 },
  神奈川県: { slug: "kanagawa", label: "神奈川県", shortLabel: "神奈川", english: "KANAGAWA", expectedShops: 296 },
  長野県: { slug: "nagano", label: "長野県", shortLabel: "長野", english: "NAGANO", expectedShops: 89 },
  山梨県: { slug: "yamanashi", label: "山梨県", shortLabel: "山梨", english: "YAMANASHI", expectedShops: 42 },
  富山県: { slug: "toyama", label: "富山県", shortLabel: "富山", english: "TOYAMA", expectedShops: 56 },
  石川県: { slug: "ishikawa", label: "石川県", shortLabel: "石川", english: "ISHIKAWA", expectedShops: 68 },
  福井県: { slug: "fukui", label: "福井県", shortLabel: "福井", english: "FUKUI", expectedShops: 41 },
  静岡県: { slug: "shizuoka", label: "静岡県", shortLabel: "静岡", english: "SHIZUOKA", expectedShops: 177 },
  愛知県: { slug: "aichi", label: "愛知県", shortLabel: "愛知", english: "AICHI", expectedShops: 428 },
  岐阜県: { slug: "gifu", label: "岐阜県", shortLabel: "岐阜", english: "GIFU", expectedShops: 115 },
  三重県: { slug: "mie", label: "三重県", shortLabel: "三重", english: "MIE", expectedShops: 104 },
  滋賀県: { slug: "shiga", label: "滋賀県", shortLabel: "滋賀", english: "SHIGA", expectedShops: 69 },
  京都府: { slug: "kyoto", label: "京都府", shortLabel: "京都", english: "KYOTO", expectedShops: 127 },
  大阪府: { slug: "osaka", label: "大阪府", shortLabel: "大阪", english: "OSAKA", expectedShops: 421 },
  兵庫県: { slug: "hyogo", label: "兵庫県", shortLabel: "兵庫", english: "HYOGO", expectedShops: 265 },
  奈良県: { slug: "nara", label: "奈良県", shortLabel: "奈良", english: "NARA", expectedShops: 67 },
  和歌山県: { slug: "wakayama", label: "和歌山県", shortLabel: "和歌山", english: "WAKAYAMA", expectedShops: 54 },
  鳥取県: { slug: "tottori", label: "鳥取県", shortLabel: "鳥取", english: "TOTTORI", expectedShops: 31 },
  島根県: { slug: "shimane", label: "島根県", shortLabel: "島根", english: "SHIMANE", expectedShops: 43 },
  岡山県: { slug: "okayama", label: "岡山県", shortLabel: "岡山", english: "OKAYAMA", expectedShops: 110 },
  広島県: { slug: "hiroshima", label: "広島県", shortLabel: "広島", english: "HIROSHIMA", expectedShops: 163 },
  山口県: { slug: "yamaguchi", label: "山口県", shortLabel: "山口", english: "YAMAGUCHI", expectedShops: 78 },
  徳島県: { slug: "tokushima", label: "徳島県", shortLabel: "徳島", english: "TOKUSHIMA", expectedShops: 48 },
  香川県: { slug: "kagawa", label: "香川県", shortLabel: "香川", english: "KAGAWA", expectedShops: 65 },
  愛媛県: { slug: "ehime", label: "愛媛県", shortLabel: "愛媛", english: "EHIME", expectedShops: 86 },
  高知県: { slug: "kochi", label: "高知県", shortLabel: "高知", english: "KOCHI", expectedShops: 49 },
  福岡県: { slug: "fukuoka", label: "福岡県", shortLabel: "福岡", english: "FUKUOKA", expectedShops: 304 },
  佐賀県: { slug: "saga", label: "佐賀県", shortLabel: "佐賀", english: "SAGA", expectedShops: 45 },
  長崎県: { slug: "nagasaki", label: "長崎県", shortLabel: "長崎", english: "NAGASAKI", expectedShops: 83 },
  熊本県: { slug: "kumamoto", label: "熊本県", shortLabel: "熊本", english: "KUMAMOTO", expectedShops: 94 },
  大分県: { slug: "oita", label: "大分県", shortLabel: "大分", english: "OITA", expectedShops: 67 },
  宮崎県: { slug: "miyazaki", label: "宮崎県", shortLabel: "宮崎", english: "MIYAZAKI", expectedShops: 63 },
  鹿児島県: { slug: "kagoshima", label: "鹿児島県", shortLabel: "鹿児島", english: "KAGOSHIMA", expectedShops: 91 },
  沖縄県: { slug: "okinawa", label: "沖縄県", shortLabel: "沖縄", english: "OKINAWA", expectedShops: 123 },
};
const prefecture = prefectures[prefectureName];
if (!prefecture) throw new Error(`Unsupported prefecture: ${prefectureName}`);

const dataPath = path.join(root, "data", `${prefecture.slug}-shops.csv`);
const carrierCoordinatesPath = path.join(root, "data", prefecture.slug === "hokkaido" ? "carrier-shops-geocoded.csv" : `${prefecture.slug}-carrier-shops-geocoded.csv`);
const rakutenShopsPath = path.join(root, "data", "rakuten-shops-geocoded.csv");
const shopSlugsPath = path.join(root, "data", "shop-slugs.csv");
const outputRoot = path.join(root, prefecture.slug);
const siteUrl = "https://rm-referral.maffun.workers.dev";
const referralUrl = "https://r10.to/hNearm";
const updated = "2026-08-16";

const carrierLabels = {
  au: "au",
  docomo: "ドコモ",
  softbank: "ソフトバンク",
};

const carrierNotes = {
  au: {
    account: "My auの契約情報と、au ID・暗証番号を確認しておくと手続きが進めやすくなります。",
    mail: "auメールを残したい場合は、持ち運びサービスの条件と申込期限をau公式サイトで確認してください。",
  },
  docomo: {
    account: "My docomoの契約情報と、dアカウント・ネットワーク暗証番号を確認しておくと手続きが進めやすくなります。",
    mail: "ドコモメールを残したい場合は、持ち運びサービスの条件と申込期限をドコモ公式サイトで確認してください。",
  },
  softbank: {
    account: "My SoftBankの契約情報と、SoftBank ID・暗証番号を確認しておくと手続きが進めやすくなります。",
    mail: "ソフトバンクのメールを残したい場合は、持ち運びサービスの条件と申込期限をソフトバンク公式サイトで確認してください。",
  },
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"' && quoted && text[index + 1] === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const headers = rows.shift().map((value) => value.replace(/^\uFEFF/, ""));
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

function parseCsv(text) {
  return parseCsvRows(text).map((row) => ({
    carrier: row.キャリア,
    region: row.地域,
    prefecture: row.都道府県,
    name: row.店名,
    address: row.住所,
    officialUrl: row.URL,
  }));
}

function radians(value) {
  return value * Math.PI / 180;
}

function distanceKm(from, to) {
  const earthRadiusKm = 6371.0088;
  const deltaLatitude = radians(to.latitude - from.latitude);
  const deltaLongitude = radians(to.longitude - from.longitude);
  const startLatitude = radians(from.latitude);
  const endLatitude = radians(to.latitude);
  const a = Math.sin(deltaLatitude / 2) ** 2
    + Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(deltaLongitude / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function localityFrom(address) {
  const normalized = address.replace(/^\d{3}-\d{4}\s*/, "");
  const withoutPrefecture = normalized.startsWith(prefecture.label)
    ? normalized.slice(prefecture.label.length)
    : normalized;
  const designatedCity = withoutPrefecture.match(/^(.+?市[一-龯々ぁ-んァ-ヶー]{1,8}区)/);
  const city = withoutPrefecture.match(/^(.+?市)/);
  const tokyoWard = prefecture.label === "東京都" ? withoutPrefecture.match(/^([^0-9０-９\s]+?区)/) : null;
  const district = withoutPrefecture.match(/^(.+?郡.+?[町村])/);
  const townOrVillage = withoutPrefecture.match(/^(.+?[町村])/);
  return designatedCity?.[1] ?? tokyoWard?.[1] ?? city?.[1] ?? district?.[1] ?? townOrVillage?.[1] ?? prefecture.shortLabel;
}

function pagePath(shop) {
  return `/${prefecture.slug}/${shop.carrier}/${shop.slug}/`;
}

function layout({ title, description, canonical, body, jsonLd = [] }) {
  const schemas = jsonLd
    .map((schema) => `<script type="application/ld+json">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script>`)
    .join("\n");
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta name="twitter:card" content="summary">
  <link rel="stylesheet" href="/css/style.css">
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-86FFC09LTE"></script>
  <script src="/js/analytics.js"></script>
  ${schemas}
</head>
<body>
  <header class="site-header">
    <a class="site-name" href="/">楽天モバイル乗り換えガイド</a>
    <a class="header-link" href="/${prefecture.slug}/">${prefecture.shortLabel}の店舗一覧</a>
  </header>
  ${body}
  <footer class="site-footer">
    <p><strong>楽天モバイル乗り換えガイド</strong></p>
    <p>当サイトは個人が運営しており、各通信会社および掲載店舗の公式サイトではありません。</p>
    <p>当サイトには紹介リンクが含まれます。条件や店舗情報は、申し込み時点の各公式サイトでご確認ください。</p>
  </footer>
</body>
</html>`;
}

function shopPage(shop, nearbyRakutenShops) {
  const carrier = carrierLabels[shop.carrier];
  const locality = localityFrom(shop.address);
  const title = `${shop.name}（${locality}）から楽天モバイルへ乗り換える前に確認すること | 楽天モバイル乗り換えガイド`;
  const description = `${locality}の${shop.name}を利用している方向けに、${carrier}から楽天モバイルへ電話番号を引き継いで乗り換える準備と手順を整理します。`;
  const pathname = pagePath(shop);
  const canonical = `${siteUrl}${pathname}`;
  const note = carrierNotes[shop.carrier];
  const nearestRakuten = nearbyRakutenShops[0];
  const relatedLinks = nearbyRakutenShops.map((item) => `
          <li><a href="${escapeHtml(item.officialUrl)}" rel="noopener"><span class="shop-link-name">${escapeHtml(item.name)}</span><span class="shop-link-meta">${escapeHtml(localityFrom(item.address))}・直線距離 約${item.distanceKm.toFixed(1)}km</span><span class="shop-link-arrow" aria-hidden="true">↗</span></a></li>`).join("");

  const body = `<main>
    <nav class="breadcrumb" aria-label="パンくずリスト">
      <a href="/">トップ</a><span>›</span><a href="/${prefecture.slug}/">${prefecture.shortLabel}</a><span>›</span><span>${escapeHtml(shop.name)}</span>
    </nav>

    <section class="shop-hero">
      <div>
        <p class="eyebrow">${escapeHtml(locality)}・${escapeHtml(carrier)}をご利用の方へ</p>
        <h1><span>${escapeHtml(shop.name)}</span>から<br>楽天モバイルへ乗り換える前に</h1>
        <p class="lead">店舗へ行く前に、オンラインでできる手続きと準備するものを確認。電話番号を引き継ぐMNPの流れを、順番に整理します。</p>
        <a class="button" href="${referralUrl}" rel="sponsored nofollow noopener">紹介キャンペーンを確認する <span aria-hidden="true">→</span></a>
        <p class="small">楽天モバイルのキャンペーンページへ移動します</p>
      </div>
      <aside class="shop-card">
        <p class="pill">掲載店舗情報</p>
        <h2>${escapeHtml(shop.name)}</h2>
        <dl>
          <div><dt>所在地</dt><dd>${escapeHtml(shop.address)}</dd></div>
          <div><dt>現在の通信会社</dt><dd>${escapeHtml(carrier)}</dd></div>
        </dl>
        <a class="official-link" href="${escapeHtml(shop.officialUrl)}" rel="noopener">店舗公式ページで最新情報を確認 <span>↗</span></a>
        <p class="small">営業時間・定休日・受付内容は変更される場合があります。</p>
      </aside>
    </section>

    <section class="answer-band">
      <h2>先に結論</h2>
      <div>
        <p><strong>楽天モバイルをオンラインで申し込む場合、MNPワンストップを利用できれば、MNP予約番号を事前に発行せず進められます。</strong></p>
        <p>契約状況や申込方法によって手続きが異なるため、画面の案内と各社の公式情報を確認してください。</p>
      </div>
    </section>

    <nav class="section-nav" aria-label="ページ内メニュー">
      <a href="#prepare"><b>01</b><span>準備するもの</span></a>
      <a href="#mnp"><b>02</b><span>MNPの考え方</span></a>
      <a href="#steps"><b>03</b><span>乗り換え手順</span></a>
      <a href="#check"><b>04</b><span>最終確認</span></a>
    </nav>

    <section class="content-section" id="prepare">
      <p class="section-label">01 / PREPARATION</p>
      <h2>申し込み前に準備するもの</h2>
      <div class="two-columns">
        <ul class="check-list">
          <li>本人確認書類</li>
          <li>楽天IDとパスワード</li>
          <li>支払いに使うカードまたは口座情報</li>
          <li>現在利用中の電話番号と契約名義</li>
          <li>対応端末・SIMロック状態の確認</li>
        </ul>
        <aside class="note-card">
          <h3>${escapeHtml(carrier)}側で確認しておくこと</h3>
          <p>${escapeHtml(note.account)}</p>
          <p>${escapeHtml(note.mail)}</p>
        </aside>
      </div>
    </section>

    <section class="content-section tinted" id="mnp">
      <p class="section-label">02 / MNP</p>
      <h2>店舗へ行く前に知っておきたいMNP</h2>
      <div class="comparison">
        <article>
          <p class="tag">オンライン申込</p>
          <h3>MNPワンストップ</h3>
          <p>対応する通信会社間のオンライン手続きでは、乗り換え先の申込画面から転出手続きを進められます。MNP予約番号が不要になる場合があります。</p>
        </article>
        <article>
          <p class="tag">店舗・一部手続き</p>
          <h3>MNP予約番号を使う方法</h3>
          <p>契約状況や申込方法によっては予約番号が必要です。有効期限があるため、発行後は早めに申し込みを進めます。</p>
        </article>
      </div>
      <p class="caution">※ MNPで楽天モバイルの回線が開通すると、原則として乗り換え元の対象回線は解約されます。端末の分割残債や付帯サービスは別に残る場合があります。</p>
    </section>

    <section class="content-section" id="steps">
      <p class="section-label">03 / STEPS</p>
      <h2>${escapeHtml(shop.name)}を利用中の方の乗り換え手順</h2>
      <ol class="step-list">
        <li><b>1</b><div><h3>紹介キャンペーンへログイン</h3><p>紹介リンクを開き、申し込み前に楽天IDでログインします。最新の対象条件と期限を確認してください。</p></div></li>
        <li><b>2</b><div><h3>楽天モバイルを申し込む</h3><p>電話番号を引き継ぐ場合は「他社から乗り換え（MNP）」を選び、契約者情報を入力します。</p></div></li>
        <li><b>3</b><div><h3>MNP転出手続きを進める</h3><p>申込画面の案内に沿って、MNPワンストップまたは予約番号を使った手続きを行います。</p></div></li>
        <li><b>4</b><div><h3>SIMを受け取り、開通する</h3><p>SIMカードまたはeSIMを設定し、回線切り替えと通話・通信の確認を行います。</p></div></li>
        <li><b>5</b><div><h3>キャンペーン条件を完了する</h3><p>期限内の開通やRakuten Linkでの通話など、申し込み時点の条件を忘れずに達成します。</p></div></li>
      </ol>
    </section>

    <section class="content-section tinted" id="check">
      <p class="section-label">04 / FINAL CHECK</p>
      <h2>乗り換え前の最終確認</h2>
      <div class="cards-three">
        <article><h3>対応エリア</h3><p>自宅・勤務先・通学先など、よく使う場所の楽天モバイル通信エリアを公式サイトで確認します。</p></article>
        <article><h3>端末とデータ</h3><p>利用予定端末の対応状況を確認し、写真や連絡先、認証アプリなどをバックアップします。</p></article>
        <article><h3>残る支払い</h3><p>端末代の分割残債、キャリア決済、家族割やセット割への影響を確認します。</p></article>
      </div>
    </section>

    <section class="nearby-shop-section" id="nearby-rakuten">
      <p class="section-label">NEARBY RAKUTEN MOBILE</p>
      <h2>${escapeHtml(shop.name)}から近い楽天モバイルショップ</h2>
      <div class="nearby-shop-grid">
        <div class="nearby-shop-card">
          <p class="pill">直線距離 約${nearestRakuten.distanceKm.toFixed(1)}km</p>
          <h3>${escapeHtml(nearestRakuten.name)}</h3>
          <p>${escapeHtml(nearestRakuten.address)}</p>
          <div class="nearby-shop-actions">
            <a class="button" href="${escapeHtml(nearestRakuten.directionsUrl)}" rel="noopener">Googleマップで経路を見る <span aria-hidden="true">↗</span></a>
            <a class="official-link" href="${escapeHtml(nearestRakuten.officialUrl)}" rel="noopener">楽天モバイル公式店舗ページ <span>↗</span></a>
          </div>
          <p class="small">距離は両店舗の公式座標から算出した直線距離です。実際の移動距離・時間はGoogleマップで確認してください。</p>
        </div>
        <iframe class="shop-map" title="${escapeHtml(nearestRakuten.name)}の地図" src="${escapeHtml(nearestRakuten.embedUrl)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
      </div>
    </section>

    <section class="related-section">
      <h2>${escapeHtml(locality)}周辺の楽天モバイルショップ</h2>
      <ul class="related-list">${relatedLinks}</ul>
      <a class="text-link" href="https://network.mobile.rakuten.co.jp/shop/" rel="noopener">楽天モバイルの全店舗を公式サイトで見る ↗</a>
    </section>

    <section class="final-cta">
      <p class="eyebrow">条件を確認してから進めよう</p>
      <h2>紹介キャンペーンを確認する</h2>
      <p>特典内容や対象条件は変更されることがあります。申し込み前にリンク先の最新情報を確認してください。</p>
      <a class="button light" href="${referralUrl}" rel="sponsored nofollow noopener">キャンペーンページへ <span aria-hidden="true">→</span></a>
      <p class="updated">情報確認日：${updated}</p>
    </section>
  </main>`;

  return layout({
    title,
    description,
    canonical,
    body,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        description,
        url: canonical,
        dateModified: updated,
        inLanguage: "ja-JP",
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "トップ", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: prefecture.shortLabel, item: `${siteUrl}/${prefecture.slug}/` },
          { "@type": "ListItem", position: 3, name: shop.name, item: canonical },
        ],
      },
    ],
  });
}

function indexPage(shops) {
  const shopsByLocality = Map.groupBy(shops, (shop) => localityFrom(shop.address));
  const localityGroups = [...shopsByLocality.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "ja"))
    .map(([locality, localityShops]) => {
      const links = localityShops
        .sort((a, b) => a.name.localeCompare(b.name, "ja"))
        .map((shop) => `<li data-shop-card data-carrier="${shop.carrier}"><a href="${pagePath(shop)}"><span class="shop-link-name">${escapeHtml(shop.name)}<em class="carrier-badge carrier-${shop.carrier}">${escapeHtml(carrierLabels[shop.carrier])}</em></span><span class="shop-link-meta">${escapeHtml(locality)}</span><span class="shop-link-arrow" aria-hidden="true">→</span></a></li>`)
        .join("\n");
      return `<details class="locality-group" data-locality-group>
        <summary><span>${escapeHtml(locality)}</span><strong><b data-locality-count>${localityShops.length}</b><small>店舗</small></strong><i aria-hidden="true">＋</i></summary>
        <ul class="shop-grid">${links}</ul>
      </details>`;
    })
    .join("\n");

  const title = `${prefecture.label}のキャリアショップから楽天モバイルへ乗り換える方法 | 店舗別ガイド`;
  const description = `${prefecture.label}のau・ドコモ・ソフトバンク店舗を地域別に掲載。楽天モバイルへ乗り換える前の準備やMNP手続きを店舗ごとに確認できます。`;
  const canonical = `${siteUrl}/${prefecture.slug}/`;
  const body = `<main>
    <nav class="breadcrumb" aria-label="パンくずリスト"><a href="/">トップ</a><span>›</span><span>${prefecture.shortLabel}</span></nav>
    <section class="area-hero">
      <p class="eyebrow">${prefecture.english} SHOP GUIDE</p>
      <h1>${prefecture.label}のキャリアショップから<br><span>楽天モバイルへ乗り換える前に</span></h1>
      <p class="lead">au・ドコモ・ソフトバンクを利用中の方向けに、店舗へ行く前に確認したい乗り換え準備をまとめました。現在利用している店舗から選んでください。</p>
      <div class="count-row"><div><strong>${shops.length}</strong><span>掲載店舗</span></div><a href="#shop-finder" data-carrier-jump="au">au</a><a href="#shop-finder" data-carrier-jump="docomo">ドコモ</a><a href="#shop-finder" data-carrier-jump="softbank">ソフトバンク</a></div>
    </section>
    <section class="shop-finder" id="shop-finder">
      <div class="shop-finder-heading"><div><p class="section-label">SHOP FINDER</p><h2>店舗を絞り込む</h2></div><p><strong data-result-count>${shops.length}</strong>店舗を表示</p></div>
      <label class="shop-search"><span>店舗名・市区町村から検索</span><input type="search" data-shop-search placeholder="例：新宿、渋谷、店舗名" autocomplete="off"><i aria-hidden="true">⌕</i></label>
      <div class="carrier-filters" aria-label="通信会社で絞り込む">
        <button type="button" data-carrier-filter="all" aria-pressed="true">すべて <small>${shops.length}</small></button>
        ${Object.entries(carrierLabels).map(([carrier, label]) => `<button type="button" data-carrier-filter="${carrier}" aria-pressed="false">${escapeHtml(label)} <small>${shops.filter((shop) => shop.carrier === carrier).length}</small></button>`).join("\n")}
      </div>
      <p class="filter-status" data-filter-status aria-live="polite"></p>
      <div class="locality-list">${localityGroups}</div>
      <p class="no-shop-results" data-no-results hidden>条件に一致する店舗がありません。検索語または通信会社を変更してください。</p>
    </section>
    <section class="final-cta"><h2>オンラインで乗り換えを始める</h2><p>紹介キャンペーンの条件を先に確認し、納得してから申し込みへ進んでください。</p><a class="button light" href="${referralUrl}" rel="sponsored nofollow noopener">紹介キャンペーンを確認する <span aria-hidden="true">→</span></a><p class="updated">情報確認日：${updated}</p></section>
    <script src="/js/prefecture-search.js" defer></script>
  </main>`;

  return layout({
    title,
    description,
    canonical,
    body,
    jsonLd: [{
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      url: canonical,
      dateModified: updated,
      inLanguage: "ja-JP",
    }],
  });
}

async function collectPublishedUrls() {
  const urls = [];
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.name === ".git" || entry.name === "node_modules") continue;
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(fullPath);
      else if (entry.name === "index.html" && fullPath !== path.join(root, "index.html")) {
        const relativeDirectory = path.relative(root, path.dirname(fullPath)).split(path.sep).join("/");
        urls.push(`/${relativeDirectory}/`);
      }
    }
  }
  await walk(root);
  return urls.sort();
}

async function main() {
  const [csv, coordinateCsv, rakutenCsv, shopSlugsCsv] = await Promise.all([
    readFile(dataPath, "utf8"),
    readFile(carrierCoordinatesPath, "utf8"),
    readFile(rakutenShopsPath, "utf8"),
    readFile(shopSlugsPath, "utf8"),
  ]);
  const slugByUrl = new Map(parseCsvRows(shopSlugsCsv).map((row) => [row.URL, row.slug]));
  const shops = parseCsv(csv).map((shop) => ({ ...shop, slug: slugByUrl.get(shop.officialUrl) }));
  if (shops.length !== prefecture.expectedShops) throw new Error(`Expected ${prefecture.expectedShops} shops, received ${shops.length}`);
  const missingSlug = shops.find((shop) => !shop.slug);
  if (missingSlug) throw new Error(`Readable URL slug missing for ${missingSlug.name}: ${missingSlug.officialUrl}`);

  const coordinatesByUrl = new Map(parseCsvRows(coordinateCsv).map((row) => [row.URL, {
    latitude: Number(row.緯度),
    longitude: Number(row.経度),
  }]));
  const rakutenShops = parseCsvRows(rakutenCsv)
    .filter((row) => row.都道府県 === prefecture.label)
    .map((row) => ({
      name: row.店名,
      address: row.住所,
      officialUrl: row.URL,
      latitude: Number(row.緯度),
      longitude: Number(row.経度),
    }));
  if (!rakutenShops.length) throw new Error(`No ${prefecture.label} Rakuten Mobile shops found`);

  const paths = shops.map(pagePath);
  if (new Set(paths).size !== shops.length) throw new Error("Duplicate shop paths detected");

  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });
  await writeFile(path.join(outputRoot, "index.html"), indexPage(shops));

  for (const shop of shops) {
    const coordinates = coordinatesByUrl.get(shop.officialUrl);
    if (!coordinates || !Number.isFinite(coordinates.latitude) || !Number.isFinite(coordinates.longitude)) {
      throw new Error(`Coordinates missing for ${shop.name}`);
    }
    const nearbyRakutenShops = rakutenShops
      .map((rakutenShop) => ({ ...rakutenShop, distanceKm: distanceKm(coordinates, rakutenShop) }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 5);
    const nearest = nearbyRakutenShops[0];
    const destination = `${nearest.latitude},${nearest.longitude}`;
    nearest.directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(shop.address)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
    nearest.embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(destination)}&z=15&output=embed`;
    const directory = path.join(root, pagePath(shop));
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "index.html"), shopPage(shop, nearbyRakutenShops));
  }

  const urls = ["/", ...await collectPublishedUrls()];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${siteUrl}${url}</loc><lastmod>${updated}</lastmod></url>`).join("\n")}\n</urlset>\n`;
  await writeFile(path.join(root, "sitemap.xml"), sitemap);
  await writeFile(path.join(root, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);

  console.log(`Generated ${shops.length} shop pages plus the ${prefecture.label} index.`);
}

await main();
