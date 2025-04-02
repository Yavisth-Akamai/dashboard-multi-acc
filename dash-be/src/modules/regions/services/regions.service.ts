import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ApprovedRegionRepository } from '../repositories/approved-region.repository';
import { ApprovedRegionEntity } from '../entities/approved-region.entity';
import { ExcelService } from './excel.service';

@Injectable()
export class RegionsService {
  constructor(
    private readonly excelService: ExcelService,
    private readonly approvedRegionRepository: ApprovedRegionRepository,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis
  ) {}

  // Sync regions from Excel to database and cache
  async syncApprovedRegions(): Promise<ApprovedRegionEntity[]> {
    const regions = await this.excelService.getApprovedRegions();
    const savedRegions = await this.approvedRegionRepository.bulkUpsert(regions);
    await this.cacheRegions(savedRegions);
    return savedRegions;
  }

  // Cache regions in Redis
  private async cacheRegions(regions: ApprovedRegionEntity[]): Promise<void> {
    const cacheData = regions.map(region => ({
      region: region.region,
    //   region_slug: region.region_slug,
      approved_capacity: region.approved_capacity
    }));
    
    await this.redisClient.set(
      'approved_regions',
      JSON.stringify(cacheData),
      'EX',
      3600  // 1 hour expiration
    );
  }

  // Get regions (from cache if available, otherwise from database)
  async getApprovedRegions(): Promise<ApprovedRegionEntity[]> {
    const cached = await this.redisClient.get('approved_regions');
    if (cached) {
      return JSON.parse(cached);
    }

    const regions = await this.approvedRegionRepository.find();
    await this.cacheRegions(regions);
    return regions;
  }
}