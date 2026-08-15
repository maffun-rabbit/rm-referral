import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dataPath = path.join(root, "data", "hokkaido-shops.csv");
const outputRoot = path.join(root, "hokkaido");
const siteUrl = "https://rm-referral.maffun.workers.dev";
const referralUrl = "https://r10.to/hNearm";
const updated = "2026-08-15";

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

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  return lines.slice(1).map((line) => {
    const [carrier, region, prefecture, name, address, officialUrl] = line.split(",");
    return { carrier, region, prefecture, name, address, officialUrl };
  });
}

function localityFrom(address) {
  const normalized = address.replace(/^\d{3}-\d{4}\s*/, "");
  const match = normalized.match(/^北海道(札幌市.+?区|.+?市|.+?郡.+?[町村]|.+?[町村])/);
  return match?.[1] ?? "北海道";
}

function shopId(shop) {
  try {
    const url = new URL(shop.officialUrl);
    const shopIdParam = url.searchParams.get("shopId");
    if (shopIdParam) return shopIdParam.toLowerCase();
    const detail = url.pathname.match(/shop_detail\/([^/]+)/);
    if (detail) return detail[1].toLowerCase();
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length) return segments.at(-1).replace(/\.html$/, "").toLowerCase();
  } catch {}
  return createHash("sha1").update(`${shop.name}|${shop.address}`).digest("hex").slice(0, 12);
}

function pagePath(shop) {
  return `/hokkaido/${shop.carrier}/${shopId(shop)}/`;
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
  ${schemas}
</head>
<body>
  <header class="site-header">
    <a class="site-name" href="/">楽天モバイル乗り換えガイド</a>
    <a class="header-link" href="/hokkaido/">北海道の店舗一覧</a>
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

function shopPage(shop, related) {
  const carrier = carrierLabels[shop.carrier];
  const locality = localityFrom(shop.address);
  const title = `${shop.name}から楽天モバイルへ乗り換える前に確認すること | 楽天モバイル乗り換えガイド`;
  const description = `${locality}の${shop.name}を利用している方向けに、${carrier}から楽天モバイルへ電話番号を引き継いで乗り換える準備と手順を整理します。`;
  const pathname = pagePath(shop);
  const canonical = `${siteUrl}${pathname}`;
  const note = carrierNotes[shop.carrier];
  const relatedLinks = related.map((item) => `
          <li><a href="${pagePath(item)}">${escapeHtml(item.name)}</a><span>${escapeHtml(localityFrom(item.address))}</span></li>`).join("");

  const body = `<main>
    <nav class="breadcrumb" aria-label="パンくずリスト">
      <a href="/">トップ</a><span>›</span><a href="/hokkaido/">北海道</a><span>›</span><span>${escapeHtml(shop.name)}</span>
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

    <section class="related-section">
      <h2>${escapeHtml(locality)}周辺の${escapeHtml(carrier)}店舗</h2>
      <ul class="related-list">${relatedLinks}</ul>
      <a class="text-link" href="/hokkaido/">北海道の全店舗を見る →</a>
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
          { "@type": "ListItem", position: 2, name: "北海道", item: `${siteUrl}/hokkaido/` },
          { "@type": "ListItem", position: 3, name: shop.name, item: canonical },
        ],
      },
    ],
  });
}

function indexPage(shops) {
  const groups = Object.keys(carrierLabels).map((carrier) => {
    const carrierShops = shops.filter((shop) => shop.carrier === carrier);
    const links = carrierShops.map((shop) => `<li><a href="${pagePath(shop)}">${escapeHtml(shop.name)}</a><span>${escapeHtml(localityFrom(shop.address))}</span></li>`).join("\n");
    return `<section class="shop-group" id="${carrier}">
      <div class="group-heading"><div><p class="section-label">${escapeHtml(carrierLabels[carrier])}</p><h2>${escapeHtml(carrierLabels[carrier])}の店舗</h2></div><strong>${carrierShops.length}<small>店舗</small></strong></div>
      <ul class="shop-grid">${links}</ul>
    </section>`;
  }).join("\n");

  const title = "北海道のキャリアショップから楽天モバイルへ乗り換える方法 | 店舗別ガイド";
  const description = "北海道のau・ドコモ・ソフトバンク店舗を地域別に掲載。楽天モバイルへ乗り換える前の準備やMNP手続きを店舗ごとに確認できます。";
  const canonical = `${siteUrl}/hokkaido/`;
  const body = `<main>
    <nav class="breadcrumb" aria-label="パンくずリスト"><a href="/">トップ</a><span>›</span><span>北海道</span></nav>
    <section class="area-hero">
      <p class="eyebrow">HOKKAIDO SHOP GUIDE</p>
      <h1>北海道のキャリアショップから<br><span>楽天モバイルへ乗り換える前に</span></h1>
      <p class="lead">au・ドコモ・ソフトバンクを利用中の方向けに、店舗へ行く前に確認したい乗り換え準備をまとめました。現在利用している店舗から選んでください。</p>
      <div class="count-row"><div><strong>${shops.length}</strong><span>掲載店舗</span></div><a href="#au">au</a><a href="#docomo">ドコモ</a><a href="#softbank">ソフトバンク</a></div>
    </section>
    <section class="index-note"><h2>店舗名から探す理由</h2><p>同じ通信会社でも、普段使う店舗や地域によって検索する言葉は異なります。各ページでは店舗固有の住所と公式ページを確認しながら、楽天モバイルへの乗り換え手順を整理できます。</p></section>
    ${groups}
    <section class="final-cta"><h2>オンラインで乗り換えを始める</h2><p>紹介キャンペーンの条件を先に確認し、納得してから申し込みへ進んでください。</p><a class="button light" href="${referralUrl}" rel="sponsored nofollow noopener">紹介キャンペーンを確認する <span aria-hidden="true">→</span></a><p class="updated">情報確認日：${updated}</p></section>
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

function relatedShops(shop, shops) {
  const locality = localityFrom(shop.address);
  const sameLocality = shops.filter((item) => item !== shop && item.carrier === shop.carrier && localityFrom(item.address) === locality);
  const sameCarrier = shops.filter((item) => item !== shop && item.carrier === shop.carrier && localityFrom(item.address) !== locality);
  return [...sameLocality, ...sameCarrier].slice(0, 5);
}

async function main() {
  const csv = await readFile(dataPath, "utf8");
  const shops = parseCsv(csv);
  if (shops.length !== 309) throw new Error(`Expected 309 shops, received ${shops.length}`);

  const paths = shops.map(pagePath);
  if (new Set(paths).size !== shops.length) throw new Error("Duplicate shop paths detected");

  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });
  await writeFile(path.join(outputRoot, "index.html"), indexPage(shops));

  for (const shop of shops) {
    const directory = path.join(root, pagePath(shop));
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "index.html"), shopPage(shop, relatedShops(shop, shops)));
  }

  const urls = ["/", "/hokkaido/", ...paths];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${siteUrl}${url}</loc><lastmod>${updated}</lastmod></url>`).join("\n")}\n</urlset>\n`;
  await writeFile(path.join(root, "sitemap.xml"), sitemap);
  await writeFile(path.join(root, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);

  console.log(`Generated ${shops.length} shop pages plus the Hokkaido index.`);
}

await main();
