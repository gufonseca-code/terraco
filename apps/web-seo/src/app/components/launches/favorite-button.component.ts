import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { FavoritesService } from '../../core';

/**
 * Interactive favorite toggle button styled with the Rosa Goiaba highlight token.
 */
@Component({
  selector: 'app-favorite-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      (click)="onToggle($event)"
      [attr.aria-pressed]="isFavorited()"
      [attr.aria-label]="
        isFavorited()
          ? 'Remover ' + nome() + ' dos favoritos'
          : 'Salvar ' + nome() + ' nos favoritos'
      "
      [class]="buttonClasses()"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        [attr.class]="iconClasses()"
      >
        <svg:path
          d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"
        />
      </svg>
    </button>
  `,
})
export class FavoriteButtonComponent {
  private readonly favoritesService = inject(FavoritesService);

  readonly slug = input.required<string>();
  readonly nome = input.required<string>();

  readonly isFavorited = computed(() =>
    this.favoritesService.isFavorited(this.slug())
  );

  readonly buttonClasses = computed(
    () =>
      `terraco-m3-icon-toggle group inline-flex h-11 w-11 shrink-0 items-center justify-center border cursor-pointer backdrop-blur-sm ${
        this.isFavorited()
          ? 'border-highlight bg-highlight text-ink-inverse shadow-chip hover:shadow-card'
          : 'border-border-subtle bg-elevated/92 text-ink hover:border-ink/25 hover:bg-elevated hover:text-highlight hover:shadow-card'
      }`
  );

  readonly iconClasses = computed(
    () =>
      `h-4 w-4 transition-transform duration-200 ease-out group-active:scale-90 motion-reduce:transition-none ${
        this.isFavorited() ? 'scale-110 fill-current' : 'scale-100'
      }`
  );

  onToggle(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.favoritesService.toggle(this.slug());
  }
}
