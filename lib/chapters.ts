export type ParsedChapter = {
  title: string;
  startSeconds: number;
  endSeconds: number;
  order: number;
};

function parseTimestampToSeconds(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;

  // Supports M:SS and H:MM:SS
  const parts = t.split(":");
  if (parts.length < 2 || parts.length > 3) return null;
  if (!parts.every((p) => /^\d{1,2}$/.test(p))) return null;

  const nums = parts.map((p) => parseInt(p, 10));

  if (nums.some((n) => Number.isNaN(n))) return null;
  if (parts.length === 2) {
    const [m, s] = nums;
    if (s >= 60) return null;
    return m * 60 + s;
  }

  const [h, m, s] = nums;
  if (m >= 60 || s >= 60) return null;
  return h * 3600 + m * 60 + s;
}

function cleanChapterTitle(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  // Remove common separators after timestamp
  return trimmed.replace(/^[\]\)\-–—•|:]+\s*/, "").trim();
}

export function parseChaptersFromDescription(input: {
  description: string;
  durationSeconds: number;
}): ParsedChapter[] {
  const description = input.description ?? "";
  const durationSeconds = Math.max(0, Math.floor(input.durationSeconds ?? 0));

  const lines = description.split(/\r\n?|\n/);
  const candidates: Array<{ startSeconds: number; title: string }> = [];

  for (const line of lines) {
    const raw = line.trim();
    if (!raw) continue;

    // Some descriptions put multiple timestamps on one line separated by '|'.
    const segments = raw.includes("|") ? raw.split("|") : [raw];

    for (const seg of segments) {
      const trimmed = seg.trim();
      if (!trimmed) continue;

      // Match patterns like:
      // - 0:00 Intro
      // 00:00 - Intro
      // 0:00-Intro
      // 0:00) Intro
      // 1:02:03  Something
      // We require timestamp near the start (optionally after a bullet).
      const m = trimmed.match(
        /^\s*(?:[-*•]\s*)?((?:\d{1,2}:)?\d{1,2}:\d{2})\s*([\]\)\-–—•|:]+\s*)?(.+)?$/
      );
      if (!m) continue;

      const ts = parseTimestampToSeconds(m[1]);
      if (ts == null) continue;

      const title = cleanChapterTitle(m[3] ?? "");
      if (!title) continue;

      candidates.push({ startSeconds: ts, title });
    }
  }

  // De-dupe by startSeconds (keep first seen after sorting)
  candidates.sort((a, b) => a.startSeconds - b.startSeconds);
  const unique: Array<{ startSeconds: number; title: string }> = [];
  const seen = new Set<number>();
  for (const c of candidates) {
    if (seen.has(c.startSeconds)) continue;
    if (durationSeconds > 0 && c.startSeconds >= durationSeconds) continue;
    seen.add(c.startSeconds);
    unique.push(c);
  }

  // Fix malformed/overlapping by ensuring strictly increasing start times
  const starts: Array<{ startSeconds: number; title: string }> = [];
  let last = -1;
  for (const c of unique) {
    if (c.startSeconds <= last) continue;
    starts.push(c);
    last = c.startSeconds;
  }

  if (starts.length === 0) return [];

  // Compute endSeconds from next start, final end from duration
  const chapters: ParsedChapter[] = [];
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i].startSeconds;
    const end =
      i < starts.length - 1 ? starts[i + 1].startSeconds : durationSeconds;
    if (durationSeconds > 0 && end <= start) continue;

    chapters.push({
      title: starts[i].title,
      startSeconds: start,
      endSeconds: durationSeconds > 0 ? end : start,
      order: chapters.length,
    });
  }

  // If we somehow ended up with 0 duration, still return ordered starts with end=start.
  return chapters;
}
