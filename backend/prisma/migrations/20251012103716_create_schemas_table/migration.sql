-- CreateEnum
CREATE TYPE "DisputeBy" AS ENUM ('BRAND', 'CREATOR');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('ACTIVE', 'PENDING_REVIEW', 'DISPUTED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DisputeChoice" AS ENUM ('80/20', '0/100');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'RELEASE', 'REFUND');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "VerificationResult" AS ENUM ('ON_TIME', 'LATE', 'DELETED', 'NOT_FOUND');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "wallet" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "social" TEXT NOT NULL,
    "brief" TEXT NOT NULL,
    "amount" DECIMAL(20,2) NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "deadline" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "brandId" TEXT,
    "creatorId" TEXT,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_logs" (
    "id" SERIAL NOT NULL,
    "contractId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "result" "VerificationResult" NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentTimestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" SERIAL NOT NULL,
    "contractId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "evidence" TEXT NOT NULL,
    "disputedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "disputedBy" "DisputeBy" NOT NULL,
    "creatorChoice" "DisputeChoice",

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "contractId" TEXT NOT NULL,
    "amount" DECIMAL(20,2) NOT NULL,
    "txHash" TEXT,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_id_key" ON "contracts"("id");

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_logs" ADD CONSTRAINT "verification_logs_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
