const REGION_PREFIX_REGEX = /^(us|ca|uk|br|de|fr|in|jp|au|nl|se|it|es|id|sg)[,\s]+/i;

const REGION_SUFFIX_WORDS = [
  'us','ca','uk','br','de','fr','in','jp','au','nl','se','it','es','id','sg',
  'nj','ga','tx','wa','fl','il','dc','sp','on',
  'brazil','india','germany','japan','australia','canada','france','netherlands','sweden','italy','spain'
];

// Regex to trim standalone trailing suffix words (e.g. ", NJ", "Brazil")
const REGION_SUFFIX_REGEX = new RegExp(`[\\s,._-]*\\b(${REGION_SUFFIX_WORDS.join('|')})\\b\\s*$`, 'i');

export function normalizeRegionName(raw: string): string {
  if (!raw) return 'unknown';

  const cleaned = raw
    .normalize('NFD')                    // decompose accents
    .replace(/[\u0300-\u036f]/g, '')    // strip diacritics
    .replace(REGION_PREFIX_REGEX, '')   // remove leading country codes
    .replace(REGION_SUFFIX_REGEX, '')   // remove only valid trailing words
    .replace(/[^\w\s]/g, '')            // strip punctuation
    .trim()
    .replace(/\s+/g, '_')               // spaces → underscores
    .toLowerCase();

  if (cleaned.includes('london') && /expan|2/.test(cleaned)) {
    return 'london_2';
  }

  return cleaned;
}
