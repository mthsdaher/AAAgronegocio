import { Link, useLocation, useSearch } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { UserCircle, Menu } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const HREF_IMOVEIS_COMPRAR = "/imoveis?finalidade=compra";
const HREF_IMOVEIS_ARRENDAR = "/imoveis?finalidade=arrendamento";

/** Amarelo um pouco mais escuro, borda preta — fundo estável no hover */
const anunciarNavButtonClass =
  "font-semibold border-2 border-black bg-[#e6bd4a] text-[hsl(142_50%_10%)] shadow-sm hover:bg-[#e6bd4a] hover:text-[hsl(142_50%_10%)] active:bg-[#e6bd4a]";

function parseFinalidade(search: string): string | null {
  const q = search.startsWith("?") ? search.slice(1) : search;
  return new URLSearchParams(q).get("finalidade");
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [location] = useLocation();
  const search = useSearch();
  const finalidade = parseFinalidade(search);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navClass =
    "relative z-40 w-full border-b border-border/60 bg-background";

  const linkClass = (active?: boolean) =>
    clsx(
      "font-medium transition-colors text-sm lg:text-base whitespace-nowrap text-foreground hover:text-primary",
      active && "font-semibold text-primary"
    );

  const navLogoSrc = `${import.meta.env.BASE_URL}images/${encodeURIComponent("Marca(1).png")}`;

  const isComprarActive =
    location === "/imoveis" && finalidade !== "arrendamento";
  const isArrendarActive =
    location === "/imoveis" && finalidade === "arrendamento";

  const NavTextLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <Link href="/" className={linkClass(location === "/")} onClick={onNavigate}>
        Home
      </Link>
      <Link
        href={HREF_IMOVEIS_COMPRAR}
        className={linkClass(isComprarActive)}
        onClick={onNavigate}
      >
        Comprar Imóvel
      </Link>
      <Link
        href={HREF_IMOVEIS_ARRENDAR}
        className={linkClass(isArrendarActive)}
        onClick={onNavigate}
      >
        Arrendar Imóvel
      </Link>
      <Link
        href="/quem-somos"
        className={linkClass(location === "/quem-somos")}
        onClick={onNavigate}
      >
        Quem Somos
      </Link>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <nav className={navClass}>
        <div
          className={clsx(
            "mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8",
            "lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-6"
          )}
        >
          <Link href="/" className="group flex min-w-0 shrink-0 items-center justify-self-start">
            <img
              src={navLogoSrc}
              alt="AAAgronegócio"
              className="h-12 w-auto max-w-[min(100vw-10rem,380px)] object-contain object-left transition-transform group-hover:scale-[1.02] sm:h-14 md:h-16"
            />
          </Link>

          <div className="hidden min-w-0 w-full justify-self-stretch lg:flex lg:items-center lg:justify-center">
            <nav
              className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 xl:gap-x-8"
              aria-label="Principal"
            >
              <NavTextLinks />
            </nav>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2 justify-self-end sm:gap-3">
            <div className="hidden items-center gap-2 sm:gap-3 lg:flex">
              {user ? (
                <>
                  <Link href={user.role === "admin" ? "/admin/dashboard" : "/painel/dashboard"}>
                    <Button className="font-semibold bg-accent text-accent-foreground hover:bg-accent/90">
                      <UserCircle className="mr-2 h-4 w-4" />
                      Meu Painel
                    </Button>
                  </Link>
                  <Link href="/painel/anuncios/novo">
                    <Button variant="outline" className={anunciarNavButtonClass}>
                      Anunciar
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/entrar">
                    <Button className="font-semibold bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90">
                      Entrar
                    </Button>
                  </Link>
                  <Link href="/cadastrar">
                    <Button variant="outline" className={anunciarNavButtonClass}>
                      Anunciar
                    </Button>
                  </Link>
                </>
              )}
            </div>
            {!user && (
              <Link href="/entrar" className="lg:hidden">
                <Button
                  size="sm"
                  className="font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Entrar
                </Button>
              </Link>
            )}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-foreground"
                  aria-label="Abrir menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(100vw-2rem,320px)]">
                <SheetHeader>
                  <SheetTitle className="text-left font-display">Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-4">
                  <NavTextLinks onNavigate={() => setMobileOpen(false)} />
                  <div className="pt-4 border-t border-border flex flex-col gap-3">
                    {user ? (
                      <>
                        <Link
                          href={
                            user.role === "admin" ? "/admin/dashboard" : "/painel/dashboard"
                          }
                          onClick={() => setMobileOpen(false)}
                        >
                          <Button className="w-full font-semibold bg-accent text-accent-foreground">
                            <UserCircle className="w-4 h-4 mr-2" />
                            Meu Painel
                          </Button>
                        </Link>
                        <Link href="/painel/anuncios/novo" onClick={() => setMobileOpen(false)}>
                          <Button
                            variant="outline"
                            className={clsx(anunciarNavButtonClass, "w-full")}
                          >
                            Anunciar
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href="/entrar" onClick={() => setMobileOpen(false)}>
                          <Button className="w-full font-semibold bg-primary text-primary-foreground">
                            Entrar
                          </Button>
                        </Link>
                        <Link href="/cadastrar" onClick={() => setMobileOpen(false)}>
                          <Button
                            variant="outline"
                            className={clsx(anunciarNavButtonClass, "w-full")}
                          >
                            Anunciar
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col">{children}</main>

      <footer className="relative overflow-hidden bg-sidebar text-sidebar-foreground">
        <div className="h-4 w-full bg-accent sm:h-5" aria-hidden />
        <div className="relative py-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url(${import.meta.env.BASE_URL}images/pattern.png)`,
              backgroundSize: "cover",
            }}
          />
          <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
            <div className="col-span-1 md:col-span-2">
            <div className="mb-6 flex items-center">
              <img
                src={`${import.meta.env.BASE_URL}images/${encodeURIComponent("Marca(1).png")}`}
                alt="AAAgronegócio"
                className="h-20 w-auto max-w-[min(100%,420px)] object-contain object-left opacity-95 sm:h-24 md:h-28"
              />
            </div>
            <p className="text-sidebar-foreground/70 max-w-md text-balance leading-relaxed">
              A plataforma definitiva para compra e venda de propriedades rurais de alto padrão no
              Brasil. Conectando investidores e proprietários com tecnologia e segurança.
            </p>
            </div>
            <div>
            <h4 className="font-display font-semibold text-lg text-white mb-4">Plataforma</h4>
            <ul className="space-y-3 text-sidebar-foreground/70">
              <li>
                <Link href={HREF_IMOVEIS_COMPRAR} className="hover:text-accent transition-colors">
                  Comprar imóvel
                </Link>
              </li>
              <li>
                <Link
                  href={HREF_IMOVEIS_ARRENDAR}
                  className="hover:text-accent transition-colors"
                >
                  Arrendar imóvel
                </Link>
              </li>
              <li>
                <Link href="/quem-somos" className="hover:text-accent transition-colors">
                  Quem somos
                </Link>
              </li>
              <li>
                <Link href="/cadastrar" className="hover:text-accent transition-colors">
                  Anunciar
                </Link>
              </li>
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
          <div className="mx-auto mt-12 max-w-7xl border-t border-sidebar-border px-4 pt-8 text-center text-sm text-sidebar-foreground/50 sm:px-6 lg:px-8">
            © {new Date().getFullYear()} AAAgronegócio. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
