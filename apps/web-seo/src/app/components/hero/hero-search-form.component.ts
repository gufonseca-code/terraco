import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero-search-form',
  host: {
    class: 'block',
  },
  template: `
    <form
      (submit)="handleSubmit($event)"
      role="search"
      [attr.aria-label]="ariaLabel()"
      class="flex items-center gap-2 rounded-pill border border-border-subtle bg-elevated p-1.5 pl-5 max-w-lg shadow-chip transition-[border-color,box-shadow] duration-150 hover:border-ink/25 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 focus-within:shadow-card"
    >
      <label [attr.for]="inputId()" class="sr-only">
        {{ label() }}
      </label>
      <input
        #inputRef
        [id]="inputId()"
        type="search"
        enterkeyhint="search"
        [attr.list]="datalistId()"
        [value]="query()"
        (input)="onInput($event)"
        [placeholder]="placeholder()"
        class="w-full min-w-0 bg-transparent py-2.5 pr-2 text-base font-normal text-ink placeholder:text-ink-muted focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      @if (query().length > 0) {
        <button
          type="button"
          (click)="handleClear()"
          aria-label="Limpar busca"
          animate.enter="terraco-chip-enter"
          animate.leave="terraco-chip-leave"
          class="inline-flex min-h-[40px] shrink-0 items-center rounded-pill px-3 text-[15px] font-normal text-ink-muted transition-colors duration-150 hover:bg-surface/70 hover:text-ink cursor-pointer"
        >
          Limpar
        </button>
      }
      <button
        type="submit"
        class="terraco-btn terraco-btn-moss inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-pill bg-brand px-5 sm:px-6 py-2.5 text-[15px] font-medium leading-[1.35] text-ink-inverse hover:bg-brand-hover cursor-pointer"
      >
        <span>{{ submitLabel() }}</span>
        @if (submitLabelDesktopSuffix()) {
          <span class="hidden sm:inline">&nbsp;{{ submitLabelDesktopSuffix() }}</span>
        }
      </button>
      <datalist [id]="datalistId()">
        @for (item of suggestions(); track item) {
          <option [value]="item"></option>
        }
      </datalist>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSearchFormComponent {
  private readonly router = inject(Router);

  readonly suggestions = input<string[]>([]);
  readonly initialQuery = input<string>('');
  readonly label = input<string>('Buscar por bairro ou lançamento');
  readonly placeholder = input<string>('Bairro ou lançamento');
  readonly submitLabel = input<string>('Explorar');
  readonly submitLabelDesktopSuffix = input<string>('imóveis');
  readonly ariaLabel = input<string>('Buscar lançamentos');
  readonly inputId = input<string>('hero-search');
  readonly navigateOnSubmit = input<boolean>(false);

  readonly searchSubmit = output<string>();
  readonly queryChange = output<string>();

  readonly query = linkedSignal(() => this.initialQuery());
  readonly datalistId = computed(() => `${this.inputId()}-sugestoes`);
  readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('inputRef');

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const value = target?.value ?? '';
    this.query.set(value);
    this.queryChange.emit(value);
  }

  handleSubmit(event: Event): void {
    event.preventDefault();
    const trimmed = this.query().trim();
    this.searchSubmit.emit(trimmed);
    if (this.navigateOnSubmit()) {
      void this.router.navigate(
        ['/lancamentos'],
        trimmed ? { queryParams: { q: trimmed } } : undefined
      );
    }
  }

  handleClear(): void {
    this.query.set('');
    this.queryChange.emit('');
    this.inputRef()?.nativeElement.focus();
  }
}
