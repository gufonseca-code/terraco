import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BedDouble,
  Car,
  Check,
  MapPin,
  Maximize2,
  MessageCircle,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  LANCAMENTOS,
  buildWhatsAppUrl,
  formatCurrencyBRL,
  getLancamentoBySlug,
} from "@/data/lancamentos";

export function generateStaticParams() {
  return LANCAMENTOS.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps<"/lancamentos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = getLancamentoBySlug(slug);

  if (!item) {
    return {
      title: "Lançamento não encontrado",
    };
  }

  return {
    title: `${item.nome} — ${item.bairro}, ${item.cidade}`,
    description: `${item.resumo} A partir de ${formatCurrencyBRL(item.precoAPartirDe)}.`,
    openGraph: {
      title: `${item.nome} — ${item.bairro} | Terraço`,
      description: item.resumo,
      images: [
        {
          url: item.imagem,
          alt: item.imagemAlt,
        },
      ],
    },
  };
}

export default async function LancamentoDetalhePage({
  params,
}: PageProps<"/lancamentos/[slug]">) {
  const { slug } = await params;
  const item = getLancamentoBySlug(slug);

  if (!item) {
    notFound();
  }

  const whatsappHref = buildWhatsAppUrl(
    `Oi! Gostaria de receber a tabela e agendar uma visita no ${item.nome} (${item.bairro}).`
  );

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <Navbar />

      <main
        id="conteudo-principal"
        tabIndex={-1}
        className="flex-1 mx-auto w-full max-w-6xl px-6 pt-32 pb-12 md:pt-36 md:pb-16"
      >
        <Link
          href="/lancamentos"
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-ink-muted transition-colors hover:text-ink mb-6"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Voltar para lançamentos</span>
        </Link>

        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          {/* Coluna principal */}
          <div className="lg:col-span-7 space-y-8">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-border-subtle bg-surface shadow-card">
              <Image
                src={item.imagem}
                alt={item.imagemAlt}
                width={item.imagemWidth}
                height={item.imagemHeight}
                priority
                fetchPriority="high"
                sizes="(min-width: 1024px) 660px, 94vw"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-block rounded-pill bg-highlight px-3.5 py-1 text-xs font-bold text-ink">
                  {item.badge}
                </span>
                <span className="inline-block rounded-pill bg-surface px-3.5 py-1 text-xs font-semibold text-ink">
                  {item.entrega}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted">
                  <MapPin
                    className="h-4 w-4 text-brand"
                    aria-hidden="true"
                  />
                  {item.bairro}, {item.cidade} - {item.uf}
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-[1.08] text-balance">
                {item.nome}
              </h1>

              <p className="text-base sm:text-lg text-ink-muted leading-relaxed">
                {item.resumo}
              </p>
            </div>

            {/* Diferenciais */}
            <section
              aria-labelledby="diferenciais-heading"
              className="rounded-lg border border-border-subtle bg-elevated p-6 sm:p-8 shadow-card space-y-5"
            >
              <h2
                id="diferenciais-heading"
                className="font-display text-2xl font-bold text-ink"
              >
                O que o projeto oferece
              </h2>
              <ul className="space-y-3.5">
                {item.diferenciais.map((diferencial) => (
                  <li
                    key={diferencial}
                    className="flex items-start gap-3 text-sm sm:text-base text-ink-muted leading-relaxed"
                  >
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-pill bg-success-bg text-success-fg">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span>{diferencial}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Card lateral de resumo e contato */}
          <aside className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="rounded-lg border border-border-subtle bg-elevated p-6 sm:p-8 shadow-card space-y-6">
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
                  Valores a partir de
                </span>
                <p className="font-display text-3xl sm:text-4xl font-bold text-ink tabular-nums">
                  {formatCurrencyBRL(item.precoAPartirDe)}
                </p>
              </div>

              <dl className="grid grid-cols-3 gap-3 border-y border-border-subtle py-5">
                <div>
                  <dt className="flex items-center gap-1 text-xs font-medium text-ink-muted mb-1">
                    <BedDouble
                      className="h-3.5 w-3.5 text-brand"
                      aria-hidden="true"
                    />
                    <span>Dormitórios</span>
                  </dt>
                  <dd className="text-sm font-semibold text-ink">
                    {item.quartos}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-xs font-medium text-ink-muted mb-1">
                    <Maximize2
                      className="h-3.5 w-3.5 text-brand"
                      aria-hidden="true"
                    />
                    <span>Área</span>
                  </dt>
                  <dd className="text-sm font-semibold text-ink tabular-nums">
                    {item.metragem}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-xs font-medium text-ink-muted mb-1">
                    <Car
                      className="h-3.5 w-3.5 text-brand"
                      aria-hidden="true"
                    />
                    <span>Garagem</span>
                  </dt>
                  <dd className="text-sm font-semibold text-ink">
                    {item.vagas}
                  </dd>
                </div>
              </dl>

              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-sm bg-surface px-3 py-1.5 text-xs font-semibold text-ink-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="space-y-3 pt-2">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="terraco-btn flex w-full min-h-[48px] items-center justify-center gap-2 rounded-pill bg-brand px-6 py-3 text-sm sm:text-base font-semibold text-ink-inverse hover:bg-brand-hover"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  <span>Agendar visita no WhatsApp</span>
                </a>
                <p className="text-center text-xs text-ink-muted">
                  Receba plantas em PDF e tabela atualizada direto na conversa.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
