import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, Map, List, PlusCircle, Settings, Users, 
  BarChart, Sparkles, LogOut, Home
} from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  
  const menuItems = isAdmin ? [
    { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Anúncios (Moderação)", url: "/admin/anuncios", icon: List },
    { title: "Usuários", url: "/admin/usuarios", icon: Users },
    { title: "Analytics", url: "/admin/analytics", icon: BarChart },
  ] : [
    { title: "Dashboard", url: "/painel/dashboard", icon: LayoutDashboard },
    { title: "Meus Anúncios", url: "/painel/anuncios", icon: List },
    { title: "Novo Anúncio", url: "/painel/anuncios/novo", icon: PlusCircle },
    { title: "Ferramentas IA", url: "/painel/ia", icon: Sparkles },
  ];

  return (
    <SidebarProvider style={{ "--sidebar-width": "18rem" } as React.CSSProperties}>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
          <SidebarHeader className="p-6 border-b border-sidebar-border">
            <Link href="/" className="flex items-center">
              <img
                src={`${import.meta.env.BASE_URL}images/Marca.png`}
                alt="AAAgronegócio"
                className="h-9 w-auto max-w-[200px] object-contain object-left opacity-95"
              />
            </Link>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/50 mb-2 uppercase tracking-wider text-xs">
                {isAdmin ? 'Administração' : 'Painel do Vendedor'}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => {
                    const isActive = location === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild data-active={isActive} className="hover-elevate active-elevate-2 py-6 px-4 rounded-xl transition-all data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:font-medium">
                          <Link href={item.url} className="flex items-center gap-3">
                            <item.icon className="w-5 h-5" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
               <SidebarGroupLabel className="text-sidebar-foreground/50 mb-2 uppercase tracking-wider text-xs">Acesso Público</SidebarGroupLabel>
               <SidebarMenu>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild className="hover-elevate py-5">
                      <Link href="/" className="flex items-center gap-3"><Home className="w-4 h-4"/> Ver Site Público</Link>
                    </SidebarMenuButton>
                 </SidebarMenuItem>
               </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-6 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center font-bold text-white uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-sm text-white">{user.name}</span>
                <span className="text-xs text-sidebar-foreground/60">{user.role}</span>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent" onClick={() => logout()}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Subtle background texture for the main content area */}
          <div className="absolute inset-0 bg-secondary/30 pointer-events-none -z-10" />
          
          <header className="h-20 bg-card border-b border-border flex items-center px-8 justify-between shrink-0">
             <h2 className="font-display font-semibold text-xl text-foreground capitalize tracking-tight">
               {menuItems.find(i => i.url === location)?.title || "Painel"}
             </h2>
             <div className="flex items-center gap-4">
               {user.isPremium && (
                 <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-accent to-yellow-600 text-white rounded-full shadow-sm">
                   Conta Premium
                 </span>
               )}
             </div>
          </header>
          
          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-6xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
