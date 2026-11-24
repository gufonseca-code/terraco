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
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  LaunchCardComponent,
  WhatsappAlertFormComponent,
} from '../components/launches';
import { FooterComponent, NavbarComponent } from '../components/layout';
import {
  BAIRROS_BH,
  type BairroGuide,
  type Lancamento,
  LancamentosService,
  SITE_NAME,
  SITE_URL,
  SeoService,
  getBairroBySlug,
} from '../core';
import { NotFoundPageComponent } from './not-found.page';

const BAIRRO_JSONLD_ID = 'bairro-jsonld';

function normalizeNeighborhood(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function buildBairroJsonLd(
  bairro: BairroGuide,
  launches: readonly Lancamento[],
): Record<string, unknown> {
  const pageUrl = `${SITE_URL}/bairros/${bairro.slug}`;

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
            name: 'Bairros',
            item: `${SITE_URL}/lancamentos`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: bairro.nome,
            item: pageUrl,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: bairro.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.pergunta,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.resposta,
          },
        })),
      },
      {
        '@type': 'ItemList',
        name: `Lançamentos imobiliários em ${bairro.nome}, ${bairro.cidade}`,
        url: pageUrl,
        numberOfItems: launches.length,
        itemListElement: launches.map((launch, index) => {
          const launchUrl = `${SITE_URL}/lancamentos/${launch.slug}`;
          const imageUrl = /^https?:\/\//i.test(launch.imagem)
            ? launch.imagem
            : `${SITE_URL}${launch.imagem}`;

          return {
            '@type': 'ListItem',
            position: index + 1,
            name: launch.nome,
            url: launchUrl,
            item: {
              '@type': 'RealEstateListing',
              name: `${launch.nome} — ${launch.bairro}, ${launch.cidade}`,
              description: launch.resumo,
              url: launchUrl,
              image: imageUrl,
              ...(typeof launch.precoAPartirDe === 'number'
                ? {
                    offers: {
                      '@type': 'Offer',
                      price: launch.precoAPartirDe,
                      priceCurrency: 'BRL',
                      availability: 'https://schema.org/InStock',
                      url: launchUrl,
                    },
                  }
                : {}),
              provider: {
                '@type': 'RealEstateAgent',
                name: SITE_NAME,
                url: SITE_URL,
              },
            },
          };
        }),
      },
    ],
  };
}

