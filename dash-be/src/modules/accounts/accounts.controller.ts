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
  async addAccount(@Body() data: { token: string }) {
    try {
      return await this.accountsService.addAccount(data.token);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to add account',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
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