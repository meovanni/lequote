import { Migration } from "@medusajs/framework/mikro-orm/migrations";

// Codice dei QR già stampati, quando il codice del lotto cambia dopo la stampa (models/lot.ts).
export class Migration20261110090000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "filiera_lot" add column if not exists "qr_code" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "filiera_lot" drop column if exists "qr_code";`);
  }

}
