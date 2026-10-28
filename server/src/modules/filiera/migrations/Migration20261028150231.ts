import { Migration } from "@medusajs/framework/mikro-orm/migrations";

// La "quantità nominale" a testo libero e i "pezzi prodotti" diventano quantità prodotta (L/kg) e
// confezioni (formato × pezzi). I dati esistenti si spostano prima di togliere le colonne: un
// numero da 25 in su era il totale del lotto, uno più piccolo la misura di una confezione (con i
// pezzi, se c'erano).
export class Migration20261028150231 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "filiera_lot" add column if not exists "produced_quantity" real null, add column if not exists "packages" jsonb null;`);

    this.addSql(`
      with parsed as (
        select id, units, replace(substring(nominal_quantity from '\\d+(?:[.,]\\d+)?'), ',', '.')::real as amount
        from "filiera_lot"
        where nominal_quantity ~ '\\d'
      )
      update "filiera_lot" lot set
        produced_quantity = case when parsed.amount >= 25 then parsed.amount else lot.produced_quantity end,
        packages = case
          when parsed.amount < 25 then jsonb_build_array(jsonb_build_object('size', parsed.amount, 'count', parsed.units))
          else lot.packages
        end
      from parsed
      where lot.id = parsed.id;
    `);

    this.addSql(`alter table if exists "filiera_lot" drop column if exists "nominal_quantity", drop column if exists "units";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "filiera_lot" add column if not exists "nominal_quantity" text null, add column if not exists "units" integer null;`);

    this.addSql(`alter table if exists "filiera_lot" drop column if exists "produced_quantity", drop column if exists "packages";`);
  }

}
