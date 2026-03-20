import { Router, IRouter } from "express";
import { db } from "@workspace/db";
import {
  listingsTable,
  usersTable,
  mediaTable,
  listingViewsTable,
  interestsTable,
  favoritesTable,
} from "@workspace/db/schema";
import { eq, and, gte, lte, like, ilike, or, desc, asc, sql, count, inArray } from "drizzle-orm";
import { z } from "zod";
import { requireAuth, requireRole, AuthRequest } from "../lib/auth.js";
import { generateSlug } from "../lib/slug.js";

const router: IRouter = Router();

function toNumber(v: unknown): number | null {
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function buildListingSummary(
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
    createdAt: listing.createdAt,
  };
}

function buildListingDetail(
  listing: typeof listingsTable.$inferSelect,
  media: Array<typeof mediaTable.$inferSelect>,
  seller: typeof usersTable.$inferSelect | null
) {
  return {
    ...buildListingSummary(listing, media),
    description: listing.description,
    status: listing.status,
    moderationStatus: listing.moderationStatus,
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
    seller: seller
      ? {
          id: seller.id,
          name: seller.name,
          phone: seller.phone,
          isPremium: seller.isPremium,
        }
      : null,
    interestCount: listing.interestCount,
    updatedAt: listing.updatedAt,
    publishedAt: listing.publishedAt,
  };
}

router.get("/featured", async (req, res) => {
  const limit = Math.min(Number(req.query["limit"]) || 6, 12);
  const rows = await db
    .select()
    .from(listingsTable)
    .where(
      and(
        eq(listingsTable.status, "published"),
        eq(listingsTable.isFeatured, true)
      )
    )
    .orderBy(desc(listingsTable.publishedAt))
    .limit(limit);

  const allMedia = rows.length > 0
    ? await db.select().from(mediaTable).where(inArray(mediaTable.listingId, rows.map((r) => r.id)))
    : [];

  res.json(rows.map((r) => buildListingSummary(r, allMedia.filter((m) => m.listingId === r.id))));
});

router.get("/map", async (req, res) => {
  const conditions = [eq(listingsTable.status, "published")];

  if (req.query["state"]) conditions.push(eq(listingsTable.state, String(req.query["state"])));
  if (req.query["country"]) conditions.push(eq(listingsTable.country, String(req.query["country"])));
  if (req.query["propertyType"]) conditions.push(eq(listingsTable.propertyType, String(req.query["propertyType"])));

  const rows = await db
    .select({
      id: listingsTable.id,
      slug: listingsTable.slug,
      title: listingsTable.title,
      latitude: listingsTable.latitude,
      longitude: listingsTable.longitude,
      price: listingsTable.price,
      totalArea: listingsTable.totalArea,
      areaUnit: listingsTable.areaUnit,
      isFeatured: listingsTable.isFeatured,
      propertyType: listingsTable.propertyType,
    })
    .from(listingsTable)
    .where(and(...conditions))
    .limit(500);

  const pins = rows
    .filter((r) => r.latitude != null && r.longitude != null)
    .map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
      price: r.price ? Number(r.price) : null,
      totalArea: r.totalArea ? Number(r.totalArea) : null,
      areaUnit: r.areaUnit,
      isFeatured: r.isFeatured,
      propertyType: r.propertyType,
    }));

  res.json(pins);
});

