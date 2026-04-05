// scripts/og-preview.js — OpenGraph превью для статей (с локальным кешем)
(function OGPreview() {
  /** Утилиты **/
  var abs = function (url) {
    var a = document.createElement("a");
    a.href = url;
    return a.href;
  };
  var trimText = function (s, n) {
    n = n || 180;
    return (s || "").replace(/\s+/g, " ").trim().slice(0, n);
  };

  /** Парсинг OG из HTML-текста */
  function extractOG(html, pageUrl) {
    var get = function (prop) {
      var re = new RegExp(
        '<meta[^>]+property=["\']' + prop + '["\'][^>]+content=["\']([^"\']+)["\']',
        "i"
      );
      var m = html.match(re);
      return m ? m[1] : "";
    };
    var og = {
      title: get("og:title") || "",
      desc: get("og:description") || "",
      img: get("og:image") || "",
      site: get("og:site_name") || "",
      url: get("og:url") || pageUrl
    };
    if (!og.title) {
      var m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      og.title = m ? m[1] : "";
    }
    if (!og.desc) {
      var m2 = html.match(
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
      );
      og.desc = m2 ? m2[1] : "";
    }
    og.url = abs(og.url || pageUrl);
    if (og.img && !/^https?:\/\//i.test(og.img)) {
      try {
        var u = new URL(og.url);
        og.img = u.protocol + "//" + u.host + (og.img.charAt(0) === "/" ? og.img : "/" + og.img);
      } catch (e) { /* ignore */ }
    }
    if (!og.site) {
      try { og.site = new URL(og.url).host.replace(/^www\./, ""); } catch (e) { /* ignore */ }
    }
    og.title = trimText(og.title, 160);
    og.desc = trimText(og.desc, 220);
    return og;
  }

  /** Рендер карточки внутрь .og-card */
  function renderCard(box, og) {
    var hasImage = !!og.img;
    box.innerHTML =
      '<a class="og-link" href="' + og.url + '" target="_blank" rel="noopener noreferrer" aria-label="' + (og.title || "Ссылка") + '">' +
        (hasImage ? '<div class="og-thumb"><img src="' + og.img + '" alt="" loading="lazy" decoding="async"></div>' : '') +
        '<div class="og-body' + (hasImage ? '' : ' og-body--noimg') + '">' +
          '<div class="og-title">' + (og.title || "Ссылка") + '</div>' +
          (og.desc ? '<div class="og-desc">' + og.desc + '</div>' : '') +
          '<div class="og-site">' + (og.site || "") + '</div>' +
        '</div>' +
      '</a>';
    box.hidden = false;
  }

  /** Построить fallback-объект из ссылки */
  function fallbackOG(a, url) {
    return {
      url: url,
      title: a.textContent.trim(),
      desc: "",
      img: "",
      site: (function () { try { return new URL(url).host; } catch (e) { return ""; } })()
    };
  }

  /** Загрузка HTML через публичный CORS-прокси (запасной вариант) */
  function loadHtmlThroughProxy(url) {
    var proxyUrl = "https://r.jina.ai/http://" + url.replace(/^https?:\/\//, "");
    return fetch(proxyUrl, { mode: "cors", cache: "force-cache" })
      .then(function (resp) {
        if (!resp.ok) throw new Error("Bad status: " + resp.status);
        return resp.text();
      });
  }

  /** Основная логика */
  function enhanceArticles(cache) {
    var items = document.querySelectorAll("#articles .article-item");
    items.forEach(function (item) {
      try {
        var a = item.querySelector("h3 a");
        var box = item.querySelector(".og-card");
        if (!a || !box) return;
        var url = a.href;

        // 1. Проверяем статический кеш
        var cached = cache[url];
        if (cached && cached.title) {
          renderCard(box, cached);
          return;
        }

        // 2. Для локальных статей (./articles/) — рендерим сразу из текста ссылки
        if (url.indexOf("/articles/template.html") !== -1) {
          renderCard(box, fallbackOG(a, url));
          return;
        }

        // 3. Для внешних — пробуем fetch через прокси (один раз, с кешем браузера)
        loadHtmlThroughProxy(url)
          .then(function (html) {
            var og = extractOG(html, url);
            if (!og.title && !og.desc && !og.img) {
              renderCard(box, fallbackOG(a, url));
            } else {
              renderCard(box, og);
            }
          })
          .catch(function () {
            renderCard(box, fallbackOG(a, url));
          });
      } catch (e) {
        // Мягко деградируем
      }
    });
  }

  /** Загружаем статический кеш и запускаем */
  function init() {
    fetch("./data/og-cache.json", { cache: "force-cache" })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; })
      .then(function (cache) { enhanceArticles(cache || {}); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
