/**
 * Insere usuário vendedor demo + 4 imóveis publicados em destaque com imagens
 * da pasta public/images do frontend (URLs relativas /images/...).
 *
 * Uso (na raiz do repo, com DATABASE_URL definido):
 *   npm run db:seed-demo
 */
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db, listingsTable, mediaTable, usersTable } from "@workspace/db";

const DEMO_SELLER_EMAIL = "demo.vendedor@aaagronegocio.local";
const DEMO_SELLER_NAME = "Vendedor Demo";
const DEMO_PASSWORD = "DemoSeed!1";

const PROPERTIES = [
  {
    slug: "demo-fazenda-aguia-negra",
    title: "Fazenda Águia Negra",
    description:
      "Área consolidada com pastagens e reserva legal. Dois córregos percorrem a propriedade. Ideal para pecuária de corte e integração lavoura-pecuária.",
    price: "180000000.00" as const,
    negotiable: false,
    city: "Campo Grande",
    state: "MS",
    country: "Brasil",
    totalArea: "12400.0000",
    areaUnit: "hectares" as const,
    propertyType: "Fazenda",
    isPremium: true,
    imagePath: "/images/paisagem1.jpg",
  },
  {
    slug: "demo-fazenda-rio-verde",
    title: "Fazenda Rio Verde",
    description:
      "Propriedade com aptidão mista, parte em lavoura de soja e milho e parte em pecuária. Benfeitorias completas e acesso pavimentado.",
    price: "95000000.00" as const,
    negotiable: false,
    city: "Dourados",
    state: "MS",
    country: "Brasil",
    totalArea: "8200.0000",
    areaUnit: "hectares" as const,
    propertyType: "Fazenda",
    isPremium: false,
    imagePath: "/images/paisagem2.jpg",
  },
  {
    slug: "demo-sitio-bela-vista-ms",
    title: "Sítio Bela Vista",
    description:
      "Sítio com casa sede, pomar e área de lazer. Ótimo para investimento em turismo rural ou moradia com produção familiar.",
    price: null,
    negotiable: true,
    city: "Três Lagoas",
    state: "MS",
    country: "Brasil",
    totalArea: "85.0000",
    areaUnit: "hectares" as const,
    propertyType: "Sítio",
    isPremium: false,
    imagePath: "/images/paisagem3.JPG",
  },
  {
    slug: "demo-chacara-sol-nascente",
    title: "Chácara Sol Nascente",
    description:
      "Chácara próxima à rodovia, energia elétrica e poço artesiano. Terreno plano com excelente solo para hortifruti.",
    price: "2400000.00" as const,
    negotiable: true,
    city: "Sidrolândia",
    state: "MS",
    country: "Brasil",
    totalArea: "12.5000",
    areaUnit: "hectares" as const,
    propertyType: "Chácara",
    isPremium: false,
    imagePath: "/images/paisagem4.JPG",
  },
] as const;

async function getOrCreateSeller(): Promise<string> {
  const [existing] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, DEMO_SELLER_EMAIL))
    .limit(1);

  if (existing) return existing.id;

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const [created] = await db
    .insert(usersTable)
    .values({
      name: DEMO_SELLER_NAME,
      email: DEMO_SELLER_EMAIL,
      passwordHash,
      role: "seller",
      phone: "+5567999001234",
      isActive: true,
    })
    .returning({ id: usersTable.id });

  if (!created) throw new Error("Falha ao criar vendedor demo");
  console.log(`Criado vendedor demo: ${DEMO_SELLER_EMAIL} (senha: ${DEMO_PASSWORD})`);
  return created.id;
}

async function main() {
  const sellerId = await getOrCreateSeller();
  const now = new Date();

  for (const p of PROPERTIES) {
    const [row] = await db
      .select({ id: listingsTable.id })
      .from(listingsTable)
      .where(eq(listingsTable.slug, p.slug))
      .limit(1);

    if (row) {
      console.log(`Já existe: ${p.slug} — ignorando`);
      continue;
    }

    const [listing] = await db
      .insert(listingsTable)
      .values({
        slug: p.slug,
        sellerId,
        title: p.title,
        description: p.description,
        price: p.price,
        negotiable: p.negotiable,
        status: "published",
        moderationStatus: "approved",
        isFeatured: true,
        isPremium: p.isPremium,
        country: p.country,
        state: p.state,
        city: p.city,
        totalArea: p.totalArea,
        areaUnit: p.areaUnit,
        propertyType: p.propertyType,
        aptidaoPecuaria: p.propertyType === "Fazenda",
        aptidaoAgricola: p.propertyType === "Fazenda" || p.propertyType === "Sítio",
        publishedAt: now,
        updatedAt: now,
      })
      .returning({ id: listingsTable.id });

    if (!listing) throw new Error(`Insert falhou: ${p.slug}`);

    await db.insert(mediaTable).values({
      listingId: listing.id,
      url: p.imagePath,
      mediaType: "image",
      isPrimary: true,
      sortOrder: 0,
      fileName: p.imagePath.split("/").pop() ?? "cover.jpg",
    });

    console.log(`Inserido: ${p.title} (${p.slug})`);
  }

  console.log("Concluído. Recarregue a home para ver os cards (2 por linha em telas md+).");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
