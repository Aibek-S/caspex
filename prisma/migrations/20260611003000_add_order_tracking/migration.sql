CREATE TABLE "OrderTracking" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "status" "OrderStatus" NOT NULL,
  "location" TEXT,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OrderTracking_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OrderTracking_orderId_idx" ON "OrderTracking"("orderId");
CREATE INDEX "OrderTracking_status_idx" ON "OrderTracking"("status");
CREATE INDEX "OrderTracking_timestamp_idx" ON "OrderTracking"("timestamp");

ALTER TABLE "OrderTracking"
  ADD CONSTRAINT "OrderTracking_orderId_fkey"
  FOREIGN KEY ("orderId")
  REFERENCES "Order"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
