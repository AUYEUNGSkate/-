const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid"
]);

export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    for (const key of Array.from(parsed.searchParams.keys())) {
      if (TRACKING_PARAMS.has(key.toLowerCase())) parsed.searchParams.delete(key);
    }
    parsed.hostname = parsed.hostname.toLowerCase();
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url.trim();
  }
}

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function titleSimilarity(left: string, right: string): number {
  const a = new Set(titleTokens(left));
  const b = new Set(titleTokens(right));
  if (a.size === 0 || b.size === 0) return 0;
  const intersection = Array.from(a).filter((token) => b.has(token)).length;
  const union = new Set([...a, ...b]).size;
  return intersection / union;
}

export function isWithinHours(date: string, hours: number): boolean {
  const time = new Date(date).getTime();
  if (Number.isNaN(time)) return true;
  return Date.now() - time <= hours * 60 * 60 * 1000;
}

function titleTokens(title: string): string[] {
  const normalized = normalizeTitle(title);
  const wordTokens = normalized.split(" ").filter((token) => token.length > 1);
  const cjkChars = Array.from(normalized.replace(/\s+/g, "")).filter((char) => /\p{Script=Han}/u.test(char));
  const cjkBigrams: string[] = [];
  for (let index = 0; index < cjkChars.length - 1; index += 1) {
    cjkBigrams.push(`${cjkChars[index]}${cjkChars[index + 1]}`);
  }
  return [...wordTokens, ...cjkBigrams];
}
