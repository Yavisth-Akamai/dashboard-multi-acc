export type AccountName = string;


export const formatAccountName = (name: AccountName): string => {
  const parts = name.split('_');
  return parts.length > 1 ? parts.slice(1).join('_') : name;
};


export {};