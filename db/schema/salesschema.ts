import { sql } from "drizzle-orm";
import { integer, real, text, sqliteTable } from "drizzle-orm/sqlite-core";
import { productsTable } from "./productschema";

export const salesTable = sqliteTable("sales", {
  id: integer("id").primaryKey(),
  product_id: integer("product_id").notNull().references(() => productsTable.id),
  quantity: integer("quantity").notNull(),
  total_amount: real("total_amount").notNull(),
  sale_date: text('sale_date').default(sql`CURRENT_TIMESTAMP`),
  customer_name: text('customer_name').notNull(),
  region: text('region').notNull(),
});
