CREATE TABLE "CarrierProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "experienceYears" INTEGER NOT NULL,
    "transportType" TEXT NOT NULL,
    "description" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarrierProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "capacityTons" DOUBLE PRECISION NOT NULL,
    "cargoVolume" DOUBLE PRECISION NOT NULL,
    "vehicleImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CarrierProfile_userId_key" ON "CarrierProfile"("userId");
CREATE INDEX "CarrierProfile_isApproved_idx" ON "CarrierProfile"("isApproved");
CREATE INDEX "CarrierProfile_transportType_idx" ON "CarrierProfile"("transportType");
CREATE INDEX "Vehicle_carrierId_idx" ON "Vehicle"("carrierId");
CREATE INDEX "Vehicle_type_idx" ON "Vehicle"("type");
CREATE UNIQUE INDEX "Vehicle_carrierId_plateNumber_key" ON "Vehicle"("carrierId", "plateNumber");

ALTER TABLE "CarrierProfile" ADD CONSTRAINT "CarrierProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "CarrierProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
