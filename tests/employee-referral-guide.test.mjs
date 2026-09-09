import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../guide/referral-campaign-how-to/index.html', import.meta.url), 'utf8');
const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);

test('employee campaign source, amounts and unchanged referral URL', () => {
  assert.ok(html.includes('https://network.mobile.rakuten.co.jp/campaign/referral-application-employee/'));
  assert.ok(html.includes('14,000ポイント'));
  assert.ok(html.includes('11,000ポイント'));
  assert.ok(html.includes('href="https://r10.to/hNearm"'));
  assert.ok(html.includes('data-primary-cta'));
  assert.ok(html.includes('rel="sponsored nofollow noopener"'));
  assert.ok(html.includes('src="/js/analytics.js"'));
});

test('generic campaign claims do not survive the employee correction', () => {
  for (const obsolete of ['13,000ポイント', '10,000ポイント', 'campaign/referral/"', '紹介者にも楽天ポイントが進呈', '申込みを先に始めると特典対象外']) {
    assert.ok(!html.includes(obsolete), obsolete);
  }
});

test('eligibility, rescue and current Link requirement are explicit', () => {
  for (const required of ['申込み日を含めて7日以内', '証跡', '再契約', '最大5回線', '2026年3月2日9:00', '翌々月末日23:59', '10秒以上', '間接紹介', '併用']) {
    assert.ok(html.includes(required), required);
  }
});

test('structured steps match current visible instructions', () => {
  assert.equal(schema['@type'], 'HowTo');
  assert.equal(schema.dateModified, '2026-09-09');
  assert.equal(schema.step.length, 4);
  assert.match(schema.name, /社員紹介/);
  assert.match(schema.step[1].text, /7日以内/);
  assert.match(schema.step[2].text, /翌々月末日23:59/);
  assert.match(schema.step[3].text, /2026年3月2日9:00/);
  assert.match(schema.step[3].text, /10秒以上/);
});

test('canonical and document structure are preserved', () => {
  assert.ok(html.includes('rel="canonical" href="https://mnp-navi.jp/guide/referral-campaign-how-to/"'));
  assert.equal((html.match(/<h1>/g) || []).length, 1);
  assert.equal((html.match(/<main\b/g) || []).length, 1);
  for (const tag of ['section','aside','article','ul','ol','li','p']) {
    assert.equal((html.match(new RegExp('<'+tag+'(?: |>)','g')) || []).length, (html.match(new RegExp('</'+tag+'>','g')) || []).length, tag);
  }
});
