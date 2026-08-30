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

const koreanTokyoMunicipalities: Record<string, readonly [string, string]> = {
  adachi: ["足立区", "아다치구"], akiruno: ["あきる野市", "아키루노시"], akishima: ["昭島市", "아키시마시"],
  arakawa: ["荒川区", "아라카와구"], bunkyo: ["文京区", "분쿄구"], chiyoda: ["千代田区", "지요다구"],
  chofu: ["調布市", "조후시"], chuo: ["中央区", "주오구"], edogawa: ["江戸川区", "에도가와구"],
  fuchu: ["府中市", "후추시"], fussa: ["福生市", "훗사시"], hachijojimahachijo: ["八丈島八丈町", "하치조마치"],
  hachioji: ["八王子市", "하치오지시"], hamura: ["羽村市", "하무라시"], higashikurume: ["東久留米市", "히가시쿠루메시"],
  higashimurayama: ["東村山市", "히가시무라야마시"], higashiyamato: ["東大和市", "히가시야마토시"], hino: ["日野市", "히노시"],
  inagi: ["稲城市", "이나기시"], itabashi: ["板橋区", "이타바시구"], katsushika: ["葛飾区", "가쓰시카구"],
  kita: ["北区", "기타구"], kiyose: ["清瀬市", "기요세시"], kodaira: ["小平市", "고다이라시"],
  koganei: ["小金井市", "고가네이시"], kokubunji: ["国分寺市", "고쿠분지시"], kokuritsu: ["国立市", "구니타치시"],
  komae: ["狛江市", "고마에시"], koto: ["江東区", "고토구"], machida: ["町田市", "마치다시"],
  meguro: ["目黒区", "메구로구"], minato: ["港区", "미나토구"], mitaka: ["三鷹市", "미타카시"],
  musashimurayama: ["武蔵村山市", "무사시무라야마시"], musashino: ["武蔵野市", "무사시노시"], nakano: ["中野区", "나카노구"],
  nerima: ["練馬区", "네리마구"], "nishitama-hinode": ["西多摩郡日の出町", "니시타마군 히노데마치"],
  "nishitama-mizuho": ["西多摩郡瑞穂町", "니시타마군 미즈호마치"], nishitokyo: ["西東京市", "니시토쿄시"],
  oshima: ["大島町", "오시마마치"], ota: ["大田区", "오타구"], oume: ["青梅市", "오메시"],
  setagaya: ["世田谷区", "세타가야구"], shibuya: ["渋谷区", "시부야구"], shinagawa: ["品川区", "시나가와구"],
  shinjuku: ["新宿区", "신주쿠구"], suginami: ["杉並区", "스기나미구"], sumida: ["墨田区", "스미다구"],
  taito: ["台東区", "다이토구"], tama: ["多摩市", "다마시"], tatsukawa: ["立川市", "다치카와시"],
  toshima: ["豊島区", "도시마구"],
};

