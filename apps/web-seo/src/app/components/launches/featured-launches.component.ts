import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LancamentosService, ScrollRevealDirective } from '../../core';
import { LaunchCardComponent } from './launch-card.component';
import { LaunchCardSkeletonComponent } from './launch-skeleton.component';

const MAX_HOME_FEATURED_LAUNCHES = 6;

/**
 * Curated launches section on the Home page that provides direct internal links
 * to `/lancamentos/:slug` and `/lancamentos` without duplicating the full catalog explorer.
 */
@Component({
  selector: 'app-featured-launches',
  imports: [
    RouterLink,
    LaunchCardComponent,
    LaunchCardSkeletonComponent,
    ScrollRevealDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isLoading() && featuredLaunches().length === 0) {
      <section
        id="lancamentos-selecionados"
        aria-labelledby="featured-launches-heading"
        class="bg-canvas py-16 sm:py-20 lg:py-24 scroll-mt-20"
      >
        <div class="mx-auto max-w-6xl px-6 lg:px-8">
          <h2
            id="featured-launches-heading"
            class="max-w-2xl font-display text-[clamp(1.75rem,3vw,2.25rem)] font-medium not-italic leading-[1.12] tracking-[-0.025em] text-ink text-balance"
          >
            Lançamentos selecionados em BH
          </h2>
          <div
            class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 sm:mt-10"
          >
            <app-launch-card-skeleton />
            <app-launch-card-skeleton />
            <app-launch-card-skeleton />
          </div>
        </div>
      </section>
    } @else if (featuredLaunches().length > 0) {
      <section
        id="lancamentos-selecionados"
        aria-labelledby="featured-launches-heading"
        class="bg-canvas py-16 sm:py-20 lg:py-24 scroll-mt-20"
      >
        <div class="mx-auto max-w-6xl px-6 lg:px-8">
          <div
            class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          >
            <h2
              id="featured-launches-heading"
              class="max-w-2xl font-display text-[clamp(1.75rem,3vw,2.25rem)] font-medium not-italic leading-[1.12] tracking-[-0.025em] text-ink text-balance"
            >
              Lançamentos selecionados em BH
            </h2>

            <a
              routerLink="/lancamentos"
              class="terraco-btn inline-flex min-h-[42px] shrink-0 items-center justify-center rounded-pill border border-border-strong bg-elevated px-5 py-2 text-[13px] font-medium leading-[1.35] text-ink hover:border-brand hover:text-brand"
            >
              Explorar todos os lançamentos
            </a>
          </div>

          <div
            class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 sm:mt-10"
          >
            @for (launch of featuredLaunches(); track launch.slug) {
              <app-launch-card
                appScrollReveal
                [revealDelayMs]="($index % 3) * 90"
                [launch]="launch"
                headingLevel="h3"
                [priority]="$index < 3"
              />
            }
          </div>

          <div
            class="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-ink-muted sm:mt-10"
          >
            <span>Em dúvida por onde começar?</span>
            <a
              href="#descoberta-guiada"
              (click)="scrollToGuidedDiscovery($event)"
              class="terraco-link-underline inline-flex min-h-[44px] items-center font-medium text-brand transition-colors duration-150 hover:text-brand-hover focus-visible:text-brand-hover"
            >
              Descubra pelo seu momento
            </a>
          </div>
        </div>
      </section>
    }
  `,
})
export class FeaturedLaunchesComponent {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly lancamentosService = inject(LancamentosService);

  readonly isLoading = this.lancamentosService.isLoadingList;
  readonly featuredLaunches = computed(() =>
    this.lancamentosService.lancamentos().slice(0, MAX_HOME_FEATURED_LAUNCHES),
  );

  scrollToGuidedDiscovery(event: MouseEvent): void {
    event.preventDefault();
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const target = this.document.getElementById('descoberta-guiada');
    if (!target) {
      return;
    }

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    target.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }
}
