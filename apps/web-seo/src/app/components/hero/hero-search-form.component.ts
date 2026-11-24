import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { M3SearchBarComponent } from '../shared/m3-search-bar.component';

@Component({
  selector: 'app-hero-search-form',
  imports: [M3SearchBarComponent],
  host: {
    class: 'block max-w-lg',
  },
  template: `
    <app-m3-search-bar
      inputId="hero-search"
      ariaLabel="Buscar lançamentos"
      labelText="Buscar por bairro ou lançamento"
      placeholder="Bairro ou lançamento"
      submitLabel="Explorar"
      submitSuffix="imóveis"
      size="hero"
      [value]="query()"
      (valueChange)="query.set($event)"
      (submitted)="navigateToSearch($event)"
      (neighborhoodSelected)="navigateToSearch($event)"
      (cleared)="query.set('')"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSearchFormComponent {
  private readonly router = inject(Router);

  readonly suggestions = input<string[]>([]);
  readonly query = signal<string>('');

  navigateToSearch(term: string): void {
    const trimmed = term.trim();
    this.query.set(trimmed);
    void this.router.navigate(
      ['/lancamentos'],
      trimmed ? { queryParams: { q: trimmed } } : undefined
    );
  }
}
