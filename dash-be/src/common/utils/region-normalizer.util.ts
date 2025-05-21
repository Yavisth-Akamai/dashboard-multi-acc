export function normalizeRegionName(raw: string): string {
  if (!raw) return 'unknown';

  return raw
    .normalize('NFD')                    // decompose accents
    .replace(/[\u0300-\u036f]/g, '')     // strip diacritics
    .replace(/[^\w\s]/g, '')             // remove punctuation
    .trim()
    .replace(/\s+/g, '_')                // spaces → underscores
    .toLowerCase();
}