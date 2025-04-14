export interface ProfileCapacity {
  D: number;
  DHA: number;
  S: number;
  M: number;
  L: number;
}

export interface ApprovedRegion {
  region: string;
  year: string;
  total_capacity: ProfileCapacity;
  current_capacity: ProfileCapacity;
  available: ProfileCapacity;
  status: 'EXCEEDED' | 'AT_CAPACITY' | 'WITHIN_LIMIT';
}
  
  export interface ClusterMetric {
    name: string;
    region: string;
    status: string;
    created: string;
  }
  export interface AccountComparisonData {
    accountName: string;
    regions: ComparisonData[];
  }
  
  export interface AccountData {
    name: string;
    ha: boolean;
    totalCapacity: number;
    created: string;
    approvedRegions: ApprovedRegion[];
    unapprovedRegions: UnapprovedRegion[];
    clusterMetrics: ClusterMetric[];
  }

  export type ComparisonData = ApprovedRegion;

  export interface UnapprovedRegion {
    region: string;
    capacity: number;
  }
  
  export interface AccountUnapprovedRegions {
    accountName: string;
    unapprovedRegions: UnapprovedRegion[];
  }

  export interface Account {
    id: number;
    name: string;
    token: string;
    isActive: boolean;
    created_at: string;
  }

export interface ClusterMetric {
  name: string;
  region: string;
  status: string;
  created: string;
}

export interface ClusterMetricResponse {
  accountName: string;
  clusters: ClusterMetric[];
}
