(() => {
  const panel = document.querySelector("[data-location-personalizer]");
  const locationButton = panel?.querySelector("[data-location-button]");
  const locationResult = panel?.querySelector("[data-location-result]");
  const radians = (value) => value * Math.PI / 180;
  const distanceKm = (from, to) => {
    const deltaLatitude = radians(to.latitude - from.latitude);
    const deltaLongitude = radians(to.longitude - from.longitude);
    const startLatitude = radians(from.latitude);
    const endLatitude = radians(to.latitude);
    const value = Math.sin(deltaLatitude / 2) ** 2 + Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(deltaLongitude / 2) ** 2;
    return 6371.0088 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
  };

  if (locationButton && locationResult) {
    locationButton.addEventListener("click", async () => {
      if (!navigator.geolocation) {
        locationResult.textContent = "このブラウザでは現在地を利用できません。";
        return;
      }
      locationButton.disabled = true;
      locationButton.textContent = "現在地を確認中…";
      try {
        const places = window.RM_MUNICIPALITIES ?? [];
        const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }));
        const current = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        const nearest = places.map((place) => ({ ...place, distance: distanceKm(current, place) })).sort((a, b) => a.distance - b.distance)[0];
        if (!nearest) throw new Error("No nearby place");
        const samePage = nearest.path === panel.dataset.currentPath;
        locationResult.innerHTML = samePage
          ? `<strong>${nearest.name}周辺</strong>の情報を表示しています。`
          : `<strong>${nearest.name}周辺</strong>の情報が近そうです。<a href="${nearest.path}">この地域を見る →</a>`;
      } catch (error) {
        locationResult.textContent = error?.code === 1 ? "位置情報が許可されていません。現在のページをそのままご覧ください。" : "現在地を確認できませんでした。現在のページをそのままご覧ください。";
      } finally {
        locationButton.disabled = false;
        locationButton.textContent = "現在地周辺を見る";
      }
    });
  }

  const audienceLabels = { family: "家族で利用する方", kids: "12歳以下のお子さま", youth: "13〜22歳の方", senior: "65歳以上の方" };
  const picker = document.querySelector("[data-audience-picker]");
  const cards = [...document.querySelectorAll("[data-benefit]")];
  const campaignContext = document.querySelector("[data-campaign-context]");
  picker?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-audience]");
    if (!button) return;
    const audience = button.dataset.audience;
    picker.querySelectorAll("button").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    cards.forEach((card) => card.classList.toggle("is-recommended", card.dataset.benefit === audience || (audience !== "family" && card.dataset.benefit === "family")));
    if (campaignContext) campaignContext.textContent = `${audienceLabels[audience]}におすすめの割引を確認できた方へ`;
  });
})();
