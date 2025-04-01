import { Injectable } from '@nestjs/common';
import { RegionCapacityRepository } from './regions.repository';
import { CreateRegionCapacityDto } from './dto/create-region-capacity.dto';
import { RegionCapacityEntity } from './region-capacity.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RegionsService {
  constructor(
    private regionCapacityRepository: RegionCapacityRepository,
    private httpService: HttpService
  ) {}

  async createRegionCapacity(
    createRegionCapacityDto: CreateRegionCapacityDto
  ): Promise<RegionCapacityEntity> {
    return this.regionCapacityRepository.createRegionCapacity(
      createRegionCapacityDto
    );
  }

  async getRegionCapacities(): Promise<RegionCapacityEntity[]> {
    return this.regionCapacityRepository.getRegionCapacities();
  }

  async getLinodeInstances(): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get('https://api.linode.com/v4/linode/instances', {
          headers: {
            Authorization: `Bearer ${process.env.LINODE_API_TOKEN}`
          }
        })
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching Linode instances:', error);
      throw error;
    }
  }

  async checkRegionCompliance(): Promise<any> {
    const approvedRegions = await this.getRegionCapacities();
    const instances = await this.getLinodeInstances();

    const regionUsage = instances.data.reduce((acc, instance) => {
      const region = instance.region;
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {});

    return approvedRegions.map(approvedRegion => {
      const currentUsage = regionUsage[approvedRegion.region] || 0;
      return {
        region: approvedRegion.region,
        approved_capacity: approvedRegion.approved_capacity,
        current_usage: currentUsage,
        status: 
          currentUsage > approvedRegion.approved_capacity 
            ? 'EXCEEDED' 
            : currentUsage === approvedRegion.approved_capacity 
              ? 'AT_CAPACITY' 
              : 'WITHIN_LIMIT'
      };
    });
  }
}