import { Injectable, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { ProfileCapacity, ExcelData } from '../../../common/interfaces/region.interface';
import { PROFILE_COLOR_MAPPINGS } from '../../../common/config/profile-colors.config';
import { ACCOUNT_NAME_MAPPINGS } from '../../../common/config/account-mapping.config';

interface ExcelRow {
  [key: number]: string | null;
  length: number;
}

interface ExcelStyles {
  [key: string]: {
    fill?: {
      bgColor?: {
        rgb?: string;
      };
    };
  };
}

@Injectable()
export class ExcelService {
  private readonly logger = new Logger(ExcelService.name);
  private readonly excelFilePath = './approved_regions.xlsx';

  private getProfileFromColor(backgroundColor: string): string {
    const mapping = PROFILE_COLOR_MAPPINGS.find(m => m.color.toLowerCase() === backgroundColor.toLowerCase());
    return mapping ? mapping.profile : 'D';
  }

  private transformAccountName(fullAccountName: string | null): string {
    if (!fullAccountName) return 'unknown';
    
    this.logger.debug('Transforming account name:', fullAccountName);
    
    // Map from Excel format to database format
    const mappings: Record<string, string> = {
      'akamai-cloudms-devtest-team-az': 'ychopra_dt_az',  // adjust these mappings
      'akamai-cloudms-devtest-team-aws': 'ychopra_dt_aws',
      'akamai-cloudms-dev-team-az': 'ychopra_dev_az',  // adjust these mappings
      'akamai-cloudms-dev-team-aws': 'ychopra_dev_aws',
      'akamai-cloudms-e2e-team-az': 'ychopra_e2e_az',  // adjust these mappings
      'akamai-cloudms-e2e-team-aws': 'ychopra_e2e_aws',
      
    };

    const accountName = mappings[fullAccountName] || fullAccountName;
    this.logger.debug('Transformed to:', accountName);
    return accountName;
  }

  async getApprovedRegions(): Promise<ExcelData[]> {
    try {
      const workbook = XLSX.readFile(this.excelFilePath);
      const sheetName = workbook.SheetNames[2];
      const worksheet = workbook.Sheets[sheetName];

      // Get the styles from the worksheet with proper typing
      const styles = (worksheet as any).Styles || {} as ExcelStyles;

      // Convert sheet to JSON while preserving cell formatting
      const data = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        raw: false,
        defval: null
      }) as ExcelRow[];

      const processedData: ExcelData[] = [];
      
      // Process the data with proper typing
      for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
        const row = data[rowIndex] as ExcelRow;
        if (!row || row.length === 0) continue;

        const dedicatedGBCell = XLSX.utils.encode_cell({ r: rowIndex, c: 12 });
        const cellStyle = styles[dedicatedGBCell];
        const backgroundColor = cellStyle?.fill?.bgColor?.rgb || '#ffffff';

        const profile = this.getProfileFromColor(backgroundColor);
        
        // Create properly typed capacity objects
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
