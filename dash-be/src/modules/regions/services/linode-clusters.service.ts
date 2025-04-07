// src/modules/regions/services/linode-clusters.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SLUG_TO_REGION } from '../../../common/constants/region-mapping.constant';
import { AccountsService } from '../../accounts/accounts.service';

@Injectable()
export class LinodeClustersService {
  private readonly logger = new Logger(LinodeClustersService.name);
  private readonly linodeApiUrl = 'https://api.linode.com/v4/lke/clusters';

  constructor(
    private readonly httpService: HttpService,
    private readonly accountsService: AccountsService
  ) {}

  async getClusterRegions(): Promise<Record<string, number>> {
    try {
      // Get all active accounts
      const accounts = await this.accountsService.getAccounts();
      
      // Fetch clusters for each account
      const allClusters = await Promise.all(
        accounts.map(async (account) => {
          const response = await firstValueFrom(
            this.httpService.get(this.linodeApiUrl, {
              headers: {
                Authorization: `Bearer ${account.token}`,
              },
            })
          );
          return response.data.data;
        })
      );

      // Flatten and process all clusters
      const regionCount = allClusters.flat().reduce((acc, cluster) => {
        const fullRegionName = SLUG_TO_REGION[cluster.region];
        if (fullRegionName) {
          const simpleName = this.simplifyRegionName(fullRegionName);
          acc[simpleName] = (acc[simpleName] || 0) + 1;
        }
        return acc;
      }, {});

      this.logger.debug('Final region count:', regionCount);
      return regionCount;
    } catch (error) {
      this.logger.error('Error fetching clusters:', error);
      throw error;
    }
  }

  private simplifyRegionName(fullName: string): string {
    const match = fullName.match(/^([^,]+)/);
    if (match) {
      return match[1].trim().replace(/\s+/g, '_');
    }
    return fullName;
  }
}