export type AccountName = string;

export const formatAccountName = (name: AccountName): string => {
  return name;
};

export const formatRegionName = (key: string): string => {
  if (!key) return '';

  const parts = key.split('_').filter(Boolean);

  const countryCodes = ['br','ca','in','jp','au','se','nl','it','uk','fr','es','de','sg','us'];
  let country = '';
  let mainParts = parts;
  const last = parts[parts.length - 1].toLowerCase();

  if (countryCodes.includes(last)) {
    country = last.toUpperCase();
    mainParts = parts.slice(0, -1);
  }

  const name = mainParts
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return country ? `${name}, ${country}` : name;
};

export {};
