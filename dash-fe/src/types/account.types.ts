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
  
  export interface UnapprovedRegion {
    region: string;
    capacity: number;
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