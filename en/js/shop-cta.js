(() => {
  const primaryCta = document.querySelector("[data-primary-cta]");
  const finalCta = document.querySelector("[data-final-cta]");
  const floatingCta = document.querySelector("[data-floating-cta]");
  if (!primaryCta || !finalCta || !floatingCta) return;

  let scheduled = false;
  const update = () => {
    scheduled = false;
    const primaryHasPassed = primaryCta.getBoundingClientRect().bottom < 0;
    const finalCtaIsAhead = finalCta.getBoundingClientRect().top > window.innerHeight;
    const shouldShow = primaryHasPassed && finalCtaIsAhead;
    floatingCta.classList.toggle("is-visible", shouldShow);
    floatingCta.setAttribute("aria-hidden", String(!shouldShow));
  };
  const scheduleUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(update);
  };

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  update();
})();
