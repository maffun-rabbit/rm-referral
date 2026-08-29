# English Astro Migration: Step 05 Preview Deployment

## Deployment boundary

- Preview Worker: `rm-referral-en`
- Preview URL: `https://rm-referral-en.maffun.workers.dev/en/`
- Final Cloudflare Version ID: `18a37137-aadb-4f0f-8028-047fd97bbcf8`
- Production route `mnp-navi.jp/en/*`: not changed
- DNS and the Japanese Worker: not changed

## Artifact and deployment

- Worker artifact: 6,845 files
- HTML files: 6,835 (6,834 public pages plus Google verification HTML)
- Astro overlay files: 6,836
- Final update uploaded 119 changed assets and reused 6,726 existing assets.

## HTTP verification

The following preview endpoints returned the expected status.

- `/en/`: 200
- `/en/tokyo/`: 200
- `/en/tokyo/au/au-shop-narimasu/`: 200
- `/en/tokyo/coverage/adachi/`: 200
- `/en/guide/topics/rakuten-id-required-no-shopping-needed/`: 200
- `/en/css/style.css`: 200
- `/en/sitemap.xml`: 200
- `/en/robots.txt`: 200
- `/en/does-not-exist/`: 404
- Worker root `/`: 404, as expected for an `/en/`-only artifact

Representative remote responses matched the local `.deploy/en` files byte for byte. The sitemap contains 6,834 URLs and neither sitemap nor robots.txt contains a Workers URL.

## Browser verification

- Desktop top page: one shared header, one shared footer, no broken images, no horizontal overflow.
- Desktop shop page: localized SEO, three referral CTAs, official Japanese shop-name annotations retained, no broken images.
- Mobile shop page at 390 x 844: no horizontal overflow, heading and CTA visible, no broken images.
- Tokyo shop search: searching for `Narimasu` reduced the result count from 587 to 3.
- Browser console warnings and errors: 0.

## Issues found and corrected during preview

- The Tokyo coverage link on the English prefecture page pointed to the Japanese path. It now points to `/en/tokyo/coverage/`.
- The result label rendered as `587stores shown`. It now renders as `587 stores shown`.
- Prefecture and coverage header links had labels that did not match their destinations. They now lead to the foreign-resident guide or Tokyo store list with matching labels.
- Guide pages now use a `Home` header link when linking to the English home page.
- The full English validator now fails if the Tokyo coverage link or result-count spacing regresses.

## Regression result

- Astro build: 20,331 pages
- English full validation: 6,834 pages passed
- Node tests: 48 passed, 0 failed

## Next step

Step 06 will connect `mnp-navi.jp/en/*` to the English Worker and verify the production URL. This preview step did not change the production route.
