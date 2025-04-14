export interface AccountNamePattern {
  pattern: RegExp;
  transform: string;
}

export const ACCOUNT_NAME_MAPPINGS: AccountNamePattern[] = [
  {
    pattern: /^akamai-cloudms-devtest-team-az$/,
    transform: 'dt_az'
  },
  {
    pattern: /^akamai-cloudms-devtest-team-aws$/,
    transform: 'dt_aws'
  },
  {
    pattern: /^akamai-cloudms-e2e-team-az$/,
    transform: 'e2e_az'
  },
  {
    pattern: /^akamai-cloudms-e2e-team-aws$/,
    transform: 'e2e_aws'
  },
  {
    pattern: /^akamai-cloudms-dev-team-az$/,
    transform: 'dev_az'
  },
  {
    pattern: /^akamai-cloudms-dev-team-aws$/,
    transform: 'dev_aws'
  }
];