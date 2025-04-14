export interface AccountNamePattern {
  pattern: RegExp;
  transform: string;
}

export const ACCOUNT_NAME_MAPPINGS: AccountNamePattern[] = [
  {
    pattern: /^.*-devtest-team-az$/,
    transform: 'dt_az'
  },
  {
    pattern: /^.*-devtest-team-aws$/,
    transform: 'dt_aws'
  },
  {
    pattern: /^.*-e2e-team-az$/,
    transform: 'e2e_az'
  },
  {
    pattern: /^.*-e2e-team-aws$/,
    transform: 'e2e_aws'
  },
  {
    pattern: /^.*-dev-team-az$/,
    transform: 'dev_az'
  },
  {
    pattern: /^.*-dev-team-aws$/,
    transform: 'dev_aws'
  }
];