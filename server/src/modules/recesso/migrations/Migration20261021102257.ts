import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261021102257 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "withdrawal" ("id" text not null, "name" text not null, "email" text not null, "order_reference" text not null, "order_id" text null, "details" text null, "locale" text not null, "submitted_at" timestamptz not null, "handled_at" timestamptz null, "notes" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "withdrawal_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_withdrawal_deleted_at" ON "withdrawal" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "withdrawal" cascade;`);
  }

}
