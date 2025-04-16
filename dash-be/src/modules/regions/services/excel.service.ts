import { Injectable, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx-style';
import { ProfileCapacity, ExcelData } from '../../../common/interfaces/region.interface';
import { determineProfileType } from '../../../common/constants/instance-type-mapping.constant';


interface ExcelRow {
  [key: number]: string | null;
  length: number;
}

@Injectable()
export class ExcelService {
  private readonly logger = new Logger(ExcelService.name);
  private readonly excelFilePath = './approved_regions.xlsx';

  private determineProfileType(memoryInfo: string | null, nodeCount: string | null): string {
    if (!memoryInfo || !nodeCount) {
      this.logger.debug('Missing memory or node data, defaulting to D');
      return 'D';
    }
    
    const nodes = parseInt(nodeCount, 10);
    if (isNaN(nodes)) {
      this.logger.debug(`Invalid node count: ${nodeCount}, defaulting to D`);
      return 'D';
    }
    
    const memoryLower = memoryInfo.toLowerCase();
    
    let memorySize = 0;
    if (memoryLower.includes('32gb') || memoryLower.includes('32 gb') || memoryLower.includes('dedicated 32')) {
      memorySize = 32;
    } else if (memoryLower.includes('16gb') || memoryLower.includes('16 gb') || memoryLower.includes('dedicated 16')) {
      memorySize = 16;
    } else if (memoryLower.includes('8gb') || memoryLower.includes('8 gb') || memoryLower.includes('dedicated 8')) {
      memorySize = 8;
    } else if (memoryLower.includes('4gb') || memoryLower.includes('4 gb') || memoryLower.includes('dedicated 4')) {
      memorySize = 4;
    } else if (memoryLower.includes('64gb') || memoryLower.includes('64 gb') || memoryLower.includes('dedicated 64')) {
      memorySize = 64;
    }
    
    this.logger.debug(`Extracted memory size: ${memorySize}GB from "${memoryLower}"`);
    
    return determineProfileType(memorySize, nodes);
  }

  private transformAccountName(fullAccountName: string | null): string {
    if (!fullAccountName) return 'unknown';
    
    const mappings: Record<string, string> = {
      'akamai-cloudms-devtest-team-az': 'ychopra_dt_az',
      'akamai-cloudms-devtest-team-aws': 'ychopra_dt_aws',
      'akamai-cloudms-dev-team-az': 'ychopra_dev_az',
      'akamai-cloudms-dev-team-aws': 'ychopra_dev_aws',
      'akamai-cloudms-e2e-team-az': 'ychopra_e2e_az',
      'akamai-cloudms-e2e-team-aws': 'ychopra_e2e_aws',
    };
    return mappings[fullAccountName] || fullAccountName;
  }

  async getApprovedRegions(): Promise<ExcelData[]> {
    try {
      const workbook = XLSX.readFile(this.excelFilePath, { cellStyles: true });
      const worksheet = workbook.Sheets[workbook.SheetNames[2]];
      
      const data = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        raw: false,
        defval: null
      }) as ExcelRow[];

      const processedData: ExcelData[] = [];
      
      for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
        const row = data[rowIndex] as ExcelRow;
        if (!row || row.length === 0) continue;

        const memoryInfo = row[12] as string;
        const nodeCount = row[13] as string;
        
        const profile = this.determineProfileType(memoryInfo, nodeCount);

        const capacity: ProfileCapacity = {
          D: profile === 'D' ? 1 : 0,
          DHA: profile === 'DHA' ? 1 : 0,
          S: profile === 'S' ? 1 : 0,
          M: profile === 'M' ? 1 : 0,
          L: profile === 'L' ? 1 : 0
        };

        processedData.push({
          accountName: this.transformAccountName(row[5]),
          region: row[9] as string || 'unknown',
          year: row[4] as string || new Date().getFullYear().toString(),
          total_capacity: { ...capacity },
          current_capacity: { D: 0, DHA: 0, S: 0, M: 0, L: 0 },
          available: { D: 0, DHA: 0, S: 0, M: 0, L: 0 }
        });
      }

      return processedData;
    } catch (error) {
      this.logger.error('Error in getApprovedRegions:', error);
      throw error;
    }
  }
}