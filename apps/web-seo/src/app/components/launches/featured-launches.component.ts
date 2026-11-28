import { DOCUMENT, NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LancamentosService, ScrollRevealDirective } from '../../core';
import { ViewTransitionDirective } from '../shared/view-transition.directive';
import { FavoriteButtonComponent } from './favorite-button.component';
import {
  LaunchCardComponent,
  resolveLaunchThirdSpec,
} from './launch-card.component';
import { LaunchCardSkeletonComponent } from './launch-skeleton.component';

const MAX_HOME_FEATURED_LAUNCHES = 6;

/**
 * Curated launches section on the Home page that provides direct internal links
 * to `/lancamentos/:slug` and `/lancamentos` without duplicating the full catalog explorer.
 */
@Component({
  selector: 'app-featured-launches',
  imports: [
    NgOptimizedImage,
    RouterLink,
    FavoriteButtonComponent,
    LaunchCardComponent,
    LaunchCardSkeletonComponent,
    ScrollRevealDirective,
    ViewTransitionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isLoading() && featuredLaunches().length === 0) {
      <section
        id="lancamentos-selecionados"
        aria-labelledby="featured-launches-heading"
        class="border-t border-border-subtle bg-canvas py-12 sm:py-16 lg:py-24 scroll-mt-20"
      >
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            id="featured-launches-heading"
            class="max-w-2xl font-display text-[clamp(1.75rem,3vw,2.25rem)] font-medium not-italic leading-[1.1] tracking-[-0.025em] text-ink text-balance"
          >
            Lançamentos selecionados em BH
          </h2>

          <div
            aria-hidden="true"
            class="mt-6 grid gap-6 sm:mt-8 lg:mt-10 lg:grid-cols-12 lg:items-center lg:gap-10"
          >
            <div class="lg:col-span-7">
              <div
                class="terraco-skeleton aspect-[16/10] w-full rounded-[20px]"
              ></div>
            </div>
            <div class="flex flex-col gap-4 lg:col-span-5">
              <div class="space-y-2.5">
                <div class="terraco-skeleton h-3.5 w-36 rounded-sm"></div>
                <div class="terraco-skeleton h-8 w-52 rounded-sm"></div>
                <div class="terraco-skeleton h-4 w-full rounded-sm"></div>
              </div>
              <div class="terraco-skeleton h-20 w-full rounded-sm"></div>
              <div class="terraco-skeleton h-11 w-44 rounded-pill"></div>
            </div>
          </div>

          <div
            class="terraco-no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto border-t border-border-subtle px-4 pt-8 pb-2 sm:-mx-6 sm:px-6 sm:scroll-px-6 md:mx-0 md:mt-10 md:grid md:grid-cols-2 md:gap-8 md:overflow-visible md:px-0 md:pb-0 lg:mt-12 lg:pt-10"
          >
            <app-launch-card-skeleton
              class="w-[82vw] max-w-[332px] shrink-0 snap-start md:w-auto md:max-w-none"
            />
            <app-launch-card-skeleton
              class="w-[82vw] max-w-[332px] shrink-0 snap-start md:w-auto md:max-w-none"
            />
          </div>
        </div>
      </section>
    } @else if (featuredLaunches().length > 0) {
      <section
        id="lancamentos-selecionados"
        aria-labelledby="featured-launches-heading"
        class="border-t border-border-subtle bg-canvas pt-6 pb-12 sm:py-14 lg:py-20 scroll-mt-20"
      >
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6"
          >
            <h2
              id="featured-launches-heading"
              class="max-w-2xl font-display text-[clamp(1.625rem,3vw,2.25rem)] font-medium not-italic leading-[1.1] tracking-[-0.025em] text-ink text-balance"
            >
              Lançamentos selecionados em BH
            </h2>

            <a
              routerLink="/lancamentos"
              class="terraco-link-editorial inline-flex min-h-[40px] w-fit shrink-0 items-center gap-1.5 text-[14px] font-medium leading-[1.35] text-ink hover:text-action-hover focus-visible:text-action-hover"
            >
              <span>Ver catálogo completo</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="terraco-link-arrow h-4 w-4 shrink-0"
              >
                <path d="M4.5 10h11" />
                <path d="m11 5.5 4.5 4.5-4.5 4.5" />
              </svg>
            </a>
          </div>

          @if (leadLaunch(); as lead) {
            @let leadSpec = leadThirdSpec();
            <article
              class="mt-5 grid gap-5 sm:mt-8 lg:hidden"
            >
              <div class="lg:col-span-7">
                <div
                  [class.terraco-skeleton]="!leadImageLoaded()"
                  class="group relative aspect-[16/10] overflow-hidden rounded-[20px] bg-surface"
                >
                  <a
                    [routerLink]="['/lancamentos', lead.slug]"
                    class="relative z-[1] block h-full w-full overflow-hidden rounded-[20px]"
                    [attr.aria-label]="'Conhecer ' + lead.nome"
                  >
                    <img
                      #leadCoverImg
                      data-testid="lancamentos-cover-image"
                      [attr.data-slug]="lead.slug"
                      [ngSrc]="lead.imagem"
                      [alt]="lead.imagemAlt"
                      [width]="lead.imagemWidth"
                      [height]="lead.imagemHeight"
                      priority
                      appViewTransition="launch-image"
                      [vtSlug]="lead.slug"
                      (load)="markLeadImageLoaded()"
                      (error)="markLeadImageLoaded()"
                      class="h-full w-full rounded-[20px] object-cover object-center transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:scale-[1.02] motion-reduce:group-hover:scale-100"
                    />
                  </a>

                  <div class="absolute top-3 right-3 z-10">
                    <app-favorite-button
                      [slug]="lead.slug"
                      [nome]="lead.nome"
                    />
                  </div>
                </div>
              </div>

              <div class="flex flex-col gap-5 lg:col-span-5">
                <div>
                  <div class="flex flex-wrap items-center gap-2.5">
                    <p class="text-[13px] font-normal text-ink-muted">
                      {{ lead.bairro }}, {{ lead.cidade }}
                    </p>
                    @if (lead.badge) {
                      <span
                        class="inline-flex items-center rounded-pill bg-success-bg px-2.5 py-0.5 text-[12px] font-medium leading-[1.3] text-success-fg"
                      >
                        {{ lead.badge }}
                      </span>
                    }
                  </div>

                  <h3
                    appViewTransition="launch-title"
                    [vtSlug]="lead.slug"
                    class="mt-1 font-display text-[clamp(1.5rem,2.4vw,1.875rem)] font-medium not-italic leading-[1.14] tracking-[-0.02em] text-ink text-balance"
                  >
                    <a
                      [routerLink]="['/lancamentos', lead.slug]"
                      class="transition-colors duration-150 hover:text-brand"
                    >
                      {{ lead.nome }}
                    </a>
                  </h3>

                  <p
                    class="mt-2 max-w-[46ch] text-[15px] font-normal leading-[1.55] text-ink-muted sm:text-[16px]"
                  >
                    {{ lead.tagline }}
                  </p>
                </div>

                <dl
                  class="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-border-subtle pt-4"
                >
                  <div class="space-y-0.5">
                    <dt class="text-[13px] font-normal text-ink-muted">
                      Dormitórios
                    </dt>
                    <dd
                      class="text-[14px] font-medium leading-[1.4] text-ink tabular-nums"
                    >
                      {{ lead.quartos }}
                    </dd>
                  </div>
                  <div class="space-y-0.5">
                    <dt class="text-[13px] font-normal text-ink-muted">
                      Metragem
                    </dt>
                    <dd
                      class="text-[14px] font-medium leading-[1.4] text-ink tabular-nums"
                    >
                      {{ lead.metragem }}
                    </dd>
                  </div>
                  @let entrega = lead.entrega?.trim();
                  @if (leadSpec) {
                    <div
                      [class]="
                        entrega ? 'space-y-0.5' : 'col-span-2 space-y-0.5'
                      "
                    >
                      <dt class="text-[13px] font-normal text-ink-muted">
                        {{ leadSpec.label }}
                      </dt>
                      <dd
                        [class]="
                          leadSpec.tabular
                            ? 'text-[14px] font-medium leading-[1.4] text-ink tabular-nums'
                            : 'text-[14px] font-medium leading-[1.4] text-ink'
                        "
                      >
                        {{ leadSpec.value }}
                      </dd>
                    </div>
                  }
                  @if (entrega) {
                    <div class="space-y-0.5">
                      <dt class="text-[13px] font-normal text-ink-muted">
                        Entrega
                      </dt>
                      <dd
                        class="text-[14px] font-medium leading-[1.4] text-ink tabular-nums"
                      >
                        {{ entrega }}
                      </dd>
                    </div>
                  }
                </dl>

                <div class="pt-1">
                  <a
                    [routerLink]="['/lancamentos', lead.slug]"
                    class="terraco-btn inline-flex min-h-[44px] w-fit items-center justify-center rounded-pill bg-action px-6 py-2.5 text-[14px] font-medium leading-[1.35] text-white hover:bg-action-hover"
                  >
                    Conhecer lançamento
                  </a>
                </div>
              </div>
            </article>
          }

          @if (secondaryLaunches().length > 0) {
            <div
              appScrollReveal
              [class]="
                secondaryLaunches().length >= 3
                  ? 'terraco-no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto border-t border-border-subtle px-4 pt-8 pb-2 sm:-mx-6 sm:px-6 sm:scroll-px-6 md:mx-0 md:mt-10 md:grid md:grid-cols-2 md:gap-8 md:overflow-visible md:px-0 md:pt-10 md:pb-0 lg:mt-8 lg:grid-cols-3 lg:border-t-0 lg:pt-0'
                  : 'terraco-no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto border-t border-border-subtle px-4 pt-8 pb-2 sm:-mx-6 sm:px-6 sm:scroll-px-6 md:mx-0 md:mt-10 md:grid md:grid-cols-2 md:gap-8 md:overflow-visible md:px-0 md:pt-10 md:pb-0 lg:mt-8 lg:border-t-0 lg:pt-0'
              "
            >
              @for (launch of secondaryLaunches(); track launch.slug) {
                <app-launch-card
                  [launch]="launch"
                  headingLevel="h3"
                  class="w-[82vw] max-w-[332px] shrink-0 snap-start md:w-auto md:max-w-none"
                />
              }
            </div>
          }

          <div
            class="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-ink-muted sm:mt-10 lg:mt-12"
          >
            <span>Em dúvida por onde começar?</span>
            <a
              href="#descoberta-guiada"
              (click)="scrollToGuidedDiscovery($event)"
              class="terraco-link-editorial inline-flex min-h-[44px] items-center gap-1.5 font-medium text-brand hover:text-brand-hover focus-visible:text-brand-hover"
            >
              <span>Descubra pelo seu momento</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="terraco-link-arrow h-4 w-4 shrink-0"
              >
                <path d="M4.5 10h11" />
                <path d="m11 5.5 4.5 4.5-4.5 4.5" />
              </svg>
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
  readonly leadLaunch = computed(() => this.featuredLaunches()[0] ?? null);
  readonly secondaryLaunches = computed(() =>
    this.featuredLaunches().slice(1),
  );
  readonly leadThirdSpec = computed(() => {
    const lead = this.leadLaunch();
    return lead ? resolveLaunchThirdSpec(lead) : null;
  });
  readonly leadImageLoaded = signal(false);

  private readonly leadCoverImg =
    viewChild<ElementRef<HTMLImageElement>>('leadCoverImg');

  constructor() {
    afterNextRender(() => {
      const el = this.leadCoverImg()?.nativeElement;
      if (el && el.complete && el.naturalWidth > 0) {
        this.leadImageLoaded.set(true);
      }
    });
  }

  markLeadImageLoaded(): void {
    this.leadImageLoaded.set(true);
  }

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
