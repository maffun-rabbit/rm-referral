# English Astro Migration: Step 04 Full Validation

## Scope

- Home: 1 page
- Prefecture hubs: 47 pages
- Shop pages: 6,714 pages
- Coverage pages: 53 pages
- Guides and topics: 19 pages
- Total: 6,834 public English pages

## Corrections made

- Localized remaining carrier UI labels for docomo, SoftBank, and AEON Mobile.
- Normalized legacy WebPage JSON-LD URLs to the production English path under `https://mnp-navi.jp/en/`.
- Normalized legacy WebPage JSON-LD `inLanguage` to `en`.
- Added a full English build validator and wired it into `npm test`.

## Full validation result

The full validation passed with no errors.

- HTML pages: 6,834
- Sitemap URLs: 6,834
- Unique canonicals: 6,834
- Structured data blocks parsed: 13,547
- Internal links checked: 34,357
- Known Japanese UI fallbacks: 0
- Legacy Workers URLs: 0
- Broken internal targets: 0

The validator also checks HTML language, Open Graph locale and URL, seven hreflang entries, shared header/footer and assets, JSON-LD syntax and page URLs, sitemap-to-output parity, and route-family counts.

## Regression suite

- Full Astro build: 20,331 pages
- Node tests: 48 passed, 0 failed
- English distribution artifact: 6,845 files
- HTML files in artifact: 6,835 (6,834 public pages plus the Google verification HTML)
- Astro overlay files: 6,836
- Language artifact validation: passed

## Next step

Step 05 is the English preview deployment and live-browser verification. Production routing is not changed in this step.
