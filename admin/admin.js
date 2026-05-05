const TOKEN_KEY = "dogma_admin_token";

const EMPTY = {
  bioGallery: [],
  bioDesktopPreview: [],
  worksGallery: [],
  effectPhotos: [],
  effectVideos: [],
  vibeGallery: [],
  barbers: [],
  landingServices: [],
  bookingConfig: null,
  contacts: {},
  socials: {}
};

const TABS = [
  { id: "works", label: "Prace / galeria" },
  { id: "barbers", label: "Barberzy" },
  { id: "services", label: "Usługi na stronie" },
  { id: "booking", label: "Rezerwacja online" },
  { id: "contacts", label: "Kontakt i linki" }
];

/** Default API/calendar ids for ordered chairs (must match public booking script). */
const BOOKING_BARBER_API_IDS = ["tymur", "dima", "vlad"];

/** @type {typeof EMPTY} */
let state = JSON.parse(JSON.stringify(EMPTY));

let lastSavedFingerprint = "";

const BARBER_SERVICE_CHECKBOXES = [
  { id: "haircut", label: "Strzyżenie męskie" },
  { id: "combo", label: "Combo" },
  { id: "beard-trim", label: "Broda" },
  { id: "__other", label: "Inne usługi" }
];

function getDefaultBookingConfig() {
  return {
    serviceCategories: [
      {
        id: "popular",
        title: { pl: "Popularne usługi", ru: "Популярные услуги", en: "Popular services" },
        description: {
          pl: "Najczęściej wybierane opcje.",
          ru: "Самые востребованные варианты.",
          en: "Most booked options."
        },
        visible: true,
        order: 1
      },
      {
        id: "beard",
        title: { pl: "Broda i golenie", ru: "Борода и бритьё", en: "Beard and shaving" },
        description: {
          pl: "Usługi brody i golenia.",
          ru: "Услуги бороды и бритья.",
          en: "Beard and shaving services."
        },
        visible: true,
        order: 2
      },
      {
        id: "hair",
        title: { pl: "Strzyżenie włosów", ru: "Стрижка волос", en: "Haircut" },
        description: {
          pl: "Nożyczki, dzieci, krótkie strzyżenia.",
          ru: "Ножницы, дети, короткие стрижки.",
          en: "Scissors, kids, short cuts."
        },
        visible: true,
        order: 3
      },
      {
        id: "color",
        title: { pl: "Koloryzacja", ru: "Колорирование", en: "Color" },
        description: { pl: "Odsiwianie i koloryzacja.", ru: "Тонирование и колор.", en: "Gray blending and color." },
        visible: true,
        order: 4
      },
      {
        id: "gray",
        title: { pl: "Koloryzacja i odsiwianie", ru: "Колор и тонирование седины", en: "Color and gray blending" },
        description: {
          pl: "Usługi premium z odsiwianiem.",
          ru: "Премиальные услуги с тонированием.",
          en: "Premium services with gray blending."
        },
        visible: true,
        order: 5
      },
      {
        id: "extras",
        title: { pl: "Dodatki", ru: "Дополнения", en: "Extras" },
        description: {
          pl: "Szybkie dodatkowe usługi.",
          ru: "Быстрые дополнительные услуги.",
          en: "Quick add-ons."
        },
        visible: true,
        order: 6
      }
    ],
    services: [
      {
        id: "haircut",
        category: "popular",
        name: "Strzyżenie męskie",
        description: "",
        basePrice: 90,
        discountedPrice: "",
        duration: "1h",
        durationMinutes: 60,
        visible: true,
        bookingEnabled: true,
        availableBarberIds: [],
        allowClientBarberChoice: true
      },
      {
        id: "combo",
        category: "popular",
        name: "Strzyżenie włosów i brody",
        description: "",
        basePrice: 140,
        discountedPrice: "",
        duration: "1h 30min",
        durationMinutes: 90,
        visible: true,
        bookingEnabled: true,
        availableBarberIds: [],
        allowClientBarberChoice: true
      },
      {
        id: "scissors",
        category: "hair",
        name: "Strzyżenie nożyczkami",
        description: "",
        basePrice: 130,
        discountedPrice: "",
        duration: "1h 30min",
        durationMinutes: 90,
        visible: true,
        bookingEnabled: true,
        availableBarberIds: [],
        allowClientBarberChoice: true
      },
      {
        id: "kids",
        category: "hair",
        name: "Strzyżenie dzieci 4–12 lat",
        description: "",
        basePrice: 80,
        discountedPrice: "",
        duration: "1h",
        durationMinutes: 60,
        visible: true,
        bookingEnabled: true,
        availableBarberIds: [],
        allowClientBarberChoice: true
      },
      {
        id: "short-sides",
        category: "hair",
        name: "Krótkie strzyżenie lub same boki",
        description: "",
        basePrice: 80,
        discountedPrice: "",
        duration: "1h",
        durationMinutes: 60,
        visible: true,
        bookingEnabled: true,
        availableBarberIds: [],
        allowClientBarberChoice: true
      },
      {
        id: "beard-zero",
        category: "beard",
        name: "Broda i golenie głowy na zero",
        description: "",
        basePrice: 90,
        discountedPrice: "",
        duration: "50min",
        durationMinutes: 50,
        visible: true,
        bookingEnabled: true,
        availableBarberIds: [],
        allowClientBarberChoice: true
      },
      {
        id: "beard-trim",
        category: "beard",
        name: "Strzyżenie brody",
        description: "",
        basePrice: 70,
        discountedPrice: "",
        duration: "40min",
        durationMinutes: 40,
        visible: true,
        bookingEnabled: true,
        availableBarberIds: [],
        allowClientBarberChoice: true
      },
      {
        id: "shaving",
        category: "beard",
        name: "Golenie głowy golarką",
        description: "",
        basePrice: 50,
        discountedPrice: "",
        duration: "30min",
        durationMinutes: 30,
        visible: true,
        bookingEnabled: true,
        availableBarberIds: [],
        allowClientBarberChoice: true
      },
      {
        id: "gray-beard",
        category: "color",
        name: "Strzyżenie brody z odsiwianiem",
        description: "",
        basePrice: 150,
        discountedPrice: "",
        duration: "1h 30min",
        durationMinutes: 90,
        visible: true,
        bookingEnabled: true,
        availableBarberIds: [],
        allowClientBarberChoice: true
      },
      {
        id: "gray-hair",
        category: "color",
        name: "Strzyżenie włosów z odsiwianiem",
        description: "",
        basePrice: 150,
        discountedPrice: "",
        duration: "1h 30min",
        durationMinutes: 90,
        visible: true,
        bookingEnabled: true,
        availableBarberIds: [],
        allowClientBarberChoice: true
      },
      {
        id: "gray-combo-beard",
        category: "color",
        name: "Włosy, broda i odsiwianie brody",
        description: "",
        basePrice: 210,
        discountedPrice: "",
        duration: "2h",
        durationMinutes: 120,
        visible: true,
        bookingEnabled: true,
        availableBarberIds: [],
        allowClientBarberChoice: true
      },
      {
        id: "gray-combo-full",
        category: "color",
        name: "Włosy, broda i pełne odsiwianie",
        description: "",
        basePrice: 260,
        discountedPrice: "",
        duration: "2h",
        durationMinutes: 120,
        visible: true,
        bookingEnabled: true,
        availableBarberIds: [],
        allowClientBarberChoice: true
      },
      {
        id: "wax",
        category: "extras",
        name: "Depilacja woskiem",
        description: "",
        basePrice: 20,
        discountedPrice: "",
        duration: "5min",
        durationMinutes: 5,
        visible: true,
        bookingEnabled: true,
        availableBarberIds: [],
        allowClientBarberChoice: true
      }
    ],
    barbers: [
      {
        id: "tymur",
        name: "Tymur",
        photo: "/assets/barbers/tymur.jpg",
        description: "Młody i ambitny barber z pasją do klasycznych strzyżeń.",
        languages: ["RU Русский", "PL Polski", "GB English"]
      },
      {
        id: "dima",
        name: "Dima",
        photo: "/assets/barbers/dima.jpg",
        description: "Doświadczony barber z 3-letnim stażem. Mistrz klasyki i nowoczesnych stylów.",
        languages: ["RU Русский", "PL Polski", "GB English"]
      }
    ],
    discount: {
      enabled: true,
      name: "Zniżka tygodniowa",
      clientMessage: "Np. 10% od poniedziałku do czwartku, 10:00–16:00.",
      percent: 10,
      weekdays: [1, 2, 3, 4],
      startMinutes: 600,
      endMinutes: 960
    },
    openingHours: {
      "0": { closed: false, openHour: 10, closeHour: 18 },
      "1": { closed: false, openHour: 10, closeHour: 20 },
      "2": { closed: false, openHour: 10, closeHour: 20 },
      "3": { closed: false, openHour: 10, closeHour: 20 },
      "4": { closed: false, openHour: 10, closeHour: 20 },
      "5": { closed: false, openHour: 10, closeHour: 20 },
      "6": { closed: false, openHour: 10, closeHour: 20 }
    }
  };
}

function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

