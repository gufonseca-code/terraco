import Image from "next/image";
import Link from "next/link";
import { LANCAMENTOS } from "@/data/lancamentos";
import { FavoriteButton } from "./FavoriteButton";

export function LaunchExplorer() {
  const launch = LANCAMENTOS[0];

  if (!launch) {
    return null;
  }

  return (
    <section
      aria-labelledby="lancamentos-heading"
      className="mx-auto w-full max-w-5xl px-6 py-10 sm:py-14 lg:px-8"
    >
      <h1
        id="lancamentos-heading"
        className="terraco-reveal font-display text-[clamp(1.875rem,3.2vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.02em] text-ink text-balance"
      >
        Lançamentos
      </h1>

      <article
        id="resultados-lancamentos"
        className="terraco-reveal terraco-reveal-delay terraco-plate mt-6 max-w-xl overflow-hidden rounded-lg bg-elevated sm:mt-8 scroll-mt-24"
      >
        <div className="relative aspect-[16/10] overflow-hidden border-b border-border-subtle bg-surface">
          <Link
            href={`/lancamentos/${launch.slug}`}
            prefetch={true}
            className="block h-full w-full"
            aria-label={`Conhecer ${launch.nome}`}
          >
            <Image
              data-testid="lancamentos-cover-image"
              src={launch.imagem}
              alt={launch.imagemAlt}
              width={launch.imagemWidth}
              height={launch.imagemHeight}
              preload
              sizes="(min-width: 640px) 576px, 100vw"
              className="h-full w-full object-cover object-center"
            />
          </Link>

          <div className="absolute top-3.5 right-3.5 z-10 sm:top-4 sm:right-4">
            <FavoriteButton slug={launch.slug} nome={launch.nome} />
          </div>
        </div>

        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-5">
          <div className="space-y-1">
            <p className="text-xs font-medium text-ink-muted">
              {launch.bairro}, {launch.cidade}
            </p>
            <h2 className="font-display text-2xl font-bold leading-[1.15] tracking-[-0.02em] text-ink sm:text-[1.75rem]">
              <Link
                href={`/lancamentos/${launch.slug}`}
                prefetch={true}
                className="transition-colors duration-150 hover:text-brand"
              >
                {launch.nome}
              </Link>
            </h2>
          </div>

          <Link
            href={`/lancamentos/${launch.slug}`}
            prefetch={true}
            className="terraco-btn terraco-btn-moss inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-pill bg-brand px-5 py-2.5 text-sm font-semibold leading-[1.35] text-ink-inverse hover:bg-brand-hover"
          >
            Conhecer lançamento
          </Link>
        </div>

        <dl className="grid grid-cols-1 divide-y divide-border-subtle border-t border-border-subtle bg-surface/45 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="space-y-0.5 px-5 py-3.5 sm:px-6">
            <dt className="text-xs font-medium text-ink-muted">Dormitórios</dt>
            <dd className="text-sm font-semibold leading-[1.35] text-ink tabular-nums">
              {launch.quartos}
            </dd>
          </div>
          <div className="space-y-0.5 px-5 py-3.5 sm:px-6">
            <dt className="text-xs font-medium text-ink-muted">Metragem</dt>
            <dd className="text-sm font-semibold leading-[1.35] text-ink tabular-nums">
              {launch.metragem}
            </dd>
          </div>
          <div className="space-y-0.5 px-5 py-3.5 sm:px-6">
            <dt className="text-xs font-medium text-ink-muted">Lazer</dt>
            <dd className="text-sm font-semibold leading-[1.35] text-ink">
              Lazer completo
            </dd>
          </div>
        </dl>
      </article>
    </section>
  );
}
