console.log("🚀 COPY1 SERVER STARTED");

import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { google } from "googleapis";
import axios from "axios";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const TIMEZONE = process.env.TIMEZONE || "Europe/Warsaw";
const CONTACT_PHONE = process.env.CONTACT_PHONE || "792897149";
const OWNER_NOTIFICATION_PHONE = process.env.OWNER_NOTIFICATION_PHONE || "";
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "primary";

const requiredEnv = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REFRESH_TOKEN",
  "GOOGLE_CALENDAR_ID"
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const BARBERS = {
  tymur: {
    id: "tymur",
    name: "Tymur",
    aliases: ["tymur", "тимур"]
  },
  dima: {
    id: "dima",
    name: "Dima",
    aliases: ["dima", "дима", "dmitriy", "dmitri", "дмитрий"]
  },
  vlad: {
    id: "vlad",
    name: "Vlad",
    aliases: ["vlad", "влад", "volodymyr", "vladimir"]
  }
};

function parseDuration(durationText) {
  if (!durationText || typeof durationText !== "string") {
    throw new Error("Invalid duration format");
  }

  const normalized = durationText.trim().toLowerCase();
  let totalMinutes = 0;

  const hourMatch = normalized.match(/(\d+)\s*h/);
  const minuteMatch = normalized.match(/(\d+)\s*min/);

  if (hourMatch) totalMinutes += Number(hourMatch[1]) * 60;
  if (minuteMatch) totalMinutes += Number(minuteMatch[1]);

  if (!hourMatch && !minuteMatch && /^\d+$/.test(normalized)) {
    totalMinutes = Number(normalized);
  }

  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) {
    throw new Error(`Unable to parse duration: ${durationText}`);
  }

  return totalMinutes;
}

function parseDateParts(dateStr) {
  const [year, month, day] = String(dateStr).split("-").map(Number);

  if (!year || !month || !day) {
    throw new Error("Invalid date format. Expected YYYY-MM-DD");
  }

  return { year, month, day };
}

function parseTimeParts(timeStr) {
  const [hour, minute] = String(timeStr).split(":").map(Number);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw new Error("Invalid time format. Expected HH:MM");
  }

  return { hour, minute };
}

function getTimeZoneOffsetMinutes(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset"
  });

  const parts = formatter.formatToParts(date);
  const timeZoneName = parts.find((part) => part.type === "timeZoneName")?.value || "GMT+0";

  const match = timeZoneName.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);

  if (!match) return 0;

  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2] || 0);
  const minutes = Number(match[3] || 0);

  return sign * (hours * 60 + minutes);
}

function getUtcDateFromTimeZoneLocal(dateStr, timeStr, timeZone = TIMEZONE) {
  const { year, month, day } = parseDateParts(dateStr);
  const { hour, minute } = parseTimeParts(timeStr);

  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offsetMinutes = getTimeZoneOffsetMinutes(utcGuess, timeZone);

  return new Date(utcGuess.getTime() - offsetMinutes * 60 * 1000);
}

function formatTimeInTimeZone(date, timeZone = TIMEZONE) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
}

