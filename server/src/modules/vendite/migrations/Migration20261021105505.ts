import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261021105505 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "sale_payment" ("id" text not null, "order_id" text not null, "amount" numeric not null, "method" text check ("method" in ('contanti', 'bonifico', 'assegno', 'carta', 'altro')) not null, "paid_at" timestamptz not null, "recorded_by_type" text check ("recorded_by_type" in ('admin', 'agente')) not null, "recorded_by_id" text not null, "recorded_by_name" text not null, "notes" text null, "raw_amount" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "sale_payment_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_sale_payment_order_id" ON "sale_payment" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_sale_payment_deleted_at" ON "sale_payment" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "sales_agent" ("id" text not null, "name" text not null, "email" text null, "phone" text null, "active" boolean not null default true, "notes" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "sales_agent_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_sales_agent_deleted_at" ON "sales_agent" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "sale_payment" cascade;`);

    this.addSql(`drop table if exists "sales_agent" cascade;`);
  }

}
