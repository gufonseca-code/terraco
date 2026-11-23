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
import { ActivatedRoute, Router } from '@angular/router';
import {
  LancamentosService,
  LeadsService,
} from '../../core';
import { LaunchCardComponent } from './launch-card.component';
import { LaunchCardSkeletonComponent } from './launch-skeleton.component';

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
  imports: [LaunchCardComponent, LaunchCardSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      aria-labelledby="lancamentos-heading"
      class="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16"
    >
      <div class="space-y-6">
        <h1
          id="lancamentos-heading"
          animate.enter="terraco-reveal"
          class="font-display text-[clamp(1.75rem,3vw,2.25rem)] font-medium leading-[1.12] tracking-[-0.02em] text-ink text-balance"
        >
          Lançamentos
        </h1>

        @if (!isLoading() || lancamentos().length > 0) {
          <div class="flex flex-col gap-4">
            <form
              (submit)="handleSearchSubmit($event)"
              role="search"
              aria-label="Filtrar lançamentos"
              class="flex items-center gap-2 rounded-pill border border-border-subtle bg-elevated p-1.5 pl-5 max-w-lg shadow-chip transition-[border-color,box-shadow] duration-150 hover:border-ink/25 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 focus-within:shadow-card"
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

            @if (quickNeighborhoods().length > 0) {
              <div
                role="group"
                aria-label="Filtrar por bairro"
                class="flex flex-wrap items-center gap-2"
              >
                <button
                  type="button"
                  (click)="clearFilters()"
                  [attr.aria-pressed]="isAllActive()"
                  [class]="
                    isAllActive()
                      ? 'inline-flex min-h-[38px] items-center rounded-pill border border-brand bg-brand px-4 py-1.5 text-[13px] font-medium text-ink-inverse transition-colors duration-150 cursor-pointer'
                      : 'inline-flex min-h-[38px] items-center rounded-pill border border-border-subtle bg-elevated px-4 py-1.5 text-[13px] font-medium text-ink transition-colors duration-150 hover:border-ink/25 hover:bg-surface/60 cursor-pointer'
                  "
                >
                  Todos
                </button>

                @for (bairro of quickNeighborhoods(); track bairro) {
                  <button
                    type="button"
                    (click)="selectNeighborhood(bairro)"
                    [attr.aria-pressed]="isNeighborhoodActive(bairro)"
                    [class]="
                      isNeighborhoodActive(bairro)
                        ? 'inline-flex min-h-[38px] items-center rounded-pill border border-brand bg-brand px-4 py-1.5 text-[13px] font-medium text-ink-inverse transition-colors duration-150 cursor-pointer'
                        : 'inline-flex min-h-[38px] items-center rounded-pill border border-border-subtle bg-elevated px-4 py-1.5 text-[13px] font-medium text-ink transition-colors duration-150 hover:border-ink/25 hover:bg-surface/60 cursor-pointer'
                    "
                  >
                    {{ bairro }}
                  </button>
                }
              </div>
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
            Deixe seu WhatsApp que te avisamos assim que surgir uma boa oportunidade nessa região — sem spam.
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
  readonly isLoading = this.lancamentosService.isLoadingList;

  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  readonly searchInput = signal<string>('');
  readonly demandPhone = signal<string>('');
  readonly demandSubmitting = signal<boolean>(false);
  readonly demandError = signal<string | null>(null);
  readonly demandSuccessTerm = signal<string | null>(null);

  readonly searchedTerm = computed(() => {
    const q = this.searchQuery().trim();
    if (q) {
      return q;
    }
    const filter = this.activeFilter().trim();
    return filter && filter !== 'Todos' ? filter : '';
  });

  readonly isAllActive = computed(
    () =>
      this.searchQuery().trim().length === 0 &&
      this.activeFilter() === 'Todos'
  );

  private readonly searchInputRef =
    viewChild<ElementRef<HTMLInputElement>>('searchInputRef');

  constructor() {
    // Sync initial ?q= synchronously so SSR and prerendered HTML filter immediately.
    const initialQ = (this.route.snapshot.queryParamMap.get('q') ?? '').trim();
    this.lancamentosService.setSearchQuery(initialQ);
    this.searchInput.set(initialQ);

    effect(() => {
      const q = (this.queryParamMap().get('q') ?? '').trim();
      this.lancamentosService.setSearchQuery(q);
      this.searchInput.set(q);
      this.demandSuccessTerm.set(null);
      this.demandError.set(null);
    });
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
    this.syncQueryParam(trimmed);
  }

  selectNeighborhood(bairro: string): void {
    this.lancamentosService.setActiveFilter('Todos');
    this.lancamentosService.setSearchQuery(bairro);
    this.searchInput.set(bairro);
    this.syncQueryParam(bairro);
  }

  isNeighborhoodActive(bairro: string): boolean {
    return (
      this.searchQuery().trim().toLowerCase() === bairro.trim().toLowerCase()
    );
  }

  clearFilters(): void {
    this.searchInput.set('');
    this.lancamentosService.setSearchQuery('');
    this.lancamentosService.setActiveFilter('Todos');
    this.demandSuccessTerm.set(null);
    this.demandError.set(null);
    this.syncQueryParam('');
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

  private syncQueryParam(q: string): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: q || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
