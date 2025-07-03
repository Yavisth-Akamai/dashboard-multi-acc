export function normalizeRegionName(raw: string): string {
  return raw
    .normalize('NFD')                    // split accents
    .replace(/[\u0300-\u036f]/g, '')     // remove accents
    .replace(/[^a-z0-9]/gi, '_')         // replace non-alphanumerics with _
    .replace(/_+/g, '_')                 // collapse multiple underscores
    .replace(/(^_+|_+$)/g, '')           // trim underscores
    .toLowerCase();
}