@Component({
  selector: 'app-bairro-detail-page',
  imports: [
    NavbarComponent,
    FooterComponent,
    NotFoundPageComponent,
    LaunchCardComponent,
    WhatsappAlertFormComponent,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (bairro(); as current) {
      <div class="flex min-h-dvh flex-col bg-canvas">
        <app-navbar />

        <main
          id="homepage"
          tabindex="-1"
          class="flex min-h-dvh flex-1 flex-col bg-canvas"
        >
          <article
            class="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16"
          >
            <header animate.enter="terraco-reveal" class="max-w-3xl space-y-4">
              <nav aria-label="Navegação estrutural">
                <ol
                  class="flex flex-wrap items-center gap-2 text-[14px] font-normal text-ink-muted"
                >
                  <li>
                    <a
                      routerLink="/"
                      class="transition-colors duration-150 hover:text-ink"
                    >
                      Início
                    </a>
                  </li>
                  <li aria-hidden="true" class="text-ink-muted/60">/</li>
                  <li>
                    <a
                      routerLink="/lancamentos"
                      class="transition-colors duration-150 hover:text-ink"
                    >
                      Bairros
                    </a>
                  </li>
                  <li aria-hidden="true" class="text-ink-muted/60">/</li>
                  <li aria-current="page" class="text-ink">
                    {{ current.nome }}
                  </li>
                </ol>
              </nav>

              <p class="text-[14px] font-normal text-ink-muted">
                {{ current.regiao }} · {{ current.cidade }}, {{ current.uf }}
              </p>

              <h1
                class="font-display text-[clamp(2rem,4vw,2.75rem)] font-medium leading-[1.1] tracking-[-0.025em] text-ink text-balance"
              >
                Morar em {{ current.nome }}, {{ current.cidade }}
              </h1>

              <p
                class="text-[16px] font-normal leading-[1.6] text-ink-muted sm:text-[17px]"
              >
                {{ current.resumo }}
              </p>
            </header>

            <section
              aria-label="Guia editorial do bairro"
              animate.enter="terraco-reveal-delay"
              class="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3 sm:mt-14"
            >
              <div
                class="terraco-card rounded-lg border border-border-subtle bg-elevated p-6 shadow-card"
              >
                <h2
                  class="font-display text-[1.125rem] font-medium leading-[1.25] tracking-[-0.01em] text-ink text-balance"
                >
                  Mobilidade e acesso
                </h2>
                <p
                  class="mt-2.5 text-[14px] font-normal leading-[1.6] text-ink-muted"
                >
                  {{ current.mobilidade }}
                </p>
              </div>

              <div
                class="terraco-card rounded-lg border border-border-subtle bg-elevated p-6 shadow-card"
              >
                <h2
                  class="font-display text-[1.125rem] font-medium leading-[1.25] tracking-[-0.01em] text-ink text-balance"
                >
                  Serviços e arredores
                </h2>
                <p
                  class="mt-2.5 text-[14px] font-normal leading-[1.6] text-ink-muted"
                >
                  {{ current.servicos }}
                </p>
              </div>

              <div
                class="terraco-card rounded-lg border border-border-subtle bg-elevated p-6 shadow-card"
              >
                <h2
                  class="font-display text-[1.125rem] font-medium leading-[1.25] tracking-[-0.01em] text-ink text-balance"
                >
                  Perfil dos lançamentos
                </h2>
                <p
                  class="mt-2.5 text-[14px] font-normal leading-[1.6] text-ink-muted"
                >
                  {{ current.perfilImoveis }}
                </p>
              </div>
            </section>

            <section
              aria-labelledby="bairro-lancamentos-heading"
              class="mt-14 sm:mt-16"
            >
              <div class="max-w-2xl space-y-2">
                <h2
                  id="bairro-lancamentos-heading"
                  class="font-display text-[clamp(1.5rem,2.6vw,1.875rem)] font-medium leading-[1.18] tracking-[-0.02em] text-ink text-balance"
                >
                  Lançamentos em {{ current.nome }}
                </h2>
                @if (matchingLaunches().length === 0) {
                  <p class="text-[15px] font-normal leading-[1.55] text-ink-muted">
                    No momento não temos um lançamento aberto dentro do
                    {{ current.nome }}, mas você pode ser avisado primeiro no
                    WhatsApp ou conhecer opções a poucos minutos de distância.
                  </p>
                }
              </div>

              @if (matchingLaunches().length > 0) {
                <div
                  class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                  @for (launch of matchingLaunches(); track launch.slug) {
                    <app-launch-card
                      [launch]="launch"
                      headingLevel="h3"
                      [priority]="$index < 3"
                    />
                  }
                </div>
              } @else {
                <div class="mt-6 space-y-10">
                  @if (nearbyLaunches().length > 0) {
                    <div class="space-y-4">
                      <h3
                        class="font-display text-[1.25rem] font-medium leading-[1.25] tracking-[-0.015em] text-ink text-balance"
                      >
                        A poucos minutos do {{ current.nome }}
                      </h3>

                      <div
                        class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                      >
                        @for (launch of nearbyLaunches(); track launch.slug) {
                          <app-launch-card
                            [launch]="launch"
                            headingLevel="h4"
                            [priority]="$index < 3"
                          />
                        }
                      </div>
                    </div>
                  }

                  <div
                    class="max-w-xl rounded-lg border border-border-subtle bg-elevated p-6 shadow-card sm:p-8"
                  >
                    <h3
                      class="font-display text-[1.25rem] font-medium leading-[1.25] tracking-[-0.015em] text-ink text-balance"
                    >
                      Quer ser avisado de novos lançamentos no {{ current.nome }}?
                    </h3>
                    <p
                      class="mt-2 text-[14px] font-normal leading-[1.55] text-ink-muted"
                    >
                      Deixe seu WhatsApp que te chamamos assim que surgir uma
                      boa oportunidade no bairro, sem spam.
                    </p>

                    <div class="mt-5">
                      <app-whatsapp-alert-form
                        inputId="bairro-alert-whatsapp"
                        [searchedTerm]="current.nome"
                        [resetKey]="current.slug"
                        [successMessage]="
                          'Combinado! Assim que entrar um lançamento em ' +
                          current.nome +
                          ', te avisamos no WhatsApp.'
                        "
                      />
                    </div>
                  </div>
                </div>
              }
            </section>

            <section
              aria-labelledby="bairro-faq-heading"
              class="mt-14 max-w-3xl sm:mt-16"
            >
              <h2
                id="bairro-faq-heading"
                class="font-display text-[clamp(1.5rem,2.6vw,1.875rem)] font-medium leading-[1.18] tracking-[-0.02em] text-ink text-balance"
              >
                Perguntas frequentes sobre {{ current.nome }}
              </h2>

              <div class="mt-6 space-y-3">
                @for (faq of current.faqs; track faq.pergunta) {
                  <details
                    class="group rounded-md border border-border-subtle bg-elevated px-5 py-4 transition-colors duration-150 open:border-ink/20"
                  >
                    <summary
                      class="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium leading-[1.45] text-ink [&::-webkit-details-marker]:hidden"
                    >
                      <span>{{ faq.pergunta }}</span>
                      <span
                        aria-hidden="true"
                        class="shrink-0 text-[18px] font-normal leading-none text-ink-muted transition-transform duration-150 group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p
                      class="mt-3 border-t border-border-subtle/70 pt-3 text-[14px] font-normal leading-[1.6] text-ink-muted"
                    >
                      {{ faq.resposta }}
                    </p>
                  </details>
                }
              </div>
            </section>

            <section
              aria-labelledby="outros-bairros-heading"
              class="mt-14 border-t border-border-subtle pt-10 sm:mt-16"
            >
              <div
                class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <h2
                  id="outros-bairros-heading"
                  class="font-display text-[1.25rem] font-medium leading-[1.25] tracking-[-0.015em] text-ink text-balance"
                >
                  Explorar outros bairros em Belo Horizonte
                </h2>
                <a
                  routerLink="/lancamentos"
                  class="terraco-link-underline inline-flex min-h-[40px] items-center text-[14px] font-normal text-ink-muted transition-colors duration-150 hover:text-ink"
                >
                  Ver todos os lançamentos
                </a>
              </div>

              <div class="mt-4 flex flex-wrap gap-2.5">
                @for (other of otherBairros(); track other.slug) {
                  <a
                    [routerLink]="['/bairros', other.slug]"
                    class="inline-flex min-h-[40px] items-center rounded-pill border border-border-subtle bg-elevated px-4 py-2 text-[13px] font-medium text-ink transition-colors duration-150 hover:border-ink/25 hover:bg-surface/60"
                  >
                    {{ other.nome }}
                  </a>
                }
              </div>
            </section>
          </article>
        </main>

        <app-footer />
      </div>
    } @else {
      <app-not-found-page />
    }
  `,
})
export class BairroDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly lancamentosService = inject(LancamentosService);
  private readonly seoService = inject(SeoService);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  readonly slug = input<string>('');
  private readonly routeParamMap = toSignal(this.route.paramMap);

  readonly resolvedSlug = computed(() => {
    const fromInput = this.slug();
    if (fromInput) {
      return fromInput;
    }
    return (
      this.routeParamMap()?.get('slug') ??
      this.route.snapshot.paramMap.get('slug') ??
      ''
    );
  });

  readonly bairro = computed(() => getBairroBySlug(this.resolvedSlug()));

  readonly matchingLaunches = computed<Lancamento[]>(() => {
    const current = this.bairro();
    if (!current) {
      return [];
    }
    const allowed = new Set(current.matchBairros.map(normalizeNeighborhood));
    return this.lancamentosService
      .lancamentos()
      .filter((launch) => allowed.has(normalizeNeighborhood(launch.bairro)));
  });

  readonly nearbyLaunches = computed<Lancamento[]>(() => {
    const current = this.bairro();
    if (!current?.nearbyBairros?.length) {
      return [];
    }
    const nearby = new Set(current.nearbyBairros.map(normalizeNeighborhood));
    return this.lancamentosService
      .lancamentos()
      .filter((launch) => nearby.has(normalizeNeighborhood(launch.bairro)));
  });

  readonly otherBairros = computed<BairroGuide[]>(() => {
    const current = this.bairro();
    return BAIRROS_BH.filter((item) => item.slug !== current?.slug);
  });

  constructor() {
    effect(() => {
      const current = this.bairro();
      if (current) {
        this.seoService.updateBairroMeta(current);
        this.upsertJsonLd(current, this.matchingLaunches());
      } else {
        this.seoService.updateNotFoundMeta();
        this.removeJsonLd();
      }
    });

    this.destroyRef.onDestroy(() => {
      this.removeJsonLd();
    });
  }

  private upsertJsonLd(
    bairro: BairroGuide,
    launches: readonly Lancamento[],
  ): void {
    const head = this.document?.head;
    if (!head) {
      return;
    }
    const jsonLd = buildBairroJsonLd(bairro, launches);
    const serialized = JSON.stringify(jsonLd).replace(/</g, '\\u003c');

    let scriptEl = this.document.getElementById(
      BAIRRO_JSONLD_ID,
    ) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = this.document.createElement('script');
      scriptEl.type = 'application/ld+json';
      scriptEl.id = BAIRRO_JSONLD_ID;
      head.appendChild(scriptEl);
    }
    scriptEl.textContent = serialized;
  }

  private removeJsonLd(): void {
    this.document?.getElementById(BAIRRO_JSONLD_ID)?.remove();
  }
}
