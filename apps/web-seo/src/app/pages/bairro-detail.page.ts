import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  viewChildren,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BotanicalArchMotifComponent } from '../components/hero';
import { LaunchCardComponent } from '../components/launches';
import { FooterComponent, NavbarComponent } from '../components/layout';
import {
  type JourneyDestination,
  NextJourneyComponent,
} from '../components/shared/next-journey.component';
import { SectionHandoffComponent } from '../components/shared/section-handoff.component';
import {
  type BairroGuide,
  BairrosService,
  type Lancamento,
  LancamentosService,
  SITE_NAME,
  SITE_URL,
  SeoService,
  buildWhatsAppUrl,
} from '../core';
import { NotFoundPageComponent } from './not-found.page';

const BAIRRO_JSONLD_ID = 'bairro-jsonld';

interface EditorialPillar {
  readonly index: string;
  readonly title: string;
  readonly content: string;
}

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
            item: `${SITE_URL}/bairros`,
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
    BotanicalArchMotifComponent,
    LaunchCardComponent,
    NextJourneyComponent,
    SectionHandoffComponent,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (bairro(); as current) {
      <div class="flex min-h-dvh flex-col bg-canvas">
        <app-navbar />

        <main
          id="bairro-detail"
          tabindex="-1"
          class="flex flex-1 flex-col bg-canvas"
        >
          <section
            aria-labelledby="bairro-heading"
            class="bg-canvas pt-6 pb-12 sm:pt-10 sm:pb-14 lg:pt-14 lg:pb-16"
          >
            <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <nav aria-label="Navegação estrutural" class="mb-5">
                <ol
                  class="flex flex-wrap items-center gap-2 text-[13px] font-normal text-ink-muted"
                >
                  <li>
                    <a
                      routerLink="/"
                      class="transition-colors duration-150 motion-reduce:transition-none hover:text-ink"
                    >
                      Início
                    </a>
                  </li>
                  <li aria-hidden="true" class="text-ink-muted/60">/</li>
                  <li>
                    <a
                      routerLink="/bairros"
                      class="transition-colors duration-150 motion-reduce:transition-none hover:text-ink"
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

              <header
                class="terraco-reveal flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12"
              >
                <div class="max-w-3xl space-y-4">
                  <div class="flex flex-wrap items-center gap-2.5">
                    <p class="text-[13px] font-normal text-ink-muted sm:text-[14px]">
                      {{ current.regiao }} · {{ current.cidade }}, {{ current.uf }}
                    </p>
                    <span
                      class="inline-flex items-center rounded-pill bg-[#E5F2EC] px-2.5 py-0.5 text-[12px] font-medium leading-[1.3] text-[#1F6F50] tabular-nums"
                    >
                      @if (matchingLaunches().length > 0) {
                        {{ matchingLaunches().length }}
                        {{
                          matchingLaunches().length === 1
                            ? 'lançamento ativo'
                            : 'lançamentos ativos'
                        }}
                      } @else if (nearbyLaunches().length > 0) {
                        {{ nearbyLaunches().length }}
                        {{
                          nearbyLaunches().length === 1
                            ? 'lançamento próximo'
                            : 'lançamentos próximos'
                        }}
                      } @else {
                        Pré-lançamento · Guia do bairro
                      }
                    </span>
                  </div>

                  <h1
                    id="bairro-heading"
                    [style.view-transition-name]="'bairro-title-' + current.slug"
                    class="font-display text-[clamp(2rem,4.2vw,3rem)] font-medium not-italic leading-[1.06] tracking-[-0.03em] text-ink text-balance"
                  >
                    Morar em {{ current.nome }}, {{ current.cidade }}
                  </h1>

                  <p
                    class="max-w-[60ch] text-[15px] font-normal leading-[1.55] text-ink-muted sm:text-base"
                  >
                    {{ current.resumo }}
                  </p>

                  <div class="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
                    <app-section-handoff
                      [label]="
                        matchingLaunches().length > 0
                          ? 'Ver lançamentos em ' + current.nome
                          : 'Ver opções próximas ao ' + current.nome
                      "
                      targetId="bairro-lancamentos"
                    />
                    <a
                      routerLink="/lancamentos"
                      [queryParams]="{ q: current.nome }"
                      class="terraco-link-editorial inline-flex min-h-[44px] items-center gap-1.5 text-[14px] font-normal text-ink-muted hover:text-ink focus-visible:text-ink sm:min-h-[40px]"
                    >
                      <span>Abrir no catálogo completo</span>
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="terraco-link-arrow h-4 w-4 shrink-0"
                      >
                        <path d="M4.5 10h11" />
                        <path d="m11 5.5 4.5 4.5-4.5 4.5" />
                      </svg>
                    </a>
                  </div>
                </div>

                <div class="flex items-center justify-start lg:justify-end">
                  <app-botanical-arch-motif class="h-16 sm:h-20 lg:h-24" />
                </div>
              </header>
            </div>
          </section>

          <section
            aria-labelledby="bairro-guia-heading"
            class="border-y border-border-subtle bg-surface py-12 sm:py-16 lg:py-20"
          >
            <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div
                class="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12 xl:gap-16"
              >
                <div class="space-y-3 lg:col-span-4">
                  <h2
                    id="bairro-guia-heading"
                    class="font-display text-[clamp(1.625rem,2.8vw,2.125rem)] font-medium not-italic leading-[1.12] tracking-[-0.025em] text-ink text-balance"
                  >
                    O dia a dia em {{ current.nome }}
                  </h2>
                  <p
                    class="max-w-[38ch] text-[15px] font-normal leading-[1.55] text-ink-muted"
                  >
                    Mobilidade, serviços de rotina e o perfil dos novos
                    condomínios residenciais da região.
                  </p>
                </div>

                <div
                  class="divide-y divide-border-subtle border-y border-border-subtle lg:col-span-8"
                >
                  @for (pillar of editorialPillars(); track pillar.index) {
                    <div
                      class="grid gap-2 py-6 sm:grid-cols-12 sm:items-baseline sm:gap-6 sm:py-7"
                    >
                      <h3
                        class="font-display text-[1.125rem] font-medium not-italic leading-[1.25] tracking-[-0.015em] text-ink text-balance sm:col-span-4"
                      >
                        {{ pillar.title }}
                      </h3>
                      <p
                        class="max-w-[58ch] text-[15px] font-normal leading-[1.6] text-ink-muted sm:col-span-8"
                      >
                        {{ pillar.content }}
                      </p>
                    </div>
                  }
                </div>
              </div>
            </div>
          </section>

          <section
            id="bairro-lancamentos"
            aria-labelledby="bairro-lancamentos-heading"
            class="bg-canvas py-12 sm:py-16 lg:py-20 scroll-mt-24"
          >
            <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div
                class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6"
              >
                <div class="max-w-2xl space-y-2">
                  <h2
                    id="bairro-lancamentos-heading"
                    class="font-display text-[clamp(1.625rem,3vw,2.25rem)] font-medium not-italic leading-[1.1] tracking-[-0.025em] text-ink text-balance"
                  >
                    Lançamentos em {{ current.nome }}
                  </h2>
                  @if (matchingLaunches().length === 0) {
                    <p
                      class="text-[15px] font-normal leading-[1.55] text-ink-muted sm:text-base"
                    >
                      No momento não temos um lançamento aberto dentro do
                      {{ current.nome }}, mas você pode ser avisado primeiro no
                      WhatsApp ou conhecer opções a poucos minutos de distância.
                    </p>
                  }
                </div>

                @if (matchingLaunches().length > 0) {
                  <a
                    routerLink="/lancamentos"
                    [queryParams]="{ q: current.nome }"
                    class="terraco-link-editorial inline-flex min-h-[44px] w-fit shrink-0 items-center gap-1.5 text-[14px] font-medium text-ink hover:text-brand focus-visible:text-brand sm:min-h-[40px]"
                  >
                    <span>Ver no catálogo</span>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="terraco-link-arrow h-4 w-4 shrink-0"
                    >
                      <path d="M4.5 10h11" />
                      <path d="m11 5.5 4.5 4.5-4.5 4.5" />
                    </svg>
                  </a>
                }
              </div>

              @if (matchingLaunches().length > 0) {
                <div
                  class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
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
                <div class="mt-8 space-y-6">
                  @if (nearbyLaunches().length > 0) {
                    <div class="space-y-5">
                      <h3
                        class="font-display text-[1.25rem] font-medium not-italic leading-[1.25] tracking-[-0.015em] text-ink text-balance"
                      >
                        A poucos minutos do {{ current.nome }}
                      </h3>

                      <div
                        class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
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

                  <div class="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
                    <a
                      [href]="bairroWhatsappHref()"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="terraco-link-editorial group inline-flex min-h-[44px] items-center gap-1.5 text-[14px] font-medium text-brand hover:text-brand-hover focus-visible:text-brand-hover sm:min-h-[40px]"
                    >
                      <span>Receber aviso no WhatsApp sobre {{ current.nome }}</span>
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="terraco-link-arrow h-4 w-4 shrink-0"
                      >
                        <path d="M4.5 10h11" />
                        <path d="m11 5.5 4.5 4.5-4.5 4.5" />
                      </svg>
                    </a>
                    <a
                      routerLink="/lancamentos"
                      class="terraco-link-editorial inline-flex min-h-[44px] items-center gap-1.5 text-[14px] font-normal text-ink-muted hover:text-ink focus-visible:text-ink sm:min-h-[40px]"
                    >
                      <span>Explorar todos os lançamentos em BH</span>
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="terraco-link-arrow h-4 w-4 shrink-0"
                      >
                        <path d="M4.5 10h11" />
                        <path d="m11 5.5 4.5 4.5-4.5 4.5" />
                      </svg>
                    </a>
                  </div>
                </div>
              }

              <div class="mt-8">
                <app-section-handoff
                  prompt="Ainda tem dúvidas sobre a região?"
                  [label]="'Ler perguntas frequentes sobre ' + current.nome"
                  targetId="bairro-faq"
                />
              </div>
            </div>
          </section>

          <section
            aria-labelledby="bairro-whatsapp-heading"
            class="bg-ink py-12 text-ink-inverse sm:py-16 lg:py-20"
          >
            <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div
                class="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12 xl:gap-16"
              >
                <div class="space-y-3 lg:col-span-7">
                  <h2
                    id="bairro-whatsapp-heading"
                    class="max-w-xl font-display text-[clamp(1.625rem,3vw,2.25rem)] font-medium not-italic leading-[1.1] tracking-[-0.025em] text-ink-inverse text-balance"
                  >
                    Quer tirar dúvidas sobre morar ou investir no
                    {{ current.nome }}?
                  </h2>
                  <p
                    class="max-w-[54ch] text-[15px] font-normal leading-[1.55] text-ink-inverse/80 sm:text-base"
                  >
                    Converse direto no WhatsApp sobre ruas, previsão de entrega,
                    plantas disponíveis e opções de financiamento na região.
                  </p>
                </div>

                <div
                  class="flex flex-col items-start gap-3 border-t border-ink-inverse/15 pt-6 lg:col-span-5 lg:items-end lg:border-t-0 lg:pt-0"
                >
                  <a
                    [href]="bairroWhatsappHref()"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="terraco-btn inline-flex min-h-[46px] w-fit items-center justify-center rounded-pill bg-action px-6 py-2.5 text-[14px] font-medium leading-[1.35] text-white hover:bg-action-hover"
                  >
                    Tirar dúvidas sobre {{ current.nome }} no WhatsApp
                  </a>
                  <p class="text-[13px] font-normal text-ink-inverse/70">
                    Sem formulário longo e sem ligações indesejadas.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section
            id="bairro-faq"
            aria-labelledby="bairro-faq-heading"
            class="bg-canvas py-12 sm:py-16 lg:py-20 scroll-mt-24"
          >
            <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div class="max-w-3xl">
                <h2
                  id="bairro-faq-heading"
                  class="font-display text-[clamp(1.5rem,2.8vw,2rem)] font-medium not-italic leading-[1.15] tracking-[-0.025em] text-ink text-balance"
                >
                  Perguntas frequentes sobre {{ current.nome }}
                </h2>

                <div class="terraco-m3-accordion-group mt-6 sm:mt-8">
                  @for (faq of current.faqs; track faq.pergunta; let i = $index) {
                    @let isOpen = expandedFaqIndex() === i;
                    <div
                      class="terraco-m3-accordion-item"
                      [attr.data-expanded]="isOpen"
                    >
                      <h3 class="font-sans">
                        <button
                          #faqTrigger
                          type="button"
                          [id]="'faq-trigger-' + current.slug + '-' + i"
                          [attr.aria-expanded]="isOpen"
                          [attr.aria-controls]="
                            'faq-panel-' + current.slug + '-' + i
                          "
                          (click)="toggleFaq(i)"
                          (keydown)="onFaqKeydown($event, i, current.faqs.length)"
                          class="flex min-h-[56px] w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-medium leading-[1.45] text-ink transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-offset-[-2px]"
                        >
                          <span>{{ faq.pergunta }}</span>
                          <span
                            aria-hidden="true"
                            class="terraco-m3-accordion-icon"
                          >
                            <svg
                              viewBox="0 0 20 20"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="1.85"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              class="terraco-m3-accordion-chevron h-4 w-4"
                            >
                              <path d="m5.5 7.5 4.5 4.5 4.5-4.5" />
                            </svg>
                          </span>
                        </button>
                      </h3>

                      <div
                        role="region"
                        [id]="'faq-panel-' + current.slug + '-' + i"
                        [attr.aria-labelledby]="
                          'faq-trigger-' + current.slug + '-' + i
                        "
                        [attr.inert]="isOpen ? null : true"
                        class="terraco-m3-accordion-panel"
                      >
                        <div class="terraco-m3-accordion-body">
                          <div class="px-5 pb-5">
                            <p
                              class="border-t border-border-subtle/70 pt-3.5 text-[14px] font-normal leading-[1.65] text-ink-muted sm:text-[15px]"
                            >
                              {{ faq.resposta }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <div class="mt-12 border-t border-border-subtle pt-10 sm:mt-14">
                <div
                  class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <h2
                    id="outros-bairros-heading"
                    class="font-display text-[1.25rem] font-medium not-italic leading-[1.25] tracking-[-0.015em] text-ink text-balance"
                  >
                    Explorar outros bairros em Belo Horizonte
                  </h2>
                  <a
                    routerLink="/bairros"
                    class="terraco-link-editorial inline-flex min-h-[44px] w-fit items-center gap-1.5 text-[14px] font-normal text-ink-muted hover:text-ink focus-visible:text-ink sm:min-h-[40px]"
                  >
                    <span>Ver índice de bairros</span>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="terraco-link-arrow h-4 w-4 shrink-0"
                    >
                      <path d="M4.5 10h11" />
                      <path d="m11 5.5 4.5 4.5-4.5 4.5" />
                    </svg>
                  </a>
                </div>

                <div class="mt-4 flex flex-wrap gap-2">
                  @for (other of otherBairros(); track other.slug) {
                    <a
                      [routerLink]="['/bairros', other.slug]"
                      class="terraco-m3-chip inline-flex min-h-[40px] items-center border border-border-subtle bg-surface/80 px-4 py-1.5 text-[13px] font-medium text-ink hover:border-border-strong hover:bg-surface sm:text-[14px]"
                    >
                      {{ other.nome }}
                    </a>
                  }
                </div>
              </div>
            </div>
          </section>

          <app-next-journey
            heading="Continue sua pesquisa em BH"
            subtitle="Explore o catálogo completo, descubra pelo seu momento ou veja o próximo bairro."
            variant="editorial"
            [destinations]="nextDestinations()"
          />
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
  private readonly bairrosService = inject(BairrosService);
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

  readonly bairro = computed(() =>
    this.bairrosService.getBySlug(this.resolvedSlug())
  );

  readonly editorialPillars = computed<readonly EditorialPillar[]>(() => {
    const current = this.bairro();
    if (!current) {
      return [];
    }
    return [
      {
        index: '01',
        title: 'Mobilidade e acesso',
        content: current.mobilidade,
      },
      {
        index: '02',
        title: 'Serviços e arredores',
        content: current.servicos,
      },
      {
        index: '03',
        title: 'Perfil dos lançamentos',
        content: current.perfilImoveis,
      },
    ];
  });

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
    return this.bairrosService
      .bairros()
      .filter((item) => item.slug !== current?.slug);
  });

  readonly bairroWhatsappHref = computed(() => {
    const current = this.bairro();
    const message = current
      ? `Olá! Estava lendo o guia do bairro ${current.nome} e gostaria de tirar dúvidas sobre lançamentos e moradia na região.`
      : 'Olá! Gostaria de tirar dúvidas sobre bairros e lançamentos em Belo Horizonte.';
    return buildWhatsAppUrl(message);
  });

  readonly nextDestinations = computed<readonly JourneyDestination[]>(() => {
    const nextBairro = this.otherBairros()[0];
    const list: JourneyDestination[] = [
      {
        title: 'Catálogo completo em BH',
        description:
          'Compare todos os lançamentos com plantas, metragens e condições abertas.',
        actionLabel: 'Ver lançamentos',
        route: '/lancamentos',
      },
      {
        title: 'Descobrir pelo seu momento',
        description:
          'Combine objetivo, tamanho e região de BH em poucos toques, sem cadastro.',
        actionLabel: 'Usar descoberta guiada',
        route: '/',
        fragment: 'descoberta-guiada',
      },
    ];

    if (nextBairro) {
      list.push({
        title: `Guia do bairro ${nextBairro.nome}`,
        description: nextBairro.resumo,
        actionLabel: `Explorar ${nextBairro.nome}`,
        route: ['/bairros', nextBairro.slug],
      });
    }

    return list;
  });

  readonly expandedFaqIndex = linkedSignal<string, number | null>({
    source: this.resolvedSlug,
    computation: () => null,
  });

  private readonly faqTriggers =
    viewChildren<ElementRef<HTMLButtonElement>>('faqTrigger');

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

  toggleFaq(index: number): void {
    this.expandedFaqIndex.update((current) =>
      current === index ? null : index
    );
  }

  onFaqKeydown(event: KeyboardEvent, index: number, total: number): void {
    if (total <= 1) return;
    let nextIndex: number | null = null;
    if (event.key === 'ArrowDown') {
      nextIndex = (index + 1) % total;
    } else if (event.key === 'ArrowUp') {
      nextIndex = (index - 1 + total) % total;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = total - 1;
    }
    if (nextIndex !== null) {
      event.preventDefault();
      this.faqTriggers()[nextIndex]?.nativeElement.focus();
    }
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
