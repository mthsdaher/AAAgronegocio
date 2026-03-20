import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetSellerDashboard } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart as BarChartIcon, Eye, Heart, MapPin, TrendingUp, List } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrency } from "@/lib/utils";

export default function SellerDashboard() {
  const { data, isLoading } = useGetSellerDashboard();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <Skeleton className="h-96 w-full rounded-2xl mb-8" />
      </DashboardLayout>
    );
  }

  if (!data) return null;

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Total de Anúncios" value={data.totalListings} subtitle={`${data.publishedListings} publicados`} icon={List} />
        <MetricCard title="Visualizações" value={data.totalViews} subtitle="Últimos 30 dias" icon={Eye} trend="+12%" />
        <MetricCard title="Favoritados" value={data.totalFavorites} subtitle="Interesse passivo" icon={Heart} />
        <MetricCard title="Contatos Diretos" value={data.totalInterests} subtitle="WhatsApp e Email" icon={TrendingUp} trend="+5%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-border/50 shadow-sm h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChartIcon className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">Visualizações (Últimos 30 dias)</h3>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.viewsByDay} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                    <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                      itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="rounded-2xl border-border/50 shadow-sm h-full flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-bold mb-6">Anúncios Recentes</h3>
              <div className="space-y-4 flex-1">
                {data.recentListings.length === 0 ? (
                  <div className="text-center text-muted-foreground py-10 flex-1 flex items-center justify-center flex-col">
                    <MapPin className="w-10 h-10 mb-2 opacity-20" />
                    Nenhum anúncio ainda.
                  </div>
                ) : (
                  data.recentListings.map(listing => (
                    <div key={listing.id} className="flex gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors border border-transparent hover:border-border">
                      <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                        {listing.coverImageUrl ? (
                          <img src={listing.coverImageUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <MapPin className="w-full h-full p-4 text-muted-foreground/30" />
                        )}
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="font-semibold text-sm line-clamp-1">{listing.title}</div>
                        <div className="text-primary font-bold text-sm">{formatCurrency(listing.price)}</div>
                        <div className="text-xs text-muted-foreground flex gap-3 mt-1">
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3"/> {listing.viewCount}</span>
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3"/> {listing.favoriteCount}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function MetricCard({ title, value, subtitle, icon: Icon, trend }: any) {
  return (
    <Card className="rounded-2xl border-border/50 shadow-sm hover-elevate">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h4 className="text-3xl font-display font-bold text-foreground">{value}</h4>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          {trend && <span className="text-green-600 font-bold mr-2">{trend}</span>}
          <span className="text-muted-foreground">{subtitle}</span>
        </div>
      </CardContent>
    </Card>
  );
}
