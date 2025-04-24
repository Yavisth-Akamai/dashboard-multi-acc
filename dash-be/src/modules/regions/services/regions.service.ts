import { Injectable, Inject, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ApprovedRegionRepository } from '../repositories/approved-region.repository';
import { ApprovedRegionEntity } from '../entities/approved-region.entity';
import { ExcelService } from './excel.service';
import { ClusterMetricsService } from './cluster-metrics.service';
import { ClusterMetricResponse, ClusterMetric } from '../../../common/interfaces/region.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountEntity } from '../../accounts/entities/account.entity';
import { 
  ApprovedRegion, 
  UnapprovedRegion, 
  AccountUnapprovedRegions,
  ProfileCapacity 
} from '../../../common/interfaces/region.interface';

export interface AccountRegionData {
  accountName: string;
  regions: ApprovedRegion[];
}

@Injectable()
export class RegionsService {
  private readonly logger = new Logger(RegionsService.name); 

  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(ApprovedRegionEntity)
    private readonly approvedRegionRepository: ApprovedRegionRepository,
    private readonly excelService: ExcelService,
    private readonly clusterMetricsService: ClusterMetricsService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis
  ) {}

  private calculateStatus(total: ProfileCapacity, current: ProfileCapacity): 'EXCEEDED' | 'AT_CAPACITY' | 'WITHIN_LIMIT' {
    const totalSum = Object.values(total).reduce((sum: number, val: number) => sum + val, 0);
    const currentSum = Object.values(current).reduce((sum: number, val: number) => sum + val, 0);

    if (currentSum > totalSum) return 'EXCEEDED';
    if (currentSum === totalSum) return 'AT_CAPACITY';
    return 'WITHIN_LIMIT';
  }
  
  async getRegionComparison(): Promise<AccountRegionData[]> {
    console.log('Fetching region comparison data...');
    const cached = await this.redisClient.get('approved_regions');
    if (cached) return JSON.parse(cached);
  
    const [regions, clusterMetrics] = await Promise.all([
      this.approvedRegionRepository.find({
        relations: ['account']
      }),
      this.clusterMetricsService.getClusterMetrics()
    ]);

    
    const result = Object.entries(
      regions.reduce((acc, region) => {
        console.log('Processing region:', region.region);
        console.log('Region account:', region.account);
        if (!region.account) return acc;
        
        const accountName = region.account.name;
        if (!acc[accountName]) acc[accountName] = [];
        
        const accountMetrics = clusterMetrics.find(m => m.accountName === accountName);
        const regionClusters = accountMetrics ? 
          accountMetrics.clusters.filter(c => c.region.includes(region.region)) : 
          [];
        
        const current_capacity = this.calculateProfileTypeCounts(regionClusters);
        
        const available: ProfileCapacity = {
          D: Math.max(0, region.total_capacity.D - current_capacity.D),
          DHA: Math.max(0, region.total_capacity.DHA - current_capacity.DHA),
          S: Math.max(0, region.total_capacity.S - current_capacity.S),
          M: Math.max(0, region.total_capacity.M - current_capacity.M),
          L: Math.max(0, region.total_capacity.L - current_capacity.L)
        };
        
        const status = this.calculateStatus(region.total_capacity, current_capacity);
        
        acc[accountName].push({
          region: region.region,
          year: region.year,
          approved_capacity: region.approved_capacity,
          total_capacity: region.total_capacity,
          current_capacity,
          available,
          status
        });
        return acc;
      }, {} as Record<string, ApprovedRegion[]>)
    ).map(([accountName, regions]) => ({
      accountName,
      regions
    }));
  
    await this.redisClient.set('approved_regions', JSON.stringify(result), 'EX', 3600);
    return result;
  }
  

  async syncApprovedRegions(): Promise<void> {
    try {
      const excelData = await this.excelService.getApprovedRegions();
      const validEntities: Partial<ApprovedRegionEntity>[] = [];

      for (const data of excelData) {
        const accountEntity = await this.accountRepository.findOne({ 
          where: { name: data.accountName } 
        });
        console.log('Trying to find account for:', data.accountName);

        if (!accountEntity) continue;

        const totalCapacitySum = Object.values(data.total_capacity as ProfileCapacity)
          .reduce((sum: number, val: number) => sum + val, 0);

        validEntities.push({
          region: data.region as string,
          year: data.year as string,
          approved_capacity: totalCapacitySum,
          total_capacity: data.total_capacity as ProfileCapacity,
          current_capacity: data.current_capacity as ProfileCapacity,
          available: data.available as ProfileCapacity,
          status: this.calculateStatus(
            data.total_capacity as ProfileCapacity,
            data.current_capacity as ProfileCapacity
          ),
          account: accountEntity
        });
      }

      if (validEntities.length > 0) {
        await this.approvedRegionRepository.clear();
        await this.approvedRegionRepository.save(validEntities);
        await this.invalidateCache();
      }
    } catch (error) {
      throw new Error(`Failed to sync approved regions: ${error.message}`);
    }
  }

  private async invalidateCache(): Promise<void> {
    await this.redisClient.del('approved_regions');
  }

  async getApprovedRegions(): Promise<ApprovedRegionEntity[]> {
    const cached = await this.redisClient.get('approved_regions');
    if (cached) return JSON.parse(cached);
    
    const regions = await this.approvedRegionRepository.find();
    await this.redisClient.set('approved_regions', JSON.stringify(regions), 'EX', 3600);
    return regions;
  }

  async getUnapprovedRegions(): Promise<AccountUnapprovedRegions[]> {
    try {
      const [approvedRegions, metricsResponse] = await Promise.all([
        this.getApprovedRegions(),
        this.clusterMetricsService.getClusterMetrics()
      ]);
  
      return Object.entries(this.groupMetricsByAccount(metricsResponse))
        .map(([accountName, metrics]) => {
          try {
            const unapprovedRegions = this.calculateUnapprovedRegions(
              approvedRegions.filter(r => r.account?.name === accountName), 
              metrics
            );
            
            return {
              accountName,
              unapprovedRegions
            };
          } catch (error) {
            this.logger.error(`Error processing unapproved regions for account ${accountName}:`, error);
            return {
              accountName,
              unapprovedRegions: []
            };
          }
        });
    } catch (error) {
      this.logger.error('Error in getUnapprovedRegions:', error);
      return [];
    }
  }
  private calculateProfileTypeCounts(clusters: ClusterMetric[]): ProfileCapacity {
    const counts: ProfileCapacity = { D: 0, DHA: 0, S: 0, M: 0, L: 0 };
    
    clusters.forEach(cluster => {
      if (cluster.profileType) {
        counts[cluster.profileType]++;
      } else {
        counts.D++;
      }
    });
    
    return counts;
  }
    

  private groupMetricsByAccount(metricsResponse: ClusterMetricResponse[]): Record<string, ClusterMetric[]> {
    return metricsResponse.reduce((acc, response) => {
      acc[response.accountName] = response.clusters;
      return acc;
    }, {} as Record<string, ClusterMetric[]>);
  }

  private calculateUnapprovedRegions(
    approvedRegions: ApprovedRegionEntity[],
    metrics: ClusterMetric[]
  ): UnapprovedRegion[] {
    const approvedCapacities = approvedRegions.reduce((acc, region) => {
      if (!acc[region.region]) {
        acc[region.region] = { ...region.total_capacity };
      } else {
        Object.keys(region.total_capacity).forEach(profile => {
          const p = profile as keyof ProfileCapacity;
          acc[region.region][p] += region.total_capacity[p];
        });
      }
      return acc;
    }, {} as Record<string, ProfileCapacity>);
  
    const regionProfiles = metrics.reduce((acc, cluster) => {
      const region = cluster.region.split(',')[0].trim();
      
      if (!acc[region]) {
        acc[region] = { D: 0, DHA: 0, S: 0, M: 0, L: 0 };
      }
      
      if (cluster.profileType) {
        acc[region][cluster.profileType]++;
      } else {
        acc[region].D++;
      }
      
      return acc;
    }, {} as Record<string, ProfileCapacity>);
  
    const result: UnapprovedRegion[] = [];
    
    Object.entries(regionProfiles).forEach(([region, profileCount]) => {
      const approvedCapacity = approvedCapacities[region] || { D: 0, DHA: 0, S: 0, M: 0, L: 0 };
      
      Object.entries(profileCount).forEach(([profile, count]) => {
        const p = profile as keyof ProfileCapacity;
        const excess = count - (approvedCapacity[p] || 0);
        
        if (excess > 0) {
          result.push({
            region,
            capacity: excess,
            profile: p
          });
        }
      });
    });
    
    return result;
  }
  
}