import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const toolsRoot = process.env.RM_SLUG_TOOLS ?? "/private/tmp/rm-slug-tools/node_modules";
const { default: kuroshiroModule } = await import(path.join(toolsRoot, "kuroshiro/lib/index.js"));
const { default: KuromojiAnalyzer } = await import(path.join(toolsRoot, "kuroshiro-analyzer-kuromoji/lib/index.js"));
const Kuroshiro = kuroshiroModule.default ?? kuroshiroModule;
const converter = new Kuroshiro();
await converter.init(new KuromojiAnalyzer({ dictPath: path.join(toolsRoot, "kuromoji/dict") }));

const areas = [
  "hokkaido", "aomori", "iwate", "miyagi", "akita", "yamagata", "fukushima",
  "ibaraki", "tochigi", "gunma", "saitama", "chiba", "tokyo", "kanagawa",
  "niigata", "toyama", "ishikawa", "fukui", "yamanashi", "nagano", "gifu",
  "shizuoka", "aichi", "mie", "shiga", "kyoto", "osaka", "hyogo", "nara",
  "wakayama", "tottori", "shimane", "okayama", "hiroshima", "yamaguchi",
  "tokushima", "kagawa", "ehime", "kochi", "fukuoka", "saga", "nagasaki",
  "kumamoto", "oita", "miyazaki", "kagoshima", "okinawa",
];
const readings = { names: {}, localities: {} };

function decodeHtml(value) {
  return value.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#39;", "'");
}

function tidyRoman(value) {
  const cleaned = value
    .normalize("NFKC")
    .replace(/\bau shoppu\b/gi, "au Shop")
    .replace(/\bdokomo shoppu\b/gi, "docomo Shop")
    .replace(/\bsofutobanku\b/gi, "SoftBank")
    .replace(/\brakuten mobairu\b/gi, "Rakuten Mobile")
    .replace(/\bion mobairu\b/gi, "AEON Mobile")
    .replace(/\bwai mobairu\b/gi, "Y!mobile")
    .replace(/\byu kyu mobairu\b/gi, "UQ mobile")
    .replace(/\bY\s*!\s*mobile\b/gi, "Y!mobile")
    .replace(/\bU\s*Q\s+(?:mobile|Spot)\b/gi, (match) => match.toLowerCase().includes("spot") ? "UQ Spot" : "UQ mobile")
    .replace(/\bmark is\b/gi, "MARK IS")
    .replace(/\bbikku kamera\b/gi, "Bic Camera")
    .replace(/\byodobashi kamera\b/gi, "Yodobashi Camera")
    .replace(/\bkojima\b/gi, "Kojima")
    .replace(/\s+(Ten|Mise)$/i, "")
    .replace(/\s+/g, " ")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  return cleaned
    .split(" ")
    .map((word) => /^(au|docomo|SoftBank|Rakuten|Mobile|AEON|Y!mobile|UQ|MARK|IS|Bic|Camera|Kojima)$/i.test(word)
      ? word
      : word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .replace(/\bAu Shop\b/g, "au Shop")
    .replace(/\bDocomo Shop\b/g, "docomo Shop")
    .replace(/\bRakuten Mobile\b/gi, "Rakuten Mobile")
    .replace(/\bSoftbank\b/gi, "SoftBank")
    .replace(/\bAeon Mobile\b/gi, "AEON Mobile")
    .replace(/\bAEON Mobairu\b/gi, "AEON Mobile")
    .replace(/\bTetc Land\b/gi, "Tecc Land")
    .replace(/\bK ' S Denki\b/g, "K's Denki")
    .replace(/\bMark Is\b/gi, "MARK IS");
}

async function romanize(value) {
  const source = value.normalize("NFKC")
    .replaceAll("auショップ", " au Shop ")
    .replaceAll("ドコモショップ", " docomo Shop ")
    .replaceAll("ソフトバンク", " SoftBank ")
    .replaceAll("ワイモバイル", " Y!mobile ")
    .replaceAll("UQスポット", " UQ Spot ")
    .replaceAll("楽天モバイル", " Rakuten Mobile ")
    .replaceAll("イオンモバイル", " AEON Mobile ")
    .replaceAll("イオンモール", " AEON Mall ")
    .replaceAll("イオン", " AEON ")
    .replaceAll("ケーズデンキ", " K's Denki ")
    .replaceAll("テックランド", " Tecc Land ")
    .replaceAll("ビックカメラ", " Bic Camera ")
    .replaceAll("ヨドバシカメラ", " Yodobashi Camera ")
    .replaceAll("コジマ", " Kojima ")
    .replaceAll("エディオン", " EDION ");
  const converted = await converter.convert(source, {
    to: "romaji",
    mode: "spaced",
    romajiSystem: "hepburn",
  });
  return tidyRoman(converted);
}

for (const area of areas) {
  const carriers = await readdir(path.join(root, area), { withFileTypes: true });
  for (const carrier of carriers.filter((entry) => entry.isDirectory() && entry.name !== "coverage")) {
    const shops = await readdir(path.join(root, area, carrier.name), { withFileTypes: true });
    for (const shop of shops.filter((entry) => entry.isDirectory())) {
      const file = path.join(root, area, carrier.name, shop.name, "index.html");
      const html = await readFile(file, "utf8");
      const identity = html.match(/<p class="eyebrow">([^・<]+)・[^<]+をご利用の方へ<\/p>[\s\S]*?<h1><span>(.*?)<\/span>をご利用中の方へ<br>/);
      if (!identity) continue;
      const locality = decodeHtml(identity[1]);
      const name = decodeHtml(identity[2]);
      if (!readings.localities[locality]) readings.localities[locality] = await romanize(locality);
      if (!readings.names[name]) readings.names[name] = await romanize(name);

      for (const match of html.matchAll(/<span class="shop-link-name">(.*?)<\/span>/g)) {
        const relatedName = decodeHtml(match[1]);
        if (!readings.names[relatedName]) readings.names[relatedName] = await romanize(relatedName);
      }
      for (const match of html.matchAll(/<h3>(.*?)がオープン<\/h3>/g)) {
        const topicName = decodeHtml(match[1]);
        if (!readings.names[topicName]) readings.names[topicName] = await romanize(topicName);
      }
    }
  }
}

await writeFile(
  path.join(root, "data", "nationwide-name-readings.json"),
  `${JSON.stringify(readings, null, 2)}\n`,
  "utf8",
);
console.log(`Generated ${Object.keys(readings.names).length} name readings and ${Object.keys(readings.localities).length} locality readings.`);
