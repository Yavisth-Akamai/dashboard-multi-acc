import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovedRegionEntity } from './entities/approved-region.entity';
import { ApprovedRegionRepository } from './repositories/approved-region.repository';
import { RegionsService } from './services/regions.service';
import { SheetsService } from './services/sheets.service';
import { RegionsController } from './controllers/regions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApprovedRegionEntity])
  ],
  controllers: [RegionsController],
  providers: [
    RegionsService, 
    SheetsService, 
    ApprovedRegionRepository
  ],
  exports: [RegionsService]
})
export class RegionsModule {}