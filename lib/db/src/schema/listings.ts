import {
  pgTable,
  text,
  boolean,
  timestamp,
  uuid,
  numeric,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const listingsTable = pgTable(
  "listings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    title: text("title").notNull(),
    description: text("description"),
    price: numeric("price", { precision: 15, scale: 2 }),
    negotiable: boolean("negotiable").notNull().default(true),

    status: text("status", {
      enum: ["draft", "pending_review", "published", "rejected", "archived"],
    })
      .notNull()
      .default("draft"),
    moderationStatus: text("moderation_status", {
      enum: ["pending", "approved", "rejected"],
    })
      .notNull()
      .default("pending"),
    moderationNote: text("moderation_note"),
    isFeatured: boolean("is_featured").notNull().default(false),
    isPremium: boolean("is_premium").notNull().default(false),

    country: text("country"),
    state: text("state"),
    city: text("city"),
    region: text("region"),
    latitude: numeric("latitude", { precision: 10, scale: 7 }),
    longitude: numeric("longitude", { precision: 10, scale: 7 }),
    addressDetails: text("address_details"),

    totalArea: numeric("total_area", { precision: 12, scale: 4 }),
    productiveArea: numeric("productive_area", { precision: 12, scale: 4 }),
    reserveArea: numeric("reserve_area", { precision: 12, scale: 4 }),
    areaUnit: text("area_unit", { enum: ["hectares", "alqueires", "acres"] }),
    pricePerHectare: numeric("price_per_hectare", { precision: 15, scale: 2 }),
    pricePerAlqueire: numeric("price_per_alqueire", { precision: 15, scale: 2 }),

    propertyType: text("property_type"),
    aptidaoAgricola: boolean("aptidao_agricola").notNull().default(false),
    aptidaoPecuaria: boolean("aptidao_pecuaria").notNull().default(false),
    aptidaoMista: boolean("aptidao_mista").notNull().default(false),
    hasIrrigation: boolean("has_irrigation").notNull().default(false),
    hasRiver: boolean("has_river").notNull().default(false),
    hasLake: boolean("has_lake").notNull().default(false),
    hasAcude: boolean("has_acude").notNull().default(false),
    hasWell: boolean("has_well").notNull().default(false),
    hasSpring: boolean("has_spring").notNull().default(false),

    infraMainHouse: boolean("infra_main_house").notNull().default(false),
    infraWorkerHouses: boolean("infra_worker_houses").notNull().default(false),
    infraWarehouse: boolean("infra_warehouse").notNull().default(false),
    infraBarn: boolean("infra_barn").notNull().default(false),
    infraCorral: boolean("infra_corral").notNull().default(false),
    infraFencing: boolean("infra_fencing").notNull().default(false),
    infraElectricity: boolean("infra_electricity").notNull().default(false),
    infraInternet: boolean("infra_internet").notNull().default(false),
    infraMachineryShed: boolean("infra_machinery_shed").notNull().default(false),
    infraGrainSilo: boolean("infra_grain_silo").notNull().default(false),
    infraDairyStructure: boolean("infra_dairy_structure").notNull().default(false),
    infraIrrigationSystem: boolean("infra_irrigation_system").notNull().default(false),
    infraPavedAccess: boolean("infra_paved_access").notNull().default(false),
    infraInternalRoads: boolean("infra_internal_roads").notNull().default(false),
    infraAirstrip: boolean("infra_airstrip").notNull().default(false),
    infraOffice: boolean("infra_office").notNull().default(false),
    infraSolarPower: boolean("infra_solar_power").notNull().default(false),
    infraSecuritySystem: boolean("infra_security_system").notNull().default(false),

    hasCattle: boolean("has_cattle").notNull().default(false),
    cattleCount: integer("cattle_count"),
    hasHorses: boolean("has_horses").notNull().default(false),
    otherAnimals: text("other_animals"),
    plantedCrops: text("planted_crops"),
    cropDetails: text("crop_details"),
    productiveActivities: text("productive_activities"),

    bedroomCount: integer("bedroom_count"),
    bathroomCount: integer("bathroom_count"),
    suiteCount: integer("suite_count"),
    hasKitchen: boolean("has_kitchen").notNull().default(false),
    hasGarage: boolean("has_garage").notNull().default(false),
    hasLeisureArea: boolean("has_leisure_area").notNull().default(false),

    deedStatus: text("deed_status"),
    environmentalLicense: boolean("environmental_license").notNull().default(false),
    carRegistryInfo: text("car_registry_info"),

    viewCount: integer("view_count").notNull().default(0),
    favoriteCount: integer("favorite_count").notNull().default(0),
    interestCount: integer("interest_count").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (table) => [
    index("listings_state_idx").on(table.state),
    index("listings_status_idx").on(table.status),
    index("listings_seller_id_idx").on(table.sellerId),
    index("listings_is_featured_idx").on(table.isFeatured),
  ]
);

export const insertListingSchema = createInsertSchema(listingsTable).omit({
  id: true,
  slug: true,
  viewCount: true,
  favoriteCount: true,
  interestCount: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  moderationStatus: true,
  status: true,
});

export const selectListingSchema = createSelectSchema(listingsTable);

export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listingsTable.$inferSelect;
