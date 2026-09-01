const UTM_STORAGE_KEY = "bad-advice-utm";

/** Params we forward from GradRight → app → download links */
const TRACKING_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export type TrackingParams = Partial<
  Record<(typeof TRACKING_KEYS)[number], string>
>;

export const APP_STORE_BASE_URL = "https://link.gradright.com/";

/** Fallback when sessionStorage is blocked (common in mobile iframes). */
let memoryTracking: TrackingParams = {};

function pickTrackingParams(source: URLSearchParams): TrackingParams {
  const picked: TrackingParams = {};
  for (const key of TRACKING_KEYS) {
    const value = source.get(key)?.trim();
    if (value) picked[key] = value;
  }
  return picked;
}

function readStoredTracking(): TrackingParams {
  if (Object.keys(memoryTracking).length > 0) {
    return { ...memoryTracking };
  }
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as TrackingParams;
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function storeTracking(params: TrackingParams) {
  if (Object.keys(params).length === 0) return;
  memoryTracking = { ...params };
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(params));
  } catch {
    // ignore quota / private mode
  }
}

/**
 * Capture UTMs from the current URL (passed by the GradRight iframe) and keep
 * them for the rest of the session so download links stay attributed.
 */
export function captureTrackingFromLocation(
  search: string = typeof window !== "undefined" ? window.location.search : "",
): TrackingParams {
  const fromUrl = pickTrackingParams(new URLSearchParams(search));
  if (Object.keys(fromUrl).length > 0) {
    storeTracking(fromUrl);
    return fromUrl;
  }
  return readStoredTracking();
}

/** Resolved tracking from URL/session only — no defaults for direct visits. */
export function getTrackingParams(): TrackingParams {
  return captureTrackingFromLocation();
}

/** Parse UTMs from any absolute URL (e.g. the download link at click time). */
export function parseTrackingFromUrl(href: string): TrackingParams {
  if (!href) return {};
  try {
    return pickTrackingParams(new URL(href).searchParams);
  } catch {
    return {};
  }
}

/** Prefer stored UTMs; fall back to the href being opened. */
export function resolveTrackingParams(href?: string): TrackingParams {
  const stored = getTrackingParams();
  if (Object.keys(stored).length > 0) return stored;
  return parseTrackingFromUrl(href ?? "");
}

/** App download URL with the same UTMs the user arrived with. */
export function getAppStoreUrl(tracking: TrackingParams = getTrackingParams()): string {
  const url = new URL(APP_STORE_BASE_URL);
  for (const key of TRACKING_KEYS) {
    const value = tracking[key];
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}
