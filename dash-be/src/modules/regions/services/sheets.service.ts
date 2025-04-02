// import { Injectable } from '@nestjs/common';
// import { google } from 'googleapis';
// import { REGION_MAPPING } from '../../../common/constants/region-mapping.constant';
// import { RegionCapacity } from '../../../common/interfaces/region.interface';

// @Injectable()
// export class SheetsService {
//   private readonly sheets = google.sheets('v4');
//   private readonly spreadsheetId = 'x1UNsnewsY4w1ZRnnBilkeN-3lSoz7AYWvCfTqKB1niU8';

//   async getApprovedRegions(): Promise<RegionCapacity[]> {
//     const auth = new google.auth.GoogleAuth({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
//     });

//     const client = await auth.getClient();

//     const response = await this.sheets.spreadsheets.values.get({
//       spreadsheetId: this.spreadsheetId,
//       range: 'Sheet2!A1:Z1000',
//       auth: client
//     });

//     return this.processRegions(response.data.values);
//   }

//   private processRegions(values: string[][]): RegionCapacity[] {
//     const regionCounts = values.reduce((acc, [team, region]) => {
//       acc[region] = (acc[region] || 0) + 1;
//       return acc;
//     }, {});

//     return Object.entries(regionCounts).map(([region, capacity]) => ({
//       team: 'x-dev-team-az',
//       region,
//       region_slug: REGION_MAPPING[region],
//       approved_capacity: capacity
//     }));
//   }
// }


import { Injectable } from '@nestjs/common';
import { google, sheets_v4 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { REGION_MAPPING } from '../../../common/constants/region-mapping.constant';
import { RegionCapacity } from '../../../common/interfaces/region.interface';

@Injectable()
export class SheetsService {
  private readonly sheets: sheets_v4.Sheets;
  private readonly spreadsheetId = 'x1UNsnewsY4w1ZRnnBilkeN-3lSoz7AYWvCfTqKB1niU8';

  constructor() {
    // Initialize the Sheets API client for version v4.
    this.sheets = google.sheets({ version: 'v4' });
  }

  async getApprovedRegions(): Promise<RegionCapacity[]> {
    try {
      // Create an OAuth2 client using your client ID and secret.
      // We're using redirect URI for local development.
      const oauth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'http://localhost:3000/oauth2callback'
      );

      // Set credentials using tokens (which you should have obtained via the OAuth2 flow).
      oauth2Client.setCredentials({
        access_token: process.env.GOOGLE_ACCESS_TOKEN,    // Provide your access token
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN   // Provide your refresh token
      });

      // Get the spreadsheet values from Sheet2!A1:Z1000.
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Sheet2!A1:Z1000',
        auth: oauth2Client
      });

      // TypeScript may complain about the response type; we cast it as any to access data.
      const values: string[][] = (response.data.values as string[][]) || [];

      return this.processRegions(values);
    } catch (error) {
      console.error('Error fetching Google Sheets data', error);
      throw error;
    }
  }

  private processRegions(values: string[][]): RegionCapacity[] {
    // Build a map counting occurrences based on the region column (assumed to be index 1)
    const regionCounts: Record<string, number> = {};
    for (const row of values) {
      const team = row[0];  
      const region = row[1]; 
      if (REGION_MAPPING[region]) {
        regionCounts[region] = (regionCounts[region] || 0) + 1;
      }
    }

    // Convert the region counts to an array of RegionCapacity objects.
    const regionCapacities: RegionCapacity[] = Object.entries(regionCounts).map(([region, capacity]) => ({
      team: 'x-dev-team-az',
      region,
      region_slug: REGION_MAPPING[region],
      approved_capacity: Number(capacity)
    }));

    return regionCapacities;
  }
}