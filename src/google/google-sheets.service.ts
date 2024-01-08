import { Injectable, Logger } from '@nestjs/common';
import { sheets_v4, google } from 'googleapis';
import { IProduct } from './interfaces/google-sheets.interface';

@Injectable()
export class GoogleSheetsService {
  private sheets: sheets_v4.Sheets;
  private readonly logger = new Logger(GoogleSheetsService.name);

  constructor() {
    this.sheets = google.sheets({
      version: 'v4',
      auth: process.env.GOOGLE_API,
    });
  }

  // ---------- Get array of products objects ---------- //

  async getProductsFromSheets(): Promise<IProduct[]> {
    try {
      const { sheetsNames, valuesArray } = await this.getSheetsValues();

      let result = [];

      for (let i = 0; i < valuesArray.length; i++) {
        const productModel = sheetsNames[i];
        const products = await this.transformToProducts(
          valuesArray[i],
          productModel,
        );
        result = result.concat(products);
      }
      return result;
    } catch (error) {
      this.logger.error(error);
    }
  }

  // ---------- Transform google sheet data to array of product object ---------- //

  private async transformToProducts(data: string[][], productModel: string) {
    const sheetData = data;
    const products: IProduct[] = [];

    const sizeRows = sheetData.slice(4);

    for (let i = 1; i < sheetData[0].length; i++) {
      const product: IProduct = {
        name: sheetData[0][i].trim(),
        price: parseInt(sheetData[1][i]),
        article: parseInt(sheetData[2][i]),
        model: productModel,
        sizes: [],
      };

      sizeRows.forEach((row) => {
        if (row[i] === '+') {
          const size = parseInt(row[0]);
          if (!isNaN(size)) {
            product.sizes.push(size);
          }
        }
      });

      products.push(product);
    }
    return products;
  }

  // ---------- Get Sheets Values ---------- //

  private async getSheetsValues() {
    const sheetsNames = await this.getSheetsNames();

    const response = await this.sheets.spreadsheets.values.batchGet({
      spreadsheetId: process.env.SHEET_ID,
      ranges: sheetsNames,
    });

    const sheetsValues = response.data.valueRanges;
    const valuesArray = sheetsValues.map((arr) => arr.values);
    return { valuesArray, sheetsNames };
  }

  // ---------- Get Sheets ---------- //

  private async getSheetsNames() {
    const response = await this.sheets.spreadsheets.get({
      spreadsheetId: process.env.SHEET_ID,
    });

    const sheetsInfo = response.data.sheets;
    return sheetsInfo.map((sheet) => sheet.properties.title);
  }
}
