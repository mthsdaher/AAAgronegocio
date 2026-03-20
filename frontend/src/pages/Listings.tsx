import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useGetListings, GetListingsParams } from "@workspace/api-client-react";
import { formatCurrency, formatArea } from "@/lib/utils";
import {
  LISTINGS_FILTER_SESSION_KEY,
  listingsParamsFromSearch,
} from "@/lib/listingsQuery";
import { MapPin, Expand, Tractor, Filter, SlidersHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Listings() {
  const [loc] = useLocation();
  const [params, setParams] = useState<GetListingsParams>(() => ({
    page: 1,
    limit: 12,
    sortBy: "featured",
  }));

  useEffect(() => {
    if (!loc.startsWith("/imoveis")) return;
    try {
      const stored = sessionStorage.getItem(LISTINGS_FILTER_SESSION_KEY);
      if (stored !== null) {
        sessionStorage.removeItem(LISTINGS_FILTER_SESSION_KEY);
        if (stored) {
          setParams(listingsParamsFromSearch(`?${stored}`));
          window.history.replaceState(null, "", `/imoveis?${stored}`);
        } else {
          setParams({ page: 1, limit: 12, sortBy: "featured" });
          window.history.replaceState(null, "", "/imoveis");
        }
        return;
      }
    } catch {
      /* ignore */
    }
    const q = window.location.search;
    if (q) setParams(listingsParamsFromSearch(q));
  }, [loc]);

  const { data, isLoading } = useGetListings(params);
  const listings =
    data && Array.isArray(data.listings) ? data.listings : [];

  return (
    <PublicLayout>
      <div className="bg-secondary/30 pt-8 pb-12 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full md:w-72 shrink-0">
              <div className="bg-white rounded-2xl p-6 border border-border shadow-sm sticky top-4">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
                  <Filter className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-semibold text-lg">Filtros</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block text-foreground">Busca</label>
                    <Input 
                      placeholder="Palavra-chave..." 
                      className="bg-secondary/50"
                      onChange={(e) => setParams(p => ({ ...p, search: e.target.value, page: 1 }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block text-foreground">Estado</label>
                    <select 
                      className="w-full h-10 px-3 rounded-md border border-input bg-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      onChange={(e) => setParams(p => ({ ...p, state: e.target.value, page: 1 }))}
                    >
                      <option value="">Todos os Estados</option>
                      <option value="MT">Mato Grosso</option>
                      <option value="GO">Goiás</option>
                      <option value="MS">Mato Grosso do Sul</option>
                      <option value="BA">Bahia</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="SP">São Paulo</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block text-foreground">Aptidão</label>
                    <select 
                      className="w-full h-10 px-3 rounded-md border border-input bg-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      onChange={(e) => setParams(p => ({ ...p, propertyType: e.target.value, page: 1 }))}
                    >
                      <option value="">Qualquer Aptidão</option>
                      <option value="agricultura">Agricultura</option>
                      <option value="pecuaria">Pecuária</option>
                      <option value="mista">Mista</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <Button 
                      variant="outline" 
                      className="w-full hover-elevate"
                      onClick={() => setParams({ page: 1, limit: 12, sortBy: "featured" })}
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-display font-bold text-foreground">
                  Fazendas à Venda <span className="text-muted-foreground text-lg font-normal ml-2">({data?.total || 0} resultados)</span>
                </h1>
                
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                  <select 
                    className="h-10 px-3 rounded-md border border-border bg-white text-sm font-medium"
                    value={params.sortBy}
                    onChange={(e) => setParams(p => ({ ...p, sortBy: e.target.value as any }))}
                  >
                    <option value="featured">Destaques</option>
                    <option value="newest">Mais Recentes</option>
                    <option value="price_asc">Menor Preço</option>
                    <option value="price_desc">Maior Preço</option>
                    <option value="area_desc">Maior Área</option>
                  </select>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1,2,3,4,5,6].map(i => (
                    <Card key={i} className="overflow-hidden border-border/50">
                      <Skeleton className="h-48 w-full" />
                      <CardContent className="p-4 space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-full mt-4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map((listing) => (
                      <Link key={listing.id} href={`/imoveis/${listing.slug}`}>
                        <Card className="overflow-hidden border-border/50 shadow-sm premium-card-hover bg-white h-full flex flex-col group cursor-pointer">
                          <div className="relative h-56 overflow-hidden">
                            <img 
                              src={listing.coverImageUrl || `${import.meta.env.BASE_URL}images/farm-placeholder.png`} 
                              alt={listing.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            {listing.isPremium && (
                              <div className="absolute top-3 left-3 px-2 py-1 bg-accent text-accent-foreground text-xs font-bold rounded shadow-md uppercase tracking-wider">
                                Premium
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
                              <div className="text-white font-bold text-xl">
                                {formatCurrency(listing.price)}
                              </div>
                            </div>
                          </div>
                          <CardContent className="p-5 flex flex-col flex-1">
                            <h3 className="text-base font-bold text-foreground mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors">{listing.title}</h3>
                            <div className="flex items-center text-muted-foreground mb-4 text-sm gap-1">
                              <MapPin className="w-3.5 h-3.5 text-primary/70" />
                              {listing.city}, {listing.state}
                            </div>
                            
                            <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-sm font-medium text-foreground/80">
                              <div className="flex items-center gap-1.5">
                                <Expand className="w-4 h-4 text-primary" />
                                {formatArea(listing.totalArea, listing.areaUnit)}
                              </div>
                              <div className="flex items-center gap-1.5 capitalize">
                                <Tractor className="w-4 h-4 text-primary" />
                                {listing.propertyType}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>

                  {data && data.totalPages > 1 && (
                    <div className="mt-12 flex justify-center gap-2">
                      <Button 
                        variant="outline" 
                        disabled={params.page === 1}
                        onClick={() => setParams(p => ({ ...p, page: (p.page || 1) - 1 }))}
                      >
                        Anterior
                      </Button>
                      <div className="flex items-center justify-center px-4 font-medium">
                        Página {params.page} de {data.totalPages}
                      </div>
                      <Button 
                        variant="outline"
                        disabled={params.page === data.totalPages}
                        onClick={() => setParams(p => ({ ...p, page: (p.page || 1) + 1 }))}
                      >
                        Próxima
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
