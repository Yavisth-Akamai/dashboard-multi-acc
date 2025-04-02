export const REGION_MAPPING = {
    // North America
    'Atlanta, GA': 'us-southeast',
    'Chicago, IL': 'us-ord',
    'Dallas, TX': 'us-central',
    'Fremont, CA': 'us-west',
    'Los Angeles, CA': 'us-lax',
    'Miami, FL': 'us-mia',
    'Newark, NJ': 'us-east',
    'Seattle, WA': 'us-sea',
    'Washington, D.C.': 'us-iad',
    'Toronto, Canada': 'ca-central',
  
    // Europe
    'Stockholm, SE': 'se-sto',
    'Amsterdam, NL': 'nl-ams',
    'Milan, IT': 'it-mil',
    'London, UK': 'eu-west',
    'London, UK Expansion': 'gb-lon',
    'Paris, FR': 'fr-par',
    'Madrid, ES': 'es-mad',
    'Frankfurt, DE': 'eu-central',
    'Frankfurt, DE Expansion': 'de-fra-2',
  
    // Asia
    'Singapore, SP': 'ap-south',
    'Singapore Expansion, SP': 'sg-sin-2',
    'Osaka, JP': 'jp-osa',
    'Tokyo, JP': 'ap-northeast',
    'Tokyo Expansion, JP': 'jp-tyo-3',
    'Chennai, IN': 'in-maa',
    'Mumbai, IN': 'ap-west',
    'Mumbai Expansion, IN': 'in-bom-2',
    'Jakarta, ID': 'id-cgk',
  
    // South America
    'São Paulo, BR': 'br-gru',
  
    // Oceania
    'Melbourne, AU': 'au-mel',
    'Sydney, AU': 'ap-southeast'
  };
  
  // Reverse mapping for easy lookup
  export const SLUG_TO_REGION = Object.fromEntries(
    Object.entries(REGION_MAPPING).map(([key, value]) => [value, key])
  );