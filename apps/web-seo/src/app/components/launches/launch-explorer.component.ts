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
import {
  LancamentosService,
  LeadsService,
} from '../../core';
import { BAIRROS_BH, type BairroGuide } from '../../core/bairros.data';
import { LaunchCardComponent } from './launch-card.component';
import { LaunchCardSkeletonComponent } from './launch-skeleton.component';

const TIPOLOGIA_FILTERS = [
  'Todas',
  '1 quarto',
  '2 quartos',
  'Garden',
  'Cobertura',
] as const;

function formatBrazilianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

@Component({
  selector: 'app-launch-explorer',
  imports: [RouterLink, LaunchCardComponent, LaunchCardSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'closeMenus()',
  },
  template: `
    <section
      aria-labelledby="lancamentos-heading"
      class="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16"
    >
      <div class="space-y-6">
        <div class="space-y-2.5">
          <h1
            id="lancamentos-heading"
            animate.enter="terraco-reveal"
            class="font-display text-[clamp(1.75rem,3vw,2.25rem)] font-medium leading-[1.12] tracking-[-0.02em] text-ink text-balance"
          >
            Lançamentos
          </h1>
          <p class="max-w-2xl text-[15px] font-normal leading-[1.6] text-ink-muted">
            Compare tipologias, metragens e condições em Belo Horizonte antes de falar com alguém. Salve seus favoritos ou tire dúvidas direto no WhatsApp.
          </p>
        </div>

        @if (!isLoading() || lancamentos().length > 0) {
          <div class="flex flex-col gap-3">
            <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
              <form
                (submit)="handleSearchSubmit($event)"
                role="search"
                aria-label="Filtrar lançamentos"
                class="flex w-full items-center gap-2 rounded-pill border border-border-subtle bg-elevated p-1.5 pl-5 shadow-chip transition-[border-color,box-shadow] duration-150 hover:border-ink/25 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 focus-within:shadow-card lg:max-w-md"
              >
                <label for="explorer-search" class="sr-only">
                  Filtrar por bairro ou lançamento
                </label>
                <input
                  #searchInputRef
                  id="explorer-search"
                  type="search"
                  enterkeyhint="search"
                  [value]="searchInput()"
                  (input)="onSearchInput($event)"
                  placeholder="Bairro ou lançamento"
                  class="w-full min-w-0 bg-transparent py-2 pr-2 text-[15px] font-normal text-ink placeholder:text-ink-muted focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
                />
                @if (searchInput().length > 0) {
                  <button
                    type="button"
                    (click)="clearFilters()"
                    aria-label="Limpar busca"
                    animate.enter="terraco-chip-enter"
                    animate.leave="terraco-chip-leave"
                    class="inline-flex min-h-[40px] shrink-0 items-center rounded-pill px-3 text-sm font-normal text-ink-muted transition-colors duration-150 hover:bg-surface/70 hover:text-ink cursor-pointer"
                  >
                    Limpar
                  </button>
                }
                <button
                  type="submit"
                  class="terraco-btn terraco-btn-moss inline-flex min-h-[40px] shrink-0 items-center justify-center rounded-pill bg-brand px-5 py-2 text-sm font-medium leading-[1.35] text-ink-inverse hover:bg-brand-hover cursor-pointer"
                >
                  Buscar
                </button>
              </form>

              <div
                #filtersContainerRef
                class="flex flex-wrap items-center gap-2.5"
              >
                @if (quickNeighborhoods().length > 0) {
                  <div class="relative">
                    <button
                      type="button"
                      (click)="toggleNeighborhoodMenu($event)"
                      [attr.aria-expanded]="neighborhoodMenuOpen()"
                      aria-haspopup="listbox"
                      aria-controls="bairro-filter-listbox"
                      [class]="dropdownTriggerClass(hasActiveNeighborhood(), neighborhoodMenuOpen())"
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
                        role="listbox"
                        aria-label="Filtrar por bairro"
                        animate.enter="terraco-chip-enter"
                        class="absolute left-0 top-full z-30 mt-2 min-w-[210px] rounded-[20px] border border-border-subtle bg-elevated p-1.5 shadow-card"
                      >
                        <li>
                          <button
                            type="button"
                            role="option"
                            [attr.aria-selected]="!hasActiveNeighborhood()"
                            (click)="selectNeighborhoodOption('Todos')"
                            [class]="dropdownOptionClass(!hasActiveNeighborhood())"
                          >
                            <span>Todos os bairros</span>
                            @if (!hasActiveNeighborhood()) {
                              <span aria-hidden="true" class="text-brand">✓</span>
                            }
                          </button>
                        </li>
                        @for (bairro of quickNeighborhoods(); track bairro) {
                          <li>
                            <button
                              type="button"
                              role="option"
                              [attr.aria-selected]="isNeighborhoodActive(bairro)"
                              (click)="selectNeighborhoodOption(bairro)"
                              [class]="dropdownOptionClass(isNeighborhoodActive(bairro))"
                            >
                              <span>{{ bairro }}</span>
                              @if (isNeighborhoodActive(bairro)) {
                                <span aria-hidden="true" class="text-brand">✓</span>
                              }
                            </button>
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
                    [class]="dropdownTriggerClass(tipologiaFilter() !== 'Todas', tipologiaMenuOpen())"
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
                      role="listbox"
                      aria-label="Filtrar por tipologia"
                      animate.enter="terraco-chip-enter"
                      class="absolute left-0 top-full z-30 mt-2 min-w-[220px] rounded-[20px] border border-border-subtle bg-elevated p-1.5 shadow-card"
                    >
                      @for (tipologia of tipologiaFilters; track tipologia) {
                        <li>
                          <button
                            type="button"
                            role="option"
                            [attr.aria-selected]="isTipologiaActive(tipologia)"
                            (click)="selectTipologiaOption(tipologia)"
                            [class]="dropdownOptionClass(isTipologiaActive(tipologia))"
                          >
                            <span>{{ tipologia === 'Todas' ? 'Todas as tipologias' : tipologia }}</span>
                            @if (isTipologiaActive(tipologia)) {
                              <span aria-hidden="true" class="text-brand">✓</span>
                            }
                          </button>
                        </li>
                      }
                    </ul>
                  }
                </div>

                @if (objetivoFilter(); as objetivo) {
                  <button
                    type="button"
                    (click)="clearObjetivo()"
                    [attr.aria-label]="'Remover filtro de objetivo ' + objetivo"
                    class="inline-flex min-h-[40px] items-center gap-1.5 rounded-pill border border-border-subtle bg-surface px-4 py-1.5 text-[13px] font-normal text-ink transition-colors duration-150 hover:border-ink/25 cursor-pointer"
                  >
                    <span>Objetivo: {{ objetivo }}</span>
                    <span aria-hidden="true" class="text-ink-muted">×</span>
                  </button>
                }
              </div>
            </div>

            @if (matchedBairroGuide(); as bairroGuide) {
              <p class="text-[14px] font-normal leading-[1.5] text-ink-muted">
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
        }
      </div>

      @if (isLoading() && lancamentos().length === 0) {
        <div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <app-launch-card-skeleton />
        </div>
      } @else if (filteredLancamentos().length > 0) {
        <div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          @for (launch of filteredLancamentos(); track launch.slug) {
            <app-launch-card
              [launch]="launch"
              headingLevel="h2"
              [priority]="$index < 3"
              [cardId]="$first ? 'resultados-lancamentos' : null"
            />
          }
        </div>

        <aside
          aria-label="Alerta de novos lançamentos"
          class="mt-12 rounded-lg border border-border-subtle bg-elevated p-6 shadow-card sm:p-8"
        >
          <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div class="max-w-xl space-y-1.5">
              <h2
                class="font-display text-[1.25rem] font-medium leading-[1.2] tracking-[-0.015em] text-ink text-balance"
              >
                Procurando outro bairro ou perfil em BH?
              </h2>
              <p class="text-[14px] font-normal leading-[1.55] text-ink-muted">
                Deixe seu WhatsApp para receber novos lançamentos compatíveis com o que você busca, sem pressão comercial.
              </p>
            </div>

            @if (demandSuccessTerm()) {
              <div
                role="status"
                class="rounded-md border border-success-fg/20 bg-success-bg px-4 py-3 text-[14px] font-normal leading-[1.5] text-success-fg"
              >
                Combinado! Assim que entrar um novo lançamento para {{ demandSuccessTerm() }}, te chamamos no WhatsApp.
              </div>
            } @else {
              <form
                (submit)="handleDemandSubmit($event)"
                novalidate
                class="flex w-full max-w-md flex-col gap-2.5 sm:flex-row sm:items-center"
              >
                <label for="catalog-alert-whatsapp" class="sr-only">
                  Seu WhatsApp com DDD
                </label>
                <input
                  id="catalog-alert-whatsapp"
                  type="tel"
                  autocomplete="tel"
                  inputmode="tel"
                  placeholder="(31) 99999-9999"
                  [value]="demandPhone()"
                  (input)="onDemandPhoneInput($event)"
                  [disabled]="demandSubmitting()"
                  class="min-h-[44px] w-full min-w-0 flex-1 rounded-pill border border-border-subtle bg-canvas px-4 py-2.5 text-[15px] font-normal text-ink placeholder:text-ink-muted transition-[border-color,box-shadow] duration-150 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 disabled:opacity-60"
                />
                <button
                  type="submit"
                  [disabled]="demandSubmitting()"
                  class="terraco-btn terraco-btn-moss inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-pill bg-brand px-5 py-2.5 text-[14px] font-medium leading-[1.35] text-ink-inverse hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  @if (demandSubmitting()) {
                    Enviando...
                  } @else {
                    Me avise no WhatsApp
                  }
                </button>
              </form>
            }
          </div>

          @if (demandError() && !demandSuccessTerm()) {
            <p
              role="alert"
              class="mt-3 rounded-sm bg-error-bg px-3.5 py-2 text-[13px] font-normal text-error-fg"
            >
              {{ demandError() }}
            </p>
          }
        </aside>
      } @else if (!isLoading()) {
        <div
          id="resultados-lancamentos"
          animate.enter="terraco-reveal"
          class="mt-8 max-w-xl rounded-lg border border-border-subtle bg-elevated p-6 shadow-card sm:p-8"
        >
          <h2
            class="font-display text-[1.375rem] font-medium leading-[1.2] tracking-[-0.015em] text-ink text-balance"
          >
            @if (searchedTerm()) {
              Ainda não temos lançamentos em "{{ searchedTerm() }}" por aqui
            } @else {
              Nenhum lançamento encontrado
            }
          </h2>

          <p class="mt-2.5 text-[15px] font-normal leading-[1.55] text-ink-muted">
            Deixe seu WhatsApp que te avisamos assim que surgir uma boa oportunidade nessa região, sem spam.
          </p>

          @if (demandSuccessTerm()) {
            <div
              role="status"
              class="mt-5 rounded-md border border-success-fg/20 bg-success-bg px-4 py-3.5 text-[14px] font-normal leading-[1.5] text-success-fg"
            >
              @if (demandSuccessTerm() === 'essa região') {
                Combinado! Assim que entrar um novo lançamento por aqui, te chamamos no WhatsApp.
              } @else {
                Combinado! Assim que entrar um lançamento em {{ demandSuccessTerm() }}, te chamamos no WhatsApp.
              }
            </div>
          } @else {
            <form
              (submit)="handleDemandSubmit($event)"
              novalidate
              class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <label for="demand-whatsapp" class="sr-only">
                Seu WhatsApp com DDD
              </label>
              <input
                id="demand-whatsapp"
                type="tel"
                autocomplete="tel"
                inputmode="tel"
                placeholder="(31) 99999-9999"
                [value]="demandPhone()"
                (input)="onDemandPhoneInput($event)"
                [disabled]="demandSubmitting()"
                class="min-h-[44px] w-full min-w-0 flex-1 rounded-pill border border-border-subtle bg-canvas px-4 py-2.5 text-[15px] font-normal text-ink placeholder:text-ink-muted transition-[border-color,box-shadow] duration-150 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 disabled:opacity-60"
              />
              <button
                type="submit"
                [disabled]="demandSubmitting()"
                class="terraco-btn terraco-btn-moss inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-pill bg-brand px-5 py-2.5 text-[14px] font-medium leading-[1.35] text-ink-inverse hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                @if (demandSubmitting()) {
                  Enviando...
                } @else {
                  Me avise no WhatsApp
                }
              </button>
            </form>

            @if (demandError()) {
              <p
                role="alert"
                class="mt-3 rounded-sm bg-error-bg px-3.5 py-2 text-[13px] font-normal text-error-fg"
              >
                {{ demandError() }}
              </p>
            }
          }

          <div class="mt-6 border-t border-border-subtle pt-4">
            <button
              type="button"
              (click)="clearFilters()"
              class="inline-flex min-h-[40px] items-center rounded-pill px-1 text-[14px] font-medium text-brand transition-colors duration-150 hover:text-brand-hover cursor-pointer"
            >
              Ver todos os lançamentos
            </button>
          </div>
        </div>
      }

      <nav
        aria-label="Guias de bairros em BH"
        class="mt-10 flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-border-subtle pt-6 text-sm"
      >
        <span class="font-medium text-ink">Guias de bairros em BH</span>
        @for (guide of bairrosGuides; track guide.slug) {
          <a
            [routerLink]="['/bairros', guide.slug]"
            class="terraco-link-underline inline-flex min-h-[40px] items-center font-normal text-ink-muted transition-colors duration-150 hover:text-ink focus-visible:text-ink"
          >
            {{ guide.nome }}
          </a>
        }
      </nav>
    </section>
  `,
})
export class LaunchExplorerComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly lancamentosService = inject(LancamentosService);
  private readonly leadsService = inject(LeadsService);

  readonly lancamentos = this.lancamentosService.lancamentos;
  readonly filteredLancamentos = this.lancamentosService.filteredLancamentos;
  readonly quickNeighborhoods = this.lancamentosService.quickNeighborhoods;
  readonly searchQuery = this.lancamentosService.searchQuery;
  readonly activeFilter = this.lancamentosService.activeFilter;
  readonly tipologiaFilter = this.lancamentosService.tipologiaFilter;
  readonly isLoading = this.lancamentosService.isLoadingList;
  readonly tipologiaFilters = TIPOLOGIA_FILTERS;
  readonly bairrosGuides = BAIRROS_BH;

  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  readonly searchInput = signal<string>('');
  readonly objetivoFilter = signal<string | null>(null);
  readonly neighborhoodMenuOpen = signal<boolean>(false);
  readonly tipologiaMenuOpen = signal<boolean>(false);
  readonly demandPhone = signal<string>('');
  readonly demandSubmitting = signal<boolean>(false);
  readonly demandError = signal<string | null>(null);
  readonly demandSuccessTerm = signal<string | null>(null);

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

  readonly isAllActive = computed(
    () =>
      this.searchQuery().trim().length === 0 &&
      this.activeFilter() === 'Todos' &&
      this.tipologiaFilter() === 'Todas'
  );

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

  private readonly searchInputRef =
    viewChild<ElementRef<HTMLInputElement>>('searchInputRef');
  private readonly filtersContainerRef =
    viewChild<ElementRef<HTMLElement>>('filtersContainerRef');

  constructor() {
    // Sync initial query params synchronously so SSR and prerendered HTML filter immediately.
    const initialMap = this.route.snapshot.queryParamMap;
    const initialQ = (initialMap.get('q') ?? '').trim();
    const initialTipologia = (initialMap.get('tipologia') ?? '').trim() || 'Todas';
    const initialObjetivo = (initialMap.get('objetivo') ?? '').trim() || null;
    this.lancamentosService.setSearchQuery(initialQ);
    this.lancamentosService.setTipologiaFilter(initialTipologia);
    this.objetivoFilter.set(initialObjetivo);
    this.searchInput.set(initialQ);

    effect(() => {
      const map = this.queryParamMap();
      const q = (map.get('q') ?? '').trim();
      const tipologia = (map.get('tipologia') ?? '').trim() || 'Todas';
      const objetivo = (map.get('objetivo') ?? '').trim() || null;
      this.lancamentosService.setSearchQuery(q);
      this.lancamentosService.setTipologiaFilter(tipologia);
      this.objetivoFilter.set(objetivo);
      this.searchInput.set(q);
      this.demandSuccessTerm.set(null);
      this.demandError.set(null);
    });
  }

  dropdownTriggerClass(active: boolean, open: boolean): string {
    const base =
      'inline-flex min-h-[42px] items-center gap-2 rounded-pill border px-4 py-1.5 text-[13px] transition-[border-color,background-color,box-shadow] duration-150 cursor-pointer';
    if (open) {
      return `${base} border-brand bg-elevated font-medium text-brand shadow-card`;
    }
    if (active) {
      return `${base} border-brand bg-brand/10 font-medium text-brand`;
    }
    return `${base} border-border-subtle bg-elevated font-medium text-ink hover:border-ink/25 hover:bg-surface/60`;
  }

  dropdownOptionClass(selected: boolean): string {
    return selected
      ? 'flex w-full items-center justify-between gap-3 rounded-[14px] bg-brand/10 px-3 py-2 text-left text-[13px] font-medium text-brand transition-colors duration-150 cursor-pointer'
      : 'flex w-full items-center justify-between gap-3 rounded-[14px] px-3 py-2 text-left text-[13px] font-normal text-ink transition-colors duration-150 hover:bg-surface/70 cursor-pointer';
  }

  chevronClass(open: boolean): string {
    return `h-4 w-4 shrink-0 transition-transform duration-150 ${
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

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const value = target?.value ?? '';
    this.searchInput.set(value);
    this.lancamentosService.setSearchQuery(value);
    this.demandSuccessTerm.set(null);
    this.demandError.set(null);
  }

  handleSearchSubmit(event: Event): void {
    event.preventDefault();
    const trimmed = this.searchInput().trim();
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
    const next =
      this.tipologiaFilter().toLowerCase() === tipologia.toLowerCase() &&
      tipologia !== 'Todas'
        ? 'Todas'
        : tipologia;
    this.lancamentosService.setTipologiaFilter(next);
    this.syncQueryParams({ tipologia: next === 'Todas' ? '' : next });
  }

  clearObjetivo(): void {
    this.objetivoFilter.set(null);
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
    this.objetivoFilter.set(null);
    this.demandSuccessTerm.set(null);
    this.demandError.set(null);
    this.syncQueryParams({ q: '', tipologia: '', objetivo: '' });
    this.searchInputRef()?.nativeElement.focus();
  }

  onDemandPhoneInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const formatted = formatBrazilianPhone(target?.value ?? '');
    this.demandPhone.set(formatted);
    if (target && target.value !== formatted) {
      target.value = formatted;
    }
    if (this.demandError()) {
      this.demandError.set(null);
    }
  }

  async handleDemandSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.demandSubmitting()) {
      return;
    }

    const phone = this.demandPhone().trim();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      this.demandError.set(
        'Informe um WhatsApp válido com DDD (ex: (31) 99999-9999).'
      );
      return;
    }

    const term = this.searchedTerm();
    this.demandSubmitting.set(true);
    this.demandError.set(null);

    try {
      await this.leadsService.captureDemandLead({
        phone,
        searchedTerm: term || 'Belo Horizonte',
      });
      this.demandSuccessTerm.set(term || 'essa região');
      this.demandPhone.set('');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar seu WhatsApp agora. Tente novamente.';
      this.demandError.set(message);
    } finally {
      this.demandSubmitting.set(false);
    }
  }

  private syncQueryParams(updates: {
    q?: string;
    tipologia?: string;
    objetivo?: string;
  }): void {
    const queryParams: Record<string, string | null> = {};
    if ('q' in updates) {
      queryParams['q'] = updates.q || null;
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
