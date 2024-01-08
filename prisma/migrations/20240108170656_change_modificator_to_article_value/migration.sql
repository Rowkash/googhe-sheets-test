/*
  Warnings:

  - A unique constraint covering the columns `[article]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Product_article_key" ON "Product"("article");
