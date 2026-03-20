import { useRoute } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useGetListingBySlug, useSubmitInterest } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatArea } from "@/lib/utils";
import { 
  MapPin, Expand, Tractor, Droplets, Home, CheckCircle2, 
  MessageCircle, Mail, Calendar, Phone
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function ListingDetail() {
  const [, params] = useRoute("/imoveis/:slug");
  const slug = params?.slug || "";
  const { data: listing, isLoading } = useGetListingBySlug(slug);
  const { toast } = useToast();
  
  const submitInterest = useSubmitInterest();
  const [interestOpen, setInterestOpen] = useState(false);
  const [interestType, setInterestType] = useState<"info" | "proposal" | "visit">("info");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 py-28"><Skeleton className="w-full h-96 rounded-2xl" /></div>
      </PublicLayout>
    );
  }

  if (!listing) return <PublicLayout><div className="py-32 text-center text-xl">Propriedade não encontrada.</div></PublicLayout>;

  const handleInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await submitInterest.mutateAsync({
        slug: listing.slug,
        data: { interestType, ...formData }
      });
      toast({ title: "Interesse enviado!", description: "O vendedor receberá sua mensagem em breve." });
      setInterestOpen(false);
      if (result.whatsappUrl) {
        window.open(result.whatsappUrl, '_blank');
      }
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao enviar interesse. Tente novamente.", variant: "destructive" });
    }
  };

  const images = listing.media?.length ? listing.media : [{ url: `${import.meta.env.BASE_URL}images/farm-placeholder.png` }];

  return (
    <PublicLayout>
      <div className="bg-secondary/20 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-3 text-sm font-medium text-primary">
              <span className="bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">{listing.propertyType}</span>
              {listing.isPremium && <span className="bg-accent px-3 py-1 rounded-full text-accent-foreground uppercase tracking-wider">Premium</span>}
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4 leading-tight">{listing.title}</h1>
            <div className="flex items-center text-muted-foreground gap-2 text-lg">
              <MapPin className="w-5 h-5 text-primary" />
              {listing.city}, {listing.state} - {listing.country}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <div className="rounded-2xl overflow-hidden shadow-lg border border-border/50">
                <div className="aspect-[16/9] bg-muted relative">
                  <img src={images[0].url} alt={listing.title} className="w-full h-full object-cover" />
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 p-2 bg-white">
                    {images.slice(1, 5).map((img, i) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80">
                        <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-border">
                <h3 className="text-2xl font-display font-bold mb-6">Descrição da Propriedade</h3>
                <div className="prose max-w-none text-muted-foreground text-balance whitespace-pre-wrap">
                  {listing.description || "Nenhuma descrição fornecida para esta propriedade."}
                </div>
              </div>

              {/* Features Grid */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-border">
                <h3 className="text-2xl font-display font-bold mb-6">Infraestrutura e Recursos</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                     <h4 className="font-semibold text-lg flex items-center gap-2 mb-4 border-b pb-2"><Droplets className="text-blue-500"/> Recursos Hídricos</h4>
                     <ul className="space-y-3">
                       {listing.hasRiver && <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="w-5 h-5 text-primary"/> Rio / Córrego</li>}
                       {listing.hasLake && <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="w-5 h-5 text-primary"/> Lago natural</li>}
                       {listing.hasAcude && <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="w-5 h-5 text-primary"/> Açude</li>}
                       {listing.hasWell && <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="w-5 h-5 text-primary"/> Poço artesiano</li>}
                       {!listing.hasRiver && !listing.hasLake && !listing.hasAcude && !listing.hasWell && <li className="text-muted-foreground italic">Não especificado</li>}
                     </ul>
                  </div>
                  <div>
                     <h4 className="font-semibold text-lg flex items-center gap-2 mb-4 border-b pb-2"><Home className="text-amber-700"/> Construções</h4>
                     <ul className="space-y-3">
                       {listing.infraMainHouse && <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="w-5 h-5 text-primary"/> Sede Principal</li>}
                       {listing.infraWorkerHouses && <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="w-5 h-5 text-primary"/> Casas de Funcionários</li>}
                       {listing.infraWarehouse && <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="w-5 h-5 text-primary"/> Galpão / Barracão</li>}
                       {listing.infraCorral && <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="w-5 h-5 text-primary"/> Curral completo</li>}
                     </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar CTA */}
            <div className="space-y-6 sticky top-28 h-fit">
              <Card className="border-border shadow-xl rounded-2xl overflow-hidden bg-white">
                <div className="bg-primary p-6 text-white text-center">
                  <div className="text-3xl font-bold font-display mb-1">{formatCurrency(listing.price)}</div>
                  <div className="text-primary-foreground/80 text-sm">{listing.negotiable ? "Valor negociável" : "Valor fixo"}</div>
                </div>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-secondary/50 p-4 rounded-xl text-center">
                      <Expand className="w-6 h-6 text-primary mx-auto mb-2" />
                      <div className="font-bold text-lg">{formatArea(listing.totalArea, listing.areaUnit)}</div>
                      <div className="text-xs text-muted-foreground">Área Total</div>
                    </div>
                    <div className="bg-secondary/50 p-4 rounded-xl text-center">
                      <Tractor className="w-6 h-6 text-primary mx-auto mb-2" />
                      <div className="font-bold text-lg">{listing.productiveArea ? formatArea(listing.productiveArea, listing.areaUnit) : '--'}</div>
                      <div className="text-xs text-muted-foreground">Área Útil</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      className="w-full h-14 text-lg hover-elevate bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => { setInterestType('info'); setInterestOpen(true); }}
                    >
                      <MessageCircle className="w-5 h-5 mr-2" /> Falar no WhatsApp
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full h-12 hover-elevate border-primary text-primary"
                      onClick={() => { setInterestType('proposal'); setInterestOpen(true); }}
                    >
                      <Mail className="w-4 h-4 mr-2" /> Enviar Proposta
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full h-12 hover-elevate"
                      onClick={() => { setInterestType('visit'); setInterestOpen(true); }}
                    >
                      <Calendar className="w-4 h-4 mr-2" /> Agendar Visita
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {listing.seller && (
                <Card className="border-border shadow-sm rounded-2xl bg-white">
                  <CardContent className="p-6">
                    <h4 className="font-bold mb-4 border-b pb-2">Informações do Anunciante</h4>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center font-bold text-xl text-primary">
                        {listing.seller.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold">{listing.seller.name}</div>
                        {listing.seller.isPremium && <div className="text-xs text-accent font-bold uppercase tracking-wider">Conta Premium</div>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={interestOpen} onOpenChange={setInterestOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">Fale com o Vendedor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInterest} className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nome Completo</label>
              <Input required value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="h-12 rounded-xl" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Telefone / WhatsApp</label>
              <Input required type="tel" value={formData.phone} onChange={e => setFormData(p => ({...p, phone: e.target.value}))} className="h-12 rounded-xl" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input type="email" value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} className="h-12 rounded-xl" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Mensagem</label>
              <textarea 
                required
                className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[100px]"
                value={formData.message} 
                onChange={e => setFormData(p => ({...p, message: e.target.value}))}
                placeholder="Olá, tenho interesse nesta propriedade..."
              />
            </div>
            <Button type="submit" className="w-full h-12 text-lg rounded-xl hover-elevate mt-2" disabled={submitInterest.isPending}>
              {submitInterest.isPending ? "Enviando..." : "Enviar Mensagem"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