function setToken(t) {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

function authHeaders() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}`, Accept: "application/json" } : { Accept: "application/json" };
}

function newId() {
  return crypto.randomUUID();
}

function loc() {
  return { pl: "", ru: "", en: "" };
}

function newGalleryItem(mediaType = "image") {
  return {
    id: newId(),
    title: loc(),
    description: loc(),
    media: { type: mediaType, src: "", alt: loc() },
    visible: true,
    order: 0
  };
}

function newBarberItem() {
  return {
    id: newId(),
    title: loc(),
    description: loc(),
    media: { type: "image", src: "", alt: loc() },
    tags: [],
    bookCta: loc(),
    barberId: "",
    visible: true,
    visibleInBooking: true,
    performedBookingServiceIds: [],
    order: 0
  };
}

function newLandingServiceItem() {
  return {
    id: newId(),
    title: loc(),
    description: loc(),
    priceDisplay: "",
    tags: [],
    visualClass: "haircut",
    buttonLabel: loc(),
    bookingServiceId: "",
    media: { type: "image", src: "", alt: loc() },
    visible: true,
    order: 0
  };
}

function deepClone(o) {
  return JSON.parse(JSON.stringify(o));
}

function normalizeState(raw) {
  const o = { ...EMPTY, ...(raw && typeof raw === "object" ? raw : {}) };
  [
    "bioGallery",
    "bioDesktopPreview",
    "worksGallery",
    "effectPhotos",
    "effectVideos",
    "vibeGallery",
    "barbers",
    "landingServices"
  ].forEach((k) => {
    if (!Array.isArray(o[k])) o[k] = [];
  });
  if (!o.contacts || typeof o.contacts !== "object") o.contacts = {};
  if (o.contacts.hoursDisplay === undefined) o.contacts.hoursDisplay = "";
  if (o.contacts.mapImage === undefined) o.contacts.mapImage = "";
  if (!o.socials || typeof o.socials !== "object") o.socials = {};
  if (o.bookingConfig !== null && typeof o.bookingConfig !== "object") o.bookingConfig = null;
  if (o.bookingConfig == null) {
    o.bookingConfig = deepClone(getDefaultBookingConfig());
  }
  if (Array.isArray(o.bookingConfig.services)) {
    o.bookingConfig.services = o.bookingConfig.services.filter((s) => String(s.id || "") !== "bio-perm");
  }
  o.barbers.forEach((b) => {
    if (!Array.isArray(b.tags)) b.tags = [];
    if (b.visibleInBooking === undefined) b.visibleInBooking = true;
    if (!Array.isArray(b.performedBookingServiceIds)) b.performedBookingServiceIds = [];
  });

  function ensureRuFromUa(node) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(ensureRuFromUa);
      return;
    }
    if (Object.prototype.hasOwnProperty.call(node, "pl") && Object.prototype.hasOwnProperty.call(node, "ua")) {
      const r = String(node.ru || "").trim();
      const u = String(node.ua || "").trim();
      if (!r && u) node.ru = u;
    }
    Object.keys(node).forEach((k) => ensureRuFromUa(node[k]));
  }
  ensureRuFromUa(o);

  syncBookingBarbersIntoConfig(o);

  return o;
}

function fingerprintState() {
  return JSON.stringify(state);
}

function updateDirtyBanner() {
  const el = document.getElementById("dirtyBanner");
  if (!el) return;
  const dirty = fingerprintState() !== lastSavedFingerprint;
  el.textContent = dirty ? "Masz niezapisane zmiany" : "";
  el.classList.toggle("dogma-dirty", dirty);
}

function bindDirtyTracking() {
  const app = document.getElementById("appView");
  if (!app || app.dataset.dirtyBound === "1") return;
  app.dataset.dirtyBound = "1";
  app.addEventListener(
    "input",
    () => {
      updateDirtyBanner();
    },
    true
  );
  app.addEventListener(
    "change",
    () => {
      updateDirtyBanner();
    },
    true
  );
}

function showSave(msg, kind) {
  const el = document.getElementById("saveStatus");
  if (!el) return;
  el.textContent = msg || "";
  el.className = "dogma-status";
  if (kind === "ok") el.classList.add("dogma-status--ok");
  if (kind === "err") el.classList.add("dogma-status--err");
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function minutesToTime(m) {
  const n = Math.max(0, Number(m) || 0);
  const h = Math.floor(n / 60);
  const min = n % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function timeToMinutes(s) {
  if (!s || typeof s !== "string") return 0;
  const p = s.split(":");
  const h = Number(p[0]) || 0;
  const min = Number(p[1]) || 0;
  return h * 60 + min;
}

function bindCardExpandDelegation() {
  const app = document.getElementById("appView");
  if (!app || app.dataset.cardExpandBound === "1") return;
  app.dataset.cardExpandBound = "1";
  app.addEventListener("click", (e) => {
    const btn = e.target.closest(".dogma-card-edit-toggle");
    if (!btn || !app.contains(btn)) return;
    const card = btn.closest(".dogma-card");
    if (!card) return;
    const open = card.classList.toggle("is-expanded");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.textContent = open ? "Zwiń" : "Edytuj";
  });
}

function expandCardForEdit(card) {
  if (!card) return;
  card.classList.add("is-expanded");
  const btn = card.querySelector(".dogma-card-edit-toggle");
  if (btn) {
    btn.setAttribute("aria-expanded", "true");
    btn.textContent = "Zwiń";
  }
}

function focusFirstEditableInCard(card) {
  if (!card) return;
  const panel = card.querySelector(".dogma-card-edit-panel");
  const scope = panel || card;
  const el =
    scope.querySelector('[data-locale-path="title"][data-lang="pl"]') ||
    scope.querySelector('[data-locale-path="name"][data-lang="pl"]') ||
    scope.querySelector("textarea:not([readonly])") ||
    scope.querySelector('input[type="text"]:not([readonly])');
  if (!el) return;
  try {
    el.focus({ preventScroll: true });
  } catch {
    el.focus();
  }
}

function scrollToNewCard(card) {
  if (!card) return;
  card.scrollIntoView({ behavior: "smooth", block: "center" });
  card.classList.add("dogma-card--flash");
  window.setTimeout(() => card.classList.remove("dogma-card--flash"), 1600);
}

function afterNewCardInList(container, listKey) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const card = container.querySelector(`.dogma-item.dogma-card[data-list="${listKey}"]:last-of-type`);
      if (!card) return;
      expandCardForEdit(card);
      focusFirstEditableInCard(card);
      scrollToNewCard(card);
    });
  });
}

function servicePlName(s) {
  if (!s) return "";
  if (s.name && typeof s.name === "object") return String(s.name.pl || s.name.ru || s.name.ua || s.name.en || s.id || "").trim();
  return String(s.name || s.id || "").trim();
}

function getBookingServiceSelectOptionsHtml(selectedId) {
  const cfg = state.bookingConfig && typeof state.bookingConfig === "object" ? state.bookingConfig : null;
  const list = cfg && Array.isArray(cfg.services) ? cfg.services : getDefaultBookingConfig().services;
  const sel = selectedId != null ? String(selectedId) : "";
  const opts = [`<option value="">— brak —</option>`].concat(
    list.map((s) => {
      const id = String(s.id);
      return `<option value="${esc(id)}" ${id === sel ? "selected" : ""}>${esc(servicePlName(s) || id)}</option>`;
    })
  );
  return opts.join("");
}

function bindPlCopyEmptyButtons(wrap, item, refresh) {
  wrap.querySelectorAll("[data-copy-pl-to-empty]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const path = btn.getAttribute("data-copy-pl-to-empty");
      if (!path) return;
      const ref = ensureLocaleRef(item, path);
      const pl = (ref.pl || "").trim();
      if (!pl) return;
      if (!(ref.ru || "").trim()) ref.ru = (ref.ua || "").trim() ? ref.ua : pl;
      if (!(ref.en || "").trim()) ref.en = pl;
      wrap.querySelectorAll("[data-locale-path]").forEach((inp) => {
        if (inp.dataset.localePath !== path) return;
        const L = inp.dataset.lang;
        if (L === "ru" || L === "en") inp.value = ref[L] || "";
      });
      if (typeof refresh === "function") refresh();
      updateDirtyBanner();
    });
  });
}

function ensureLocaleRef(root, pathStr) {
  const segs = pathStr.split(".");
  let cur = root;
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    const last = i === segs.length - 1;
    if (last) {
      if (!cur[s] || typeof cur[s] !== "object" || !("pl" in cur[s])) cur[s] = loc();
      return cur[s];
    }
    if (!cur[s] || typeof cur[s] !== "object") cur[s] = {};
    cur = cur[s];
  }
  return loc();
}

const LOCALE_FIELD_LABEL = {
  name: {
    pl: "Tytuł po polsku — klient zobaczy to na stronie",
    ru: "Tytuł po rosyjsku — klient zobaczy to na stronie",
    en: "Tytuł po angielsku — klient zobaczy to na stronie"
  },
  desc: {
    pl: "Krótki opis po polsku",
    ru: "Krótki opis po rosyjsku",
    en: "Krótki opis po angielsku"
  },
  barberName: {
    pl: "Imię po polsku — jak na stronie",
    ru: "Imię po rosyjsku",
    en: "Imię po angielsku"
  },
  bookCta: {
    pl: "Napis na przycisku (np. Umów) — PL",
    ru: "Napis na przycisku — RU",
    en: "Napis na przycisku — EN"
  },
  landingBtn: {
    pl: "Napis na przycisku — PL",
    ru: "Napis na przycisku — RU",
    en: "Napis na przycisku — EN"
  },
  catTitle: {
    pl: "Nazwa kategorii — PL",
    ru: "Nazwa kategorii — RU",
    en: "Nazwa kategorii — EN"
  },
  catDesc: {
    pl: "Krótki opis — PL",
    ru: "Krótki opis — RU",
    en: "Krótki opis — EN"
  },
  address: {
    pl: "Adres po polsku",
    ru: "Adres po rosyjsku",
    en: "Adres po angielsku"
  },
  bookingSvcName: {
    pl: "Nazwa usługi po polsku",
    ru: "Nazwa usługi po rosyjsku",
    en: "Nazwa usługi po angielsku"
  },
  bookingSvcDesc: {
    pl: "Krótki opis po polsku",
    ru: "Krótki opis po rosyjsku",
    en: "Krótki opis po angielsku"
  }
};

function fieldLocaleBlock(item, pathStr, mode) {
  const labels = LOCALE_FIELD_LABEL[mode] || LOCALE_FIELD_LABEL.name;
  const multiline = mode === "desc" || mode === "catDesc" || mode === "address";
  const o = ensureLocaleRef(item, pathStr);
  const copyRow =
    mode === "name" || mode === "desc" || mode === "barberName" || mode === "bookingSvcName" || mode === "bookingSvcDesc"
      ? `<div class="dogma-field dogma-field--tight">
           <button type="button" class="dogma-btn dogma-btn--ghost dogma-btn--small" data-copy-pl-to-empty="${esc(
             pathStr
           )}">Skopiuj polski tekst do RU i EN (tylko puste pola)</button>
         </div>`
      : "";
  const rows = ["pl", "ru", "en"].map((lang) => {
    const v = esc(o[lang] || "");
    const lab = labels[lang];
    if (multiline) {
      return `<div class="dogma-field"><label>${esc(lab)}</label><textarea data-locale-path="${esc(
        pathStr
      )}" data-lang="${lang}">${v}</textarea></div>`;
    }
    return `<div class="dogma-field"><label>${esc(lab)}</label><input type="text" data-locale-path="${esc(
      pathStr
    )}" data-lang="${lang}" value="${v}" /></div>`;
  });
  return `${copyRow}<div class="dogma-locale-grid">${rows.join("")}</div>`;
}

function fieldLocaleAltSeoBlock(item) {
  const pathStr = "media.alt";
  const o = ensureLocaleRef(item, pathStr);
  const rows = ["pl", "ru", "en"].map((lang) => {
    const v = esc(o[lang] || "");
    const lab =
      lang === "pl"
        ? "Krótki opis zdjęcia — PL (dla wyszukiwarki)"
        : lang === "ru"
          ? "Krótki opis zdjęcia — RU"
          : "Krótki opis zdjęcia — EN";
    return `<div class="dogma-field"><label>${esc(lab)}</label><input type="text" data-locale-path="${esc(
      pathStr
    )}" data-lang="${lang}" value="${v}" /></div>`;
  });
  return `<div class="dogma-locale-grid">${rows.join("")}</div>`;
}

function confirmDeleteCard() {
  return window.confirm("Na pewno usunąć tę kartę?");
}

const EMPTY_COPY = {
  bioGallery: ["Nie ma jeszcze żadnej karty.", "Kliknij „+ Dodaj kartę bio trwałej” i dodaj pierwszą."],
  bioDesktopPreview: [
    "Nie ma jeszcze kart na duży ekran.",
    "Kliknij „+” — klienci na komputerze zobaczą je pod sekcją bio."
  ],
  worksGallery: ["Nie ma jeszcze żadnej pracy.", "Kliknij „+ Dodaj pracę” i wgraj pierwsze zdjęcie."],
  effectPhotos: ["Nie ma jeszcze zdjęć efektu.", "Kliknij „+ Dodaj zdjęcie efektu”."],
  effectVideos: ["Nie ma jeszcze filmów efektu.", "Kliknij „+ Dodaj video efektu”."],
  vibeGallery: [
    "Nie ma jeszcze zdjęć salonu.",
    "Kliknij „+ Dodaj zdjęcie salonu” — to zobaczą klienci na stronie."
  ],
  barbers: ["Nie ma jeszcze żadnego barbera.", "Kliknij „+ Dodaj barbera” i uzupełnij pierwszą kartę."],
  landingServices: [
    "Nie ma jeszcze własnych usług na stronie głównej.",
    "Kliknij „+ Dodaj usługę na stronę” albo zostaw puste — zostanie tekst początkowy."
  ]
};

function emptyStateBlock(listKey) {
  const lines = EMPTY_COPY[listKey];
  if (!lines) return "";
  return `<div class="dogma-empty" role="status">
    <p>${esc(lines[0])}</p>
    <p class="dogma-empty__sub">${esc(lines[1])}</p>
  </div>`;
}

function bindLocalePath(wrap, item) {
  if (!wrap) return;
  wrap.querySelectorAll("[data-locale-path]").forEach((el) => {
    const pathStr = el.dataset.localePath;
    const lang = el.dataset.lang;
    el.addEventListener("input", () => {
      const ref = ensureLocaleRef(item, pathStr);
      ref[lang] = el.value;
    });
  });
}

function pickLocAdmin(o, lang) {
  if (!o || typeof o !== "object") return "";
  return String(o[lang] || o.pl || o.ru || o.ua || o.en || "").trim();
}

function syncBookingBarbersIntoConfig(payload) {
  const cfg = payload && payload.bookingConfig;
  if (!cfg || typeof cfg !== "object") return;
  const list = Array.isArray(payload.barbers) ? payload.barbers : [];
  cfg.barbers = list
    .filter((b) => b && b.visible !== false && b.visibleInBooking !== false)
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
    .map((b, idx) => {
      const id =
        String(b.barberId || "").trim() ||
        BOOKING_BARBER_API_IDS[idx] ||
        String(b.id || "").trim();
      if (!id) return null;
      return {
        id,
        name: pickLocAdmin(b.title, "pl") || id
      };
    })
    .filter(Boolean);
}

