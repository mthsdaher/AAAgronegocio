import { Router, IRouter } from "express";
import { db } from "@workspace/db";
import { listingsTable, mediaTable, favoritesTable, interestsTable } from "@workspace/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../lib/auth.js";

const router: IRouter = Router();

router.use(requireAuth);

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
    createdAt: listing.createdAt,
  };
}

router.get("/favorites", async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const favs = await db
    .select({ listingId: favoritesTable.listingId })
    .from(favoritesTable)
    .where(eq(favoritesTable.userId, userId));

  if (favs.length === 0) {
    res.json([]);
    return;
  }

  const listingIds = favs.map((f) => f.listingId);
  const [rows, allMedia] = await Promise.all([
    db.select().from(listingsTable).where(inArray(listingsTable.id, listingIds)),
    db.select().from(mediaTable).where(inArray(mediaTable.listingId, listingIds)),
  ]);

  res.json(rows.map((r) => buildSummary(r, allMedia.filter((m) => m.listingId === r.id))));
});

router.post("/favorites/:listingId", async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const { listingId } = req.params;

  const existing = await db
    .select()
    .from(favoritesTable)
    .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.listingId, listingId!)))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(favoritesTable).values({ userId, listingId: listingId! });
  }

  res.json({ message: "Adicionado aos favoritos" });
});

router.delete("/favorites/:listingId", async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const { listingId } = req.params;

  await db
    .delete(favoritesTable)
    .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.listingId, listingId!)));

  res.json({ message: "Removido dos favoritos" });
});

router.get("/interests", async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const interests = await db
    .select()
    .from(interestsTable)
    .where(eq(interestsTable.userId, userId))
    .orderBy(desc(interestsTable.createdAt))
    .limit(50);

  if (interests.length === 0) {
    res.json([]);
    return;
  }

  const listingIds = [...new Set(interests.map((i) => i.listingId))];
  const [rows, allMedia] = await Promise.all([
    db.select().from(listingsTable).where(inArray(listingsTable.id, listingIds)),
    db.select().from(mediaTable).where(inArray(mediaTable.listingId, listingIds)),
  ]);

  res.json(
    interests.map((i) => {
      const listing = rows.find((r) => r.id === i.listingId);
      return {
        id: i.id,
        interestType: i.interestType,
        listingId: i.listingId,
        listing: listing
          ? buildSummary(listing, allMedia.filter((m) => m.listingId === listing.id))
          : null,
        createdAt: i.createdAt,
      };
    })
  );
});

export default router;
