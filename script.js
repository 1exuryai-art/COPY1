const API_BASE = "";
const TOTAL_STEPS = 8;

function getDogmaLang() {
  try {
    const monarch = localStorage.getItem("monarch_lang");
    if (monarch === "en") return "en";
    if (monarch === "ru") return "ru";
    const legacy = localStorage.getItem("dogma_lang");
    if (legacy === "en") return "en";
    if (legacy === "ua") return "ru";
    return "pl";
  } catch {
    return "pl";
  }
}

function tBook(key, vars) {
  const lang = getDogmaLang();
  const root = window.DOGMA_TRANSLATIONS;
  if (!root) return key;
  const dict = root[lang] || root.pl || {};
  let s = dict[key] || root.pl[key] || key;
  if (vars && typeof vars === "object") {
    Object.keys(vars).forEach((k) => {
      s = s.split(`{${k}}`).join(String(vars[k]));
    });
  }
  return s;
}

function pickBookingLoc(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  const lang = getDogmaLang();
  return value[lang] || value.pl || value.ru || value.ua || value.en || "";
}

function getServiceDisplayName(service) {
  if (!service) return "—";
  if (service.name && typeof service.name === "object") {
    const direct = pickBookingLoc(service.name);
    if (direct) return direct;
  }
  const k = `booking.svc.${service.id}`;
  const tr = tBook(k);
  if (typeof service.name === "string") {
    return tr === k ? service.name : tr;
  }
  return tr === k ? "—" : tr;
}

function getServiceDescriptionText(service) {
  if (!service) return "";
  const d = service.description;
  if (d && typeof d === "object") return pickBookingLoc(d);
  if (typeof d === "string") return d;
  return "";
}

function isServicePromoWindow(service, dateStr, timeStr) {
  if (!service || !dateStr || !timeStr) return false;
  const p = service.promoDiscount;
  if (!p || !p.enabled) return false;
  const day = getWeekday(dateStr);
  const weekdays = Array.isArray(p.weekdays) && p.weekdays.length ? p.weekdays : [];
  if (!weekdays.includes(day)) return false;
  const minutes = timeToMinutes(timeStr);
  const startM = typeof p.startMinutes === "number" ? p.startMinutes : 0;
  const endM = typeof p.endMinutes === "number" ? p.endMinutes : 24 * 60;
  return minutes >= startM && minutes < endM;
}

function getCategoryTitle(cat) {
  if (!cat) return "";
  if (cat.title && typeof cat.title === "object") {
    const direct = pickBookingLoc(cat.title);
    if (direct) return direct;
  }
  if (typeof cat.title === "string") {
    const k = `booking.cat.${cat.id}.title`;
    const tr = tBook(k);
    return tr === k ? cat.title : tr;
  }
  return "";
}

function getCategoryDesc(cat) {
  if (!cat) return "";
  if (cat.description && typeof cat.description === "object") {
    const direct = pickBookingLoc(cat.description);
    if (direct) return direct;
  }
  if (typeof cat.description === "string") {
    const k = `booking.cat.${cat.id}.desc`;
    const tr = tBook(k);
    return tr === k ? cat.description : tr;
  }
  return "";
}

function serviceIsActiveForBooking(s) {
  if (!s || typeof s !== "object") return false;
  if (s.visible === false) return false;
  if (s.bookingEnabled === false) return false;
  return true;
}

function getServiceCategoriesWithItems() {
  return serviceCategories
    .filter(
      (cat) =>
        cat.visible !== false &&
        services.some((s) => s.category === cat.id && serviceIsActiveForBooking(s))
    )
    .slice()
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
}

function getBarberDescription(barber) {
  if (!barber) return "";
  const k = `booking.barber.${barber.id}.desc`;
  const tr = tBook(k);
  return tr === k ? barber.description : tr;
}

const DEFAULT_DISCOUNT_PERCENT = 10;
const DEFAULT_DISCOUNT_WEEKDAYS = [1, 2, 3, 4]; // pn-czw
const DEFAULT_DISCOUNT_START_MINUTES = 10 * 60;
const DEFAULT_DISCOUNT_END_MINUTES = 16 * 60;

let DISCOUNT_PERCENT = DEFAULT_DISCOUNT_PERCENT;
let DISCOUNT_WEEKDAYS = [...DEFAULT_DISCOUNT_WEEKDAYS];
let DISCOUNT_START_MINUTES = DEFAULT_DISCOUNT_START_MINUTES;
let DISCOUNT_END_MINUTES = DEFAULT_DISCOUNT_END_MINUTES;

let serviceCategories = [
  {
    id: "popular",
    title: "Popularne usługi",
    description: "Najczęściej wybierane opcje.",
    visible: true,
    order: 1
  },
  {
    id: "beard",
    title: "Broda i golenie",
    description: "Usługi brody i golenia.",
    visible: true,
    order: 2
  },
  {
    id: "hair",
    title: "Strzyżenie włosów",
    description: "Nożyczki, dzieci, krótkie strzyżenia.",
    visible: true,
    order: 3
  },
  {
    id: "color",
    title: "Koloryzacja",
    description: "Odsiwianie i koloryzacja.",
    visible: true,
    order: 4
  },
  {
    id: "gray",
    title: "Koloryzacja i odsiwianie",
    description: "Usługi premium z odsiwianiem.",
    visible: true,
    order: 5
  },
  {
    id: "extras",
    title: "Dodatki",
    description: "Szybkie dodatkowe usługi.",
    visible: true,
    order: 6
  }
];

