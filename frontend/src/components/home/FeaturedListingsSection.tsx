import { useState } from "react";
import { Link } from "wouter";
import type { ListingSummary } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, Share2, Play } from "lucide-react";
import { formatCurrency, formatArea, cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const WA_FALLBACK = "5567999999999";

function listingPriceLabel(listing: ListingSummary) {
  if (listing.negotiable && (listing.price == null || listing.price === 0)) {
    return "R$ A combinar";
  }
  if (listing.price == null) return "Sob consulta";
  return formatCurrency(listing.price);
}

function listingDescriptionLines(listing: ListingSummary): string[] {
  const lines: string[] = [];
  if (listing.totalArea != null) {
    lines.push(`Área total: ${formatArea(listing.totalArea, listing.areaUnit)}.`);
  }
  if (listing.propertyType) {
    lines.push(
      `Propriedade rural — ${listing.propertyType}. Negociação com credibilidade e suporte à visita.`,
    );
  }
  if (listing.pricePerHectare != null && listing.price != null) {
    lines.push(`Referência: ${formatCurrency(listing.pricePerHectare)} por hectare.`);
  }
  if (lines.length < 2) {
    lines.push(
      "Entre em contato para agenda de visita e documentação. Atendimento focado no Mato Grosso do Sul.",
    );
  }
  return lines.slice(0, 4);
}

function listingDetailUrl(slug: string) {
  return `/imoveis/${slug}`;
}

function whatsappHref(listing: ListingSummary) {
  const raw = import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined;
  const digits = (raw && raw.replace(/\D/g, "")) || WA_FALLBACK;
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const pageUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${basePath}/imoveis/${listing.slug}`
      : "";
  const text = encodeURIComponent(
    `Olá! Tenho interesse no imóvel: ${listing.title}${pageUrl ? ` — ${pageUrl}` : ""}`,
  );
  return `https://wa.me/${digits}?text=${text}`;
}

function FeaturedListingCard({ listing }: { listing: ListingSummary }) {
  const { toast } = useToast();
  const [fav, setFav] = useState(false);
  const base = import.meta.env.BASE_URL;
  const cover = listing.coverImageUrl || `${base}images/farm-placeholder.png`;
  const lines = listingDescriptionLines(listing);

  const handleShare = async () => {
    const origin = window.location.origin;
    const basePath = base.replace(/\/$/, "");
    const url = `${origin}${basePath}/imoveis/${listing.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: listing.title, text: listing.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copiado", description: "Cole e envie onde quiser." });
      }
    } catch {
      /* cancelado ou indisponível */
    }
  };

  const showVideoCue =
    Boolean(
      listing.coverImageUrl?.includes("youtube.com") ||
        listing.coverImageUrl?.includes("youtu.be"),
    );

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg shadow-black/10",
        "transition-shadow duration-300 hover:shadow-xl hover:shadow-black/12",
      )}
    >
      <Link href={listingDetailUrl(listing.slug)} className="relative block aspect-[16/10] shrink-0 overflow-hidden bg-muted">
        <img src={cover} alt="" className="h-full w-full object-cover" />
        {listing.isPremium && (
          <span className="absolute left-3 top-3 rounded-md bg-accent px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-accent-foreground shadow-md">
            Premium
          </span>
        )}
        {showVideoCue && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/25">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
              <Play className="h-7 w-7 ml-0.5" fill="currentColor" />
            </span>
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={listingDetailUrl(listing.slug)}
            className="min-w-0 flex-1 text-left font-display text-sm font-bold uppercase leading-snug tracking-wide text-foreground hover:text-primary sm:text-base"
          >
            {listing.title}
          </Link>
          <div className="flex shrink-0 gap-0.5">
            <button
              type="button"
              aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              onClick={() => setFav((v) => !v)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
            >
              <Heart
                className={cn("h-5 w-5", fav && "fill-destructive text-destructive")}
                strokeWidth={1.75}
              />
            </button>
            <button
              type="button"
              aria-label="Compartilhar"
              onClick={handleShare}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Share2 className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div className="space-y-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {lines.map((line, i) => (
            <p key={i} className="line-clamp-2">
              {line}
            </p>
          ))}
        </div>

        <p className="font-display text-lg font-bold text-foreground">{listingPriceLabel(listing)}</p>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
          <span>
            {[listing.city, listing.state].filter(Boolean).join(" ") || "Localização sob consulta"}
          </span>
        </div>

        <div className="mt-auto flex gap-2 pt-1">
          <Button
            asChild
            className="h-10 flex-1 rounded-lg border-0 bg-[#8bc34a] font-semibold text-white shadow-sm hover:bg-[#7cb342]"
          >
            <Link href={listingDetailUrl(listing.slug)}>Ver Detalhes</Link>
          </Button>
          <Button
            asChild
            className="h-10 flex-1 rounded-lg border-0 bg-primary font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <a href={whatsappHref(listing)} target="_blank" rel="noopener noreferrer">
              Fale pelo Whatsapp
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}

/**
 * Título central verde (meia-elipse em baixo) — mesmo estilo em “Imóveis em destaque”, “Oportunidades”, etc.
 */
export function GreenSectionTitleTab({ title }: { title: string }) {
  return (
    <div className="pointer-events-auto leading-none shadow-[0_10px_32px_rgba(0,0,0,0.22)]">
      <div
        className={cn(
          "mx-auto bg-[hsl(142_76%_10%)] px-8 py-2.5 text-center sm:px-12 sm:py-3",
          "w-[min(22rem,calc(100vw-2.5rem))] min-w-[16rem] max-w-[22rem]",
          "rounded-t-lg rounded-b-[3rem] sm:rounded-b-[3.5rem]",
        )}
      >
        <h2 className="font-display text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] sm:text-xs sm:tracking-[0.22em]">
          {title}
        </h2>
      </div>
    </div>
  );
}

/** Alias para a home: transição hero → listagem. */
export function FeaturedListingsHeroTab() {
  return <GreenSectionTitleTab title="Imóveis em destaque" />;
}

type Props = {
  listings: ListingSummary[];
};

export function FeaturedListingsSection({ listings }: Props) {
  if (listings.length === 0) return null;

  return (
    <section className="relative bg-[hsl(142_12%_92%)] pb-14 pt-14 sm:pb-20 sm:pt-[4.25rem]">
      <div className="pointer-events-none absolute left-1/2 top-3 z-20 -translate-x-1/2 -translate-y-[26%] sm:-translate-y-[30%]">
        <FeaturedListingsHeroTab />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-end sm:mb-10">
          <Link
            href="/imoveis"
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Ver todas
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:gap-10">
          {listings.map((listing) => (
            <FeaturedListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </section>
  );
}
