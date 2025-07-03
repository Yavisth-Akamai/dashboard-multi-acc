import { Injectable, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx';
import {
  ProfileCapacity,
  ExcelData,
} from '../../../common/interfaces/region.interface';
import { determineProfileType } from '../../../common/constants/instance-type-mapping.constant';
import { normalizeRegionName } from '../../../common/utils/region-normalizer.util';
import { normalizeAccountName } from '../../../common/utils/account-normalizer.util';

interface ExcelRow {
  [key: number]: string | null;
  length: number;
}

@Injectable()
export class ExcelService {
  private readonly logger = new Logger(ExcelService.name);
  private readonly excelFilePath =
    process.env.EXCEL_FILE_PATH || './approved_regions.xlsx';

  private determineProfileType(
    memoryInfo: string | null,
    nodeCount: string | null,
  ): 'D' | 'DHA' | 'S' | 'M' | 'L' {
    if (!memoryInfo || !nodeCount) {
      this.logger.debug('Missing memory or node data, defaulting to D');
      return 'D';
    }
    const nodes = parseInt(nodeCount, 10);
    if (isNaN(nodes)) {
      this.logger.debug(`Invalid node count: ${nodeCount}, defaulting to D`);
      return 'D';
    }

    const ml = memoryInfo.toLowerCase();
    let size = 0;
    if (ml.includes('32gb') || ml.includes('dedicated 32')) size = 32;
    else if (ml.includes('16gb') || ml.includes('dedicated 16')) size = 16;
    else if (ml.includes('8gb') || ml.includes('dedicated 8')) size = 8;
    else if (ml.includes('4gb') || ml.includes('dedicated 4')) size = 4;
    else if (ml.includes('64gb') || ml.includes('dedicated 64')) size = 64;

    this.logger.debug(`Extracted memory size: ${size}GB from "${ml}"`);
    return determineProfileType(size, nodes);
  }

  private transformAccountName(raw: string | null): string {
    if (!raw) return 'unknown';
    return normalizeAccountName(raw.trim());
  }

  async getApprovedRegions(): Promise<ExcelData[]> {
    try {
      const wb = XLSX.readFile(this.excelFilePath, { cellStyles: true });
      const ws = wb.Sheets[wb.SheetNames[2]];
      const rows = XLSX.utils.sheet_to_json(ws, {
        header: 1,
        raw: false,
        defval: null,
      }) as ExcelRow[];

      const out: ExcelData[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const memoryInfo = row[12] as string;
        const nodeCount = row[13] as string;
        const profile = this.determineProfileType(memoryInfo, nodeCount);

        const cap: ProfileCapacity = {
          D: profile === 'D' ? 1 : 0,
          DHA: profile === 'DHA' ? 1 : 0,
          S: profile === 'S' ? 1 : 0,
          M: profile === 'M' ? 1 : 0,
          L: profile === 'L' ? 1 : 0,
        };

        out.push({
          accountName: this.transformAccountName(row[5]),
          region: normalizeRegionName((row[9] as string) || 'unknown'),
          year: (row[4] as string) || new Date().getFullYear().toString(),
          total_capacity: { ...cap },
          current_capacity: { D: 0, DHA: 0, S: 0, M: 0, L: 0 },
          available: { D: 0, DHA: 0, S: 0, M: 0, L: 0 },
        });
      }
      return out;
    } catch (err) {
      this.logger.error('Error in getApprovedRegions:', err);
      throw err;
    }
  }
}
