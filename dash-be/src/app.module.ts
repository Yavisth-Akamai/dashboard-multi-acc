import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './redis/redis.module';
import { RegionsModule } from './modules/regions/regions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env']
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'yav',
      password: 'yav123',
      database: 'region_capacity',
      autoLoadEntities: true,
      synchronize: true
    }),
    RedisModule,
    RegionsModule
  ]
})
export class AppModule {}