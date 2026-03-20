import { Router, IRouter } from "express";
import { db } from "@workspace/db";
import { listingsTable } from "@workspace/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";
import { requireAuth, requireRole, AuthRequest } from "../lib/auth.js";

const router: IRouter = Router();

router.use(requireAuth, requireRole("seller", "admin"));

async function callAI(prompt: string): Promise<string> {
  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY não configurado");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é um especialista em imóveis rurais no Brasil. Sua função é ajudar vendedores a criar anúncios persuasivos e precisos de fazendas e propriedades rurais. Escreva sempre em português brasileiro, de forma profissional e atrativa.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0]?.message.content ?? "";
}

router.post("/generate-description", async (req: AuthRequest, res) => {
  const schema = z.object({
    listingId: z.string(),
    farmData: z.record(z.unknown()),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos" });
    return;
  }

  const { listingId, farmData } = parsed.data;

  const [listing] = await db
    .select({ id: listingsTable.id })
    .from(listingsTable)
    .where(
      and(
        eq(listingsTable.id, listingId),
        req.user!.role === "admin" ? sql`TRUE` : eq(listingsTable.sellerId, req.user!.userId)
      )
    )
    .limit(1);

  if (!listing) {
    res.status(404).json({ error: "Anúncio não encontrado" });
    return;
  }

  const prompt = `Crie uma descrição profissional e atrativa para o seguinte imóvel rural:

Dados da propriedade:
${JSON.stringify(farmData, null, 2)}

A descrição deve:
- Ter entre 150-300 palavras
- Destacar os principais atrativos da propriedade
- Mencionar a localização, área, recursos hídricos e infraestrutura disponíveis
- Usar linguagem profissional e persuasiva
- Ser adequada para um anúncio de imóvel rural de alto padrão

Retorne apenas a descrição, sem títulos ou marcações extras.`;

  try {
    const text = await callAI(prompt);
    res.json({ text, message: "Descrição gerada com sucesso" });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Erro ao gerar descrição";
    res.status(500).json({ error: errMsg });
  }
});

router.post("/improve-title", async (req: AuthRequest, res) => {
  const schema = z.object({
    listingId: z.string(),
    currentTitle: z.string(),
    farmData: z.record(z.unknown()),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos" });
    return;
  }

  const { listingId, currentTitle, farmData } = parsed.data;

  const [listing] = await db
    .select({ id: listingsTable.id })
    .from(listingsTable)
    .where(
      and(
        eq(listingsTable.id, listingId),
        req.user!.role === "admin" ? sql`TRUE` : eq(listingsTable.sellerId, req.user!.userId)
      )
    )
    .limit(1);

  if (!listing) {
    res.status(404).json({ error: "Anúncio não encontrado" });
    return;
  }

  const prompt = `Melhore o título do seguinte anúncio de imóvel rural:

Título atual: "${currentTitle}"

Dados da propriedade:
${JSON.stringify(farmData, null, 2)}

Gere 3 sugestões de títulos melhorados que:
- Tenham entre 40-80 caracteres
- Sejam atrativos e informativos
- Mencionem área e/ou localização quando relevante
- Destaquem o diferencial da propriedade
- Sejam otimizados para buscas

Retorne apenas os 3 títulos, um por linha, sem numeração ou marcações extras.`;

  try {
    const text = await callAI(prompt);
    const suggestions = text
      .split("\n")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 3);
    res.json({ suggestions, message: "Sugestões de título geradas com sucesso" });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Erro ao melhorar título";
    res.status(500).json({ error: errMsg });
  }
});

router.post("/suggest-price", async (req: AuthRequest, res) => {
  const schema = z.object({
    listingId: z.string(),
    state: z.string(),
    totalArea: z.number(),
    areaUnit: z.string(),
    propertyType: z.string().nullable().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos" });
    return;
  }

  const { state, totalArea, areaUnit, propertyType } = parsed.data;

  const comparables = await db
    .select({
      price: listingsTable.price,
      totalArea: listingsTable.totalArea,
      pricePerHectare: listingsTable.pricePerHectare,
    })
    .from(listingsTable)
    .where(
      and(
        eq(listingsTable.status, "published"),
        eq(listingsTable.state, state),
        sql`${listingsTable.price} IS NOT NULL`
      )
    )
    .limit(20);

  const prices = comparables
    .filter((c) => c.pricePerHectare)
    .map((c) => Number(c.pricePerHectare));

  let suggestedPrice = 0;
  let suggestedMinPrice = 0;
  let suggestedMaxPrice = 0;
  let pricePerHectare = 0;

  if (prices.length > 0) {
    const avg = prices.reduce((s, p) => s + p, 0) / prices.length;
    const sorted = [...prices].sort((a, b) => a - b);
    const p25 = sorted[Math.floor(sorted.length * 0.25)] ?? avg * 0.8;
    const p75 = sorted[Math.floor(sorted.length * 0.75)] ?? avg * 1.2;

    const areaInHectares = areaUnit === "alqueires" ? totalArea * 4.84 : areaUnit === "acres" ? totalArea * 0.405 : totalArea;
    pricePerHectare = avg;
    suggestedPrice = Math.round(avg * areaInHectares);
    suggestedMinPrice = Math.round(p25 * areaInHectares);
    suggestedMaxPrice = Math.round(p75 * areaInHectares);
  }

  res.json({
    suggestedMinPrice,
    suggestedMaxPrice,
    suggestedPrice,
    pricePerHectare: Math.round(pricePerHectare),
    comparableCount: comparables.length,
    message:
      comparables.length > 0
        ? `Sugestão baseada em ${comparables.length} propriedades comparáveis em ${state}`
        : `Dados insuficientes para ${state}. Tente expandir a busca.`,
  });
});

export default router;
