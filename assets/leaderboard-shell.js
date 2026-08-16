(function () {
  "use strict";
  const frame = document.getElementById("ranking-frame");
  const surface = document.getElementById("ranking-surface");
  const fullscreenButton = document.getElementById("ranking-fullscreen");

  document.querySelectorAll("[data-ranking-page]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-ranking-page]").forEach((item) => item.classList.toggle("active", item === button));
      frame.style.height = "900px";
      frame.src = button.dataset.rankingPage;
    });
  });

  window.addEventListener("message", (event) => {
    if (!event.data || event.data.type !== "cbl-ranking-height") return;
    const height = Math.max(760, Math.min(Number(event.data.height) + 4, 2200));
    if (Number.isFinite(height)) frame.style.height = `${height}px`;
  });

  fullscreenButton.addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) await surface.requestFullscreen();
      else await document.exitFullscreen();
    } catch (error) {
      console.warn("Fullscreen is unavailable", error);
    }
  });

  document.addEventListener("fullscreenchange", () => {
    const active = Boolean(document.fullscreenElement);
    fullscreenButton.querySelector("span").textContent = active ? "離開全螢幕" : "全螢幕檢視";
    fullscreenButton.setAttribute("aria-label", active ? "離開全螢幕" : "全螢幕檢視");
  });
})();
