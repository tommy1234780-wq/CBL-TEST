(function () {
  "use strict";
  const buttons = Array.from(document.querySelectorAll("[data-category]"));
  const sections = Array.from(document.querySelectorAll("[data-award-category]"));

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.category;
      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", active ? "true" : "false");
      });
      sections.forEach((section) => {
        section.hidden = category !== "all" && section.dataset.awardCategory !== category;
      });
    });
  });
})();
