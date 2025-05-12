import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AccountEntity } from './entities/account.entity';
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
    private readonly accountRepository: Repository<AccountEntity>,
    private readonly httpService: HttpService
  ) {}

  async addAccount(token: string, overrideName?: string): Promise<AccountEntity> {

    let accountName: string;
    if (overrideName && overrideName.trim()) {
      accountName = overrideName.trim();
      this.logger.debug(`Using override account name: ${accountName}`);
    } else {

      const { accountInfo, profileInfo } = await this.validateAndFetchAccountInfo(token);
      accountName = this.generateAccountName(profileInfo, accountInfo);
      this.logger.debug(`Fetched & normalized account name: ${accountName}`);
    }


    const existing = await this.accountRepository.findOne({
      where: { name: accountName },
    });

    if (existing) {
      if (existing.isActive) {
        throw new ConflictException(`Account ${accountName} already exists`);
      }

      existing.token = token;
      existing.isActive = true;
      return this.accountRepository.save(existing);
    }


    const account = this.accountRepository.create({
      name: accountName,
      token,
      isActive: true,
    });
    return this.accountRepository.save(account);
  }


  private async validateAndFetchAccountInfo(token: string) {
    try {
      const [acctRes, profRes] = await Promise.all([
        firstValueFrom(this.httpService.get(`${this.linodeApiUrl}/account`, {
          headers: { Authorization: `Bearer ${token}` }
        })),
        firstValueFrom(this.httpService.get(`${this.linodeApiUrl}/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        }))
      ]);
      return {
        accountInfo: acctRes.data as LinodeAccountInfo,
        profileInfo: profRes.data as LinodeProfileInfo,
      };
    } catch (err) {
      this.logger.error('Error validating Linode token:', err);
      throw new Error('Invalid Linode token or API error');
    }
  }


  private generateAccountName(profileInfo: LinodeProfileInfo, accountInfo: LinodeAccountInfo): string {
    const raw = profileInfo.username;
    if (/.*-poc$/.test(raw) || /.*-team-.*-poc$/.test(raw)) return 'poc';
    return normalizeAccountName(raw);
  }

  async getAccounts(): Promise<AccountEntity[]> {
    return this.accountRepository.find({ where: { isActive: true } });
  }

  async getAccountToken(name: string): Promise<string | null> {
    const acct = await this.accountRepository.findOne({
      where: { name, isActive: true },
    });
    return acct?.token || null;
  }

  async removeAccount(name: string): Promise<void> {
    await this.accountRepository.update({ name }, { isActive: false });
  }
}
