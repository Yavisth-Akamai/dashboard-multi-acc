import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { AccountEntity } from '../../accounts/entities/account.entity';

@Entity('approved_regions')
export class ApprovedRegionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  region: string;

  @Column({ type: 'varchar', length: 4, nullable: true })
  year: string;

  @Column('integer')
  approved_capacity: number; 

  @Column('json', { nullable: true })
  total_capacity: {
    D: number;
    DHA: number;
    S: number;
    M: number;
    L: number;
  };

  @Column('json', { nullable: true })
  current_capacity: {
    D: number;
    DHA: number;
    S: number;
    M: number;
    L: number;
  };

  @Column('json', { nullable: true })
  available: {
    D: number;
    DHA: number;
    S: number;
    M: number;
    L: number;
  };

  @Column({ type: 'varchar', length: 20 , nullable: true })
  status: 'EXCEEDED' | 'AT_CAPACITY' | 'WITHIN_LIMIT';

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => AccountEntity)
  account: AccountEntity;
}