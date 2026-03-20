import { Router, IRouter } from "express";
import { db } from "@workspace/db";
import {
  listingsTable,
  mediaTable,
  listingViewsTable,
  interestsTable,
  usersTable,
} from "@workspace/db/schema";
import { eq, and, desc, asc, sql, count, gte, inArray } from "drizzle-orm";
import { z } from "zod";
import { requireAuth, requireRole, AuthRequest } from "../lib/auth.js";
import { generateSlug } from "../lib/slug.js";

const router: IRouter = Router();

function toNumber(v: unknown): number | null {
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function toPublicMedia(m: typeof mediaTable.$inferSelect) {
  return {
    id: m.id,
    listingId: m.listingId,
    url: m.url,
    mediaType: m.mediaType,
    isPrimary: m.isPrimary,
    sortOrder: m.sortOrder,
    fileName: m.fileName,
    fileSize: m.fileSize,
    createdAt: m.createdAt,
  };
}

function buildSummary(
  listing: typeof listingsTable.$inferSelect,
  media: Array<typeof mediaTable.$inferSelect>
) {
  const images = media.filter((m) => m.mediaType === "image");
  const primary = images.find((m) => m.isPrimary) || images[0];
  return {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    price: listing.price ? Number(listing.price) : null,
    negotiable: listing.negotiable,
    totalArea: listing.totalArea ? Number(listing.totalArea) : null,
    areaUnit: listing.areaUnit,
    pricePerHectare: listing.pricePerHectare ? Number(listing.pricePerHectare) : null,
    state: listing.state,
    city: listing.city,
    country: listing.country,
    propertyType: listing.propertyType,
    isFeatured: listing.isFeatured,
    isPremium: listing.isPremium,
    coverImageUrl: primary?.url ?? null,
    thumbnailUrls: images.slice(0, 4).map((m) => m.url),
    viewCount: listing.viewCount,
    favoriteCount: listing.favoriteCount,
    status: listing.status,
    moderationStatus: listing.moderationStatus,
    createdAt: listing.createdAt,
  };
}

function buildDetail(
  listing: typeof listingsTable.$inferSelect,
  media: Array<typeof mediaTable.$inferSelect>
) {
  const summary = buildSummary(listing, media);
  return {
    ...summary,
    description: listing.description,
    moderationNote: listing.moderationNote,
    region: listing.region,
    latitude: listing.latitude ? Number(listing.latitude) : null,
    longitude: listing.longitude ? Number(listing.longitude) : null,
    addressDetails: listing.addressDetails,
    productiveArea: listing.productiveArea ? Number(listing.productiveArea) : null,
    reserveArea: listing.reserveArea ? Number(listing.reserveArea) : null,
    pricePerAlqueire: listing.pricePerAlqueire ? Number(listing.pricePerAlqueire) : null,
    aptidaoAgricola: listing.aptidaoAgricola,
    aptidaoPecuaria: listing.aptidaoPecuaria,
    aptidaoMista: listing.aptidaoMista,
    hasIrrigation: listing.hasIrrigation,
    hasRiver: listing.hasRiver,
    hasLake: listing.hasLake,
    hasAcude: listing.hasAcude,
    hasWell: listing.hasWell,
    hasSpring: listing.hasSpring,
    infraMainHouse: listing.infraMainHouse,
    infraWorkerHouses: listing.infraWorkerHouses,
    infraWarehouse: listing.infraWarehouse,
    infraBarn: listing.infraBarn,
    infraCorral: listing.infraCorral,
    infraFencing: listing.infraFencing,
    infraElectricity: listing.infraElectricity,
    infraInternet: listing.infraInternet,
    infraMachineryShed: listing.infraMachineryShed,
    infraGrainSilo: listing.infraGrainSilo,
    infraDairyStructure: listing.infraDairyStructure,
    infraIrrigationSystem: listing.infraIrrigationSystem,
    infraPavedAccess: listing.infraPavedAccess,
    infraInternalRoads: listing.infraInternalRoads,
    infraAirstrip: listing.infraAirstrip,
    infraOffice: listing.infraOffice,
    infraSolarPower: listing.infraSolarPower,
    infraSecuritySystem: listing.infraSecuritySystem,
    hasCattle: listing.hasCattle,
    cattleCount: listing.cattleCount,
    hasHorses: listing.hasHorses,
    otherAnimals: listing.otherAnimals,
    plantedCrops: listing.plantedCrops,
    cropDetails: listing.cropDetails,
    productiveActivities: listing.productiveActivities,
    bedroomCount: listing.bedroomCount,
    bathroomCount: listing.bathroomCount,
    suiteCount: listing.suiteCount,
    hasKitchen: listing.hasKitchen,
    hasGarage: listing.hasGarage,
    hasLeisureArea: listing.hasLeisureArea,
    deedStatus: listing.deedStatus,
    environmentalLicense: listing.environmentalLicense,
    carRegistryInfo: listing.carRegistryInfo,
    media: media.map(toPublicMedia),
    seller: null,
    interestCount: listing.interestCount,
    updatedAt: listing.updatedAt,
    publishedAt: listing.publishedAt,
  };
}

router.use(requireAuth, requireRole("seller", "admin"));

router.get("/dashboard", async (req: AuthRequest, res) => {
  const sellerId = req.user!.userId;
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const rows = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.sellerId, sellerId));

  const published = rows.filter((r) => r.status === "published");
  const pending = rows.filter((r) => r.status === "pending_review");
  const draft = rows.filter((r) => r.status === "draft");

  const totalViews = rows.reduce((s, r) => s + r.viewCount, 0);
  const totalFavorites = rows.reduce((s, r) => s + r.favoriteCount, 0);
  const totalInterests = rows.reduce((s, r) => s + r.interestCount, 0);

  const listingIds = rows.map((r) => r.id);
  let viewsByDay: { date: string; count: number }[] = [];

  if (listingIds.length > 0) {
    const views = await db
      .select({
        date: sql<string>`DATE(${listingViewsTable.createdAt})::text`,
        count: count(),
      })
      .from(listingViewsTable)
      .where(
        and(
          inArray(listingViewsTable.listingId, listingIds),
          gte(listingViewsTable.createdAt, thirtyDaysAgo)
        )
      )
      .groupBy(sql`DATE(${listingViewsTable.createdAt})`);
    viewsByDay = views.map((v) => ({ date: v.date, count: Number(v.count) }));
  }

  const recentMedia = listingIds.length > 0
    ? await db.select().from(mediaTable).where(inArray(mediaTable.listingId, listingIds))
    : [];

  const recentListings = rows
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map((r) => buildSummary(r, recentMedia.filter((m) => m.listingId === r.id)));

  res.json({
    totalListings: rows.length,
    publishedListings: published.length,
    pendingListings: pending.length,
    draftListings: draft.length,
    totalViews,
    totalFavorites,
    totalInterests,
    recentListings,
    viewsByDay,
  });
});

