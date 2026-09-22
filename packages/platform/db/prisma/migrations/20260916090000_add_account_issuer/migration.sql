-- AlterTable: add issuer as nullable first so any existing rows can be
-- backfilled before it becomes required. Better Auth's own value format
-- (packages: @better-auth/core/dist/db/schema/account.mjs):
--   - "local:credential" for password (credential) accounts
--   - "local:oauth:<providerId>" for OAuth accounts (e.g. "local:oauth:google")
ALTER TABLE "account" ADD COLUMN     "issuer" TEXT;

-- Backfill existing rows before enforcing NOT NULL.
UPDATE "account"
SET "issuer" = CASE
  WHEN "password" IS NOT NULL THEN 'local:credential'
  ELSE 'local:oauth:' || "providerId"
END
WHERE "issuer" IS NULL;

-- AlterTable: now safe to require it.
ALTER TABLE "account" ALTER COLUMN "issuer" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "account_issuer_accountId_key" ON "account"("issuer", "accountId");
