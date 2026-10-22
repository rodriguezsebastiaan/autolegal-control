-- El código de organización hace explícito el tenant durante el inicio de sesión.
-- El backfill es determinista y único para instalaciones que ya aplicaron la migración inicial.
ALTER TABLE "organizations" ADD COLUMN "login_code" TEXT;

UPDATE "organizations"
SET "login_code" = 'org-' || lower("id")
WHERE "login_code" IS NULL;

ALTER TABLE "organizations" ALTER COLUMN "login_code" SET NOT NULL;
CREATE UNIQUE INDEX "organizations_login_code_key" ON "organizations"("login_code");