const koreanCoverageReplacements: readonly (readonly [string, string])[] = [
  ["東京都", "도쿄도"], ["楽天モバイル電波状況", "라쿠텐 모바일 전파 상황"],
  ["エリア・基地局の最新情報", "서비스 지역·기지국 최신 정보"], ["楽天モバイル乗り換えガイド", "라쿠텐 모바일 번호이동 가이드"],
  ["公式の基地局設置発表をもとに、現在確認できる改善情報を整理しました。生活圏での最終確認方法と、家族で使える割引もまとめています。", "공식 기지국 설치 발표를 바탕으로 현재 확인 가능한 개선 정보를 정리했습니다. 생활권에서 최종 확인하는 방법과 가족 할인도 함께 안내합니다."],
  ["現在の確認目安", "현재 확인 기준"], ["生活圏ごとの確認がおすすめ", "생활권별 확인을 권장합니다"],
  ["市区町村全体を一律に良い・悪いとは判定できないため、自宅・学校・勤務先など実際に使う地点を公式エリアマップで確認してください。", "지역 전체의 통신 품질을 일률적으로 판단할 수 없으므로 집, 학교, 직장 등 실제 이용 장소를 공식 서비스 지역 지도에서 확인해 주세요."],
  ["公式エリアマップで地点を確認する", "공식 서비스 지역 지도에서 확인하기"], ["他社から乗り換えで14,000ポイントを確認する", "타사 번호이동 14,000포인트 혜택 확인"],
  ["今いる場所に近い情報も確認できます", "현재 위치 주변 정보도 확인할 수 있습니다"], ["位置情報はブラウザ内の判定だけに使用します", "위치 정보는 브라우저 내 주변 지역 판정에만 사용됩니다"],
  ["現在地周辺を見る", "현재 위치 주변 보기"], ["直近2回の公式発表について", "최근 2회의 공식 발표"],
  ["直近の基地局設置実績", "최근 기지국 설치 실적"], ["新設基地局", "신설 기지국"],
  ["確認対象：楽天モバイル公式「Rakuten最強プランプロジェクト進行中！」／2026年8月17日更新（外部リンクなし）", "확인 자료: 라쿠텐 모바일 공식 ‘Rakuten 최강 플랜 프로젝트 진행 중!’ / 2026년 8월 17일 업데이트"],
  ["出典：楽天モバイル公式「Rakuten最強プランプロジェクト進行中！」／2026年8月17日更新（外部リンクなし）", "출처: 라쿠텐 모바일 공식 ‘Rakuten 최강 플랜 프로젝트 진행 중!’ / 2026년 8월 17일 업데이트"],
  ["※ 基地局の新設は改善を示す情報ですが、特定地点の電波強度や通信速度を保証するものではありません。屋内・地下・地形・混雑状況・対応端末によって利用状況は変わります。", "※ 기지국 신설은 통신 환경 개선을 나타내지만 특정 장소의 전파 강도나 통신 속도를 보장하지 않습니다. 실내, 지하, 지형, 혼잡도, 단말기에 따라 이용 상황이 달라질 수 있습니다."],
  ["契約前に確認したい3つの場所", "계약 전에 확인할 3곳"], ["自宅", "집"], ["学校・勤務先", "학교·직장"], ["よく行く施設", "자주 가는 시설"],
  ["部屋の位置や建物の構造でも変わるため、住所付近を公式エリアマップで拡大して確認します。", "방 위치와 건물 구조에 따라서도 달라지므로 공식 서비스 지역 지도에서 주소 주변을 확대해 확인하세요."],
  ["毎日長く滞在する場所と、その周辺の通学・通勤経路も合わせて確認します。", "매일 오래 머무는 장소와 통학·통근 경로 주변도 함께 확인하세요."],
  ["地下、駅、大型商業施設など、通信をよく使う場所は個別に確認しておくと安心です。", "지하, 역, 대형 상업 시설 등 통신을 자주 이용하는 장소는 개별적으로 확인하는 것이 좋습니다."],
  ["家族の年代に合わせて使える割引", "가족 연령에 맞는 할인"], ["利用する方：", "이용자:"],
  ["家族みんな", "가족 모두"], ["家族", "가족"], ["12歳以下", "12세 이하"], ["12歳まで", "12세까지"],
  ["13〜22歳", "13~22세"], ["65歳以上", "65세 이상"], ["最強家族割", "최강 가족 할인"],
  ["毎月110円引き", "매월 110엔 할인"], ["離れて暮らす家族も対象。対象の家族グループに参加すると、1人あたり月額110円（税込）が割り引かれます。", "따로 사는 가족도 대상입니다. 대상 가족 그룹에 참여하면 1인당 매월 110엔(세금 포함)이 할인됩니다."],
  ["最強こども割", "최강 어린이 할인"], ["3GBまで毎月440円引き", "3GB까지 매월 440엔 할인"],
  ["データ利用量が3GB以下の場合は毎月440円（税込）、それ以外の場合は毎月110円（税込）が割り引かれます。", "데이터 이용량이 3GB 이하이면 매월 440엔, 그 이상이면 매월 110엔(세금 포함)이 할인됩니다."],
  ["最強青春割", "최강 청춘 할인"], ["13歳から22歳までを対象に、毎月110円（税込）が割り引かれます。適用手続きが必要です。", "13~22세 이용자는 매월 110엔(세금 포함)이 할인되며 적용 절차가 필요합니다."],
  ["最強シニアプログラム", "최강 시니어 프로그램"], ["毎月110ポイント還元", "매월 110포인트 환급"],
  ["条件を満たすと毎月110ポイントを還元。通話や店頭サポートなどをまとめた対象オプションの還元もあります。", "조건을 충족하면 매월 110포인트를 받을 수 있으며 통화와 매장 지원 등을 묶은 대상 옵션의 환급도 있습니다."],
  ["※ 年齢、対象プラン、エントリーなどの条件があります。割引額・名称・条件は変更される場合があるため、申し込み時に楽天モバイル公式情報をご確認ください。", "※ 연령, 대상 요금제, 신청 등 조건이 있습니다. 할인 금액과 명칭, 조건은 변경될 수 있으므로 신청 시 라쿠텐 모바일 공식 정보를 확인해 주세요."],
  ["電波状況と家族向け割引を確認できた方へ", "전파 상황과 가족 할인을 확인하셨다면"], ["他社から乗り換えで14,000ポイント", "타사 번호이동 시 14,000포인트"],
  ["エリアと割引を確認できたら、紹介キャンペーンの条件を確認して申し込みへ進めます。", "서비스 지역과 할인을 확인한 후 추천 캠페인 조건을 확인하고 신청하세요."],
  ["14,000ポイント特典を確認する", "14,000포인트 혜택 확인"], ["他社から乗り換えで", "타사에서 번호이동 시"],
  ["14,000ポイント", "14,000포인트"], ["特典を確認する", "혜택 확인"], ["利用する方を選択", "이용자 선택"],
  ["当サイトは個人が運営しており、楽天モバイル公式サイトではありません。", "이 사이트는 개인이 운영하며 라쿠텐 모바일 공식 사이트가 아닙니다."],
  ["掲載情報は公式発表をもとに整理しています。実際の通信状況と最新条件は公式サイトでご確認ください。", "게재 정보는 공식 발표를 바탕으로 정리했습니다. 실제 통신 상황과 최신 조건은 공식 사이트에서 확인해 주세요."],
];

