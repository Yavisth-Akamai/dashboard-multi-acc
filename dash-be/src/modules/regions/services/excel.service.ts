import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { REGION_MAPPING } from '../../../common/constants/region-mapping.constant';
import { RegionCapacity } from '../../../common/interfaces/region.interface';

@Injectable()
export class ExcelService {
  private readonly excelFilePath = './approved_regions.xlsx';  

  async getApprovedRegions(): Promise<RegionCapacity[]> {
    // Read the Excel file
    const workbook = XLSX.readFile(this.excelFilePath);
    const sheetName = workbook.SheetNames[1];  // Get first sheet
    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON array
    const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Count occurrences of each region (right column only)
    const regionCounts: Record<string, number> = {};
    data.forEach((row) => {
      if (row[1] && typeof row[1] === 'string') {  // Check second column (index 1)
        const region = row[1].trim();
        regionCounts[region] = (regionCounts[region] || 0) + 1;
      }
    });

    // Convert counts to RegionCapacity objects
    return Object.entries(regionCounts).map(([region, count]) => ({
      region,
      region_slug: REGION_MAPPING[region],
      approved_capacity: count
    }));
  }
}