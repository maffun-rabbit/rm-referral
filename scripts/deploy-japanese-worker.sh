#!/bin/sh
set -eu

npm --prefix astro-site test
node scripts/prepare-japanese-assets.mjs
node scripts/validate-japanese-overlay.mjs
npx wrangler deploy --config wrangler.jsonc
