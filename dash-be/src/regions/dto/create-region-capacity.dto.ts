import { IsString, IsInt, Min } from 'class-validator';

export class CreateRegionCapacityDto {
  @IsString()
  region: string;

  @IsInt()
  @Min(0)
  approved_capacity: number;
}