import { pgTable, text, boolean, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { listingsTable } from "./listings";

export const listingViewsTable = pgTable(
  "listing_views",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listingsTable.id, { onDelete: "cascade" }),
    visitorId: text("visitor_id"),
    source: text("source"),
    referrer: text("referrer"),
    deviceType: text("device_type"),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("listing_views_listing_id_idx").on(table.listingId),
    index("listing_views_created_at_idx").on(table.createdAt),
  ]
);

export const interestsTable = pgTable(
  "interests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listingsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id"),
    interestType: text("interest_type", { enum: ["info", "proposal", "visit"] }).notNull(),
    name: text("name"),
    email: text("email"),
    phone: text("phone"),
    message: text("message"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("interests_listing_id_idx").on(table.listingId),
    index("interests_user_id_idx").on(table.userId),
  ]
);

export const favoritesTable = pgTable(
  "favorites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listingsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("favorites_user_id_idx").on(table.userId),
    index("favorites_listing_id_idx").on(table.listingId),
  ]
);

export type ListingView = typeof listingViewsTable.$inferSelect;
export type Interest = typeof interestsTable.$inferSelect;
export type Favorite = typeof favoritesTable.$inferSelect;
