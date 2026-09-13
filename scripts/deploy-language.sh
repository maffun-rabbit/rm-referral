#!/bin/sh
set -eu
script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
cd "$script_dir/.."
exec node scripts/release.mjs deploy "${1:-}"
