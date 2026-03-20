import { Router, IRouter } from "express";
import { db } from "@workspace/db";
import {
  listingsTable,
  usersTable,
  mediaTable,
  listingViewsTable,
  interestsTable,
} from "@workspace/db/schema";
import { eq, and, desc, asc, sql, count, gte, inArray } from "drizzle-orm";
import { z } from "zod";
import { requireAuth, requireRole, AuthRequest } from "../lib/auth.js";

const router: IRouter = Router();

router.use(requireAuth, requireRole("admin"));

function toPublicUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone,
    avatarUrl: u.avatarUrl,
    isPremium: u.isPremium,
    isActive: u.isActive,
    createdAt: u.createdAt,
  };
}

function buildDetail(
  listing: typeof listingsTable.$inferSelect,
  media: Array<typeof mediaTable.$inferSelect>,
  seller: typeof usersTable.$inferSelect | null
) {
  const images = media.filter((m) => m.mediaType === "image");
  const primary = images.find((m) => m.isPrimary) || images[0];
  return {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    description: listing.description,
    price: listing.price ? Number(listing.price) : null,
    negotiable: listing.negotiable,
    status: listing.status,
    moderationStatus: listing.moderationStatus,
    moderationNote: listing.moderationNote,
    isFeatured: listing.isFeatured,
    isPremium: listing.isPremium,
    country: listing.country,
    state: listing.state,
    city: listing.city,
    region: listing.region,
    latitude: listing.latitude ? Number(listing.latitude) : null,
    longitude: listing.longitude ? Number(listing.longitude) : null,
    addressDetails: listing.addressDetails,
    totalArea: listing.totalArea ? Number(listing.totalArea) : null,
    productiveArea: listing.productiveArea ? Number(listing.productiveArea) : null,
    reserveArea: listing.reserveArea ? Number(listing.reserveArea) : null,
    areaUnit: listing.areaUnit,
    pricePerHectare: listing.pricePerHectare ? Number(listing.pricePerHectare) : null,
    pricePerAlqueire: listing.pricePerAlqueire ? Number(listing.pricePerAlqueire) : null,
    propertyType: listing.propertyType,
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
    media: media.map((m) => ({
      id: m.id,
      listingId: m.listingId,
      url: m.url,
      mediaType: m.mediaType,
      isPrimary: m.isPrimary,
      sortOrder: m.sortOrder,
      fileName: m.fileName,
      fileSize: m.fileSize,
      createdAt: m.createdAt,
    })),
    seller: seller ? { id: seller.id, name: seller.name, phone: seller.phone, isPremium: seller.isPremium } : null,
    viewCount: listing.viewCount,
    favoriteCount: listing.favoriteCount,
    interestCount: listing.interestCount,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
    publishedAt: listing.publishedAt,
  };
}

