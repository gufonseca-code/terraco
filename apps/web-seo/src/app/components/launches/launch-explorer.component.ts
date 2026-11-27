import { Listbox, Option } from '@angular/aria/listbox';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LancamentosService, buildWhatsAppUrl } from '../../core';
import { BAIRROS_BH, type BairroGuide } from '../../core/bairros.data';
import { M3SearchBarComponent } from '../shared/m3-search-bar.component';
import {
  M3ButtonDirective,
  M3ChipDirective,
} from '../shared/m3-tactile.directives';
import {
  type JourneyDestination,
  NextJourneyComponent,
} from '../shared/next-journey.component';
import { LaunchCardComponent } from './launch-card.component';
import { LaunchCardSkeletonComponent } from './launch-skeleton.component';

const TIPOLOGIA_FILTERS = [
  'Todas',
  'Studio',
  '1 quarto',
  '2 quartos',
  'Garden',
  'Cobertura',
] as const;

@Component({
  selector: 'app-launch-explorer',
  imports: [
    RouterLink,
    Listbox,
    Option,
    LaunchCardComponent,
    LaunchCardSkeletonComponent,
    M3ButtonDirective,
    M3ChipDirective,
    M3SearchBarComponent,
    NextJourneyComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'closeMenus()',
  },
  template: `
    <section
      aria-labelledby="lancamentos-heading"
      class="bg-canvas pt-6 pb-12 sm:pt-10 sm:pb-16 lg:pt-14 lg:pb-20"
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
            <li aria-current="page" class="text-ink">Lançamentos</li>
          </ol>
        </nav>

        <div class="space-y-6">
          <header class="max-w-2xl space-y-3">
            <h1
              id="lancamentos-heading"
              class="terraco-reveal font-display text-[clamp(2rem,4vw,3rem)] font-medium not-italic leading-[1.06] tracking-[-0.03em] text-ink text-balance"
            >
              Lançamentos
            </h1>
            <p
              class="text-[15px] font-normal leading-[1.55] text-ink-muted sm:text-base"
            >
              Compare tipologias, metragens e condições em Belo Horizonte antes
              de falar com alguém. Salve seus favoritos ou tire dúvidas direto
              no WhatsApp.
            </p>
          </header>

          @if (!isLoading() || lancamentos().length > 0) {
            <div
              class="flex flex-col gap-4 border-b border-border-subtle pb-6 sm:pb-7"
            >
              <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
                <app-m3-search-bar
                  #searchBarRef
                  inputId="explorer-search"
                  ariaLabel="Filtrar lançamentos"
                  labelText="Filtrar por bairro ou lançamento"
                  placeholder="Bairro ou lançamento"
                  submitLabel="Buscar"
                  size="compact"
                  [value]="searchInput()"
                  (valueChange)="onSearchValueChange($event)"
                  (submitted)="onSearchSubmitted($event)"
                  (neighborhoodSelected)="selectNeighborhood($event)"
                  (cleared)="clearFilters()"
                  class="w-full lg:max-w-md"
                />

                <div
                  #filtersContainerRef
                  class="flex flex-wrap items-center gap-2"
                >
                  @if (quickNeighborhoods().length > 0) {
                    <div class="relative">
                      <button
                        type="button"
                        (click)="toggleNeighborhoodMenu($event)"
                        [attr.aria-expanded]="neighborhoodMenuOpen()"
                        aria-haspopup="listbox"
                        aria-controls="bairro-filter-listbox"
                        [class]="
                          dropdownTriggerClass(
                            hasActiveNeighborhood(),
                            neighborhoodMenuOpen()
                          )
                        "
                      >
                        <span>{{ selectedNeighborhoodLabel() }}</span>
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.75"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          [class]="chevronClass(neighborhoodMenuOpen())"
                        >
                          <path d="m5.5 7.5 4.5 4.5 4.5-4.5" />
                        </svg>
                      </button>

                      @if (neighborhoodMenuOpen()) {
                        <ul
                          id="bairro-filter-listbox"
                          ngListbox
                          [value]="selectedNeighborhoodValue()"
                          (valueChange)="onNeighborhoodListboxChange($event)"
                          [multi]="false"
                          orientation="vertical"
                          aria-label="Filtrar por bairro"
                          animate.enter="terraco-chip-enter"
                          class="absolute left-0 top-full z-30 mt-2 min-w-[210px] rounded-[20px] border border-border-subtle bg-elevated p-1.5 shadow-card"
                        >
                          <li
                            ngOption
                            value="Todos"
                            label="Todos os bairros"
                            (click)="selectNeighborhoodOption('Todos')"
                            [class]="
                              dropdownOptionClass(!hasActiveNeighborhood())
                            "
                          >
                            <span>Todos os bairros</span>
                            @if (!hasActiveNeighborhood()) {
                              <span aria-hidden="true" class="text-brand">✓</span>
                            }
                          </li>
                          @for (bairro of quickNeighborhoods(); track bairro) {
                            <li
                              ngOption
                              [value]="bairro"
                              [label]="bairro"
                              (click)="selectNeighborhoodOption(bairro)"
                              [class]="
                                dropdownOptionClass(
                                  isNeighborhoodActive(bairro)
                                )
                              "
                            >
                              <span>{{ bairro }}</span>
                              @if (isNeighborhoodActive(bairro)) {
                                <span aria-hidden="true" class="text-brand">✓</span>
                              }
                            </li>
                          }
                        </ul>
                      }
                    </div>
                  }

                  <div class="relative">
                    <button
                      type="button"
                      (click)="toggleTipologiaMenu($event)"
                      [attr.aria-expanded]="tipologiaMenuOpen()"
                      aria-haspopup="listbox"
                      aria-controls="tipologia-filter-listbox"
                      [class]="
                        dropdownTriggerClass(
                          tipologiaFilter() !== 'Todas',
                          tipologiaMenuOpen()
                        )
                      "
                    >
                      <span>{{ selectedTipologiaLabel() }}</span>
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.75"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        [class]="chevronClass(tipologiaMenuOpen())"
                      >
                        <path d="m5.5 7.5 4.5 4.5 4.5-4.5" />
                      </svg>
                    </button>

                    @if (tipologiaMenuOpen()) {
                      <ul
                        id="tipologia-filter-listbox"
                        ngListbox
                        [value]="selectedTipologiaValue()"
                        (valueChange)="onTipologiaListboxChange($event)"
                        [multi]="false"
                        orientation="vertical"
                        aria-label="Filtrar por tipologia"
                        animate.enter="terraco-chip-enter"
                        class="absolute left-0 top-full z-30 mt-2 min-w-[220px] rounded-[20px] border border-border-subtle bg-elevated p-1.5 shadow-card"
                      >
                        @for (tipologia of tipologiaFilters; track tipologia) {
                          <li
                            ngOption
                            [value]="tipologia"
                            [label]="
                              tipologia === 'Todas'
                                ? 'Todas as tipologias'
                                : tipologia
                            "
                            (click)="selectTipologiaOption(tipologia)"
                            [class]="
                              dropdownOptionClass(isTipologiaActive(tipologia))
                            "
                          >
                            <span>{{
                              tipologia === 'Todas'
                                ? 'Todas as tipologias'
                                : tipologia
                            }}</span>
                            @if (isTipologiaActive(tipologia)) {
                              <span aria-hidden="true" class="text-brand">✓</span>
                            }
                          </li>
                        }
                      </ul>
                    }
                  </div>

                  @if (objetivoFilter(); as objetivo) {
                    <button
                      type="button"
                      appM3Chip
                      tone="brand"
                      [active]="true"
                      (click)="clearObjetivo()"
                      [attr.aria-label]="
                        'Remover filtro de objetivo ' + objetivo
                      "
                      class="inline-flex min-h-[44px] items-center gap-1.5 px-4 py-1.5 text-[13px] sm:min-h-[40px]"
                    >
                      <span>Objetivo: {{ objetivo }}</span>
                      <span aria-hidden="true">×</span>
                    </button>
                  }

                  @if (hasActiveFilters()) {
                    <button
                      type="button"
                      appM3Chip
                      tone="brand"
                      [active]="false"
                      (click)="clearFilters()"
                      class="inline-flex min-h-[44px] items-center gap-1.5 px-3.5 py-1.5 text-[13px] text-ink-muted hover:text-ink sm:min-h-[40px]"
                    >
                      <span>Limpar filtros</span>
                      <span aria-hidden="true">×</span>
                    </button>
                  }
                </div>
              </div>

              <div
                class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <p
                  aria-live="polite"
                  class="text-[13px] font-normal text-ink-muted tabular-nums"
                >
                  @if (filteredLancamentos().length === 0) {
                    Nenhum lançamento encontrado com os filtros atuais
                  } @else if (filteredLancamentos().length === 1) {
                    1 lançamento disponível
                  } @else {
                    {{ filteredLancamentos().length }} lançamentos disponíveis
                  }
                </p>

                @if (matchedBairroGuide(); as bairroGuide) {
                  <p class="text-[13px] font-normal text-ink-muted sm:text-[14px]">
                    Quer entender mobilidade, serviços e perfil do bairro?
                    <a
                      [routerLink]="['/bairros', bairroGuide.slug]"
                      class="terraco-link-underline ml-1 font-medium text-brand hover:text-brand-hover"
                    >
                      Ver guia completo do {{ bairroGuide.nome }}
                    </a>
                  </p>
                }
              </div>
            </div>
          }
        </div>

        @if (isLoading() && lancamentos().length === 0) {
          <div
            class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
          >
            <app-launch-card-skeleton />
          </div>
        } @else if (filteredLancamentos().length > 0) {
          <div
            data-testid="lancamentos-grid"
            class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
          >
            @for (launch of filteredLancamentos(); track launch.slug) {
              <app-launch-card
                [launch]="launch"
                headingLevel="h2"
                [priority]="$index < 3"
                [cardId]="$first ? 'resultados-lancamentos' : null"
              />
            }
          </div>
        } @else if (!isLoading()) {
          <div
            id="resultados-lancamentos"
            animate.enter="terraco-reveal"
            class="mt-8 rounded-[20px] border border-border-subtle bg-surface p-6 sm:p-8 lg:p-10"
          >
            <div class="max-w-2xl space-y-3">
              <h2
                class="font-display text-[1.5rem] font-medium not-italic leading-[1.18] tracking-[-0.02em] text-ink text-balance"
              >
                @if (searchedTerm()) {
                  Ainda não temos lançamentos em "{{ searchedTerm() }}" por aqui
                } @else {
                  Nenhum lançamento encontrado
                }
              </h2>

              <p
                class="text-[15px] font-normal leading-[1.55] text-ink-muted sm:text-base"
              >
                Você pode limpar os filtros para ver todo o catálogo ou chamar
                direto no WhatsApp para saber o que está entrando na região.
              </p>

              <div class="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  (click)="clearFilters()"
                  class="terraco-m3-chip inline-flex min-h-[44px] cursor-pointer items-center justify-center border border-ink bg-ink px-5 py-2 text-[13px] font-medium text-ink-inverse hover:bg-ink/90"
                >
                  Ver todos os lançamentos
                </button>
                <a
                  [href]="whatsappConciergeHref()"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="terraco-link-editorial group inline-flex min-h-[44px] items-center gap-1.5 text-[14px] font-medium text-brand hover:text-brand-hover focus-visible:text-brand-hover sm:min-h-[40px]"
                >
                  <span>Perguntar no WhatsApp</span>
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
          </div>
        }

        <nav
          aria-label="Guias de bairros em BH"
          class="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border-subtle pt-6 text-[14px]"
        >
          <span class="font-medium text-ink">Guias de bairros em BH</span>
          @for (guide of bairrosGuides; track guide.slug) {
            <a
              [routerLink]="['/bairros', guide.slug]"
              class="terraco-link-nav inline-flex min-h-[44px] items-center px-3 font-normal text-ink-muted hover:text-ink focus-visible:text-ink sm:min-h-[40px]"
            >
              {{ guide.nome }}
            </a>
          }
        </nav>
      </div>
    </section>

    <section
      aria-labelledby="catalogo-concierge-heading"
      class="bg-ink py-12 text-ink-inverse sm:py-16 lg:py-20"
    >
      <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          class="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12 xl:gap-16"
        >
          <div class="space-y-3 lg:col-span-7">
            <h2
              id="catalogo-concierge-heading"
              class="max-w-xl font-display text-[clamp(1.625rem,3vw,2.25rem)] font-medium not-italic leading-[1.1] tracking-[-0.025em] text-ink-inverse text-balance"
            >
              Procurando outro bairro ou perfil em BH?
            </h2>
            <p
              class="max-w-[54ch] text-[15px] font-normal leading-[1.55] text-ink-inverse/80 sm:text-base"
            >
              Conte direto no WhatsApp qual região, metragem ou faixa de valor
              faz sentido para você — sem formulário nem ligações indesejadas.
            </p>
          </div>

          <div
            class="flex flex-col items-start gap-3 border-t border-ink-inverse/15 pt-6 lg:col-span-5 lg:items-end lg:border-t-0 lg:pt-0"
          >
            <a
              [href]="whatsappConciergeHref()"
              target="_blank"
              rel="noopener noreferrer"
              appM3Button
              variant="primary"
              class="inline-flex min-h-[46px] w-fit items-center justify-center px-6 py-2.5 text-[14px] leading-[1.35]"
            >
              Falar no WhatsApp sobre meu perfil
            </a>
            <p class="text-[13px] font-normal text-ink-inverse/70">
              Atendimento direto em Belo Horizonte.
            </p>
          </div>
        </div>
      </div>
    </section>

    <app-next-journey
      heading="Continue sua busca em BH"
      subtitle="Se ainda está decidindo a região ou o perfil do imóvel, estes caminhos ajudam a afunilar."
      variant="editorial"
      [destinations]="catalogNextDestinations"
    />
  `,
})
export class LaunchExplorerComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly lancamentosService = inject(LancamentosService);

  readonly lancamentos = this.lancamentosService.lancamentos;
  readonly filteredLancamentos = this.lancamentosService.filteredLancamentos;
  readonly quickNeighborhoods = this.lancamentosService.quickNeighborhoods;
  readonly searchQuery = this.lancamentosService.searchQuery;
  readonly activeFilter = this.lancamentosService.activeFilter;
  readonly tipologiaFilter = this.lancamentosService.tipologiaFilter;
  readonly objetivoFilter = this.lancamentosService.objetivoFilter;
  readonly isLoading = this.lancamentosService.isLoadingList;
  readonly tipologiaFilters = TIPOLOGIA_FILTERS;
  readonly bairrosGuides = BAIRROS_BH;
  readonly catalogNextDestinations: readonly JourneyDestination[] = [
    {
      title: 'Descobrir pelo seu momento',
      description:
        'Combine objetivo, tipologia e região de BH em 3 toques para ver o que mais encaixa.',
      actionLabel: 'Usar descoberta guiada',
      route: '/',
      fragment: 'descoberta-guiada',
    },
    {
      title: 'Guias de bairros em BH',
      description:
        'Compare mobilidade, serviços de rotina e perfil dos lançamentos em Estoril, Prado, Santa Efigênia, Serrano e Buritis.',
      actionLabel: 'Explorar bairros',
      route: '/bairros',
    },
    {
      title: 'Guia do bairro Estoril',
      description:
        'Mobilidade pela Av. Barão Homem de Melo, proximidade ao Buritis e lançamentos na região.',
      actionLabel: 'Explorar Estoril',
      route: ['/bairros', 'estoril'],
    },
  ];

  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  readonly searchInput = signal<string>('');
  readonly neighborhoodMenuOpen = signal<boolean>(false);
  readonly tipologiaMenuOpen = signal<boolean>(false);

  readonly hasActiveNeighborhood = computed(() =>
    this.quickNeighborhoods().some((bairro) => this.isNeighborhoodActive(bairro))
  );

  readonly selectedNeighborhoodLabel = computed(() => {
    const active = this.quickNeighborhoods().find((bairro) =>
      this.isNeighborhoodActive(bairro)
    );
    return active ? `Bairro: ${active}` : 'Bairro: Todos';
  });

  readonly selectedTipologiaLabel = computed(() => {
    const current = this.tipologiaFilter().trim();
    return current && current !== 'Todas'
      ? `Tipologia: ${current}`
      : 'Tipologia: Todas';
  });

  readonly searchedTerm = computed(() => {
    const parts = [
      this.searchQuery().trim(),
      this.tipologiaFilter() !== 'Todas' ? this.tipologiaFilter() : '',
      this.objetivoFilter() ?? '',
    ].filter((part) => part.length > 0);
    if (parts.length > 0) {
      return parts.join(' · ');
    }
    const filter = this.activeFilter().trim();
    return filter && filter !== 'Todos' ? filter : '';
  });

  readonly hasActiveFilters = computed(
    () =>
      this.searchQuery().trim().length > 0 ||
      this.activeFilter() !== 'Todos' ||
      this.tipologiaFilter() !== 'Todas' ||
      this.objetivoFilter() !== null
  );

  readonly whatsappConciergeHref = computed(() => {
    const term = this.searchedTerm();
    const message = term
      ? `Olá! Estava explorando os lançamentos em BH (${term}) e gostaria de conversar sobre opções com esse perfil.`
      : 'Olá! Estava explorando o catálogo de lançamentos em BH e gostaria de ajuda para encontrar o perfil ideal para mim.';
    return buildWhatsAppUrl(message);
  });

  readonly matchedBairroGuide = computed<BairroGuide | null>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) {
      return null;
    }
    return (
      BAIRROS_BH.find(
        (bairro) =>
          bairro.nome.toLowerCase() === q ||
          bairro.slug === q ||
          bairro.matchBairros.some((match) => match.toLowerCase() === q)
      ) ?? null
    );
  });

  private readonly searchBarRef =
    viewChild<M3SearchBarComponent>('searchBarRef');
  private readonly filtersContainerRef =
    viewChild<ElementRef<HTMLElement>>('filtersContainerRef');

  constructor() {
    // Sync initial query params synchronously so SSR and prerendered HTML filter immediately.
    const initialMap = this.route.snapshot.queryParamMap;
    const initialQ = (initialMap.get('q') ?? initialMap.get('bairro') ?? '').trim();
    const initialTipologia = (initialMap.get('tipologia') ?? '').trim() || 'Todas';
    const initialObjetivo = (initialMap.get('objetivo') ?? '').trim() || null;
    this.lancamentosService.setSearchQuery(initialQ);
    this.lancamentosService.setTipologiaFilter(initialTipologia);
    this.lancamentosService.setObjetivoFilter(initialObjetivo);
    this.searchInput.set(initialQ);

    effect(() => {
      const map = this.queryParamMap();
      const q = (map.get('q') ?? map.get('bairro') ?? '').trim();
      const tipologia = (map.get('tipologia') ?? '').trim() || 'Todas';
      const objetivo = (map.get('objetivo') ?? '').trim() || null;
      this.lancamentosService.setSearchQuery(q);
      this.lancamentosService.setTipologiaFilter(tipologia);
      this.lancamentosService.setObjetivoFilter(objetivo);
      this.searchInput.set(q);
    });
  }

  dropdownTriggerClass(active: boolean, open: boolean): string {
    const base =
      'terraco-m3-chip inline-flex min-h-[44px] items-center gap-2 border px-4 py-1.5 text-[13px] cursor-pointer sm:min-h-[42px]';
    if (open) {
      return `${base} terraco-m3-chip--active border-brand bg-elevated font-medium text-brand shadow-card`;
    }
    if (active) {
      return `${base} terraco-m3-chip--active border-brand/35 bg-[#E5F2EC] font-medium text-[#1F6F50]`;
    }
    return `${base} border-border-subtle bg-surface/80 font-medium text-ink hover:border-border-strong hover:bg-surface`;
  }

  dropdownOptionClass(selected: boolean): string {
    return selected
      ? 'flex min-h-[44px] w-full items-center justify-between gap-3 rounded-[14px] bg-[#E5F2EC] px-3 py-2 text-left text-[13px] font-medium text-[#1F6F50] transition-[background-color,color,transform] duration-150 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 cursor-pointer sm:min-h-[38px]'
      : 'flex min-h-[44px] w-full items-center justify-between gap-3 rounded-[14px] px-3 py-2 text-left text-[13px] font-normal text-ink transition-[background-color,color,transform] duration-150 hover:bg-surface/70 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 cursor-pointer sm:min-h-[38px]';
  }

  chevronClass(open: boolean): string {
    return `h-4 w-4 shrink-0 transition-transform duration-150 motion-reduce:transition-none ${
      open ? 'rotate-180' : ''
    }`;
  }

  toggleNeighborhoodMenu(event: Event): void {
    event.stopPropagation();
    this.tipologiaMenuOpen.set(false);
    this.neighborhoodMenuOpen.update((open) => !open);
  }

  toggleTipologiaMenu(event: Event): void {
    event.stopPropagation();
    this.neighborhoodMenuOpen.set(false);
    this.tipologiaMenuOpen.update((open) => !open);
  }

  closeMenus(): void {
    this.neighborhoodMenuOpen.set(false);
    this.tipologiaMenuOpen.set(false);
  }

  onDocumentClick(event: Event): void {
    const container = this.filtersContainerRef()?.nativeElement;
    const target = event.target as Node | null;
    if (container && target && !container.contains(target)) {
      this.closeMenus();
    }
  }

  readonly selectedNeighborhoodValue = computed<string[]>(() => {
    const active = this.quickNeighborhoods().find((bairro) =>
      this.isNeighborhoodActive(bairro)
    );
    return [active ?? 'Todos'];
  });

  readonly selectedTipologiaValue = computed<string[]>(() => [
    this.tipologiaFilter().trim() || 'Todas',
  ]);

  onNeighborhoodListboxChange(values: readonly string[]): void {
    const next = values[0];
    if (next) {
      this.selectNeighborhoodOption(next);
    }
  }

  onTipologiaListboxChange(values: readonly string[]): void {
    const next = values[0];
    if (next) {
      this.selectTipologiaOption(next);
    }
  }

  selectNeighborhoodOption(bairro: string): void {
    this.closeMenus();
    if (bairro === 'Todos') {
      this.searchInput.set('');
      this.lancamentosService.setActiveFilter('Todos');
      this.lancamentosService.setSearchQuery('');
      this.syncQueryParams({ q: '' });
      return;
    }
    this.selectNeighborhood(bairro);
  }

  selectTipologiaOption(tipologia: string): void {
    this.closeMenus();
    this.selectTipologia(tipologia);
  }

  onSearchValueChange(value: string): void {
    this.searchInput.set(value);
    this.lancamentosService.setSearchQuery(value);
  }

  onSearchSubmitted(term: string): void {
    const trimmed = term.trim();
    this.searchInput.set(trimmed);
    this.lancamentosService.setActiveFilter('Todos');
    this.lancamentosService.setSearchQuery(trimmed);
    this.syncQueryParams({ q: trimmed });
  }

  selectNeighborhood(bairro: string): void {
    this.lancamentosService.setActiveFilter('Todos');
    this.lancamentosService.setSearchQuery(bairro);
    this.searchInput.set(bairro);
    this.syncQueryParams({ q: bairro });
  }

  selectTipologia(tipologia: string): void {
    const next = tipologia.trim() || 'Todas';
    this.lancamentosService.setTipologiaFilter(next);
    this.syncQueryParams({ tipologia: next === 'Todas' ? '' : next });
  }

  clearObjetivo(): void {
    this.lancamentosService.setObjetivoFilter(null);
    this.syncQueryParams({ objetivo: '' });
  }

  isNeighborhoodActive(bairro: string): boolean {
    return (
      this.searchQuery().trim().toLowerCase() === bairro.trim().toLowerCase()
    );
  }

  isTipologiaActive(tipologia: string): boolean {
    return (
      this.tipologiaFilter().trim().toLowerCase() ===
      tipologia.trim().toLowerCase()
    );
  }

  clearFilters(): void {
    this.searchInput.set('');
    this.lancamentosService.setSearchQuery('');
    this.lancamentosService.setActiveFilter('Todos');
    this.lancamentosService.setTipologiaFilter('Todas');
    this.lancamentosService.setObjetivoFilter(null);
    this.syncQueryParams({ q: '', bairro: '', tipologia: '', objetivo: '' });
    this.searchBarRef()?.focusInput();
  }

  private syncQueryParams(updates: {
    q?: string;
    bairro?: string;
    tipologia?: string;
    objetivo?: string;
  }): void {
    const queryParams: Record<string, string | null> = {};
    if ('q' in updates) {
      queryParams['q'] = updates.q || null;
      queryParams['bairro'] = null;
    }
    if ('bairro' in updates) {
      queryParams['bairro'] = updates.bairro || null;
    }
    if ('tipologia' in updates) {
      queryParams['tipologia'] = updates.tipologia || null;
    }
    if ('objetivo' in updates) {
      queryParams['objetivo'] = updates.objetivo || null;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
