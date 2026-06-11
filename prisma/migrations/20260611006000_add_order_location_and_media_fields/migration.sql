-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cargoPhotoUrl" TEXT,
ADD COLUMN     "destinationCity" TEXT,
ADD COLUMN     "destinationCountry" TEXT,
ADD COLUMN     "originCity" TEXT,
ADD COLUMN     "originCountry" TEXT,
ADD COLUMN     "productPhotoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
