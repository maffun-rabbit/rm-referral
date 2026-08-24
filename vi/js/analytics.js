window.dataLayer = window.dataLayer || [];

function gtag() {
  window.dataLayer.push(arguments);
}

gtag("js", new Date());
gtag("config", "G-86FFC09LTE");

const cloudflareAnalyticsTokens = {
  "rm-referral.maffun.workers.dev": "e54c3ea570dd45c68f2a42c18787a0f4",
  "rm-referral-en.maffun.workers.dev": "48ce9eca3a0a40058524a63955bfc39c",
  "rm-referral-zh.maffun.workers.dev": "7b29c343e78e4cb68e2f949d924a4083",
  "rm-referral-ko.maffun.workers.dev": "b91cf3e0a7fa40739d141c10dc15a8fe",
  "rm-referral-vi.maffun.workers.dev": "be30073f8d1d415c903276fb2c837f20",
  "rm-referral-pt.maffun.workers.dev": "8471e406905f4fccb024f1f4bb388693",
};

const cloudflareAnalyticsToken = cloudflareAnalyticsTokens[window.location.hostname];
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
