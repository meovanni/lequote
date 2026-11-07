import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261105101428 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "content_entry" drop constraint if exists "content_entry_key_scope_unique";`);
    this.addSql(`create table if not exists "content_entry" ("id" text not null, "key" text not null, "scope" text check ("scope" in ('it', 'en', 'de', 'shared')) not null, "draft" text null, "published" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "content_entry_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_content_entry_deleted_at" ON "content_entry" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_content_entry_key_scope_unique" ON "content_entry" ("key", "scope") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "content_publication" ("id" text not null, "status" text check ("status" in ('running', 'done', 'failed')) not null, "changes" integer not null, "finished_at" timestamptz null, "error" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "content_publication_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_content_publication_deleted_at" ON "content_publication" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "content_entry" cascade;`);

    this.addSql(`drop table if exists "content_publication" cascade;`);
  }

}
