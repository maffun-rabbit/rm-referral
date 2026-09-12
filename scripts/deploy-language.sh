#!/bin/sh
set -eu

script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
root="$(dirname -- "$script_dir")"
cd "$root"

# The static build exceeds Node's default 2 GiB heap in Workers Builds.
# Keep room for native allocations within the build runner's memory budget.
export NODE_OPTIONS="${NODE_OPTIONS:-} --max-old-space-size=6144"

locale="${1:-}"
if [ -z "$locale" ]; then
  echo "Usage: scripts/deploy-language.sh <ja|vi|en|zh|ko|pt>" >&2
  exit 2
fi

config="$(node -e "import('./scripts/language-config.mjs').then(({ requireLanguage }) => console.log(requireLanguage(process.argv[1]).config))" "$locale")"
node scripts/build-language.mjs "$locale"
npx wrangler deploy --config "$config"
