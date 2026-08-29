import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { getAbsoluteLocaleUrl, LOCALE_CONFIG, type Locale } from "../config/site.ts";
import { legacyLanguageConfig, type ForeignLocale } from "../i18n/legacy.ts";
import { migratedPrefectures, type MigratedPrefectureSlug } from "./load-tokyo-shop-pages.ts";

const workerOrigins: Record<string, string> = {
  "https://rm-referral-vi.maffun.workers.dev": "https://mnp-navi.jp/vi",
  "https://rm-referral-en.maffun.workers.dev": "https://mnp-navi.jp/en",
  "https://rm-referral-zh.maffun.workers.dev": "https://mnp-navi.jp/zh",
  "https://rm-referral-ko.maffun.workers.dev": "https://mnp-navi.jp/ko",
  "https://rm-referral-pt.maffun.workers.dev": "https://mnp-navi.jp/pt",
  "https://rm-referral.maffun.workers.dev": "https://mnp-navi.jp",
};

const chineseTokyoMunicipalities: Record<string, readonly [string, string]> = {
  adachi: ["足立区", "足立区"], akiruno: ["あきる野市", "秋留野市"], akishima: ["昭島市", "昭岛市"],
  arakawa: ["荒川区", "荒川区"], bunkyo: ["文京区", "文京区"], chiyoda: ["千代田区", "千代田区"],
  chofu: ["調布市", "调布市"], chuo: ["中央区", "中央区"], edogawa: ["江戸川区", "江户川区"],
  fuchu: ["府中市", "府中市"], fussa: ["福生市", "福生市"], hachijojimahachijo: ["八丈島八丈町", "八丈岛八丈町"],
  hachioji: ["八王子市", "八王子市"], hamura: ["羽村市", "羽村市"], higashikurume: ["東久留米市", "东久留米市"],
  higashimurayama: ["東村山市", "东村山市"], higashiyamato: ["東大和市", "东大和市"], hino: ["日野市", "日野市"],
  inagi: ["稲城市", "稻城市"], itabashi: ["板橋区", "板桥区"], katsushika: ["葛飾区", "葛饰区"],
  kita: ["北区", "北区"], kiyose: ["清瀬市", "清濑市"], kodaira: ["小平市", "小平市"],
  koganei: ["小金井市", "小金井市"], kokubunji: ["国分寺市", "国分寺市"], kokuritsu: ["国立市", "国立市"],
  komae: ["狛江市", "狛江市"], koto: ["江東区", "江东区"], machida: ["町田市", "町田市"],
  meguro: ["目黒区", "目黑区"], minato: ["港区", "港区"], mitaka: ["三鷹市", "三鹰市"],
  musashimurayama: ["武蔵村山市", "武藏村山市"], musashino: ["武蔵野市", "武藏野市"], nakano: ["中野区", "中野区"],
  nerima: ["練馬区", "练马区"], "nishitama-hinode": ["西多摩郡日の出町", "西多摩郡日之出町"],
  "nishitama-mizuho": ["西多摩郡瑞穂町", "西多摩郡瑞穗町"], nishitokyo: ["西東京市", "西东京市"],
  oshima: ["大島町", "大岛町"], ota: ["大田区", "大田区"], oume: ["青梅市", "青梅市"],
  setagaya: ["世田谷区", "世田谷区"], shibuya: ["渋谷区", "涩谷区"], shinagawa: ["品川区", "品川区"],
  shinjuku: ["新宿区", "新宿区"], suginami: ["杉並区", "杉并区"], sumida: ["墨田区", "墨田区"],
  taito: ["台東区", "台东区"], tama: ["多摩市", "多摩市"], tatsukawa: ["立川市", "立川市"],
  toshima: ["豊島区", "丰岛区"],
};

