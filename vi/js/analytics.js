window.dataLayer = window.dataLayer || [];

function gtag() {
  window.dataLayer.push(arguments);
}

gtag("js", new Date());
gtag("config", "G-86FFC09LTE");

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
