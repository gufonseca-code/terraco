import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent, NavbarComponent } from '../components/layout';
import { SeoService } from '../core';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, NavbarComponent, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-dvh flex-col bg-canvas">
      <app-navbar />
      <main
        id="homepage"
        tabindex="-1"
        class="flex min-h-dvh flex-1 flex-col items-center justify-center px-6 py-20 text-center"
      >
        <div class="max-w-md space-y-4">
          <h1 class="font-display text-5xl font-bold tracking-tight text-ink">
            404
          </h1>
          <h2 class="text-lg font-medium text-ink-muted">
            This page could not be found.
          </h2>
          <div class="pt-4">
            <a
              routerLink="/lancamentos"
              class="terraco-btn terraco-btn-moss inline-flex min-h-[44px] items-center justify-center rounded-pill bg-brand px-6 py-3 text-sm font-semibold leading-[1.35] text-ink-inverse hover:bg-brand-hover"
            >
              Ver lançamentos
            </a>
          </div>
        </div>
      </main>
      <app-footer />
    </div>
  `,
})
export class NotFoundPageComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.updateNotFoundMeta();
  }
}
