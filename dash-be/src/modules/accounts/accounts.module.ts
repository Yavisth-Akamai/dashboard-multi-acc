import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { AccountEntity } from './entities/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountEntity]),
    HttpModule
  ],
  providers: [AccountsService],
  controllers: [AccountsController],
  exports: [AccountsService],
})
export class AccountsModule {}