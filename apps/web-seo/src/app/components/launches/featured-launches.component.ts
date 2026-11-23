import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LancamentosService } from '../../core';
import { LaunchCardComponent } from './launch-card.component';
import { LaunchCardSkeletonComponent } from './launch-skeleton.component';

const MAX_HOME_FEATURED_LAUNCHES = 6;

/**
 * Curated launches section on the Home page that provides direct internal links
 * to `/lancamentos/:slug` and `/lancamentos` without duplicating the full catalog explorer.
 */
@Component({
  selector: 'app-featured-launches',
  imports: [RouterLink, LaunchCardComponent, LaunchCardSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isLoading() && featuredLaunches().length === 0) {
      <section
        aria-labelledby="featured-launches-heading"
        class="border-t border-border-subtle bg-canvas py-16 sm:py-20 lg:py-24"
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
        aria-labelledby="featured-launches-heading"
        class="border-t border-border-subtle bg-canvas py-16 sm:py-20 lg:py-24"
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
                [launch]="launch"
                headingLevel="h3"
                [priority]="$index < 3"
              />
            }
          </div>
        </div>
      </section>
    }
  `,
})
export class FeaturedLaunchesComponent {
  private readonly lancamentosService = inject(LancamentosService);

  readonly isLoading = this.lancamentosService.isLoadingList;
  readonly featuredLaunches = computed(() =>
    this.lancamentosService.lancamentos().slice(0, MAX_HOME_FEATURED_LAUNCHES),
  );
}
