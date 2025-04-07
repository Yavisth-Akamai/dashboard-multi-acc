import { Module } from '@nestjs/common';
import { RegionsService } from './services/regions.service';
import { ClusterMetricsService } from './services/cluster-metrics.service';
import { ExcelService } from './services/excel.service';
import { LinodeClustersService } from './services/linode-clusters.service';
import { RegionsController } from './controllers/regions.controller';
import { RedisModule } from '../../redis/redis.module';
import { HttpModule } from '@nestjs/axios'; 
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovedRegionEntity } from './entities/approved-region.entity';
import { ApprovedRegionRepository } from './repositories/approved-region.repository';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApprovedRegionEntity]),
    RedisModule,
    HttpModule,
    AccountsModule,
  ],
  providers: [
    RegionsService,
    ClusterMetricsService,
    ExcelService,
    LinodeClustersService,
    ApprovedRegionRepository,
  ],
  controllers: [RegionsController],
})
export class RegionsModule {}