// src/modules/regions/controllers/regions.controller.ts
import { Controller, Get, Post } from '@nestjs/common';
import { RegionsService } from '../services/regions.service';

@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Post('sync')
  async syncApprovedRegions() {
    return this.regionsService.syncApprovedRegions();
  }

  @Get('approved')
  async getApprovedRegions() {
    return this.regionsService.getApprovedRegions();
  }

  @Get('comparison')
  async getRegionComparison() {
    return this.regionsService.getRegionComparison();
  }
}