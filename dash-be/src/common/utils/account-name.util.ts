import { ACCOUNT_NAME_MAPPINGS } from '../config/account-mapping.config';
export function normalizeAccountName(fullAccountName: string): string {
  const name = fullAccountName.trim();
  if (name.toLowerCase().endsWith('-poc')) {
    return name;
  }
  for (const mapping of ACCOUNT_NAME_MAPPINGS) {
    if (mapping.pattern.test(name)) {
      return mapping.transform;
    }
  }
  return 'unknown';
}