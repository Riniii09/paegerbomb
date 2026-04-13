/**
 * Parses a page range string like "1-5, 8, 10-15"
 * Returns a sorted array of unique 1-based page numbers.
 */
export function parsePageRange(input: string, totalPages: number): number[] {
  if (!input || !input.trim()) return [];

  const pages = new Set<number>();
  const parts = input.split(",").map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-").map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (isNaN(start) || isNaN(end)) continue;
      const clampedStart = Math.max(1, Math.min(start, totalPages));
      const clampedEnd = Math.max(1, Math.min(end, totalPages));
      const from = Math.min(clampedStart, clampedEnd);
      const to = Math.max(clampedStart, clampedEnd);
      for (let i = from; i <= to; i++) {
        pages.add(i);
      }
    } else {
      const n = parseInt(part, 10);
      if (!isNaN(n) && n >= 1 && n <= totalPages) {
        pages.add(n);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

/**
 * Validates a page range string. Returns null if valid, error message if invalid.
 */
export function validatePageRange(input: string, totalPages: number): string | null {
  if (!input || !input.trim()) return null; // empty is valid (means use defaults)

  const parts = input.split(",").map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes("-")) {
      const segments = part.split("-");
      if (segments.length !== 2) return `Invalid range: "${part}"`;
      const [startStr, endStr] = segments.map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (isNaN(start) || isNaN(end)) return `Invalid range: "${part}"`;
      if (start < 1 || end < 1) return `Page numbers must be ≥ 1`;
      if (start > totalPages || end > totalPages)
        return `Page ${Math.max(start, end)} exceeds total (${totalPages})`;
    } else {
      const n = parseInt(part, 10);
      if (isNaN(n)) return `Invalid page number: "${part}"`;
      if (n < 1) return `Page numbers must be ≥ 1`;
      if (n > totalPages) return `Page ${n} exceeds total (${totalPages})`;
    }
  }

  return null;
}

/**
 * Given the set of pages that SHOULD get numbers, compute what label to show
 * on each page. Pages not in the numbered set get label null.
 *
 * If "restartOnSkip" is false (default): labels are contiguous from startNumber
 * skipping over excluded pages.
 */
export function buildPageLabels(
  totalPages: number,
  numberedPages: number[], // 1-based page numbers that get a label
  startNumber: number,
): Map<number, number> {
  const map = new Map<number, number>();
  let counter = startNumber;
  for (const pg of numberedPages) {
    if (pg >= 1 && pg <= totalPages) {
      map.set(pg, counter++);
    }
  }
  return map;
}
