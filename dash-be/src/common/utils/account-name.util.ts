import { ACCOUNT_NAME_MAPPINGS } from '../config/account-mapping.config';

export function normalizeAccountName(fullAccountName: string): string {
  for (const mapping of ACCOUNT_NAME_MAPPINGS) {
    if (mapping.pattern.test(fullAccountName)) {
      return mapping.transform;
    }
  }
  return 'unknown';
}
 
