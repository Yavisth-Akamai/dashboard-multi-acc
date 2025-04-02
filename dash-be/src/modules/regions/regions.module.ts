import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ApprovedRegionEntity } from './entities/approved-region.entity';
import { ApprovedRegionRepository } from './repositories/approved-region.repository';
import { RegionsService } from './services/regions.service';
import { ExcelService } from './services/excel.service';
import { LinodeClustersService } from './services/linode-clusters.service';
import { ClusterMetricsService } from './services/cluster-metrics.service';
import { RegionsController } from './controllers/regions.controller';
import { RedisModule } from '../../redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApprovedRegionEntity]),
    HttpModule,
    RedisModule,
  ],
  controllers: [RegionsController],
  providers: [
    RegionsService,
    ExcelService,
    LinodeClustersService,
    ClusterMetricsService,
    ApprovedRegionRepository,
  ],
  exports: [RegionsService],
})
export class RegionsModule {}