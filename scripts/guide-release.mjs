import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {inventory, sha256} from './deploy-boundary.mjs';
import {inventorySha256} from './promotion-release.mjs';
import {CANONICAL_LOCALES, getPublicPrefix} from './locale-mapping.mjs';

export const GUIDE_RELEASE_ROUTE = 'guide/replacement-program';
const fail = message => { throw new Error(`GUIDE RELEASE GUARD: ${message}`); };

export function guideReleaseMapping(locale) {
  if (!CANONICAL_LOCALES.includes(locale)) fail(`Unknown locale: ${locale}`);
  const publicPrefix = getPublicPrefix(locale);
  const pathname = `${publicPrefix}/${GUIDE_RELEASE_ROUTE}/`;
  return Object.freeze({
    locale,
    route: GUIDE_RELEASE_ROUTE,
    pathname,
    assetPath: `${pathname}index.html`,
  });
}

export function verifyExactGuidePath(locale, pathname) {
  const expected = guideReleaseMapping(locale).pathname;
  if (typeof pathname !== 'string' || pathname !== expected) fail(`Unauthorized Guide pathname: ${pathname}`);
  return expected;
}

export async function verifyGuideCandidate({locale, baseline, candidate, approvedPathname}) {
  const mapping = guideReleaseMapping(locale);
  verifyExactGuidePath(locale, approvedPathname);
  const before = await inventory(path.resolve(baseline));
  const after = await inventory(path.resolve(candidate));
  const added = [], changed = [], deleted = [];
  for (const key of Object.keys(before)) {
    if (!after[key]) deleted.push(key);
    else if (before[key].sha256 !== after[key].sha256 || before[key].size !== after[key].size) changed.push(key);
  }
  for (const key of Object.keys(after)) if (!before[key]) added.push(key);
  if (added.length || deleted.length || changed.length !== 1 || changed[0] !== mapping.assetPath)
    fail(`Diff outside exact Guide allowlist: ${JSON.stringify({added, changed, deleted})}`);
  return {
    schema: 1,
    kind: 'guide-single-page',
    locale,
    route: mapping.route,
    approvedPathname: mapping.pathname,
    assetPath: mapping.assetPath,
    baselineFileCount: Object.keys(before).length,
    candidateFileCount: Object.keys(after).length,
    baselineInventorySha256: inventorySha256(before),
    candidateInventorySha256: inventorySha256(after),
    added,
    changed,
    deleted,
    unexpected: [],
  };
}

export async function verifyGuidePlan({plan, approvedPlanSha256, baseline, candidate}) {
  if (!plan || plan.schema !== 1 || plan.kind !== 'guide-single-page') fail('Invalid plan');
  if (sha256(Buffer.from(JSON.stringify(plan))) !== approvedPlanSha256) fail('Plan hash mismatch');
  const result = await verifyGuideCandidate({locale: plan.locale, baseline, candidate, approvedPathname: plan.approvedPathname});
  for (const key of ['assetPath','baselineFileCount','candidateFileCount','baselineInventorySha256','candidateInventorySha256'])
    if (plan[key] !== result[key]) fail(`Plan binding mismatch: ${key}`);
  if (JSON.stringify(plan.changed) !== JSON.stringify(result.changed) || plan.added?.length || plan.deleted?.length || plan.unexpected?.length)
    fail('Plan diff binding mismatch');
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [mode, planFile, baseline, candidate] = process.argv.slice(2);
  if (mode !== 'check' || !planFile || !baseline || !candidate) fail('Usage: guide-release.mjs check <plan.json> <baseline> <candidate>');
  const bytes = await readFile(path.resolve(planFile));
  const plan = JSON.parse(bytes);
  console.log(JSON.stringify(await verifyGuidePlan({plan, approvedPlanSha256: sha256(bytes), baseline, candidate}), null, 2));
}
