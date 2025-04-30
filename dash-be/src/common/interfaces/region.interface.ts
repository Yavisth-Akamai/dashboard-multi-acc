export interface UnapprovedRegion {
  region: string;
  capacity: number;
  profile?: keyof ProfileCapacity;
}
export interface ProfileCapacity {
  D: number;
  DHA: number;
  S: number;
  M: number;
  L: number;
}
export interface ExcelRow {
  [key: number]: string | null;
  length: number;
}
export interface ExcelData {
  accountName: string;
  region: string;
  year: string;
  total_capacity: ProfileCapacity;
  current_capacity: ProfileCapacity;
  available: ProfileCapacity;
}
export interface ApprovedRegion {
  region: string;
  year: string;
  approved_capacity: number;
  total_capacity: ProfileCapacity;
  current_capacity: ProfileCapacity;
  available: ProfileCapacity;
  status: 'EXCEEDED' | 'AT_CAPACITY' | 'WITHIN_LIMIT';
}
export interface AccountUnapprovedRegions {
  accountName: string;
  unapprovedRegions: UnapprovedRegion[];
}

export interface ClusterMetric {
  region: string;
  name: string;
  status: string;
  created: string;
  id?: number;
  pools?: any[];
  totalNodeCount?: number;
  profileType?: 'D' | 'DHA' | 'S' | 'M' | 'L';
}

export interface RegionCapacity {
  region: string;
  approved_capacity: number;
}

export interface ClusterMetricResponse {
  accountName: string;
  clusters: ClusterMetric[];
}
export interface ProfileCapacity {
  D: number;
  DHA: number;
  S: number;
  M: number;
  L: number;
}

export interface AccountRegionData {
  accountName: string;
  regions: ApprovedRegion[];
}