-- CreateTable
CREATE TABLE "CheckpointLoadSnapshot" (
    "id" TEXT NOT NULL,
    "syncBatchId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "checkpointName" TEXT NOT NULL,
    "borderCountry" TEXT,
    "region" TEXT,
    "waitingAreaCount" INTEGER NOT NULL DEFAULT 0,
    "activeTruckNumbers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "raw" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckpointLoadSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CheckpointLoadSnapshot_syncBatchId_idx" ON "CheckpointLoadSnapshot"("syncBatchId");

-- CreateIndex
CREATE INDEX "CheckpointLoadSnapshot_fetchedAt_idx" ON "CheckpointLoadSnapshot"("fetchedAt");

-- CreateIndex
CREATE INDEX "CheckpointLoadSnapshot_checkpointName_idx" ON "CheckpointLoadSnapshot"("checkpointName");