function cardTitleLine(item, lang) {
  return pickLocAdmin(item.title, lang) || "—";
}

function updateGalleryCardPreviews(wrap, item) {
  const lang = wrap.dataset.previewLang || "pl";
  const type = item.media?.type || "image";
  const src = item.media?.src || "";
  const heroBox = wrap.querySelector(".dogma-card-hero__media");
  if (heroBox) {
    if (!src) heroBox.innerHTML = `<span class="dogma-preview-placeholder">Brak zdjęcia</span>`;
    else if (type === "video") {
      heroBox.innerHTML = `<video class="dogma-preview" src="${esc(src)}" muted loop playsinline controls></video>`;
    } else {
      heroBox.innerHTML = `<img alt="" src="${esc(src)}" />`;
    }
  }
  const box = wrap.querySelector(".dogma-preview--main");
  if (box) {
    if (!src) box.innerHTML = "";
    else if (type === "video") {
      box.innerHTML = `<video class="dogma-preview" src="${esc(src)}" muted loop playsinline controls></video>`;
    } else {
      box.innerHTML = `<img alt="" src="${esc(src)}" />`;
    }
  }
  const mini = wrap.querySelector(".dogma-card-preview-media");
  if (mini) {
    if (!src) mini.innerHTML = "";
    else if (type === "video") {
      mini.innerHTML = `<video class="dogma-preview" src="${esc(src)}" muted loop playsinline></video>`;
    } else {
      mini.innerHTML = `<img alt="" src="${esc(src)}" />`;
    }
  }
  const t1 = wrap.querySelector("[data-card-head-title]");
  if (t1) t1.textContent = cardTitleLine(item, lang);
  const t2 = wrap.querySelector("[data-card-preview-title]");
  const d2 = wrap.querySelector("[data-card-preview-desc]");
  if (t2) t2.textContent = cardTitleLine(item, lang);
  if (d2) d2.textContent = pickLocAdmin(item.description, lang);
  const badge = wrap.querySelector("[data-card-visibility-badge]");
  if (badge) {
    badge.textContent = item.visible !== false ? "Widoczna na stronie" : "Ukryta na stronie";
    badge.classList.toggle("dogma-badge--off", item.visible === false);
  }
}

function renderGalleryEditor(container, listKey, options) {
  const { mediaTypeDefault, allowVideoToggle, addButtonLabel, headHint } = options || {};
  const list = state[listKey];
  const addLabel = addButtonLabel || "+ Dodaj kartę";
  const hint = headHint || "Gdy lista jest pusta, na stronie zostaje tekst startowy.";

  const head = `
    <button type="button" class="dogma-btn dogma-btn--primary dogma-btn--block-sm" data-add="${esc(listKey)}">${esc(addLabel)}</button>
    <p class="dogma-hint">${esc(hint)}</p>
    ${list.length === 0 ? emptyStateBlock(listKey) : ""}
  `;

  const blocks = list
    .map((item, idx) => {
      const type = item.media?.type || mediaTypeDefault || "image";
      const src = item.media?.src || "";

      const typeSelect = allowVideoToggle
        ? `<div class="dogma-field">
        <label>To zdjęcie czy krótki film?</label>
        <select data-field="mediaType">
          <option value="image" ${type === "image" ? "selected" : ""}>Zdjęcie</option>
          <option value="video" ${type === "video" ? "selected" : ""}>Film</option>
        </select>
      </div>`
        : `<input type="hidden" data-field="mediaType" value="${esc(type)}" />`;

      return `
      <div class="dogma-item dogma-card" data-list="${esc(listKey)}" data-index="${idx}" data-preview-lang="pl">
        <div class="dogma-card-hero">
          <div class="dogma-card-hero__media dogma-preview-box">${src ? "" : `<span class="dogma-preview-placeholder">Brak zdjęcia</span>`}</div>
          <div class="dogma-card-hero__meta">
            <strong class="dogma-card-hero__title" data-card-head-title>${esc(cardTitleLine(item, "pl"))}</strong>
            <span class="dogma-badge" data-card-visibility-badge>${item.visible !== false ? "Widoczna na stronie" : "Ukryta na stronie"}</span>
            <div class="dogma-card-hero__actions">
              <button type="button" class="dogma-btn" data-move="${esc(listKey)}" data-dir="-1" data-index="${idx}">Wyżej</button>
              <button type="button" class="dogma-btn" data-move="${esc(listKey)}" data-dir="1" data-index="${idx}">Niżej</button>
              <button type="button" class="dogma-btn dogma-btn--danger" data-del="${esc(listKey)}" data-index="${idx}">Usuń kartę</button>
            </div>
          </div>
        </div>

        <button type="button" class="dogma-btn dogma-btn--ghost dogma-card-edit-toggle" aria-expanded="false">Edytuj</button>
        <div class="dogma-card-edit-panel">

        <h4 class="dogma-section-title">1. Co klient zobaczy?</h4>
        <p class="dogma-field-hint dogma-field-hint--above">Ta nazwa i opis pokażą się klientowi na stronie.</p>
        ${fieldLocaleBlock(item, "title", "name")}
        ${fieldLocaleBlock(item, "description", "desc")}

        <h4 class="dogma-section-title">2. Zdjęcie albo video</h4>
        <p class="dogma-field-hint dogma-field-hint--above">Wgraj plik z telefonu lub komputera. Po wgraniu pojawi się tutaj automatycznie.</p>
        ${typeSelect}
        <div class="dogma-field">
          <label>Wgraj zdjęcie albo video</label>
          <input type="file" class="dogma-file-input" data-upload="${esc(listKey)}" data-index="${idx}" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov" />
        </div>
        <p class="dogma-field-hint">Podgląd zdjęcia:</p>
        <div class="dogma-preview dogma-preview--main"></div>

        <h4 class="dogma-section-title">3. Czy pokazywać na stronie?</h4>
        <div class="dogma-field dogma-field--inline">
          <label>
            <input type="checkbox" data-field="visible" ${item.visible !== false ? "checked" : ""} />
            Pokazuj na stronie
          </label>
        </div>
        <div class="dogma-field">
          <label>Kolejność na stronie</label>
          <input type="number" data-field="order" value="${Number(item.order) || 0}" />
          <p class="dogma-field-hint">Niższa liczba = pokaże się wcześniej.</p>
        </div>

        <details class="dogma-details">
          <summary>Dodatkowe ustawienia — nie musisz tego ruszać</summary>
          <p class="dogma-field-hint">Dla wyszukiwarek. Możesz zostawić puste.</p>
          ${fieldLocaleAltSeoBlock(item)}
        </details>

        <details class="dogma-details dogma-details--tech">
          <summary>Ustawienia techniczne — tylko dla programisty</summary>
          <p class="dogma-field-hint">Wybrane zdjęcie albo film — zwykle uzupełnia się samo po wgraniu pliku.</p>
          <div class="dogma-field">
            <label>Adres pliku po wgraniu</label>
            <input type="text" data-field="src" value="${esc(src)}" />
          </div>
          <div class="dogma-field">
            <label>Wewnętrzny numer karty</label>
            <input type="text" readonly value="${esc(item.id)}" />
          </div>
        </details>

        <div class="dogma-card-preview-block">
          <h4 class="dogma-section-title">Podgląd karty</h4>
          <div class="dogma-preview-lang" role="group" aria-label="Podgląd języka">
            <span>Język:</span>
            <button type="button" class="dogma-lang-pill active" data-preview-lang-btn="pl">PL</button>
            <button type="button" class="dogma-lang-pill" data-preview-lang-btn="ru">RU</button>
            <button type="button" class="dogma-lang-pill" data-preview-lang-btn="en">EN</button>
          </div>
          <p class="dogma-field-hint">Tak karta wygląda dla klienta.</p>
          <div class="dogma-card-preview-card">
            <div class="dogma-card-preview-media dogma-preview-box"></div>
            <strong data-card-preview-title></strong>
            <p data-card-preview-desc></p>
          </div>
        </div>

        </div>
      </div>`;
    })
    .join("");

  container.innerHTML = head + blocks;

  container.querySelector(`[data-add="${listKey}"]`)?.addEventListener("click", () => {
    const it = newGalleryItem(allowVideoToggle ? "image" : mediaTypeDefault || "image");
    it.order = state[listKey].length;
    state[listKey].push(it);
    renderGalleryEditor(container, listKey, options);
    updateDirtyBanner();
    afterNewCardInList(container, listKey);
  });

  list.forEach((item, idx) => {
    const wrap = container.querySelector(`.dogma-item[data-index="${idx}"][data-list="${listKey}"]`);
    if (!wrap) return;

    wrap.querySelectorAll("[data-preview-lang-btn]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const L = btn.getAttribute("data-preview-lang-btn") || "pl";
        wrap.dataset.previewLang = L;
        wrap.querySelectorAll("[data-preview-lang-btn]").forEach((b) => b.classList.toggle("active", b === btn));
        updateGalleryCardPreviews(wrap, item);
      });
    });

    wrap.querySelector("[data-field=order]")?.addEventListener("input", (e) => {
      item.order = Number(e.target.value) || 0;
      updateDirtyBanner();
    });
    wrap.querySelector("[data-field=visible]")?.addEventListener("change", (e) => {
      item.visible = e.target.checked;
      updateGalleryCardPreviews(wrap, item);
      updateDirtyBanner();
    });
    wrap.querySelector("[data-field=src]")?.addEventListener("input", (e) => {
      if (!item.media) item.media = { type: "image", src: "", alt: loc() };
      item.media.src = e.target.value;
      updateGalleryCardPreviews(wrap, item);
      updateDirtyBanner();
    });
    wrap.querySelector("[data-field=mediaType]")?.addEventListener("change", (e) => {
      if (!item.media) item.media = { type: "image", src: "", alt: loc() };
      item.media.type = e.target.value;
      updateGalleryCardPreviews(wrap, item);
      updateDirtyBanner();
    });

    bindLocalePath(wrap, item);
    bindPlCopyEmptyButtons(wrap, item, () => updateGalleryCardPreviews(wrap, item));
    wrap.querySelectorAll("[data-locale-path]").forEach((el) => {
      el.addEventListener("input", () => updateGalleryCardPreviews(wrap, item));
    });

    wrap.querySelector(`[data-del="${listKey}"][data-index="${idx}"]`)?.addEventListener("click", () => {
      if (!confirmDeleteCard()) return;
      state[listKey].splice(idx, 1);
      renderGalleryEditor(container, listKey, options);
      updateDirtyBanner();
    });
    wrap.querySelector(`[data-move="${listKey}"][data-index="${idx}"][data-dir="-1"]`)?.addEventListener("click", () => {
      if (idx <= 0) return;
      [state[listKey][idx - 1], state[listKey][idx]] = [state[listKey][idx], state[listKey][idx - 1]];
      renderGalleryEditor(container, listKey, options);
      updateDirtyBanner();
    });
    wrap.querySelector(`[data-move="${listKey}"][data-index="${idx}"][data-dir="1"]`)?.addEventListener("click", () => {
      if (idx >= state[listKey].length - 1) return;
      [state[listKey][idx + 1], state[listKey][idx]] = [state[listKey][idx], state[listKey][idx + 1]];
      renderGalleryEditor(container, listKey, options);
      updateDirtyBanner();
    });

    wrap.querySelector(`[data-upload="${listKey}"][data-index="${idx}"]`)?.addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        const path = await uploadFile(file);
        if (!item.media) item.media = { type: "image", src: "", alt: loc() };
        item.media.src = path;
        const low = file.name.toLowerCase();
        if (low.endsWith(".mp4") || low.endsWith(".webm") || low.endsWith(".mov")) item.media.type = "video";
        const inp = wrap.querySelector("[data-field=src]");
        if (inp) inp.value = path;
        if (allowVideoToggle) {
          const sel = wrap.querySelector("[data-field=mediaType]");
          if (sel) sel.value = item.media.type;
        }
        updateGalleryCardPreviews(wrap, item);
        showSave("Wgrano plik", "ok");
        updateDirtyBanner();
      } catch (err) {
        showSave(err.message || "Nie udało się wgrać pliku.", "err");
      }
      e.target.value = "";
    });

    updateGalleryCardPreviews(wrap, item);
  });
}

function updatePreview(wrap, item) {
  updateGalleryCardPreviews(wrap, item);
}

