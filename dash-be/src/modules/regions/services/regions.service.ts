import { Injectable, Inject, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ApprovedRegionRepository } from '../repositories/approved-region.repository';
import { ApprovedRegionEntity } from '../entities/approved-region.entity';
import { ExcelService } from './excel.service';
import { LinodeClustersService } from './linode-clusters.service';
import { ClusterMetricsService } from './cluster-metrics.service';
import { ClusterMetricResponse, ClusterMetric } from '../../../common/interfaces/region.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountEntity } from '../../accounts/entities/account.entity';


import { 
  ApprovedRegion, 
  UnapprovedRegion, 
  AccountUnapprovedRegions,
} from '../../../common/interfaces/region.interface';
import { ProfileCapacity } from '../../../common/interfaces/region.interface';

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
    private readonly linodeClustersService: LinodeClustersService,
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
      this.logger.debug('Starting sync of approved regions');
      const excelData = await this.excelService.getApprovedRegions();
      this.logger.debug(`Processing ${excelData.length} records from Excel`);
      
      const validEntities: Partial<ApprovedRegionEntity>[] = [];

      for (const data of excelData) {
        try {
          const accountEntity = await this.accountRepository.findOne({ 
            where: { name: data.accountName } 
          });

          if (!accountEntity) {
            this.logger.warn(`Skipping record - Account not found: ${data.accountName}`);
            continue;
          }

          const totalCapacitySum = Object.values(data.total_capacity as ProfileCapacity)
            .reduce((sum: number, val: number) => sum + val, 0);

          const entity: Partial<ApprovedRegionEntity> = {
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
          };

          validEntities.push(entity);
        } catch (error) {
          this.logger.warn(`Error processing record for ${data.accountName}:`, error);
          continue;
        }
      }

      this.logger.debug(`Found ${validEntities.length} valid records to sync`);
      
      if (validEntities.length > 0) {
        // Clear existing records first
        await this.approvedRegionRepository.clear();
        
        // Save new records
        await this.approvedRegionRepository.save(validEntities);
        
        await this.invalidateCache();
        this.logger.debug('Sync completed successfully');
      } else {
        this.logger.warn('No valid records found to sync');
      }
    } catch (error) {
      this.logger.error('Error in syncApprovedRegions:', error);
      throw new Error(`Failed to sync approved regions: ${error.message}`);
    }
  }

  private async invalidateCache(): Promise<void> {
    await this.redisClient.del('approved_regions');
  }



  async getRegionComparison(): Promise<AccountRegionData[]> {
    const cached = await this.redisClient.get('approved_regions');
    if (cached) {
      return JSON.parse(cached);
    }

    const regions = await this.approvedRegionRepository.find({
      relations: ['account']
    });

    const accountRegions = regions.reduce((acc, region) => {
      if (!region.account) return acc;
      
      const accountName = region.account.name;
      if (!acc[accountName]) {
        acc[accountName] = [];
      }
      
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
    }, {} as Record<string, ApprovedRegion[]>);

    const result = Object.entries(accountRegions).map(([accountName, regions]) => ({
      accountName,
      regions
    }));

    await this.redisClient.set('approved_regions', JSON.stringify(result), 'EX', 3600);
    return result;
  }

  private async cacheRegions(regions: ApprovedRegionEntity[]): Promise<void> {
    await this.redisClient.set(
      'approved_regions',
      JSON.stringify(regions),
      'EX',
      3600
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


      const accountMetrics = this.groupMetricsByAccount(metricsResponse);


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

    const normalizeRegionName = (region: string): string => {
      return region.split(',')[0].trim();
    };


    const approvedCapacities = approvedRegions.reduce((acc: Record<string, number>, region) => {
      acc[region.region] = region.approved_capacity;
      return acc;
    }, {});


    const regionCounts = metrics.reduce((acc: Record<string, number>, cluster) => {
      const normalizedRegion = normalizeRegionName(cluster.region);
      acc[normalizedRegion] = (acc[normalizedRegion] || 0) + 1;
      return acc;
    }, {});


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