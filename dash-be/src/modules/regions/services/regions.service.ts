// dash-be/src/modules/regions/services/regions.service.ts

import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ApprovedRegionRepository } from '../repositories/approved-region.repository';
import { ApprovedRegionEntity } from '../entities/approved-region.entity';
import { ExcelService } from './excel.service';
import { ClusterMetricsService } from './cluster-metrics.service';
import {
  UnapprovedRegion,
  AccountUnapprovedRegions,
  ProfileCapacity,
  ApprovedRegion,
} from '../../../common/interfaces/region.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountEntity } from '../../accounts/entities/account.entity';
import { normalizeAccountName } from '../../../common/utils/account-normalizer.util';
import { normalizeRegionName } from '../../../common/utils/region-normalizer.util';
import { ClusterMetric, ClusterMetricResponse } from '../../../common/interfaces/region.interface';

export interface AccountRegionData {
  accountName: string;
  regions: ApprovedRegion[];
}

@Injectable()
export class RegionsService implements OnModuleInit {
  private readonly logger = new Logger(RegionsService.name);

  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(ApprovedRegionEntity)
    private readonly approvedRegionRepository: ApprovedRegionRepository,
    private readonly excelService: ExcelService,
    private readonly clusterMetricsService: ClusterMetricsService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  onModuleInit() {
    this.initializeApprovedRegionData();
  }

  private async initializeApprovedRegionData(): Promise<void> {
    const rows = await this.approvedRegionRepository.find();
    if (rows.length === 0) {
      this.logger.warn('Approved regions table empty—running initial sync');
      await this.syncApprovedRegions();
    }
  }

  private calculateStatus(
    total: ProfileCapacity,
    current: ProfileCapacity,
  ): 'EXCEEDED' | 'AT_CAPACITY' | 'WITHIN_LIMIT' {
    const totalSum = Object.values(total).reduce((s, v) => s + v, 0);
    const currSum = Object.values(current).reduce((s, v) => s + v, 0);
    if (currSum > totalSum) return 'EXCEEDED';
    if (currSum === totalSum) return 'AT_CAPACITY';
    return 'WITHIN_LIMIT';
  }

  async getRegionComparison(): Promise<AccountRegionData[]> {
    const cached = await this.redisClient.get('approved_regions');
    if (cached) return JSON.parse(cached);

    const [regions, metrics] = await Promise.all([
      this.approvedRegionRepository.find({ relations: ['account'] }),
      this.clusterMetricsService.getClusterMetrics(),
    ]);

    const byAccount = regions.reduce(
      (acc, regionRow) => {
        if (!regionRow.account) return acc;
        const acct = regionRow.account.name;
        acc[acct] ??= [];

        const accountMetrics = metrics.find(m => m.accountName === acct);
        const regionKey = normalizeRegionName(regionRow.region);

        // filter clusters by normalized region
        const clusters = accountMetrics
          ? accountMetrics.clusters.filter(c =>
              normalizeRegionName(c.region) === regionKey,
            )
          : [];

        // count profiles
        const current: ProfileCapacity = { D: 0, DHA: 0, S: 0, M: 0, L: 0 };
        clusters.forEach(c => {
          current[c.profileType ?? 'D']++;
        });

        const available: ProfileCapacity = {
          D: Math.max(0, regionRow.total_capacity.D - current.D),
          DHA: Math.max(0, regionRow.total_capacity.DHA - current.DHA),
          S: Math.max(0, regionRow.total_capacity.S - current.S),
          M: Math.max(0, regionRow.total_capacity.M - current.M),
          L: Math.max(0, regionRow.total_capacity.L - current.L),
        };

        acc[acct].push({
          region: regionRow.region,
          year: regionRow.year,
          approved_capacity: regionRow.approved_capacity,
          total_capacity: regionRow.total_capacity,
          current_capacity: current,
          available,
          status: this.calculateStatus(regionRow.total_capacity, current),
        });

        return acc;
      },
      {} as Record<string, ApprovedRegion[]>,
    );

    const result = Object.entries(byAccount).map(([accountName, regions]) => ({
      accountName,
      regions,
    }));

    await this.redisClient.set('approved_regions', JSON.stringify(result), 'EX', 3600);
    return result;
  }

  async syncApprovedRegions(): Promise<void> {
    const excelData = await this.excelService.getApprovedRegions();
    const toSave: Partial<ApprovedRegionEntity>[] = [];

    for (const d of excelData) {
      const normName = normalizeAccountName(d.accountName);
      const acct = await this.accountRepository.findOne({ where: { name: normName } });
      if (!acct) continue;

      const totalSum = Object.values(d.total_capacity).reduce((s, v) => s + v, 0);
      toSave.push({
        region: d.region,
        year: d.year,
        approved_capacity: totalSum,
        total_capacity: d.total_capacity,
        current_capacity: d.current_capacity,
        available: d.available,
        status: this.calculateStatus(d.total_capacity, d.current_capacity),
        account: acct,
      });
    }

    if (toSave.length) {
      await this.approvedRegionRepository.clear();
      await this.approvedRegionRepository.save(toSave);
      await this.redisClient.del('approved_regions');
    }
  }

  async getApprovedRegions(): Promise<ApprovedRegionEntity[]> {
    const cached = await this.redisClient.get('approved_regions');
    if (cached) return JSON.parse(cached);
    const rows = await this.approvedRegionRepository.find();
    await this.redisClient.set('approved_regions', JSON.stringify(rows), 'EX', 3600);
    return rows;
  }

  async getUnapprovedRegions(): Promise<AccountUnapprovedRegions[]> {
    const [approved, metrics] = await Promise.all([
      this.getApprovedRegions(),
      this.clusterMetricsService.getClusterMetrics(),
    ]);

    const byAccount = metrics.reduce((acc, resp) => {
      acc[resp.accountName] = resp.clusters;
      return acc;
    }, {} as Record<string, ClusterMetric[]>);

    return Object.entries(byAccount).map(([acct, clusters]) => {
      // sum approved per normalized region
      const approvedCap: Record<string, ProfileCapacity> = {};
      approved
        .filter(r => r.account?.name === acct)
        .forEach(r => {
          const key = normalizeRegionName(r.region);
          approvedCap[key] ??= { D: 0, DHA: 0, S: 0, M: 0, L: 0 };
          (Object.keys(r.total_capacity) as Array<keyof ProfileCapacity>).forEach(p => {
            approvedCap[key][p] += r.total_capacity[p];
          });
        });

      // count actual clusters per normalized region
      const actual: Record<string, ProfileCapacity> = {};
      clusters.forEach(c => {
        const key = normalizeRegionName(c.region);
        actual[key] ??= { D: 0, DHA: 0, S: 0, M: 0, L: 0 };
        actual[key][c.profileType ?? 'D']++;
      });

      const unapproved: UnapprovedRegion[] = [];
      Object.entries(actual).forEach(([key, profCount]) => {
        const app = approvedCap[key] || { D: 0, DHA: 0, S: 0, M: 0, L: 0 };
        (Object.keys(profCount) as Array<keyof ProfileCapacity>).forEach(p => {
          const diff = profCount[p] - (app[p] || 0);
          if (diff > 0) unapproved.push({ region: key, capacity: diff, profile: p });
        });
      });

      return { accountName: acct, unapprovedRegions: unapproved };
    });
  }
}
