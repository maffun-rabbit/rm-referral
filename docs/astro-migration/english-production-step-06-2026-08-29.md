# English Astro Migration: Step 06 Production Routing

## Production release

- Route: `mnp-navi.jp/en/*`
- Worker: `rm-referral-en`
- Production URL: `https://mnp-navi.jp/en/`
- Cloudflare Version ID: `78735961-0392-4231-9a92-a318fc4ee06d`
- Worker artifact: 6,845 files
- HTML files: 6,835 (6,834 public pages plus Google verification HTML)
- Astro overlay files: 6,836

The route is limited to `/en/*`. The Japanese root Worker and Vietnamese `/vi/*` Worker were not changed. Cloudflare disabled the `workers.dev` and preview URLs when the production route was attached; the old English Workers URL now returns 404 as expected.

## Production HTTP verification

- `/en/`: 200
- `/en/tokyo/`: 200
- `/en/tokyo/au/au-shop-narimasu/`: 200
- `/en/tokyo/coverage/adachi/`: 200
- `/en/guide/topics/rakuten-id-required-no-shopping-needed/`: 200
- `/en/css/style.css`: 200
- `/en/sitemap.xml`: 200
- `/en/robots.txt`: 200
- `/en/does-not-exist/`: 404
- Japanese `/`: 200
- Vietnamese `/vi/`: 200

The representative production HTML, stylesheet, sitemap, and robots.txt matched the local `.deploy/en` files byte for byte.

## SEO and browser verification

- `html lang="en"`
- `og:locale="en_US"`
- Canonicals point to `https://mnp-navi.jp/en/` paths.
- Sitemap contains 6,834 English production URLs.
- Sitemap and robots.txt contain no Workers URLs.
- Referral CTA uses `https://r10.to/hNearm`.
- Desktop top page: one header, one footer, no broken images, no horizontal overflow.
- Tokyo search: `Narimasu` reduced 587 stores to 3 results.
- Mobile shop page at 390 x 844: no horizontal overflow or broken images; heading and three CTAs are available.
- Browser console warnings and errors: 0.

## Existing-language impact check

- Japanese top remained HTTP 200 with `lang="ja"`.
- Vietnamese top remained HTTP 200 with `lang="vi"` and its production canonical.
- No DNS record or non-English Worker configuration was changed in this step.

## Next step

Step 07 will verify indexing signals after production release and submit or confirm the English sitemap in Google Search Console.
