import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { LancamentosService } from '../../core';
import { LaunchCardComponent } from './launch-card.component';
import { LaunchFilterBarComponent } from './launch-filter-bar.component';
import { LaunchCardSkeletonComponent } from './launch-skeleton.component';

@Component({
  selector: 'app-launch-explorer',
  imports: [
    LaunchCardComponent,
    LaunchFilterBarComponent,
    LaunchCardSkeletonComponent,
  ],
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

        @if (!isLoading() || totalCount() > 0) {
          <app-launch-filter-bar
            [query]="searchQuery()"
            [activeFilter]="activeFilter()"
            [filters]="availableFilters()"
            [suggestions]="suggestions()"
            [totalCount]="totalCount()"
            [filteredCount]="filteredCount()"
            (queryChange)="onQueryChange($event)"
            (filterChange)="onFilterChange($event)"
            (clear)="onClearFilters()"
          />
        }
      </div>

      @if (isLoading() && totalCount() === 0) {
        <div
          class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8"
        >
          <app-launch-card-skeleton />
          <app-launch-card-skeleton />
        </div>
      } @else if (filteredCount() > 0) {
        <div
          data-testid="lancamentos-grid"
          [class]="gridClass()"
        >
          @for (launch of filteredLancamentos(); track launch.slug) {
            <app-launch-card
              [launch]="launch"
              [priority]="$index < 2"
              [cardId]="$first ? 'resultados-lancamentos' : null"
            />
          }
        </div>
      } @else {
        <div
          id="resultados-lancamentos"
          role="status"
          animate.enter="terraco-reveal"
          class="mt-8 rounded-lg border border-border-subtle bg-elevated px-6 py-10 text-center sm:py-12"
        >
          <h2
            class="font-display text-xl font-medium leading-[1.2] tracking-[-0.015em] text-ink text-balance"
          >
            Nenhum lançamento encontrado
          </h2>
          <p class="mx-auto mt-2 max-w-md text-[15px] font-normal leading-[1.5] text-ink-muted">
            Tente buscar por outro bairro, nome de empreendimento ou limpe os filtros ativos.
          </p>
          @if (hasActiveFilters()) {
            <button
              type="button"
              (click)="onClearFilters()"
              class="terraco-btn terraco-btn-moss mt-6 inline-flex min-h-[44px] items-center justify-center rounded-pill bg-brand px-5 py-2.5 text-sm font-medium leading-[1.35] text-ink-inverse hover:bg-brand-hover cursor-pointer"
            >
              Limpar filtros
            </button>
          }
        </div>
      }
    </section>
  `,
})
export class LaunchExplorerComponent {
  private readonly lancamentosService = inject(LancamentosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly lancamentos = this.lancamentosService.lancamentos;
  readonly filteredLancamentos = this.lancamentosService.filteredLancamentos;
  readonly isLoading = this.lancamentosService.isLoadingList;
  readonly searchQuery = this.lancamentosService.searchQuery;
  readonly activeFilter = this.lancamentosService.activeFilter;
  readonly availableFilters = this.lancamentosService.availableFilters;
  readonly hasActiveFilters = this.lancamentosService.hasActiveFilters;
  readonly suggestions = this.lancamentosService.suggestions;

  readonly totalCount = computed(() => this.lancamentos().length);
  readonly filteredCount = computed(() => this.filteredLancamentos().length);
  readonly gridClass = computed(() =>
    this.filteredCount() >= 3
      ? 'mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8'
      : 'mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8'
  );

  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  constructor() {
    effect(() => {
      const params = this.queryParamMap();
      const urlQuery = params.get('q') ?? '';
      const urlFilter = params.get('filtro') ?? 'Todos';

      untracked(() => {
        if (this.searchQuery() !== urlQuery) {
          this.lancamentosService.setSearchQuery(urlQuery);
        }
        if (this.activeFilter() !== urlFilter) {
          this.lancamentosService.setActiveFilter(urlFilter);
        }
      });
    });
  }

  onQueryChange(query: string): void {
    this.lancamentosService.setSearchQuery(query);
    this.syncUrlParams(query, this.activeFilter());
  }

  onFilterChange(filter: string): void {
    this.lancamentosService.setActiveFilter(filter);
    this.syncUrlParams(this.searchQuery(), filter);
  }

  onClearFilters(): void {
    this.lancamentosService.clearFilters();
    this.syncUrlParams('', 'Todos');
  }

  private syncUrlParams(query: string, filter: string): void {
    const trimmedQuery = query.trim();
    const queryParams: Record<string, string | null> = {
      q: trimmedQuery ? trimmedQuery : null,
      filtro: filter && filter !== 'Todos' ? filter : null,
    };

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
