
export function normalizeAccountName(raw: string): string {
  const patterns: { regex: RegExp; transform: string }[] = [
    { regex: /^akamai-cloudms-devtest-team-az$/, transform: 'dt_az' },
    { regex: /^akamai-cloudms-devtest-team-aws$/, transform: 'dt_aws' },
    { regex: /^akamai-cloudms-e2e-team-az$/, transform: 'e2e_az' },
    { regex: /^akamai-cloudms-e2e-team-aws$/, transform: 'e2e_aws' },
    { regex: /^akamai-cloudms-dev-team-az$/, transform: 'dev_az' },
    { regex: /^akamai-cloudms-dev-team-aws$/, transform: 'dev_aws' },
  ];

  const matched = patterns.find(p => p.regex.test(raw.trim()));
  return matched ? matched.transform : raw.split('-').slice(1).join('_').toLowerCase();
  
}
