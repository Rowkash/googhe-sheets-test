import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { GoogleModule } from './google/google.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: `.${process.env.NODE_ENV}.env` }),
    ScheduleModule.forRoot(),
    ProductsModule,
    GoogleModule,
  ],
})
export class AppModule {}