router.get("/listings", async (req: AuthRequest, res) => {
  const page = Math.max(1, Number(req.query["page"]) || 1);
  const limit = Math.min(50, Number(req.query["limit"]) || 10);
  const offset = (page - 1) * limit;
  const sellerId = req.user!.userId;

  const conditions = [eq(listingsTable.sellerId, sellerId)];
  if (req.query["status"]) conditions.push(eq(listingsTable.status, String(req.query["status"]) as "draft"));

  const [totalResult, rows] = await Promise.all([
    db.select({ count: count() }).from(listingsTable).where(and(...conditions)),
    db.select().from(listingsTable).where(and(...conditions)).orderBy(desc(listingsTable.updatedAt)).limit(limit).offset(offset),
  ]);

  const total = Number(totalResult[0]?.count ?? 0);
  const allMedia = rows.length > 0
    ? await db.select().from(mediaTable).where(inArray(mediaTable.listingId, rows.map((r) => r.id)))
    : [];

  res.json({
    listings: rows.map((r) => buildSummary(r, allMedia.filter((m) => m.listingId === r.id))),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

router.post("/listings", async (req: AuthRequest, res) => {
  const sellerId = req.user!.userId;

  const parsed = z.object({ title: z.string().min(5) }).passthrough().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Título é obrigatório (mínimo 5 caracteres)" });
    return;
  }

  const data = req.body as Record<string, unknown>;
  const slug = generateSlug(String(data["title"] || "fazenda"));

  const [listing] = await db
    .insert(listingsTable)
    .values({
      sellerId,
      slug,
      title: String(data["title"]),
      description: data["description"] ? String(data["description"]) : undefined,
      price: data["price"] ? String(data["price"]) : undefined,
      negotiable: data["negotiable"] !== false,
      country: data["country"] ? String(data["country"]) : undefined,
      state: data["state"] ? String(data["state"]) : undefined,
      city: data["city"] ? String(data["city"]) : undefined,
      region: data["region"] ? String(data["region"]) : undefined,
      latitude: data["latitude"] ? String(data["latitude"]) : undefined,
      longitude: data["longitude"] ? String(data["longitude"]) : undefined,
      addressDetails: data["addressDetails"] ? String(data["addressDetails"]) : undefined,
      totalArea: data["totalArea"] ? String(data["totalArea"]) : undefined,
      productiveArea: data["productiveArea"] ? String(data["productiveArea"]) : undefined,
      reserveArea: data["reserveArea"] ? String(data["reserveArea"]) : undefined,
      areaUnit: (data["areaUnit"] as "hectares" | "alqueires" | "acres") || undefined,
      propertyType: data["propertyType"] ? String(data["propertyType"]) : undefined,
      aptidaoAgricola: Boolean(data["aptidaoAgricola"]),
      aptidaoPecuaria: Boolean(data["aptidaoPecuaria"]),
      aptidaoMista: Boolean(data["aptidaoMista"]),
      hasIrrigation: Boolean(data["hasIrrigation"]),
      hasRiver: Boolean(data["hasRiver"]),
      hasLake: Boolean(data["hasLake"]),
      hasAcude: Boolean(data["hasAcude"]),
      hasWell: Boolean(data["hasWell"]),
      hasSpring: Boolean(data["hasSpring"]),
      infraMainHouse: Boolean(data["infraMainHouse"]),
      infraWorkerHouses: Boolean(data["infraWorkerHouses"]),
      infraWarehouse: Boolean(data["infraWarehouse"]),
      infraBarn: Boolean(data["infraBarn"]),
      infraCorral: Boolean(data["infraCorral"]),
      infraFencing: Boolean(data["infraFencing"]),
      infraElectricity: Boolean(data["infraElectricity"]),
      infraInternet: Boolean(data["infraInternet"]),
      infraMachineryShed: Boolean(data["infraMachineryShed"]),
      infraGrainSilo: Boolean(data["infraGrainSilo"]),
      infraDairyStructure: Boolean(data["infraDairyStructure"]),
      infraIrrigationSystem: Boolean(data["infraIrrigationSystem"]),
      infraPavedAccess: Boolean(data["infraPavedAccess"]),
      infraInternalRoads: Boolean(data["infraInternalRoads"]),
      infraAirstrip: Boolean(data["infraAirstrip"]),
      infraOffice: Boolean(data["infraOffice"]),
      infraSolarPower: Boolean(data["infraSolarPower"]),
      infraSecuritySystem: Boolean(data["infraSecuritySystem"]),
      hasCattle: Boolean(data["hasCattle"]),
      cattleCount: data["cattleCount"] ? Number(data["cattleCount"]) : undefined,
      hasHorses: Boolean(data["hasHorses"]),
      otherAnimals: data["otherAnimals"] ? String(data["otherAnimals"]) : undefined,
      plantedCrops: data["plantedCrops"] ? String(data["plantedCrops"]) : undefined,
      cropDetails: data["cropDetails"] ? String(data["cropDetails"]) : undefined,
      productiveActivities: data["productiveActivities"] ? String(data["productiveActivities"]) : undefined,
      bedroomCount: data["bedroomCount"] ? Number(data["bedroomCount"]) : undefined,
      bathroomCount: data["bathroomCount"] ? Number(data["bathroomCount"]) : undefined,
      suiteCount: data["suiteCount"] ? Number(data["suiteCount"]) : undefined,
      hasKitchen: Boolean(data["hasKitchen"]),
      hasGarage: Boolean(data["hasGarage"]),
      hasLeisureArea: Boolean(data["hasLeisureArea"]),
      deedStatus: data["deedStatus"] ? String(data["deedStatus"]) : undefined,
      environmentalLicense: Boolean(data["environmentalLicense"]),
      carRegistryInfo: data["carRegistryInfo"] ? String(data["carRegistryInfo"]) : undefined,
    })
    .returning();

  res.status(201).json(buildDetail(listing, []));
});

router.get("/listings/:id", async (req: AuthRequest, res) => {
  const [listing] = await db
    .select()
    .from(listingsTable)
    .where(
      and(
        eq(listingsTable.id, req.params["id"]!),
        req.user!.role === "admin" ? sql`TRUE` : eq(listingsTable.sellerId, req.user!.userId)
      )
    )
    .limit(1);

  if (!listing) {
    res.status(404).json({ error: "Anúncio não encontrado" });
    return;
  }

  const media = await db.select().from(mediaTable).where(eq(mediaTable.listingId, listing.id)).orderBy(asc(mediaTable.sortOrder));
  res.json(buildDetail(listing, media));
});

router.put("/listings/:id", async (req: AuthRequest, res) => {
  const [existing] = await db
    .select()
    .from(listingsTable)
    .where(
      and(
        eq(listingsTable.id, req.params["id"]!),
        req.user!.role === "admin" ? sql`TRUE` : eq(listingsTable.sellerId, req.user!.userId)
      )
    )
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Anúncio não encontrado" });
    return;
  }

  const data = req.body as Record<string, unknown>;
  const [updated] = await db
    .update(listingsTable)
    .set({
      ...(data["title"] && { title: String(data["title"]) }),
      ...(data["description"] !== undefined && { description: data["description"] ? String(data["description"]) : null }),
      ...(data["price"] !== undefined && { price: data["price"] ? String(data["price"]) : null }),
      ...(data["negotiable"] !== undefined && { negotiable: Boolean(data["negotiable"]) }),
      ...(data["country"] !== undefined && { country: data["country"] ? String(data["country"]) : null }),
      ...(data["state"] !== undefined && { state: data["state"] ? String(data["state"]) : null }),
      ...(data["city"] !== undefined && { city: data["city"] ? String(data["city"]) : null }),
      ...(data["region"] !== undefined && { region: data["region"] ? String(data["region"]) : null }),
      ...(data["latitude"] !== undefined && { latitude: data["latitude"] ? String(data["latitude"]) : null }),
      ...(data["longitude"] !== undefined && { longitude: data["longitude"] ? String(data["longitude"]) : null }),
      ...(data["addressDetails"] !== undefined && { addressDetails: data["addressDetails"] ? String(data["addressDetails"]) : null }),
      ...(data["totalArea"] !== undefined && { totalArea: data["totalArea"] ? String(data["totalArea"]) : null }),
      ...(data["productiveArea"] !== undefined && { productiveArea: data["productiveArea"] ? String(data["productiveArea"]) : null }),
      ...(data["reserveArea"] !== undefined && { reserveArea: data["reserveArea"] ? String(data["reserveArea"]) : null }),
      ...(data["areaUnit"] !== undefined && { areaUnit: data["areaUnit"] as "hectares" | "alqueires" | "acres" | null }),
      ...(data["propertyType"] !== undefined && { propertyType: data["propertyType"] ? String(data["propertyType"]) : null }),
      ...(data["aptidaoAgricola"] !== undefined && { aptidaoAgricola: Boolean(data["aptidaoAgricola"]) }),
      ...(data["aptidaoPecuaria"] !== undefined && { aptidaoPecuaria: Boolean(data["aptidaoPecuaria"]) }),
      ...(data["aptidaoMista"] !== undefined && { aptidaoMista: Boolean(data["aptidaoMista"]) }),
      ...(data["hasIrrigation"] !== undefined && { hasIrrigation: Boolean(data["hasIrrigation"]) }),
      ...(data["hasRiver"] !== undefined && { hasRiver: Boolean(data["hasRiver"]) }),
      ...(data["hasLake"] !== undefined && { hasLake: Boolean(data["hasLake"]) }),
      ...(data["hasAcude"] !== undefined && { hasAcude: Boolean(data["hasAcude"]) }),
      ...(data["hasWell"] !== undefined && { hasWell: Boolean(data["hasWell"]) }),
      ...(data["hasSpring"] !== undefined && { hasSpring: Boolean(data["hasSpring"]) }),
      ...(data["infraMainHouse"] !== undefined && { infraMainHouse: Boolean(data["infraMainHouse"]) }),
      ...(data["infraWorkerHouses"] !== undefined && { infraWorkerHouses: Boolean(data["infraWorkerHouses"]) }),
      ...(data["infraWarehouse"] !== undefined && { infraWarehouse: Boolean(data["infraWarehouse"]) }),
      ...(data["infraBarn"] !== undefined && { infraBarn: Boolean(data["infraBarn"]) }),
      ...(data["infraCorral"] !== undefined && { infraCorral: Boolean(data["infraCorral"]) }),
      ...(data["infraFencing"] !== undefined && { infraFencing: Boolean(data["infraFencing"]) }),
      ...(data["infraElectricity"] !== undefined && { infraElectricity: Boolean(data["infraElectricity"]) }),
      ...(data["infraInternet"] !== undefined && { infraInternet: Boolean(data["infraInternet"]) }),
      ...(data["infraMachineryShed"] !== undefined && { infraMachineryShed: Boolean(data["infraMachineryShed"]) }),
      ...(data["infraGrainSilo"] !== undefined && { infraGrainSilo: Boolean(data["infraGrainSilo"]) }),
      ...(data["infraDairyStructure"] !== undefined && { infraDairyStructure: Boolean(data["infraDairyStructure"]) }),
      ...(data["infraIrrigationSystem"] !== undefined && { infraIrrigationSystem: Boolean(data["infraIrrigationSystem"]) }),
      ...(data["infraPavedAccess"] !== undefined && { infraPavedAccess: Boolean(data["infraPavedAccess"]) }),
      ...(data["infraInternalRoads"] !== undefined && { infraInternalRoads: Boolean(data["infraInternalRoads"]) }),
      ...(data["infraAirstrip"] !== undefined && { infraAirstrip: Boolean(data["infraAirstrip"]) }),
      ...(data["infraOffice"] !== undefined && { infraOffice: Boolean(data["infraOffice"]) }),
      ...(data["infraSolarPower"] !== undefined && { infraSolarPower: Boolean(data["infraSolarPower"]) }),
      ...(data["infraSecuritySystem"] !== undefined && { infraSecuritySystem: Boolean(data["infraSecuritySystem"]) }),
      ...(data["hasCattle"] !== undefined && { hasCattle: Boolean(data["hasCattle"]) }),
      ...(data["cattleCount"] !== undefined && { cattleCount: data["cattleCount"] ? Number(data["cattleCount"]) : null }),
      ...(data["hasHorses"] !== undefined && { hasHorses: Boolean(data["hasHorses"]) }),
      ...(data["otherAnimals"] !== undefined && { otherAnimals: data["otherAnimals"] ? String(data["otherAnimals"]) : null }),
      ...(data["plantedCrops"] !== undefined && { plantedCrops: data["plantedCrops"] ? String(data["plantedCrops"]) : null }),
      ...(data["cropDetails"] !== undefined && { cropDetails: data["cropDetails"] ? String(data["cropDetails"]) : null }),
      ...(data["productiveActivities"] !== undefined && { productiveActivities: data["productiveActivities"] ? String(data["productiveActivities"]) : null }),
      ...(data["bedroomCount"] !== undefined && { bedroomCount: data["bedroomCount"] ? Number(data["bedroomCount"]) : null }),
      ...(data["bathroomCount"] !== undefined && { bathroomCount: data["bathroomCount"] ? Number(data["bathroomCount"]) : null }),
      ...(data["suiteCount"] !== undefined && { suiteCount: data["suiteCount"] ? Number(data["suiteCount"]) : null }),
      ...(data["hasKitchen"] !== undefined && { hasKitchen: Boolean(data["hasKitchen"]) }),
      ...(data["hasGarage"] !== undefined && { hasGarage: Boolean(data["hasGarage"]) }),
      ...(data["hasLeisureArea"] !== undefined && { hasLeisureArea: Boolean(data["hasLeisureArea"]) }),
      ...(data["deedStatus"] !== undefined && { deedStatus: data["deedStatus"] ? String(data["deedStatus"]) : null }),
      ...(data["environmentalLicense"] !== undefined && { environmentalLicense: Boolean(data["environmentalLicense"]) }),
      ...(data["carRegistryInfo"] !== undefined && { carRegistryInfo: data["carRegistryInfo"] ? String(data["carRegistryInfo"]) : null }),
      updatedAt: new Date(),
      status: existing.status === "rejected" ? "draft" : existing.status,
    })
    .where(eq(listingsTable.id, req.params["id"]!))
    .returning();

  const media = await db.select().from(mediaTable).where(eq(mediaTable.listingId, updated.id)).orderBy(asc(mediaTable.sortOrder));
  res.json(buildDetail(updated, media));
});

router.delete("/listings/:id", async (req: AuthRequest, res) => {
  const [existing] = await db
    .select({ id: listingsTable.id })
    .from(listingsTable)
    .where(
      and(
        eq(listingsTable.id, req.params["id"]!),
        req.user!.role === "admin" ? sql`TRUE` : eq(listingsTable.sellerId, req.user!.userId)
      )
    )
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Anúncio não encontrado" });
    return;
  }

  await db.delete(listingsTable).where(eq(listingsTable.id, req.params["id"]!));
  res.json({ message: "Anúncio excluído com sucesso" });
});

router.post("/listings/:id/submit", async (req: AuthRequest, res) => {
  const [existing] = await db
    .select()
    .from(listingsTable)
    .where(
      and(
        eq(listingsTable.id, req.params["id"]!),
        eq(listingsTable.sellerId, req.user!.userId)
      )
    )
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Anúncio não encontrado" });
    return;
  }

  if (existing.status !== "draft" && existing.status !== "rejected") {
    res.status(400).json({ error: "Anúncio já enviado para revisão" });
    return;
  }

  const [updated] = await db
    .update(listingsTable)
    .set({ status: "pending_review", moderationStatus: "pending", updatedAt: new Date() })
    .where(eq(listingsTable.id, req.params["id"]!))
    .returning();

  const media = await db.select().from(mediaTable).where(eq(mediaTable.listingId, updated.id));
  res.json(buildDetail(updated, media));
});

