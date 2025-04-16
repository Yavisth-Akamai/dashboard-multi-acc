// dash-fe/src/config/profile-colors.config.ts

export interface ProfileColorMapping {
    color: string;
    profile: string;
  }
  
  export const PROFILE_COLOR_MAPPINGS: ProfileColorMapping[] = [
    { color: '#cfe2f3', profile: 'S' },    // Light Blue 3
    { color: '#fce5cd', profile: 'M' },    // Light Orange 3
    { color: '#d9d2e9', profile: 'L' },    // Light Purple 3
    { color: '#ead1dc', profile: 'DHA' },  // Light Magenta 3
    { color: '#e6b8af', profile: 'D' }     // Light Red Berry 3
  ];