import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { LancamentosService, normalizeSearchText } from '../../core';

interface NeighborhoodSuggestion {
  readonly name: string;
  readonly count: number;
  readonly prefix: string;
  readonly match: string;
  readonly suffix: string;
}

function splitHighlight(
  text: string,
  normalizedQuery: string
): { prefix: string; match: string; suffix: string } {
  if (!normalizedQuery) {
    return { prefix: text, match: '', suffix: '' };
  }

  // Build accent-stripped index map back to original string positions.
  const chars = Array.from(text);
  let normalized = '';
  const indexMap: number[] = [];

  for (let i = 0; i < chars.length; i++) {
    const stripped = normalizeSearchText(chars[i]);
    for (let j = 0; j < stripped.length; j++) {
      normalized += stripped[j];
      indexMap.push(i);
    }
  }

  const matchStart = normalized.indexOf(normalizedQuery);
  if (matchStart === -1) {
    return { prefix: text, match: '', suffix: '' };
  }

  const origStart = indexMap[matchStart];
  const origEnd = indexMap[matchStart + normalizedQuery.length - 1] + 1;

  return {
    prefix: chars.slice(0, origStart).join(''),
    match: chars.slice(origStart, origEnd).join(''),
    suffix: chars.slice(origEnd).join(''),
  };
}

@Component({
  selector: 'app-m3-search-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block relative z-20',
    '[class.z-40]': 'isDropdownVisible()',
    style: 'view-transition-name: terraco-search-bar',
    '(document:click)': 'onDocumentClick($event)',
  },
  template: `
    <div #containerRef class="relative w-full">
      <form
        (submit)="handleSubmit($event)"
        role="search"
        toolname="search_launches"
        tooldescription="Busca lançamentos imobiliários em Belo Horizonte por bairro, nome do empreendimento ou tipologia."
        toolautosubmit
        [attr.aria-label]="ariaLabel()"
        [class]="barClasses()"
      >
        <label [attr.for]="inputId()" class="sr-only">
          {{ labelText() }}
        </label>

        <!-- Leading Search Icon (M3 Expressive) -->
        <span
          aria-hidden="true"
          [class]="
            isFocused() || query().length > 0
              ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-brand transition-colors duration-150'
              : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors duration-150'
          "
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.9"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-[19px] w-[19px]"
          >
            <circle cx="11" cy="11" r="7.5" />
            <path d="m20 20-3.8-3.8" />
          </svg>
        </span>

        <input
          #inputRef
          [id]="inputId()"
          name="q"
          type="search"
          toolparamdescription="Nome do bairro em BH (ex: Estoril, Buritis, Santa Efigênia, Serrano), nome do lançamento ou tipologia (ex: 2 quartos)."
          role="combobox"
          autocomplete="off"
          aria-autocomplete="list"
          [attr.aria-expanded]="isDropdownVisible()"
          [attr.aria-controls]="listboxId()"
          [attr.aria-activedescendant]="activeOptionId()"
          enterkeyhint="search"
          [value]="query()"
          (focus)="onFocus()"
          (blur)="onBlur()"
          (input)="onInput($event)"
          (keydown)="onKeydown($event)"
          [placeholder]="placeholder()"
          class="w-full min-w-0 bg-transparent py-2.5 pr-1 text-[15px] font-normal text-[#1C1B19] placeholder:text-[#5C5852] !outline-none focus:!outline-none focus:ring-0 focus-visible:!outline-none sm:text-base [&::-webkit-search-cancel-button]:hidden"
        />

        @if (query().length > 0) {
          <button
            type="button"
            (mousedown)="$event.preventDefault()"
            (click)="handleClear()"
            aria-label="Limpar busca"
            animate.enter="terraco-chip-enter"
            animate.leave="terraco-chip-leave"
            class="terraco-m3-icon-btn inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#F3EFE6] text-[#5C5852] hover:bg-[#EAE3D5] hover:text-[#1C1B19] active:scale-[0.94] motion-reduce:transition-none motion-reduce:active:scale-100 sm:h-9 sm:w-9"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              stroke-width="1.85"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-4 w-4"
            >
              <path d="M15 5 5 15" />
              <path d="m5 5 10 10" />
            </svg>
          </button>
        }

        <button
          type="submit"
          [class]="submitButtonClasses()"
        >
          <span>{{ submitLabel() }}</span>
          @if (submitSuffix()) {
            <span class="hidden sm:inline">&nbsp;{{ submitSuffix() }}</span>
          }
        </button>
      </form>

      @if (isDropdownVisible()) {
        <div
          animate.enter="terraco-dropdown-panel-enter"
          animate.leave="terraco-dropdown-panel-leave"
          class="origin-top absolute inset-x-0 top-full z-40 mt-1.5 overflow-hidden rounded-[24px] border border-[#1C1B19]/10 bg-[#FAF8F4] p-2 shadow-floating"
        >
          <p
            class="rounded-[14px] px-3 pt-1 pb-1.5 text-[13px] font-medium text-[#5C5852]"
          >
            Bairros com lançamentos
          </p>

          <ul
            [id]="listboxId()"
            role="listbox"
            aria-label="Bairros sugeridos"
            class="space-y-1"
          >
            @for (item of matchingNeighborhoods(); track item.name; let i = $index) {
              @let isActive = activeIndex() === i;
              <li
                [id]="optionId(i)"
                role="option"
                [attr.aria-selected]="isActive"
                (mousedown)="$event.preventDefault()"
                (mouseenter)="setActiveIndex(i)"
                (click)="selectNeighborhood(item.name)"
                [class]="
                  isActive
                    ? 'flex min-h-[48px] cursor-pointer items-center justify-between gap-3 rounded-[14px] bg-[#F3EFE6] px-3 py-2 text-[#1C1B19] transition-colors duration-150 motion-reduce:transition-none'
                    : 'flex min-h-[48px] cursor-pointer items-center justify-between gap-3 rounded-[14px] px-3 py-2 text-[#1C1B19] transition-colors duration-150 hover:bg-[#F3EFE6] motion-reduce:transition-none'
                "
              >
                <span class="flex min-w-0 items-center gap-3">
                  <span
                    aria-hidden="true"
                    [class]="
                      isActive
                        ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FDECE5] text-[#F06A36] transition-colors duration-150 motion-reduce:transition-none'
                        : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5F2EC] text-[#1F6F50] transition-colors duration-150 motion-reduce:transition-none'
                    "
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="h-4 w-4"
                    >
                      <path
                        d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
                      />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>

                  <span class="truncate text-[14px] leading-[1.35]">
                    @if (item.match) {
                      <span class="font-normal text-[#1C1B19]">{{ item.prefix }}</span
                      ><span class="font-medium text-[#C84B1B]">{{ item.match }}</span
                      ><span class="font-normal text-[#1C1B19]">{{ item.suffix }}</span>
                    } @else {
                      <span class="font-normal text-[#1C1B19]">{{ item.name }}</span>
                    }
                  </span>
                </span>

                <span
                  [class]="
                    isActive
                      ? 'shrink-0 rounded-pill bg-[#E5F2EC] px-2.5 py-0.5 text-[12px] font-medium text-[#1F6F50] tabular-nums transition-colors duration-150 motion-reduce:transition-none'
                      : 'shrink-0 rounded-pill bg-[#F3EFE6] px-2.5 py-0.5 text-[12px] font-medium text-[#1C1B19] tabular-nums transition-colors duration-150 motion-reduce:transition-none'
                  "
                >
                  {{ item.count }}
                  {{ item.count === 1 ? 'lançamento' : 'lançamentos' }}
                </span>
              </li>
            }
          </ul>
        </div>
      }
    </div>
  `,
})
export class M3SearchBarComponent {
  private readonly lancamentosService = inject(LancamentosService);

