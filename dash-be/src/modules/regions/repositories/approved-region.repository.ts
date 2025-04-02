import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ApprovedRegionEntity } from '../entities/approved-region.entity';

@Injectable()
export class ApprovedRegionRepository extends Repository<ApprovedRegionEntity> {
  constructor(private dataSource: DataSource) {
    super(ApprovedRegionEntity, dataSource.createEntityManager());
  }

  async bulkUpsert(regions: Partial<ApprovedRegionEntity>[]): Promise<ApprovedRegionEntity[]> {
    // Clear existing entries for the team
    await this.createQueryBuilder()
      .delete()
      .where('team = :team', { team: 'x-dev-team-az' })
      .execute();

    // Save new entries
    return this.save(regions);
  }
}