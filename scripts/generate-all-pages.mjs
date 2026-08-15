import { spawn } from "node:child_process";
import path from "node:path";

const generator = path.join(import.meta.dirname, "generate-hokkaido-pages.mjs");
const prefectures = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "新潟県", "栃木県", "群馬県", "茨城県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "長野県", "山梨県", "富山県", "石川県", "福井県", "静岡県", "愛知県", "岐阜県", "三重県",
  "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県", "鳥取県", "島根県",
  "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県", "福岡県",
  "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];

for (const prefecture of prefectures) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [generator, `--prefecture=${prefecture}`], { stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`${prefecture} generation failed with exit code ${code}`)));
  });
}

console.log(`Generated all ${prefectures.length} prefectures.`);
