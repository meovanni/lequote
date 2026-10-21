import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261021103443 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "filiera_supplier_type" drop constraint if exists "filiera_supplier_type_name_unique";`);
    this.addSql(`alter table if exists "filiera_lot" drop constraint if exists "filiera_lot_packaging_establishment_id_foreign";`);

    this.addSql(`alter table if exists "filiera_campaign" drop constraint if exists "filiera_campaign_mill_id_foreign";`);

    this.addSql(`create table if not exists "filiera_supplier" ("id" text not null, "name" text not null, "municipality" text not null, "province" text null, "address" text null, "vat_number" text null, "internal_code" text null, "email" text null, "phone" text null, "notes" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "filiera_supplier_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_filiera_supplier_deleted_at" ON "filiera_supplier" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "filiera_supplier_type" ("id" text not null, "name" text not null, "code" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "filiera_supplier_type_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_filiera_supplier_type_name_unique" ON "filiera_supplier_type" ("name") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_filiera_supplier_type_deleted_at" ON "filiera_supplier_type" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "filiera_supplier_filiera_supplier_types" ("filiera_supplier_id" text not null, "filiera_supplier_type_id" text not null, constraint "filiera_supplier_filiera_supplier_types_pkey" primary key ("filiera_supplier_id", "filiera_supplier_type_id"));`);

    this.addSql(`alter table if exists "filiera_supplier_filiera_supplier_types" add constraint "filiera_supplier_filiera_supplier_types_filiera__717d8_foreign" foreign key ("filiera_supplier_id") references "filiera_supplier" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table if exists "filiera_supplier_filiera_supplier_types" add constraint "filiera_supplier_filiera_supplier_types_filiera__de062_foreign" foreign key ("filiera_supplier_type_id") references "filiera_supplier_type" ("id") on update cascade on delete cascade;`);

    // Fornitori unificati (2026-10-21): tipologie di sistema, poi frantoi e stabilimenti copiati
    // con gli stessi id, così campagne e lotti restano collegati senza toccare le loro colonne.
    this.addSql(`insert into "filiera_supplier_type" ("id", "name", "code") values
      ('sty_frantoio', 'Frantoio', 'frantoio'),
      ('sty_imbottigliamento', 'Imbottigliamento', 'imbottigliamento'),
      ('sty_invasettamento', 'Invasettamento', 'invasettamento'),
      ('sty_laboratorio', 'Laboratorio', 'laboratorio'),
      ('sty_packaging', 'Packaging', 'packaging')
      on conflict do nothing;`);
    this.addSql(`insert into "filiera_supplier" ("id", "name", "municipality", "province", "address", "vat_number", "notes", "created_at", "updated_at", "deleted_at")
      select "id", "name", "municipality", "province", "address", "vat_number", "notes", "created_at", "updated_at", "deleted_at" from "filiera_mill";`);
    this.addSql(`insert into "filiera_supplier_filiera_supplier_types" ("filiera_supplier_id", "filiera_supplier_type_id")
      select "id", 'sty_frantoio' from "filiera_mill";`);
    this.addSql(`insert into "filiera_supplier" ("id", "name", "municipality", "province", "address", "internal_code", "created_at", "updated_at", "deleted_at")
      select "id", "name", "municipality", "province", "address", "internal_code", "created_at", "updated_at", "deleted_at" from "filiera_establishment";`);
    this.addSql(`insert into "filiera_supplier_filiera_supplier_types" ("filiera_supplier_id", "filiera_supplier_type_id")
      select "id", 'sty_' || "role" from "filiera_establishment";`);

    this.addSql(`drop table if exists "filiera_establishment" cascade;`);

    this.addSql(`drop table if exists "filiera_mill" cascade;`);

    this.addSql(`alter table if exists "filiera_campaign" drop constraint if exists "filiera_campaign_mill_id_foreign";`);

    this.addSql(`alter table if exists "filiera_lot" drop constraint if exists "filiera_lot_packaging_establishment_id_foreign";`);

    this.addSql(`alter table if exists "filiera_campaign" add constraint "filiera_campaign_mill_id_foreign" foreign key ("mill_id") references "filiera_supplier" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table if exists "filiera_lot" add constraint "filiera_lot_packaging_establishment_id_foreign" foreign key ("packaging_establishment_id") references "filiera_supplier" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "filiera_campaign" drop constraint if exists "filiera_campaign_mill_id_foreign";`);

    this.addSql(`alter table if exists "filiera_lot" drop constraint if exists "filiera_lot_packaging_establishment_id_foreign";`);

    this.addSql(`alter table if exists "filiera_supplier_filiera_supplier_types" drop constraint if exists "filiera_supplier_filiera_supplier_types_filiera__717d8_foreign";`);

    this.addSql(`alter table if exists "filiera_supplier_filiera_supplier_types" drop constraint if exists "filiera_supplier_filiera_supplier_types_filiera__de062_foreign";`);

    this.addSql(`create table if not exists "filiera_establishment" ("id" text not null, "name" text not null, "role" text check ("role" in ('imbottigliamento', 'invasettamento', 'laboratorio')) not null, "municipality" text not null, "province" text null, "address" text null, "internal_code" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "filiera_establishment_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_filiera_establishment_deleted_at" ON "filiera_establishment" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "filiera_mill" ("id" text not null, "name" text not null, "municipality" text not null, "province" text null, "address" text null, "vat_number" text null, "notes" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "filiera_mill_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_filiera_mill_deleted_at" ON "filiera_mill" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`drop table if exists "filiera_supplier" cascade;`);

    this.addSql(`drop table if exists "filiera_supplier_type" cascade;`);

    this.addSql(`drop table if exists "filiera_supplier_filiera_supplier_types" cascade;`);

    this.addSql(`alter table if exists "filiera_campaign" drop constraint if exists "filiera_campaign_mill_id_foreign";`);

    this.addSql(`alter table if exists "filiera_lot" drop constraint if exists "filiera_lot_packaging_establishment_id_foreign";`);

    this.addSql(`alter table if exists "filiera_campaign" add constraint "filiera_campaign_mill_id_foreign" foreign key ("mill_id") references "filiera_mill" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table if exists "filiera_lot" add constraint "filiera_lot_packaging_establishment_id_foreign" foreign key ("packaging_establishment_id") references "filiera_establishment" ("id") on update cascade on delete set null;`);
  }

}
