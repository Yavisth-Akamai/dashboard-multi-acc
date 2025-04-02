import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovedRegionEntity } from './entities/approved-region.entity';
import { ApprovedRegionRepository } from './repositories/approved-region.repository';
import { RegionsService } from './services/regions.service';
import { ExcelService } from './services/excel.service';
import { RegionsController } from './controllers/regions.controller';
import { RedisModule } from '../../redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApprovedRegionEntity]),
    RedisModule,
  ],
  controllers: [RegionsController],
  providers: [
    RegionsService,
    ExcelService,
    ApprovedRegionRepository,
  ],
  exports: [RegionsService],
})
export class RegionsModule {}