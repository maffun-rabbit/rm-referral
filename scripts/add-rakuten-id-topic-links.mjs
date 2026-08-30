import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const slug = "create-rakuten-id-step-by-step";
const content = {
  en: {
    title: "How to Create a Rakuten ID in Japan: Step-by-Step Visual Guide",
    description: "Screenshots explain every Japanese field before you apply for Rakuten Mobile.",
  },
  vi: {
    title: "Cách tạo Rakuten ID tại Nhật: hướng dẫn từng bước bằng hình ảnh",
    description: "Ảnh chụp màn hình giải thích từng mục tiếng Nhật trước khi đăng ký Rakuten Mobile.",
  },
  zh: {
    title: "在日本创建Rakuten ID：带截图的分步指南",
    description: "通过截图逐项说明日文注册页面，帮助你在申请Rakuten Mobile前完成注册。",
  },
  ko: {
    title: "일본에서 Rakuten ID 만드는 방법: 화면으로 보는 단계별 가이드",
    description: "Rakuten Mobile 신청 전 일본어 입력 항목을 화면 캡처로 설명합니다.",
  },
  pt: {
    title: "Como criar um Rakuten ID no Japão: guia visual passo a passo",
    description: "As capturas explicam cada campo em japonês antes da solicitação da Rakuten Mobile.",
  },
};

for (const [locale, copy] of Object.entries(content)) {
  const file = path.join(root, locale, "guide", "topics", "index.html");
  const original = await readFile(file, "utf8");
  if (original.includes(`/guide/topics/${slug}/`)) continue;
  const origin = `https://rm-referral-${locale}.maffun.workers.dev`;
  const card = `<article><h2 style="font-size:21px"><a href="${origin}/guide/topics/${slug}/">${copy.title}</a></h2><p>${copy.description}</p></article>`;
  const updated = original.replace('<div class="cards-three">', `<div class="cards-three">${card}`);
  if (updated === original) throw new Error(`${locale}: cards-three container not found`);
  await writeFile(file, updated, "utf8");
  console.log(`Added Rakuten ID visual guide to ${locale} topic index.`);
}
