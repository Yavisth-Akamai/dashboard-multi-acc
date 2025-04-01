import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('region_capacities')
export class RegionCapacityEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  region: string;

  @Column({ type: 'integer' })
  approved_capacity: number;
}