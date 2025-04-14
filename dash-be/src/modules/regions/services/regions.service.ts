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

  async syncApprovedRegions(): Promise<void> {
    try {
      const excelData = await this.excelService.getApprovedRegions();
      const validEntities: Partial<ApprovedRegionEntity>[] = [];

      for (const data of excelData) {
        const accountEntity = await this.accountRepository.findOne({ 
          where: { name: data.accountName } 
        });

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

  async getRegionComparison(): Promise<AccountRegionData[]> {
    const cached = await this.redisClient.get('approved_regions');
    if (cached) return JSON.parse(cached);

    const regions = await this.approvedRegionRepository.find({
      relations: ['account']
    });

    const result = Object.entries(
      regions.reduce((acc, region) => {
        if (!region.account) return acc;
        
        const accountName = region.account.name;
        if (!acc[accountName]) acc[accountName] = [];
        
        acc[accountName].push({
          region: region.region,
          year: region.year,
          approved_capacity: region.approved_capacity,
          total_capacity: region.total_capacity,
          current_capacity: region.current_capacity,
          available: region.available,
          status: region.status
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
        .map(([accountName, metrics]) => ({
          accountName,
          unapprovedRegions: this.calculateUnapprovedRegions(approvedRegions, metrics)
        }));
    } catch (error) {
      throw error;
    }
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
      acc[region.region] = region.approved_capacity;
      return acc;
    }, {} as Record<string, number>);

    const regionCounts = metrics.reduce((acc, cluster) => {
      const region = cluster.region.split(',')[0].trim();
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(regionCounts)
      .map(([region, count]): UnapprovedRegion => ({
        region,
        capacity: count - (approvedCapacities[region] || 0)
      }))
      .filter(item => item.capacity > 0);
  }
}