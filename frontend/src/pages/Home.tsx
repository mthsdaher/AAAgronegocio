import { PublicLayout } from "@/components/layout/PublicLayout";
import { HomeSearchFilters } from "@/components/home/HomeSearchFilters";
import { FeaturedListingsSection } from "@/components/home/FeaturedListingsSection";
import { OportunidadesCarousel } from "@/components/home/OportunidadesCarousel";
import { HomeSobreSection } from "@/components/home/HomeSobreSection";
import { useGetFeaturedListings } from "@workspace/api-client-react";
import { getDemoFeaturedListings } from "@/data/demoFeaturedListings";

export default function Home() {
  const { data: featured, isError } = useGetFeaturedListings({ limit: 6 });
  const fromApi = Array.isArray(featured) ? featured : [];
  const usingDemoFallback = import.meta.env.DEV && isError;
  const featuredListings = usingDemoFallback
    ? getDemoFeaturedListings(import.meta.env.BASE_URL)
    : fromApi;
  const base = import.meta.env.BASE_URL;
  const logoHeroSrc = `${base}images/logo_sem_fundo.png`;
  const heroImageSrc = `${base}images/paisagem2.jpg`;

  return (
    <PublicLayout>
      {/* Hero + faixa “Imóveis em destaque” colada ao fundo da imagem (meia-elipse) */}
      <section className="relative flex min-h-[min(100vh,920px)] flex-col overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImageSrc}
            alt=""
            className="h-full w-full object-cover object-[center_36%]"
          />
          <div className="absolute inset-0 hero-gradient-overlay" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/40" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[min(calc(100vh-5rem),880px)] w-full max-w-2xl flex-1 flex-col items-center gap-9 px-5 py-10 sm:gap-10 sm:px-6 sm:py-12">
          {/* 1. Logo + frase */}
          <div className="mt-8 flex w-full flex-col items-center gap-4 text-center animate-in fade-in duration-700 sm:mt-10">
            <div className="w-full max-w-[17.5rem] shrink-0 sm:max-w-xs">
              <img
                src={logoHeroSrc}
                alt="AAAgronegócio Fazendas"
                className="h-auto w-full rounded-2xl object-contain"
              />
            </div>
            <p className="w-full max-w-xl text-pretty px-1 text-sm leading-relaxed text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)] sm:max-w-2xl sm:px-2 sm:text-base">
              Traga sua propriedade para ser negociada com quem possui credibilidade e história com o Mato Grosso do Sul.
            </p>
          </div>

          {/* 2. Filtros */}
          <div className="w-full max-w-md shrink-0 animate-in slide-in-from-bottom-4 duration-700 fade-in">
            <HomeSearchFilters />
          </div>
        </div>
      </section>

      <FeaturedListingsSection listings={featuredListings} />
      <OportunidadesCarousel listings={featuredListings} />
      <HomeSobreSection />
    </PublicLayout>
  );
}
