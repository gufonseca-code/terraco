import Image from "next/image";
import Link from "next/link";
import { buildWhatsAppUrl, type Lancamento } from "@/data/lancamentos";
import { SITE_NAME, SITE_URL } from "@/lib/site";

interface PrimeViewLandingProps {
  item: Lancamento;
}

function buildJsonLd(item: Lancamento) {
  const pageUrl = `${SITE_URL}/lancamentos/${item.slug}`;
  const imageUrl = `${SITE_URL}${item.imagem}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Início",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Lançamentos",
            item: `${SITE_URL}/lancamentos`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: item.nome,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "RealEstateListing",
        name: `${item.nome} — ${item.bairro}, ${item.cidade}`,
        description: item.resumo,
        url: pageUrl,
        image: imageUrl,
        mainEntity: {
          "@type": "ApartmentComplex",
          name: item.nome,
          description: `${item.quartos}, ${item.metragem} (${item.tipologias}), ${item.vagas}. ${item.resumo}`,
          url: pageUrl,
          image: imageUrl,
          address: {
            "@type": "PostalAddress",
            streetAddress: item.endereco,
            addressLocality: item.cidade,
            addressRegion: item.uf,
            addressCountry: "BR",
          },
          amenityFeature: item.diferenciais.map((diferencial) => ({
            "@type": "LocationFeatureSpecification",
            name: diferencial,
            value: true,
          })),
        },
        provider: {
          "@type": "RealEstateAgent",
          name: SITE_NAME,
          url: SITE_URL,
        },
      },
    ],
  };
}

export function PrimeViewLanding({ item }: PrimeViewLandingProps) {
  const whatsappHref = buildWhatsAppUrl(item.whatsappMensagem);
  const jsonLd = buildJsonLd(item);

  return (
    <section
      aria-labelledby="launch-heading"
      className="flex flex-1 flex-col justify-center bg-canvas py-10 sm:py-14"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="mx-auto w-full max-w-5xl px-6 lg:px-8">
        <div className="terraco-reveal mb-5">
          <Link
            href="/lancamentos"
            className="terraco-link-underline inline-flex min-h-[44px] items-center text-sm font-medium text-ink-muted transition-colors duration-150 hover:text-ink"
          >
            Voltar para lançamentos
          </Link>
        </div>

        <article className="terraco-reveal terraco-reveal-delay terraco-floating-card overflow-hidden rounded-lg bg-elevated">
          <div className="grid lg:grid-cols-12">
            <div className="relative aspect-[5/3] w-full overflow-hidden border-b border-border-subtle bg-surface lg:col-span-7 lg:aspect-auto lg:min-h-[480px] lg:border-b-0 lg:border-r lg:border-border-subtle">
              <Image
                data-testid="launch-hero-image"
                src={item.imagem}
                alt={item.imagemAlt}
                width={item.imagemWidth}
                height={item.imagemHeight}
                preload
                sizes="(min-width: 1024px) 600px, 94vw"
                className="h-full w-full object-cover object-center"
              />
            </div>

            <div className="flex flex-col justify-between gap-8 p-6 sm:p-8 lg:col-span-5 lg:p-10">
              <div className="space-y-3">
                <div aria-hidden="true" className="h-[3px] w-10 bg-accent" />

                <p className="text-sm font-medium text-ink-muted">
                  {item.bairro}, {item.cidade}, {item.uf}
                </p>

                <h1
                  id="launch-heading"
                  className="font-display text-[clamp(1.875rem,3.2vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.02em] text-ink text-balance"
                >
                  {item.nome}
                </h1>
              </div>

              <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-y border-border-subtle py-5">
                <div className="space-y-1">
                  <dt className="text-xs font-medium text-ink-muted">
                    Dormitórios
                  </dt>
                  <dd className="text-sm font-semibold leading-[1.35] text-ink tabular-nums">
                    {item.quartos}
                  </dd>
                </div>

                <div className="space-y-1">
                  <dt className="text-xs font-medium text-ink-muted">
                    Metragem
                  </dt>
                  <dd className="text-sm font-semibold leading-[1.35] text-ink tabular-nums">
                    {item.metragem}
                  </dd>
                </div>

                <div className="space-y-1">
                  <dt className="text-xs font-medium text-ink-muted">
                    Vagas
                  </dt>
                  <dd className="text-sm font-semibold leading-[1.35] text-ink tabular-nums">
                    {item.vagas}
                  </dd>
                </div>

                <div className="space-y-1">
                  <dt className="text-xs font-medium text-ink-muted">
                    Lazer
                  </dt>
                  <dd className="text-sm font-semibold leading-[1.35] text-ink">
                    Completo com vista panorâmica
                  </dd>
                </div>
              </dl>

              <div className="space-y-3.5">
                <p className="text-sm leading-[1.55] text-ink-muted">
                  Plantas, valores e condições direto no WhatsApp.
                </p>

                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="terraco-btn terraco-btn-moss flex min-h-[52px] w-full items-center justify-center rounded-pill bg-brand px-6 py-3.5 text-base font-semibold leading-[1.35] text-ink-inverse hover:bg-brand-hover"
                >
                  Falar no WhatsApp
                </a>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
