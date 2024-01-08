-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "article" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "sizes" INTEGER[],

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
