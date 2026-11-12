CREATE TYPE "public"."environment_type" AS ENUM('development', 'production');--> statement-breakpoint
CREATE TABLE "environment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"type" "environment_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "environment" ADD CONSTRAINT "environment_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "environment_project_id_type_unique" ON "environment" USING btree ("project_id","type");--> statement-breakpoint
-- Backfill: projects created before environments existed get the same defaults as new ones.
INSERT INTO "environment" ("project_id", "type")
SELECT "project"."id", "defaults"."type"::"environment_type"
FROM "project"
CROSS JOIN (VALUES ('development'), ('production')) AS "defaults"("type")
ON CONFLICT ("project_id", "type") DO NOTHING;