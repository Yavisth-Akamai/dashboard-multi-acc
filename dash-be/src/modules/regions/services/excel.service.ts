import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { RegionCapacity } from '../../../common/interfaces/region.interface';

@Injectable()
export class ExcelService {
  private readonly excelFilePath = './approved_regions.xlsx';  

  async getApprovedRegions(): Promise<RegionCapacity[]> {
    const workbook = XLSX.readFile(this.excelFilePath);
    const sheetName = workbook.SheetNames[1];  // Get second sheet
    const worksheet = workbook.Sheets[sheetName];

    const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    const regionCounts: Record<string, number> = {};
    data.forEach((row) => {
      if (row[1] && typeof row[1] === 'string') {
        const region = row[1].trim();
        regionCounts[region] = (regionCounts[region] || 0) + 1;
      }
    });

    return Object.entries(regionCounts).map(([region, count]) => ({
      region,
      approved_capacity: count
    }));
  }
}