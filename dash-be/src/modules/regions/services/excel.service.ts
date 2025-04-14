import { Injectable, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx-style';
import { ProfileCapacity, ExcelData } from '../../../common/interfaces/region.interface';
import { PROFILE_COLOR_MAPPINGS } from '../../../common/config/profile-colors.config';

interface ExcelRow {
  [key: number]: string | null;
  length: number;
}

@Injectable()
export class ExcelService {
  private readonly logger = new Logger(ExcelService.name);
  private readonly excelFilePath = './approved_regions.xlsx';

  private getProfileFromColor(cell: XLSX.CellObject): string {
    if (!cell?.s?.fill?.fgColor?.rgb) {
      return 'D';
    }
    const colorHex = '#' + cell.s.fill.fgColor.rgb.replace(/^FF/, '').toLowerCase();
    const mapping = PROFILE_COLOR_MAPPINGS.find(m => 
      m.color.toLowerCase() === colorHex
    );
    return mapping ? mapping.profile : 'D';
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

        const profileCell = worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: 12 })];
        const profile = this.getProfileFromColor(profileCell);

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