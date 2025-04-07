import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { AccountEntity } from '../../accounts/entities/account.entity';

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

  @ManyToOne(() => AccountEntity)
  account: AccountEntity;

  // @Column()
  // accountId: number;
}