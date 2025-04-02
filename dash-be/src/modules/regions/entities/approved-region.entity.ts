import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('approved_regions')
export class ApprovedRegionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  region: string;

  @Column({ type: 'integer' })
  approved_capacity: number;

  @CreateDateColumn()
  created_at: Date;
}