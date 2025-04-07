export interface ApprovedRegion {
  region: string;
  approved_capacity: number;
}

export interface UnapprovedRegion {
  region: string;
  capacity: number;
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
}

export interface RegionCapacity {
  region: string;
  approved_capacity: number;
}

export interface ClusterMetricResponse {
  accountName: string;
  clusters: ClusterMetric[];
}