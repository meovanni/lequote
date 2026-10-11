import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261011200521 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "filiera_analysis" add column if not exists "content_type" text not null;`);
    this.addSql(`alter table if exists "filiera_analysis" rename column "file_url" to "file_key";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "filiera_analysis" drop column if exists "content_type";`);

    this.addSql(`alter table if exists "filiera_analysis" rename column "file_key" to "file_url";`);
  }

}
