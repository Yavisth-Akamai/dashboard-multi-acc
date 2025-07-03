import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  User: string;

  @Column()
  passwordHash: string;

  @Column({ default: true })
  needsPasswordChange: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
