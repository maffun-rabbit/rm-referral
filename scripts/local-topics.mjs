import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.env.RM_SITE_ROOT || (path.basename(process.cwd()) === "astro-site" ? path.resolve(process.cwd(), "..") : process.cwd());
const data = (name) => readFileSync(path.join(root, "data", name), "utf8");
const managed = JSON.parse(data("local-topics.json"));
const stations = JSON.parse(data("rakuten-base-stations.json"));
const asOf = managed.reviewedAt;
if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf)) throw new Error("local-topics.json needs a reviewedAt date");

function csvRows(source) {
  const rows = []; let row = [], cell = "", quoted = false;
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (c === '"' && quoted && source[i + 1] === '"') { cell += '"'; i++; }
    else if (c === '"') quoted = !quoted;
    else if (c === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((c === "\r" || c === "\n") && !quoted) {
      if (c === "\r" && source[i + 1] === "\n") i++;
      row.push(cell); if (row.some(Boolean)) rows.push(row);
      row = []; cell = "";
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const headers = rows.shift().map((header) => header.replace(/^\uFEFF/, ""));
  return rows.map((values) => Object.fromEntries(headers.map((header, i) => [header, values[i] ?? ""])));
}
const rakutenByPrefecture = Map.groupBy(csvRows(data("rakuten-shops-geocoded.csv")), (row) => row.都道府県);
const valueCoordinates = new Map(csvRows(data("value-carrier-shops-geocoded.csv")).map((row) => [row.URL, row]));
const coordinates = new Map();
function coordinatesFor(slug, url) {
  if (!coordinates.has(slug)) {
    const filename = slug === "hokkaido" ? "carrier-shops-geocoded.csv" : `${slug}-carrier-shops-geocoded.csv`;
    coordinates.set(slug, new Map(csvRows(data(filename)).map((row) => [row.URL, row])));
  }
  const shop = coordinates.get(slug).get(url) ?? valueCoordinates.get(url);
  if (!shop) throw new Error(`Missing carrier coordinates: ${slug} ${url}`);
  return shop;
}
const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
const isoDate = (value) => value.replace(/(\d{4})年(\d{1,2})月(\d{1,2})日/, (_, y, m, d) => `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
const formatted = (value) => { const [y, m, d] = value.split("-").map(Number); return `${y}年${m}月${d}日`; };
function distanceKm(a, b) {
  const r = (x) => x * Math.PI / 180;
  const dlat = r(Number(b.緯度) - Number(a.緯度)), dlon = r(Number(b.経度) - Number(a.経度));
  const v = Math.sin(dlat / 2) ** 2 + Math.cos(r(Number(a.緯度))) * Math.cos(r(Number(b.緯度))) * Math.sin(dlon / 2) ** 2;
  return 6371.0088 * 2 * Math.atan2(Math.sqrt(v), Math.sqrt(1 - v));
}
function localityFrom(address, prefecture) {
  const local = address.replace(/^\d{3}-\d{4}\s*/, "").replace(new RegExp(`^${prefecture}`), "").trimStart();
  return local.match(/^(.+?市[一-龯々ぁ-んァ-ヶー]{1,8}区)/)?.[1]
    ?? (prefecture === "東京都" ? local.match(/^([^0-9０-９\s]+?区)/)?.[1] : null)
    ?? local.match(/^(.+?市)/)?.[1] ?? local.match(/^(.+?郡.+?[町村])/)?.[1]
    ?? local.match(/^(.+?[町村])/)?.[1] ?? prefecture;
}
const cutoff = new Date(`${asOf}T00:00:00+09:00`);
cutoff.setMonth(cutoff.getMonth() - 6);
const cutoffDate = new Intl.DateTimeFormat("sv-SE", {timeZone: "Asia/Tokyo"}).format(cutoff);

export function regionalTopics({slug, prefecture, shopName, address, officialUrl}) {
  const locality = localityFrom(address, prefecture);
  const from = coordinatesFor(slug, officialUrl);
  const editorial = managed.topics.filter((item) => item.publishedAt <= asOf && item.expiresAt >= asOf
    && item.targets.some((target) => target.prefecture === prefecture && target.municipalities.includes(locality)));
  const stationRows = stations.periods[0]?.rows.filter((row) => row.Prefecture === prefecture && row.City === locality) ?? [];
  const stationTopics = stationRows.length ? [{
    category: "AREA UPDATE", publishedAt: isoDate(stations.latestUpdate),
    title: `${locality}で楽天モバイル基地局の新設・増設を確認`,
    summary: `楽天モバイル公式発表で、${locality}に${stationRows.length}局（${[...new Set(stationRows.map((row) => row.Type))].join("・")}）の基地局設置が確認されました。基地局の新設は改善情報ですが、個別地点の電波強度や速度を保証するものではありません。`,
    sourceTitle: "Rakuten最強プランプロジェクト進行中！", mediaName: "楽天モバイル公式",
  }] : [];
  const newShops = (rakutenByPrefecture.get(prefecture) ?? []).filter((shop) => shop.開店日 >= cutoffDate && shop.開店日 <= asOf)
    .map((shop) => ({shop, distance: distanceKm(from, shop)})).filter(({distance}) => distance <= 20)
    .map(({shop, distance}) => ({
      category: "NEW SHOP", publishedAt: shop.公開日 || shop.開店日,
      title: `${shop.店名}がオープン`,
      summary: `${shopName}から直線距離約${distance.toFixed(1)}km。近隣で楽天モバイルを対面相談できる店舗の選択肢が増えました。`,
      sourceTitle: `${shop.店名} 店舗情報`, mediaName: "楽天モバイル公式",
    }));
  return {locality, items: [...editorial, ...stationTopics, ...newShops].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 3)};
}

export function refreshLocalTopics(middleHtml, details) {
  const {locality, items} = regionalTopics(details);
  const section = items.length ? `<section class="local-topics-section" aria-labelledby="local-topics-heading">
    <p class="section-label">LOCAL TOPICS</p><h2 id="local-topics-heading">${escape(locality)}周辺の楽天モバイル最新トピック</h2>
    <div class="local-topic-list">${items.map((item) => `<article class="local-topic-card"><div><p class="local-topic-meta"><span>${escape(item.category)}</span><time datetime="${escape(item.publishedAt)}">${formatted(item.publishedAt)}</time></p><h3>${escape(item.title)}</h3><p>${escape(item.summary)}</p></div><p class="local-topic-source">元記事：${escape(item.sourceTitle)}<br>媒体：${escape(item.mediaName)}<br>公開日：${formatted(item.publishedAt)}</p></article>`).join("")}</div>
    <p class="topic-source">掲載情報は公式発表などをもとに独自に要約しています。地域トピックから外部サイトへのリンクは設置していません。</p>
  </section>` : "";
  const existing = /<section class="local-topics-section"[\s\S]*?<\/section>/;
  if (existing.test(middleHtml)) return middleHtml.replace(existing, section);
  if (!section) return middleHtml;
  const marker = '<section class="nearby-shop-section"';
  if (!middleHtml.includes(marker)) throw new Error(`Nearby section missing: ${details.officialUrl}`);
  return middleHtml.replace(marker, `${section}\n${marker}`);
}

export const topicAsOf = asOf;
