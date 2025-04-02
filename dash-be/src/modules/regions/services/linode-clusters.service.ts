import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SLUG_TO_REGION } from '../../../common/constants/region-mapping.constant';

@Injectable()
export class LinodeClustersService {
  private readonly logger = new Logger(LinodeClustersService.name);
  private readonly linodeApiUrl = 'https://api.linode.com/v4/lke/clusters';

  constructor(private readonly httpService: HttpService) {}

  // Helper method to convert full region name to simple name
  private simplifyRegionName(fullName: string): string {
    // Extract the first part before comma or any special characters
    const match = fullName.match(/^([^,]+)/);
    if (match) {
      // Replace spaces with underscores for cases like "Washington D.C."
      return match[1].trim().replace(/\s+/g, '_');
    }
    return fullName;
  }

  async getClusterRegions(): Promise<Record<string, number>> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.linodeApiUrl, {
          headers: {
            Authorization: `Bearer ${process.env.LINODE_API_TOKEN}`,
          },
        })
      );

      const regionCount = response.data.data.reduce((acc, cluster) => {
        const fullRegionName = SLUG_TO_REGION[cluster.region];
        if (fullRegionName) {
          const simpleName = this.simplifyRegionName(fullRegionName);
          acc[simpleName] = (acc[simpleName] || 0) + 1;
          
          // Debug logging
          this.logger.debug(`Converting: ${fullRegionName} -> ${simpleName}`);
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
}