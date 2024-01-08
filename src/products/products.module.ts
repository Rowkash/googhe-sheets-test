import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { GoogleModule } from 'src/google/google.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService],
  imports: [GoogleModule],
})
export class ProductsModule {}
