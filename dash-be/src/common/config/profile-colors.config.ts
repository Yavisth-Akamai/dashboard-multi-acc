export interface ProfileColorMapping {
    color: string;
    profile: string;
  }
  
  export const PROFILE_COLOR_MAPPINGS: ProfileColorMapping[] = [
    { color: '#cfe2f3', profile: 'D' },    // Light Blue 3
    { color: '#fce5cd', profile: 'DHA' },  // Light Orange 3
    { color: '#d9d2e9', profile: 'S' },    // Light Purple 3
    { color: '#ead1dc', profile: 'M' },    // Light Magenta 3
    { color: '#e6b8af', profile: 'L' },    // Light Red Berry 3
    { color: '#ffffff', profile: 'D' }     // White (default to D)
  ];
  