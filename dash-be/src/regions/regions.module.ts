import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { RegionCapacityEntity } from './region-capacity.entity';
import { RegionCapacityRepository } from './regions.repository';
import { RegionsService } from './regions.service';
import { RegionsController } from './regions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([RegionCapacityEntity]),
    HttpModule
  ],
  controllers: [RegionsController],
  providers: [RegionCapacityRepository, RegionsService]
})
export class RegionsModule {}