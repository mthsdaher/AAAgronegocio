import { pgTable, text, boolean, timestamp, uuid, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { listingsTable } from "./listings";

export const mediaTable = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listingsTable.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    mediaType: text("media_type", { enum: ["image", "video", "pdf"] }).notNull(),
    isPrimary: boolean("is_primary").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    fileName: text("file_name"),
    fileSize: integer("file_size"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("media_listing_id_idx").on(table.listingId),
  ]
);

export const insertMediaSchema = createInsertSchema(mediaTable).omit({
  id: true,
  createdAt: true,
});

export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type Media = typeof mediaTable.$inferSelect;
