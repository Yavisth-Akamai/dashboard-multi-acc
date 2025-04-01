import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RegionCapacityEntity } from './region-capacity.entity';
import { CreateRegionCapacityDto } from './dto/create-region-capacity.dto';

@Injectable()
export class RegionCapacityRepository extends Repository<RegionCapacityEntity> {
  constructor(private dataSource: DataSource) {
    super(RegionCapacityEntity, dataSource.createEntityManager());
  }

  async createRegionCapacity(
    createRegionCapacityDto: CreateRegionCapacityDto
  ): Promise<RegionCapacityEntity> {
    const regionCapacity = this.create(createRegionCapacityDto);
    return this.save(regionCapacity);
  }

  async getRegionCapacities(): Promise<RegionCapacityEntity[]> {
    return this.find();
  }
}