import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SLUG_TO_REGION } from '../../../common/constants/region-mapping.constant';
import { AccountsService } from '../../accounts/accounts.service';
import {
  getMemorySizeFromInstanceType,
  determineProfileType,
} from '../../../common/constants/instance-type-mapping.constant';
import { normalizeRegionName } from '../../../common/utils/region-normalizer.util';

export interface ClusterPoolNode {
  id: string;
  instance_id: number;
  status: string;
}

export interface ClusterPool {
  id: number;
  type: string;
  count: number;
  nodes: ClusterPoolNode[];
}

export interface ClusterMetricResponse {
  accountName: string;
  clusters: {
    name: string;
    region: string;
    status: string;
    created: string;
    id: number;
    pools: ClusterPool[];
    totalNodeCount: number;
    profileType: 'D' | 'DHA' | 'S' | 'M' | 'L';
  }[];
}

@Injectable()
export class ClusterMetricsService {
  private readonly logger = new Logger(ClusterMetricsService.name);
  private readonly linodeApiUrl = 'https://api.linode.com/v4/lke/clusters';

  constructor(
    private readonly httpService: HttpService,
    private readonly accountsService: AccountsService,
  ) {}

  private determineProfileType(pools: ClusterPool[]): 'D' | 'DHA' | 'S' | 'M' | 'L' {
    const total = pools.reduce((s, p) => s + p.count, 0);
    this.logger.debug(`Total nodes: ${total}`);
    const sizes = pools.map(p => getMemorySizeFromInstanceType(p.type));
    this.logger.debug(`Pool mem sizes: ${sizes.join(', ')}`);
    const maxSize = Math.max(...sizes, 0);
    return determineProfileType(maxSize, total);
  }

  async getClusterMetrics(): Promise<ClusterMetricResponse[]> {
    const accounts = await this.accountsService.getAccounts();

    return Promise.all(
      accounts.map(async acct => {
        try {
          const listRes = await firstValueFrom(
            this.httpService.get(this.linodeApiUrl, {
              headers: { Authorization: `Bearer ${acct.token}` },
            }),
          );

          const clusters = await Promise.all(
            listRes.data.data.map(async (c: any) => {
              try {
                const poolsRes = await firstValueFrom(
                  this.httpService.get(
                    `${this.linodeApiUrl}/${c.id}/pools`,
                    { headers: { Authorization: `Bearer ${acct.token}` } },
                  ),
                );
                const pools: ClusterPool[] = poolsRes.data.data;
                const totalNodes = pools.reduce((s, p) => s + p.count, 0);
                const prof = this.determineProfileType(pools);

                return {
                  name: c.label,
                  region: normalizeRegionName(
                    SLUG_TO_REGION[c.region] || c.region,
                  ),
                  status: c.status,
                  created: c.created,
                  id: c.id,
                  pools,
                  totalNodeCount: totalNodes,
                  profileType: prof,
                };
              } catch (err) {
                this.logger.error(`Pools error for ${c.id}:`, err);
                return {
                  name: c.label,
                  region: normalizeRegionName(
                    SLUG_TO_REGION[c.region] || c.region,
                  ),
                  status: c.status,
                  created: c.created,
                  id: c.id,
                  pools: [],
                  totalNodeCount: 0,
                  profileType: 'D',
                };
              }
            }),
          );

          return { accountName: acct.name, clusters };
        } catch (err) {
          this.logger.error(`Clusters error for ${acct.name}:`, err);
          return { accountName: acct.name, clusters: [] };
        }
      }),
    );
  }
}
