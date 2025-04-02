import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ApprovedRegionRepository } from '../repositories/approved-region.repository';
import { ApprovedRegionEntity } from '../entities/approved-region.entity';
import { ExcelService } from './excel.service';
import { LinodeClustersService } from './linode-clusters.service';

@Injectable()
export class RegionsService {
  constructor(
    private readonly excelService: ExcelService,
    private readonly approvedRegionRepository: ApprovedRegionRepository,
    private readonly linodeClustersService: LinodeClustersService,
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
    const [approvedRegions, clusterRegions] = await Promise.all([
      this.getApprovedRegions(),
      this.linodeClustersService.getClusterRegions()
    ]);

    return approvedRegions.map(approved => {
      const current = clusterRegions[approved.region] || 0;
      const available = approved.approved_capacity - current;

      return {
        region: approved.region,
        total_capacity: approved.approved_capacity,
        current_capacity: current,
        available: available,
        status: this.determineStatus(current, approved.approved_capacity)
      };
    });
  }

  private determineStatus(current: number, approved: number): string {
    if (current > approved) return 'EXCEEDED';
    if (current === approved) return 'AT_CAPACITY';
    return 'WITHIN_LIMIT';
  }
}