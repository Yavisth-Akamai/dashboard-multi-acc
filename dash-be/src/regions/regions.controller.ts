import { 
    Controller, 
    Post, 
    Body, 
    Get 
  } from '@nestjs/common';
  import { RegionsService } from './regions.service';
  import { CreateRegionCapacityDto } from './dto/create-region-capacity.dto';
  
  @Controller('regions')
  export class RegionsController {
    constructor(private regionsService: RegionsService) {}
  
    @Post('capacity')
    async createRegionCapacity(
      @Body() createRegionCapacityDto: CreateRegionCapacityDto
    ) {
      return this.regionsService.createRegionCapacity(createRegionCapacityDto);
    }
  
    @Get('capacities')
    async getRegionCapacities() {
      return this.regionsService.getRegionCapacities();
    }
  
    @Get('compliance')
    async checkRegionCompliance() {
      return this.regionsService.checkRegionCompliance();
    }
  }