import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SLUG_TO_REGION } from '../../../common/constants/region-mapping.constant';
import { AccountsService } from '../../accounts/accounts.service';
import { 
  getMemorySizeFromInstanceType, 
  determineProfileType 
} from '../../../common/constants/instance-type-mapping.constant';

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
    private readonly accountsService: AccountsService
  ) {}
  private determineProfileType(pools: ClusterPool[]): 'D' | 'DHA' | 'S' | 'M' | 'L' {
    const totalNodeCount = pools.reduce((sum, pool) => sum + pool.count, 0);
    
    this.logger.debug(`Determining profile type for pools with total node count: ${totalNodeCount}`);
    
    pools.forEach(pool => {
      this.logger.debug(`Pool: type=${pool.type}, count=${pool.count}`);
    });
    
    const poolMemorySizes = pools.map(pool => getMemorySizeFromInstanceType(pool.type));
  
    this.logger.debug(`Pool memory sizes: ${poolMemorySizes.join(', ')}`);
    
    const largestMemorySize = Math.max(...poolMemorySizes, 0);
    
    return determineProfileType(largestMemorySize, totalNodeCount);
  }

  async getClusterMetrics(): Promise<ClusterMetricResponse[]> {
    try {
      const accounts = await this.accountsService.getAccounts();
      
      const clustersByAccount = await Promise.all(
        accounts.map(async (account) => {
          try {
            const clustersResponse = await firstValueFrom(
              this.httpService.get(this.linodeApiUrl, {
                headers: {
                  Authorization: `Bearer ${account.token}`,
                },
              })
            );
            
            const clustersWithDetails = await Promise.all(
              clustersResponse.data.data.map(async (cluster: any) => {
                try {
                  const poolsResponse = await firstValueFrom(
                    this.httpService.get(`${this.linodeApiUrl}/${cluster.id}/pools`, {
                      headers: {
                        Authorization: `Bearer ${account.token}`,
                      },
                    })
                  );
                  
                  const pools = poolsResponse.data.data;
                  const totalNodeCount = pools.reduce((sum: number, pool: any) => sum + pool.count, 0);
                  const profileType = this.determineProfileType(pools);
                  
                  return {
                    name: cluster.label,
                    region: SLUG_TO_REGION[cluster.region] || cluster.region,
                    status: cluster.status,
                    created: cluster.created,
                    id: cluster.id,
                    pools,
                    totalNodeCount,
                    profileType
                  };
                } catch (error) {
                  this.logger.error(`Error fetching pools for cluster ${cluster.id}:`, error);
                  return {
                    name: cluster.label,
                    region: SLUG_TO_REGION[cluster.region] || cluster.region,
                    status: cluster.status,
                    created: cluster.created,
                    id: cluster.id,
                    pools: [],
                    totalNodeCount: 0,
                    profileType: 'D' 
                  };
                }
              })
            );

            return {
              accountName: account.name,
              clusters: clustersWithDetails
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