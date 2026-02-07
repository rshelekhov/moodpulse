-- AlterTable
ALTER TABLE "User" ADD COLUMN     "reminderLastSentLocalDate" TEXT,
ADD COLUMN     "reminderNextAt" TIMESTAMP(3),
ADD COLUMN     "reminderSkipLocalDate" TEXT,
ADD COLUMN     "reminderSnoozeUntil" TIMESTAMP(3),
ADD COLUMN     "timezoneSetByUser" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "User_reminderEnabled_reminderNextAt_idx" ON "User"("reminderEnabled", "reminderNextAt");
