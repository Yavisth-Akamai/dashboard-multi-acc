const COUNTRY_SUFFIX_REGEX = /[,\s]+(fr|us|uk|de|br|in|cn|ru|jp|au|ca|es|it|nl|se|ch|ae|kr|za|fl)$/i;

export function normalizeRegionName(raw: string): string {
  if (!raw) return 'unknown';

  return raw
    .replace(COUNTRY_SUFFIX_REGEX, '')   // strip known country or state suffixes
    .normalize('NFD')                    // decompose accents
    .replace(/[\u0300-\u036f]/g, '')     // strip diacritics
    .replace(/[^\w\s]/g, '')             // remove punctuation
    .trim()
    .replace(/\s+/g, '_')                // spaces → underscores
    .toLowerCase();
}
