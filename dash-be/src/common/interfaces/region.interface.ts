export interface RegionCapacity {
    region: string;
    approved_capacity: number;
  }
  

  interface RegionWithSlug extends RegionCapacity {
    region_slug: string;
  }