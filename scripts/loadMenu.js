// scripts/loadMenu.js
// Загрузка меню (menu.html) и инициализация после вставки.
// Работает на GitHub Pages и локально без CORS-проблем, т.к. та же ориджн.

(async () => {
  const PLACEHOLDER_ID = "menu-placeholder";
  const MENU_URL = "./partials/menu.html"; // относительный путь — важен для GitHub Pages

  const host = document.getElementById(PLACEHOLDER_ID);
  if (!host) {
    console.warn(`[loadMenu] Не найден контейнер #${PLACEHOLDER_ID}`);
    return;
  }

  try {
    const resp = await fetch(MENU_URL, { credentials: "same-origin" });
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }

    const html = await resp.text();

    // Вставляем как «живой» DOM, а не просто innerHTML — безопаснее управлять узлами
    const wrap = document.createElement("div");
    wrap.innerHTML = html.trim();

    // Ищем сам <nav id="mainNav"> из menu.html
    const nav = wrap.querySelector("#mainNav");
    if (!nav) {
      throw new Error("В menu.html не найден элемент #mainNav");
    }

    // Очищаем контейнер и вставляем меню
    host.replaceChildren(nav);

    // После вставки — диспатчим событие, на которое подписан index.html
    document.dispatchEvent(new CustomEvent("menuLoaded"));

    // Небольшие улучшения UX:
    // 1) если хедер «липкий», добавим aria-current активному пункту по хэшу
    const setActiveByHash = () => {
      const hash = location.hash || "#about";
      nav
        .querySelectorAll('a[aria-current="page"]')
        .forEach((a) => a.removeAttribute("aria-current"));
      const current = nav.querySelector(`a[href="${hash}"]`);
      if (current) current.setAttribute("aria-current", "page");
    };
    setActiveByHash();
    window.addEventListener("hashchange", setActiveByHash, { passive: true });

    // 2) плавный скролл по якорям из меню
    nav.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="/#"], a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute("href");
      const id = href.startsWith("/#") ? href.slice(2) : href.slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", `#${id}`);
      }
    });
  } catch (err) {
    console.error("[loadMenu] Ошибка загрузки меню:", err);
    // Фолбэк — минимальное меню, чтобы сайт был навигируемым
    host.innerHTML = `
      <nav id="mainNav" class="main-nav" role="navigation" aria-label="Главная навигация">
        <ul>
          <li><a href="/#articles">Статьи</a></li>
          <li><a href="/#projects">Проекты</a></li>
          <li><a href="/#experience">Опыт</a></li>
          <li><a href="/#skills">Навыки</a></li>
        </ul>
      </nav>`;
    // Всё равно диспатчим событие, чтобы бургер и остальное работало
    document.dispatchEvent(new CustomEvent("menuLoaded"));
  }
})();
