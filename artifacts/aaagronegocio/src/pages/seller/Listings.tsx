import { useState } from "react";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetSellerListings, useDeleteListing, useSubmitListingForReview } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatArea } from "@/lib/utils";
import { Plus, Edit2, Trash2, Send, BarChart2, Eye, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function SellerListings() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetSellerListings({ page, limit: 10 });
  const deleteMutation = useDeleteListing();
  const submitMutation = useSubmitListingForReview();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este anúncio permanentemente?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast({ title: "Excluído com sucesso" });
        queryClient.invalidateQueries({ queryKey: ["/api/seller/listings"] });
      } catch (e) {
        toast({ title: "Erro", variant: "destructive" });
      }
    }
  };

  const handleSubmit = async (id: string) => {
    try {
      await submitMutation.mutateAsync({ id });
      toast({ title: "Enviado para revisão!" });
      queryClient.invalidateQueries({ queryKey: ["/api/seller/listings"] });
    } catch (e) {
      toast({ title: "Erro ao enviar", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string, color: string }> = {
      draft: { label: "Rascunho", color: "bg-gray-100 text-gray-700 border-gray-200" },
      pending_review: { label: "Em Revisão", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
      published: { label: "Publicado", color: "bg-green-100 text-green-700 border-green-200" },
      rejected: { label: "Rejeitado", color: "bg-red-100 text-red-700 border-red-200" },
      archived: { label: "Arquivado", color: "bg-gray-800 text-white border-gray-900" },
    };
    const s = map[status] || map.draft;
    return <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${s.color}`}>{s.label}</span>;
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Meus Anúncios</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas propriedades e acompanhe o desempenho.</p>
        </div>
        <Link href="/painel/anuncios/novo">
          <Button className="h-12 px-6 rounded-xl hover-elevate shadow-md shadow-primary/20">
            <Plus className="w-5 h-5 mr-2" /> Novo Anúncio
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {data?.listings.map((listing: any) => (
          <Card key={listing.id} className="p-4 flex flex-col md:flex-row gap-6 border-border/50 hover:border-border transition-colors">
            <div className="w-full md:w-48 h-32 rounded-xl bg-muted overflow-hidden shrink-0">
              <img src={listing.coverImageUrl || `${import.meta.env.BASE_URL}images/farm-placeholder.png`} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-foreground line-clamp-1 pr-4">{listing.title}</h3>
                  {getStatusBadge(listing.status)}
                </div>
                <div className="text-primary font-bold text-xl mb-2">{formatCurrency(listing.price)}</div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {listing.city}, {listing.state}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {formatArea(listing.totalArea, listing.areaUnit)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border justify-end">
                <div className="flex items-center gap-4 mr-auto text-sm text-muted-foreground font-medium">
                  <span className="flex items-center gap-1"><Eye className="w-4 h-4"/> {listing.viewCount} Views</span>
                </div>

                {listing.status === 'draft' && (
                  <Button variant="outline" size="sm" onClick={() => handleSubmit(listing.id)} className="hover-elevate border-accent text-accent-foreground hover:bg-accent/10">
                    <Send className="w-4 h-4 mr-2" /> Publicar
                  </Button>
                )}
                <Link href={`/painel/anuncios/${listing.id}`}>
                  <Button variant="outline" size="sm" className="hover-elevate">
                    <Edit2 className="w-4 h-4 mr-2" /> Editar
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(listing.id)} className="hover-elevate text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {data?.listings.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-border">
            <Tractor className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Nenhum anúncio ainda</h3>
            <p className="text-muted-foreground mb-6">Comece anunciando sua primeira propriedade na plataforma.</p>
            <Link href="/painel/anuncios/novo">
              <Button>Criar meu primeiro anúncio</Button>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
