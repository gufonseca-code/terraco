import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  SITE_NAME,
  SITE_URL,
  buildWhatsAppUrl,
  type Lancamento,
} from '../../core';

function buildJsonLd(item: Lancamento): Record<string, unknown> {
  const pageUrl = `${SITE_URL}/lancamentos/${item.slug}`;
  const imageUrl = `${SITE_URL}${item.imagem}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Início',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Lançamentos',
            item: `${SITE_URL}/lancamentos`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: item.nome,
            item: pageUrl,
          },
        ],
      },
      {
        '@type': 'RealEstateListing',
        name: `${item.nome} — ${item.bairro}, ${item.cidade}`,
        description: item.resumo,
        url: pageUrl,
        image: imageUrl,
        mainEntity: {
          '@type': 'ApartmentComplex',
          name: item.nome,
          description: `${item.quartos}, ${item.metragem} (${item.tipologias}), ${item.vagas}. ${item.resumo}`,
          url: pageUrl,
          image: imageUrl,
          address: {
            '@type': 'PostalAddress',
            streetAddress: item.endereco,
            addressLocality: item.cidade,
            addressRegion: item.uf,
            addressCountry: 'BR',
          },
          amenityFeature: item.diferenciais.map((diferencial) => ({
            '@type': 'LocationFeatureSpecification',
            name: diferencial,
            value: true,
          })),
        },
        provider: {
          '@type': 'RealEstateAgent',
          name: SITE_NAME,
          url: SITE_URL,
        },
      },
    ],
  };
}

@Component({
  selector: 'app-prime-view-landing',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      aria-labelledby="launch-heading"
      class="flex flex-1 flex-col justify-start bg-canvas py-3 sm:justify-center sm:py-6 lg:py-8"
    >
      <div class="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div class="terraco-reveal mb-2 sm:mb-4">
          <a
            routerLink="/lancamentos"
            class="terraco-link-underline inline-flex min-h-[40px] items-center text-sm font-medium text-ink-muted transition-colors duration-150 hover:text-ink sm:min-h-[44px]"
          >
            Voltar para lançamentos
          </a>
        </div>

        <article
          class="terraco-reveal terraco-reveal-delay terraco-floating-card overflow-hidden rounded-lg bg-elevated"
        >
          <div class="grid lg:grid-cols-12">
            <div
              class="relative aspect-[2/1] w-full overflow-hidden border-b border-border-subtle bg-surface sm:aspect-[5/3] lg:col-span-7 lg:aspect-auto lg:min-h-[460px] lg:border-b-0 lg:border-r lg:border-border-subtle"
            >
              <img
                data-testid="launch-hero-image"
                [src]="item().imagem"
                [alt]="item().imagemAlt"
                [width]="item().imagemWidth"
                [height]="item().imagemHeight"
                fetchpriority="high"
                decoding="async"
                class="h-full w-full object-cover object-center"
              />
            </div>

            <div
              class="flex flex-col justify-between gap-4 p-4 sm:gap-6 sm:p-6 lg:col-span-5 lg:gap-8 lg:p-8"
            >
              <div class="space-y-1.5 sm:space-y-2.5">
                <div aria-hidden="true" class="h-[3px] w-10 bg-accent"></div>

                <p class="text-sm font-medium text-ink-muted">
                  {{ item().bairro }}, {{ item().cidade }}, {{ item().uf }}
                </p>

                <h1
                  id="launch-heading"
                  class="font-display text-[clamp(1.625rem,3.2vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.02em] text-ink text-balance"
                >
                  {{ item().nome }}
                </h1>
              </div>

              <dl
                class="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-border-subtle py-3 sm:gap-x-6 sm:gap-y-4 sm:py-4"
              >
                <div class="space-y-1">
                  <dt class="text-xs font-medium text-ink-muted">
                    Dormitórios
                  </dt>
                  <dd
                    class="text-sm font-semibold leading-[1.35] text-ink tabular-nums"
                  >
                    {{ item().quartos }}
                  </dd>
                </div>

                <div class="space-y-1">
                  <dt class="text-xs font-medium text-ink-muted">Metragem</dt>
                  <dd
                    class="text-sm font-semibold leading-[1.35] text-ink tabular-nums"
                  >
                    {{ item().metragem }}
                  </dd>
                </div>

                <div class="space-y-1">
                  <dt class="text-xs font-medium text-ink-muted">Vagas</dt>
                  <dd
                    class="text-sm font-semibold leading-[1.35] text-ink tabular-nums"
                  >
                    {{ item().vagas }}
                  </dd>
                </div>

                <div class="space-y-1">
                  <dt class="text-xs font-medium text-ink-muted">Lazer</dt>
                  <dd class="text-sm font-semibold leading-[1.35] text-ink">
                    Completo com vista panorâmica
                  </dd>
                </div>
              </dl>

              <div class="space-y-2 sm:space-y-3">
                <p class="text-xs leading-[1.45] text-ink-muted sm:text-sm sm:leading-[1.55]">
                  Plantas, valores e condições direto no WhatsApp.
                </p>

                <a
                  [href]="whatsappHref()"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="terraco-btn terraco-btn-moss flex min-h-[46px] w-full items-center justify-center rounded-pill bg-brand px-6 py-2.5 text-base font-semibold leading-[1.35] text-ink-inverse hover:bg-brand-hover sm:min-h-[52px] sm:py-3.5"
                >
                  Falar no WhatsApp
                </a>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  `,
})
export class PrimeViewLandingComponent {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  readonly item = input.required<Lancamento>();

  readonly whatsappHref = computed(() =>
    buildWhatsAppUrl(this.item().whatsappMensagem)
  );

  constructor() {
    effect(() => {
      const currentItem = this.item();
      const jsonLd = buildJsonLd(currentItem);
      const serialized = JSON.stringify(jsonLd).replace(/</g, '\\u003c');

      let scriptEl = this.document.getElementById(
        'launch-jsonld'
      ) as HTMLScriptElement | null;
      if (!scriptEl) {
        scriptEl = this.document.createElement('script');
        scriptEl.type = 'application/ld+json';
        scriptEl.id = 'launch-jsonld';
        this.document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = serialized;
    });

    this.destroyRef.onDestroy(() => {
      const scriptEl = this.document.getElementById('launch-jsonld');
      scriptEl?.remove();
    });
  }
}