async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", {
    method: "POST",
    headers: authHeaders(),
    body: fd
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Nie udało się wgrać pliku.");
  const uploaded = (data.url != null && String(data.url).trim()) || (data.path != null && String(data.path).trim());
  if (!uploaded) throw new Error("Serwer nie zwrócił adresu pliku.");
  return uploaded.startsWith("/") ? uploaded : `/${uploaded.replace(/^\.?\//, "")}`;
}

function updateBarberCardPreviews(wrap, item) {
  const lang = wrap.dataset.previewLang || "pl";
  const src = item.media?.src || "";
  const heroBox = wrap.querySelector(".dogma-card-hero__media");
  if (heroBox) {
    if (!src) heroBox.innerHTML = `<span class="dogma-preview-placeholder">Brak zdjęcia</span>`;
    else heroBox.innerHTML = `<img alt="" src="${esc(src)}" />`;
  }
  const box = wrap.querySelector(".dogma-preview--main");
  if (box) {
    box.innerHTML = src ? `<img alt="" src="${esc(src)}" />` : "";
  }
  const mini = wrap.querySelector(".dogma-card-preview-media");
  if (mini) {
    mini.innerHTML = src ? `<img alt="" src="${esc(src)}" />` : "";
  }
  const t1 = wrap.querySelector("[data-card-head-title]");
  if (t1) t1.textContent = cardTitleLine(item, lang);
  const t2 = wrap.querySelector("[data-card-preview-title]");
  const d2 = wrap.querySelector("[data-card-preview-desc]");
  if (t2) t2.textContent = cardTitleLine(item, lang);
  if (d2) d2.textContent = pickLocAdmin(item.description, lang);
  const badge = wrap.querySelector("[data-card-visibility-badge]");
  if (badge) {
    badge.textContent = item.visible !== false ? "Widoczna na stronie" : "Ukryta na stronie";
    badge.classList.toggle("dogma-badge--off", item.visible === false);
  }
  const b = wrap.querySelector("[data-card-preview-btn]");
  if (b) {
    const lbl = pickLocAdmin(item.bookCta, lang);
    b.textContent = lbl || "Umów";
    b.style.opacity = lbl ? "1" : "0.45";
  }
}

function renderBarbersEditor(container) {
  const list = state.barbers;

  const head = `
    <button type="button" class="dogma-btn dogma-btn--primary dogma-btn--block-sm" data-add-barber>+ Dodaj barbera</button>
    <p class="dogma-hint">Zdjęcie, imię i krótki opis — tak wygląda karta na stronie.</p>
    ${list.length === 0 ? emptyStateBlock("barbers") : ""}
  `;

  const blocks = list
    .map((item, idx) => {
      const src = item.media?.src || "";
      const tagsStr = Array.isArray(item.tags) ? item.tags.join("\n") : "";
      const ids = Array.isArray(item.performedBookingServiceIds) ? item.performedBookingServiceIds : [];
      const checked = (id) => (ids.includes(id) ? "checked" : "");
      const rowChecks = BARBER_SERVICE_CHECKBOXES.map(
        (s) => `
        <label class="dogma-check">
          <input type="checkbox" data-barber-svc="${esc(s.id)}" ${checked(s.id)} />
          <span>${esc(s.label)}</span>
        </label>`
      ).join("");
      return `
      <div class="dogma-item dogma-card" data-list="barbers" data-index="${idx}" data-preview-lang="pl">
        <div class="dogma-card-hero">
          <div class="dogma-card-hero__media dogma-preview-box">${src ? `<img alt="" src="${esc(src)}" />` : `<span class="dogma-preview-placeholder">Brak zdjęcia</span>`}</div>
          <div class="dogma-card-hero__meta">
            <strong class="dogma-card-hero__title" data-card-head-title>${esc(cardTitleLine(item, "pl"))}</strong>
            <span class="dogma-badge" data-card-visibility-badge>${item.visible !== false ? "Widoczna na stronie" : "Ukryta na stronie"}</span>
            <div class="dogma-card-hero__actions">
              <button type="button" class="dogma-btn" data-move="barbers" data-dir="-1" data-index="${idx}">Wyżej</button>
              <button type="button" class="dogma-btn" data-move="barbers" data-dir="1" data-index="${idx}">Niżej</button>
              <button type="button" class="dogma-btn dogma-btn--danger" data-del="barbers" data-index="${idx}">Usuń kartę</button>
            </div>
          </div>
        </div>

        <button type="button" class="dogma-btn dogma-btn--ghost dogma-card-edit-toggle" aria-expanded="false">Edytuj</button>
        <div class="dogma-card-edit-panel">

        <h4 class="dogma-section-title">1. Co klient zobaczy?</h4>
        <p class="dogma-field-hint dogma-field-hint--above">Ta nazwa i opis pokażą się na stronie.</p>
        ${fieldLocaleBlock(item, "title", "barberName")}
        ${fieldLocaleBlock(item, "description", "desc")}
        ${fieldLocaleBlock(item, "bookCta", "bookCta")}

        <h4 class="dogma-section-title">2. Zdjęcie barbera</h4>
        <p class="dogma-field-hint dogma-field-hint--above">Wgraj zdjęcie z telefonu lub komputera — pojawi się tu automatycznie.</p>
        <div class="dogma-field">
          <label>Wgraj zdjęcie</label>
          <input type="file" class="dogma-file-input" data-upload-barber="${idx}" accept="image/jpeg,image/png,image/webp,image/gif" />
        </div>
        <p class="dogma-field-hint">Podgląd zdjęcia:</p>
        <div class="dogma-preview dogma-preview--main">${src ? `<img alt="" src="${esc(src)}" />` : ""}</div>

        <h4 class="dogma-section-title">3. Małe tagi pod opisem</h4>
        <div class="dogma-field">
          <label>Jedna linia = jeden tag</label>
          <textarea data-field="tags">${esc(tagsStr)}</textarea>
        </div>

        <h4 class="dogma-section-title">4. Czy pokazywać na stronie?</h4>
        <div class="dogma-field dogma-field--inline">
          <label><input type="checkbox" data-field="visible" ${item.visible !== false ? "checked" : ""} /> Pokazuj na stronie</label>
        </div>
        <div class="dogma-field dogma-field--inline">
          <label><input type="checkbox" data-field="visibleInBooking" ${item.visibleInBooking !== false ? "checked" : ""} /> Pokazuj w rezerwacji online</label>
        </div>
        <div class="dogma-field">
          <label>Kolejność na stronie</label>
          <input type="number" data-field="order" value="${Number(item.order) || 0}" />
          <p class="dogma-field-hint">Niższa liczba = pokaże się wcześniej.</p>
        </div>

        <h4 class="dogma-section-title">5. Jakie usługi wykonuje?</h4>
        <p class="dogma-field-hint dogma-field-hint--above">Dla Ciebie — pełna lista jest w „Rezerwacja online”.</p>
        <div class="dogma-check-grid">${rowChecks}</div>

        <details class="dogma-details">
          <summary>Dodatkowe ustawienia — nie musisz tego ruszać</summary>
          <p class="dogma-field-hint">Dla wyszukiwarek. Możesz zostawić puste.</p>
          ${fieldLocaleAltSeoBlock(item)}
        </details>

        <details class="dogma-details dogma-details--tech">
          <summary>Ustawienia techniczne — tylko dla programisty</summary>
          <p class="dogma-field-hint">Tu są rzadko potrzebne rzeczy wewnętrzne — zwykle nie ruszaj.</p>
          <div class="dogma-field">
            <label>Adres zdjęcia po wgraniu</label>
            <input type="text" data-field="src" value="${esc(src)}" />
          </div>
          <div class="dogma-field">
            <label>Wewnętrzny numer karty</label>
            <input type="text" readonly value="${esc(item.id)}" />
          </div>
          <div class="dogma-field">
            <label>Wewnętrzny zapis osoby w systemie (np. tymur)</label>
            <input type="text" data-field="barberId" value="${esc(item.barberId || "")}" placeholder="tymur" />
          </div>
        </details>

        <div class="dogma-card-preview-block">
          <h4 class="dogma-section-title">Podgląd</h4>
          <div class="dogma-preview-lang" role="group" aria-label="Podgląd języka">
            <span>Język:</span>
            <button type="button" class="dogma-lang-pill active" data-preview-lang-btn="pl">PL</button>
            <button type="button" class="dogma-lang-pill" data-preview-lang-btn="ru">RU</button>
            <button type="button" class="dogma-lang-pill" data-preview-lang-btn="en">EN</button>
          </div>
          <p class="dogma-field-hint">Tak karta wygląda dla klienta.</p>
          <div class="dogma-card-preview-card dogma-card-preview-card--barber">
            <div class="dogma-card-preview-media dogma-preview-box"></div>
            <strong data-card-preview-title></strong>
            <p data-card-preview-desc></p>
            <button type="button" class="dogma-preview-fake-btn" data-card-preview-btn>Umów</button>
          </div>
        </div>

        </div>
      </div>`;
    })
    .join("");

  container.innerHTML = head + blocks;

  container.querySelector("[data-add-barber]")?.addEventListener("click", () => {
    const it = newBarberItem();
    it.order = state.barbers.length;
    state.barbers.push(it);
    renderBarbersEditor(container);
    updateDirtyBanner();
    afterNewCardInList(container, "barbers");
  });

  list.forEach((item, idx) => {
    const wrap = container.querySelector(`.dogma-item[data-index="${idx}"][data-list="barbers"]`);
    if (!wrap) return;

    wrap.querySelectorAll("[data-preview-lang-btn]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const L = btn.getAttribute("data-preview-lang-btn") || "pl";
        wrap.dataset.previewLang = L;
        wrap.querySelectorAll("[data-preview-lang-btn]").forEach((b) => b.classList.toggle("active", b === btn));
        updateBarberCardPreviews(wrap, item);
      });
    });

    wrap.querySelector("[data-field=order]")?.addEventListener("input", (e) => {
      item.order = Number(e.target.value) || 0;
      updateDirtyBanner();
    });
    wrap.querySelector("[data-field=visible]")?.addEventListener("change", (e) => {
      item.visible = e.target.checked;
      updateBarberCardPreviews(wrap, item);
      updateDirtyBanner();
    });
    wrap.querySelector("[data-field=visibleInBooking]")?.addEventListener("change", (e) => {
      item.visibleInBooking = e.target.checked;
      updateDirtyBanner();
    });
    wrap.querySelector("[data-field=barberId]")?.addEventListener("input", (e) => {
      item.barberId = e.target.value.trim();
      updateDirtyBanner();
    });
    wrap.querySelector("[data-field=src]")?.addEventListener("input", (e) => {
      if (!item.media) item.media = { type: "image", src: "", alt: loc() };
      item.media.src = e.target.value;
      updateBarberCardPreviews(wrap, item);
      updateDirtyBanner();
    });
    wrap.querySelector("[data-field=tags]")?.addEventListener("input", (e) => {
      item.tags = e.target.value
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      updateDirtyBanner();
    });

    wrap.querySelectorAll("[data-barber-svc]").forEach((el) => {
      el.addEventListener("change", () => {
        const id = el.getAttribute("data-barber-svc");
        if (!id) return;
        if (!Array.isArray(item.performedBookingServiceIds)) item.performedBookingServiceIds = [];
        const set = new Set(item.performedBookingServiceIds);
        if (el.checked) set.add(id);
        else set.delete(id);
        item.performedBookingServiceIds = [...set];
        updateDirtyBanner();
      });
    });

    bindLocalePath(wrap, item);
    bindPlCopyEmptyButtons(wrap, item, () => updateBarberCardPreviews(wrap, item));
    wrap.querySelectorAll("[data-locale-path]").forEach((el) => {
      el.addEventListener("input", () => updateBarberCardPreviews(wrap, item));
    });

    wrap.querySelector(`[data-del="barbers"][data-index="${idx}"]`)?.addEventListener("click", () => {
      if (!confirmDeleteCard()) return;
      state.barbers.splice(idx, 1);
      renderBarbersEditor(container);
      updateDirtyBanner();
    });
    wrap.querySelector(`[data-move="barbers"][data-index="${idx}"][data-dir="-1"]`)?.addEventListener("click", () => {
      if (idx <= 0) return;
      [state.barbers[idx - 1], state.barbers[idx]] = [state.barbers[idx], state.barbers[idx - 1]];
      renderBarbersEditor(container);
      updateDirtyBanner();
    });
    wrap.querySelector(`[data-move="barbers"][data-index="${idx}"][data-dir="1"]`)?.addEventListener("click", () => {
      if (idx >= state.barbers.length - 1) return;
      [state.barbers[idx + 1], state.barbers[idx]] = [state.barbers[idx], state.barbers[idx + 1]];
      renderBarbersEditor(container);
      updateDirtyBanner();
    });

    wrap.querySelector(`[data-upload-barber="${idx}"]`)?.addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        const path = await uploadFile(file);
        if (!item.media) item.media = { type: "image", src: "", alt: loc() };
        item.media.src = path;
        item.media.type = "image";
        const inp = wrap.querySelector("[data-field=src]");
        if (inp) inp.value = path;
        updateBarberCardPreviews(wrap, item);
        showSave("Wgrano plik", "ok");
        updateDirtyBanner();
      } catch (err) {
        showSave(err.message || "Nie udało się wgrać pliku.", "err");
      }
      e.target.value = "";
    });

    updateBarberCardPreviews(wrap, item);
  });
}