const chineseCoverageReplacements: readonly (readonly [string, string])[] = [
  ["東京都", "东京都"], ["楽天モバイル電波状況", "乐天移动网络覆盖情况"],
  ["エリア・基地局の最新情報", "区域与基站最新信息"], ["楽天モバイル乗り換えガイド", "乐天移动携号转网指南"],
  ["公式の基地局設置発表をもとに、現在確認できる改善情報を整理しました。生活圏での最終確認方法と、家族で使える割引もまとめています。", "本文根据官方基站建设公告整理目前可确认的改善信息，并介绍生活区域的最终确认方法和家庭优惠。"],
  ["現在の確認目安", "当前确认建议"], ["生活圏ごとの確認がおすすめ", "建议按日常活动区域逐一确认"],
  ["市区町村全体を一律に良い・悪いとは判定できないため、自宅・学校・勤務先など実際に使う地点を公式エリアマップで確認してください。", "各地点的信号情况不同，不能仅按整个市区町村判断好坏。请在官方区域地图中确认住宅、学校和工作地点等实际使用位置。"],
  ["公式エリアマップで地点を確認する", "在官方区域地图中确认地点"], ["他社から乗り換えで14,000ポイントを確認する", "查看携号转网可获14,000积分的条件"],
  ["今いる場所に近い情報も確認できます", "也可查看当前位置附近的信息"], ["位置情報はブラウザ内の判定だけに使用します", "位置信息仅用于浏览器内的附近区域判断"],
  ["現在地周辺を見る", "查看当前位置附近"], ["直近2回の公式発表について", "关于最近两次官方公告"],
  ["直近の基地局設置実績", "近期基站建设记录"], ["新設基地局", "新建基站"],
  ["確認対象：楽天モバイル公式「Rakuten最強プランプロジェクト進行中！」／2026年8月17日更新（外部リンクなし）", "确认来源：乐天移动官方“Rakuten最强套餐项目进行中！”／2026年8月17日更新"],
  ["出典：楽天モバイル公式「Rakuten最強プランプロジェクト進行中！」／2026年8月17日更新（外部リンクなし）", "来源：乐天移动官方“Rakuten最强套餐项目进行中！”／2026年8月17日更新"],
  ["※ 基地局の新設は改善を示す情報ですが、特定地点の電波強度や通信速度を保証するものではありません。屋内・地下・地形・混雑状況・対応端末によって利用状況は変わります。", "※ 新建基站表示网络正在改善，但不保证特定地点的信号强度或通信速度。室内、地下、地形、拥挤程度和终端设备都会影响实际使用情况。"],
  ["契約前に確認したい3つの場所", "签约前应确认的三个地点"], ["自宅", "住宅"],
  ["部屋の位置や建物の構造でも変わるため、住所付近を公式エリアマップで拡大して確認します。", "信号也会受房间位置和建筑结构影响，请放大官方区域地图确认住址附近。"],
  ["学校・勤務先", "学校与工作地点"], ["毎日長く滞在する場所と、その周辺の通学・通勤経路も合わせて確認します。", "请同时确认每天长时间停留的地点，以及上下学、通勤路线周边。"],
  ["よく行く施設", "常去的设施"], ["地下、駅、大型商業施設など、通信をよく使う場所は個別に確認しておくと安心です。", "地下空间、车站和大型商业设施等经常使用通信的地点，最好逐一确认。"],
  ["家族の年代に合わせて使える割引", "适合不同年龄家庭成员的优惠"], ["利用する方：", "使用者："],
  ["家族みんな", "全家"], ["家族", "家庭"], ["12歳以下", "12岁以下"], ["12歳まで", "不满13岁"],
  ["13〜22歳", "13至22岁"], ["65歳以上", "65岁以上"], ["最強家族割", "最强家庭优惠"],
  ["毎月110円引き", "每月优惠110日元"], ["離れて暮らす家族も対象。対象の家族グループに参加すると、1人あたり月額110円（税込）が割り引かれます。", "分开居住的家庭成员也可参加。加入符合条件的家庭群组后，每人每月可优惠110日元（含税）。"],
  ["最強こども割", "最强儿童优惠"], ["3GBまで毎月440円引き", "使用3GB以内每月优惠440日元"],
  ["データ利用量が3GB以下の場合は毎月440円（税込）、それ以外の場合は毎月110円（税込）が割り引かれます。", "每月流量不超过3GB时优惠440日元（含税），超过3GB时优惠110日元（含税）。"],
  ["最強青春割", "最强青春优惠"], ["13歳から22歳までを対象に、毎月110円（税込）が割り引かれます。適用手続きが必要です。", "面向13至22岁用户，每月优惠110日元（含税），需要办理适用手续。"],
  ["最強シニアプログラム", "最强老年用户计划"], ["毎月110ポイント還元", "每月返还110积分"],
  ["条件を満たすと毎月110ポイントを還元。通話や店頭サポートなどをまとめた対象オプションの還元もあります。", "满足条件时每月返还110积分，符合条件的通话和门店支持等组合服务也有积分返还。"],
  ["※ 年齢、対象プラン、エントリーなどの条件があります。割引額・名称・条件は変更される場合があるため、申し込み時に楽天モバイル公式情報をご確認ください。", "※ 年龄、适用套餐和报名等均有条件。优惠金额、名称和条件可能变更，申请时请确认乐天移动官方信息。"],
  ["電波状況と家族向け割引を確認できた方へ", "已确认网络覆盖和家庭优惠的用户"], ["他社から乗り換えで14,000ポイント", "从其他运营商携号转网可获14,000积分"],
  ["エリアと割引を確認できたら、紹介キャンペーンの条件を確認して申し込みへ進めます。", "确认网络覆盖和优惠后，请查看推荐活动条件并继续申请。"],
  ["14,000ポイント特典を確認する", "查看14,000积分优惠"], ["他社から乗り換えで", "从其他运营商携号转网"],
  ["14,000ポイント", "14,000积分"], ["特典を確認する", "查看优惠"],
];