function formatDateTimeForGoogle(date, timeZone = TIMEZONE) {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(date);

  const get = (type) => parts.find((part) => part.type === type)?.value || "";

  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}`;
}

function buildDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) {
    throw new Error("Date and time are required");
  }

  return getUtcDateFromTimeZoneLocal(dateStr, timeStr, TIMEZONE);
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function normalizeSmsPhone(phone) {
  const cleaned = String(phone || "").replace(/\s/g, "");

  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("48")) return `+${cleaned}`;

  return `+48${cleaned}`;
}

function formatSmsDate(dateStr) {
  const [year, month, day] = String(dateStr).split("-");
  if (!year || !month || !day) return dateStr;
  return `${day}.${month}.${year}`;
}

function createOAuthClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });

  return oauth2Client;
}

function getCalendarClient() {
  const oauth2Client = createOAuthClient();
  return google.calendar({ version: "v3", auth: oauth2Client });
}

async function getTokenOwnerEmail() {
  try {
    const auth = createOAuthClient();
    const oauth2 = google.oauth2({
      version: "v2",
      auth
    });

    const userInfo = await oauth2.userinfo.get();
    return userInfo.data.email || null;
  } catch (error) {
    console.error("Failed to get token owner email:", error.response?.data || error.message);
    return null;
  }
}

function getBarberConfig(barberId) {
  const barber = BARBERS[barberId];

  if (!barber) {
    const error = new Error("Nieprawidłowy barber");
    error.statusCode = 400;
    throw error;
  }

  return barber;
}

function getEventSearchText(event) {
  return [
    event.summary || "",
    event.description || "",
    event.location || ""
  ]
    .join(" ")
    .toLowerCase();
}

function detectBarberFromEvent(event) {
  const haystack = getEventSearchText(event);

  for (const barber of Object.values(BARBERS)) {
    const matched = barber.aliases.some((alias) => haystack.includes(alias.toLowerCase()));
    if (matched) return barber.id;
  }

  return null;
}

function isEventForBarber(event, barberId) {
  return detectBarberFromEvent(event) === barberId;
}

function getWeekday(dateStr) {
  return new Date(`${dateStr}T00:00:00`).getDay();
}

function getWorkingHoursForDate(dateStr) {
  const day = getWeekday(dateStr);

  if (day === 0) {
    return { openHour: 10, closeHour: 18 };
  }

  return { openHour: 10, closeHour: 20 };
}

function validateBusinessRules(dateStr, timeStr, durationMinutes) {
  const { openHour, closeHour } = getWorkingHoursForDate(dateStr);
  const { hour, minute } = parseTimeParts(timeStr);

  const startMinutes = hour * 60 + minute;
  const endMinutes = startMinutes + durationMinutes;

  if (startMinutes < openHour * 60 || startMinutes >= closeHour * 60) {
    const error = new Error(
      `Dostępne godziny rezerwacji: ${String(openHour).padStart(2, "0")}:00–${String(closeHour).padStart(2, "0")}:00`
    );
    error.statusCode = 400;
    throw error;
  }

  if (endMinutes > closeHour * 60) {
    const error = new Error(
      `Wybrana usługa nie mieści się w godzinach pracy ${String(openHour).padStart(2, "0")}:00–${String(closeHour).padStart(2, "0")}:00`
    );
    error.statusCode = 400;
    throw error;
  }
}

function formatCalendarDescription(payload) {
  return [
    "Źródło: Rezerwacja przez stronę",
    `BarberTag: ${payload.barberId}`,
    `Barber: ${payload.barberName}`,
    `Imię: ${payload.name}`,
    `Telefon: ${payload.phone}`,
    `Usługa: ${payload.serviceName}`,
    `Data: ${payload.date}`,
    `Godzina: ${payload.time}`,
    `Czas trwania: ${payload.serviceDuration}`,
    `Cena: ${payload.servicePrice}`
  ].join("\n");
}

function buildBookingSummary(payload) {
  return `[WWW][${payload.barberName}] ${payload.serviceName} - ${payload.name}`;
}

async function sendSMS({ phone, message }) {
  if (!process.env.SMSAPI_TOKEN) {
    console.warn("SMSAPI_TOKEN is missing. SMS skipped.");
    return;
  }

  try {
    await axios.post(
      "https://api.smsapi.pl/sms.do",
      null,
      {
        params: {
          to: normalizeSmsPhone(phone),
          message,
          from: process.env.SMS_SENDER || "DOGMA",
          format: "json"
        },
        headers: {
          Authorization: `Bearer ${process.env.SMSAPI_TOKEN}`
        }
      }
    );
  } catch (error) {
    console.error("SMS error:", error.response?.data || error.message);
  }
}

function buildBookingSms(payload) {
  return [
    "DOGMA BARBERSHOP:",
    "Twoja rezerwacja została potwierdzona.",
    `Data: ${formatSmsDate(payload.date)}`,
    `Godzina: ${payload.time}`,
    `Usługa: ${payload.serviceName}`,
    `Barber: ${payload.barberName}`,
    `Kontakt: ${CONTACT_PHONE}`
  ].join("\n");
}

function buildOwnerBookingSms(payload) {
  return [
    "DOGMA BARBERSHOP",
    "Nowa rezerwacja:",
    `Klient: ${payload.name}`,
    `Telefon: ${payload.phone}`,
    `Usługa: ${payload.serviceName}`,
    `Barber: ${payload.barberName}`,
    `Data: ${formatSmsDate(payload.date)}`,
    `Godzina: ${payload.time}`,
    `Cena: ${payload.servicePrice}`
  ].join("\n");
}

async function getEventsForDay(dateStr) {
  if (!dateStr) {
    throw new Error("Date is required");
  }

  console.log("=== GET EVENTS FOR DAY ===");
  console.log("GOOGLE_CALENDAR_ID:", GOOGLE_CALENDAR_ID);
  console.log("DATE:", dateStr);
  console.log("TIMEZONE:", TIMEZONE);

  const calendar = getCalendarClient();

  const dayStart = getUtcDateFromTimeZoneLocal(dateStr, "00:00", TIMEZONE);
  const dayEnd = getUtcDateFromTimeZoneLocal(dateStr, "23:59", TIMEZONE);

  const response = await calendar.events.list({
    calendarId: GOOGLE_CALENDAR_ID,
    timeMin: dayStart.toISOString(),
    timeMax: dayEnd.toISOString(),
    singleEvents: true,
    orderBy: "startTime"
  });

  return response.data.items || [];
}

function overlaps(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

function eventOverlapsSlot(event, startDate, endDate) {
  const existingStart = new Date(event.start.dateTime).getTime();
  const existingEnd = new Date(event.end.dateTime).getTime();
  return overlaps(startDate.getTime(), endDate.getTime(), existingStart, existingEnd);
}

function getBusyIntervalsForBarber(events, barberId) {
  return events
    .filter((event) => event.status !== "cancelled")
    .filter((event) => event.start?.dateTime && event.end?.dateTime)
    .filter((event) => isEventForBarber(event, barberId))
    .map((event) => ({
      start: formatTimeInTimeZone(new Date(event.start.dateTime), TIMEZONE),
      end: formatTimeInTimeZone(new Date(event.end.dateTime), TIMEZONE),
      summary: event.summary || ""
    }));
}

function generateBaseSlotsForDate(dateStr, durationMinutes) {
  const { openHour, closeHour } = getWorkingHoursForDate(dateStr);
  const slots = [];
  const lastStartMinutes = closeHour * 60 - durationMinutes;

  for (let minutes = openHour * 60; minutes <= lastStartMinutes; minutes += 30) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    slots.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
  }

  return slots;
}

function getFreeBarbersForSlot(events, dateStr, timeStr, durationMinutes) {
  const startDate = buildDateTime(dateStr, timeStr);
  const endDate = addMinutes(startDate, durationMinutes);

  return Object.values(BARBERS).filter((barber) => {
    const busyForBarber = events
      .filter((event) => event.status !== "cancelled")
      .filter((event) => event.start?.dateTime && event.end?.dateTime)
      .filter((event) => isEventForBarber(event, barber.id))
      .some((event) => eventOverlapsSlot(event, startDate, endDate));

    return !busyForBarber;
  });
}

function getRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

async function getAvailabilityForAuto(dateStr, durationMinutes) {
  const events = await getEventsForDay(dateStr);
  const baseSlots = generateBaseSlotsForDate(dateStr, durationMinutes);

  const availableSlots = baseSlots.filter((time) => {
    const freeBarbers = getFreeBarbersForSlot(events, dateStr, time, durationMinutes);
    return freeBarbers.length > 0;
  });

  return {
    availableSlots,
    workingHours: getWorkingHoursForDate(dateStr)
  };
}

async function createEvent(payload) {
  const calendar = getCalendarClient();

  const durationMinutes = parseDuration(payload.serviceDuration);
  validateBusinessRules(payload.date, payload.time, durationMinutes);

  const existingEvents = await getEventsForDay(payload.date);

  let resolvedBarberId = payload.barberId;
  let resolvedBarberName = payload.barberName;

  if (payload.barberId === "auto") {
    const freeBarbers = getFreeBarbersForSlot(
      existingEvents,
      payload.date,
      payload.time,
      durationMinutes
    );

    if (!freeBarbers.length) {
      const error = new Error("Brak wolnych barberów na wybraną godzinę");
      error.statusCode = 400;
      throw error;
    }

    const selectedBarber = getRandomItem(freeBarbers);
    resolvedBarberId = selectedBarber.id;
    resolvedBarberName = selectedBarber.name;
  } else {
    getBarberConfig(payload.barberId);
  }

  const startDate = buildDateTime(payload.date, payload.time);
  const endDate = addMinutes(startDate, durationMinutes);

  const busyEventsForBarber = existingEvents
    .filter((item) => item.status !== "cancelled")
    .filter((item) => item.start?.dateTime && item.end?.dateTime)
    .filter((item) => isEventForBarber(item, resolvedBarberId))
    .filter((item) => eventOverlapsSlot(item, startDate, endDate));

  if (busyEventsForBarber.length > 0) {
    const error = new Error("Ten termin jest już zajęty u wybranego barbera");
    error.statusCode = 400;
    throw error;
  }

  const resolvedPayload = {
    ...payload,
    barberId: resolvedBarberId,
    barberName: resolvedBarberName
  };

  const event = {
    summary: buildBookingSummary(resolvedPayload),
    description: formatCalendarDescription(resolvedPayload),
    start: {
      dateTime: `${resolvedPayload.date}T${resolvedPayload.time}:00`,
      timeZone: TIMEZONE
    },
    end: {
      dateTime: formatDateTimeForGoogle(endDate, TIMEZONE),
      timeZone: TIMEZONE
    }
  };

  const response = await calendar.events.insert({
    calendarId: GOOGLE_CALENDAR_ID,
    requestBody: event
  });

  return {
    createdEvent: response.data,
    resolvedPayload
  };
}

app.get("/api/health", async (_req, res) => {
  const credentialsReady = missingEnv.length === 0;
  const tokenOwnerEmail = credentialsReady ? await getTokenOwnerEmail() : null;

  res.json({
    ok: true,
    service: "DOGMA booking backend",
    credentialsReady,
    missingEnv,
    timezone: TIMEZONE,
    calendarIdConfigured: Boolean(process.env.GOOGLE_CALENDAR_ID),
    calendarIdUsed: GOOGLE_CALENDAR_ID,
    smsEnabled: Boolean(process.env.SMSAPI_TOKEN),
    ownerNotificationEnabled: Boolean(OWNER_NOTIFICATION_PHONE),
    mode: "single-calendar-auto-assignment",
    tokenOwnerEmail
  });
});

app.get("/api/debug-calendar", async (_req, res) => {
  try {
    if (missingEnv.length > 0) {
      return res.status(500).json({
        ok: false,
        error: `Missing env variables: ${missingEnv.join(", ")}`
      });
    }

    const calendar = getCalendarClient();
    const tokenOwnerEmail = await getTokenOwnerEmail();
    const result = await calendar.calendarList.list();

    return res.json({
      ok: true,
      tokenOwnerEmail,
      currentCalendarId: GOOGLE_CALENDAR_ID,
      calendars: (result.data.items || []).map((item) => ({
        id: item.id,
        summary: item.summary,
        primary: Boolean(item.primary),
        accessRole: item.accessRole || null
      }))
    });
  } catch (error) {
    console.error("Debug calendar error:", error.response?.data || error.message);

    return res.status(error.response?.status || 500).json({
      ok: false,
      error: error.response?.data?.error?.message || error.message || "Debug calendar failed",
      details: error.response?.data || null
    });
  }
});

app.get("/api/availability", async (req, res) => {
  try {
    if (missingEnv.length > 0) {
      return res.status(500).json({
        ok: false,
        error: `Missing env variables: ${missingEnv.join(", ")}`
      });
    }

    const date = String(req.query.date || "").trim();
    const barberId = String(req.query.barberId || "").trim();
    const durationMinutes = Number(req.query.durationMinutes || 0);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        ok: false,
        error: "Query param 'date' must be in format YYYY-MM-DD"
      });
    }

    if (!barberId) {
      return res.status(400).json({
        ok: false,
        error: "Query param 'barberId' is required"
      });
    }

    if (barberId === "auto") {
      if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
        return res.status(400).json({
          ok: false,
          error: "Query param 'durationMinutes' must be a positive number"
        });
      }

      const result = await getAvailabilityForAuto(date, durationMinutes);

      return res.json({
        ok: true,
        date,
        barberId: "auto",
        timeZone: TIMEZONE,
        calendarId: GOOGLE_CALENDAR_ID,
        availableSlots: result.availableSlots,
        workingHours: result.workingHours
      });
    }

    getBarberConfig(barberId);

    const events = await getEventsForDay(date);
    const busy = getBusyIntervalsForBarber(events, barberId);

    return res.json({
      ok: true,
      date,
      barberId,
      timeZone: TIMEZONE,
      calendarId: GOOGLE_CALENDAR_ID,
      busy,
      workingHours: getWorkingHoursForDate(date)
    });
  } catch (error) {
    console.error("Availability error message:", error.message);
    console.error("Availability error response:", error.response?.data);
    console.error("Calendar ID used:", GOOGLE_CALENDAR_ID);

    return res.status(error.statusCode || error.response?.status || 500).json({
      ok: false,
      error: error.response?.data?.error?.message || error.message || "Internal server error",
      googleDetails: error.response?.data || null,
      calendarIdUsed: GOOGLE_CALENDAR_ID
    });
  }
});

app.post("/api/book", async (req, res) => {
  try {
    if (missingEnv.length > 0) {
      return res.status(500).json({
        ok: false,
        error: `Missing env variables: ${missingEnv.join(", ")}`
      });
    }

    const {
      name,
      phone,
      serviceName,
      serviceDuration,
      servicePrice,
      barberName,
      barberId,
      date,
      time
    } = req.body || {};

    const requiredFields = {
      name,
      phone,
      serviceName,
      serviceDuration,
      servicePrice,
      barberId,
      date,
      time
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => !value || String(value).trim() === "")
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        ok: false,
        error: `Missing required fields: ${missingFields.join(", ")}`
      });
    }

    const payload = {
      name: String(name).trim(),
      phone: String(phone).trim(),
      serviceName: String(serviceName).trim(),
      serviceDuration: String(serviceDuration).trim(),
      servicePrice: String(servicePrice).trim(),
      barberName: String(barberName || "").trim(),
      barberId: String(barberId).trim(),
      date: String(date).trim(),
      time: String(time).trim()
    };

    if (payload.barberId !== "auto") {
      if (!payload.barberName) {
        return res.status(400).json({
          ok: false,
          error: "Missing required field: barberName"
        });
      }

      getBarberConfig(payload.barberId);
    }

    const { createdEvent, resolvedPayload } = await createEvent(payload);

    await sendSMS({
      phone: resolvedPayload.phone,
      message: buildBookingSms(resolvedPayload)
    });

    if (OWNER_NOTIFICATION_PHONE) {
      await sendSMS({
        phone: OWNER_NOTIFICATION_PHONE,
        message: buildOwnerBookingSms(resolvedPayload)
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Booking saved to Google Calendar",
      eventId: createdEvent.id,
      eventLink: createdEvent.htmlLink,
      resolvedBarberId: resolvedPayload.barberId,
      resolvedBarberName: resolvedPayload.barberName
    });
  } catch (error) {
    console.error("Booking error:", error.message);
    console.error("Booking error response:", error.response?.data);

    return res.status(error.statusCode || error.response?.status || 500).json({
      ok: false,
      error: error.response?.data?.error?.message || error.message || "Internal server error",
      googleDetails: error.response?.data || null,
      calendarIdUsed: GOOGLE_CALENDAR_ID
    });
  }
});

app.get("/api/test-calendar", async (_req, res) => {
  try {
    const calendar = getCalendarClient();

    const meta = await calendar.calendars.get({
      calendarId: GOOGLE_CALENDAR_ID
    });

    return res.json({
      ok: true,
      calendarId: GOOGLE_CALENDAR_ID,
      summary: meta.data.summary,
      timeZone: meta.data.timeZone
    });
  } catch (error) {
    console.error("TEST CALENDAR ERROR:", error.response?.data || error.message);

    return res.status(error.response?.status || 500).json({
      ok: false,
      error: error.response?.data?.error?.message || error.message,
      details: error.response?.data || null,
      calendarIdUsed: GOOGLE_CALENDAR_ID
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`DOGMA booking app running on port ${PORT}`);
  console.log("PORT:", PORT);
  console.log("TIMEZONE:", TIMEZONE);
  console.log("GOOGLE_CALENDAR_ID:", GOOGLE_CALENDAR_ID);
  console.log("SMS ENABLED:", Boolean(process.env.SMSAPI_TOKEN));
});