function renderLandingServicesEditor(container) {
  const listKey = "landingServices";
  const list = state.landingServices;

  const head = `
    <button type="button" class="dogma-btn dogma-btn--primary dogma-btn--block-sm" data-add-landing>+ Dodaj usługę na stronę</button>
    <p class="dogma-hint">To są karty na stronie głównej — nie myl z listą w rezerwacji. Pusta lista = zostaje tekst początkowy.</p>
    ${list.length === 0 ? emptyStateBlock("landingServices") : ""}
  `;

  const blocks = list
    .map((item, idx) => {
      const src = item.media?.src || "";
      const tagsStr = Array.isArray(item.tags) ? item.tags.join("\n") : "";
      const bid = item.bookingServiceId != null ? String(item.bookingServiceId) : "";
      const opts = getBookingServiceSelectOptionsHtml(bid);
      const vc = String(item.visualClass || "haircut");
      return `
      <div class="dogma-item dogma-card" data-list="${listKey}" data-index="${idx}" data-preview-lang="pl">
        <div class="dogma-card-hero">
          <div class="dogma-card-hero__media dogma-preview-box"><span class="dogma-preview-placeholder">Podgląd</span></div>
          <div class="dogma-card-hero__meta">
            <strong class="dogma-card-hero__title" data-card-head-title>${esc(cardTitleLine(item, "pl"))}</strong>
            <span class="dogma-badge" data-card-visibility-badge>${item.visible !== false ? "Widoczna na stronie" : "Ukryta na stronie"}</span>
            <div class="dogma-card-hero__actions">
              <button type="button" class="dogma-btn" data-move="${listKey}" data-dir="-1" data-index="${idx}">Wyżej</button>
              <button type="button" class="dogma-btn" data-move="${listKey}" data-dir="1" data-index="${idx}">Niżej</button>
              <button type="button" class="dogma-btn dogma-btn--danger" data-del="${listKey}" data-index="${idx}">Usuń kartę</button>
            </div>
          </div>
        </div>

        <button type="button" class="dogma-btn dogma-btn--ghost dogma-card-edit-toggle" aria-expanded="false">Edytuj</button>
        <div class="dogma-card-edit-panel">

        <h4 class="dogma-section-title">1. Co klient zobaczy?</h4>
        <p class="dogma-field-hint dogma-field-hint--above">Nazwa, opis i cena na karcie.</p>
        ${fieldLocaleBlock(item, "title", "name")}
        ${fieldLocaleBlock(item, "description", "desc")}
        <div class="dogma-field">
          <label>Cena na karcie (tekst)</label>
          <input type="text" data-field="priceDisplay" value="${esc(item.priceDisplay || "")}" placeholder="np. 90 zł" />
        </div>
        ${fieldLocaleBlock(item, "buttonLabel", "landingBtn")}
        <div class="dogma-field">
          <label>Po kliknięciu klient może od razu wybrać usługę w rezerwacji</label>
          <p class="dogma-field-hint dogma-field-hint--tight">Wybierz usługę z listy — albo zostaw „brak”, jeśli przycisk ma tylko otworzyć rezerwację.</p>
          <select data-field="bookingServiceId">${opts}</select>
        </div>

        <h4 class="dogma-section-title">2. Zdjęcie albo krótki film</h4>
        <p class="dogma-field-hint dogma-field-hint--above">Możesz użyć gotowego stylu karty albo wgrać własny plik.</p>
        <div class="dogma-field">
          <label>Wygląd karty (tło)</label>
          <select data-field="visualClass">
            <option value="haircut" ${vc === "haircut" ? "selected" : ""}>Strzyżenie</option>
            <option value="combo" ${vc === "combo" ? "selected" : ""}>Combo</option>
            <option value="beard" ${vc === "beard" ? "selected" : ""}>Broda</option>
          </select>
        </div>
        <div class="dogma-field">
          <label>Wgraj zdjęcie albo krótki film</label>
          <input type="file" class="dogma-file-input" data-upload="${listKey}" data-index="${idx}" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov" />
        </div>
        <p class="dogma-field-hint">Podgląd:</p>
        <div class="dogma-preview dogma-preview--main">${src ? `<img alt="" src="${esc(src)}" />` : ""}</div>
        <div class="dogma-field">
          <label>Małe tagi pod opisem</label>
          <textarea data-field="tags">${esc(tagsStr)}</textarea>
          <p class="dogma-field-hint">Jedna linia = jeden tag.</p>
        </div>

        <h4 class="dogma-section-title">3. Czy pokazywać na stronie?</h4>
        <div class="dogma-field dogma-field--inline">
          <label><input type="checkbox" data-field="visible" ${item.visible !== false ? "checked" : ""} /> Pokazuj na stronie</label>
        </div>
        <div class="dogma-field">
          <label>Kolejność na stronie</label>
          <input type="number" data-field="order" value="${Number(item.order) || 0}" />
          <p class="dogma-field-hint">Niższa liczba = pokaże się wcześniej.</p>
        </div>

        <details class="dogma-details dogma-details--tech">
          <summary>Ustawienia techniczne — tylko dla programisty</summary>
          <p class="dogma-field-hint">Plik po wgraniu — zwykle sam się tu pojawia.</p>
          <div class="dogma-field">
            <label>Adres pliku po wgraniu</label>
            <input type="text" data-field="src" value="${esc(src)}" />
          </div>
          <div class="dogma-field">
            <label>Wewnętrzny numer karty</label>
            <input type="text" readonly value="${esc(item.id)}" />
          </div>
        </details>

        <div class="dogma-card-preview-block">
          <h4 class="dogma-section-title">Podgląd karty</h4>
          <div class="dogma-preview-lang">
            <span>Język:</span>
            <button type="button" class="dogma-lang-pill active" data-preview-lang-btn="pl">PL</button>
            <button type="button" class="dogma-lang-pill" data-preview-lang-btn="ru">RU</button>
            <button type="button" class="dogma-lang-pill" data-preview-lang-btn="en">EN</button>
          </div>
          <p class="dogma-field-hint">Tak karta wygląda dla klienta.</p>
          <div class="dogma-card-preview-card">
            <div class="dogma-card-preview-media dogma-preview-box"></div>
            <strong data-card-preview-title></strong>
            <p data-card-preview-price></p>
            <p data-card-preview-desc></p>
            <button type="button" class="dogma-preview-fake-btn" data-card-preview-btn>Wybierz</button>
          </div>
        </div>

        </div>
      </div>`;
    })
    .join("");

  container.innerHTML = head + blocks;

  function updateLandingPreview(wrap, item) {
    const lang = wrap.dataset.previewLang || "pl";
    const t = cardTitleLine(item, lang);
    const d = pickLocAdmin(item.description, lang);
    const price = item.priceDisplay || "—";
    const btn = pickLocAdmin(item.buttonLabel, lang) || "Wybierz usługę";
    wrap.querySelector("[data-card-head-title]") && (wrap.querySelector("[data-card-head-title]").textContent = t);
    const badge = wrap.querySelector("[data-card-visibility-badge]");
    if (badge) {
      badge.textContent = item.visible !== false ? "Widoczna na stronie" : "Ukryta na stronie";
      badge.classList.toggle("dogma-badge--off", item.visible === false);
    }
    const ht = wrap.querySelector("[data-card-preview-title]");
    const hp = wrap.querySelector("[data-card-preview-price]");
    const hd = wrap.querySelector("[data-card-preview-desc]");
    const hb = wrap.querySelector("[data-card-preview-btn]");
    if (ht) ht.textContent = t;
    if (hp) hp.textContent = price;
    if (hd) hd.textContent = d;
    if (hb) hb.textContent = btn;
    const src = item.media?.src || "";
    const isVid = item.media?.type === "video";
    const mini = wrap.querySelector(".dogma-card-preview-media");
    const hero = wrap.querySelector(".dogma-card-hero__media");
    const mainPrev = wrap.querySelector(".dogma-preview--main");
    const mediaHtml = () => {
      if (!src) return "";
      if (isVid) {
        return `<video class="dogma-preview" src="${esc(src)}" muted loop playsinline controls></video>`;
      }
      return `<img alt="" src="${esc(src)}" />`;
    };
    const setBox = (box) => {
      if (!box) return;
      if (src) {
        box.innerHTML = mediaHtml();
      } else {
        box.innerHTML = `<span class="dogma-preview-placeholder">${esc(item.visualClass || "styl")}</span>`;
      }
    };
    setBox(mini);
    setBox(hero);
    if (mainPrev) {
      if (src) mainPrev.innerHTML = mediaHtml();
      else mainPrev.innerHTML = "";
    }
  }

  container.querySelector("[data-add-landing]")?.addEventListener("click", () => {
    const it = newLandingServiceItem();
    it.order = state.landingServices.length;
    state.landingServices.push(it);
    renderLandingServicesEditor(container);
    updateDirtyBanner();
    afterNewCardInList(container, listKey);
  });

  list.forEach((item, idx) => {
    const wrap = container.querySelector(`.dogma-item[data-index="${idx}"][data-list="${listKey}"]`);
    if (!wrap) return;

    wrap.querySelectorAll("[data-preview-lang-btn]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const L = btn.getAttribute("data-preview-lang-btn") || "pl";
        wrap.dataset.previewLang = L;
        wrap.querySelectorAll("[data-preview-lang-btn]").forEach((b) => b.classList.toggle("active", b === btn));
        updateLandingPreview(wrap, item);
      });
    });

    wrap.querySelector("[data-field=order]")?.addEventListener("input", (e) => {
      item.order = Number(e.target.value) || 0;
      updateDirtyBanner();
    });
    wrap.querySelector("[data-field=visible]")?.addEventListener("change", (e) => {
      item.visible = e.target.checked;
      updateLandingPreview(wrap, item);
      updateDirtyBanner();
    });
    wrap.querySelector("[data-field=priceDisplay]")?.addEventListener("input", (e) => {
      item.priceDisplay = e.target.value;
      updateLandingPreview(wrap, item);
      updateDirtyBanner();
    });
    wrap.querySelector("[data-field=visualClass]")?.addEventListener("change", (e) => {
      item.visualClass = e.target.value;
      updateLandingPreview(wrap, item);
      updateDirtyBanner();
    });
    wrap.querySelector("[data-field=bookingServiceId]")?.addEventListener("change", (e) => {
      item.bookingServiceId = e.target.value;
      updateDirtyBanner();
    });
    wrap.querySelector("[data-field=src]")?.addEventListener("input", (e) => {
      if (!item.media) item.media = { type: "image", src: "", alt: loc() };
      item.media.src = e.target.value;
      const low = item.media.src.toLowerCase();
      if (low.includes(".mp4") || low.includes(".webm") || low.includes(".mov")) item.media.type = "video";
      updateLandingPreview(wrap, item);
      updateDirtyBanner();
    });
    wrap.querySelector("[data-field=tags]")?.addEventListener("input", (e) => {
      item.tags = e.target.value
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      updateDirtyBanner();
    });

    bindLocalePath(wrap, item);
    bindPlCopyEmptyButtons(wrap, item, () => updateLandingPreview(wrap, item));
    wrap.querySelectorAll("[data-locale-path]").forEach((el) => {
      el.addEventListener("input", () => updateLandingPreview(wrap, item));
    });

    wrap.querySelector(`[data-del="${listKey}"][data-index="${idx}"]`)?.addEventListener("click", () => {
      if (!confirmDeleteCard()) return;
      state.landingServices.splice(idx, 1);
      renderLandingServicesEditor(container);
      updateDirtyBanner();
    });
    wrap.querySelector(`[data-move="${listKey}"][data-index="${idx}"][data-dir="-1"]`)?.addEventListener("click", () => {
      if (idx <= 0) return;
      [state.landingServices[idx - 1], state.landingServices[idx]] = [
        state.landingServices[idx],
        state.landingServices[idx - 1]
      ];
      renderLandingServicesEditor(container);
      updateDirtyBanner();
    });
    wrap.querySelector(`[data-move="${listKey}"][data-index="${idx}"][data-dir="1"]`)?.addEventListener("click", () => {
      if (idx >= state.landingServices.length - 1) return;
      [state.landingServices[idx + 1], state.landingServices[idx]] = [
        state.landingServices[idx],
        state.landingServices[idx + 1]
      ];
      renderLandingServicesEditor(container);
      updateDirtyBanner();
    });

    wrap.querySelector(`[data-upload="${listKey}"][data-index="${idx}"]`)?.addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        const path = await uploadFile(file);
        if (!item.media) item.media = { type: "image", src: "", alt: loc() };
        item.media.src = path;
        const low = file.name.toLowerCase();
        if (low.endsWith(".mp4") || low.endsWith(".webm") || low.endsWith(".mov")) item.media.type = "video";
        else item.media.type = "image";
        const inp = wrap.querySelector("[data-field=src]");
        if (inp) inp.value = path;
        updateLandingPreview(wrap, item);
        showSave("Wgrano plik", "ok");
        updateDirtyBanner();
      } catch (err) {
        showSave(err.message || "Nie udało się wgrać pliku.", "err");
      }
      e.target.value = "";
    });

    updateLandingPreview(wrap, item);
  });
}

