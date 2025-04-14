import { Controller, Get, Post } from '@nestjs/common';
import { RegionsService, AccountRegionData} from '../services/regions.service';
import { ClusterMetricsService } from '../services/cluster-metrics.service';
import { AccountUnapprovedRegions } from '../../../common/interfaces/region.interface';
import { AccountEntity } from '../../accounts/entities/account.entity';
import { ExcelService } from '../services/excel.service';
import { AccountsService } from '../../accounts/accounts.service';
import { Repository } from 'typeorm';


@Controller('regions')
export class RegionsController {
  constructor(
    private readonly regionsService: RegionsService,
    private readonly accountsService: AccountsService,
    private readonly clusterMetricsService: ClusterMetricsService,
    private readonly excelService: ExcelService,

  ) {}

  @Get('test-connection')
  async testConnection() {
    return { message: 'Backend is connected!' };
  }

  @Get('accounts')
  async getAccounts() {
    return this.accountsService.getAccounts();
  }
  
  @Get('test-excel')
  async testExcelReading() {
    return this.excelService.getApprovedRegions();
  }

  @Post('sync')
  async syncApprovedRegions(): Promise<{ message: string }> {
    await this.regionsService.syncApprovedRegions();
    return { message: 'Regions synchronized successfully' };
  }

  @Get('comparison')
  async getRegionComparison(): Promise<AccountRegionData[]> {
    return this.regionsService.getRegionComparison();
  }

  @Get('approved')
  async getApprovedRegions() {
    return this.regionsService.getApprovedRegions();
  }

  @Get('metrics')
  async getClusterMetrics() {
    return this.clusterMetricsService.getClusterMetrics();
  }
  
  @Get('unapproved')
  async getUnapprovedRegions(): Promise<AccountUnapprovedRegions[]> {
    return this.regionsService.getUnapprovedRegions();
  }
}