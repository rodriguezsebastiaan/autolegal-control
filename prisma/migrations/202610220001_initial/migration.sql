-- CreateEnum
CREATE TYPE "OrganizationMode" AS ENUM ('PRODUCTION', 'DEMO');

-- CreateEnum
CREATE TYPE "RoleCode" AS ENUM ('ADMIN', 'SUPERVISOR', 'DOCUMENT_MANAGER', 'VIEWER');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "PersonType" AS ENUM ('NATURAL', 'LEGAL');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DocumentProcessStatus" AS ENUM ('NONE', 'PENDING', 'CONTACTED', 'IN_PROGRESS', 'WAITING_DOCUMENTS', 'PENDING_VALIDATION', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AlertEventStatus" AS ENUM ('OPEN', 'REVIEWED', 'RESOLVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('INTERNAL', 'EMAIL');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'DISABLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RenewalStatus" AS ENUM ('PENDING', 'OWNER_CONTACTED', 'IN_PROGRESS', 'WAITING_DOCUMENTS', 'PENDING_VALIDATION', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mode" "OrganizationMode" NOT NULL DEFAULT 'PRODUCTION',
    "timezone" TEXT NOT NULL DEFAULT 'America/Bogota',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "code" "RoleCode" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_categories" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owners" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "person_type" "PersonType" NOT NULL,
    "identification_type" TEXT NOT NULL,
    "identification_number" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_companies" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "nit" TEXT NOT NULL,
    "business_name" TEXT NOT NULL,
    "address" TEXT,
    "contact_name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "modality" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transport_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "identification_type" TEXT NOT NULL,
    "identification_number" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "license_number" TEXT,
    "license_category" TEXT,
    "license_expires_at" DATE,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "internal_number" TEXT,
    "vehicle_class" TEXT,
    "brand" TEXT NOT NULL,
    "line" TEXT NOT NULL,
    "model" TEXT,
    "year" INTEGER,
    "color" TEXT,
    "vin" TEXT,
    "chassis_number" TEXT,
    "engine_number" TEXT,
    "fuel_type" TEXT,
    "passenger_capacity" INTEGER,
    "engine_displacement" INTEGER,
    "registration_date" DATE,
    "transit_authority" TEXT,
    "service_type" TEXT,
    "transport_modality" TEXT,
    "operation_radius" TEXT,
    "affiliation_contract" TEXT,
    "affiliation_date" DATE,
    "status" "VehicleStatus" NOT NULL DEFAULT 'ACTIVE',
    "responsible_name" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_owners" (
    "id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "starts_at" DATE NOT NULL,
    "ends_at" DATE,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_affiliations" (
    "id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "starts_at" DATE NOT NULL,
    "ends_at" DATE,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_affiliations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_drivers" (
    "id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "starts_at" DATE NOT NULL,
    "ends_at" DATE,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_types" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "has_expiration" BOOLEAN NOT NULL DEFAULT true,
    "default_alert_days" INTEGER[] DEFAULT ARRAY[60, 30, 20, 17, 10, 5, 3, 1, 0]::INTEGER[],
    "requires_legal_review" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_requirements" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "document_type_id" TEXT NOT NULL,
    "category_id" TEXT,
    "vehicle_class" TEXT,
    "service_type" TEXT,
    "transport_modality" TEXT,
    "applicable" BOOLEAN NOT NULL DEFAULT true,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "document_type_id" TEXT NOT NULL,
    "vehicle_id" TEXT,
    "owner_id" TEXT,
    "company_id" TEXT,
    "driver_id" TEXT,
    "responsible_user_id" TEXT,
    "number" TEXT,
    "issuer" TEXT,
    "issued_at" DATE,
    "valid_from" DATE,
    "expires_at" DATE,
    "payment_due_at" DATE,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "process_status" "DocumentProcessStatus" NOT NULL DEFAULT 'NONE',
    "verified_at" TIMESTAMP(3),
    "file_key" TEXT,
    "original_file_name" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_versions" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "number" TEXT,
    "issuer" TEXT,
    "issued_at" DATE,
    "valid_from" DATE,
    "expires_at" DATE,
    "verification_status" "VerificationStatus" NOT NULL,
    "file_key" TEXT,
    "original_file_name" TEXT,
    "notes" TEXT,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_rules" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "document_type_id" TEXT NOT NULL,
    "company_id" TEXT,
    "vehicle_id" TEXT,
    "advance_days" INTEGER NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'INTERNAL',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "escalation" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_events" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "alert_rule_id" TEXT NOT NULL,
    "responsible_user_id" TEXT,
    "trigger_date" DATE NOT NULL,
    "status" "AlertEventStatus" NOT NULL DEFAULT 'OPEN',
    "reviewed_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_deliveries" (
    "id" TEXT NOT NULL,
    "alert_event_id" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "provider_ref" TEXT,
    "error_message" TEXT,
    "attempted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "renewal_tasks" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "responsible_user_id" TEXT NOT NULL,
    "closed_by_user_id" TEXT,
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "next_action_at" TIMESTAMP(3),
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "RenewalStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "renewal_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "renewal_comments" (
    "id" TEXT NOT NULL,
    "renewal_task_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "renewal_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "metadata" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");

-- CreateIndex
CREATE INDEX "users_organization_id_active_idx" ON "users"("organization_id", "active");

-- CreateIndex
CREATE UNIQUE INDEX "users_organization_id_email_key" ON "users"("organization_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_expires_at_idx" ON "sessions"("user_id", "expires_at");

-- CreateIndex
CREATE INDEX "vehicle_categories_organization_id_active_idx" ON "vehicle_categories"("organization_id", "active");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_categories_organization_id_name_key" ON "vehicle_categories"("organization_id", "name");

-- CreateIndex
CREATE INDEX "owners_organization_id_display_name_idx" ON "owners"("organization_id", "display_name");

-- CreateIndex
CREATE UNIQUE INDEX "owners_organization_id_identification_number_key" ON "owners"("organization_id", "identification_number");

-- CreateIndex
CREATE INDEX "transport_companies_organization_id_business_name_idx" ON "transport_companies"("organization_id", "business_name");

-- CreateIndex
CREATE UNIQUE INDEX "transport_companies_organization_id_nit_key" ON "transport_companies"("organization_id", "nit");

-- CreateIndex
CREATE INDEX "drivers_organization_id_full_name_idx" ON "drivers"("organization_id", "full_name");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_organization_id_identification_number_key" ON "drivers"("organization_id", "identification_number");

-- CreateIndex
CREATE INDEX "vehicles_organization_id_plate_idx" ON "vehicles"("organization_id", "plate");

-- CreateIndex
CREATE INDEX "vehicles_organization_id_category_id_status_idx" ON "vehicles"("organization_id", "category_id", "status");

-- CreateIndex
CREATE INDEX "vehicles_organization_id_status_idx" ON "vehicles"("organization_id", "status");

-- CreateIndex
CREATE INDEX "vehicle_owners_vehicle_id_is_current_idx" ON "vehicle_owners"("vehicle_id", "is_current");

-- CreateIndex
CREATE INDEX "vehicle_owners_owner_id_is_current_idx" ON "vehicle_owners"("owner_id", "is_current");

-- CreateIndex
CREATE INDEX "vehicle_affiliations_vehicle_id_is_current_idx" ON "vehicle_affiliations"("vehicle_id", "is_current");

-- CreateIndex
CREATE INDEX "vehicle_affiliations_company_id_is_current_idx" ON "vehicle_affiliations"("company_id", "is_current");

-- CreateIndex
CREATE INDEX "vehicle_drivers_vehicle_id_is_current_idx" ON "vehicle_drivers"("vehicle_id", "is_current");

-- CreateIndex
CREATE INDEX "vehicle_drivers_driver_id_is_current_idx" ON "vehicle_drivers"("driver_id", "is_current");

-- CreateIndex
CREATE INDEX "document_types_organization_id_active_idx" ON "document_types"("organization_id", "active");

-- CreateIndex
CREATE UNIQUE INDEX "document_types_organization_id_code_key" ON "document_types"("organization_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "document_types_organization_id_name_key" ON "document_types"("organization_id", "name");

-- CreateIndex
CREATE INDEX "document_requirements_organization_id_document_type_id_idx" ON "document_requirements"("organization_id", "document_type_id");

-- CreateIndex
CREATE INDEX "document_requirements_category_id_idx" ON "document_requirements"("category_id");

-- CreateIndex
CREATE INDEX "documents_organization_id_expires_at_idx" ON "documents"("organization_id", "expires_at");

-- CreateIndex
CREATE INDEX "documents_vehicle_id_document_type_id_idx" ON "documents"("vehicle_id", "document_type_id");

-- CreateIndex
CREATE INDEX "documents_verification_status_expires_at_idx" ON "documents"("verification_status", "expires_at");

-- CreateIndex
CREATE INDEX "document_versions_document_id_created_at_idx" ON "document_versions"("document_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "document_versions_document_id_version_key" ON "document_versions"("document_id", "version");

-- CreateIndex
CREATE INDEX "alert_rules_organization_id_active_idx" ON "alert_rules"("organization_id", "active");

-- CreateIndex
CREATE UNIQUE INDEX "alert_rules_organization_id_document_type_id_company_id_veh_key" ON "alert_rules"("organization_id", "document_type_id", "company_id", "vehicle_id", "advance_days", "channel");

-- CreateIndex
CREATE INDEX "alert_events_organization_id_status_trigger_date_idx" ON "alert_events"("organization_id", "status", "trigger_date");

-- CreateIndex
CREATE UNIQUE INDEX "alert_events_document_id_alert_rule_id_trigger_date_key" ON "alert_events"("document_id", "alert_rule_id", "trigger_date");

-- CreateIndex
CREATE INDEX "notification_deliveries_status_created_at_idx" ON "notification_deliveries"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "notification_deliveries_alert_event_id_recipient_channel_at_key" ON "notification_deliveries"("alert_event_id", "recipient", "channel", "attempt");

-- CreateIndex
CREATE INDEX "renewal_tasks_organization_id_status_next_action_at_idx" ON "renewal_tasks"("organization_id", "status", "next_action_at");

-- CreateIndex
CREATE INDEX "renewal_tasks_responsible_user_id_status_idx" ON "renewal_tasks"("responsible_user_id", "status");

-- CreateIndex
CREATE INDEX "renewal_comments_renewal_task_id_created_at_idx" ON "renewal_comments"("renewal_task_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_organization_id_created_at_idx" ON "audit_logs"("organization_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_categories" ADD CONSTRAINT "vehicle_categories_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owners" ADD CONSTRAINT "owners_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_companies" ADD CONSTRAINT "transport_companies_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "vehicle_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_owners" ADD CONSTRAINT "vehicle_owners_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_owners" ADD CONSTRAINT "vehicle_owners_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_affiliations" ADD CONSTRAINT "vehicle_affiliations_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_affiliations" ADD CONSTRAINT "vehicle_affiliations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "transport_companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_drivers" ADD CONSTRAINT "vehicle_drivers_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_drivers" ADD CONSTRAINT "vehicle_drivers_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_types" ADD CONSTRAINT "document_types_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_requirements" ADD CONSTRAINT "document_requirements_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_requirements" ADD CONSTRAINT "document_requirements_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "document_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_requirements" ADD CONSTRAINT "document_requirements_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "vehicle_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "document_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "transport_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_responsible_user_id_fkey" FOREIGN KEY ("responsible_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_rules" ADD CONSTRAINT "alert_rules_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_rules" ADD CONSTRAINT "alert_rules_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "document_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_events" ADD CONSTRAINT "alert_events_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_events" ADD CONSTRAINT "alert_events_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_events" ADD CONSTRAINT "alert_events_alert_rule_id_fkey" FOREIGN KEY ("alert_rule_id") REFERENCES "alert_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_events" ADD CONSTRAINT "alert_events_responsible_user_id_fkey" FOREIGN KEY ("responsible_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_alert_event_id_fkey" FOREIGN KEY ("alert_event_id") REFERENCES "alert_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renewal_tasks" ADD CONSTRAINT "renewal_tasks_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renewal_tasks" ADD CONSTRAINT "renewal_tasks_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renewal_tasks" ADD CONSTRAINT "renewal_tasks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renewal_tasks" ADD CONSTRAINT "renewal_tasks_responsible_user_id_fkey" FOREIGN KEY ("responsible_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renewal_tasks" ADD CONSTRAINT "renewal_tasks_closed_by_user_id_fkey" FOREIGN KEY ("closed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renewal_comments" ADD CONSTRAINT "renewal_comments_renewal_task_id_fkey" FOREIGN KEY ("renewal_task_id") REFERENCES "renewal_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renewal_comments" ADD CONSTRAINT "renewal_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Restricciones de dominio que Prisma todavía no expresa directamente.
ALTER TABLE "documents" ADD CONSTRAINT "documents_exactly_one_subject_check"
CHECK (num_nonnulls("vehicle_id", "owner_id", "company_id", "driver_id") = 1);

CREATE UNIQUE INDEX "vehicles_active_plate_unique"
ON "vehicles" ("organization_id", "plate")
WHERE "status" <> 'INACTIVE';

CREATE UNIQUE INDEX "vehicle_owners_one_current_unique"
ON "vehicle_owners" ("vehicle_id")
WHERE "is_current" = true;

CREATE UNIQUE INDEX "vehicle_affiliations_one_current_unique"
ON "vehicle_affiliations" ("vehicle_id")
WHERE "is_current" = true;

CREATE UNIQUE INDEX "vehicle_drivers_one_current_unique"
ON "vehicle_drivers" ("vehicle_id")
WHERE "is_current" = true;

CREATE UNIQUE INDEX "alert_rules_scope_unique"
ON "alert_rules" (
  "organization_id",
  "document_type_id",
  COALESCE("company_id", ''),
  COALESCE("vehicle_id", ''),
  "advance_days",
  "channel"
);
