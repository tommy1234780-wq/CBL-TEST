(function () {
  "use strict";

  const pageName = decodeURIComponent(location.pathname.split("/").pop() || "index.html");
  const masthead = document.querySelector("body > .header");
  const navbar = document.querySelector(".navbar");
  const officialLinks = [
    '<a class="line" href="https://line.me/R/ti/p/@cbl7286826" target="_blank" rel="noopener noreferrer"><b>LINE</b><span>@cbl7286826</span></a>',
    '<a class="facebook" href="https://www.facebook.com/profile.php?id=61577963293322&amp;sk=about" target="_blank" rel="noopener noreferrer"><b>FB</b><span>官方 Facebook</span></a>',
    '<a href="https://www.instagram.com/cbl7192868286" target="_blank" rel="noopener noreferrer"><b>IG</b><span>官方 Instagram</span></a>',
    '<a href="https://www.youtube.com/@CBL7868" target="_blank" rel="noopener noreferrer"><b>YT</b><span>官方 YouTube</span></a>',
  ].join("");

  if (navbar && !document.querySelector(".official-channel-bar")) {
    const channelBar = document.createElement("aside");
    channelBar.className = "official-channel-bar";
    channelBar.setAttribute("aria-label", "CBL 官方頻道");
    channelBar.innerHTML = '<div class="official-channel-inner"><strong>CBL OFFICIAL CHANNELS</strong><nav aria-label="官方社群連結">' + officialLinks + "</nav></div>";
    document.body.insertBefore(channelBar, document.body.firstChild);
  }

  if (masthead) {
    const logo = masthead.querySelector(".title-group img");
    const heading = masthead.querySelector(".title-group h1");

    if (logo) {
      logo.src = "assets/season3-main-logo.webp";
      logo.alt = "CBL 第三屆官方主 LOGO";
    }

    if (heading && !masthead.querySelector(".season-badge")) {
      const badge = document.createElement("span");
      badge.className = "season-badge";
      badge.textContent = "CBL SEASON 3 · OFFICIAL WEBSITE";
      heading.parentNode.insertBefore(badge, heading);
    }
  }

  document.querySelectorAll(".nav-links a").forEach(function (link) {
    const href = decodeURIComponent((link.getAttribute("href") || "").split("#")[0]);
    if (href === pageName || (pageName === "" && href === "index.html")) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  const menuButton = document.querySelector(".menu-toggle");
  const navLinks = document.getElementById("nav-links");
  if (menuButton && navLinks) {
    menuButton.setAttribute("aria-label", "開啟主選單");
    menuButton.setAttribute("aria-expanded", navLinks.classList.contains("active") ? "true" : "false");
    menuButton.addEventListener("click", function () {
      requestAnimationFrame(function () {
        const isOpen = navLinks.classList.contains("active");
        menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
        menuButton.setAttribute("aria-label", isOpen ? "關閉主選單" : "開啟主選單");
      });
    });
  }

  if (navbar && !document.querySelector(".site-footer")) {
    const footer = document.createElement("footer");
    footer.className = "site-footer";
    footer.innerHTML = '<strong>CBL TAICHUNG · SEASON 3</strong><p>台中市 CBL 企業交流棒球聯盟｜黑洞組 × 恆星組</p><div class="footer-links" aria-label="CBL 官方聯絡管道">' + officialLinks + "</div>";
    document.body.appendChild(footer);
  }

  const footer = document.querySelector(".site-footer");
  if (navbar && footer && !footer.querySelector(".footer-links")) {
    const footerLinks = document.createElement("div");
    footerLinks.className = "footer-links";
    footerLinks.setAttribute("aria-label", "CBL 官方聯絡管道");
    footerLinks.innerHTML = officialLinks;
    footer.appendChild(footerLinks);
  }

  document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
    link.rel = "noopener noreferrer";
  });
})();
