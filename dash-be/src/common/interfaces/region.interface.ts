export interface RegionCapacity {
    region: string;
    approved_capacity: number;
  }
  
  // Internal interface used for mapping (not exposed to FE)
  interface RegionWithSlug extends RegionCapacity {
    region_slug: string;
  }