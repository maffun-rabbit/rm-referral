(() => {
  const finder = document.querySelector("#shop-finder");
  if (!finder) return;

  const input = finder.querySelector("[data-shop-search]");
  const cards = [...finder.querySelectorAll("[data-shop-card]")];
  const groups = [...finder.querySelectorAll("[data-locality-group]")];
  const buttons = [...finder.querySelectorAll("[data-carrier-filter]")];
  const resultCount = finder.querySelector("[data-result-count]");
  const status = finder.querySelector("[data-filter-status]");
  const noResults = finder.querySelector("[data-no-results]");
  let activeCarrier = "all";

  const normalize = (value) => value.normalize("NFKC").toLocaleLowerCase("ja").replace(/\s+/g, "");

  function updateResults() {
    const query = normalize(input.value);
    let total = 0;

    groups.forEach((group) => {
      let groupCount = 0;
      group.querySelectorAll("[data-shop-card]").forEach((card) => {
        const carrierMatch = activeCarrier === "all" || card.dataset.carrier === activeCarrier;
        const textMatch = !query || normalize(card.textContent).includes(query);
        const visible = carrierMatch && textMatch;
        card.hidden = !visible;
        if (visible) groupCount += 1;
      });

      group.hidden = groupCount === 0;
      const count = group.querySelector("[data-locality-count]");
      if (count) count.textContent = groupCount;
      if (query && groupCount) group.open = true;
      total += groupCount;
    });

    resultCount.textContent = total;
    status.textContent = query || activeCarrier !== "all" ? `${total}개 매장으로 필터링했습니다` : "";
    noResults.hidden = total !== 0;
  }

  function selectCarrier(carrier) {
    activeCarrier = carrier;
    buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.carrierFilter === carrier)));
    updateResults();
  }

  input.addEventListener("input", updateResults);
  buttons.forEach((button) => button.addEventListener("click", () => selectCarrier(button.dataset.carrierFilter)));
  document.querySelectorAll("[data-carrier-jump]").forEach((link) => link.addEventListener("click", () => selectCarrier(link.dataset.carrierJump)));
})();
