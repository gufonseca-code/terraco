import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { BotanicalArchMotifComponent } from '../components/hero';
import { FooterComponent, NavbarComponent } from '../components/layout';
import {
  M3ButtonDirective,
  M3ChipDirective,
} from '../components/shared/m3-tactile.directives';
import {
  type JourneyDestination,
  NextJourneyComponent,
} from '../components/shared/next-journey.component';
import { ViewTransitionDirective } from '../components/shared/view-transition.directive';
import {
  type BairroGuide,
  type BairroMedia,
  BairrosService,
  type Lancamento,
  LancamentosService,
  SeoService,
  buildWhatsAppUrl,
} from '../core';

type BairroFilterId =
  | 'todos'
  | 'oeste'
  | 'centro-leste'
  | 'noroeste'
  | 'com-lancamentos';

interface BairroFilterOption {
  readonly id: BairroFilterId;
  readonly label: string;
}

interface BairroIndexRow {
  readonly bairro: BairroGuide;
  readonly launchCount: number;
  readonly isNearbyOnly: boolean;
  readonly searchQuery: string;
  readonly media: BairroMedia | null;
}

interface DecisionProfileOption {
  readonly id: string;
  readonly label: string;
  readonly summary: string;
  readonly whatsappMessage: string;
}

const BAIRRO_FILTERS: readonly BairroFilterOption[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'oeste', label: 'Região Oeste' },
  { id: 'centro-leste', label: 'Centro-Sul / Leste' },
  { id: 'noroeste', label: 'Região Noroeste' },
  { id: 'com-lancamentos', label: 'Lançamentos no bairro' },
];

const DECISION_PROFILES: readonly DecisionProfileOption[] = [
  {
    id: 'vista-calma',
    label: 'Vista e ruas tranquilas',
    summary:
      'Estoril e Serrano oferecem cota elevada, áreas verdes e acesso rápido sem trânsito interno pesado.',
    whatsappMessage:
      'Olá! Estou comparando bairros em BH e busco um apartamento em rua tranquila com boa vista (como Estoril ou Serrano). Pode me orientar?',
  },
  {
    id: 'pe-metro',
    label: 'Fazer tudo a pé e região central',
    summary:
      'Prado e Santa Efigênia oferecem acesso rápido ao Centro, polos hospitalares, serviços e alta demanda por studios e apartamentos compactos.',
    whatsappMessage:
      'Olá! Tenho interesse em morar ou investir perto da região central e polos de serviços em BH, como no Prado ou Santa Efigênia. Quais opções você recomenda?',
  },
  {
    id: 'vida-bairro',
    label: 'Gastronomia e parques',
    summary:
      'Buritis e o entorno imediato do Estoril concentram bares, escolas, UniBH e o Parque Aggeo Pio Sobrinho.',
    whatsappMessage:
      'Olá! Estou avaliando o Buritis e o Estoril para morar perto de parques, escolas e gastronomia. Quais lançamentos combinam com esse perfil?',
  },
];

const BAIRROS_NEXT_DESTINATIONS: readonly JourneyDestination[] = [
  {
    title: 'Catálogo completo em BH',
    description:
      'Compare plantas, metragens e valores de todos os lançamentos disponíveis na cidade.',
    actionLabel: 'Explorar lançamentos',
    route: '/lancamentos',
  },
  {
    title: 'Prime View no Estoril',
    description:
      '2 quartos com suíte, Garden e Coberturas Lineares a 2 minutos da Av. Barão Homem de Melo.',
    actionLabel: 'Conhecer lançamento',
    route: ['/lancamentos', 'prime-view'],
  },
];

