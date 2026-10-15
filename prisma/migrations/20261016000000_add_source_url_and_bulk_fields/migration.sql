-- AlterTable: Add bulk import and scope fields to Scheme
ALTER TABLE "Scheme" ADD COLUMN IF NOT EXISTS "sourceUrl" TEXT;
ALTER TABLE "Scheme" ADD COLUMN IF NOT EXISTS "level" TEXT NOT NULL DEFAULT 'CENTRAL';
ALTER TABLE "Scheme" ADD COLUMN IF NOT EXISTS "state" TEXT;
ALTER TABLE "Scheme" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "Scheme" ADD COLUMN IF NOT EXISTS "lastVerified" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex: Ensure slug is unique for safe upserts
CREATE UNIQUE INDEX IF NOT EXISTS "Scheme_slug_key" ON "Scheme"("slug");