function localizeChineseCoverage(value: string, relativePath: string): string {
  const match = relativePath.match(/^tokyo\/coverage\/([^/]+)$/);
  if (!match) return value;
  const names = chineseTokyoMunicipalities[match[1]];
  if (!names) throw new Error(`Missing Chinese municipality name for ${match[1]}`);
  const [japaneseName, chineseName] = names;
  let localized = value.replaceAll(japaneseName, chineseName);
  for (const [from, to] of chineseCoverageReplacements) localized = localized.replaceAll(from, to);
  localized = localized
    .replace(new RegExp(`${chineseName}は直近2回の基地局新設一覧には掲載されていません。これは圏外を意味するものではありません。現在の提供状況は公式エリアマップで地点ごとに確認してください。`, "g"), `${chineseName}未列入最近两次的新建基站名单。这并不表示该地区没有信号，请通过官方区域地图逐点确认当前覆盖情况。`)
    .replace(new RegExp(`${chineseName}では、最新で([^<。]+)に基地局設置が完了したと楽天モバイルが発表しています。`, "g"), `${chineseName}方面，乐天移动公布最新基站于$1完成设置。`)
    .replace(new RegExp(`${chineseName}には掲載データ上、楽天モバイルショップが(\\d+)店舗あります。対面で相談したい場合の選択肢になります。`, "g"), `${chineseName}在本站数据中有$1家乐天移动门店，可作为面对面咨询的选择。`)
    .replace(new RegExp(`${chineseName}内に楽天モバイルショップが見つからない場合も、申し込みやMNPはオンラインで進められます。`, "g"), `即使在${chineseName}没有找到乐天移动门店，也可以在线办理申请和携号转网。`)
    .replaceAll(`${chineseName}で相談したい場合`, `在${chineseName}需要咨询时`)
    .replaceAll(`${chineseName}のエリア改善情報`, `${chineseName}的网络改善信息`)
    .replaceAll(`${chineseName}の電波状況`, `${chineseName}的网络覆盖情况`)
    .replaceAll(`${chineseName}の`, `${chineseName}的`)
    .replaceAll("基地局の新設情報あり", "有新建基站信息")
    .replaceAll("複数の基地局新設情報あり", "有多个新建基站信息")
    .replaceAll("4G・5Gの改善情報あり", "有4G和5G改善信息")
    .replaceAll("直近の公式発表で基地局の新設が確認でき、エリア改善が進められています。", "最近的官方公告确认了新建基站，网络覆盖正在改善。")
    .replaceAll("直近の公式発表で2局の基地局新設が確認でき、エリア改善の動きが見られます。", "最近的官方公告确认新建了两座基站，网络覆盖正在改善。")
    .replaceAll("直近の公式発表で4Gと5Gの基地局新設が確認でき、通信環境の改善が進められています。", "最近的官方公告确认新建了4G和5G基站，通信环境正在改善。")
    .replaceAll("設置完了", "设置完成")
    .replace(/([^\"<]+)的乐天移动网络覆盖情况を、公式エリア情報と直近の基地局設置発表から確認。家庭・こども・青春・シニア向け特典と紹介キャンペーンも解説します。/g, "$1的乐天移动网络覆盖情况可通过官方区域信息和近期基站建设公告确认。本文还介绍适合家庭、儿童、青年和老年用户的优惠及推荐活动。")
    .replaceAll("利用する方を選択", "选择使用者")
    .replaceAll("最強家庭割", "最强家庭优惠")
    .replaceAll("離れて暮らす家庭も対象。対象の家庭グループに参加すると、1人あたり月額110円（税込）が割り引かれます。", "分开居住的家庭成员也可参加。加入符合条件的家庭群组后，每人每月可优惠110日元（含税）。")
    .replaceAll("電波状況と家庭向け割引を確認できた方へ", "已确认网络覆盖和家庭优惠的用户")
    .replaceAll("紹介キャンペーンの条件を確認する", "查看推荐活动条件");
  return localized;
}

export type LegacyLanguagePage = {
  title: string;
  description: string;
  robots: string;
  schemas: string[];
  mainHtml: string;
  localScripts: string[];
};

export type LegacyShopPage = LegacyLanguagePage & {
  prefecture: MigratedPrefectureSlug;
  prefectureLabel: string;
  carrier: string;
  slug: string;
  breadcrumbHtml: string;
  hero: { eyebrowHtml: string; headingHtml: string; leadHtml: string; shopCardHtml: string };
  middleHtml: string;
  updated: string;
};

export type LegacyGuidePage = LegacyLanguagePage & { route: string };
export type LegacyCoveragePage = LegacyLanguagePage & {
  prefecture: MigratedPrefectureSlug;
  slug: string;
};

function capture(html: string, pattern: RegExp, label: string, sourcePath: string): string {
  const match = html.match(pattern);
  if (!match) throw new Error(`${label} was not found in ${sourcePath}`);
  return match[1].trim();
}

function decodeAttribute(value: string): string {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
}

export function localizeLegacyHtml(html: string, locale: ForeignLocale): string {
  let localized = html;
  for (const [from, to] of Object.entries(workerOrigins)) localized = localized.replaceAll(from, to);
  const localePrefixes = Object.values(LOCALE_CONFIG)
    .map((config) => config.pathPrefix.replace(/^\//, ""))
    .filter(Boolean)
    .join("|");
  localized = localized.replace(
    new RegExp(`((?:href|src)=(["']))\\/(?!\\/|(?:${localePrefixes})(?:\\/|$))([^"']*)`, "g"),
    `$1/${locale}/$3`,
  );
  for (const [from, to] of legacyLanguageConfig[locale].replacements) localized = localized.replaceAll(from, to);
  return localized;
}

function localizeLegacySchema(schema: string, locale: ForeignLocale, relativePath: string): string {
  const localized = locale === "zh"
    ? localizeChineseCoverage(localizeLegacyHtml(schema, locale), relativePath)
    : localizeLegacyHtml(schema, locale);
  try {
    const parsed = JSON.parse(localized) as Record<string, unknown>;
    if (parsed["@type"] === "WebPage") {
      parsed.url = getAbsoluteLocaleUrl(locale, `/${relativePath}/`);
      parsed.inLanguage = LOCALE_CONFIG[locale].inLanguage;
    }
    return JSON.stringify(parsed);
  } catch {
    return localized;
  }
}

export function createLegacyLanguageLoader(locale: ForeignLocale) {
  const legacyRoot = path.resolve(process.cwd(), "..", locale);
  const prefectureSlugs = Object.keys(migratedPrefectures) as MigratedPrefectureSlug[];

  function loadLegacyPage(relativePath: string): LegacyLanguagePage {
    const sourcePath = path.join(legacyRoot, relativePath, "index.html");
    const html = readFileSync(sourcePath, "utf8");
    return {
      title: decodeAttribute(localizeChineseCoverage(capture(html, /<title>([\s\S]*?)<\/title>/i, "title", sourcePath), locale === "zh" ? relativePath : "")),
      description: decodeAttribute(localizeChineseCoverage(capture(html, /<meta\s+name="description"\s+content="([^"]*)"/i, "description", sourcePath), locale === "zh" ? relativePath : "")),
      robots: capture(html, /<meta\s+name="robots"\s+content="([^"]*)"/i, "robots", sourcePath),
      schemas: [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
        .map((match) => localizeLegacySchema(match[1].trim(), locale, relativePath)),
      mainHtml: (() => {
        const localized = localizeLegacyHtml(
          capture(html, /(<main\b[^>]*>[\s\S]*?<\/main>)/i, "main", sourcePath)
            .replace(/\s*<script\b[^>]*src="\/js\/[^"]+"[^>]*><\/script>/gi, ""),
          locale,
        );
        return locale === "zh" ? localizeChineseCoverage(localized, relativePath) : localized;
      })(),
      localScripts: [...html.matchAll(/<script\b[^>]*src="(\/js\/[^"]+)"[^>]*><\/script>/gi)]
        .map((match) => `/${locale}${match[1]}`)
        .filter((script) => !script.endsWith("analytics.js")),
    };
  }

  function loadSitemap(): string {
    let sitemap = readFileSync(path.join(legacyRoot, "sitemap.xml"), "utf8");
    for (const [from, to] of Object.entries(workerOrigins)) sitemap = sitemap.replaceAll(from, to);
    return sitemap;
  }

  function loadRobots(): string {
    let robots = readFileSync(path.join(legacyRoot, "robots.txt"), "utf8");
    for (const [from, to] of Object.entries(workerOrigins)) robots = robots.replaceAll(from, to);
    return robots.replace(/^Sitemap:\s*.*$/m, `Sitemap: ${getAbsoluteLocaleUrl(locale, "/sitemap.xml").replace(/\/$/, "")}`);
  }

  function parseShop(prefecture: MigratedPrefectureSlug, carrier: string, slug: string): LegacyShopPage {
    const relativePath = `${prefecture}/${carrier}/${slug}`;
    const page = loadLegacyPage(relativePath);
    const mainHtml = page.mainHtml;
    const heroMatch = mainHtml.match(/<section class="shop-hero">([\s\S]*?)<\/section>/i);
    if (!heroMatch || heroMatch.index === undefined) throw new Error(`${relativePath}: shop hero was not found`);
    const finalIndex = mainHtml.indexOf('<section class="final-cta"');
    if (finalIndex < 0) throw new Error(`${relativePath}: final CTA was not found`);
    const heroHtml = heroMatch[1];
    const breadcrumbHtml = capture(mainHtml, /(<nav class="breadcrumb"[\s\S]*?<\/nav>)/i, "breadcrumb", relativePath);
    const breadcrumbLinks = [...breadcrumbHtml.matchAll(/<a\b[^>]*>([^<]+)<\/a>/gi)];
    const prefectureLabel = decodeAttribute(breadcrumbLinks.at(-1)?.[1]?.trim() ?? prefecture);
    const updatedHtml = capture(mainHtml, /<p class="updated">([\s\S]*?)<\/p>/i, "updated date", relativePath);
    return {
      ...page,
      prefecture,
      prefectureLabel,
      carrier,
      slug,
      breadcrumbHtml,
      hero: {
        eyebrowHtml: capture(heroHtml, /<p class="eyebrow">([\s\S]*?)<\/p>/i, "hero eyebrow", relativePath),
        headingHtml: capture(heroHtml, /<h1>([\s\S]*?)<\/h1>/i, "hero heading", relativePath),
        leadHtml: capture(heroHtml, /<p class="lead">([\s\S]*?)<\/p>/i, "hero lead", relativePath),
        shopCardHtml: capture(heroHtml, /<aside class="shop-card">([\s\S]*?)<\/aside>/i, "shop card", relativePath),
      },
      middleHtml: mainHtml.slice(heroMatch.index + heroMatch[0].length, finalIndex).trim(),
      updated: decodeAttribute(updatedHtml.replace(/^[^:：]*[:：]\s*/, "").trim()),
    };
  }

  function loadShopPages(): LegacyShopPage[] {
    return prefectureSlugs.flatMap((prefecture) => {
      const prefectureRoot = path.join(legacyRoot, prefecture);
      return readdirSync(prefectureRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && entry.name !== "coverage")
        .map((entry) => entry.name)
        .sort()
        .flatMap((carrier) => {
          const carrierRoot = path.join(prefectureRoot, carrier);
          return readdirSync(carrierRoot, { withFileTypes: true })
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name)
            .sort()
            .filter((slug) => existsSync(path.join(carrierRoot, slug, "index.html")))
            .map((slug) => parseShop(prefecture, carrier, slug));
        });
    });
  }

  function loadGuidePages(): LegacyGuidePage[] {
    const guideRoot = path.join(legacyRoot, "guide");
    const routes: string[] = [];
    const visit = (directory: string, segments: string[]) => {
      if (existsSync(path.join(directory, "index.html"))) routes.push(segments.join("/"));
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        if (entry.isDirectory()) visit(path.join(directory, entry.name), [...segments, entry.name]);
      }
    };
    visit(guideRoot, []);
    return routes.filter(Boolean).sort().map((route) => ({ route, ...loadLegacyPage(`guide/${route}`) }));
  }

  function loadCoveragePages(): LegacyCoveragePage[] {
    return prefectureSlugs.flatMap((prefecture) => {
      const coverageRoot = path.join(legacyRoot, prefecture, "coverage");
      if (!existsSync(coverageRoot)) return [];
      return readdirSync(coverageRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && existsSync(path.join(coverageRoot, entry.name, "index.html")))
        .map((entry) => entry.name)
        .sort()
        .map((slug) => ({ prefecture, slug, ...loadLegacyPage(`${prefecture}/coverage/${slug}`) }));
    });
  }

  return {
    locale,
    legacyRoot,
    prefectureSlugs,
    shopListLabel: legacyLanguageConfig[locale].shopListLabel,
    loadLegacyPage,
    loadSitemap,
    loadRobots,
    parseShop,
    loadShopPages,
    loadGuidePages,
    loadCoveragePages,
  };
}
