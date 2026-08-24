(() => {
  const select = document.querySelector("[data-prefecture-select]");
  const links = [...document.querySelectorAll(".prefecture-link")];

  if (select) {
    links.forEach((link) => {
      const option = document.createElement("option");
      option.value = link.getAttribute("href");
      option.textContent = link.querySelector("b")?.textContent ?? link.textContent.trim();
      select.append(option);
    });

    select.addEventListener("change", () => {
      if (select.value) window.location.assign(select.value);
    });
  }

  document.querySelectorAll(".region-shortcuts a").forEach((link) => {
    link.addEventListener("click", () => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target instanceof HTMLDetailsElement) target.open = true;
    });
  });
})();
