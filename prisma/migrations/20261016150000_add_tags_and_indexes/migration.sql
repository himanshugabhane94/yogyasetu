-- AlterTable: Add tags field to Scheme
ALTER TABLE "Scheme" ADD COLUMN IF NOT EXISTS "tags" TEXT DEFAULT '';

-- CreateIndex: Add performance indexes for Scheme queries
CREATE INDEX IF NOT EXISTS "Scheme_categoryId_idx" ON "Scheme"("categoryId");
CREATE INDEX IF NOT EXISTS "Scheme_state_idx" ON "Scheme"("state");
CREATE INDEX IF NOT EXISTS "Scheme_level_idx" ON "Scheme"("level");
CREATE INDEX IF NOT EXISTS "Scheme_status_idx" ON "Scheme"("status");
