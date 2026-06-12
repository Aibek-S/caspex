-- AlterTable
ALTER TABLE "CheckpointLoadSnapshot" ADD COLUMN     "entryTimes" TEXT[] DEFAULT ARRAY[]::TEXT[];
