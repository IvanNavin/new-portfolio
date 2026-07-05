import {
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import type {
  CalculatorInputs,
  FieldOverrides,
  RevenueFieldLabels,
} from "../types";

/** Структурні/числові дані бізнесу (не залежать від мови) */
export const businesses = pgTable("businesses", {
  slug: text("slug").primaryKey(),
  category: text("category").notNull(),
  difficulty: integer("difficulty").notNull(),
  risk: integer("risk").notNull(),
  budgetMin: integer("budget_min").notNull(),
  budgetMax: integer("budget_max").notNull(),
  defaults: jsonb("defaults").$type<CalculatorInputs>().notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** Перекладний контент бізнесу — по одному рядку на мову */
export const businessContent = pgTable(
  "business_content",
  {
    slug: text("slug")
      .notNull()
      .references(() => businesses.slug, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    name: text("name").notNull(),
    shortDescription: text("short_description").notNull(),
    description: text("description").notNull(),
    pros: jsonb("pros").$type<string[]>().notNull(),
    cons: jsonb("cons").$type<string[]>().notNull(),
    revenueLabels: jsonb("revenue_labels").$type<RevenueFieldLabels>(),
    fieldOverrides: jsonb("field_overrides").$type<FieldOverrides>(),
  },
  (table) => [primaryKey({ columns: [table.slug, table.locale] })],
);

export type BusinessRow = typeof businesses.$inferSelect;
export type BusinessContentRow = typeof businessContent.$inferSelect;
