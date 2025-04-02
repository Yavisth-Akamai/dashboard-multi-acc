import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SLUG_TO_REGION } from '../../../common/constants/region-mapping.constant';

@Injectable()
export class ClusterMetricsService {
  private readonly logger = new Logger(ClusterMetricsService.name);
  private readonly linodeApiUrl = 'https://api.linode.com/v4/lke/clusters';

  constructor(private readonly httpService: HttpService) {}

  async getClusterMetrics(): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.linodeApiUrl, {
          headers: {
            Authorization: `Bearer ${process.env.LINODE_API_TOKEN}`,
          },
        })
      );
      
      const clusters = response.data.data || [];

      const metrics = clusters.map((cluster: any) => ({
        name: cluster.label,

        region: SLUG_TO_REGION[cluster.region] || cluster.region,
        status: cluster.status,
        created: cluster.created,
      }));
      
      this.logger.debug('Cluster metrics:', metrics);
      return metrics;
    } catch (error) {
      this.logger.error('Error fetching cluster metrics', error);
      throw error;
    }
  }
}