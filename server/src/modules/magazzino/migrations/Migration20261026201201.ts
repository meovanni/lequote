import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261026201201 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "stock_count" drop constraint if exists "stock_count_sku_unique";`);
    this.addSql(`create table if not exists "stock_count" ("id" text not null, "sku" text not null, "quantity" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "stock_count_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_stock_count_sku_unique" ON "stock_count" ("sku") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_stock_count_deleted_at" ON "stock_count" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "stock_movement" ("id" text not null, "sku" text not null, "delta" integer not null, "kind" text check ("kind" in ('rettifica', 'confezionamento', 'consegna', 'annullo_consegna')) not null, "order_id" text null, "actor_name" text null, "note" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "stock_movement_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_stock_movement_order_id" ON "stock_movement" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_stock_movement_deleted_at" ON "stock_movement" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "stock_count" cascade;`);

    this.addSql(`drop table if exists "stock_movement" cascade;`);
  }

}
