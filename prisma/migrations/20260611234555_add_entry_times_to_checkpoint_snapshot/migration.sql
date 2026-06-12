-- AlterTable
ALTER TABLE IF EXISTS "CheckpointLoadSnapshot"
ADD COLUMN IF NOT EXISTS "entryTimes" TEXT[] DEFAULT ARRAY[]::TEXT[];
