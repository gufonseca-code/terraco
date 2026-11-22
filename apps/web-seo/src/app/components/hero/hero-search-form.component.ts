import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  signal,
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
      aria-label="Buscar lançamentos"
      class="flex items-center gap-2 rounded-pill border border-border-subtle bg-elevated p-1.5 pl-5 max-w-lg shadow-chip transition-[border-color,box-shadow] duration-150 hover:border-ink/25 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 focus-within:shadow-card"
    >
      <label for="hero-search" class="sr-only">
        Buscar por bairro ou lançamento
      </label>
      <input
        #inputRef
        id="hero-search"
        type="search"
        enterkeyhint="search"
        list="terraco-sugestoes"
        [value]="query()"
        (input)="onInput($event)"
        placeholder="Bairro ou lançamento"
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
        <span>Explorar</span>
        <span class="hidden sm:inline">&nbsp;imóveis</span>
      </button>
      <datalist id="terraco-sugestoes">
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
  readonly query = signal<string>('');
  readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('inputRef');

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.query.set(target?.value ?? '');
  }

  handleSubmit(event: Event): void {
    event.preventDefault();
    const trimmed = this.query().trim();
    void this.router.navigate(
      ['/lancamentos'],
      trimmed ? { queryParams: { q: trimmed } } : undefined
    );
  }

  handleClear(): void {
    this.query.set('');
    this.inputRef()?.nativeElement.focus();
  }
}
