// scripts/loadMenu-en.js
// Menu loader (menu.html) — English version with EN fallback.

(async () => {
  const PLACEHOLDER_ID = "menu-placeholder";
  const MENU_URL = "/en/partials/menu.html";

  const host = document.getElementById(PLACEHOLDER_ID);
  if (!host) {
    console.warn(`[loadMenu] Container #${PLACEHOLDER_ID} not found`);
    return;
  }

  try {
    const resp = await fetch(MENU_URL, { credentials: "same-origin" });
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }

    const html = await resp.text();

    const wrap = document.createElement("div");
    wrap.innerHTML = html.trim();

    const nav = wrap.querySelector("#mainNav");
    if (!nav) {
      throw new Error("Element #mainNav not found in menu.html");
    }

    host.replaceChildren(nav);

    document.dispatchEvent(new CustomEvent("menuLoaded"));

    const setActiveByHash = () => {
      const hash = location.hash || "#about";
      nav
        .querySelectorAll('a[aria-current="page"]')
        .forEach((a) => a.removeAttribute("aria-current"));
      const current = nav.querySelector(`a[href="${hash}"], a[href="/en/${hash}"]`);
      if (current) current.setAttribute("aria-current", "page");
    };
    setActiveByHash();
    window.addEventListener("hashchange", setActiveByHash, { passive: true });

    nav.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="/en/#"], a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute("href");
      const id = href.includes("#") ? href.split("#")[1] : "";
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", `#${id}`);
      }
    });
  } catch (err) {
    console.error("[loadMenu] Error loading menu:", err);
    host.innerHTML = `
      <nav id="mainNav" class="main-nav" role="navigation" aria-label="Main navigation">
        <ul>
          <li><a href="/en/#articles">Articles</a></li>
          <li><a href="/en/#projects">Projects</a></li>
          <li><a href="/en/#experience">Experience</a></li>
          <li><a href="/en/#skills">Skills</a></li>
        </ul>
      </nav>`;
    document.dispatchEvent(new CustomEvent("menuLoaded"));
  }
})();
