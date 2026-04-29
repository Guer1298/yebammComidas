-- AlterTable
ALTER TABLE "Business"
ADD COLUMN IF NOT EXISTS "profileImageUrl" TEXT,
ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE IF NOT EXISTS "BusinessLike" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "businessId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BusinessLike_userId_idx" ON "BusinessLike"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BusinessLike_businessId_idx" ON "BusinessLike"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "BusinessLike_userId_businessId_key" ON "BusinessLike"("userId", "businessId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'BusinessLike_userId_fkey'
          AND table_name = 'BusinessLike'
    ) THEN
        ALTER TABLE "BusinessLike"
        ADD CONSTRAINT "BusinessLike_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'BusinessLike_businessId_fkey'
          AND table_name = 'BusinessLike'
    ) THEN
        ALTER TABLE "BusinessLike"
        ADD CONSTRAINT "BusinessLike_businessId_fkey"
        FOREIGN KEY ("businessId") REFERENCES "Business"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