function resolveBairroMedia(
  bairro: BairroGuide,
  directMatches: readonly Lancamento[],
  nearbyMatches: readonly Lancamento[]
): BairroMedia | null {
  if (bairro.media?.url) {
    return bairro.media;
  }

  const reference = directMatches[0] ?? nearbyMatches[0];
  if (!reference) {
    return null;
  }

  const landscapeGallery = reference.galeria?.find(
    (item): item is typeof item & { width: number; height: number } =>
      typeof item.width === 'number' &&
      typeof item.height === 'number' &&
      item.width > item.height
  );
  if (landscapeGallery) {
    return {
      url: landscapeGallery.url,
      alt: landscapeGallery.alt,
      width: landscapeGallery.width,
      height: landscapeGallery.height,
      caption: `${reference.nome} · ${reference.bairro}`,
    };
  }

  return {
    url: reference.imagem,
    alt: reference.imagemAlt,
    width: reference.imagemWidth,
    height: reference.imagemHeight,
    caption: `${reference.nome} · ${reference.bairro}`,
  };
}

@Component({
  selector: 'app-bairros-page',
  imports: [
    NgOptimizedImage,
    RouterLink,
    M3ButtonDirective,
    M3ChipDirective,
    BotanicalArchMotifComponent,
    NavbarComponent,
    NextJourneyComponent,
    ViewTransitionDirective,
    FooterComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-dvh flex-col bg-canvas">
      <app-navbar />

      <main id="bairros-index" tabindex="-1" class="flex-1">
        <section
          aria-labelledby="bairros-heading"
          class="bg-canvas pt-6 pb-12 sm:pt-10 sm:pb-16 lg:pt-14 lg:pb-20"
        >
          <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav
              aria-label="Navegação estrutural"
              class="mb-5 flex items-center gap-2 text-[13px] font-normal text-ink-muted"
            >
              <a
                routerLink="/"
                class="transition-colors duration-150 motion-reduce:transition-none hover:text-ink"
              >
                Início
              </a>
              <span aria-hidden="true">/</span>
              <span class="text-ink">Bairros</span>
            </nav>

            <header
              class="flex flex-col gap-6 border-b border-border-subtle pb-8 sm:pb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-12"
            >
              <div class="max-w-2xl space-y-3">
                <h1
                  id="bairros-heading"
                  appViewTransition="page-heading"
                  class="font-display text-[clamp(2rem,4vw,3rem)] font-medium not-italic leading-[1.06] tracking-[-0.03em] text-ink text-balance"
                >
                  Bairros em Belo Horizonte
                </h1>
                <p
                  class="max-w-[54ch] text-[15px] font-normal leading-[1.55] text-ink-muted sm:text-base"
                >
                  Mobilidade, rotina de serviços e perfil dos lançamentos nas
                  regiões que acompanhamos em BH.
                </p>
              </div>

              <div class="flex items-center justify-start lg:justify-end">
                <app-botanical-arch-motif
                  appViewTransition="botanical-arch"
                  class="h-16 sm:h-20 lg:h-24"
                />
              </div>
            </header>

            <div
              class="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center sm:justify-between"
            >
              <div
                role="group"
                aria-label="Filtrar bairros por região ou disponibilidade"
                class="flex flex-wrap items-center gap-2"
              >
                @for (filter of filters; track filter.id) {
                  @let active = selectedFilter() === filter.id;
                  <button
                    type="button"
                    appM3Chip
                    tone="light"
                    [active]="active"
                    (click)="setFilter(filter.id)"
                    [attr.aria-pressed]="active"
                    class="inline-flex min-h-[44px] w-auto items-center gap-2 px-4 py-1.5 text-[13px] leading-[1.3] sm:min-h-[40px] sm:text-[14px]"
                  >
                    <span>{{ filter.label }}</span>
                    <span
                      [class]="
                        active
                          ? 'text-[12px] font-medium text-ink-inverse/75 tabular-nums'
                          : 'text-[12px] font-normal text-ink-muted tabular-nums'
                      "
                    >
                      {{ filterCounts()[filter.id] }}
                    </span>
                  </button>
                }
              </div>

              <p
                aria-live="polite"
                class="text-[13px] font-normal text-ink-muted tabular-nums"
              >
                {{ filteredRows().length }}
                {{
                  filteredRows().length === 1
                    ? 'bairro listado'
                    : 'bairros listados'
                }}
              </p>
            </div>

            <div
              class="mt-6 divide-y divide-border-subtle border-y border-border-subtle sm:mt-8"
            >
              @for (row of filteredRows(); track row.bairro.slug; let idx = $index) {
                <article
                  class="grid gap-6 py-8 sm:py-10 lg:grid-cols-12 lg:items-center lg:gap-10 lg:py-12"
                >
                  <div class="lg:col-span-5">
                    @if (row.media; as media) {
                      <a
                        [routerLink]="['/bairros', row.bairro.slug]"
                        [attr.aria-label]="'Ler guia do bairro ' + row.bairro.nome"
                        class="group relative block aspect-[16/10] overflow-hidden rounded-[20px] bg-surface"
                      >
                        <img
                          [ngSrc]="media.url"
                          [alt]="media.alt"
                          [width]="media.width"
                          [height]="media.height"
                          [priority]="idx === 0"
                          class="h-full w-full rounded-[20px] object-cover object-center transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:scale-[1.02] motion-reduce:group-hover:scale-100"
                        />
                        <span
                          class="pointer-events-none absolute bottom-3 left-3 inline-flex items-center rounded-pill bg-ink/80 px-3 py-1 text-[12px] font-normal leading-[1.3] text-ink-inverse backdrop-blur-xs"
                        >
                          {{ media.caption }}
                        </span>
                      </a>
                    } @else {
                      <a
                        [routerLink]="['/bairros', row.bairro.slug]"
                        [attr.aria-label]="'Ler guia do bairro ' + row.bairro.nome"
                        class="group flex aspect-[16/10] flex-col items-center justify-center gap-3 rounded-[20px] border border-border-subtle bg-surface p-6 text-center transition-colors duration-150 motion-reduce:transition-none hover:border-border-strong"
                      >
                        <app-botanical-arch-motif class="h-16 opacity-90" />
                        <span class="text-[13px] font-medium text-ink-muted">
                          Pré-lançamento em curadoria · {{ row.bairro.nome }}
                        </span>
                      </a>
                    }
                  </div>

                  <div class="space-y-4 lg:col-span-7">
                    <div class="flex flex-wrap items-center gap-2.5">
                      <span class="text-[13px] font-normal text-ink-muted">
                        {{ row.bairro.regiao }}
                      </span>
                      <span aria-hidden="true" class="text-ink-muted/50">·</span>
                      <span
                        class="inline-flex items-center rounded-pill bg-[#E5F2EC] px-2.5 py-0.5 text-[12px] font-medium leading-[1.3] text-[#1F6F50] tabular-nums"
                      >
                        @if (row.launchCount > 0) {
                          {{ row.launchCount }}
                          {{
                            row.launchCount === 1
                              ? row.isNearbyOnly
                                ? 'lançamento próximo'
                                : 'lançamento ativo'
                              : row.isNearbyOnly
                                ? 'lançamentos próximos'
                                : 'lançamentos ativos'
                          }}
                        } @else {
                          Pré-lançamento · Guia do bairro
                        }
                      </span>
                    </div>

                    <h2
                      appViewTransition="bairro-title"
                      [vtSlug]="row.bairro.slug"
                      class="font-display text-[clamp(1.5rem,2.4vw,1.875rem)] font-medium not-italic leading-[1.15] tracking-[-0.02em] text-ink text-balance"
                    >
                      <a
                        [routerLink]="['/bairros', row.bairro.slug]"
                        class="transition-colors duration-150 motion-reduce:transition-none hover:text-brand"
                      >
                        {{ row.bairro.nome }}
                      </a>
                    </h2>

                    <p
                      class="max-w-[58ch] text-[15px] font-normal leading-[1.55] text-ink-muted sm:text-base"
                    >
                      {{ row.bairro.resumo }}
                    </p>

                    <p
                      class="max-w-[58ch] border-l-2 border-border-strong pl-3.5 text-[14px] font-normal leading-[1.5] text-ink"
                    >
                      <span class="font-medium">Mobilidade:</span>
                      {{ row.bairro.mobilidade }}
                    </p>

                    <div class="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
                      <a
                        [routerLink]="['/bairros', row.bairro.slug]"
                        class="terraco-link-editorial group inline-flex min-h-[44px] items-center gap-1.5 text-[14px] font-medium text-brand hover:text-brand-hover focus-visible:text-brand-hover sm:min-h-[40px]"
                      >
                        <span>Ler guia do bairro</span>
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

                      @if (row.launchCount > 0) {
                        <a
                          [routerLink]="['/lancamentos']"
                          [queryParams]="{ q: row.searchQuery }"
                          class="terraco-link-editorial inline-flex min-h-[44px] items-center gap-1.5 text-[14px] font-normal text-ink hover:text-brand focus-visible:text-brand sm:min-h-[40px]"
                        >
                          <span>Ver lançamentos</span>
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
                  </div>
                </article>
              }
            </div>
          </div>
        </section>

        <section
          aria-labelledby="bairros-decision-heading"
          class="bg-ink py-12 text-ink-inverse sm:py-16 lg:py-20"
        >
          <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div
              class="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12 xl:gap-16"
            >
              <div class="space-y-3 lg:col-span-5">
                <h2
                  id="bairros-decision-heading"
                  class="max-w-md font-display text-[clamp(1.625rem,3vw,2.25rem)] font-medium not-italic leading-[1.1] tracking-[-0.025em] text-ink-inverse text-balance"
                >
                  Ainda decidindo entre os bairros de BH?
                </h2>
                <p
                  class="max-w-[46ch] text-[15px] font-normal leading-[1.55] text-ink-inverse/80 sm:text-base"
                >
                  Escolha o ritmo de dia a dia que faz mais sentido para você e
                  converse no WhatsApp sem compromisso.
                </p>
              </div>

              <div
                class="border-t border-ink-inverse/15 pt-7 lg:col-span-7 lg:border-t-0 lg:border-l lg:border-ink-inverse/15 lg:pt-0 lg:pl-12 xl:pl-16"
              >
                <div
                  role="group"
                  aria-label="Perfil de rotina para orientação no WhatsApp"
                  class="flex flex-wrap gap-2.5"
                >
                  @for (profile of decisionProfiles; track profile.id) {
                    @let active = selectedProfileId() === profile.id;
                    <button
                      type="button"
                      appM3Chip
                      tone="dark"
                      [active]="active"
                      (click)="selectProfile(profile.id)"
                      [attr.aria-pressed]="active"
                      class="inline-flex min-h-[44px] w-auto items-center px-4 py-2 text-left text-[13px] leading-[1.3] sm:min-h-[42px] sm:text-[14px]"
                    >
                      <span>{{ profile.label }}</span>
                    </button>
                  }
                </div>

                <div
                  class="mt-6 border-t border-ink-inverse/15 pt-5 sm:mt-7 sm:pt-6"
                >
                  <p
                    data-testid="bairros-whatsapp-preview"
                    class="max-w-[56ch] border-l-2 border-highlight pl-4 text-[15px] font-normal leading-[1.55] text-ink-inverse/90"
                  >
                    {{ selectedProfile().summary }}
                  </p>

                  <a
                    [href]="decisionWhatsappHref()"
                    target="_blank"
                    rel="noopener noreferrer"
                    appM3Button
                    variant="primary"
                    class="mt-5 inline-flex min-h-[46px] w-fit items-center justify-center px-6 py-2.5 text-[14px] leading-[1.35]"
                  >
                    Comparar bairros no WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <app-next-journey
          heading="Continue explorando BH"
          subtitle="Acesse o catálogo completo ou veja o lançamento em destaque."
          variant="editorial"
          [destinations]="nextDestinations"
        />
      </main>

      <app-footer />
    </div>
  `,
})
export class BairrosPageComponent implements OnInit {
  private readonly lancamentosService = inject(LancamentosService);
  private readonly bairrosService = inject(BairrosService);
  private readonly seoService = inject(SeoService);

  readonly bairros = this.bairrosService.bairros;
  readonly filters = BAIRRO_FILTERS;
  readonly decisionProfiles = DECISION_PROFILES;
  readonly nextDestinations = BAIRROS_NEXT_DESTINATIONS;

  readonly selectedFilter = signal<BairroFilterId>('todos');
  readonly selectedProfileId = signal<string>(DECISION_PROFILES[0].id);

  readonly bairroRows = computed<readonly BairroIndexRow[]>(() => {
    const allLaunches = this.lancamentosService.lancamentos();
    return this.bairros().map((bairro) => {
      const directMatches = allLaunches.filter((item) =>
        bairro.matchBairros.some(
          (name) => name.toLowerCase() === item.bairro.trim().toLowerCase()
        )
      );
      if (directMatches.length > 0) {
        return {
          bairro,
          launchCount: directMatches.length,
          isNearbyOnly: false,
          searchQuery: bairro.nome,
          media: resolveBairroMedia(bairro, directMatches, []),
        };
      }

      const nearby = bairro.nearbyBairros ?? [];
      const nearbyMatches = allLaunches.filter((item) =>
        nearby.some(
          (name) => name.toLowerCase() === item.bairro.trim().toLowerCase()
        )
      );
      return {
        bairro,
        launchCount: nearbyMatches.length,
        isNearbyOnly: nearbyMatches.length > 0,
        searchQuery: nearby[0] ?? bairro.nome,
        media: resolveBairroMedia(bairro, [], nearbyMatches),
      };
    });
  });

  readonly filterCounts = computed<Record<BairroFilterId, number>>(() => {
    const rows = this.bairroRows();
    return {
      todos: rows.length,
      oeste: rows.filter((row) => row.bairro.regiao.includes('Oeste')).length,
      'centro-leste': rows.filter((row) =>
        row.bairro.regiao.includes('Centro-Sul')
      ).length,
      noroeste: rows.filter((row) => row.bairro.regiao.includes('Noroeste'))
        .length,
      'com-lancamentos': rows.filter(
        (row) => row.launchCount > 0 && !row.isNearbyOnly
      ).length,
    };
  });

  readonly filteredRows = computed<readonly BairroIndexRow[]>(() => {
    const filter = this.selectedFilter();
    const rows = this.bairroRows();
    switch (filter) {
      case 'oeste':
        return rows.filter((row) => row.bairro.regiao.includes('Oeste'));
      case 'centro-leste':
        return rows.filter((row) => row.bairro.regiao.includes('Centro-Sul'));
      case 'noroeste':
        return rows.filter((row) => row.bairro.regiao.includes('Noroeste'));
      case 'com-lancamentos':
        return rows.filter(
          (row) => row.launchCount > 0 && !row.isNearbyOnly
        );
      default:
        return rows;
    }
  });

  readonly selectedProfile = computed<DecisionProfileOption>(
    () =>
      this.decisionProfiles.find(
        (profile) => profile.id === this.selectedProfileId()
      ) ?? this.decisionProfiles[0]
  );

  readonly decisionWhatsappHref = computed(() =>
    buildWhatsAppUrl(this.selectedProfile().whatsappMessage)
  );

  ngOnInit(): void {
    this.seoService.updateBairrosIndexMeta(this.bairros());
  }

  setFilter(id: BairroFilterId): void {
    this.selectedFilter.set(id);
  }

  selectProfile(id: string): void {
    this.selectedProfileId.set(id);
  }
}
