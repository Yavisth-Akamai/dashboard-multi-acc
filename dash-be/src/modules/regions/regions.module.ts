import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegionsController } from './controllers/regions.controller';
import { RegionsService } from './services/regions.service';
import { SheetsService } from './services/excel.service';
import { ApprovedRegionEntity } from './entities/approved-region.entity';
import { ApprovedRegionRepository } from './repositories/approved-region.repository';
import { RedisModule } from '../../redis/redis.module'; // Import RedisModule

@Module({
imports: [
TypeOrmModule.forFeature([ApprovedRegionEntity]),
RedisModule,
],
controllers: [RegionsController],
providers: [
RegionsService,
SheetsService,
ApprovedRegionRepository,
],
exports: [RegionsService],
})
export class RegionsModule {}