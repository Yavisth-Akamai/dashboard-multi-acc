import { Controller, Get, Post } from '@nestjs/common';
import { RegionsService } from '../services/regions.service';
import { ClusterMetricsService } from '../services/cluster-metrics.service';

@Controller('regions')
export class RegionsController {
  constructor(
    private readonly regionsService: RegionsService,
    private readonly clusterMetricsService: ClusterMetricsService
  ) {}

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
  
  @Get('metrics')
  async getClusterMetrics() {
    return this.clusterMetricsService.getClusterMetrics();
  }
}