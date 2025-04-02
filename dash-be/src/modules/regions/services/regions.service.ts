import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Redis } from 'ioredis';
import { SheetsService } from './sheets.service';
import { ApprovedRegionRepository } from '../repositories/approved-region.repository';
import { ApprovedRegionEntity } from '../entities/approved-region.entity';

@Injectable()
export class RegionsService {
  constructor(
    private readonly sheetsService: SheetsService,
    @InjectRepository(ApprovedRegionRepository)
    private readonly approvedRegionRepository: ApprovedRegionRepository,
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis
  ) {}

  async syncApprovedRegions(): Promise<ApprovedRegionEntity[]> {
    const regions = await this.sheetsService.getApprovedRegions();
    const savedRegions = await this.approvedRegionRepository.bulkUpsert(regions);
    await this.cacheRegions(savedRegions);
    return savedRegions;
  }

  private async cacheRegions(regions: ApprovedRegionEntity[]): Promise<void> {
    const cacheData = regions.map(region => ({
      region: region.region,
      region_slug: region.region_slug,
      approved_capacity: region.approved_capacity
    }));

    await this.redisClient.set(
      'approved_regions', 
      JSON.stringify(cacheData), 
      'EX', 
      3600 // 1 hour
    );
  }

  async getApprovedRegions(): Promise<ApprovedRegionEntity[]> {
    const cachedRegions = await this.redisClient.get('approved_regions');
    if (cachedRegions) {
      return JSON.parse(cachedRegions);
    }

    const regions = await this.approvedRegionRepository.find({
      where: { team: 'x-dev-team-az' }
    });

    await this.cacheRegions(regions);
    return regions;
  }
}