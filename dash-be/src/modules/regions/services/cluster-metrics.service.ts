import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SLUG_TO_REGION } from '../../../common/constants/region-mapping.constant';
import { AccountsService } from '../../accounts/accounts.service';

export interface ClusterMetricResponse {
  accountName: string;
  clusters: {
    name: string;
    region: string;
    status: string;
    created: string;
  }[];
}

@Injectable()
export class ClusterMetricsService {
  private readonly logger = new Logger(ClusterMetricsService.name);
  private readonly linodeApiUrl = 'https://api.linode.com/v4/lke/clusters';

  constructor(
    private readonly httpService: HttpService,
    private readonly accountsService: AccountsService
  ) {}

  async getClusterMetrics(): Promise<ClusterMetricResponse[]> {
    try {
      // Get all active accounts
      const accounts = await this.accountsService.getAccounts();
      
      // Fetch clusters for each account
      const clustersByAccount = await Promise.all(
        accounts.map(async (account) => {
          try {
            const response = await firstValueFrom(
              this.httpService.get(this.linodeApiUrl, {
                headers: {
                  Authorization: `Bearer ${account.token}`,
                },
              })
            );
            
            // Map the clusters with proper region names
            const mappedClusters = response.data.data.map((cluster: any) => ({
              name: cluster.label,
              region: SLUG_TO_REGION[cluster.region] || cluster.region,
              status: cluster.status,
              created: cluster.created,
            }));

            return {
              accountName: account.name,
              clusters: mappedClusters
            };
          } catch (error) {
            this.logger.error(`Error fetching clusters for account ${account.name}:`, error);
            return {
              accountName: account.name,
              clusters: []
            };
          }
        })
      );

      return clustersByAccount;
    } catch (error) {
      this.logger.error('Error fetching cluster metrics:', error);
      throw error;
    }
  }
}