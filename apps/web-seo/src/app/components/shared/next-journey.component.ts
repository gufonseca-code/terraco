import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface JourneyDestination {
  readonly title: string;
  readonly description: string;
  readonly actionLabel: string;
  readonly route: string | readonly string[];
  readonly fragment?: string;
  readonly queryParams?: Record<string, string>;
}

/**
 * Context-aware bottom navigation bridge ("Continue explorando") that ensures
 * visitors always have clear, meaningful next destinations before reaching the footer.
 */
@Component({
  selector: 'app-next-journey',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (destinations().length > 0) {
      <section
        [attr.aria-labelledby]="headingId()"
        class="border-t border-border-subtle bg-canvas py-12 sm:py-16"
      >
        <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="max-w-2xl space-y-1.5">
            <h2
              [id]="headingId()"
              class="font-display text-[clamp(1.375rem,2.4vw,1.75rem)] font-medium not-italic leading-[1.18] tracking-[-0.02em] text-ink text-balance"
            >
              {{ heading() }}
            </h2>
            @if (subtitle(); as sub) {
              <p class="text-[15px] font-normal leading-[1.55] text-ink-muted">
                {{ sub }}
              </p>
            }
          </div>

          <nav
            [attr.aria-label]="heading()"
            [class]="gridClass()"
          >
            @for (dest of destinations(); track dest.title) {
              <a
                [routerLink]="dest.route"
                [fragment]="dest.fragment"
                [queryParams]="dest.queryParams"
                class="terraco-journey-card group flex flex-col justify-between gap-4 bg-elevated p-5 sm:p-6"
              >
                <div class="space-y-1.5">
                  <h3
                    class="font-display text-[1.125rem] font-medium not-italic leading-[1.25] tracking-[-0.015em] text-ink transition-colors duration-150 group-hover:text-brand text-balance"
                  >
                    {{ dest.title }}
                  </h3>
                  <p class="text-[14px] font-normal leading-[1.55] text-ink-muted">
                    {{ dest.description }}
                  </p>
                </div>

                <span
                  class="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand transition-colors duration-150 group-hover:text-brand-hover"
                >
                  <span>{{ dest.actionLabel }}</span>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
                  >
                    <path d="M4.5 10h11" />
                    <path d="m11 5.5 4.5 4.5-4.5 4.5" />
                  </svg>
                </span>
              </a>
            }
          </nav>
        </div>
      </section>
    }
  `,
})
export class NextJourneyComponent {
  readonly heading = input<string>('Continue explorando');
  readonly subtitle = input<string | null>(null);
  readonly headingId = input<string>('next-journey-heading');
  readonly destinations = input.required<readonly JourneyDestination[]>();

  readonly gridClass = computed(() => {
    const count = this.destinations().length;
    if (count === 2) {
      return 'mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2';
    }
    return 'mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3';
  });
}