router.get("/", async (req, res) => {
  const page = Math.max(1, Number(req.query["page"]) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query["limit"]) || 12));
  const offset = (page - 1) * limit;

  const conditions: ReturnType<typeof eq>[] = [eq(listingsTable.status, "published")];

  if (req.query["search"]) {
    const s = `%${String(req.query["search"])}%`;
    conditions.push(
      or(like(listingsTable.title, s), like(listingsTable.city, s), like(listingsTable.state, s)) as ReturnType<typeof eq>
    );
  }
  if (req.query["state"]) conditions.push(eq(listingsTable.state, String(req.query["state"])));
  if (req.query["city"]) conditions.push(eq(listingsTable.city, String(req.query["city"])));
  if (req.query["country"]) conditions.push(eq(listingsTable.country, String(req.query["country"])));
  if (req.query["propertyType"]) {
    const pt = String(req.query["propertyType"]).trim();
    if (pt && pt.toLowerCase() !== "todos" && pt.toLowerCase() !== "all") {
      conditions.push(ilike(listingsTable.propertyType, pt));
    }
  }
  if (req.query["aptitude"]) {
    const a = String(req.query["aptitude"]).trim();
    if (a && a.toLowerCase() !== "todos" && a.toLowerCase() !== "all") {
      const term = `%${a}%`;
      conditions.push(
        or(
          ilike(listingsTable.productiveActivities, term),
          ilike(listingsTable.cropDetails, term),
          ilike(listingsTable.plantedCrops, term),
          ilike(listingsTable.description, term)
        ) as ReturnType<typeof eq>
      );
    }
  }
  if (req.query["minPrice"]) conditions.push(gte(listingsTable.price, String(req.query["minPrice"])));
  if (req.query["maxPrice"]) conditions.push(lte(listingsTable.price, String(req.query["maxPrice"])));
  if (req.query["minArea"]) conditions.push(gte(listingsTable.totalArea, String(req.query["minArea"])));
  if (req.query["maxArea"]) conditions.push(lte(listingsTable.totalArea, String(req.query["maxArea"])));
  if (req.query["hasIrrigation"] === "true") conditions.push(eq(listingsTable.hasIrrigation, true));
  if (req.query["hasWater"] === "true")
    conditions.push(
      or(
        eq(listingsTable.hasRiver, true),
        eq(listingsTable.hasLake, true),
        eq(listingsTable.hasWell, true)
      ) as ReturnType<typeof eq>
    );

  const totalResult = await db
    .select({ count: count() })
    .from(listingsTable)
    .where(and(...conditions));
  const total = Number(totalResult[0]?.count ?? 0);

  const sortBy = String(req.query["sortBy"] || "featured");
  let orderBy;
  switch (sortBy) {
    case "price_asc": orderBy = asc(listingsTable.price); break;
    case "price_desc": orderBy = desc(listingsTable.price); break;
    case "area_asc": orderBy = asc(listingsTable.totalArea); break;
    case "area_desc": orderBy = desc(listingsTable.totalArea); break;
    case "newest": orderBy = desc(listingsTable.createdAt); break;
    default: orderBy = desc(listingsTable.isFeatured);
  }

  const rows = await db
    .select()
    .from(listingsTable)
    .where(and(...conditions))
    .orderBy(orderBy, desc(listingsTable.isPremium), desc(listingsTable.createdAt))
    .limit(limit)
    .offset(offset);

  const allMedia = rows.length > 0
    ? await db.select().from(mediaTable).where(inArray(mediaTable.listingId, rows.map((r) => r.id)))
    : [];

  res.json({
    listings: rows.map((r) => buildListingSummary(r, allMedia.filter((m) => m.listingId === r.id))),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

router.get("/:slug", async (req, res) => {
  const [listing] = await db
    .select()
    .from(listingsTable)
    .where(
      and(
        eq(listingsTable.slug, req.params["slug"]!),
        eq(listingsTable.status, "published")
      )
    )
    .limit(1);

  if (!listing) {
    res.status(404).json({ error: "Anúncio não encontrado" });
    return;
  }

  const [media, sellerRows] = await Promise.all([
    db.select().from(mediaTable).where(eq(mediaTable.listingId, listing.id)).orderBy(asc(mediaTable.sortOrder)),
    db.select().from(usersTable).where(eq(usersTable.id, listing.sellerId)).limit(1),
  ]);

  res.json(buildListingDetail(listing, media, sellerRows[0] ?? null));
});

router.post("/:slug/view", async (req, res) => {
  const [listing] = await db
    .select({ id: listingsTable.id })
    .from(listingsTable)
    .where(eq(listingsTable.slug, req.params["slug"]!))
    .limit(1);

  if (!listing) {
    res.status(404).json({ error: "Anúncio não encontrado" });
    return;
  }

  await Promise.all([
    db.insert(listingViewsTable).values({
      listingId: listing.id,
      source: req.body?.source,
      referrer: req.body?.referrer,
      deviceType: req.body?.deviceType,
      ipAddress: req.ip,
    }),
    db
      .update(listingsTable)
      .set({ viewCount: sql`${listingsTable.viewCount} + 1` })
      .where(eq(listingsTable.id, listing.id)),
  ]);

  res.json({ message: "Visualização registrada" });
});

router.post("/:slug/interest", async (req, res) => {
  const [listing] = await db
    .select()
    .from(listingsTable)
    .where(
      and(
        eq(listingsTable.slug, req.params["slug"]!),
        eq(listingsTable.status, "published")
      )
    )
    .limit(1);

  if (!listing) {
    res.status(404).json({ error: "Anúncio não encontrado" });
    return;
  }

  const schema = z.object({
    interestType: z.enum(["info", "proposal", "visit"]),
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    message: z.string().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos" });
    return;
  }

  const { interestType, name, email, phone, message } = parsed.data;

  await Promise.all([
    db.insert(interestsTable).values({
      listingId: listing.id,
      interestType,
      name,
      email,
      phone,
      message,
    }),
    db
      .update(listingsTable)
      .set({ interestCount: sql`${listingsTable.interestCount} + 1` })
      .where(eq(listingsTable.id, listing.id)),
  ]);

  const typeLabels = {
    info: "mais informações",
    proposal: "proposta inicial",
    visit: "agendamento de visita",
  };

  const farmMessage = `Olá! Tenho interesse no imóvel *${listing.title}* (${listing.city ?? ""}/${listing.state ?? ""}) e gostaria de solicitar ${typeLabels[interestType]}.${name ? ` Meu nome é ${name}.` : ""}${message ? ` Mensagem: ${message}` : ""}`;
  const whatsappNumber = process.env["WHATSAPP_NUMBER"] || "5511999999999";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(farmMessage)}`;

  const emailSubject = `Interesse em imóvel: ${listing.title}`;
  const brokerEmail = process.env["BROKER_EMAIL"] || "contato@aaagronegocio.com.br";
  const emailUrl = `mailto:${brokerEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(farmMessage)}`;

  res.json({ whatsappUrl, emailUrl, message: "Interesse registrado com sucesso" });
});

export default router;
