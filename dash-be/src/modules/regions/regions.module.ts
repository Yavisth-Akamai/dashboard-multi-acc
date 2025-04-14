// dash-be/src/modules/regions/regions.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from '../../modules/accounts/entities/account.entity';
import { ApprovedRegionEntity } from './entities/approved-region.entity';
import { RegionsController } from './controllers/regions.controller';
import { RegionsService } from './services/regions.service';
import { ExcelService } from './services/excel.service';
import { ClusterMetricsService } from './services/cluster-metrics.service';
import { LinodeClustersService } from './services/linode-clusters.service';
import { ApprovedRegionRepository } from './repositories/approved-region.repository';
import { RedisModule } from '../../redis/redis.module';
import { HttpModule } from '@nestjs/axios';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApprovedRegionEntity, AccountEntity]),
    RedisModule,
    HttpModule,
    AccountsModule,
  ],
  providers: [
    RegionsService,
    ClusterMetricsService,
    ExcelService,
    LinodeClustersService,
  ],
  controllers: [RegionsController],
  exports: [RegionsService, ExcelService]
})
export class RegionsModule {}