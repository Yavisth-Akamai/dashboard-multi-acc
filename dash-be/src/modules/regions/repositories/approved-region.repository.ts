import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ApprovedRegionEntity } from '../entities/approved-region.entity';

@Injectable()
export class ApprovedRegionRepository extends Repository<ApprovedRegionEntity> {
  constructor(private dataSource: DataSource) {
    super(ApprovedRegionEntity, dataSource.createEntityManager());
  }

  async bulkUpsert(regions: Partial<ApprovedRegionEntity>[]): Promise<ApprovedRegionEntity[]> {
    await this.createQueryBuilder().delete().execute();
    return this.save(regions);
  }
}