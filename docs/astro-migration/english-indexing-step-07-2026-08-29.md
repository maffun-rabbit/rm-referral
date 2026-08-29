# English Astro Migration: Step 07 Indexing

## Production indexing signals

- Production URL: `https://mnp-navi.jp/en/`
- Sitemap: `https://mnp-navi.jp/en/sitemap.xml`
- Public pages in sitemap: 6,834
- `robots.txt`: HTTP 200
- Sitemap: HTTP 200, `application/xml`
- Top page and representative shop page: HTTP 200 for Googlebot
- `meta robots`: `index, follow`
- Canonical and hreflang URLs: `mnp-navi.jp` production URLs
- Workers URLs in sitemap: 0

## robots.txt correction

The generated sitemap directive previously had an unintended trailing slash. The generator and English build validator were updated so that the exact directive is:

```text
Sitemap: https://mnp-navi.jp/en/sitemap.xml
```

The corrected English artifact was deployed to Cloudflare.

- Worker: `rm-referral-en`
- Route: `mnp-navi.jp/en/*`
- Cloudflare Version ID: `30c9888e-ced0-47c3-88b8-0bea6f47a2a4`
- Modified public asset: `/en/robots.txt`

## Validation

- Full Astro build: 20,331 pages
- English public HTML: 6,834 pages
- English internal links checked: 34,357
- Structured data blocks checked: 13,547
- Japanese UI fallbacks: 0
- Legacy Worker URLs: 0
- Broken internal targets: 0
- Test suite: 48 passed, 0 failed

## Google Search Console

Submitted `https://mnp-navi.jp/en/sitemap.xml` to the domain property `mnp-navi.jp` on 2026-08-29.

- Submission result: accepted
- Status: successful
- Last read: 2026-08-29
- Detected pages: 6,834
- Detected videos: 0

The English Astro migration is complete. Search Console will continue processing the submitted URLs and checking for changes.
