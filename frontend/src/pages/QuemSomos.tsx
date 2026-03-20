import { PublicLayout } from "@/components/layout/PublicLayout";

export default function QuemSomos() {
  return (
    <PublicLayout>
      <div className="bg-secondary/30 pt-8 pb-20 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-display font-bold text-foreground mb-6">
            Quem somos
          </h1>
          <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-4">
            <p>
              A <strong className="text-foreground">AAAgronegócio</strong> conecta quem busca
              propriedades rurais de qualidade com quem deseja negociar com credibilidade no{" "}
              <strong className="text-foreground">Mato Grosso do Sul</strong> e região.
            </p>
            <p>
              Nossa plataforma reúne anúncios de fazendas, sítios, chácaras e demais imóveis do
              agronegócio, com foco em transparência e apoio à decisão de compra ou arrendamento.
            </p>
            <p>
              Em breve traremos mais informações institucionais, equipe e canais de contato
              dedicados.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
