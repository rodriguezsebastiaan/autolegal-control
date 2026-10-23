-- P0-04: separación entre creación y revisión documental.
ALTER TABLE "documents"
  ADD COLUMN "created_by_id" TEXT,
  ADD COLUMN "verified_by_id" TEXT,
  ADD COLUMN "reviewed_at" TIMESTAMP(3),
  ADD COLUMN "rejection_reason" TEXT;

ALTER TABLE "document_versions"
  ADD COLUMN "responsible_user_id" TEXT,
  ADD COLUMN "reviewed_by_id" TEXT,
  ADD COLUMN "reviewed_at" TIMESTAMP(3),
  ADD COLUMN "rejection_reason" TEXT;

UPDATE "documents" AS d
SET "created_by_id" = (
  SELECT dv."created_by_id"
  FROM "document_versions" AS dv
  WHERE dv."document_id" = d."id"
  ORDER BY dv."version" ASC
  LIMIT 1
)
WHERE d."created_by_id" IS NULL;

UPDATE "document_versions" AS v
SET "responsible_user_id" = d."responsible_user_id"
FROM "documents" AS d
WHERE v."document_id" = d."id" AND v."responsible_user_id" IS NULL;

ALTER TABLE "documents" ADD CONSTRAINT "documents_created_by_id_fkey"
  FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "documents_verified_by_id_fkey"
  FOREIGN KEY ("verified_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_created_by_id_fkey"
  FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_responsible_user_id_fkey"
  FOREIGN KEY ("responsible_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_reviewed_by_id_fkey"
  FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "documents_organization_id_verification_status_idx"
  ON "documents"("organization_id", "verification_status");
CREATE INDEX "document_versions_document_id_verification_status_idx"
  ON "document_versions"("document_id", "verification_status");
CREATE UNIQUE INDEX "document_versions_one_pending_unique"
  ON "document_versions"("document_id")
  WHERE "verification_status" = 'PENDING';

-- P0-05: trazabilidad de cada ejecución y cada decisión del motor de alertas.
CREATE TYPE "AlertRunStatus" AS ENUM ('RUNNING', 'COMPLETED', 'PARTIAL', 'FAILED', 'SKIPPED_CONCURRENT');
CREATE TYPE "AlertEvaluationOutcome" AS ENUM ('GENERATED', 'RECOVERED', 'ALREADY_EXISTS', 'OMITTED', 'FAILED');

CREATE TABLE "alert_evaluation_runs" (
  "id" TEXT NOT NULL,
  "evaluation_date" DATE NOT NULL,
  "recovery_days" INTEGER NOT NULL,
  "status" "AlertRunStatus" NOT NULL DEFAULT 'RUNNING',
  "evaluated" INTEGER NOT NULL DEFAULT 0,
  "generated" INTEGER NOT NULL DEFAULT 0,
  "recovered" INTEGER NOT NULL DEFAULT 0,
  "already_exists" INTEGER NOT NULL DEFAULT 0,
  "omitted" INTEGER NOT NULL DEFAULT 0,
  "failed" INTEGER NOT NULL DEFAULT 0,
  "error_message" TEXT,
  "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP(3),
  CONSTRAINT "alert_evaluation_runs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "alert_evaluation_runs_recovery_days_check" CHECK ("recovery_days" BETWEEN 0 AND 30)
);

CREATE TABLE "alert_evaluation_logs" (
  "id" TEXT NOT NULL,
  "run_id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "document_id" TEXT NOT NULL,
  "alert_rule_id" TEXT NOT NULL,
  "event_id" TEXT,
  "scheduled_date" DATE NOT NULL,
  "outcome" "AlertEvaluationOutcome" NOT NULL,
  "reason" TEXT,
  "error_message" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "alert_evaluation_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "alert_evaluation_runs_evaluation_date_status_idx"
  ON "alert_evaluation_runs"("evaluation_date", "status");
CREATE INDEX "alert_evaluation_logs_run_id_outcome_idx"
  ON "alert_evaluation_logs"("run_id", "outcome");
CREATE INDEX "alert_evaluation_logs_organization_id_scheduled_date_idx"
  ON "alert_evaluation_logs"("organization_id", "scheduled_date");

ALTER TABLE "alert_evaluation_logs" ADD CONSTRAINT "alert_evaluation_logs_run_id_fkey"
  FOREIGN KEY ("run_id") REFERENCES "alert_evaluation_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "alert_evaluation_logs" ADD CONSTRAINT "alert_evaluation_logs_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "alert_evaluation_logs" ADD CONSTRAINT "alert_evaluation_logs_document_id_fkey"
  FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "alert_evaluation_logs" ADD CONSTRAINT "alert_evaluation_logs_alert_rule_id_fkey"
  FOREIGN KEY ("alert_rule_id") REFERENCES "alert_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "alert_evaluation_logs" ADD CONSTRAINT "alert_evaluation_logs_event_id_fkey"
  FOREIGN KEY ("event_id") REFERENCES "alert_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
