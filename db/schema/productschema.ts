import { sql } from "drizzle-orm";
import { integer, real, text, sqliteTable } from "drizzle-orm/sqlite-core";

export const productsTable = sqliteTable("products", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: real("price").notNull(),
  stock: integer("stock")
    .notNull()
    .default(0),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