function ensureBookingServiceLocales(svc) {
  if (!svc || typeof svc !== "object") return;
  if (typeof svc.name === "string") {
    const t = svc.name;
    svc.name = { pl: t, ru: "", en: "" };
  } else {
    ensureLocaleRef(svc, "name");
  }
  if (typeof svc.description === "string") {
    const t = svc.description;
    svc.description = { pl: t, ru: "", en: "" };
  } else {
    ensureLocaleRef(svc, "description");
  }
  if (!svc.promoDiscount || typeof svc.promoDiscount !== "object") {
    svc.promoDiscount = {
      enabled: false,
      usePercent: true,
      percent: 10,
      priceAfter: "",
      weekdays: [1, 2, 3, 4],
      startMinutes: 600,
      endMinutes: 960
    };
  } else {
    if (!Array.isArray(svc.promoDiscount.weekdays)) svc.promoDiscount.weekdays = [1, 2, 3, 4];
    if (svc.promoDiscount.usePercent === undefined) svc.promoDiscount.usePercent = true;
  }
}

function buildBookingServiceCardHtml(svc, svcIdx, cfg) {
  ensureBookingServiceLocales(svc);
  const barberIds = Array.isArray(svc.availableBarberIds) ? svc.availableBarberIds : [];
  const catOptions = (cfg.serviceCategories || [])
    .map((c) => {
      const label = pickLocAdmin(c.title, "pl") || c.id;
      return `<option value="${esc(c.id)}" ${svc.category === c.id ? "selected" : ""}>${esc(label)}</option>`;
    })
    .join("");
  const bChecks = (cfg.barbers || [])
    .map((b) => {
      const on = barberIds.length === 0 || barberIds.includes(b.id);
      return `<label class="dogma-check"><input type="checkbox" data-svc-barber="${esc(
        b.id
      )}" ${on ? "checked" : ""} /><span>${esc(b.name || b.id)}</span></label>`;
    })
    .join("");
  const p = svc.promoDiscount;
  const discDayShort = { 1: "Pon", 2: "Wt", 3: "Śr", 4: "Czw", 5: "Pt", 6: "Sob", 0: "Nd" };
  const promoDays = [1, 2, 3, 4, 5, 6, 0]
    .map((d) => {
      const on = Array.isArray(p.weekdays) && p.weekdays.includes(d) ? "checked" : "";
      return `<label class="dogma-check"><input type="checkbox" data-svc-promo-day="${d}" ${on} /><span>${discDayShort[d]}</span></label>`;
    })
    .join("");
  const modePercent = p.usePercent !== false;
  const pctVal = Number(p.percent) || 10;
  const priceAfterVal = p.priceAfter === "" || p.priceAfter == null ? "" : String(p.priceAfter);
  return `
      <div class="dogma-subcard dogma-subcard--booking-svc" data-b-svc="${svcIdx}">
        <h5 class="dogma-booking-svc-title">${esc(servicePlName(svc) || "Usługa")}</h5>
        ${fieldLocaleBlock(svc, "name", "bookingSvcName")}
        ${fieldLocaleBlock(svc, "description", "bookingSvcDesc")}
        <div class="dogma-field"><label>Cena normalna (zł)</label><input type="number" data-svc-price value="${Number(svc.basePrice) || 0}" min="0" step="1" /></div>
        <div class="dogma-field"><label>Cena po zniżce na stałe (zł) — opcjonalnie</label><input type="number" data-svc-disc step="0.01" value="${svc.discountedPrice === "" || svc.discountedPrice == null ? "" : esc(String(svc.discountedPrice))}" /></div>
        <p class="dogma-field-hint">Niższa cena obok głównej — jako „albo po promocji”, gdy wpiszesz kwotę.</p>
        <div class="dogma-field"><label>Czas na karcie (np. 1 h)</label><input type="text" data-svc-dur value="${esc(svc.duration || "")}" placeholder="1 h" /></div>
        <div class="dogma-field"><label>Czas trwania w minutach</label><div class="dogma-inline-num"><input type="number" data-svc-min value="${Number(svc.durationMinutes) || 0}" min="1" /><span>min</span></div></div>
        <div class="dogma-field"><label>Kategoria (w której pokazać usługę)</label><select data-svc-cat>${catOptions}</select></div>
        <div class="dogma-field dogma-field--inline"><label><input type="checkbox" data-svc-vis ${svc.visible !== false ? "checked" : ""} /> Pokazuj w rezerwacji</label></div>
        <div class="dogma-field dogma-field--inline"><label><input type="checkbox" data-svc-any ${svc.allowClientBarberChoice !== false ? "checked" : ""} /> Klient może wybrać barbera z listy</label></div>
        <p class="dogma-field-hint">Kto może wykonać tę usługę?</p>
        <div class="dogma-check-grid" data-svc-barbers>${bChecks}</div>

        <div class="dogma-promo-service-box dogma-subcard dogma-subcard--inner">
          <h6 class="dogma-mini-title">Zniżka czasowa tylko dla tej usługi</h6>
          <p class="dogma-field-hint dogma-field-hint--tight">Opcjonalnie — według dni i godzin.</p>
          <div class="dogma-field dogma-field--inline"><label><input type="checkbox" data-svc-promo-enabled ${p.enabled ? "checked" : ""} /> Włączyć zniżkę dla tej usługi</label></div>
          <div class="dogma-field dogma-field--inline">
            <label><input type="radio" name="svc-promo-${svcIdx}" value="percent" data-svc-promo-mode ${modePercent ? "checked" : ""} /> Procent zniżki</label>
            <label><input type="radio" name="svc-promo-${svcIdx}" value="price" data-svc-promo-mode ${!modePercent ? "checked" : ""} /> Cena po zniżce</label>
          </div>
          <div class="dogma-field"><label>Ile procent taniej?</label><input type="number" data-svc-promo-pct value="${pctVal}" min="0" max="100" /></div>
          <div class="dogma-field"><label>Cena po zniżce (zł)</label><input type="number" data-svc-promo-price step="0.01" value="${esc(priceAfterVal)}" /></div>
          <div class="dogma-field">
            <span class="dogma-faux-label">Dni zniżki</span>
            <div class="dogma-disc-days">${promoDays}</div>
          </div>
          <div class="dogma-field"><label>Godziny zniżki od</label><input type="time" data-svc-promo-start value="${esc(minutesToTime(typeof p.startMinutes === "number" ? p.startMinutes : 600))}" /></div>
          <div class="dogma-field"><label>Godziny zniżki do</label><input type="time" data-svc-promo-end value="${esc(minutesToTime(typeof p.endMinutes === "number" ? p.endMinutes : 960))}" /></div>
        </div>

        <details class="dogma-details dogma-details--tech">
          <summary>Ustawienia techniczne — tylko dla programisty</summary>
          <p class="dogma-field-hint">Wewnętrzny zapis w systemie.</p>
          <div class="dogma-field"><label>Wewnętrzny identyfikator</label><input type="text" readonly value="${esc(svc.id)}" /></div>
        </details>
        <div class="dogma-field dogma-field--tight">
          <button type="button" class="dogma-btn dogma-btn--danger dogma-btn--block-sm" data-svc-del="${svcIdx}">Usuń usługę z rezerwacji</button>
        </div>
      </div>`;
}

