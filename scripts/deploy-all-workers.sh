#!/bin/sh
set -eu

node scripts/prepare-language-workers.mjs
node scripts/build-sitemap.mjs
node scripts/prepare-japanese-assets.mjs
npx wrangler deploy --config wrangler.jsonc
for language in en zh ko vi pt; do
  npx wrangler deploy --config "wrangler.${language}.jsonc"
done
