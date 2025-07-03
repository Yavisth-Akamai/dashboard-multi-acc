// File: dash-be/src/modules/regions/controllers/regions.controller.ts

import { Controller, Get, Post, Logger } from '@nestjs/common';
import { RegionsService } from '../services/regions.service';
import { AccountsService } from '../../accounts/accounts.service';
import { ClusterMetricsService } from '../services/cluster-metrics.service';
import { ExcelService } from '../services/excel.service';
import { ApprovedRegionEntity } from '../entities/approved-region.entity';
import { AccountUnapprovedRegions } from '../../../common/interfaces/region.interface';
import * as XLSX from 'xlsx';
import { HttpException, HttpStatus } from '@nestjs/common';

@Controller('regions')
export class RegionsController {
  private readonly logger = new Logger(RegionsController.name);

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
  async syncApprovedRegions() {
    await this.regionsService.syncApprovedRegions();
    return { message: 'Regions synchronized successfully' };
  }

  @Get('comparison')
  async getRegionComparison() {
    return this.regionsService.getRegionComparison();
  }

  @Get('approved')
  async getApprovedRegions(): Promise<ApprovedRegionEntity[]> {
    return this.regionsService.getApprovedRegions();
  }

  @Get('metrics')
  async getClusterMetrics() {
    return this.clusterMetricsService.getClusterMetrics();
  }

  @Get('unapproved')
  async getUnapprovedRegions(): Promise<AccountUnapprovedRegions[]> {
    try {
      return await this.regionsService.getUnapprovedRegions();
    } catch (error) {
      this.logger.error('Error in getUnapprovedRegions controller:', error);
      return [];
    }
  }

  @Get('debug-excel')
  async debugExcelData() {
    try {
      const workbook = XLSX.readFile('./approved_regions.xlsx', { cellStyles: true });
      const worksheet = workbook.Sheets[workbook.SheetNames[2]];
      const data = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false,
        defval: null,
      });
      return {
        sheetNames: workbook.SheetNames,
        headers: data[0],
        rows: data.slice(83, 92),
      };
    } catch (error) {
      this.logger.error('Error debugging Excel data:', error);
      throw new HttpException('Failed to read Excel file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('debug-profile')
  async debugProfileDetermination() {
    const testCases = [
      { memory: 'Dedicated 8 GB', nodes: '7', expected: 'D' },
      { memory: 'Dedicated 8 GB', nodes: '8', expected: 'DHA' },
      { memory: 'Dedicated 8 GB', nodes: '16', expected: 'DHA' },
      { memory: 'Dedicated 16 GB', nodes: '16', expected: 'S' },
      { memory: 'Dedicated 16 GB', nodes: '17', expected: 'M' },
      { memory: 'Dedicated 32 GB', nodes: '5', expected: 'L' },
      { memory: 'Dedicated 32 GB', nodes: '20', expected: 'L' },
    ];

    const results = testCases.map(test => {
      const profile = this.excelService['determineProfileType'](test.memory, test.nodes);
      return {
        ...test,
        actual: profile,
        correct: profile === test.expected,
      };
    });

    return {
      results,
      allCorrect: results.every(r => r.correct),
    };
  }
}