function localizeKoreanCoverage(value: string, relativePath: string): string {
  const match = relativePath.match(/^tokyo\/coverage\/([^/]+)$/);
  if (!match) return value;
  const names = koreanTokyoMunicipalities[match[1]];
  if (!names) throw new Error(`Missing Korean municipality name for ${match[1]}`);
  const [japaneseName, koreanName] = names;
  let localized = value.replaceAll(japaneseName, koreanName);
  for (const [from, to] of koreanCoverageReplacements) localized = localized.replaceAll(from, to);
  localized = localized
    .replace(new RegExp(`${koreanName}は直近2回の基地局新設一覧には掲載されていません。これは圏外を意味するものではありません。現在の提供状況は公式エリアマップで地点ごとに確認してください。`, "g"), `${koreanName}는 최근 2회의 신설 기지국 목록에 포함되지 않았습니다. 이것이 서비스 불가 지역이라는 뜻은 아니므로 공식 서비스 지역 지도에서 장소별 현재 상황을 확인해 주세요.`)
    .replace(new RegExp(`${koreanName}では、最新で([^<。]+)に基地局設置が完了したと楽天モバイルが発表しています。`, "g"), `라쿠텐 모바일은 ${koreanName}에서 최근 $1에 기지국 설치를 완료했다고 발표했습니다.`)
    .replace(new RegExp(`${koreanName}には掲載データ上、楽天モバイルショップが(\\d+)店舗あります。対面で相談したい場合の選択肢になります。`, "g"), `게재 데이터상 ${koreanName}에는 라쿠텐 모바일 매장이 $1곳 있어 대면 상담 선택지가 됩니다.`)
    .replace(new RegExp(`${koreanName}内に楽天モバイルショップが見つからない場合も、申し込みやMNPはオンラインで進められます。`, "g"), `${koreanName} 안에서 라쿠텐 모바일 매장을 찾지 못해도 신청과 MNP는 온라인으로 진행할 수 있습니다.`)
    .replaceAll(`${koreanName}で相談したい場合`, `${koreanName}에서 상담하려면`)
    .replaceAll(`${koreanName}のエリア改善情報`, `${koreanName}의 서비스 지역 개선 정보`)
    .replaceAll(`${koreanName}の電波状況`, `${koreanName}의 전파 상황`)
    .replaceAll(`${koreanName}の`, `${koreanName}의 `)
    .replaceAll("基地局の新設情報あり", "신설 기지국 정보 있음")
    .replaceAll("複数の基地局新設情報あり", "여러 신설 기지국 정보 있음")
    .replaceAll("4G・5Gの改善情報あり", "4G·5G 개선 정보 있음")
    .replaceAll("直近の公式発表で基地局の新設が確認でき、エリア改善が進められています。", "최근 공식 발표에서 기지국 신설이 확인되어 서비스 지역 개선이 진행 중입니다.")
    .replaceAll("直近の公式発表で2局の基地局新設が確認でき、エリア改善の動きが見られます。", "최근 공식 발표에서 기지국 2곳의 신설이 확인되어 서비스 지역 개선이 진행 중입니다.")
    .replaceAll("直近の公式発表で4Gと5Gの基地局新設が確認でき、通信環境の改善が進められています。", "최근 공식 발표에서 4G와 5G 기지국 신설이 확인되어 통신 환경이 개선되고 있습니다.")
    .replaceAll("設置完了", "설치 완료")
    .replaceAll("最強가족割", "최강 가족 할인")
    .replaceAll("離れて暮らす가족も対象。対象の가족グループに参加すると、1人あたり月額110円（税込）が割り引かれます。", "따로 사는 가족도 대상입니다. 대상 가족 그룹에 참여하면 1인당 매월 110엔(세금 포함)이 할인됩니다.")
    .replaceAll("電波状況と가족向け割引を確認できた方へ", "전파 상황과 가족 할인을 확인하셨다면")
    .replaceAll("紹介キャンペーンの条件を確認する", "추천 캠페인 조건 확인")
    .replace(/([^\"<]+)의 라쿠텐 모바일 전파 상황を、公式エリア情報と直近の基地局設置発表から確認。家族・こども・青春・シニア向け特典と紹介キャンペーンも解説します。/g, "$1의 라쿠텐 모바일 전파 상황을 공식 서비스 지역 정보와 최근 기지국 설치 발표로 확인합니다. 가족·어린이·청년·시니어 혜택과 추천 캠페인도 안내합니다.");
  return localized;
}

const portugueseTokyoMunicipalities: Record<string, readonly [string, string]> = {
  adachi: ["足立区", "Adachi"], akiruno: ["あきる野市", "Akiruno"], akishima: ["昭島市", "Akishima"],
  arakawa: ["荒川区", "Arakawa"], bunkyo: ["文京区", "Bunkyo"], chiyoda: ["千代田区", "Chiyoda"],
  chofu: ["調布市", "Chofu"], chuo: ["中央区", "Chuo"], edogawa: ["江戸川区", "Edogawa"],
  fuchu: ["府中市", "Fuchu"], fussa: ["福生市", "Fussa"], hachijojimahachijo: ["八丈島八丈町", "Hachijo"],
  hachioji: ["八王子市", "Hachioji"], hamura: ["羽村市", "Hamura"], higashikurume: ["東久留米市", "Higashikurume"],
  higashimurayama: ["東村山市", "Higashimurayama"], higashiyamato: ["東大和市", "Higashiyamato"], hino: ["日野市", "Hino"],
  inagi: ["稲城市", "Inagi"], itabashi: ["板橋区", "Itabashi"], katsushika: ["葛飾区", "Katsushika"],
  kita: ["北区", "Kita"], kiyose: ["清瀬市", "Kiyose"], kodaira: ["小平市", "Kodaira"],
  koganei: ["小金井市", "Koganei"], kokubunji: ["国分寺市", "Kokubunji"], kokuritsu: ["国立市", "Kunitachi"],
  komae: ["狛江市", "Komae"], koto: ["江東区", "Koto"], machida: ["町田市", "Machida"],
  meguro: ["目黒区", "Meguro"], minato: ["港区", "Minato"], mitaka: ["三鷹市", "Mitaka"],
  musashimurayama: ["武蔵村山市", "Musashimurayama"], musashino: ["武蔵野市", "Musashino"], nakano: ["中野区", "Nakano"],
  nerima: ["練馬区", "Nerima"], "nishitama-hinode": ["西多摩郡日の出町", "Hinode, Nishitama"],
  "nishitama-mizuho": ["西多摩郡瑞穂町", "Mizuho, Nishitama"], nishitokyo: ["西東京市", "Nishitokyo"],
  oshima: ["大島町", "Oshima"], ota: ["大田区", "Ota"], oume: ["青梅市", "Ome"],
  setagaya: ["世田谷区", "Setagaya"], shibuya: ["渋谷区", "Shibuya"], shinagawa: ["品川区", "Shinagawa"],
  shinjuku: ["新宿区", "Shinjuku"], suginami: ["杉並区", "Suginami"], sumida: ["墨田区", "Sumida"],
  taito: ["台東区", "Taito"], tama: ["多摩市", "Tama"], tatsukawa: ["立川市", "Tachikawa"],
  toshima: ["豊島区", "Toshima"],
};

const portugueseCoverageReplacements: readonly (readonly [string, string])[] = [
  ["東京都", "Tóquio"], ["楽天モバイル電波状況", "cobertura da Rakuten Mobile"],
  ["エリア・基地局の最新情報", "informações recentes de cobertura e antenas"], ["楽天モバイル乗り換えガイド", "Guia de Migração para a Rakuten Mobile"],
  ["公式の基地局設置発表をもとに、現在確認できる改善情報を整理しました。生活圏での最終確認方法と、家族で使える割引もまとめています。", "Reunimos as melhorias confirmadas nos anúncios oficiais de instalação de antenas. Veja também como conferir sua área de uso e os descontos para famílias."],
  ["現在の確認目安", "Como verificar agora"], ["生活圏ごとの確認がおすすめ", "Confira cada local da sua rotina"],
  ["市区町村全体を一律に良い・悪いとは判定できないため、自宅・学校・勤務先など実際に使う地点を公式エリアマップで確認してください。", "A qualidade não é igual em todo o município. Confira no mapa oficial os locais onde você realmente usa o celular, como casa, escola e trabalho."],
  ["公式エリアマップで地点を確認する", "Verificar no mapa oficial de cobertura"], ["他社から乗り換えで14,000ポイントを確認する", "Ver oferta de 14.000 pontos na portabilidade"],
  ["今いる場所に近い情報も確認できます", "Você também pode consultar informações próximas"], ["位置情報はブラウザ内の判定だけに使用します", "A localização é usada somente no navegador para identificar áreas próximas"],
  ["現在地周辺を見る", "Ver perto da localização atual"], ["直近2回の公式発表について", "Sobre os dois anúncios oficiais mais recentes"],
  ["直近の基地局設置実績", "Instalações recentes de antenas"], ["新設基地局", "Nova antena"],
  ["確認対象：楽天モバイル公式「Rakuten最強プランプロジェクト進行中！」／2026年8月17日更新（外部リンクなし）", "Fonte consultada: anúncio oficial da Rakuten Mobile, atualizado em 17 de agosto de 2026"],
  ["出典：楽天モバイル公式「Rakuten最強プランプロジェクト進行中！」／2026年8月17日更新（外部リンクなし）", "Fonte: anúncio oficial da Rakuten Mobile, atualizado em 17 de agosto de 2026"],
  ["※ 基地局の新設は改善を示す情報ですが、特定地点の電波強度や通信速度を保証するものではありません。屋内・地下・地形・混雑状況・対応端末によって利用状況は変わります。", "※ Uma nova antena indica melhoria, mas não garante sinal ou velocidade em um ponto específico. O uso varia em ambientes internos, subterrâneos, conforme o relevo, a lotação e o aparelho."],
  ["契約前に確認したい3つの場所", "3 locais para conferir antes de contratar"], ["自宅", "Casa"], ["学校・勤務先", "Escola e trabalho"], ["よく行く施設", "Locais frequentados"],
  ["部屋の位置や建物の構造でも変わるため、住所付近を公式エリアマップで拡大して確認します。", "A posição do cômodo e a estrutura do prédio influenciam o sinal. Amplie o mapa oficial na região do endereço."],
  ["毎日長く滞在する場所と、その周辺の通学・通勤経路も合わせて確認します。", "Confira os locais onde passa mais tempo e também os trajetos de estudo ou trabalho."],
  ["地下、駅、大型商業施設など、通信をよく使う場所は個別に確認しておくと安心です。", "Confira separadamente locais como subsolos, estações e grandes centros comerciais onde costuma usar dados."],
  ["家族の年代に合わせて使える割引", "Descontos conforme a idade da família"], ["利用する方：", "Usuário:"], ["利用する方を選択", "Selecionar usuário"],
  ["家族みんな", "Toda a família"], ["家族", "Família"], ["12歳以下", "Até 12 anos"], ["12歳まで", "Até 12 anos"],
  ["13〜22歳", "13 a 22 anos"], ["65歳以上", "65 anos ou mais"], ["最強家族割", "Desconto Saikyo Kazoku"],
  ["毎月110円引き", "Desconto mensal de 110 ienes"], ["離れて暮らす家族も対象。対象の家族グループに参加すると、1人あたり月額110円（税込）が割り引かれます。", "Familiares que moram separados também podem participar. No grupo familiar elegível, cada pessoa recebe desconto mensal de 110 ienes, com impostos."],
  ["最強こども割", "Desconto Saikyo Kodomo"], ["3GBまで毎月440円引き", "Até 3 GB: desconto mensal de 440 ienes"],
  ["データ利用量が3GB以下の場合は毎月440円（税込）、それ以外の場合は毎月110円（税込）が割り引かれます。", "Com até 3 GB, o desconto mensal é de 440 ienes; acima disso, 110 ienes, com impostos."],
  ["最強青春割", "Desconto Saikyo Seishun"], ["13歳から22歳までを対象に、毎月110円（税込）が割り引かれます。適用手続きが必要です。", "Para usuários de 13 a 22 anos, oferece desconto mensal de 110 ienes, com impostos. É necessário solicitar o benefício."],
  ["最強シニアプログラム", "Programa Saikyo Senior"], ["毎月110ポイント還元", "110 pontos por mês"],
  ["条件を満たすと毎月110ポイントを還元。通話や店頭サポートなどをまとめた対象オプションの還元もあります。", "Ao cumprir as condições, você recebe 110 pontos por mês. Há também benefícios em opções elegíveis de chamadas e suporte em loja."],
  ["※ 年齢、対象プラン、エントリーなどの条件があります。割引額・名称・条件は変更される場合があるため、申し込み時に楽天モバイル公式情報をご確認ください。", "※ Há condições de idade, plano e inscrição. Valores, nomes e regras podem mudar; confirme as informações oficiais ao solicitar."],
  ["電波状況と家族向け割引を確認できた方へ", "Depois de conferir cobertura e descontos familiares"], ["他社から乗り換えで14,000ポイント", "14.000 pontos na portabilidade de outra operadora"],
  ["エリアと割引を確認できたら、紹介キャンペーンの条件を確認して申し込みへ進めます。", "Depois de confirmar a cobertura e os descontos, confira as condições da campanha de indicação e faça a solicitação."],
  ["紹介キャンペーンの条件を確認する", "Ver condições da campanha de indicação"], ["14,000ポイント特典を確認する", "Ver oferta de 14.000 pontos"],
  ["他社から乗り換えで", "Na portabilidade de outra operadora"], ["14,000ポイント", "14.000 pontos"], ["特典を確認する", "Ver oferta"],
  ["当サイトは個人が運営しており、楽天モバイル公式サイトではありません。", "Este site é operado de forma independente e não é o site oficial da Rakuten Mobile."],
  ["掲載情報は公式発表をもとに整理しています。実際の通信状況と最新条件は公式サイトでご確認ください。", "As informações são organizadas com base em anúncios oficiais. Confira a cobertura real e as condições atuais no site oficial."],
];

function localizePortugueseCoverage(value: string, relativePath: string): string {
  const match = relativePath.match(/^tokyo\/coverage\/([^/]+)$/);
  if (!match) return value;
  const names = portugueseTokyoMunicipalities[match[1]];
  if (!names) throw new Error(`Missing Portuguese municipality name for ${match[1]}`);
  const [japaneseName, portugueseName] = names;
  let localized = value
    .replaceAll(`東京都${japaneseName}の楽天モバイル電波状況｜エリア・基地局の最新情報`, `Cobertura da Rakuten Mobile em ${portugueseName}, Tóquio | Informações recentes de área e antenas`)
    .replaceAll(`東京都${japaneseName}の楽天モバイル電波状況を、公式エリア情報と直近の基地局設置発表から確認。家族・こども・青春・シニア向け特典と紹介キャンペーンも解説します。`, `Confira a cobertura da Rakuten Mobile em ${portugueseName}, Tóquio, com informações oficiais da área e anúncios recentes de antenas. Veja também benefícios por faixa etária e a campanha de indicação.`)
    .replaceAll(`東京都・${japaneseName}`, `Tóquio・${portugueseName}`)
    .replaceAll(`${japaneseName}の<br><span>楽天モバイル電波状況</span>`, `Cobertura da Rakuten Mobile<br><span>em ${portugueseName}</span>`)
    .replaceAll(japaneseName, portugueseName);
  for (const [from, to] of portugueseCoverageReplacements) localized = localized.replaceAll(from, to);
  localized = localized
    .replace(new RegExp(`${portugueseName}は直近2回の基地局新設一覧には掲載されていません。これは圏外を意味するものではありません。現在の提供状況は公式エリアマップで地点ごとに確認してください。`, "g"), `${portugueseName} não aparece nas duas listas mais recentes de novas antenas. Isso não significa ausência de cobertura; confira cada local no mapa oficial.`)
    .replace(new RegExp(`${portugueseName}では、最新で([^<。]+)に基地局設置が完了したと楽天モバイルが発表しています。`, "g"), `A Rakuten Mobile informou que a instalação mais recente de antena em ${portugueseName} foi concluída em $1.`)
    .replace(new RegExp(`${portugueseName}には掲載データ上、楽天モバイルショップが(\\d+)店舗あります。対面で相談したい場合の選択肢になります。`, "g"), `Segundo os dados publicados, há $1 loja da Rakuten Mobile em ${portugueseName}, uma opção para atendimento presencial.`)
    .replace(new RegExp(`${portugueseName}内に楽天モバイルショップが見つからない場合も、申し込みやMNPはオンラインで進められます。`, "g"), `Mesmo sem uma loja da Rakuten Mobile em ${portugueseName}, a solicitação e a portabilidade MNP podem ser feitas online.`)
    .replaceAll(`${portugueseName}で相談したい場合`, `Onde pedir ajuda em ${portugueseName}`)
    .replaceAll(`${portugueseName}のエリア改善情報`, `Melhorias de cobertura em ${portugueseName}`)
    .replaceAll(`${portugueseName}の電波状況`, `Cobertura em ${portugueseName}`)
    .replaceAll(`${portugueseName}の`, `de ${portugueseName} `)
    .replaceAll("基地局の新設情報あり", "Há informação de nova antena")
    .replaceAll("複数の基地局新設情報あり", "Há informações de várias novas antenas")
    .replaceAll("4G・5Gの改善情報あり", "Há informações de melhoria em 4G e 5G")
    .replaceAll("直近の公式発表で基地局の新設が確認でき、エリア改善が進められています。", "O anúncio oficial mais recente confirmou uma nova antena e a cobertura está sendo melhorada.")
    .replaceAll("直近の公式発表で2局の基地局新設が確認でき、エリア改善の動きが見られます。", "O anúncio oficial mais recente confirmou duas novas antenas e melhorias de cobertura.")
    .replaceAll("直近の公式発表で4Gと5Gの基地局新設が確認でき、通信環境の改善が進められています。", "O anúncio oficial mais recente confirmou novas antenas 4G e 5G e melhorias na rede.")
    .replaceAll("設置完了", "Instalação concluída")
    .replaceAll("最強Família割", "Desconto Saikyo Kazoku")
    .replaceAll("電波状況とFamília向け割引を確認できた方へ", "Depois de conferir cobertura e descontos familiares")
    .replace(/([^\"<]+)de ([^\"<]+) cobertura da Rakuten Mobileを、公式エリア情報と直近の基地局設置発表から確認。家族・こども・青春・シニア向け特典と紹介キャンペーンも解説します。/g, "Confira a cobertura da Rakuten Mobile em $2 com informações oficiais da área e anúncios recentes de antenas. Veja também benefícios familiares e a campanha de indicação.");
  return localized;
}

function localizeCoverage(value: string, locale: ForeignLocale, relativePath: string): string {
  if (locale === "zh") return localizeChineseCoverage(value, relativePath);
  if (locale === "ko") return localizeKoreanCoverage(value, relativePath);
  if (locale === "pt") return localizePortugueseCoverage(value, relativePath);
  return value;
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
  const localized = localizeCoverage(localizeLegacyHtml(schema, locale), locale, relativePath);
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
      title: decodeAttribute(localizeCoverage(capture(html, /<title>([\s\S]*?)<\/title>/i, "title", sourcePath), locale, relativePath)),
      description: decodeAttribute(localizeCoverage(capture(html, /<meta\s+name="description"\s+content="([^"]*)"/i, "description", sourcePath), locale, relativePath)),
      robots: capture(html, /<meta\s+name="robots"\s+content="([^"]*)"/i, "robots", sourcePath),
      schemas: [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
        .map((match) => localizeLegacySchema(match[1].trim(), locale, relativePath)),
      mainHtml: (() => {
        const localized = localizeLegacyHtml(
          capture(html, /(<main\b[^>]*>[\s\S]*?<\/main>)/i, "main", sourcePath)
            .replace(/\s*<script\b[^>]*src="\/js\/[^"]+"[^>]*><\/script>/gi, ""),
          locale,
        );
        return localizeCoverage(localized, locale, relativePath);
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