router.get("/listings/:id/analytics", async (req: AuthRequest, res) => {
  const period = String(req.query["period"] || "30d");
  const days = period === "7d" ? 7 : period === "90d" ? 90 : period === "1y" ? 365 : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [listing] = await db
    .select({ id: listingsTable.id, favoriteCount: listingsTable.favoriteCount, interestCount: listingsTable.interestCount })
    .from(listingsTable)
    .where(
      and(
        eq(listingsTable.id, req.params["id"]!),
        req.user!.role === "admin" ? sql`TRUE` : eq(listingsTable.sellerId, req.user!.userId)
      )
    )
    .limit(1);

  if (!listing) {
    res.status(404).json({ error: "Anúncio não encontrado" });
    return;
  }

  const [viewsByDayRaw, viewsBySourceRaw, totalViewsResult, interestsByType] = await Promise.all([
    db
      .select({
        date: sql<string>`DATE(${listingViewsTable.createdAt})::text`,
        count: count(),
      })
      .from(listingViewsTable)
      .where(and(eq(listingViewsTable.listingId, listing.id), gte(listingViewsTable.createdAt, since)))
      .groupBy(sql`DATE(${listingViewsTable.createdAt})`),
    db
      .select({ source: listingViewsTable.source, count: count() })
      .from(listingViewsTable)
      .where(and(eq(listingViewsTable.listingId, listing.id), gte(listingViewsTable.createdAt, since)))
      .groupBy(listingViewsTable.source),
    db
      .select({ count: count() })
      .from(listingViewsTable)
      .where(and(eq(listingViewsTable.listingId, listing.id), gte(listingViewsTable.createdAt, since))),
    db
      .select({ type: interestsTable.interestType, count: count() })
      .from(interestsTable)
      .where(and(eq(interestsTable.listingId, listing.id), gte(interestsTable.createdAt, since)))
      .groupBy(interestsTable.interestType),
  ]);

  const totalViews = Number(totalViewsResult[0]?.count ?? 0);
  const totalSourceCount = viewsBySourceRaw.reduce((s, r) => s + Number(r.count), 0);

  res.json({
    listingId: listing.id,
    period,
    totalViews,
    uniqueViews: totalViews,
    favoriteCount: listing.favoriteCount,
    interestCount: listing.interestCount,
    conversionRate: totalViews > 0 ? Math.round((listing.interestCount / totalViews) * 10000) / 100 : 0,
    viewsByDay: viewsByDayRaw.map((v) => ({ date: v.date, count: Number(v.count) })),
    viewsBySource: viewsBySourceRaw.map((v) => ({
      source: v.source || "direto",
      count: Number(v.count),
      percentage: totalSourceCount > 0 ? Math.round((Number(v.count) / totalSourceCount) * 100) : 0,
    })),
    interestByType: interestsByType.map((v) => ({ type: v.type, count: Number(v.count) })),
  });
});

export default router;
