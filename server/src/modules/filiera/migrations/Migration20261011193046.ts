import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261011193046 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "filiera_lot" drop constraint if exists "filiera_lot_code_unique";`);
    this.addSql(`create table if not exists "filiera_apiary" ("id" text not null, "name" text not null, "municipality" text not null, "province" text null, "elevation_m" integer null, "hive_count" integer null, "bda_code" text null, "notes" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "filiera_apiary_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_filiera_apiary_deleted_at" ON "filiera_apiary" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "filiera_establishment" ("id" text not null, "name" text not null, "role" text check ("role" in ('imbottigliamento', 'invasettamento', 'laboratorio')) not null, "municipality" text not null, "province" text null, "address" text null, "internal_code" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "filiera_establishment_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_filiera_establishment_deleted_at" ON "filiera_establishment" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "filiera_grove" ("id" text not null, "name" text not null, "municipality" text not null, "province" text null, "elevation_m" integer null, "area_ha" real null, "cultivars" text[] not null, "sian_code" text null, "notes" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "filiera_grove_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_filiera_grove_deleted_at" ON "filiera_grove" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "filiera_mill" ("id" text not null, "name" text not null, "municipality" text not null, "province" text null, "address" text null, "vat_number" text null, "notes" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "filiera_mill_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_filiera_mill_deleted_at" ON "filiera_mill" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "filiera_campaign" ("id" text not null, "product_line" text check ("product_line" in ('olio', 'miele')) not null, "label" text not null, "harvest_start" timestamptz null, "harvest_end" timestamptz null, "notes" text null, "mill_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "filiera_campaign_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_filiera_campaign_mill_id" ON "filiera_campaign" ("mill_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_filiera_campaign_deleted_at" ON "filiera_campaign" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "filiera_lot" ("id" text not null, "code" text not null, "status" text check ("status" in ('draft', 'published')) not null default 'draft', "product_line" text check ("product_line" in ('olio', 'miele')) not null, "product_name" text not null, "nominal_quantity" text null, "origin" text not null default 'Italia', "packaging_date" timestamptz null, "best_before" timestamptz null, "units" integer null, "notes" text null, "campaign_id" text not null, "packaging_establishment_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "filiera_lot_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_filiera_lot_code_unique" ON "filiera_lot" ("code") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_filiera_lot_campaign_id" ON "filiera_lot" ("campaign_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_filiera_lot_packaging_establishment_id" ON "filiera_lot" ("packaging_establishment_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_filiera_lot_deleted_at" ON "filiera_lot" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "filiera_lot_stage" ("id" text not null, "name" text not null, "position" integer not null, "date" timestamptz null, "place" text null, "fields" jsonb not null, "template_id" text null, "lot_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "filiera_lot_stage_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_filiera_lot_stage_lot_id" ON "filiera_lot_stage" ("lot_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_filiera_lot_stage_deleted_at" ON "filiera_lot_stage" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "filiera_analysis" ("id" text not null, "title" text not null, "lab" text null, "date" timestamptz null, "file_url" text not null, "visibility" text check ("visibility" in ('public', 'internal')) not null default 'internal', "results" jsonb null, "campaign_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "filiera_analysis_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_filiera_analysis_campaign_id" ON "filiera_analysis" ("campaign_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_filiera_analysis_deleted_at" ON "filiera_analysis" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "filiera_campaign_filiera_groves" ("filiera_campaign_id" text not null, "filiera_grove_id" text not null, constraint "filiera_campaign_filiera_groves_pkey" primary key ("filiera_campaign_id", "filiera_grove_id"));`);

    this.addSql(`create table if not exists "filiera_apiary_filiera_campaigns" ("filiera_apiary_id" text not null, "filiera_campaign_id" text not null, constraint "filiera_apiary_filiera_campaigns_pkey" primary key ("filiera_apiary_id", "filiera_campaign_id"));`);

    this.addSql(`create table if not exists "filiera_stage_template" ("id" text not null, "product_line" text check ("product_line" in ('olio', 'miele')) not null, "name" text not null, "position" integer not null, "description" text null, "fields" jsonb not null, "active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "filiera_stage_template_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_filiera_stage_template_deleted_at" ON "filiera_stage_template" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "filiera_campaign" add constraint "filiera_campaign_mill_id_foreign" foreign key ("mill_id") references "filiera_mill" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table if exists "filiera_lot" add constraint "filiera_lot_campaign_id_foreign" foreign key ("campaign_id") references "filiera_campaign" ("id") on update cascade;`);
    this.addSql(`alter table if exists "filiera_lot" add constraint "filiera_lot_packaging_establishment_id_foreign" foreign key ("packaging_establishment_id") references "filiera_establishment" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table if exists "filiera_lot_stage" add constraint "filiera_lot_stage_lot_id_foreign" foreign key ("lot_id") references "filiera_lot" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table if exists "filiera_analysis" add constraint "filiera_analysis_campaign_id_foreign" foreign key ("campaign_id") references "filiera_campaign" ("id") on update cascade;`);

    this.addSql(`alter table if exists "filiera_campaign_filiera_groves" add constraint "filiera_campaign_filiera_groves_filiera_campaign_id_foreign" foreign key ("filiera_campaign_id") references "filiera_campaign" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table if exists "filiera_campaign_filiera_groves" add constraint "filiera_campaign_filiera_groves_filiera_grove_id_foreign" foreign key ("filiera_grove_id") references "filiera_grove" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table if exists "filiera_apiary_filiera_campaigns" add constraint "filiera_apiary_filiera_campaigns_filiera_apiary_id_foreign" foreign key ("filiera_apiary_id") references "filiera_apiary" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table if exists "filiera_apiary_filiera_campaigns" add constraint "filiera_apiary_filiera_campaigns_filiera_campaign_id_foreign" foreign key ("filiera_campaign_id") references "filiera_campaign" ("id") on update cascade on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "filiera_apiary_filiera_campaigns" drop constraint if exists "filiera_apiary_filiera_campaigns_filiera_apiary_id_foreign";`);

    this.addSql(`alter table if exists "filiera_lot" drop constraint if exists "filiera_lot_packaging_establishment_id_foreign";`);

    this.addSql(`alter table if exists "filiera_campaign_filiera_groves" drop constraint if exists "filiera_campaign_filiera_groves_filiera_grove_id_foreign";`);

    this.addSql(`alter table if exists "filiera_campaign" drop constraint if exists "filiera_campaign_mill_id_foreign";`);

    this.addSql(`alter table if exists "filiera_lot" drop constraint if exists "filiera_lot_campaign_id_foreign";`);

    this.addSql(`alter table if exists "filiera_analysis" drop constraint if exists "filiera_analysis_campaign_id_foreign";`);

    this.addSql(`alter table if exists "filiera_campaign_filiera_groves" drop constraint if exists "filiera_campaign_filiera_groves_filiera_campaign_id_foreign";`);

    this.addSql(`alter table if exists "filiera_apiary_filiera_campaigns" drop constraint if exists "filiera_apiary_filiera_campaigns_filiera_campaign_id_foreign";`);

    this.addSql(`alter table if exists "filiera_lot_stage" drop constraint if exists "filiera_lot_stage_lot_id_foreign";`);

    this.addSql(`drop table if exists "filiera_apiary" cascade;`);

    this.addSql(`drop table if exists "filiera_establishment" cascade;`);

    this.addSql(`drop table if exists "filiera_grove" cascade;`);

    this.addSql(`drop table if exists "filiera_mill" cascade;`);

    this.addSql(`drop table if exists "filiera_campaign" cascade;`);

    this.addSql(`drop table if exists "filiera_lot" cascade;`);

    this.addSql(`drop table if exists "filiera_lot_stage" cascade;`);

    this.addSql(`drop table if exists "filiera_analysis" cascade;`);

    this.addSql(`drop table if exists "filiera_campaign_filiera_groves" cascade;`);

    this.addSql(`drop table if exists "filiera_apiary_filiera_campaigns" cascade;`);

    this.addSql(`drop table if exists "filiera_stage_template" cascade;`);
  }

}
