/**
 * Merge DB snapshot with repo template file so empty PostgreSQL rows
 * do not wipe gallery/barbers/booking data that still exists in data/site-content.json.
 */

export function isNonEmptyArray(v) {
  return Array.isArray(v) && v.length > 0;
}

const ARRAY_KEYS = [
  "bioGallery",
  "bioDesktopPreview",
  "worksGallery",
  "effectPhotos",
  "effectVideos",
  "vibeGallery",
  "barbers",
  "landingServices"
];

/**
 * @param {Record<string, unknown>} emptyTemplate
 * @param {Record<string, unknown>|null|undefined} fileData
 * @param {Record<string, unknown>|null|undefined} dbData
 */
export function mergeFileFallbackForPostgres(emptyTemplate, fileData, dbData) {
  const e = emptyTemplate && typeof emptyTemplate === "object" ? emptyTemplate : {};
  const f = fileData && typeof fileData === "object" ? fileData : {};
  const d = dbData && typeof dbData === "object" ? dbData : {};

  const out = { ...e, ...f, ...d };

  for (const k of ARRAY_KEYS) {
    const dv = d[k];
    const fv = f[k];
    if (!isNonEmptyArray(dv) && isNonEmptyArray(fv)) {
      out[k] = fv;
    }
  }

  const dbBc = d.bookingConfig;
  const fBc = f.bookingConfig;
  if (
    (!dbBc || typeof dbBc !== "object" || !isNonEmptyArray(dbBc.services)) &&
    fBc &&
    typeof fBc === "object" &&
    isNonEmptyArray(fBc.services)
  ) {
    out.bookingConfig = fBc;
  }

  const dbH = d.landingHero;
  const fH = f.landingHero;
  if (
    (!dbH || typeof dbH !== "object" || !String(dbH.image || "").trim()) &&
    fH &&
    typeof fH === "object" &&
    String(fH.image || "").trim()
  ) {
    out.landingHero = {
      ...(e.landingHero && typeof e.landingHero === "object" ? e.landingHero : {}),
      ...fH,
      ...(dbH && typeof dbH === "object" ? dbH : {})
    };
  }

  patchEmptyLocaleFieldsFromFile(out.contacts, f.contacts);
  patchEmptyLocaleFieldsFromFile(out.socials, f.socials);

  return out;
}

/** Fill empty string / empty nested locale strings from file when DB had placeholders only. */
function patchEmptyLocaleFieldsFromFile(target, fileObj) {
  if (!target || typeof target !== "object" || !fileObj || typeof fileObj !== "object") return;
  for (const k of Object.keys(fileObj)) {
    const fv = fileObj[k];
    const dv = target[k];
    if (fv && typeof fv === "object" && !Array.isArray(fv) && (dv == null || typeof dv === "object")) {
      const inner = dv && typeof dv === "object" ? { ...dv } : {};
      for (const lk of Object.keys(fv)) {
        const fvv = fv[lk];
        const dvv = inner[lk];
        if (typeof fvv === "string" && String(dvv || "").trim() === "" && String(fvv).trim() !== "") {
          inner[lk] = fvv;
        }
      }
      target[k] = inner;
      continue;
    }
    if (typeof fv === "string" && String(dv || "").trim() === "" && String(fv).trim() !== "") {
      target[k] = fv;
    }
  }
}

/**
 * Block save when multiple critical lists are wiped at once (typical failed admin load).
 * One section cleared intentionally → allowed (wipe count 1).
 * @param {Record<string, unknown>} body
 * @param {Record<string, unknown>} mergedCurrent
 */
export function isDestructiveContentSave(body, mergedCurrent) {
  if (!body || typeof body !== "object") return true;

  const keys = ["worksGallery", "barbers", "landingServices"];
  let wipe = 0;
  for (const key of keys) {
    const curN = Array.isArray(mergedCurrent[key]) ? mergedCurrent[key].length : 0;
    const nextN = Array.isArray(body[key]) ? body[key].length : 0;
    if (curN > 0 && nextN === 0) wipe++;
  }
  const curSvc =
    mergedCurrent.bookingConfig && typeof mergedCurrent.bookingConfig === "object" && Array.isArray(mergedCurrent.bookingConfig.services)
      ? mergedCurrent.bookingConfig.services.length
      : 0;
  const nextSvc =
    body.bookingConfig && typeof body.bookingConfig === "object" && Array.isArray(body.bookingConfig.services)
      ? body.bookingConfig.services.length
      : 0;
  if (curSvc > 0 && nextSvc === 0) wipe++;

  return wipe >= 2;
}
