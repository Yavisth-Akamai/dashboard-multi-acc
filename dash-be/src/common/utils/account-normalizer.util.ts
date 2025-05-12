export function normalizeAccountName(raw: string): string {
  const cleaned = raw.trim().toLowerCase();

  const patterns: { regex: RegExp; transform: string }[] = [
    { regex: /^akamai-cloudms-devtest-team-az$/, transform: 'dt_az' },
    { regex: /^akamai-cloudms-devtest-team-aws$/, transform: 'dt_aws' },
    { regex: /^akamai-cloudms-e2e-team-az$/, transform: 'e2e_az' },
    { regex: /^akamai-cloudms-e2e-team-aws$/, transform: 'e2e_aws' },
    { regex: /^akamai-cloudms-dev-team-az$/, transform: 'dev_az' },
    { regex: /^akamai-cloudms-dev-team-aws$/, transform: 'dev_aws' },
    { regex: /^[a-z0-9]+-poc$/, transform: 'poc' },
    { regex: /^[a-z0-9]+-[a-z0-9]+-poc$/, transform: 'poc' }
  ];

  const matched = patterns.find(p => p.regex.test(cleaned));
  if (matched) return matched.transform;

  return cleaned;
}
