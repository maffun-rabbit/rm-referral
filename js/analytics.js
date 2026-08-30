window.dataLayer = window.dataLayer || [];

function gtag() {
  window.dataLayer.push(arguments);
}

gtag("js", new Date());
gtag("config", "G-86FFC09LTE");

const cloudflareAnalyticsTokensByLocale = {
  ja: "e54c3ea570dd45c68f2a42c18787a0f4",
  en: "48ce9eca3a0a40058524a63955bfc39c",
  zh: "7b29c343e78e4cb68e2f949d924a4083",
  ko: "b91cf3e0a7fa40739d141c10dc15a8fe",
  vi: "be30073f8d1d415c903276fb2c837f20",
  pt: "8471e406905f4fccb024f1f4bb388693",
};

const firstPathSegment = window.location.pathname.split("/").filter(Boolean)[0];
const analyticsLocale = Object.hasOwn(cloudflareAnalyticsTokensByLocale, firstPathSegment)
  ? firstPathSegment
  : "ja";
const cloudflareAnalyticsToken = cloudflareAnalyticsTokensByLocale[analyticsLocale];
if (cloudflareAnalyticsToken) {
  const cloudflareBeacon = document.createElement("script");
  cloudflareBeacon.type = "module";
  cloudflareBeacon.src = "https://static.cloudflareinsights.com/beacon.min.js";
  cloudflareBeacon.dataset.cfBeacon = JSON.stringify({ token: cloudflareAnalyticsToken });
  document.head.append(cloudflareBeacon);
}

document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href="https://r10.to/hNearm"]');
  if (!link) return;

  gtag("event", "referral_click", {
    link_url: link.href,
    link_text: link.textContent.trim(),
    page_path: window.location.pathname,
    transport_type: "beacon",
  });
});
