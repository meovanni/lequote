import { Migration } from "@medusajs/framework/mikro-orm/migrations";

// DDT e fatture di cortesia (models/document.ts).
export class Migration20261110120000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "sales_document" ("id" text not null, "kind" text check ("kind" in ('ddt', 'fattura')) not null, "year" integer not null, "number" integer not null, "issued_at" timestamptz not null, "status" text check ("status" in ('issued', 'canceled')) not null default 'issued', "customer_key" text not null, "customer_name" text not null, "total" numeric null, "data" jsonb not null, "issued_by" text null, "raw_total" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "sales_document_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_sales_document_deleted_at" ON "sales_document" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_sales_document_customer_key" ON "sales_document" ("customer_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_sales_document_kind_year_number" ON "sales_document" ("kind", "year", "number") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "sales_document_order" ("id" text not null, "order_id" text not null, "document_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "sales_document_order_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_sales_document_order_deleted_at" ON "sales_document_order" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_sales_document_order_order_id" ON "sales_document_order" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_sales_document_order_document_id" ON "sales_document_order" ("document_id") WHERE deleted_at IS NULL;`);
    this.addSql(`alter table if exists "sales_document_order" add constraint "sales_document_order_document_id_foreign" foreign key ("document_id") references "sales_document" ("id") on update cascade on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "sales_document_order" cascade;`);
    this.addSql(`drop table if exists "sales_document" cascade;`);
  }

}
