import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GoogleSheetsService } from 'src/google/google-sheets.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { IProduct } from 'src/google/interfaces/google-sheets.interface';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  constructor(
    private googleSheetsService: GoogleSheetsService,
    private prisma: PrismaService,
  ) {
    this.syncWithGoogleSheets();
  }

  // ---------- Sync with google sheets every 1 hour ---------- //

  @Cron('0 * * * *')
  async syncWithGoogleSheets() {
    try {
      const sheetsProducts =
        await this.googleSheetsService.getProductsFromSheets();

      await this.syncProducts(sheetsProducts);
      this.logger.log('Synchronization with Google Sheets completed');
      await this.syncSizes(sheetsProducts);
      this.logger.log('Product sizes updated');
    } catch (error) {
      this.logger.error(error);
    }
  }

  // ---------- Sync Products ---------- //

  private async syncProducts(sheetsProducts: IProduct[]) {
    for (const sheetProduct of sheetsProducts) {
      const dbProduct = await this.prisma.product.findUnique({
        where: { article: sheetProduct.article },
      });
      if (!dbProduct) {
        await this.createProduct(sheetProduct);
        this.logger.log(`${JSON.stringify(sheetProduct)} added to Database`);
      }
    }
  }

  // ---------- Sync Sizes ---------- //

  private async syncSizes(sheetsProducts: IProduct[]) {
    for (const sheetProduct of sheetsProducts) {
      const dbProduct = await this.prisma.product.findUnique({
        where: { article: sheetProduct.article },
      });

      if (dbProduct)
        await this.updateProductSizes(sheetProduct.article, sheetProduct.sizes);
    }
  }

  // ---------- Create new Product ---------- //

  async createProduct(product: CreateProductDto) {
    return await this.prisma.product.create({
      data: product,
    });
  }

  // ---------- Get all products ---------- //

  async getAllProducts() {
    return this.prisma.product.findMany();
  }

  // ---------- Get One Product ---------- //

  async findOne(article: number) {
    const product = await this.prisma.product.findUnique({
      where: { article },
    });
    if (!product)
      throw new NotFoundException(`Product with article ${article} not found`);
    return product;
  }

  // ---------- Update Product ---------- //

  async updateProduct(article: number, updateProductDto: UpdateProductDto) {
    return await this.prisma.product.update({
      where: { article },
      data: updateProductDto,
    });
  }

  // ---------- Update Product Sizes ---------- //

  async updateProductSizes(article: number, sizes: number[]) {
    return await this.prisma.product.update({
      where: { article },
      data: { sizes },
    });
  }

  // ---------- Delete Product ---------- //

  async deleteProduct(article: number) {
    return await this.prisma.product.delete({ where: { article } });
  }
}
