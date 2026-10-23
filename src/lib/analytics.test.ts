import { describe, expect, it } from "vitest";
import { initAnalytics, sanitizeRef, streakBucket, track, trackPageview } from "./analytics";

describe("sanitizeRef", () => {
  it("acepta etiquetas de campaña sencillas, en minúsculas", () => {
    expect(sanitizeRef("TikTok_Oct-26")).toBe("tiktok_oct-26");
    expect(sanitizeRef("  compartir ")).toBe("compartir");
  });
  it("rechaza todo lo demás", () => {
    for (const bad of ["", "a b", "<script>", "x".repeat(33), "ñandú", "a/b", "a?b=1", null, undefined, 5]) {
      expect(sanitizeRef(bad)).toBeNull();
    }
  });
});

describe("streakBucket", () => {
  it("agrupa la racha en tramos gruesos", () => {
    expect([0, 1, 2, 3, 6, 7, 40].map(streakBucket)).toEqual(["0", "1", "2", "3-6", "3-6", "7+", "7+"]);
  });
  it("tolera valores raros", () => {
    expect(streakBucket(-3)).toBe("0");
    expect(streakBucket(Number.NaN)).toBe("0");
    expect(streakBucket(2.9)).toBe("2");
  });
});

describe("sin configuración", () => {
  it("no hace nada, ni falla, ni toca el documento", () => {
    // Sin VITE_UMAMI_* (y sin DOM) todo son no-ops
    expect(() => { initAnalytics(); trackPageview(); track("partida_iniciada", { modo: "classic" }); }).not.toThrow();
  });
});
