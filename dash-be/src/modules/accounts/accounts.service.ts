import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AccountEntity } from './entities/account.entity';
import { ACCOUNT_NAME_MAPPINGS } from '../../common/config/account-mapping.config';
import { normalizeAccountName } from '../../common/utils/account-normalizer.util';
interface LinodeAccountInfo {
  email: string;
  company?: string;
  first_name?: string;
  last_name?: string;
}

interface LinodeProfileInfo {
  username: string;
  email: string;
}

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);
  private readonly linodeApiUrl = 'https://api.linode.com/v4';

  constructor(
    @InjectRepository(AccountEntity)
    private accountRepository: Repository<AccountEntity>,
    private readonly httpService: HttpService
  ) {}

  async validateAndFetchAccountInfo(token: string): Promise<{ accountInfo: LinodeAccountInfo; profileInfo: LinodeProfileInfo }> {
    try {
      const [accountResponse, profileResponse] = await Promise.all([
        firstValueFrom(
          this.httpService.get(`${this.linodeApiUrl}/account`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ),
        firstValueFrom(
          this.httpService.get(`${this.linodeApiUrl}/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      ]);

      return {
        accountInfo: accountResponse.data,
        profileInfo: profileResponse.data
      };
    } catch (error) {
      this.logger.error('Error validating Linode token:', error);
      throw new Error('Invalid Linode token or API error');
    }
  }

  async addAccount(token: string): Promise<AccountEntity> {
    try {

      const { accountInfo, profileInfo } = await this.validateAndFetchAccountInfo(token);
      console.log('Account Info:', accountInfo);
      console.log('Profile Info:', profileInfo);

      const accountName = this.generateAccountName(profileInfo, accountInfo);
      console.log('Generated Account Name:', accountName);


      const existingAccount = await this.accountRepository.findOne({ 
        where: { token } 
      });

      if (existingAccount) {
        if (existingAccount.isActive) {
          throw new ConflictException(`Account ${accountName} already exists`);
        } else {

          existingAccount.token = token;
          existingAccount.isActive = true;
          return this.accountRepository.save(existingAccount);
        }
      }


      const account = this.accountRepository.create({
        name: accountName,
        token,
        isActive: true,
      });
      
      return this.accountRepository.save(account);
    } catch (error) {
      this.logger.error(`Error adding account:`, error);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`Failed to add account: ${error.message}`);
    }
  }
 
  private generateAccountName(profileInfo: LinodeProfileInfo, accountInfo: LinodeAccountInfo): string {
    if (accountInfo.company) {
      const raw = profileInfo.username; 
      return normalizeAccountName(raw); 
    }
    return normalizeAccountName(profileInfo.username);
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