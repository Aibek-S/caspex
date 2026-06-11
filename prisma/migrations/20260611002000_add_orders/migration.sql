CREATE TYPE "OrderStatus" AS ENUM (
  'NEW',
  'SEARCHING',
  'ASSIGNED',
  'IN_TRANSIT',
  'DELIVERED',
  'CANCELLED'
);

CREATE TABLE "Order" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "carrierId" TEXT,
  "title" TEXT NOT NULL,
  "cargoType" TEXT NOT NULL,
  "weight" DOUBLE PRECISION NOT NULL,
  "volume" DOUBLE PRECISION NOT NULL,
  "origin" TEXT NOT NULL,
  "destination" TEXT NOT NULL,
  "comment" TEXT,
  "estimatedPrice" DOUBLE PRECISION,
  "estimatedDeliveryTime" INTEGER,
  "estimatedCarrierSearchTime" INTEGER,
  "status" "OrderStatus" NOT NULL DEFAULT 'NEW',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Order_clientId_idx" ON "Order"("clientId");
CREATE INDEX "Order_carrierId_idx" ON "Order"("carrierId");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

ALTER TABLE "Order"
  ADD CONSTRAINT "Order_clientId_fkey"
  FOREIGN KEY ("clientId")
  REFERENCES "User"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "Order"
  ADD CONSTRAINT "Order_carrierId_fkey"
  FOREIGN KEY ("carrierId")
  REFERENCES "CarrierProfile"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;
