-- CreateEnum
CREATE TYPE "AlertSensitivity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "alertsEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "alertsSensitivity" "AlertSensitivity" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "alertsSnoozeUntil" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "AlertState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "lastSentAt" TIMESTAMP(3),
    "cooldownUntil" TIMESTAMP(3),

    CONSTRAINT "AlertState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AlertState_userId_ruleId_key" ON "AlertState"("userId", "ruleId");

-- AddForeignKey
ALTER TABLE "AlertState" ADD CONSTRAINT "AlertState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