router.get("/dashboard", async (req: AuthRequest, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [listingStats, userStats, recentRows, viewsResult, interestsResult, viewsByDayRaw] = await Promise.all([
    db.select({ status: listingsTable.status, count: count() }).from(listingsTable).groupBy(listingsTable.status),
    db.select({ role: usersTable.role, isPremium: usersTable.isPremium, count: count() }).from(usersTable).groupBy(usersTable.role, usersTable.isPremium),
    db.select().from(listingsTable).orderBy(desc(listingsTable.createdAt)).limit(5),
    db.select({ count: count() }).from(listingViewsTable).where(gte(listingViewsTable.createdAt, thirtyDaysAgo)),
    db.select({ count: count() }).from(interestsTable).where(gte(interestsTable.createdAt, thirtyDaysAgo)),
    db
      .select({ date: sql<string>`DATE(${listingViewsTable.createdAt})::text`, count: count() })
      .from(listingViewsTable)
      .where(gte(listingViewsTable.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${listingViewsTable.createdAt})`),
  ]);

  const byStatus = (status: string) => Number(listingStats.find((s) => s.status === status)?.count ?? 0);
  const byRole = (role: string) => userStats.filter((u) => u.role === role).reduce((s, u) => s + Number(u.count), 0);

  const recentMedia = recentRows.length > 0
    ? await db.select().from(mediaTable).where(inArray(mediaTable.listingId, recentRows.map((r) => r.id)))
    : [];

  const recentListings = recentRows.map((r) => {
    const media = recentMedia.filter((m) => m.listingId === r.id);
    const images = media.filter((m) => m.mediaType === "image");
    const primary = images.find((m) => m.isPrimary) || images[0];
    return {
      id: r.id, slug: r.slug, title: r.title,
      price: r.price ? Number(r.price) : null,
      negotiable: r.negotiable,
      totalArea: r.totalArea ? Number(r.totalArea) : null,
      areaUnit: r.areaUnit,
      pricePerHectare: r.pricePerHectare ? Number(r.pricePerHectare) : null,
      state: r.state, city: r.city, country: r.country,
      propertyType: r.propertyType,
      isFeatured: r.isFeatured, isPremium: r.isPremium,
      coverImageUrl: primary?.url ?? null,
      thumbnailUrls: images.slice(0, 4).map((m) => m.url),
      viewCount: r.viewCount, favoriteCount: r.favoriteCount,
      createdAt: r.createdAt,
    };
  });

  res.json({
    totalListings: listingStats.reduce((s, r) => s + Number(r.count), 0),
    pendingApproval: byStatus("pending_review"),
    publishedListings: byStatus("published"),
    totalUsers: userStats.reduce((s, u) => s + Number(u.count), 0),
    totalSellers: byRole("seller"),
    totalBuyers: byRole("buyer"),
    premiumSellers: Number(userStats.find((u) => u.role === "seller" && u.isPremium)?.count ?? 0),
    totalViews: Number(viewsResult[0]?.count ?? 0),
    totalInterests: Number(interestsResult[0]?.count ?? 0),
    recentListings,
    listingsByStatus: listingStats.map((s) => ({ status: s.status, count: Number(s.count) })),
    viewsByDay: viewsByDayRaw.map((v) => ({ date: v.date, count: Number(v.count) })),
  });
});

router.get("/listings", async (req: AuthRequest, res) => {
  const page = Math.max(1, Number(req.query["page"]) || 1);
  const limit = Math.min(50, Number(req.query["limit"]) || 20);
  const offset = (page - 1) * limit;

  const conditions: ReturnType<typeof eq>[] = [];
  if (req.query["status"]) conditions.push(eq(listingsTable.status, String(req.query["status"]) as "draft"));
  if (req.query["moderationStatus"]) conditions.push(eq(listingsTable.moderationStatus, String(req.query["moderationStatus"]) as "pending"));

  const [totalResult, rows] = await Promise.all([
    db.select({ count: count() }).from(listingsTable).where(conditions.length ? and(...conditions) : undefined),
    db.select().from(listingsTable).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(listingsTable.createdAt)).limit(limit).offset(offset),
  ]);

  const total = Number(totalResult[0]?.count ?? 0);
  const [allMedia, allSellers] = await Promise.all([
    rows.length > 0 ? db.select().from(mediaTable).where(inArray(mediaTable.listingId, rows.map((r) => r.id))) : Promise.resolve([]),
    rows.length > 0 ? db.select().from(usersTable).where(inArray(usersTable.id, rows.map((r) => r.sellerId))) : Promise.resolve([]),
  ]);

  res.json({
    listings: rows.map((r) => buildDetail(r, allMedia.filter((m) => m.listingId === r.id), allSellers.find((s) => s.id === r.sellerId) ?? null)),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

router.post("/listings/:id/approve", async (req: AuthRequest, res) => {
  const [listing] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.id, req.params["id"]!))
    .limit(1);

  if (!listing) {
    res.status(404).json({ error: "Anúncio não encontrado" });
    return;
  }

  const [updated] = await db
    .update(listingsTable)
    .set({
      status: "published",
      moderationStatus: "approved",
      moderationNote: null,
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(listingsTable.id, req.params["id"]!))
    .returning();

  const media = await db.select().from(mediaTable).where(eq(mediaTable.listingId, updated.id));
  res.json(buildDetail(updated, media, null));
});

router.post("/listings/:id/reject", async (req: AuthRequest, res) => {
  const schema = z.object({ reason: z.string().min(5) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Motivo é obrigatório" });
    return;
  }

  const [listing] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.id, req.params["id"]!))
    .limit(1);

  if (!listing) {
    res.status(404).json({ error: "Anúncio não encontrado" });
    return;
  }

  const [updated] = await db
    .update(listingsTable)
    .set({
      status: "rejected",
      moderationStatus: "rejected",
      moderationNote: parsed.data.reason,
      updatedAt: new Date(),
    })
    .where(eq(listingsTable.id, req.params["id"]!))
    .returning();

  const media = await db.select().from(mediaTable).where(eq(mediaTable.listingId, updated.id));
  res.json(buildDetail(updated, media, null));
});

router.post("/listings/:id/feature", async (req: AuthRequest, res) => {
  const schema = z.object({ featured: z.boolean() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Campo featured é obrigatório" });
    return;
  }

  const [updated] = await db
    .update(listingsTable)
    .set({ isFeatured: parsed.data.featured, updatedAt: new Date() })
    .where(eq(listingsTable.id, req.params["id"]!))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Anúncio não encontrado" });
    return;
  }

  const media = await db.select().from(mediaTable).where(eq(mediaTable.listingId, updated.id));
  res.json(buildDetail(updated, media, null));
});

router.get("/users", async (req: AuthRequest, res) => {
  const page = Math.max(1, Number(req.query["page"]) || 1);
  const limit = Math.min(50, Number(req.query["limit"]) || 20);
  const offset = (page - 1) * limit;

  const conditions: ReturnType<typeof eq>[] = [];
  if (req.query["role"]) conditions.push(eq(usersTable.role, String(req.query["role"]) as "admin"));

  const [totalResult, rows] = await Promise.all([
    db.select({ count: count() }).from(usersTable).where(conditions.length ? and(...conditions) : undefined),
    db.select().from(usersTable).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(usersTable.createdAt)).limit(limit).offset(offset),
  ]);

  const total = Number(totalResult[0]?.count ?? 0);

  res.json({
    users: rows.map(toPublicUser),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

router.put("/users/:id", async (req: AuthRequest, res) => {
  const schema = z.object({
    role: z.enum(["admin", "seller", "buyer"]).optional(),
    isPremium: z.boolean().optional(),
    isActive: z.boolean().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos" });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(usersTable.id, req.params["id"]!))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Usuário não encontrado" });
    return;
  }

  res.json(toPublicUser(updated));
});

router.get("/analytics", async (req: AuthRequest, res) => {
  const period = String(req.query["period"] || "30d");
  const days = period === "7d" ? 7 : period === "90d" ? 90 : period === "1y" ? 365 : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [viewsResult, uniqueResult, interestsResult, viewsByDayRaw, interestsByType, avgByState, topListings] = await Promise.all([
    db.select({ count: count() }).from(listingViewsTable).where(gte(listingViewsTable.createdAt, since)),
    db.select({ count: sql<string>`COUNT(DISTINCT ${listingViewsTable.ipAddress})` }).from(listingViewsTable).where(gte(listingViewsTable.createdAt, since)),
    db.select({ count: count() }).from(interestsTable).where(gte(interestsTable.createdAt, since)),
    db
      .select({ date: sql<string>`DATE(${listingViewsTable.createdAt})::text`, count: count() })
      .from(listingViewsTable)
      .where(gte(listingViewsTable.createdAt, since))
      .groupBy(sql`DATE(${listingViewsTable.createdAt})`),
    db
      .select({ type: interestsTable.interestType, count: count() })
      .from(interestsTable)
      .where(gte(interestsTable.createdAt, since))
      .groupBy(interestsTable.interestType),
    db
      .select({
        state: listingsTable.state,
        avgPrice: sql<string>`AVG(${listingsTable.price}::numeric)`,
        listingCount: count(),
      })
      .from(listingsTable)
      .where(eq(listingsTable.status, "published"))
      .groupBy(listingsTable.state),
    db
      .select()
      .from(listingsTable)
      .where(eq(listingsTable.status, "published"))
      .orderBy(desc(listingsTable.viewCount))
      .limit(5),
  ]);

  const totalViews = Number(viewsResult[0]?.count ?? 0);
  const totalInterests = Number(interestsResult[0]?.count ?? 0);

  const topMedia = topListings.length > 0
    ? await db.select().from(mediaTable).where(inArray(mediaTable.listingId, topListings.map((r) => r.id)))
    : [];

  res.json({
    period,
    totalViews,
    uniqueVisitors: Number(uniqueResult[0]?.count ?? 0),
    totalInterests,
    conversionRate: totalViews > 0 ? Math.round((totalInterests / totalViews) * 10000) / 100 : 0,
    avgPriceByState: avgByState
      .filter((r) => r.state)
      .map((r) => ({ state: r.state!, avgPrice: Math.round(Number(r.avgPrice) || 0), listingCount: Number(r.listingCount) })),
    viewsByDay: viewsByDayRaw.map((v) => ({ date: v.date, count: Number(v.count) })),
    topListings: topListings.map((r) => {
      const media = topMedia.filter((m) => m.listingId === r.id);
      const images = media.filter((m) => m.mediaType === "image");
      const primary = images.find((m) => m.isPrimary) || images[0];
      return {
        id: r.id, slug: r.slug, title: r.title,
        price: r.price ? Number(r.price) : null,
        negotiable: r.negotiable,
        totalArea: r.totalArea ? Number(r.totalArea) : null,
        areaUnit: r.areaUnit,
        pricePerHectare: r.pricePerHectare ? Number(r.pricePerHectare) : null,
        state: r.state, city: r.city, country: r.country,
        propertyType: r.propertyType,
        isFeatured: r.isFeatured, isPremium: r.isPremium,
        coverImageUrl: primary?.url ?? null,
        thumbnailUrls: images.slice(0, 4).map((m) => m.url),
        viewCount: r.viewCount, favoriteCount: r.favoriteCount, createdAt: r.createdAt,
      };
    }),
    interestsByType: interestsByType.map((v) => ({ type: v.type, count: Number(v.count) })),
  });
});

export default router;
