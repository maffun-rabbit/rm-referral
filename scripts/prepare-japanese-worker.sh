#!/bin/sh
set -eu

rm -rf .deploy/ja
mkdir -p .deploy/ja
rsync -a \
  --exclude='.git/' \
  --exclude='.deploy/' \
  --exclude='scripts/' \
  --exclude='data/' \
  --exclude='en/' \
  --exclude='zh/' \
  --exclude='ko/' \
  --exclude='vi/' \
  --exclude='pt/' \
  --exclude='wrangler*.jsonc' \
  --exclude='DESIGN_GUIDELINES.md' \
  ./ .deploy/ja/
