import { Link } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, ChevronRight, Droplets, Tractor, Expand } from "lucide-react";
import { useGetFeaturedListings } from "@workspace/api-client-react";
import { formatCurrency, formatArea } from "@/lib/utils";

export default function Home() {
  const { data: featured } = useGetFeaturedListings({ limit: 6 });

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-farm.png`} 
            alt="Brazilian Farm Landscape" 
            className="w-full h-full object-cover scale-105 animate-in zoom-in duration-1000"
          />
          <div className="absolute inset-0 hero-gradient-overlay" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16 animate-in slide-in-from-bottom-8 duration-700 fade-in">
          <span className="inline-block py-1 px-3 rounded-full bg-accent/20 border border-accent/50 text-accent font-medium text-sm mb-6 backdrop-blur-md">
            O Maior Portal de Agronegócio do Brasil
          </span>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight text-balance">
            Encontre a Fazenda <span className="text-accent italic">Perfeita</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto text-balance">
            Plataforma premium para compra e venda de propriedades rurais. Conectando investidores ao verdadeiro potencial da terra.
          </p>
          
          {/* Quick Search Bar */}
          <div className="bg-white/10 backdrop-blur-xl p-3 rounded-2xl border border-white/20 shadow-2xl flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Estado ou Cidade..." 
                className="pl-12 h-14 bg-white/90 border-transparent text-lg rounded-xl focus-visible:ring-accent"
              />
            </div>
            <div className="relative flex-1">
              <Tractor className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <select className="w-full h-14 pl-12 pr-4 bg-white/90 border-transparent rounded-xl text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent appearance-none">
                <option value="">Tipo de Propriedade</option>
                <option value="agricultura">Aptidão Agrícola</option>
                <option value="pecuaria">Aptidão Pecuária</option>
                <option value="dupla">Dupla Aptidão</option>
              </select>
            </div>
            <Link href="/imoveis">
              <Button size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-white rounded-xl hover-elevate w-full sm:w-auto shadow-lg shadow-primary/30">
                <Search className="w-5 h-5 mr-2" /> Buscar
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/50 text-center">
          <div>
            <div className="text-4xl font-display font-bold text-primary mb-2">+12k</div>
            <div className="text-muted-foreground font-medium">Hectares Negociados</div>
          </div>
          <div>
            <div className="text-4xl font-display font-bold text-primary mb-2">+500</div>
            <div className="text-muted-foreground font-medium">Fazendas Premium</div>
          </div>
          <div>
            <div className="text-4xl font-display font-bold text-primary mb-2">26</div>
            <div className="text-muted-foreground font-medium">Estados Cobertos</div>
          </div>
          <div>
            <div className="text-4xl font-display font-bold text-primary mb-2">100%</div>
            <div className="text-muted-foreground font-medium">Negociação Segura</div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-display font-bold text-foreground mb-4">Propriedades em Destaque</h2>
              <p className="text-lg text-muted-foreground">As melhores oportunidades do agronegócio selecionadas por nossos especialistas.</p>
            </div>
            <Link href="/imoveis">
              <Button variant="outline" className="rounded-full bg-white hover:bg-primary hover:text-white border-primary/20">
                Ver Todas <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured?.map(listing => (
              <Link key={listing.id} href={`/imoveis/${listing.slug}`}>
                <Card className="overflow-hidden border-border/50 shadow-sm premium-card-hover bg-white h-full flex flex-col group cursor-pointer">
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={listing.coverImageUrl || `${import.meta.env.BASE_URL}images/farm-placeholder.png`} 
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                    {listing.isPremium && (
                      <div className="absolute top-4 left-4 px-3 py-1 bg-accent text-accent-foreground text-xs font-bold rounded shadow-md uppercase tracking-wider">
                        Premium
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <div className="text-white font-bold text-xl">
                        {formatCurrency(listing.price)}
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">{listing.title}</h3>
                    <div className="flex items-center text-muted-foreground mb-4 text-sm gap-1">
                      <MapPin className="w-4 h-4 text-primary/70" />
                      {listing.city}, {listing.state}
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-sm font-medium">
                      <div className="flex items-center gap-1.5 text-foreground">
                        <Expand className="w-4 h-4 text-primary" />
                        {formatArea(listing.totalArea, listing.areaUnit)}
                      </div>
                      <div className="flex items-center gap-1.5 text-foreground capitalize">
                        <Tractor className="w-4 h-4 text-primary" />
                        {listing.propertyType}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sell CTA */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/pattern.png)`, backgroundSize: 'cover' }}></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Quer vender sua propriedade?</h2>
          <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Alcance milhares de investidores qualificados. Anuncie sua fazenda no portal mais exclusivo do agronegócio brasileiro.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/cadastrar">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 h-14 px-8 text-lg shadow-xl hover:-translate-y-1 transition-transform">
                Criar Anúncio Agora
              </Button>
            </Link>
            <Link href="/imoveis">
              <Button size="lg" variant="outline" className="border-white text-primary hover:bg-white h-14 px-8 text-lg">
                Conhecer a Plataforma
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
