import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('accounts')
export class AccountEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  token: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  email: string;

  @CreateDateColumn()
  created_at: Date;
}