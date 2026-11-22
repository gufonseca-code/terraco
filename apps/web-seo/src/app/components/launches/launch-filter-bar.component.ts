import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  output,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-launch-filter-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
  template: `
    <div class="space-y-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form
          (submit)="handleSubmit($event)"
          role="search"
          aria-label="Filtrar lançamentos"
          class="flex w-full max-w-lg items-center gap-2 rounded-pill border border-border-subtle bg-elevated p-1.5 pl-5 shadow-chip transition-[border-color,box-shadow] duration-150 hover:border-ink/25 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 focus-within:shadow-card"
        >
          <label for="lancamentos-search" class="sr-only">
            Buscar por bairro, lançamento ou tipologia
          </label>
          <input
            #searchInput
            id="lancamentos-search"
            type="search"
            enterkeyhint="search"
            list="lancamentos-sugestoes"
            [value]="query()"
            (input)="onInput($event)"
            placeholder="Bairro, lançamento ou tipologia"
            class="w-full min-w-0 bg-transparent py-2 pr-2 text-[15px] font-normal text-ink placeholder:text-ink-muted focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
          />

          @if (query().length > 0) {
            <button
              type="button"
              (click)="handleClearQuery()"
              aria-label="Limpar busca"
              animate.enter="terraco-chip-enter"
              animate.leave="terraco-chip-leave"
              class="inline-flex min-h-[38px] shrink-0 items-center rounded-pill px-3 text-sm font-normal text-ink-muted transition-colors duration-150 hover:bg-surface/70 hover:text-ink cursor-pointer"
            >
              Limpar
            </button>
          }

          <datalist id="lancamentos-sugestoes">
            @for (suggestion of suggestions(); track suggestion) {
              <option [value]="suggestion"></option>
            }
          </datalist>
        </form>

        @if (hasActiveFilters()) {
          <div class="flex items-center gap-3 text-sm font-normal text-ink-muted">
            <span class="tabular-nums">{{ resultsLabel() }}</span>
            <button
              type="button"
              (click)="clear.emit()"
              class="terraco-link-underline inline-flex min-h-[38px] items-center text-[13px] font-medium text-ink transition-colors duration-150 hover:text-brand cursor-pointer"
            >
              Limpar filtros
            </button>
          </div>
        }
      </div>

      @if (filters().length > 1) {
        <div
          role="group"
          aria-label="Filtrar por bairro"
          class="flex flex-wrap items-center gap-2"
        >
          @for (filter of filters(); track filter) {
            <button
              type="button"
              (click)="filterChange.emit(filter)"
              [attr.aria-pressed]="filter === activeFilter()"
              [class]="
                filter === activeFilter()
                  ? 'terraco-btn inline-flex min-h-[38px] items-center rounded-pill border border-brand bg-brand px-4 py-1.5 text-sm font-medium leading-[1.35] text-ink-inverse cursor-pointer'
                  : 'terraco-btn inline-flex min-h-[38px] items-center rounded-pill border border-border-subtle bg-elevated px-4 py-1.5 text-sm font-normal leading-[1.35] text-ink hover:border-ink/25 hover:bg-surface/60 cursor-pointer'
              "
            >
              {{ filter }}
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class LaunchFilterBarComponent {
  readonly query = input<string>('');
  readonly activeFilter = input<string>('Todos');
  readonly filters = input<readonly string[]>(['Todos']);
  readonly suggestions = input<readonly string[]>([]);
  readonly totalCount = input<number>(0);
  readonly filteredCount = input<number>(0);

  readonly queryChange = output<string>();
  readonly filterChange = output<string>();
  readonly clear = output<void>();

  private readonly searchInput =
    viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly hasActiveFilters = computed(
    () => this.query().trim().length > 0 || this.activeFilter() !== 'Todos'
  );

  readonly resultsLabel = computed(() => {
    const filtered = this.filteredCount();
    const total = this.totalCount();
    if (filtered === 1) {
      return `1 de ${total} lançamentos`;
    }
    return `${filtered} de ${total} lançamentos`;
  });

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.queryChange.emit(target?.value ?? '');
  }

  handleSubmit(event: Event): void {
    event.preventDefault();
  }

  handleClearQuery(): void {
    this.queryChange.emit('');
    this.searchInput()?.nativeElement.focus();
  }
}