let services = [
  {
    id: "haircut",
    category: "popular",
    name: "Strzyżenie męskie",
    basePrice: 90,
    duration: "1h",
    durationMinutes: 60
  },
  {
    id: "combo",
    category: "popular",
    name: "Strzyżenie włosów i brody",
    basePrice: 140,
    duration: "1h 30min",
    durationMinutes: 90
  },
  {
    id: "scissors",
    category: "hair",
    name: "Strzyżenie nożyczkami",
    basePrice: 130,
    duration: "1h 30min",
    durationMinutes: 90
  },
  {
    id: "kids",
    category: "hair",
    name: "Strzyżenie dzieci 4–12 lat",
    basePrice: 80,
    duration: "1h",
    durationMinutes: 60
  },
  {
    id: "short-sides",
    category: "hair",
    name: "Krótkie strzyżenie lub same boki",
    basePrice: 80,
    duration: "1h",
    durationMinutes: 60
  },
  {
    id: "beard-zero",
    category: "beard",
    name: "Broda i golenie głowy na zero",
    basePrice: 90,
    duration: "50min",
    durationMinutes: 50
  },
  {
    id: "beard-trim",
    category: "beard",
    name: "Strzyżenie brody",
    basePrice: 70,
    duration: "40min",
    durationMinutes: 40
  },
  {
    id: "shaving",
    category: "beard",
    name: "Golenie głowy golarką",
    basePrice: 50,
    duration: "30min",
    durationMinutes: 30
  },
  {
    id: "gray-beard",
    category: "color",
    name: "Strzyżenie brody z odsiwianiem",
    basePrice: 150,
    duration: "1h 30min",
    durationMinutes: 90
  },
  {
    id: "gray-hair",
    category: "color",
    name: "Strzyżenie włosów z odsiwianiem",
    basePrice: 150,
    duration: "1h 30min",
    durationMinutes: 90
  },
  {
    id: "gray-combo-beard",
    category: "color",
    name: "Włosy, broda i odsiwianie brody",
    basePrice: 210,
    duration: "2h",
    durationMinutes: 120
  },
  {
    id: "gray-combo-full",
    category: "color",
    name: "Włosy, broda i pełne odsiwianie",
    basePrice: 260,
    duration: "2h",
    durationMinutes: 120
  },
  {
    id: "wax",
    category: "extras",
    name: "Depilacja woskiem",
    basePrice: 20,
    duration: "5min",
    durationMinutes: 5
  }
];

let barbers = [
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
];

const state = {
  step: 1,
  name: "",
  phone: "+48 ",
  selectedCategory: "",
  selectedServiceId: "",
  barberDecision: "",
  barberSlideIndex: 0,
  selectedBarberId: "",
  resolvedBarberName: "",
  selectedDate: "",
  selectedTime: "",
  slotsByDate: {},
  calendarMonthOffset: 0,
  submitting: false
};

const steps = [...document.querySelectorAll(".step")];

const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const stepPill = document.getElementById("stepPill");
const stepTitle = document.getElementById("stepTitle");
const stepSubtitle = document.getElementById("stepSubtitle");

const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");

const nameInput = document.getElementById("nameInput");
const phoneInput = document.getElementById("phoneInput");
const nameError = document.getElementById("nameError");
const phoneError = document.getElementById("phoneError");

const categoryAccordion = document.getElementById("categoryAccordion");

const chooseBarberYes = document.getElementById("chooseBarberYes");
const chooseBarberNo = document.getElementById("chooseBarberNo");
const barberSkipBox = document.getElementById("barberSkipBox");

const barberSlidePhoto = document.getElementById("barberSlidePhoto");
const barberSlideName = document.getElementById("barberSlideName");
const barberSlideDescription = document.getElementById("barberSlideDescription");
const barberSlideLangs = document.getElementById("barberSlideLangs");
const barberCounter = document.getElementById("barberCounter");
const barberPrevBtn = document.getElementById("barberPrevBtn");
const barberNextBtn = document.getElementById("barberNextBtn");
const selectBarberBtn = document.getElementById("selectBarberBtn");

const monthLabel = document.getElementById("monthLabel");
const calendarStatus = document.getElementById("calendarStatus");
const calendarGrid = document.getElementById("calendarGrid");
const dateError = document.getElementById("dateError");
const calendarPrevBtn = document.getElementById("calendarPrevBtn");
const calendarNextBtn = document.getElementById("calendarNextBtn");

const slotsStatus = document.getElementById("slotsStatus");
const slotsGrid = document.getElementById("slotsGrid");
const timeError = document.getElementById("timeError");

const submitError = document.getElementById("submitError");

function formatPrice(value, prefix = "") {
  const price = `${Number(value).toFixed(2).replace(".", ",")} zł`;
  const pfx =
    prefix === "od"
      ? tBook("booking.pricePrefix.from")
      : prefix;
  return pfx ? `${pfx} ${price}` : price;
}

function getBookingBarbersForService(service) {
  if (!service || !Array.isArray(service.availableBarberIds) || service.availableBarberIds.length === 0) {
    return barbers;
  }
  const allowed = new Set(service.availableBarberIds.map((id) => String(id)));
  const list = barbers.filter((b) => allowed.has(String(b.id)));
  return list.length ? list : barbers;
}

function getBookingBarbersResolved() {
  return getBookingBarbersForService(getSelectedService());
}

function getSelectedBarber() {
  return barbers.find((barber) => barber.id === state.selectedBarberId) || null;
}

function getSelectedService() {
  if (!state.selectedServiceId) return null;
  return services.find((s) => s.id === state.selectedServiceId) || null;
}

window.getSelectedService = getSelectedService;

