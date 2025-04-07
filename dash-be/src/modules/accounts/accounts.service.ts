import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountEntity } from './entities/account.entity';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(
    @InjectRepository(AccountEntity)
    private accountRepository: Repository<AccountEntity>
  ) {}

  async addAccount(name: string, token: string): Promise<AccountEntity> {
    try {
      // Check if account already exists
      const existingAccount = await this.accountRepository.findOne({ 
        where: { name } 
      });

      if (existingAccount) {
        if (existingAccount.isActive) {
          throw new ConflictException(`Account with name ${name} already exists`);
        } else {
          // If account exists but is inactive, reactivate it with new token
          existingAccount.token = token;
          existingAccount.isActive = true;
          return this.accountRepository.save(existingAccount);
        }
      }

      // Create new account
      const account = this.accountRepository.create({
        name,
        token,
        isActive: true
      });
      
      return this.accountRepository.save(account);
    } catch (error) {
      this.logger.error(`Error adding account ${name}:`, error);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`Failed to add account: ${error.message}`);
    }
  }

  async getAccounts(): Promise<AccountEntity[]> {
    return this.accountRepository.find({ where: { isActive: true } });
  }

  async getAccountToken(name: string): Promise<string | null> {
    const account = await this.accountRepository.findOne({ 
      where: { name, isActive: true } 
    });
    return account?.token || null;
  }

  async removeAccount(name: string): Promise<void> {
    await this.accountRepository.update(
      { name },
      { isActive: false }
    );
  }
}