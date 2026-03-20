import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { MapPin, LogIn, UserCircle, Tractor } from "lucide-react";
import { useState, useEffect } from "react";
import { clsx } from "clsx";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  
  const isHome = location === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navClass = clsx(
    "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
    {
      "bg-white/95 backdrop-blur-md border-border shadow-sm": scrolled || !isHome,
      "bg-transparent border-transparent": !scrolled && isHome,
    }
  );

  const textClass = clsx({
    "text-foreground": scrolled || !isHome,
    "text-white": !scrolled && isHome,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <nav className={navClass}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <Tractor className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className={clsx("font-display font-bold text-2xl tracking-tight", textClass)}>
              AAAgronegócio
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/imoveis" className={clsx("font-medium hover:text-accent transition-colors", textClass)}>
              Comprar Fazenda
            </Link>
            <Link href="/imoveis/mapa" className={clsx("font-medium hover:text-accent transition-colors flex items-center gap-1", textClass)}>
              <MapPin className="w-4 h-4" /> Buscar no Mapa
            </Link>
            {user ? (
              <Link href={user.role === 'admin' ? '/admin/dashboard' : '/painel/dashboard'}>
                <Button className="font-semibold bg-accent text-accent-foreground hover:bg-accent/90">
                  <UserCircle className="w-4 h-4 mr-2" />
                  Meu Painel
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/entrar">
                  <Button variant="ghost" className={clsx("font-semibold hover:bg-white/10", textClass)}>
                    Entrar
                  </Button>
                </Link>
                <Link href="/cadastrar">
                  <Button className="font-semibold bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20">
                    Anunciar
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="bg-sidebar text-sidebar-foreground py-16 border-t border-sidebar-border relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/pattern.png)`, backgroundSize: 'cover' }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                <Tractor className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-2xl text-white">AAAgronegócio</span>
            </div>
            <p className="text-sidebar-foreground/70 max-w-md text-balance leading-relaxed">
              A plataforma definitiva para compra e venda de propriedades rurais de alto padrão no Brasil. 
              Conectando investidores e proprietários com tecnologia e segurança.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold text-lg text-white mb-4">Plataforma</h4>
            <ul className="space-y-3 text-sidebar-foreground/70">
              <li><Link href="/imoveis" className="hover:text-accent transition-colors">Buscar Fazendas</Link></li>
              <li><Link href="/imoveis/mapa" className="hover:text-accent transition-colors">Busca por Mapa</Link></li>
              <li><Link href="/cadastrar" className="hover:text-accent transition-colors">Vender Propriedade</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-lg text-white mb-4">Contato</h4>
            <ul className="space-y-3 text-sidebar-foreground/70">
              <li>contato@aaagronegocio.com.br</li>
              <li>+55 (11) 99999-9999</li>
              <li>São Paulo, SP - Brasil</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-sidebar-border text-center text-sidebar-foreground/50 text-sm">
          © {new Date().getFullYear()} AAAgronegócio. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
