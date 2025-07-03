import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Delete, 
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  async addAccount(
    @Body() data: { token: string; name?: string }
  ) {
    return await this.accountsService.addAccount(
      data.token,
      data.name?.trim()
    );
  }

  @Get()
  async getAccounts() {
    return this.accountsService.getAccounts();
  }

  @Delete(':name')
  async removeAccount(@Param('name') name: string) {
    return this.accountsService.removeAccount(name);
  }

}