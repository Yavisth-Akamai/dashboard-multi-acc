import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ApprovedRegionRepository } from '../repositories/approved-region.repository';
import { ApprovedRegionEntity } from '../entities/approved-region.entity';
import { ExcelService } from './excel.service';
import { LinodeClustersService } from './linode-clusters.service';
import { ClusterMetricsService } from './cluster-metrics.service';
import { ClusterMetricResponse, ClusterMetric } from '../../../common/interfaces/region.interface';

// Add interfaces for type safety
import { 
  ApprovedRegion, 
  UnapprovedRegion, 
  AccountUnapprovedRegions,
} from '../../../common/interfaces/region.interface';

@Injectable()
export class RegionsService {
  constructor(
    private readonly excelService: ExcelService,
    private readonly approvedRegionRepository: ApprovedRegionRepository,
    private readonly linodeClustersService: LinodeClustersService,
    private readonly clusterMetricsService: ClusterMetricsService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis
  ) {}

  async syncApprovedRegions(): Promise<ApprovedRegionEntity[]> {
    const regions = await this.excelService.getApprovedRegions();
    const savedRegions = await this.approvedRegionRepository.bulkUpsert(regions);
    await this.cacheRegions(savedRegions);
    return savedRegions;
  }

  private async cacheRegions(regions: ApprovedRegionEntity[]): Promise<void> {
    await this.redisClient.set(
      'approved_regions',
      JSON.stringify(regions),
      'EX',
      3600 // 1 hour
    );
  }

  async getApprovedRegions(): Promise<ApprovedRegionEntity[]> {
    const cached = await this.redisClient.get('approved_regions');
    if (cached) {
      return JSON.parse(cached);
    }
    const regions = await this.approvedRegionRepository.find();
    await this.cacheRegions(regions);
    return regions;
  }

  async getRegionComparison() {
    const [approvedRegions, clusterRegionsByAccount] = await Promise.all([
      this.getApprovedRegions(),
      this.linodeClustersService.getClusterRegions()
    ]);
  
    // Get all accounts that have cluster data
    const accountNames = Object.keys(clusterRegionsByAccount);
  
    // For each account, calculate its region comparison
    return accountNames.map(accountName => {
      const accountRegions = clusterRegionsByAccount[accountName] || {};
      
      const regions = approvedRegions.map(approved => {
        const simplifiedRegion = this.simplifyRegionName(approved.region);
        const current: number = Number(accountRegions[simplifiedRegion] || 0);
        const available: number = Math.max(approved.approved_capacity - current, 0);
  
        return {
          region: approved.region,
          total_capacity: approved.approved_capacity,
          current_capacity: current,
          available,
          status: this.determineStatus(current, approved.approved_capacity)
        };
      });
  
      return {
        accountName,
        regions
      };
    });
  }

  private simplifyRegionName(fullName: string): string {
    const match = fullName.match(/^([^,]+)/);
    if (match) {
      return match[1].trim().replace(/\s+/g, '_');
    }
    return fullName;
  }
  
  private determineStatus(current: number, approved: number): string {
    if (current > approved) return 'EXCEEDED';
    if (current === approved) return 'AT_CAPACITY';
    return 'WITHIN_LIMIT';
  }

  async getUnapprovedRegions(): Promise<AccountUnapprovedRegions[]> {
    try {
      const [approvedRegions, metricsResponse] = await Promise.all([
        this.getApprovedRegions(),
        this.clusterMetricsService.getClusterMetrics()
      ]);

      // Transform the metrics response into account-grouped clusters
      const accountMetrics = this.groupMetricsByAccount(metricsResponse);

      // Calculate unapproved regions for each account
      const unapprovedByAccount = Object.entries(accountMetrics).map(([accountName, metrics]) => {
        const unapprovedRegions = this.calculateUnapprovedRegions(
          approvedRegions,
          metrics
        );

        return {
          accountName,
          unapprovedRegions
        };
      });

      return unapprovedByAccount;
    } catch (error) {
      console.error('Error calculating unapproved regions:', error);
      throw error;
    }
  }

  private groupMetricsByAccount(metricsResponse: ClusterMetricResponse[]): Record<string, ClusterMetric[]> {
    return metricsResponse.reduce((acc: Record<string, ClusterMetric[]>, response) => {
      acc[response.accountName] = response.clusters;
      return acc;
    }, {});
  }


  private calculateUnapprovedRegions(
    approvedRegions: ApprovedRegionEntity[],
    metrics: ClusterMetric[]
  ): UnapprovedRegion[] {
    // Helper function to normalize region names
    const normalizeRegionName = (region: string): string => {
      return region.split(',')[0].trim();
    };

    // Create a map of approved regions and their capacities
    const approvedCapacities = approvedRegions.reduce((acc: Record<string, number>, region) => {
      acc[region.region] = region.approved_capacity;
      return acc;
    }, {});

    // Count clusters per normalized region
    const regionCounts = metrics.reduce((acc: Record<string, number>, cluster) => {
      const normalizedRegion = normalizeRegionName(cluster.region);
      acc[normalizedRegion] = (acc[normalizedRegion] || 0) + 1;
      return acc;
    }, {});

    // Calculate unapproved (excess) capacity
    return Object.entries(regionCounts)
      .map(([region, count]): UnapprovedRegion => {
        const approvedCapacity = approvedCapacities[region] || 0;
        const excessCapacity = count - approvedCapacity;
        return {
          region,
          capacity: excessCapacity
        };
      })
      .filter(item => item.capacity > 0);
  }
}