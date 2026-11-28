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
      @if (variant() === 'editorial') {
        <section
          [attr.aria-labelledby]="headingId()"
          class="bg-canvas py-12 sm:py-16 lg:py-24"
        >
          <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div
              class="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12 xl:gap-16"
            >
              <div class="lg:col-span-5">
                <h2
                  [id]="headingId()"
                  class="max-w-md font-display text-[clamp(1.75rem,3vw,2.25rem)] font-medium not-italic leading-[1.1] tracking-[-0.025em] text-ink text-balance"
                >
                  {{ heading() }}
                </h2>
                @if (subtitle(); as sub) {
                  <p
                    class="mt-3 max-w-md text-[15px] font-normal leading-[1.55] text-ink-muted sm:text-[16px]"
                  >
                    {{ sub }}
                  </p>
                }
              </div>

              <nav
                [attr.aria-label]="heading()"
                class="divide-y divide-border-subtle border-y border-border-subtle lg:col-span-7"
              >
                @for (dest of destinations(); track dest.title) {
                  <a
                    [routerLink]="dest.route"
                    [fragment]="dest.fragment"
                    [queryParams]="dest.queryParams"
                    class="group flex flex-col gap-3 py-5 transition-colors duration-150 motion-reduce:transition-none sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-6"
                  >
                    <div class="max-w-lg space-y-1">
                      <h3
                        class="font-display text-[1.25rem] font-medium not-italic leading-[1.22] tracking-[-0.015em] text-ink transition-colors duration-150 motion-reduce:transition-none group-hover:text-brand text-balance"
                      >
                        {{ dest.title }}
                      </h3>
                      <p
                        class="text-[15px] font-normal leading-[1.55] text-ink-muted"
                      >
                        {{ dest.description }}
                      </p>
                    </div>

                    <span
                      class="inline-flex min-h-[40px] w-fit shrink-0 items-center gap-1.5 text-[14px] font-medium leading-[1.35] text-brand transition-colors duration-200 motion-reduce:transition-none group-hover:text-brand-hover"
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
                        class="h-4 w-4 shrink-0 transition-transform duration-[260ms] ease-[var(--ease-expressive)] motion-reduce:transition-none group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0"
                      >
                        <path d="M4.5 10h11" />
                        <path d="m11 5.5 4.5 4.5-4.5 4.5" />
                      </svg>
                    </span>
                  </a>
                }
              </nav>
            </div>
          </div>
        </section>
      } @else {
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
                      class="h-4 w-4 shrink-0 transition-transform duration-[260ms] ease-[var(--ease-expressive)] motion-reduce:transition-none group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0"
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
    }
  `,
})
export class NextJourneyComponent {
  readonly heading = input<string>('Continue explorando');
  readonly subtitle = input<string | null>(null);
  readonly headingId = input<string>('next-journey-heading');
  readonly variant = input<'cards' | 'editorial'>('cards');
  readonly destinations = input.required<readonly JourneyDestination[]>();

  readonly gridClass = computed(() => {
    const count = this.destinations().length;
    if (count === 2) {
      return 'mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2';
    }
    return 'mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3';
  });
}
