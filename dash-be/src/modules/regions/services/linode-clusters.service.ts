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
    private readonly accountsService: AccountsService,
  ) {}

  /**
   * Fetches clusters for each active account and returns a mapping of account name
   * to its corresponding region counts.
   *
   * Example output:
   * {
   *   "account1": { "Mumbai": 3, "Chennai": 1 },
   *   "account2": { "Fremont": 2, "Newark": 1 }
   * }
   */
  async getClusterRegions(): Promise<Record<string, Record<string, number>>> {
    try {
      // Get all active accounts
      const accounts = await this.accountsService.getAccounts();

      // Object to hold region counts for each account.
      const results: Record<string, Record<string, number>> = {};

      // Iterate through each account and fetch its clusters.
      await Promise.all(
        accounts.map(async (account) => {
          const response = await firstValueFrom(
            this.httpService.get(this.linodeApiUrl, {
              headers: {
                Authorization: `Bearer ${account.token}`,
              },
            })
          );

          // Compute region counts for the current account.
          const regionCount = response.data.data.reduce((acc: Record<string, number>, cluster: any) => {
            const fullRegionName = SLUG_TO_REGION[cluster.region];
            if (fullRegionName) {
              const simpleName = this.simplifyRegionName(fullRegionName);
              acc[simpleName] = (acc[simpleName] || 0) + 1;
            }
            return acc;
          }, {});

          // Use account.name as the key; change as needed.
          results[account.name] = regionCount;
          this.logger.debug(`Account: ${account.name}, Region Count: ${JSON.stringify(regionCount)}`);
        })
      );

      this.logger.debug('Cluster regions by account:', results);
      return results;
    } catch (error) {
      this.logger.error('Error fetching clusters for multiple accounts:', error);
      throw error;
    }
  }

  // Helper method to simplify region names.
  private simplifyRegionName(fullName: string): string {
    const match = fullName.match(/^([^,]+)/);
    if (match) {
      return match[1].trim().replace(/\s+/g, '_');
    }
    return fullName;
  }
}