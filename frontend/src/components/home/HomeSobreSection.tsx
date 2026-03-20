import { useState } from "react";

const goldClass = "text-[hsl(43_74%_58%)]";

function AlaricoPortrait({ base }: { base: string }) {
  const [useFallback, setUseFallback] = useState(false);
  const primary = `${base}images/alarico-medieros.jpg`;

  if (useFallback) {
    return (
      <div className="mx-auto flex aspect-[3/4] w-full max-w-[220px] shrink-0 items-center justify-center rounded-lg border-2 border-primary/15 bg-muted/90 px-4 text-center md:mx-0">
        <span className="font-display text-sm font-semibold text-muted-foreground">
          Alarico Medeiros Jr
        </span>
      </div>
    );
  }

  return (
    <img
      src={primary}
      alt="Alarico Medeiros Jr"
      className="mx-auto h-auto w-full max-w-[220px] shrink-0 rounded-lg border-2 border-white object-cover object-top shadow-md md:mx-0 md:max-w-[240px] md:-my-2 md:self-stretch md:min-h-[min(100%,320px)] md:max-h-[380px]"
      onError={() => setUseFallback(true)}
    />
  );
}

export function HomeSobreSection() {
  const base = import.meta.env.BASE_URL;
  const bgSrc = `${base}images/paisagem4.JPG`;
  const medalSrc = `${base}images/${encodeURIComponent("40 anos experiencia.webp")}`;

  return (
    <section className="relative overflow-hidden py-14 sm:py-20 lg:py-24">
      <div className="absolute inset-0">
        <img src={bgSrc} alt="" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-[hsl(142_76%_11%)]/82" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/15" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-stretch gap-12 lg:flex-row lg:items-center lg:gap-14 xl:gap-16">
          {/* Esquerda: medalha + frase */}
          <div className="flex shrink-0 flex-col items-center text-center lg:w-[min(100%,260px)] lg:items-start lg:text-left">
            <img
              src={medalSrc}
              alt="40 anos de experiência"
              className="h-auto w-44 max-w-full object-contain drop-shadow-[0_12px_32px_rgba(0,0,0,0.35)] sm:w-52"
            />
            <p className="mt-8 max-w-xs font-display text-lg font-semibold leading-snug text-white drop-shadow-md sm:text-xl">
              Traga sua propriedade{" "}
              <span className="font-medium text-white/95">para ser negociada </span>
              <span className={goldClass}>com quem possui credibilidade</span>
              <span className="font-medium text-white/95"> e história com </span>
              <span className={goldClass}>Mato Grosso do Sul</span>
              <span className="text-white">.</span>
            </p>
          </div>

          {/* Card branco: foto + biografia */}
          <div className="min-w-0 flex-1 rounded-2xl border border-white/25 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] sm:p-8 lg:p-10">
            <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-10">
              <AlaricoPortrait base={base} />
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-2xl font-bold tracking-tight text-[hsl(142_50%_14%)] sm:text-3xl">
                  Alarico Medeiros Jr
                </h2>
                <div className="mt-5 space-y-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                  <p>
                    Com mais de <strong className="text-foreground">40 anos de atuação</strong> nas
                    áreas de direito imobiliário e elaboração de contratos, Alarico Medeiros Jr
                    construiu trajetória sólida ao lado do escritório do pai,{" "}
                    <strong className="text-foreground">Alarico Medeiros Sobrinho</strong>, em{" "}
                    <strong className="text-foreground">Anastácio (MS)</strong>, referência em
                    negócios rurais na região.
                  </p>
                  <p>
                    Essa vivência motivou a criação da{" "}
                    <strong className="text-primary">AAAgronegócio</strong>, plataforma dedicada à
                    mediação na compra e venda de fazendas e propriedades rurais, reunindo{" "}
                    <strong className="text-foreground">credibilidade, conhecimento técnico</strong>{" "}
                    e proximidade com o mercado do <strong className="text-foreground">Mato Grosso do Sul</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
