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

  async getClusterRegions(): Promise<Record<string, Record<string, number>>> {
    try {

      const accounts = await this.accountsService.getAccounts();


      const results: Record<string, Record<string, number>> = {};


      await Promise.all(
        accounts.map(async (account) => {
          const response = await firstValueFrom(
            this.httpService.get(this.linodeApiUrl, {
              headers: {
                Authorization: `Bearer ${account.token}`,
              },
            })
          );


          const regionCount = response.data.data.reduce((acc: Record<string, number>, cluster: any) => {
            const fullRegionName = SLUG_TO_REGION[cluster.region];
            if (fullRegionName) {
              const simpleName = this.simplifyRegionName(fullRegionName);
              acc[simpleName] = (acc[simpleName] || 0) + 1;
            }
            return acc;
          }, {});


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


  private simplifyRegionName(fullName: string): string {
    const match = fullName.match(/^([^,]+)/);
    if (match) {
      return match[1].trim().replace(/\s+/g, '_');
    }
    return fullName;
  }
}