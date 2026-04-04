// scripts/ui.js — бургер-меню, кнопка «Наверх», модальное превью, тень шапки

// Бургер-меню (после загрузки меню из menu.html)
document.addEventListener("menuLoaded", () => {
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("mainNav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.classList.toggle("no-scroll-nav", isOpen);
    });
    nav.addEventListener("click", (e) => {
      if (e.target.tagName === "A" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("no-scroll-nav");
      }
    });
  }
});

// Кнопка «Наверх»
(function () {
  const btn = document.getElementById("backToTopBtn");
  if (!btn) return;
  btn.style.display = "none";
  window.addEventListener(
    "scroll",
    function () {
      btn.style.display = window.scrollY > 50 ? "block" : "none";
    },
    { passive: true }
  );
  btn.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

// Модальное превью изображений (аватар/сертификаты)
(function () {
  const modal = document.getElementById("imgModal");
  const modalImg = document.getElementById("modalImg");
  const closeBtn = document.getElementById("modalClose");
  if (!modal || !modalImg || !closeBtn) return;

  function openModalWithSrc(src) {
    modal.style.display = "block";
    modal.setAttribute("aria-hidden", "false");
    modalImg.src = src;
    document.body.classList.add("no-scroll");
    closeBtn.focus();
  }
  function closeModal() {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    modalImg.removeAttribute("src");
    document.body.classList.remove("no-scroll");
  }

  modalImg.addEventListener("click", closeModal);

  const previewImg = document.getElementById("previewImg");
  if (previewImg) {
    previewImg.classList.add("logo-image--clickable");
    previewImg.addEventListener("click", () =>
      openModalWithSrc(previewImg.src)
    );
  }

  document
    .querySelectorAll(".certificates img, .hack-block img")
    .forEach((img) => {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", () => openModalWithSrc(img.src));
    });

  closeBtn.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
})();

// Тень у шапки при скролле
(function () {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const onScroll = () => {
    if (window.scrollY > 4) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();

// Обфусцированные контакты — защита от спам-ботов
(function () {
  document.querySelectorAll("[data-contact]").forEach((el) => {
    const encoded = el.getAttribute("data-contact");
    try {
      const decoded = atob(encoded);
      el.setAttribute("href", decoded);
      const labelEl = el.querySelector(".contact-text");
      if (labelEl && el.hasAttribute("data-label")) {
        labelEl.textContent = atob(el.getAttribute("data-label"));
      }
    } catch (e) {
      // graceful degradation
    }
  });
})();
