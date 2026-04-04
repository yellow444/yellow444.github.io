// scripts/og-preview.js — OpenGraph превью для статей
(function OGPreview() {
  /** Утилиты **/
  const abs = (url) => {
    const a = document.createElement("a");
    a.href = url;
    return a.href;
  };
  const text = (s, n = 180) =>
    (s || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, n);

  /** Парсинг OG из HTML-текста */
  function extractOG(html, pageUrl) {
    const get = (prop) => {
      const re = new RegExp(
        `<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`,
        "i"
      );
      const m = html.match(re);
      return m ? m[1] : "";
    };
    const og = {
      title: get("og:title") || "",
      desc: get("og:description") || "",
      img: get("og:image") || "",
      site: get("og:site_name") || "",
      url: get("og:url") || pageUrl,
    };
    if (!og.title) {
      const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      og.title = m ? m[1] : "";
    }
    if (!og.desc) {
      const m = html.match(
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
      );
      og.desc = m ? m[1] : "";
    }
    if (!og.img) {
      const m = html.match(
        /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i
      );
      og.img = m ? m[1] : "";
    }
    og.url = abs(og.url || pageUrl);
    if (og.img && !/^https?:\/\//i.test(og.img)) {
      try {
        const u = new URL(og.url);
        og.img = `${u.protocol}//${u.host}${og.img.startsWith("/") ? og.img : "/" + og.img}`;
      } catch {}
    }
    if (!og.site) {
      try {
        og.site = new URL(og.url).host.replace(/^www\./, "");
      } catch {}
    }
    og.title = text(og.title, 160);
    og.desc = text(og.desc, 220);
    return og;
  }

  /** Рендер карточки внутрь .og-card */
  function renderCard(box, og) {
    const hasImage = !!og.img;
    box.innerHTML = `
      <a class="og-link" href="${og.url}" target="_blank" rel="noopener noreferrer" aria-label="${og.title}">
        ${hasImage ? `<div class="og-thumb"><img src="${og.img}" alt="" loading="lazy" decoding="async"></div>` : ""}
        <div class="og-body ${hasImage ? "" : "og-body--noimg"}">
          <div class="og-title">${og.title || "Ссылка"}</div>
          ${og.desc ? `<div class="og-desc">${og.desc}</div>` : ""}
          <div class="og-site">${og.site || new URL(og.url).host}</div>
        </div>
      </a>
    `;
    box.hidden = false;
  }

  /** Загрузка HTML через публичный CORS-прокси */
  async function loadHtmlThroughProxy(url) {
    const proxyUrl = `https://r.jina.ai/http://${url.replace(/^https?:\/\//, "")}`;
    const resp = await fetch(proxyUrl, { mode: "cors", cache: "force-cache" });
    if (!resp.ok) throw new Error("Bad status: " + resp.status);
    return await resp.text();
  }

  /** Обработка всех статей */
  async function enhanceArticles() {
    const items = document.querySelectorAll("#articles .article-item");
    for (const item of items) {
      try {
        const a = item.querySelector("h3 a");
        const box = item.querySelector(".og-card");
        if (!a || !box) continue;
        const url = a.href;

        let html = "";
        try {
          html = await loadHtmlThroughProxy(url);
        } catch (e) {
          try {
            const r = await fetch(url, { mode: "cors" });
            if (r.ok) html = await r.text();
          } catch {}
        }

        if (html) {
          const og = extractOG(html, url);
          if (!og.title && !og.desc && !og.img) {
            renderCard(box, {
              url,
              title: a.textContent.trim(),
              desc: "",
              img: "",
              site: new URL(url).host,
            });
          } else {
            renderCard(box, og);
          }
        } else {
          renderCard(box, {
            url,
            title: a.textContent.trim(),
            desc: "",
            img: "",
            site: new URL(url).host,
          });
        }
      } catch (e) {
        // Мягко деградируем
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhanceArticles, {
      once: true,
    });
  } else {
    enhanceArticles();
  }
})();
