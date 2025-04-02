import { Controller, Get, Post } from '@nestjs/common';
import { RegionsService } from '../services/regions.service';

@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Post('sync')  // Endpoint: POST /regions/sync
  async syncApprovedRegions() {
    return this.regionsService.syncApprovedRegions();
  }

  @Get('approved')  // Endpoint: GET /regions/approved
  async getApprovedRegions() {
    return this.regionsService.getApprovedRegions();
  }
}