  readonly inputId = input<string>('terraco-search');
  readonly ariaLabel = input<string>('Buscar lançamentos');
  readonly labelText = input<string>('Buscar por bairro ou lançamento');
  readonly placeholder = input<string>('Bairro ou lançamento');
  readonly submitLabel = input<string>('Explorar');
  readonly submitSuffix = input<string>('');
  readonly value = input<string>('');
  readonly size = input<'hero' | 'compact'>('hero');

  readonly valueChange = output<string>();
  readonly submitted = output<string>();
  readonly neighborhoodSelected = output<string>();
  readonly cleared = output<void>();

  private readonly containerRef =
    viewChild<ElementRef<HTMLElement>>('containerRef');
  private readonly inputRef =
    viewChild<ElementRef<HTMLInputElement>>('inputRef');

  readonly query = linkedSignal(() => this.value());
  readonly isFocused = signal<boolean>(false);
  readonly isDismissed = signal<boolean>(false);
  readonly activeIndex = signal<number>(-1);

  readonly listboxId = computed(() => `${this.inputId()}-neighborhoods-listbox`);

  /** Unique neighborhoods extracted live from available launches with counts. */
  private readonly availableNeighborhoods = computed<
    readonly { readonly name: string; readonly count: number }[]
  >(() => {
    const counts = new Map<string, { name: string; count: number }>();
    for (const launch of this.lancamentosService.lancamentos()) {
      const name = launch.bairro.trim();
      if (!name) continue;
      const key = normalizeSearchText(name);
      const existing = counts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(key, { name, count: 1 });
      }
    }
    return Array.from(counts.values());
  });

  readonly matchingNeighborhoods = computed<readonly NeighborhoodSuggestion[]>(
    () => {
      const normalized = normalizeSearchText(this.query());
      if (!normalized) {
        return [];
      }

      return this.availableNeighborhoods()
        .filter((entry) => normalizeSearchText(entry.name).includes(normalized))
        .sort((a, b) => {
          const aStarts = normalizeSearchText(a.name).startsWith(normalized)
            ? 0
            : 1;
          const bStarts = normalizeSearchText(b.name).startsWith(normalized)
            ? 0
            : 1;
          if (aStarts !== bStarts) return aStarts - bStarts;
          return a.name.localeCompare(b.name, 'pt-BR');
        })
        .map((entry) => ({
          name: entry.name,
          count: entry.count,
          ...splitHighlight(entry.name, normalized),
        }));
    }
  );

  readonly isDropdownVisible = computed(
    () =>
      this.isFocused() &&
      !this.isDismissed() &&
      this.matchingNeighborhoods().length > 0
  );

  readonly activeOptionId = computed<string | null>(() => {
    if (!this.isDropdownVisible()) return null;
    const idx = this.activeIndex();
    if (idx < 0 || idx >= this.matchingNeighborhoods().length) {
      return null;
    }
    return this.optionId(idx);
  });

  readonly barClasses = computed(() => {
    const open = this.isDropdownVisible();
    const isHero = this.size() === 'hero';
    const padding = isHero ? 'p-1.5 pl-2.5' : 'p-1.5 pl-2';
    const openState = open
      ? 'terraco-m3-search--open border-[#F06A36]/60 ring-2 ring-[#F06A36]/35 shadow-floating'
      : 'border-[#1C1B19]/10 shadow-chip hover:border-[#1C1B19]/22 focus-within:border-[#F06A36]/60 focus-within:ring-2 focus-within:ring-[#F06A36]/35 focus-within:shadow-card';

    return `terraco-m3-search flex w-full items-center gap-1.5 border bg-[#FAF8F4] ${padding} ${openState}`;
  });

  readonly submitButtonClasses = computed(() => {
    const isHero = this.size() === 'hero';
    return isHero
      ? 'terraco-btn inline-flex min-h-[44px] shrink-0 cursor-pointer items-center justify-center rounded-pill bg-action px-5 py-2.5 text-[14px] font-medium leading-[1.35] text-white hover:bg-action-hover sm:px-6'
      : 'terraco-btn inline-flex min-h-[44px] shrink-0 cursor-pointer items-center justify-center rounded-pill bg-action px-5 py-2 text-[14px] font-medium leading-[1.35] text-white hover:bg-action-hover sm:min-h-[40px]';
  });

  optionId(index: number): string {
    return `${this.inputId()}-option-${index}`;
  }

  focusInput(): void {
    this.inputRef()?.nativeElement.focus();
  }

  onFocus(): void {
    this.isFocused.set(true);
    this.isDismissed.set(false);
  }

  onBlur(): void {
    this.isFocused.set(false);
    this.activeIndex.set(-1);
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const nextValue = target?.value ?? '';
    this.query.set(nextValue);
    this.isDismissed.set(false);
    this.activeIndex.set(-1);
    this.valueChange.emit(nextValue);
  }

  onKeydown(event: KeyboardEvent): void {
    const options = this.matchingNeighborhoods();
    const open = this.isDropdownVisible();

    if (event.key === 'Escape') {
      if (open) {
        event.preventDefault();
        this.isDismissed.set(true);
        this.activeIndex.set(-1);
      }
      return;
    }

    if (!open || options.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.update((idx) => (idx + 1) % options.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.update((idx) =>
        idx <= 0 ? options.length - 1 : idx - 1
      );
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      this.activeIndex.set(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      this.activeIndex.set(options.length - 1);
      return;
    }

    if (event.key === 'Enter' && this.activeIndex() >= 0) {
      const selected = options[this.activeIndex()];
      if (selected) {
        event.preventDefault();
        this.selectNeighborhood(selected.name);
      }
    }
  }

  setActiveIndex(index: number): void {
    this.activeIndex.set(index);
  }

  selectNeighborhood(name: string): void {
    this.query.set(name);
    this.isDismissed.set(true);
    this.activeIndex.set(-1);
    this.valueChange.emit(name);
    this.neighborhoodSelected.emit(name);
  }

  handleSubmit(event: Event): void {
    event.preventDefault();
    const trimmed = this.query().trim();
    this.query.set(trimmed);
    this.isDismissed.set(true);
    this.activeIndex.set(-1);
    this.submitted.emit(trimmed);
  }

  handleClear(): void {
    this.query.set('');
    this.isDismissed.set(false);
    this.activeIndex.set(-1);
    this.valueChange.emit('');
    this.cleared.emit();
    this.focusInput();
  }

  onDocumentClick(event: Event): void {
    const container = this.containerRef()?.nativeElement;
    const target = event.target as Node | null;
    if (container && target && !container.contains(target)) {
      this.isFocused.set(false);
      this.activeIndex.set(-1);
    }
  }
}
