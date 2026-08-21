#!/bin/sh
set -eu

node scripts/prepare-language-workers.mjs
node scripts/build-sitemap.mjs
sh scripts/prepare-japanese-worker.sh
npx wrangler deploy --config wrangler.jsonc
for language in en zh ko vi pt; do
  npx wrangler deploy --config "wrangler.${language}.jsonc"
done
