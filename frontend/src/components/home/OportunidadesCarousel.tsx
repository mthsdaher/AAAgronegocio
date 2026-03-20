import { Link } from "wouter";
import type { ListingSummary } from "@workspace/api-client-react";
import { MapPin } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { formatCurrency } from "@/lib/utils";
import { GreenSectionTitleTab } from "@/components/home/FeaturedListingsSection";

function listingPriceLabel(listing: ListingSummary) {
  if (listing.negotiable && (listing.price == null || listing.price === 0)) {
    return "R$ A combinar";
  }
  if (listing.price == null) return "Sob consulta";
  return formatCurrency(listing.price);
}

function listingDetailUrl(slug: string) {
  return `/imoveis/${slug}`;
}

type Props = {
  listings: ListingSummary[];
};

export function OportunidadesCarousel({ listings }: Props) {
  if (listings.length === 0) return null;

  return (
    <section className="relative border-t border-primary/10 bg-[hsl(142_12%_92%)] pb-14 pt-14 sm:pb-20 sm:pt-[4.25rem]">
      <div className="pointer-events-none absolute left-1/2 top-3 z-20 -translate-x-1/2 -translate-y-[26%] sm:-translate-y-[30%]">
        <GreenSectionTitleTab title="Oportunidades" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative px-10 sm:px-14">
          <Carousel
            opts={{
              align: "start",
              loop: listings.length > 2,
              dragFree: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-3 md:-ml-4">
              {listings.map((listing) => {
                const base = import.meta.env.BASE_URL;
                const cover =
                  listing.coverImageUrl || `${base}images/farm-placeholder.png`;
                return (
                  <CarouselItem
                    key={listing.id}
                    className="pl-3 md:basis-1/2 md:pl-4 lg:basis-[42%] xl:basis-[36%]"
                  >
                    <article className="h-full overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg shadow-black/10 transition-shadow hover:shadow-xl hover:shadow-black/12">
                      <Link
                        href={listingDetailUrl(listing.slug)}
                        className="relative block aspect-[16/10] overflow-hidden bg-muted"
                      >
                        <img
                          src={cover}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                        {listing.isPremium && (
                          <span className="absolute left-3 top-3 rounded-md bg-accent px-2 py-0.5 text-xs font-bold uppercase text-accent-foreground">
                            Premium
                          </span>
                        )}
                      </Link>
                      <div className="space-y-2 p-4">
                        <Link
                          href={listingDetailUrl(listing.slug)}
                          className="line-clamp-2 font-display text-sm font-bold uppercase leading-snug tracking-wide text-foreground hover:text-primary"
                        >
                          {listing.title}
                        </Link>
                        <p className="font-display text-lg font-bold text-foreground">
                          {listingPriceLabel(listing)}
                        </p>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 shrink-0 text-primary" />
                          <span>
                            {[listing.city, listing.state]
                              .filter(Boolean)
                              .join(" ") || "Localização sob consulta"}
                          </span>
                        </div>
                      </div>
                    </article>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious
              variant="outline"
              className="left-0 border-primary/20 bg-background/95 shadow-md sm:-left-2"
            />
            <CarouselNext
              variant="outline"
              className="right-0 border-primary/20 bg-background/95 shadow-md sm:-right-1"
            />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