function formatDateText(dateStr) {
  if (!dateStr) return "—";

  const lang = getDogmaLang();
  const loc = lang === "en" ? "en-GB" : lang === "ru" ? "ru-RU" : "pl-PL";
  const date = new Date(`${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat(loc, {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
}

function syncContactFromInputs() {
  if (nameInput) state.name = nameInput.value.trim();
  if (phoneInput) {
    let formatted = normalizePhone(phoneInput.value);
    if (formatted === "+48") formatted = "+48 ";
    phoneInput.value = formatted;
    state.phone = formatted;
  }
}

function normalizePhone(value) {
  let digits = String(value || "").replace(/\D/g, "");

  if (digits.startsWith("48")) {
    digits = digits.slice(2);
  }

  digits = digits.slice(0, 9);

  let result = "+48";
  if (digits.length > 0) result += ` ${digits.slice(0, 3)}`;
  if (digits.length > 3) result += ` ${digits.slice(3, 6)}`;
  if (digits.length > 6) result += ` ${digits.slice(6, 9)}`;

  return result;
}

function isValidName(value) {
  return String(value ?? "").trim().length >= 2;
}

function isValidPhone(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("48")) digits = digits.slice(2);
  return digits.length === 9;
}

function timeToMinutes(timeStr) {
  const [hour, minute] = timeStr.split(":").map(Number);
  return hour * 60 + minute;
}

function rangesOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

function getWeekday(dateStr) {
  return new Date(`${dateStr}T00:00:00`).getDay();
}

function getWorkingHoursForDate(dateStr) {
  const day = getWeekday(dateStr);
  const oh = typeof window !== "undefined" ? window.DOGMA_BOOKING_OPENING_HOURS : null;
  if (oh && typeof oh === "object") {
    const row = oh[String(day)];
    if (row && row.closed) {
      return { openHour: 10, closeHour: 10, closed: true };
    }
    if (row && typeof row.openHour === "number" && typeof row.closeHour === "number") {
      return { openHour: row.openHour, closeHour: row.closeHour };
    }
  }

  if (day === 0) {
    return { openHour: 10, closeHour: 18 };
  }

  return { openHour: 10, closeHour: 20 };
}

function isDiscountWindow(dateStr, timeStr) {
  if (!dateStr || !timeStr) return false;

  const cfg = typeof window !== "undefined" ? window.DOGMA_BOOKING_DISCOUNT : null;
  if (cfg && cfg.enabled === false) return false;

  const day = getWeekday(dateStr);
  const weekdays = Array.isArray(cfg?.weekdays) && cfg.weekdays.length ? cfg.weekdays : DISCOUNT_WEEKDAYS;
  if (!weekdays.includes(day)) return false;

  const minutes = timeToMinutes(timeStr);
  const startM = typeof cfg?.startMinutes === "number" ? cfg.startMinutes : DISCOUNT_START_MINUTES;
  const endM = typeof cfg?.endMinutes === "number" ? cfg.endMinutes : DISCOUNT_END_MINUTES;
  return minutes >= startM && minutes < endM;
}

function getDiscountedPrice(basePrice) {
  if (!DISCOUNT_PERCENT) return Number(basePrice);
  return Number((basePrice * (1 - DISCOUNT_PERCENT / 100)).toFixed(2));
}

function getServicePriceDetails(service, dateStr = "", timeStr = "") {
  if (!service) {
    return {
      basePrice: 0,
      finalPrice: 0,
      hasDiscount: false,
      discountedPrice: 0
    };
  }

  const basePrice = Number(service.basePrice) || 0;

  if (dateStr && timeStr && isServicePromoWindow(service, dateStr, timeStr)) {
    const p = service.promoDiscount;
    let finalPrice = basePrice;
    if (p && p.usePercent === false && p.priceAfter != null && p.priceAfter !== "" && !Number.isNaN(Number(p.priceAfter))) {
      finalPrice = Number(p.priceAfter);
    } else {
      const pct = Number(p?.percent) || 0;
      finalPrice = Number((basePrice * (1 - pct / 100)).toFixed(2));
    }
    const hasDiscount = finalPrice < basePrice;
    return {
      basePrice,
      finalPrice,
      hasDiscount,
      discountedPrice: finalPrice
    };
  }

  const discountedPrice = getDiscountedPrice(basePrice);
  const hasDiscount = isDiscountWindow(dateStr, timeStr);
  const finalPrice = hasDiscount ? discountedPrice : basePrice;

  return {
    basePrice,
    finalPrice,
    hasDiscount,
    discountedPrice
  };
}

function getServicePriceText(service, dateStr = "", timeStr = "") {
  const details = getServicePriceDetails(service, dateStr, timeStr);
  return formatPrice(details.finalPrice, service?.pricePrefix || "");
}

function generateBaseSlotsForDate(dateStr, serviceDurationMinutes = 0) {
  const wh = getWorkingHoursForDate(dateStr);
  if (wh.closed) return [];
  const { openHour, closeHour } = wh;
  const slots = [];
  const lastStartMinutes = closeHour * 60 - serviceDurationMinutes;

  for (let minutes = openHour * 60; minutes <= lastStartMinutes; minutes += 30) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    slots.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
  }

  return slots;
}

function buildSlotsFromBusy(dateStr, busyIntervals, serviceDurationMinutes) {
  const baseSlots = generateBaseSlotsForDate(dateStr, serviceDurationMinutes);

  return baseSlots
    .map((time) => {
      const slotStart = timeToMinutes(time);
      const slotEnd = slotStart + serviceDurationMinutes;

      const overlapsBusy = busyIntervals.some((busy) => {
        const busyStart = timeToMinutes(busy.start);
        const busyEnd = timeToMinutes(busy.end);
        return rangesOverlap(slotStart, slotEnd, busyStart, busyEnd);
      });

      return {
        time,
        available: !overlapsBusy
      };
    })
    .filter((slot) => slot.available);
}

async function loadAvailabilityForDate(dateStr) {
  const service = getSelectedService();
  const barber = getSelectedBarber();

  if (!dateStr || !service) return;

  if (slotsStatus) slotsStatus.textContent = tBook("booking.slots.loading");
  if (slotsGrid) slotsGrid.innerHTML = "";

  const barberId = state.barberDecision === "no" ? "auto" : barber?.id || "";
  if (!barberId) return;

  const response = await fetch(
    `${API_BASE}/api/availability?date=${encodeURIComponent(dateStr)}&barberId=${encodeURIComponent(barberId)}&durationMinutes=${encodeURIComponent(service.durationMinutes)}`
  );

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.ok) {
    throw new Error(data?.error || tBook("booking.err.availability"));
  }

  if (state.barberDecision === "no") {
    const availableSlots = Array.isArray(data.availableSlots) ? data.availableSlots : [];
    state.slotsByDate[dateStr] = availableSlots.map((time) => ({
      time,
      available: true
    }));
    return;
  }

  const busyIntervals = Array.isArray(data.busy) ? data.busy : [];
  state.slotsByDate[dateStr] = buildSlotsFromBusy(dateStr, busyIntervals, service.durationMinutes);
}

function updateBindings() {
  const service = getSelectedService();
  const barber = getSelectedBarber();
  const priceDetails = getServicePriceDetails(service, state.selectedDate, state.selectedTime);

  document.querySelectorAll('[data-bind="name"]').forEach((el) => {
    el.textContent = state.name || "—";
  });

  document.querySelectorAll('[data-bind="phone"]').forEach((el) => {
    el.textContent = state.phone || "—";
  });

  document.querySelectorAll('[data-bind="serviceName"]').forEach((el) => {
    el.textContent = getServiceDisplayName(service) || "—";
  });

  document.querySelectorAll('[data-bind="servicePrice"]').forEach((el) => {
    if (!service) {
      el.textContent = "—";
      return;
    }

    if (priceDetails.hasDiscount) {
      el.textContent = `${formatPrice(priceDetails.finalPrice)}  •  -${DISCOUNT_PERCENT}%`;
      return;
    }

    el.textContent = formatPrice(priceDetails.finalPrice);
  });

  document.querySelectorAll('[data-bind="serviceDuration"]').forEach((el) => {
    el.textContent = service?.duration || "—";
  });

  document.querySelectorAll('[data-bind="barberName"]').forEach((el) => {
    if (state.barberDecision === "no") {
      el.textContent = state.resolvedBarberName || tBook("booking.barber.auto");
      return;
    }

    el.textContent = barber?.name || "—";
  });

  document.querySelectorAll('[data-bind="dateText"]').forEach((el) => {
    el.textContent = formatDateText(state.selectedDate);
  });

  document.querySelectorAll('[data-bind="time"]').forEach((el) => {
    el.textContent = state.selectedTime || "—";
  });
}

function updateHeader() {
  if (!stepTitle || !stepSubtitle || !stepPill || !progressFill || !progressText) return;

  stepTitle.textContent = tBook(`booking.meta.${state.step}.title`);
  stepSubtitle.textContent = tBook(`booking.meta.${state.step}.sub`);
  stepPill.textContent = `${state.step} / ${TOTAL_STEPS}`;

  const percent = Math.round((state.step / TOTAL_STEPS) * 100);
  progressFill.style.width = `${percent}%`;
  progressText.textContent = `${percent}%`;
}

function updateNav() {
  if (!backBtn || !nextBtn) return;

  if (state.step === 8) {
    backBtn.classList.add("hidden");
    nextBtn.classList.add("hidden");
    return;
  }

  backBtn.classList.remove("hidden");
  backBtn.style.visibility = state.step === 1 ? "hidden" : "visible";
  if (state.step > 1 && state.step < 8) {
    backBtn.style.pointerEvents = "auto";
    backBtn.style.opacity = "1";
  }
  backBtn.textContent = tBook("booking.nav.back");

  if (state.step === 2) {
    nextBtn.classList.add("hidden");
    nextBtn.classList.remove("pulse");
    return;
  }

  nextBtn.classList.remove("hidden");
  nextBtn.classList.remove("pulse");

  if (state.step === 7) {
    nextBtn.textContent = state.submitting ? tBook("booking.nav.saving") : tBook("booking.nav.confirm");
  } else {
    nextBtn.textContent = tBook("booking.nav.next");
  }

  const nameForNav = nameInput ? nameInput.value.trim() : state.name;
  const phoneForNav = phoneInput ? phoneInput.value : state.phone;

  if (state.step === 1) {
    nextBtn.disabled = !(isValidName(nameForNav) && isValidPhone(phoneForNav));
  } else if (state.step === 3) {
    nextBtn.disabled = !state.barberDecision;
  } else if (state.step === 4) {
    nextBtn.disabled = !state.selectedBarberId;
  } else if (state.step === 5) {
    nextBtn.disabled = !state.selectedDate;
  } else if (state.step === 6) {
    nextBtn.disabled = !state.selectedTime;
  } else if (state.step === 7) {
    nextBtn.disabled = state.submitting;
  } else {
    nextBtn.disabled = false;
  }

  if (state.step === 7 && !state.submitting) {
    nextBtn.classList.add("pulse");
  }
}

function showStep(step) {
  state.step = step;

  if (step >= 3) {
    syncContactFromInputs();
  }

  steps.forEach((section) => {
    section.classList.toggle("active", Number(section.dataset.step) === step);
  });

  if (step === 2) {
    renderServiceAccordion();
  }

  updateNav();
  updateHeader();
  updateBindings();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function getServicePriceMarkup(service) {
  const hasFieldPromo =
    service &&
    service.discountedPrice != null &&
    service.discountedPrice !== "" &&
    !Number.isNaN(Number(service.discountedPrice));
  const discounted = hasFieldPromo ? Number(service.discountedPrice) : getDiscountedPrice(service.basePrice);
  const orLine = tBook("booking.opt.discountOr", { price: formatPrice(discounted) });
  return `
    <div class="service-option-price-line">
      <span class="price-main">${formatPrice(service.basePrice)}</span>
      <span class="price-discount">${orLine}</span>
    </div>
  `;
}

function bindServiceInlineContinue(btn, serviceId) {
  let swallowNextClick = false;
  const proceed = () => {
    if (state.step !== 2 || state.selectedServiceId !== serviceId) return;
    syncContactFromInputs();
    renderBarberDecision();
    renderBarberSlider();
    renderCalendar();
    renderSlots();
    showStep(3);
  };
  btn.style.touchAction = "manipulation";
  btn.addEventListener(
    "touchend",
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      swallowNextClick = true;
      window.setTimeout(() => {
        swallowNextClick = false;
      }, 450);
      proceed();
    },
    { passive: false, capture: true }
  );
  btn.addEventListener(
    "click",
    (event) => {
      if (swallowNextClick) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      proceed();
    },
    true
  );
}

function renderServiceAccordion() {
  if (!categoryAccordion) return;
  categoryAccordion.innerHTML = "";

  getServiceCategoriesWithItems().forEach((category) => {
    const item = document.createElement("div");
    const isOpen = state.selectedCategory === category.id;

    item.className = `accordion-item ${isOpen ? "open" : ""}`;

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "accordion-trigger";
    trigger.innerHTML = `
      <div class="accordion-trigger-main">
        <strong>${getCategoryTitle(category)}</strong>
        <span>${getCategoryDesc(category)}</span>
      </div>
      <div class="accordion-arrow">⌄</div>
    `;

    trigger.addEventListener("click", () => {
      state.selectedCategory = state.selectedCategory === category.id ? "" : category.id;
      renderServiceAccordion();
    });

    const body = document.createElement("div");
    body.className = "accordion-body";

    const inner = document.createElement("div");
    inner.className = "accordion-inner";

    const serviceList = document.createElement("div");
    serviceList.className = "service-option-list";

    const categoryServices = services.filter(
      (service) => service.category === category.id && serviceIsActiveForBooking(service)
    );

    categoryServices.forEach((service) => {
      const card = document.createElement("div");
      card.className = `service-option ${state.selectedServiceId === service.id ? "selected" : ""}`;

      const inlineNextHtml =
        state.selectedServiceId === service.id
          ? `<div class="service-inline-next">
          <button class="nav-btn nav-btn-primary service-next-btn" type="button">
            ${tBook("booking.opt.next")}
          </button>
        </div>`
          : "";

      const descText = getServiceDescriptionText(service);
      card.innerHTML = `
        <div class="service-option-top">
          <strong class="service-option-title">${getServiceDisplayName(service)}</strong>
          <span class="service-option-duration">${service.duration}</span>
        </div>
        ${descText ? `<p class="service-option-desc"></p>` : ""}

        <div class="service-option-prices">
          ${getServicePriceMarkup(service)}
        </div>

        <div class="service-option-note">
          ${tBook("booking.opt.discountNote", { pct: DISCOUNT_PERCENT })}
        </div>
        ${inlineNextHtml}
      `;

      const nextInline = card.querySelector(".service-next-btn");
      if (nextInline) {
        bindServiceInlineContinue(nextInline, service.id);
      }

      const descEl = card.querySelector(".service-option-desc");
      if (descEl) {
        descEl.textContent = descText;
      }

      card.addEventListener("click", (event) => {
        const hit = event.target;
        const hitEl = hit instanceof Element ? hit : hit.parentElement;
        if (hitEl?.closest?.(".service-next-btn")) return;
        event.preventDefault();

        state.selectedCategory = category.id;
        state.selectedServiceId = service.id;
        state.barberDecision = "";
        state.selectedBarberId = "";
        state.resolvedBarberName = "";
        state.selectedDate = "";
        state.selectedTime = "";
        state.calendarMonthOffset = 0;
        state.slotsByDate = {};

        renderServiceAccordion();
        updateBindings();
        updateNav();
      });

      serviceList.appendChild(card);
    });

    inner.appendChild(serviceList);
    body.appendChild(inner);
    item.appendChild(trigger);
    item.appendChild(body);
    categoryAccordion.appendChild(item);
  });
}

function renderBarberDecision() {
  if (!barberSkipBox) return;

  barberSkipBox.classList.toggle("hidden", state.barberDecision !== "no");

  chooseBarberYes?.classList.toggle("active", state.barberDecision === "yes");
  chooseBarberNo?.classList.toggle("active", state.barberDecision === "no");
}

function renderBarberSlider() {
  const list = getBookingBarbersResolved();
  if (!list.length) return;
  if (state.barberSlideIndex >= list.length) state.barberSlideIndex = 0;
  const barber = list[state.barberSlideIndex];
  if (!barber) return;

  if (barberSlidePhoto) {
    barberSlidePhoto.innerHTML = `
      <img src="${barber.photo}" alt="${barber.name}" class="barber-photo-img" />
    `;
  }

  if (barberSlideName) barberSlideName.textContent = barber.name;
  if (barberSlideDescription) barberSlideDescription.textContent = getBarberDescription(barber);

  if (barberSlideLangs) {
    barberSlideLangs.innerHTML = "";
    barber.languages.forEach((lang) => {
      const tag = document.createElement("span");
      tag.textContent = lang;
      barberSlideLangs.appendChild(tag);
    });
  }

  if (barberCounter) barberCounter.textContent = `${state.barberSlideIndex + 1} / ${list.length}`;

  const isSelected = state.selectedBarberId === barber.id;
  if (selectBarberBtn) {
    selectBarberBtn.textContent = isSelected ? tBook("booking.barber.picked") : tBook("booking.barber.pick");
    selectBarberBtn.classList.toggle("selected", isSelected);
  }
}

function getMonthName(monthIndex) {
  return tBook(`booking.month.${monthIndex}`);
}

function renderCalendar() {
  if (!calendarGrid) return;
  calendarGrid.innerHTML = "";
  if (dateError) dateError.textContent = "";

  const today = new Date();
  const currentMonthDate = new Date(
    today.getFullYear(),
    today.getMonth() + state.calendarMonthOffset,
    1
  );

  const currentYear = currentMonthDate.getFullYear();
  const currentMonth = currentMonthDate.getMonth();

  if (monthLabel) monthLabel.textContent = `${getMonthName(currentMonth)} ${currentYear}`;

  const todayString = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  const firstDay = new Date(currentYear, currentMonth, 1);
  let firstWeekday = firstDay.getDay();
  if (firstWeekday === 0) firstWeekday = 7;

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const cells = [];

  for (let i = firstWeekday - 1; i > 0; i -= 1) {
    cells.push({
      label: prevMonthDays - i + 1,
      muted: true
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateObj = new Date(currentYear, currentMonth, day);
    const iso = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);

    const isPast = iso < todayString;

    cells.push({
      label: day,
      iso,
      muted: false,
      available: !isPast,
      selected: state.selectedDate === iso,
      today: iso === todayString
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({
      label: "",
      muted: true
    });
  }

  if (calendarStatus) calendarStatus.textContent = tBook("booking.cal.hoursNote");

  cells.forEach((cell) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    button.textContent = cell.label;

    if (cell.muted) {
      button.classList.add("muted");
      button.disabled = true;
    } else {
      if (cell.selected) button.classList.add("selected");
      if (cell.today) button.classList.add("today");

      if (!cell.available) {
        button.classList.add("unavailable");
        button.disabled = true;
      } else {
        button.addEventListener("click", async () => {
          try {
            state.selectedDate = cell.iso;
            state.selectedTime = "";
            state.resolvedBarberName = "";

            renderCalendar();
            renderSlots();
            updateBindings();
            updateNav();

            await loadAvailabilityForDate(cell.iso);

            renderSlots();
            updateBindings();
            updateNav();
          } catch (error) {
            if (dateError) dateError.textContent = error.message || tBook("booking.err.availability");
            if (slotsStatus) slotsStatus.textContent = tBook("booking.slots.errorLoad");
            if (slotsGrid) slotsGrid.innerHTML = "";
          }
        });
      }
    }

    calendarGrid.appendChild(button);
  });

  if (calendarPrevBtn) calendarPrevBtn.disabled = state.calendarMonthOffset <= 0;
}

function renderSlots() {
  if (!slotsGrid) return;
  slotsGrid.innerHTML = "";
  if (timeError) timeError.textContent = "";

  if (!state.selectedDate) {
    if (slotsStatus) slotsStatus.textContent = tBook("booking.slots.pickDate");
    return;
  }

  const slots = state.slotsByDate[state.selectedDate];
  const { openHour, closeHour } = getWorkingHoursForDate(state.selectedDate);

  if (!slots) {
    if (slotsStatus) slotsStatus.textContent = tBook("booking.slots.pickDay");
    return;
  }

  if (!slots.length) {
    if (slotsStatus) slotsStatus.textContent = tBook("booking.slots.none");
    return;
  }

  const hoursRange = `${String(openHour).padStart(2, "0")}:00–${String(closeHour).padStart(2, "0")}:00`;
  if (slotsStatus) slotsStatus.textContent = tBook("booking.slots.free", { n: slots.length, hours: hoursRange });

  slots.forEach((slot) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slot-btn";
    btn.textContent = slot.time;

    const service = getSelectedService();
    const discountActive = service && isDiscountWindow(state.selectedDate, slot.time);

    if (discountActive) {
      btn.classList.add("discounted");
      btn.innerHTML = `
        <span class="slot-time">${slot.time}</span>
        <span class="slot-discount">-${DISCOUNT_PERCENT}%</span>
      `;
    }

    if (state.selectedTime === slot.time) {
      btn.classList.add("selected");
    }

    btn.addEventListener("click", () => {
      state.selectedTime = slot.time;
      renderSlots();
      updateBindings();
      updateNav();
    });

    slotsGrid.appendChild(btn);
  });
}

async function submitBooking() {
  if (submitError) submitError.textContent = "";
  state.submitting = true;
  updateNav();

  const service = getSelectedService();
  const barber = getSelectedBarber();

  const payload = {
    name: state.name,
    phone: state.phone,
    serviceName: getServiceDisplayName(service) || "",
    serviceDuration: service?.duration || "",
    servicePrice: getServicePriceText(service, state.selectedDate, state.selectedTime),
    barberName: state.barberDecision === "no" ? "" : (barber?.name || ""),
    barberId: state.barberDecision === "no" ? "auto" : (barber?.id || ""),
    date: state.selectedDate,
    time: state.selectedTime
  };

  try {
    const response = await fetch(`${API_BASE}/api/book`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.ok) {
      throw new Error(data?.error || tBook("booking.err.book"));
    }

    if (state.barberDecision === "no") {
      state.resolvedBarberName = data?.resolvedBarberName || tBook("booking.barber.auto");
    }

    updateBindings();
    showStep(8);
  } catch (error) {
    if (submitError) submitError.textContent = error.message || tBook("booking.err.server");
  } finally {
    state.submitting = false;
    updateNav();
  }
}

function nextStep() {
  if (state.step === 1) {
    syncContactFromInputs();

    const validName = isValidName(state.name);
    const validPhone = isValidPhone(state.phone);

    if (nameError) nameError.textContent = validName ? "" : tBook("booking.err.name");
    if (phoneError) phoneError.textContent = validPhone ? "" : tBook("booking.err.phone");

    if (!validName || !validPhone) return;
    const pre =
      typeof window !== "undefined" && window.__DOGMA_BOOKING_PRESELECT_SERVICE
        ? String(window.__DOGMA_BOOKING_PRESELECT_SERVICE).trim()
        : "";
    if (pre) {
      const svc = services.find((s) => s.id === pre && serviceIsActiveForBooking(s));
      if (svc) {
        state.selectedServiceId = svc.id;
        state.selectedCategory = svc.category;
      }
    }
    showStep(2);
    return;
  }

  if (state.step === 2) {
    if (!state.selectedServiceId) return;
    syncContactFromInputs();
    showStep(3);
    return;
  }

  if (state.step === 3) {
    if (!state.barberDecision) return;

    if (state.barberDecision === "no") {
      state.selectedBarberId = "";
      state.resolvedBarberName = "";
      state.selectedDate = "";
      state.selectedTime = "";
      state.slotsByDate = {};
      renderCalendar();
      renderSlots();
      updateBindings();
      updateNav();
      showStep(5);
      return;
    }

    showStep(4);
    return;
  }

  if (state.step === 4) {
    if (!state.selectedBarberId) return;
    showStep(5);
    return;
  }

  if (state.step === 5) {
    if (!state.selectedDate) {
      if (dateError) dateError.textContent = tBook("booking.err.date");
      return;
    }
    showStep(6);
    return;
  }

  if (state.step === 6) {
    if (!state.selectedTime) {
      if (timeError) timeError.textContent = tBook("booking.err.time");
      return;
    }
    showStep(7);
    return;
  }

  if (state.step === 7) {
    submitBooking();
  }
}

function prevStep() {
  if (state.step <= 1) return;

  if (state.step === 5 && state.barberDecision === "no") {
    showStep(3);
    return;
  }

  showStep(state.step - 1);
}

function callMonarchPhone() {
  const phone = "+48532377701";

  try {
    window.location.href = `tel:${phone}`;
  } catch (error) {
    console.error("Call error:", error);
    navigator.clipboard?.writeText("532 377 701");
    alert(tBook("booking.call.alert"));
  }
}

window.callMonarchPhone = callMonarchPhone;
window.callDogma = callMonarchPhone;

function onBookingNameFieldInput(e) {
  state.name = e.target.value;
  if (nameError) nameError.textContent = "";
  updateBindings();
  updateNav();
}

nameInput?.addEventListener("input", onBookingNameFieldInput);
nameInput?.addEventListener("change", onBookingNameFieldInput);
nameInput?.addEventListener("blur", () => {
  syncContactFromInputs();
  updateBindings();
  updateNav();
});
nameInput?.addEventListener("compositionend", () => {
  syncContactFromInputs();
  updateBindings();
  updateNav();
});

function onBookingPhoneFieldInput(e) {
  let formatted = normalizePhone(e.target.value);
  if (formatted === "+48") formatted = "+48 ";
  e.target.value = formatted;
  state.phone = formatted;
  if (phoneError) phoneError.textContent = "";
  updateBindings();
  updateNav();
}

if (phoneInput) {
  phoneInput.value = state.phone;
}

phoneInput?.addEventListener("keydown", (e) => {
  const pos = phoneInput.selectionStart || 0;

  if ((e.key === "Backspace" || e.key === "Delete") && pos <= 4) {
    e.preventDefault();
  }
});

phoneInput?.addEventListener("input", onBookingPhoneFieldInput);
phoneInput?.addEventListener("change", onBookingPhoneFieldInput);
phoneInput?.addEventListener("blur", () => {
  syncContactFromInputs();
  updateBindings();
  updateNav();
});
phoneInput?.addEventListener("compositionend", () => {
  syncContactFromInputs();
  updateBindings();
  updateNav();
});

backBtn?.addEventListener("click", prevStep);
nextBtn?.addEventListener("click", nextStep);

chooseBarberYes?.addEventListener("click", () => {
  state.barberDecision = "yes";
  state.selectedBarberId = "";
  state.resolvedBarberName = "";
  renderBarberDecision();
  renderBarberSlider();
  updateBindings();
  updateNav();
});

chooseBarberNo?.addEventListener("click", () => {
  state.barberDecision = "no";
  state.selectedBarberId = "";
  state.resolvedBarberName = "";
  state.selectedDate = "";
  state.selectedTime = "";
  state.slotsByDate = {};
  renderBarberDecision();
  renderCalendar();
  renderSlots();
  updateBindings();
  updateNav();
});

barberPrevBtn?.addEventListener("click", () => {
  const list = getBookingBarbersResolved();
  if (!list.length) return;
  state.barberSlideIndex = (state.barberSlideIndex - 1 + list.length) % list.length;
  renderBarberSlider();
});

barberNextBtn?.addEventListener("click", () => {
  const list = getBookingBarbersResolved();
  if (!list.length) return;
  state.barberSlideIndex = (state.barberSlideIndex + 1) % list.length;
  renderBarberSlider();
});

selectBarberBtn?.addEventListener("click", () => {
  const list = getBookingBarbersResolved();
  const cur = list[state.barberSlideIndex];
  if (!cur) return;
  state.selectedBarberId = cur.id;
  renderBarberSlider();
  updateBindings();
  updateNav();
});

calendarPrevBtn?.addEventListener("click", () => {
  if (state.calendarMonthOffset <= 0) return;
  state.calendarMonthOffset -= 1;
  renderCalendar();
});

calendarNextBtn?.addEventListener("click", () => {
  state.calendarMonthOffset += 1;
  renderCalendar();
});

function dogmaSyncBookingStep1Nav() {
  if (state.step !== 1) return;
  syncContactFromInputs();
  updateBindings();
  updateNav();
}

window.dogmaSyncBookingStep1Nav = dogmaSyncBookingStep1Nav;

function refreshBookingWizardLanguage() {
  if (!stepTitle) return;
  if (state.step === 1) dogmaSyncBookingStep1Nav();
  else if (state.step > 1) syncContactFromInputs();
  updateHeader();
  updateNav();
  renderServiceAccordion();
  renderBarberDecision();
  renderBarberSlider();
  renderCalendar();
  renderSlots();
  updateBindings();
}

window.refreshBookingWizardLanguage = refreshBookingWizardLanguage;

function filterBookingBarbersBySiteVisibility() {
  const sc = window.DOGMA_SITE_CONTENT;
  if (!sc || !Array.isArray(sc.barbers)) return;
  const hide = new Set();
  sc.barbers.forEach((b) => {
    if (b && b.barberId && b.visibleInBooking === false) {
      hide.add(String(b.barberId).trim());
    }
  });
  if (!hide.size) return;
  const next = barbers.filter((barber) => !hide.has(String(barber.id)));
  if (next.length) {
    barbers.length = 0;
    barbers.push(...next);
  }
}

function cloneBookingValue(v) {
  return v == null ? v : JSON.parse(JSON.stringify(v));
}

window.DOGMA_applyBookingConfigFromContent = function () {
  const data = window.DOGMA_SITE_CONTENT;
  if (!data || typeof data !== "object") return false;

  const raw = data.bookingConfig;
  if (!raw || typeof raw !== "object") {
    window.DOGMA_BOOKING_OPENING_HOURS = null;
    window.DOGMA_BOOKING_DISCOUNT = null;
    DISCOUNT_PERCENT = DEFAULT_DISCOUNT_PERCENT;
    DISCOUNT_WEEKDAYS = [...DEFAULT_DISCOUNT_WEEKDAYS];
    DISCOUNT_START_MINUTES = DEFAULT_DISCOUNT_START_MINUTES;
    DISCOUNT_END_MINUTES = DEFAULT_DISCOUNT_END_MINUTES;
    filterBookingBarbersBySiteVisibility();
    refreshBookingWizardLanguage();
    mergeBookingCatalogSnapshot();
    return false;
  }

  if (Array.isArray(raw.serviceCategories) && raw.serviceCategories.length) {
    serviceCategories.length = 0;
    serviceCategories.push(...raw.serviceCategories.map((c) => cloneBookingValue(c)));
  }
  if (Array.isArray(raw.services) && raw.services.length) {
    services.length = 0;
    services.push(
      ...raw.services.map((s) => {
        const x = cloneBookingValue(s);
        if (x.bookingEnabled === undefined) x.bookingEnabled = true;
        if (typeof x.name === "string") {
          const t = x.name;
          x.name = { pl: t, ua: "", en: "" };
        }
        if (typeof x.description === "string") {
          const t = x.description;
          x.description = { pl: t, ua: "", en: "" };
        }
        return x;
      })
    );
  }
  if (Array.isArray(raw.barbers) && raw.barbers.length) {
    barbers.length = 0;
    barbers.push(...raw.barbers.map((b) => cloneBookingValue(b)));
  }

  if (raw.discount && typeof raw.discount === "object") {
    window.DOGMA_BOOKING_DISCOUNT = cloneBookingValue(raw.discount);
    if (typeof raw.discount.percent === "number") DISCOUNT_PERCENT = raw.discount.percent;
    if (Array.isArray(raw.discount.weekdays)) DISCOUNT_WEEKDAYS = [...raw.discount.weekdays];
    if (typeof raw.discount.startMinutes === "number") DISCOUNT_START_MINUTES = raw.discount.startMinutes;
    if (typeof raw.discount.endMinutes === "number") DISCOUNT_END_MINUTES = raw.discount.endMinutes;
  } else {
    window.DOGMA_BOOKING_DISCOUNT = null;
    DISCOUNT_PERCENT = DEFAULT_DISCOUNT_PERCENT;
    DISCOUNT_WEEKDAYS = [...DEFAULT_DISCOUNT_WEEKDAYS];
    DISCOUNT_START_MINUTES = DEFAULT_DISCOUNT_START_MINUTES;
    DISCOUNT_END_MINUTES = DEFAULT_DISCOUNT_END_MINUTES;
  }

  if (raw.openingHours && typeof raw.openingHours === "object") {
    window.DOGMA_BOOKING_OPENING_HOURS = cloneBookingValue(raw.openingHours);
  } else {
    window.DOGMA_BOOKING_OPENING_HOURS = null;
  }

  filterBookingBarbersBySiteVisibility();
  refreshBookingWizardLanguage();
  mergeBookingCatalogSnapshot();
  return true;
};

function mergeBookingCatalogSnapshot() {
  try {
    const admin = window.DOGMA_ADMIN_DATA;
    if (!admin || typeof admin !== "object") return;
    admin.bookingCatalog = {
      serviceCategories: serviceCategories.map((c) => ({ ...c })),
      services: services.map((s) => ({ ...s, bookingEnabled: true, visible: true })),
      barbers: barbers.map((b) => ({ ...b, bookingEnabled: true, visible: true }))
    };
  } catch (e) {
    /* ignore */
  }
}

(function mergeBookingCatalog() {
  mergeBookingCatalogSnapshot();
})();

refreshBookingWizardLanguage();