function renderBookingEditor(container) {
  if (state.bookingConfig == null) {
    state.bookingConfig = deepClone(getDefaultBookingConfig());
  }
  syncBookingBarbersIntoConfig(state);
  const cfg = state.bookingConfig;
  (cfg.services || []).forEach((s) => ensureBookingServiceLocales(s));

  const dayRows = [
    { k: "1", label: "Poniedziałek" },
    { k: "2", label: "Wtorek" },
    { k: "3", label: "Środa" },
    { k: "4", label: "Czwartek" },
    { k: "5", label: "Piątek" },
    { k: "6", label: "Sobota" },
    { k: "0", label: "Niedziela" }
  ]
    .map((d) => {
      const row = cfg.openingHours?.[d.k] || { closed: false, openHour: 10, closeHour: 20 };
      const salonOpen = !row.closed;
      return `
      <div class="dogma-hours-row" data-day="${esc(d.k)}">
        <strong class="dogma-hours-day">${esc(d.label)}</strong>
        <label class="dogma-check"><input type="checkbox" data-oh-open ${salonOpen ? "checked" : ""} /> Salon otwarty</label>
        <div class="dogma-hours-hours">
          <label>Od <input type="number" data-oh-start min="0" max="23" value="${Number(row.openHour) || 10}" /></label>
          <label>Do <input type="number" data-oh-end min="0" max="23" value="${Number(row.closeHour) || 20}" /></label>
        </div>
      </div>`;
    })
    .join("");

  const catBlocksNested = (cfg.serviceCategories || [])
    .map((cat, idx) => ({ cat, idx }))
    .sort((a, b) => (Number(a.cat.order) || 0) - (Number(b.cat.order) || 0))
    .map(({ cat, idx }) => {
      ensureLocaleRef(cat, "title");
      ensureLocaleRef(cat, "description");
      const svcInner = (cfg.services || [])
        .map((svc, svcIdx) => ({ svc, svcIdx }))
        .filter((x) => x.svc.category === cat.id)
        .map((x) => buildBookingServiceCardHtml(x.svc, x.svcIdx, cfg))
        .join("");
      return `
      <div class="dogma-booking-cat-block dogma-subcard" data-b-cat="${idx}">
        <h4 class="dogma-booking-cat-heading">Kategoria: ${esc(pickLocAdmin(cat.title, "pl") || "—")}</h4>
        ${fieldLocaleBlock(cat, "title", "catTitle")}
        ${fieldLocaleBlock(cat, "description", "catDesc")}
        <div class="dogma-field dogma-field--inline">
          <label><input type="checkbox" data-cat-visible ${cat.visible !== false ? "checked" : ""} /> Pokazuj w rezerwacji</label>
        </div>
        <div class="dogma-field">
          <label>Kolejność na stronie</label>
          <input type="number" data-cat-order value="${Number(cat.order) || idx}" />
          <p class="dogma-field-hint">Niższa liczba = wyżej na liście.</p>
        </div>
        <details class="dogma-details dogma-details--tech"><summary>Ustawienia techniczne — tylko dla programisty</summary>
          <p class="dogma-field-hint">Wewnętrzny zapis kategorii.</p>
          <div class="dogma-field"><label>Wewnętrzny identyfikator</label><input type="text" readonly value="${esc(cat.id)}" /></div>
        </details>
        <div class="dogma-field dogma-field--tight">
          <button type="button" class="dogma-btn dogma-btn--danger dogma-btn--block-sm" data-cat-del="${idx}">Usuń kategorię z rezerwacji</button>
        </div>
        <div class="dogma-booking-cat-services">
          <h5 class="dogma-panel-subtitle dogma-panel-subtitle--nest">Usługi w tej kategorii</h5>
          <div class="dogma-stack dogma-stack--nest">${svcInner || `<p class="dogma-hint">Brak usług — dodaj nową poniżej lub przenieś tu istniejącą zmianą kategorii.</p>`}</div>
        </div>
      </div>`;
    })
    .join("");

  const disc = cfg.discount || {};
  const discDayShort = { 1: "Pon", 2: "Wt", 3: "Śr", 4: "Czw", 5: "Pt", 6: "Sob", 0: "Nd" };
  const weekdayChecks = [1, 2, 3, 4, 5, 6, 0]
    .map((d) => {
      const on = Array.isArray(disc.weekdays) && disc.weekdays.includes(d) ? "checked" : "";
      return `<label class="dogma-check"><input type="checkbox" data-disc-day="${d}" ${on} /><span>${discDayShort[d]}</span></label>`;
    })
    .join("");

  container.innerHTML = `
    <div class="dogma-item dogma-subcard dogma-booking-intro">
      <p class="dogma-hint">Tu ustawiasz usługi w kreatorze rezerwacji, godziny pracy i zniżki. Zapis: „Zapisz zmiany” na górze.</p>
      <div class="dogma-booking-actions">
        <button type="button" class="dogma-btn dogma-btn--ghost dogma-btn--block-sm" id="bookingResetDefaults">Przywróć ustawienia jak na początku</button>
        <button type="button" class="dogma-btn dogma-btn--primary dogma-btn--block-sm" id="bookingAddCategory">+ Dodaj kategorię usług</button>
        <button type="button" class="dogma-btn dogma-btn--primary dogma-btn--block-sm" id="bookingAddService">+ Dodaj usługę do rezerwacji</button>
      </div>
    </div>

    <h3 class="dogma-panel-subtitle">Godziny pracy salonu</h3>
    <p class="dogma-field-hint">Na podstawie tych godzin pokazujemy wolne terminy.</p>
    <div class="dogma-item dogma-hours">${dayRows}</div>

    <h3 class="dogma-panel-subtitle">Zniżka ogólna (dla wielu usług naraz)</h3>
    <div class="dogma-item dogma-subcard">
      <div class="dogma-field dogma-field--inline"><label><input type="checkbox" id="disc-enabled" ${disc.enabled !== false ? "checked" : ""} /> Włączyć ogólną zniżkę?</label></div>
      <div class="dogma-field"><label>Nazwa dla Ciebie (nie musi być na stronie)</label><input type="text" id="disc-name" value="${esc(disc.name || "")}" /></div>
      <div class="dogma-field"><label>Krótki tekst dla klienta</label><textarea id="disc-msg">${esc(disc.clientMessage || "")}</textarea></div>
      <div class="dogma-field"><label>Ile procent zniżki?</label><input type="number" id="disc-pct" value="${Number(disc.percent) || 10}" min="0" max="100" /></div>
      <p class="dogma-field-hint">Przykład: poniedziałek–czwartek, 10:00–16:00.</p>
      <div class="dogma-field">
        <span class="dogma-faux-label">W jakie dni działa zniżka?</span>
        <div class="dogma-disc-days">${weekdayChecks}</div>
      </div>
      <div class="dogma-field"><label>Od której godziny?</label><input type="time" id="disc-start-time" value="${esc(minutesToTime(disc.startMinutes != null ? disc.startMinutes : 600))}" /></div>
      <div class="dogma-field"><label>Do której godziny?</label><input type="time" id="disc-end-time" value="${esc(minutesToTime(disc.endMinutes != null ? disc.endMinutes : 960))}" /></div>
    </div>

    <h3 class="dogma-panel-subtitle">Kategorie i usługi w rezerwacji</h3>
    <p class="dogma-field-hint dogma-field-hint--tight">Kategoria to „folder” — w środku widać tylko usługi z niej.</p>
    <div class="dogma-stack">${catBlocksNested}</div>
  `;

  function syncDiscountFromForm() {
    const weekdays = [...container.querySelectorAll("[data-disc-day]")]
      .filter((cb) => cb.checked)
      .map((cb) => Number(cb.getAttribute("data-disc-day")));
    cfg.discount = {
      enabled: !!container.querySelector("#disc-enabled")?.checked,
      name: container.querySelector("#disc-name")?.value || "",
      clientMessage: container.querySelector("#disc-msg")?.value || "",
      percent: Number(container.querySelector("#disc-pct")?.value) || 0,
      weekdays: weekdays.length ? weekdays : [1, 2, 3, 4],
      startMinutes: timeToMinutes(container.querySelector("#disc-start-time")?.value || "10:00"),
      endMinutes: timeToMinutes(container.querySelector("#disc-end-time")?.value || "16:00")
    };
  }

  function syncHoursFromForm() {
    if (!cfg.openingHours) cfg.openingHours = {};
    container.querySelectorAll(".dogma-hours-row").forEach((row) => {
      const k = row.getAttribute("data-day");
      if (!k) return;
      const open = row.querySelector("[data-oh-open]")?.checked;
      const openHour = Number(row.querySelector("[data-oh-start]")?.value) || 10;
      const closeHour = Number(row.querySelector("[data-oh-end]")?.value) || 20;
      cfg.openingHours[k] = { closed: !open, openHour, closeHour };
    });
  }

  function syncSvcPromoFromEl(el, svc) {
    if (!el || !svc) return;
    ensureBookingServiceLocales(svc);
    const p = svc.promoDiscount;
    p.enabled = !!el.querySelector("[data-svc-promo-enabled]")?.checked;
    const modeEl = el.querySelector("[data-svc-promo-mode]:checked");
    p.usePercent = !modeEl || modeEl.value !== "price";
    p.percent = Number(el.querySelector("[data-svc-promo-pct]")?.value) || 0;
    const pv = el.querySelector("[data-svc-promo-price]")?.value.trim();
    p.priceAfter = pv === "" ? "" : Number(pv);
    const days = [...el.querySelectorAll("[data-svc-promo-day]")]
      .filter((cb) => cb.checked)
      .map((cb) => Number(cb.getAttribute("data-svc-promo-day")));
    p.weekdays = days.length ? days : [1, 2, 3, 4];
    p.startMinutes = timeToMinutes(el.querySelector("[data-svc-promo-start]")?.value || "10:00");
    p.endMinutes = timeToMinutes(el.querySelector("[data-svc-promo-end]")?.value || "16:00");
  }

  function bindBookingForm() {
    syncDiscountFromForm();
    syncHoursFromForm();

    container.querySelectorAll("[data-b-cat]").forEach((el) => {
      const idx = Number(el.getAttribute("data-b-cat"));
      const cat = cfg.serviceCategories[idx];
      if (!cat) return;
      el.querySelector("[data-cat-visible]")?.addEventListener("change", (e) => {
        cat.visible = e.target.checked;
        updateDirtyBanner();
      });
      el.querySelector("[data-cat-order]")?.addEventListener("input", (e) => {
        cat.order = Number(e.target.value) || 0;
        updateDirtyBanner();
      });
      bindLocalePath(el, cat);
      bindPlCopyEmptyButtons(el, cat, () => {
        const h = el.querySelector(".dogma-booking-cat-heading");
        if (h) h.textContent = `Kategoria: ${pickLocAdmin(cat.title, "pl") || "—"}`;
      });
      el.querySelectorAll('[data-locale-path="title"]').forEach((inp) => {
        inp.addEventListener("input", () => {
          const h = el.querySelector(".dogma-booking-cat-heading");
          if (h) h.textContent = `Kategoria: ${pickLocAdmin(cat.title, "pl") || "—"}`;
        });
      });
      el.querySelector("[data-cat-del]")?.addEventListener("click", () => {
        if (!cfg.serviceCategories[idx]) return;
        const hasServices = (cfg.services || []).some((s) => s && s.category === cat.id);
        if (hasServices) {
          window.alert(
            "Nie można usunąć kategorii, ponieważ ma przypisane usługi. Najpierw przenieś albo usuń usługi w tej kategorii."
          );
          return;
        }
        if (!window.confirm("Usunąć tę kategorię z rezerwacji?")) return;
        cfg.serviceCategories.splice(idx, 1);
        renderBookingEditor(container);
        updateDirtyBanner();
      });
    });

    container.querySelectorAll("[data-b-svc]").forEach((el) => {
      const idx = Number(el.getAttribute("data-b-svc"));
      const svc = cfg.services[idx];
      if (!svc) return;
      bindLocalePath(el, svc);
      bindPlCopyEmptyButtons(el, svc, () => {
        const h = el.querySelector(".dogma-booking-svc-title");
        if (h) h.textContent = servicePlName(svc) || "Usługa";
      });
      el.querySelectorAll('[data-locale-path="name"]').forEach((inp) => {
        inp.addEventListener("input", () => {
          const h = el.querySelector(".dogma-booking-svc-title");
          if (h) h.textContent = servicePlName(svc) || "Usługa";
        });
      });
      el.querySelector("[data-svc-cat]")?.addEventListener("change", (e) => {
        svc.category = e.target.value;
        renderBookingEditor(container);
        updateDirtyBanner();
      });
      el.querySelector("[data-svc-price]")?.addEventListener("input", (e) => {
        svc.basePrice = Number(e.target.value) || 0;
        updateDirtyBanner();
      });
      el.querySelector("[data-svc-disc]")?.addEventListener("input", (e) => {
        const v = e.target.value.trim();
        svc.discountedPrice = v === "" ? "" : Number(v);
        updateDirtyBanner();
      });
      el.querySelector("[data-svc-dur]")?.addEventListener("input", (e) => {
        svc.duration = e.target.value;
        updateDirtyBanner();
      });
      el.querySelector("[data-svc-min]")?.addEventListener("input", (e) => {
        svc.durationMinutes = Number(e.target.value) || 0;
        updateDirtyBanner();
      });
      el.querySelector("[data-svc-vis]")?.addEventListener("change", (e) => {
        svc.visible = e.target.checked;
        updateDirtyBanner();
      });
      el.querySelector("[data-svc-any]")?.addEventListener("change", (e) => {
        svc.allowClientBarberChoice = e.target.checked;
        updateDirtyBanner();
      });
      el.querySelectorAll("[data-svc-barber]").forEach((cb) => {
        cb.addEventListener("change", () => {
          const allIds = (cfg.barbers || []).map((b) => b.id);
          const selected = [...el.querySelectorAll("[data-svc-barber]")]
            .filter((c) => c.checked)
            .map((c) => c.getAttribute("data-svc-barber"));
          svc.availableBarberIds = selected.length === allIds.length ? [] : selected;
          updateDirtyBanner();
        });
      });
      const promoRefresh = () => {
        syncSvcPromoFromEl(el, svc);
        updateDirtyBanner();
      };
      el.querySelector("[data-svc-promo-enabled]")?.addEventListener("change", promoRefresh);
      el.querySelectorAll("[data-svc-promo-mode]").forEach((r) => r.addEventListener("change", promoRefresh));
      el.querySelector("[data-svc-promo-pct]")?.addEventListener("input", promoRefresh);
      el.querySelector("[data-svc-promo-price]")?.addEventListener("input", promoRefresh);
      el.querySelectorAll("[data-svc-promo-day]").forEach((c) => c.addEventListener("change", promoRefresh));
      el.querySelector("[data-svc-promo-start]")?.addEventListener("change", promoRefresh);
      el.querySelector("[data-svc-promo-end]")?.addEventListener("change", promoRefresh);
    });

    container.querySelectorAll("[data-svc-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-svc-del"));
        if (!Number.isFinite(idx)) return;
        if (!confirm("Usunąć tę usługę z kreatora rezerwacji?")) return;
        const svc = cfg.services[idx];
        if (!svc) return;
        cfg.services.splice(idx, 1);
        renderBookingEditor(container);
        updateDirtyBanner();
      });
    });

    ["#disc-enabled", "#disc-name", "#disc-msg", "#disc-pct", "#disc-start-time", "#disc-end-time"].forEach((sel) => {
      container.querySelector(sel)?.addEventListener("input", () => {
        syncDiscountFromForm();
        updateDirtyBanner();
      });
      container.querySelector(sel)?.addEventListener("change", () => {
        syncDiscountFromForm();
        updateDirtyBanner();
      });
    });
    container.querySelectorAll("[data-disc-day]").forEach((cb) => {
      cb.addEventListener("change", () => {
        syncDiscountFromForm();
        updateDirtyBanner();
      });
    });

    container.querySelectorAll(".dogma-hours-row input").forEach((inp) => {
      inp.addEventListener("change", () => {
        syncHoursFromForm();
        updateDirtyBanner();
      });
      inp.addEventListener("input", () => {
        syncHoursFromForm();
        updateDirtyBanner();
      });
    });
  }

  container.querySelector("#bookingResetDefaults")?.addEventListener("click", () => {
    state.bookingConfig = deepClone(getDefaultBookingConfig());
    renderBookingEditor(container);
    updateDirtyBanner();
  });

  container.querySelector("#bookingAddCategory")?.addEventListener("click", () => {
    if (state.bookingConfig == null) {
      state.bookingConfig = deepClone(getDefaultBookingConfig());
    }
    const id = `kategoria-${Date.now()}`;
    cfg.serviceCategories.push({
      id,
      title: { pl: "Nowa kategoria", ru: "", en: "" },
      description: { pl: "", ru: "", en: "" },
      visible: true,
      order: cfg.serviceCategories.length + 1
    });
    const newIdx = cfg.serviceCategories.length - 1;
    renderBookingEditor(container);
    updateDirtyBanner();
    requestAnimationFrame(() => {
      const el = container.querySelector(`[data-b-cat="${newIdx}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.classList.add("dogma-card--flash");
      window.setTimeout(() => el?.classList.remove("dogma-card--flash"), 1600);
      el?.querySelector('[data-locale-path="title"][data-lang="pl"]')?.focus({ preventScroll: true });
    });
  });

  container.querySelector("#bookingAddService")?.addEventListener("click", () => {
    if (state.bookingConfig == null) {
      state.bookingConfig = deepClone(getDefaultBookingConfig());
    }
    const id = `svc-${Date.now()}`;
    cfg.services.push({
      id,
      category: (cfg.serviceCategories[0] && cfg.serviceCategories[0].id) || "popular",
      name: { pl: "Nowa usługa", ru: "", en: "" },
      description: { pl: "", ru: "", en: "" },
      basePrice: 100,
      discountedPrice: "",
      duration: "1h",
      durationMinutes: 60,
      visible: true,
      bookingEnabled: true,
      availableBarberIds: [],
      allowClientBarberChoice: true
    });
    ensureBookingServiceLocales(cfg.services[cfg.services.length - 1]);
    const newSvcIdx = cfg.services.length - 1;
    renderBookingEditor(container);
    updateDirtyBanner();
    requestAnimationFrame(() => {
      const el = container.querySelector(`[data-b-svc="${newSvcIdx}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.classList.add("dogma-card--flash");
      window.setTimeout(() => el?.classList.remove("dogma-card--flash"), 1600);
      el?.querySelector('[data-locale-path="name"][data-lang="pl"]')?.focus({ preventScroll: true });
    });
  });

  bindBookingForm();
}

function renderContactsEditor(container) {
  const c = state.contacts;
  const s = state.socials;
  ensureLocaleRef(c, "address");
  if (c.phoneDisplay === undefined) c.phoneDisplay = "";
  container.innerHTML = `
    <div class="dogma-item dogma-subcard" id="contacts-block-kontakt">
      <h3 class="dogma-mini-title">Zmień telefon, adres i linki</h3>
      <p class="dogma-hint">Te informacje widzą klienci na stronie i w stopce.</p>
      <div class="dogma-field">
        <label>Telefon (jak ma być widoczny)</label>
        <input type="text" id="c-phone-display" value="${esc(c.phoneDisplay || "")}" placeholder="+48 532 377 701" />
      </div>
      <h4 class="dogma-section-title">Adres salonu</h4>
      ${fieldLocaleBlock(c, "address", "address")}
      <div class="dogma-field">
        <label>Link do mapy (Google)</label>
        <input type="text" id="c-maps" value="${esc(c.mapsUrl || "")}" />
      </div>
      <div class="dogma-field">
        <label>Link do opinii Google</label>
        <input type="text" id="c-google-reviews" value="${esc(c.googleReviewsUrl || "")}" placeholder="https://www.google.com/..." />
        <p class="dogma-field-hint">Ten link otworzy opinie salonu w Google.</p>
      </div>
      <div class="dogma-field">
        <label>Godziny otwarcia (jedna linia na stronie)</label>
        <input type="text" id="c-hours-display" value="${esc(c.hoursDisplay || "")}" placeholder="Pn–Pt 10–20, Sob 10–18" />
      </div>
      <details class="dogma-details dogma-details--tech">
        <summary>Dodatkowe ustawienia — nie musisz tego ruszać</summary>
        <p class="dogma-field-hint">Numer do kliknięcia „zadzwoń” — bez spacji.</p>
        <div class="dogma-field">
          <label>Telefon do połączenia</label>
          <input type="text" id="c-phone" value="${esc(c.phoneE164 || c.phone || "")}" placeholder="+48532377701" />
        </div>
        <div class="dogma-field">
          <label>Mapa osadzona (iframe — opcjonalnie)</label>
          <input type="text" id="c-embed" value="${esc(c.mapEmbedUrl || "")}" />
        </div>
        <div class="dogma-field">
          <label>Obrazek mapy (ścieżka pliku)</label>
          <input type="text" id="c-map-image" value="${esc(c.mapImage || "")}" placeholder="/assets/ui/map.jpg" />
          <p class="dogma-field-hint">Jeśli ustawisz plik (np. <code>/assets/ui/map.jpg</code>), strona pokaże go zamiast iframe.</p>
        </div>
      </details>
    </div>
    <div class="dogma-item dogma-subcard">
      <h3 class="dogma-mini-title">Social media</h3>
      <div class="dogma-field">
        <label>Link rezerwacji (opcjonalnie)</label>
        <input type="text" id="s-booksy" value="${esc(s.booksy || "")}" placeholder="https://..." />
      </div>
      <div class="dogma-field">
        <label>Instagram</label>
        <input type="text" id="s-ig" value="${esc(s.instagram || "")}" />
      </div>
      <div class="dogma-field">
        <label>TikTok</label>
        <input type="text" id="s-tik" value="${esc(s.tiktok || "")}" />
      </div>
    </div>
  `;

  bindLocalePath(container.querySelector("#contacts-block-kontakt"), c);

  container.querySelector("#c-phone-display")?.addEventListener("input", (e) => {
    c.phoneDisplay = e.target.value;
    updateDirtyBanner();
  });
  container.querySelector("#c-phone")?.addEventListener("input", (e) => {
    c.phoneE164 = e.target.value.trim();
    updateDirtyBanner();
  });
  container.querySelector("#c-maps")?.addEventListener("input", (e) => {
    c.mapsUrl = e.target.value.trim();
    updateDirtyBanner();
  });
  container.querySelector("#c-google-reviews")?.addEventListener("input", (e) => {
    c.googleReviewsUrl = e.target.value.trim();
    updateDirtyBanner();
  });
  container.querySelector("#c-hours-display")?.addEventListener("input", (e) => {
    c.hoursDisplay = e.target.value;
    updateDirtyBanner();
  });
  container.querySelector("#c-embed")?.addEventListener("input", (e) => {
    c.mapEmbedUrl = e.target.value.trim();
    updateDirtyBanner();
  });
  container.querySelector("#c-map-image")?.addEventListener("input", (e) => {
    c.mapImage = e.target.value.trim();
    updateDirtyBanner();
  });
  container.querySelector("#s-booksy")?.addEventListener("input", (e) => {
    s.booksy = e.target.value.trim();
    updateDirtyBanner();
  });
  container.querySelector("#s-ig")?.addEventListener("input", (e) => {
    s.instagram = e.target.value.trim();
    updateDirtyBanner();
  });
  container.querySelector("#s-tik")?.addEventListener("input", (e) => {
    s.tiktok = e.target.value.trim();
    updateDirtyBanner();
  });
}

function renderAllPanels() {
  renderGalleryEditor(document.getElementById("panel-works"), "worksGallery", {
    allowVideoToggle: true,
    addButtonLabel: "+ Dodaj pracę",
    headHint: "Zdjęcia i filmy w galerii na stronie (desktop „sticker wall” i mobile)."
  });
  renderBarbersEditor(document.getElementById("panel-barbers"));
  renderLandingServicesEditor(document.getElementById("panel-services"));
  const bp = document.getElementById("panel-booking");
  if (bp) {
    bp.innerHTML = "";
    delete bp.dataset.ready;
  }
  renderContactsEditor(document.getElementById("panel-contacts"));
}

function setActiveTab(id) {
  document.querySelectorAll(".dogma-tab").forEach((b) => b.classList.toggle("active", b.dataset.tab === id));
  document.querySelectorAll(".dogma-panel").forEach((p) => p.classList.toggle("active", p.dataset.panel === id));

  if (id === "booking") {
    const el = document.getElementById("panel-booking");
    if (el && el.dataset.ready !== "1") {
      el.dataset.ready = "1";
      renderBookingEditor(el);
    }
  }
  if (id === "services") {
    const el = document.getElementById("panel-services");
    if (el) renderLandingServicesEditor(el);
  }
}

function buildTabs() {
  const nav = document.getElementById("tabNav");
  nav.innerHTML = TABS.map(
    (t) => `<button type="button" class="dogma-tab${t.id === "works" ? " active" : ""}" data-tab="${t.id}">${t.label}</button>`
  ).join("");
  nav.querySelectorAll(".dogma-tab").forEach((btn) => {
    btn.addEventListener("click", () => setActiveTab(btn.dataset.tab));
  });
}

async function apiLoad() {
  const res = await fetch("/api/admin/content", { headers: authHeaders() });
  if (res.status === 401) {
    setToken("");
    throw new Error("Sesja wygasła");
  }
  if (!res.ok) throw new Error("Nie udało się wczytać treści");
  const data = await res.json();
  state = normalizeState(data);
}

async function apiSave() {
  const res = await fetch("/api/admin/content", {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(state)
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    setToken("");
    throw new Error("Sesja wygasła — zaloguj ponownie");
  }
  if (!res.ok) throw new Error(data.error || "Zapis nieudany");
}

function redirectToStorefront() {
  window.location.replace("/");
}

function showApp(show) {
  const app = document.getElementById("appView");
  if (app) app.classList.toggle("hidden", !show);
}

async function tryBoot() {
  if (!getToken()) {
    redirectToStorefront();
    return;
  }
  try {
    await apiLoad();
    lastSavedFingerprint = fingerprintState();
    showApp(true);
    buildTabs();
    setActiveTab("works");
    renderAllPanels();
    bindCardExpandDelegation();
    bindDirtyTracking();
    updateDirtyBanner();
    showSave("Wczytano", "ok");
  } catch {
    setToken("");
    redirectToStorefront();
  }
}

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  setToken("");
  redirectToStorefront();
});

async function doSave() {
  showSave("Zapisywanie…", "");
  syncBookingBarbersIntoConfig(state);
  try {
    await apiSave();
    lastSavedFingerprint = fingerprintState();
    updateDirtyBanner();
    showSave("Zapisano", "ok");
  } catch (e) {
    const msg = e && e.message ? String(e.message) : "";
    if (msg.includes("Sesja wygasła") || msg.includes("zaloguj")) {
      setToken("");
      redirectToStorefront();
      return;
    }
    showSave(e.message || "Nie udało się zapisać. Sprawdź serwer albo internet.", "err");
  }
}

document.getElementById("saveBtn")?.addEventListener("click", doSave);
document.getElementById("saveBtnSticky")?.addEventListener("click", doSave);

tryBoot();
