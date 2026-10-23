// Anonymous, cookie-less analytics (self-hosted Umami).
//
// - Nothing loads unless VITE_UMAMI_URL and VITE_UMAMI_WEBSITE_ID are set at build time.
// - Nothing is stored on the visitor's device: `?ref=` lives in memory for the life of the tab.
// - Browser "Do Not Track" is honoured by the tracker.
// - Events carry no identifiers and no personal data.

export type EventData = Record<string, string | number | boolean>;

interface UmamiTracker {
  track: (arg?: string | ((props: Record<string, unknown>) => Record<string, unknown>), data?: EventData) => void;
}

declare global {
  interface Window { umami?: UmamiTracker }
}

/** Campaign tag from `?ref=`: lower-case letters, digits, `_` and `-`, up to 32 characters. */
export function sanitizeRef(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim().toLowerCase();
  return /^[a-z0-9_-]{1,32}$/.test(v) ? v : null;
}

/** How many days in a row the player has been coming back, in coarse buckets (a retention proxy). */
export function streakBucket(streak: number): "0" | "1" | "2" | "3-6" | "7+" {
  const n = Math.max(0, Math.floor(Number(streak) || 0));
  if (n === 0) return "0";
  if (n === 1) return "1";
  if (n === 2) return "2";
  return n < 7 ? "3-6" : "7+";
}

const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
const SRC = env.VITE_UMAMI_URL?.replace(/\/+$/, "");
const WEBSITE_ID = env.VITE_UMAMI_WEBSITE_ID;
const DOMAINS = env.VITE_UMAMI_DOMAINS;

let ref: string | null = null;
let ready = false;
let started = false;
const pending: Array<() => void> = [];

const enabled = () => Boolean(SRC && WEBSITE_ID && typeof document !== "undefined");

function run(fn: () => void) {
  if (ready) fn();
  else pending.push(fn);
}

/** Loads the tracker once (client only) and sends the first page view with the campaign tag. */
export function initAnalytics(): void {
  if (started || !enabled()) return;
  started = true;
  ref = sanitizeRef(new URLSearchParams(window.location.search).get("ref"));
  const s = document.createElement("script");
  s.defer = true;
  s.src = `${SRC}/script.js`;
  s.dataset.websiteId = WEBSITE_ID!;
  s.dataset.autoTrack = "false"; // page views are sent by us so they can carry the campaign tag
  s.dataset.doNotTrack = "true";
  if (DOMAINS) s.dataset.domains = DOMAINS;
  s.onload = () => {
    ready = true;
    pending.splice(0).forEach((fn) => fn());
  };
  document.head.appendChild(s);
  trackPageview();
}

/** A page view, tagged with the campaign when there is one. */
export function trackPageview(): void {
  if (!enabled()) return;
  run(() => {
    window.umami?.track((props) => (ref ? { ...props, data: { ref } } : props));
  });
}

/** A named event. No-op when analytics is not configured. */
export function track(name: string, data: EventData = {}): void {
  if (!enabled()) return;
  run(() => {
    window.umami?.track(name, ref ? { ...data, ref } : data);
  });
}
