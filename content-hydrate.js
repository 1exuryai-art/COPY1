(function () {
  "use strict";

  function getDogmaLang() {
    try {
      const monarch = localStorage.getItem("monarch_lang");
      if (monarch === "en") return "en";
      if (monarch === "ru") return "ru";
      const legacy = localStorage.getItem("dogma_lang");
      if (legacy === "en") return "en";
      if (legacy === "ru") return "ru";
      if (legacy === "ua") return "ru";
      return "pl";
    } catch {
      return "pl";
    }
  }

  function pickLoc(obj, lang) {
    if (!obj || typeof obj !== "object") return "";
    if (lang === "ru") return obj.ru || obj.ua || obj.pl || obj.en || "";
    return obj[lang] || obj.pl || obj.en || obj.ua || obj.ru || "";
  }

  function normSrc(src) {
    if (!src || typeof src !== "string") return "";
    const t = src.trim();
    if (!t) return "";
    return t.startsWith("/") ? t : `/${t}`;
  }

  function mediaSrc(item) {
    return normSrc(item && item.media && item.media.src);
  }

  function mediaType(item) {
    const t = item && item.media && item.media.type;
    return t === "video" ? "video" : "image";
  }

  function pickAlt(item, lang) {
    const alt = item && item.media && item.media.alt;
    return pickLoc(alt, lang) || "";
  }

  function prepareItems(list) {
    if (!Array.isArray(list) || list.length === 0) return [];
    return list
      .filter((it) => it && it.visible !== false)
      .slice()
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  }

  function tiltDeg(i) {
    const x = (i * 0.73) % 3.4;
    return (Math.round((x - 1.7) * 10) / 10).toFixed(1);
  }

  function escapeAttr(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function renderMobileBio(items, lang) {
    return items
      .map((it) => {
        const src = mediaSrc(it);
        const url = src ? escapeAttr(src) : "";
        const title = escapeAttr(pickLoc(it.title, lang));
        const desc = escapeAttr(pickLoc(it.description, lang));
        return `<article class="mobile-bio-card">
    <div class="mobile-bio-photo" style="--photo-url: url('${url}')"></div>
    <strong>${title}</strong>
    <p>${desc}</p>
    <button class="mobile-card-btn" type="button" data-open-booking data-i18n="common.book">Umów</button>
  </article>`;
      })
      .join("\n");
  }

  function renderDesktopBioPreview(items, lang) {
    return items
      .map((it) => {
        const src = mediaSrc(it);
        const url = src ? escapeAttr(src) : "";
        const title = escapeAttr(pickLoc(it.title, lang));
        return `<div class="bio-preview-item" style="--bio-img: url('${url}')">
    <strong>${title}</strong>
  </div>`;
      })
      .join("\n");
  }

  function resolveGalleryCardType(it, mediaMode) {
    if (mediaMode === "auto") return mediaType(it);
    if (mediaMode === "video") return "video";
    return "image";
  }

  function renderMobileGalleryCard(items, lang, mediaMode) {
    return items
      .map((it, idx) => {
        const type = resolveGalleryCardType(it, mediaMode);
        const src = mediaSrc(it);
        const url = src ? escapeAttr(src) : "";
        const title = escapeAttr(pickLoc(it.title, lang));
        const desc = escapeAttr(pickLoc(it.description, lang));
        const alt = escapeAttr(pickAlt(it, lang));
        if (type === "video") {
          return `<article class="mobile-gallery-card">
    <div class="mobile-gallery-photo">
      <video class="dogma-video" data-dogma-video src="${url}" autoplay muted loop playsinline preload="metadata"></video>
    </div>
    <strong>${title}</strong>
    <p>${desc}</p>
  </article>`;
        }
        return `<article class="mobile-gallery-card">
    <div class="media-frame media-frame--portrait" style="--media-url: url('${url}')">
      <img src="${url}" alt="${alt}">
    </div>
    <strong>${title}</strong>
    <p>${desc}</p>
  </article>`;
      })
      .join("\n");
  }

  function renderStickerFigure(items, lang, mediaMode) {
    return items
      .map((it, i) => {
        const type = resolveGalleryCardType(it, mediaMode);
        const src = mediaSrc(it);
        const url = src ? escapeAttr(src) : "";
        const title = escapeAttr(pickLoc(it.title, lang));
        const desc = escapeAttr(pickLoc(it.description, lang));
        const alt = escapeAttr(pickAlt(it, lang));
        const tilt = tiltDeg(i);
        if (type === "video") {
          return `<figure class="sticker-card" style="--tilt: ${tilt}deg">
      <video class="dogma-video" data-dogma-video src="${url}" autoplay muted loop playsinline preload="metadata"></video>
      <figcaption>
        <strong>${title}</strong>
        <p>${desc}</p>
      </figcaption>
    </figure>`;
        }
        return `<figure class="sticker-card" style="--tilt: ${tilt}deg">
      <div class="media-frame media-frame--portrait" style="--media-url: url('${url}')">
        <img src="${url}" alt="${alt}">
      </div>
      <figcaption>
        <strong>${title}</strong>
        <p>${desc}</p>
      </figcaption>
    </figure>`;
      })
      .join("\n");
  }

  function renderMobileBarbers(items, lang) {
    return items
      .map((it) => {
        const src = mediaSrc(it);
        const url = src ? escapeAttr(src) : "";
        const name = escapeAttr(pickLoc(it.title, lang));
        const desc = escapeAttr(pickLoc(it.description, lang));
        const alt = escapeAttr(pickAlt(it, lang) || pickLoc(it.title, lang));
        const tags = Array.isArray(it.tags) ? it.tags : [];
        const tagHtml = tags
          .map((t) => `<span>${escapeAttr(String(t))}</span>`)
          .join("\n      ");
        const cta = escapeAttr(pickLoc(it.bookCta, lang) || "Umów");
        const bid = it.barberId ? String(it.barberId).trim() : "";
        const dataBarber = bid ? ` data-barber-id="${escapeAttr(bid)}"` : "";
        return `<article class="barber-profile-card"${dataBarber}>
            <div class="barber-profile-photo">
              <img src="${url}" alt="${alt}">
            </div>
            <div class="barber-profile-copy">
              <h3>${name}</h3>
              <p>${desc}</p>
            </div>
            <div class="barber-profile-tags">
              ${tagHtml}
            </div>
            <button class="mobile-card-btn barber-profile-btn" type="button" data-open-booking>${cta}</button>
          </article>`;
      })
      .join("\n");
  }

  function renderDesktopBarbers(items, lang) {
    return items
      .map((it) => {
        const src = mediaSrc(it);
        const url = src ? escapeAttr(src) : "";
        const name = escapeAttr(pickLoc(it.title, lang));
        const desc = escapeAttr(pickLoc(it.description, lang));
        const alt = escapeAttr(pickAlt(it, lang) || pickLoc(it.title, lang));
        const tags = Array.isArray(it.tags) ? it.tags : [];
        const tagHtml = tags
          .map((t) => `<span>${escapeAttr(String(t))}</span>`)
          .join("\n                    ");
        const cta = escapeAttr(pickLoc(it.bookCta, lang) || "Umów");
        const bid = it.barberId ? String(it.barberId).trim() : "";
        const dataBarber = bid ? ` data-barber-id="${escapeAttr(bid)}"` : "";
        const photoStyle = url
          ? ` style="background-image:url('${url}');background-size:cover;background-position:center 32%;"`
          : "";
        return `<article class="glass-card master-card master-card--hydrated">
                  <div class="master-photo master-photo--img"${photoStyle} role="img" aria-label="${alt}"></div>
                  <div class="master-card__body">
                    <h3>${name}</h3>
                    <p>${desc}</p>
                  </div>
                  <div class="master-tags">
                    ${tagHtml}
                  </div>
                  <button class="master-book-btn" type="button" data-open-booking${dataBarber}>${cta}</button>
                </article>`;
      })
      .join("\n");
  }

  function setStickerWallHtml(zone, html) {
    if (!zone) return;
    const wall = zone.querySelector(":scope > .sticker-wall");
    if (wall) wall.innerHTML = html;
    else zone.innerHTML = html;
  }

  function setPanelStickerHtml(panel, html) {
    if (!panel) return;
    let wall = panel.querySelector(":scope > .sticker-wall");
    if (!wall) {
      wall = document.createElement("div");
      wall.className = "sticker-wall";
      panel.appendChild(wall);
    }
    wall.innerHTML = html;
  }

  const ZONE_RENDERERS = [
    {
      key: "bioGallery",
      jobs: [
        { sel: '[data-admin-zone="mobile-bio-gallery"]', fn: (el, items, lang) => {
          el.innerHTML = renderMobileBio(items, lang);
        } }
      ]
    },
    {
      key: "bioDesktopPreview",
      jobs: [
        { sel: '[data-admin-zone="desktop-bio-preview"]', fn: (el, items, lang) => {
          el.innerHTML = renderDesktopBioPreview(items, lang);
        } }
      ]
    },
    {
      key: "effectPhotos",
      jobs: [
        { sel: '[data-admin-zone="mobile-effect-photos"]', fn: (el, items, lang) => {
          el.innerHTML = renderMobileGalleryCard(items, lang, "image");
        } },
        { sel: '[data-admin-zone="desktop-effect-photos"]', fn: (el, items, lang) => {
          setPanelStickerHtml(el, renderStickerFigure(items, lang, "image"));
        } }
      ]
    },
    {
      key: "effectVideos",
      jobs: [
        { sel: '[data-admin-zone="mobile-effect-videos"]', fn: (el, items, lang) => {
          el.innerHTML = renderMobileGalleryCard(items, lang, "video");
        } },
        { sel: '[data-admin-zone="desktop-effect-videos"]', fn: (el, items, lang) => {
          setPanelStickerHtml(el, renderStickerFigure(items, lang, "video"));
        } }
      ]
    },
    {
      key: "vibeGallery",
      jobs: [
        { sel: '[data-admin-zone="mobile-vibe-gallery"]', fn: (el, items, lang) => {
          el.innerHTML = renderMobileGalleryCard(items, lang, "auto");
        } },
        { sel: '[data-admin-zone="desktop-vibe-gallery"]', fn: (el, items, lang) => {
          setStickerWallHtml(el, renderStickerFigure(items, lang, "auto"));
        } }
      ]
    },
    {
      key: "barbers",
      jobs: [
        { sel: '[data-admin-zone="mobile-barbers"]', fn: (el, items, lang) => {
          el.innerHTML = renderMobileBarbers(items, lang);
        } },
        { sel: '[data-admin-zone="desktop-barbers"]', fn: (el, items, lang) => {
          el.innerHTML = renderDesktopBarbers(items, lang);
        } }
      ]
    }
  ];

  function renderLandingDesktop(items, lang) {
    return items
      .map((it) => {
        const title = escapeAttr(pickLoc(it.title, lang));
        const desc = escapeAttr(pickLoc(it.description, lang));
        const price = escapeAttr(it.priceDisplay || "");
        const btn = escapeAttr(pickLoc(it.buttonLabel, lang) || "Wybierz usługę");
        const visual = escapeAttr(String(it.visualClass || "haircut").trim() || "haircut");
        const tags = Array.isArray(it.tags) ? it.tags : [];
        const tagHtml = tags.map((t) => `<span>${escapeAttr(String(t))}</span>`).join("\n      ");
        const src = normSrc(it.media && it.media.src);
        const bg = src ? escapeAttr(src) : "";
        const style = bg && it.media?.type !== "video" ? ` style="background-image:url('${bg}');background-size:cover;background-position:center"` : "";
        const bid = it.bookingServiceId ? String(it.bookingServiceId).trim() : "";
        const dataBooking = bid ? ` data-booking-service="${escapeAttr(bid)}"` : "";
        const visualInner =
          src && it.media?.type === "video"
            ? `<div class="service-visual ${visual} service-visual--video"><video class="dogma-video" data-dogma-video src="${bg}" autoplay muted loop playsinline preload="metadata"></video></div>`
            : `<div class="service-visual ${visual}"${style}></div>`;
        return `<article class="glass-card pricing-card">
                ${visualInner}
                <div class="pricing-card__content">
                  <div class="pricing-card__top">
                    <strong>${title}</strong>
                    <span class="pricing-card__price">${price}</span>
                  </div>
                  <p>${desc}</p>
                </div>
                <div class="service-tags">
                  ${tagHtml}
                </div>
                <button class="master-book-btn" type="button" data-open-booking${dataBooking}>${btn}</button>
              </article>`;
      })
      .join("\n");
  }

  function renderLandingMobile(items, lang) {
    return items
      .map((it) => {
        const title = escapeAttr(pickLoc(it.title, lang));
        const desc = escapeAttr(pickLoc(it.description, lang));
        const btn = escapeAttr(pickLoc(it.buttonLabel, lang) || "Wybierz usługę");
        const visual = escapeAttr(String(it.visualClass || "haircut").trim() || "haircut");
        const tags = Array.isArray(it.tags) ? it.tags : [];
        const tagHtml = tags.map((t) => `<span>${escapeAttr(String(t))}</span>`).join("\n            ");
        const price = escapeAttr(it.priceDisplay || "");
        const src = normSrc(it.media && it.media.src);
        const bg = src ? escapeAttr(src) : "";
        const style = bg && it.media?.type !== "video" ? ` style="background-image:url('${bg}');background-size:cover;background-position:center"` : "";
        const bid = it.bookingServiceId ? String(it.bookingServiceId).trim() : "";
        const dataBooking = bid ? ` data-booking-service="${escapeAttr(bid)}"` : "";
        const imgInner =
          src && it.media?.type === "video"
            ? `<div class="service-img ${visual} service-img--video"><video class="dogma-video" data-dogma-video src="${bg}" autoplay muted loop playsinline preload="metadata"></video></div>`
            : `<div class="service-img ${visual}"${style}></div>`;
        return `<article class="service-card">
            ${imgInner}
            <div class="service-card-header">
              <strong>${title}</strong>
              <span class="price">${price}</span>
            </div>
            <p>${desc}</p>
            <div class="tags">
              ${tagHtml}
            </div>
            <button class="mobile-card-btn" type="button" data-open-booking${dataBooking}>${btn}</button>
          </article>`;
      })
      .join("\n");
  }

  function applyWorksGallery(data, lang) {
    const raw = data.worksGallery;
    if (!Array.isArray(raw) || raw.length === 0) return;
    const items = prepareItems(raw).filter((it) => mediaSrc(it));
    if (items.length === 0) return;

    const photoItems = items.filter((it) => mediaType(it) !== "video");
    const videoItems = items.filter((it) => mediaType(it) === "video");
    const hasVideo = videoItems.length > 0;

    document.querySelectorAll("[data-works-switch]").forEach((sw) => {
      sw.hidden = !hasVideo;
      sw.style.display = hasVideo ? "" : "none";
      if (!hasVideo) {
        sw.querySelectorAll(".media-tab").forEach((t, i) => t.classList.toggle("active", i === 0));
      }
    });

    const mobPhoto = document.querySelector('[data-admin-zone="mobile-works-photos"]');
    const mobVideo = document.querySelector('[data-admin-zone="mobile-works-videos"]');
    const deskPhoto = document.querySelector('[data-admin-zone="desktop-works-photos"]');
    const deskVideo = document.querySelector('[data-admin-zone="desktop-works-videos"]');
    const mobLegacy = document.querySelector('[data-admin-zone="mobile-works-gallery"]');
    const deskLegacy = document.querySelector('[data-admin-zone="desktop-works-gallery"]');

    if (mobPhoto && mobVideo) {
      if (!hasVideo) {
        mobPhoto.innerHTML = renderMobileGalleryCard(items, lang, "auto");
        mobVideo.innerHTML = "";
      } else {
        mobPhoto.innerHTML = renderMobileGalleryCard(photoItems, lang, "auto");
        mobVideo.innerHTML = renderMobileGalleryCard(videoItems, lang, "auto");
      }
    } else if (mobLegacy) {
      mobLegacy.innerHTML = renderMobileGalleryCard(items, lang, "auto");
    }

    const mobMonarchGallery = document.querySelector('[data-admin-zone="mobile-gallery"]');
    if (mobMonarchGallery) {
      mobMonarchGallery.innerHTML = renderMobileGalleryCard(items, lang, "auto");
    }

    const deskSticker = document.querySelector('[data-admin-zone="desktop-gallery-works"]');
    if (deskSticker) {
      setStickerWallHtml(deskSticker, renderStickerFigure(items, lang, "auto"));
    }

    if (deskPhoto && deskVideo) {
      if (!hasVideo) {
        setStickerWallHtml(deskPhoto, renderStickerFigure(items, lang, "auto"));
        setStickerWallHtml(deskVideo, "");
      } else {
        setStickerWallHtml(deskPhoto, renderStickerFigure(photoItems, lang, "auto"));
        setStickerWallHtml(deskVideo, renderStickerFigure(videoItems, lang, "auto"));
      }
    } else if (deskLegacy) {
      setStickerWallHtml(deskLegacy, renderStickerFigure(items, lang, "auto"));
    }

    document.querySelectorAll("#mobile-works-photos, #desktop-works-photos").forEach((p) => p.classList.add("active"));
    document.querySelectorAll("#mobile-works-videos, #desktop-works-videos").forEach((p) => p.classList.remove("active"));
  }

  function applyLandingServices(data) {
    const raw = data.landingServices;
    if (!Array.isArray(raw) || raw.length === 0) return;
    const items = prepareItems(raw);
    if (!items.length) return;
    const lang = getDogmaLang();
    const desk = document.querySelector('[data-admin-zone="desktop-services"]');
    const mob = document.querySelector('[data-admin-zone="mobile-services"]');
    if (desk) desk.innerHTML = renderLandingDesktop(items, lang);
    if (mob) mob.innerHTML = renderLandingMobile(items, lang);
  }

  function applyContactsPhoneDisplay(data) {
    const c = data.contacts && typeof data.contacts === "object" ? data.contacts : {};
    if (c.phoneDisplay && typeof c.phoneDisplay === "string" && c.phoneDisplay.trim()) {
      document.querySelectorAll("[data-dogma-contact-phone-display]").forEach((el) => {
        el.textContent = c.phoneDisplay.trim();
      });
    }
  }

  function applyContactsAndSocials(data) {
    const lang = getDogmaLang();
    const c = data.contacts && typeof data.contacts === "object" ? data.contacts : {};
    const s = data.socials && typeof data.socials === "object" ? data.socials : {};

    const phoneRaw = c.phoneE164 || c.phone || "";
    const phoneDigits = String(phoneRaw).replace(/[^\d+]/g, "");
    const telHref = phoneDigits ? (phoneDigits.startsWith("+") ? `tel:${phoneDigits}` : `tel:+${phoneDigits.replace(/^\+/, "")}`) : "";

    if (telHref) {
      document.querySelectorAll('[data-dogma-contact="phone"]').forEach((a) => {
        a.setAttribute("href", telHref);
      });
      window.DOGMA_PHONE_E164 = phoneDigits.startsWith("+") ? phoneDigits : `+${phoneDigits.replace(/^\+/, "")}`;
    }

    if (c.mapsUrl && typeof c.mapsUrl === "string") {
      window.DOGMA_MAPS_URL = c.mapsUrl.trim();
    }

    if (c.hoursDisplay && typeof c.hoursDisplay === "string" && c.hoursDisplay.trim()) {
      const h = c.hoursDisplay.trim();
      document.querySelectorAll("[data-dogma-contact-hours]").forEach((el) => {
        el.textContent = h;
      });
    }

    if (c.mapEmbedUrl && typeof c.mapEmbedUrl === "string") {
      document.querySelectorAll("[data-dogma-map-embed]").forEach((iframe) => {
        iframe.setAttribute("src", c.mapEmbedUrl.trim());
      });
    }

    const addr = c.address;
    if (addr && typeof addr === "object") {
      const line = pickLoc(addr, lang);
      if (line) {
        document.querySelectorAll("[data-dogma-contact-address]").forEach((el) => {
          el.textContent = line;
        });
      }
    }

    if (s.booksy && typeof s.booksy === "string") {
      document.querySelectorAll('[data-dogma-contact="booksy"]').forEach((a) => {
        a.setAttribute("href", s.booksy);
      });
    }
    if (s.instagram && typeof s.instagram === "string") {
      document.querySelectorAll('[data-dogma-contact="instagram"]').forEach((a) => {
        a.setAttribute("href", s.instagram);
      });
    }
    if (s.tiktok && typeof s.tiktok === "string") {
      document.querySelectorAll('[data-dogma-contact="tiktok"]').forEach((a) => {
        a.setAttribute("href", s.tiktok);
      });
    }

    const reviewsUrlRaw =
      (c.googleReviewsUrl && String(c.googleReviewsUrl).trim()) ||
      (s.googleReviewsUrl && String(s.googleReviewsUrl).trim()) ||
      "";
    if (reviewsUrlRaw) {
      document.querySelectorAll("[data-dogma-google-reviews]").forEach((a) => {
        a.setAttribute("href", reviewsUrlRaw);
      });
    }
  }

  function applyDogmaSiteContent(data) {
    if (!data || typeof data !== "object") return;

    const lang = getDogmaLang();

    ZONE_RENDERERS.forEach(({ key, jobs }) => {
      const raw = data[key];
      if (!Array.isArray(raw) || raw.length === 0) return;
      const items = prepareItems(raw);
      if (items.length === 0) return;

      jobs.forEach(({ sel, fn }) => {
        const el = document.querySelector(sel);
        if (el) fn(el, items, lang);
      });
    });

    applyWorksGallery(data, lang);

    applyContactsAndSocials(data);

    applyLandingServices(data);

    if (typeof window.playVisibleDogmaVideos === "function") {
      requestAnimationFrame(() => window.playVisibleDogmaVideos());
    }

    if (typeof window.__DOGMA_applyI18nStrings === "function") {
      window.__DOGMA_applyI18nStrings();
    }

    applyContactsPhoneDisplay(data);

    if (typeof window.DOGMA_applyBookingConfigFromContent === "function") {
      window.DOGMA_applyBookingConfigFromContent();
    }
  }

  window.dogmaReapplySiteContent = function () {
    if (window.DOGMA_SITE_CONTENT) {
      applyDogmaSiteContent(window.DOGMA_SITE_CONTENT);
    }
  };

  async function loadContent() {
    try {
      const res = await fetch("/api/content", { headers: { Accept: "application/json" } });
      if (!res.ok) return;
      const data = await res.json();
      if (!data || typeof data !== "object") return;
      window.DOGMA_SITE_CONTENT = data;
      applyDogmaSiteContent(data);
    } catch (e) {
      console.warn("[MONARCH] Site content API unavailable, keeping static markup.", e);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadContent);
  } else {
    loadContent();
  }
})();
