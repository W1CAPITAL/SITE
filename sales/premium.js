/* W1 Capital premium interactions. No tracking, requests or dependencies. */
(() => {
  "use strict";
  const $ = (selector, context = document) => context.querySelector(selector);
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  // Progressive enhancement: without JS, content must remain visible.
  if (!reducedMotion.matches && "IntersectionObserver" in window) document.body.classList.add("reveal-ready");
  const menuButton = $(".menu-toggle");
  const menu = $("#menu-mobile");
  const nav = $(".desktop-nav");
  const stages = [
    {
      title: "Ouvimos antes de propor.",
      description: "Descobrimos onde a operação perde tempo e o que a equipe realmente precisa."
    },
    {
      title: "Desenhamos com propósito.",
      description: "Escolhemos as funcionalidades que resolvem o problema, sem adicionar complexidade desnecessária."
    },
    {
      title: "Evoluímos com transparência.",
      description: "Organizamos prioridades, acompanhamos melhorias e mantemos você informado sobre os próximos passos."
    }
  ];

  const setMenuOpen = (isOpen) => {
    if (!menu || !menuButton) return;
    menu.hidden = !isOpen;
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
    menuButton.classList.toggle("is-open", isOpen);
  };
  menuButton?.addEventListener("click", () => {
    setMenuOpen(menu?.hidden === true);
  });
  menu?.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu?.hidden) {
      setMenuOpen(false);
      menuButton?.focus();
    }
  });
  document.addEventListener("pointerdown", (event) => {
    if (!menu || menu.hidden) return;
    if (!menu.contains(event.target) && !menuButton?.contains(event.target)) setMenuOpen(false);
  });
  const desktop = matchMedia("(min-width: 951px)");
  const onDesktopChange = () => { if (desktop.matches) setMenuOpen(false); };
  desktop.addEventListener?.("change", onDesktopChange);

  const stageButtons = [...document.querySelectorAll("[data-process]")];
  const activateStage = (index) => {
    if (!Number.isInteger(index) || index < 0 || index >= stages.length) return;
    for (const button of stageButtons) {
      const selected = Number(button.dataset.process) === index;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    }
    const selected = stages[index];
    const stageNumber = $("#process-stage");
    const title = $("#process-title");
    const description = $("#process-description");
    if (stageNumber) stageNumber.textContent = String(index + 1).padStart(2, "0");
    if (title) title.textContent = selected.title;
    if (description) description.textContent = selected.description;
  };
  stageButtons.forEach((button, index) => {
    button.addEventListener("click", () => activateStage(index));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(event.key)) return;
      event.preventDefault();
      const next = (index + (["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1) + stages.length) % stages.length;
      stageButtons[next]?.focus();
      activateStage(next);
    });
  });

  // The LexisPredict spotlight now links to the real commercial landing.
  // Do not intercept its click or force the visitor into the old guide.

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Reveal animations are progressive enhancement: content stays readable if
  // IntersectionObserver is missing or the user opts out of motion.
  const revealTargets = [...document.querySelectorAll("[data-reveal]")];
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    for (const node of revealTargets) node.classList.add("is-visible");
  } else {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -26px 0px", threshold: 0.06 });
    for (const node of revealTargets) observer.observe(node);
  }

  // Honor the system setting if it changes while the site is open.
  const onMotionChange = () => {
    if (reducedMotion.matches) {
      for (const node of revealTargets) node.classList.add("is-visible");
    }
  };
  reducedMotion.addEventListener?.("change", onMotionChange);

  // Ensure active anchors are explicitly labeled for assistive technologies.
  const mainLinks = [...(nav?.querySelectorAll("a") || [])];
  if (mainLinks.length && "IntersectionObserver" in window) {
    const sections = mainLinks.map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);
    const navObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const link of mainLinks) {
          if (link.getAttribute("href") === "#" + entry.target.id) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        }
      }
    }, { rootMargin: "-32% 0px -48% 0px" });
    sections.forEach(section => navObserver.observe(section));
  }
})();