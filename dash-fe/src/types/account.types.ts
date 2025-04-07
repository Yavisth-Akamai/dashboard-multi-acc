export interface ApprovedRegion {
    region: string;
    total_capacity: number;
    current_capacity: number;
    available: number;
    status: 'EXCEEDED' | 'AT_CAPACITY' | 'WITHIN_LIMIT';
  }
  
  export interface ClusterMetric {
    name: string;
    region: string;
    status: string;
    created: string;
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
  
  export interface ComparisonData {
    region: string;
    total_capacity: number;
    current_capacity: number;
    available: number;
    status: 'EXCEEDED' | 'AT_CAPACITY' | 'WITHIN_LIMIT';
  }

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
