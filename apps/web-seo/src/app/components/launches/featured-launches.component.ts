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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isLoading() && featuredLaunches().length === 0) {
      <section
        id="lancamentos-selecionados"
        aria-labelledby="featured-launches-heading"
        class="bg-canvas py-16 sm:py-20 lg:py-24 scroll-mt-20"
      >
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            id="featured-launches-heading"
            class="max-w-2xl font-display text-[clamp(1.75rem,3vw,2.25rem)] font-medium not-italic leading-[1.12] tracking-[-0.025em] text-ink text-balance"
          >
            Lançamentos selecionados em BH
          </h2>

          <div
            aria-hidden="true"
            class="terraco-plate mt-8 overflow-hidden rounded-xl bg-elevated sm:mt-10"
          >
            <div class="grid lg:grid-cols-12">
              <div class="p-2.5 pb-0 lg:col-span-7 lg:p-3 lg:pr-0">
                <div
                  class="terraco-skeleton aspect-[16/10] w-full rounded-[20px] lg:aspect-auto lg:min-h-[300px]"
                ></div>
              </div>
              <div
                class="flex flex-col justify-between gap-4 p-5 sm:p-6 lg:col-span-5 lg:p-6"
              >
                <div class="space-y-2.5">
                  <div class="terraco-skeleton h-3.5 w-36 rounded-sm"></div>
                  <div class="terraco-skeleton h-8 w-52 rounded-sm"></div>
                  <div class="terraco-skeleton h-4 w-full rounded-sm"></div>
                </div>
                <div class="terraco-skeleton h-10 w-full rounded-pill"></div>
                <div class="terraco-skeleton h-28 w-full rounded-[18px]"></div>
              </div>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6">
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
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

          @if (leadLaunch(); as lead) {
            @let leadSpec = leadThirdSpec();
            <article
              appScrollReveal
              class="terraco-plate mt-8 overflow-hidden rounded-xl bg-elevated sm:mt-10"
            >
              <div class="grid lg:grid-cols-12 lg:items-stretch">
                <div class="p-2.5 pb-0 lg:col-span-7 lg:p-3 lg:pr-0">
                  <div
                    [class.terraco-skeleton]="!leadImageLoaded()"
                    class="relative aspect-[16/10] h-full overflow-hidden rounded-[20px] bg-surface lg:aspect-auto lg:min-h-[300px]"
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
                        [style.view-transition-name]="
                          'launch-image-' + lead.slug
                        "
                        (load)="markLeadImageLoaded()"
                        (error)="markLeadImageLoaded()"
                        class="h-full w-full rounded-[20px] object-cover object-center"
                      />
                    </a>

                    @if (lead.badge) {
                      <span
                        class="pointer-events-none absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-pill bg-accent px-3 py-1 text-[13px] font-medium leading-[1.3] text-ink shadow-chip"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          class="h-3.5 w-3.5 shrink-0"
                        >
                          <path
                            d="M12 1.5c1.1 0 2 .7 2.4 1.6.9-.4 2-.2 2.7.5.7.7.9 1.8.5 2.7.9.4 1.6 1.3 1.6 2.4 0 1.1-.7 2-1.6 2.4.4.9.2 2-.5 2.7-.7.7-1.8.9-2.7.5-.4.9-1.3 1.6-2.4 1.6-1.1 0-2-.7-2.4-1.6-.9.4-2 .2-2.7-.5-.7-.7-.9-1.8-.5-2.7-.9-.4-1.6-1.3-1.6-2.4 0-1.1.7-2 1.6-2.4-.4-.9-.2-2 .5-2.7.7-.7 1.8-.9 2.7-.5C10 2.2 10.9 1.5 12 1.5Z"
                            transform="translate(0 3)"
                          />
                        </svg>
                        <span>{{ lead.badge }}</span>
                      </span>
                    }

                    <div class="absolute top-3 right-3 z-10">
                      <app-favorite-button
                        [slug]="lead.slug"
                        [nome]="lead.nome"
                      />
                    </div>
                  </div>
                </div>

                <div
                  class="flex flex-col justify-between gap-4 p-5 sm:p-6 lg:col-span-5 lg:p-6"
                >
                  <div>
                    <p class="text-[13px] font-normal text-ink-muted">
                      {{ lead.bairro }}, {{ lead.cidade }}
                    </p>

                    <h3
                      [style.view-transition-name]="'launch-title-' + lead.slug"
                      class="mt-1 font-display text-[clamp(1.375rem,2.2vw,1.625rem)] font-medium not-italic leading-[1.16] tracking-[-0.02em] text-ink text-balance"
                    >
                      <a
                        [routerLink]="['/lancamentos', lead.slug]"
                        class="transition-colors duration-150 hover:text-brand"
                      >
                        {{ lead.nome }}
                      </a>
                    </h3>

                    <p
                      class="mt-2 text-[15px] font-normal leading-[1.55] text-ink-muted"
                    >
                      {{ lead.tagline }}
                    </p>
                  </div>

                  <a
                    [routerLink]="['/lancamentos', lead.slug]"
                    class="terraco-btn terraco-btn-moss inline-flex min-h-[42px] w-full items-center justify-center rounded-pill bg-brand px-5 py-2 text-[13px] font-medium leading-[1.35] text-ink-inverse hover:bg-brand-hover"
                  >
                    Conhecer lançamento
                  </a>

                  <dl
                    class="grid grid-cols-2 overflow-hidden rounded-[18px] bg-surface/75"
                  >
                    <div
                      class="space-y-0.5 border-r border-border-subtle/70 px-4 py-3"
                    >
                      <dt class="text-[13px] font-normal text-ink-muted">
                        Dormitórios
                      </dt>
                      <dd
                        class="text-[14px] font-normal leading-[1.4] text-ink tabular-nums"
                      >
                        {{ lead.quartos }}
                      </dd>
                    </div>
                    <div class="space-y-0.5 px-4 py-3">
                      <dt class="text-[13px] font-normal text-ink-muted">
                        Metragem
                      </dt>
                      <dd
                        class="text-[14px] font-normal leading-[1.4] text-ink tabular-nums"
                      >
                        {{ lead.metragem }}
                      </dd>
                    </div>
                    @let entrega = lead.entrega?.trim();
                    @if (leadSpec) {
                      <div
                        [class]="
                          entrega
                            ? 'space-y-0.5 border-t border-r border-border-subtle/70 px-4 py-3'
                            : 'col-span-2 space-y-0.5 border-t border-border-subtle/70 px-4 py-3'
                        "
                      >
                        <dt class="text-[13px] font-normal text-ink-muted">
                          {{ leadSpec.label }}
                        </dt>
                        <dd
                          [class]="
                            leadSpec.tabular
                              ? 'text-[14px] font-normal leading-[1.4] text-ink tabular-nums'
                              : 'text-[14px] font-normal leading-[1.4] text-ink'
                          "
                        >
                          {{ leadSpec.value }}
                        </dd>
                      </div>
                    }
                    @if (entrega) {
                      <div
                        class="space-y-0.5 border-t border-border-subtle/70 px-4 py-3"
                      >
                        <dt class="text-[13px] font-normal text-ink-muted">
                          Entrega
                        </dt>
                        <dd
                          class="text-[14px] font-normal leading-[1.4] text-ink tabular-nums"
                        >
                          {{ entrega }}
                        </dd>
                      </div>
                    }
                  </dl>
                </div>
              </div>
            </article>
          }

          @if (secondaryLaunches().length > 0) {
            <div
              [class]="
                secondaryLaunches().length >= 3
                  ? 'mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6 sm:mt-8'
                  : 'mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6 sm:mt-8'
              "
            >
              @for (launch of secondaryLaunches(); track launch.slug) {
                <app-launch-card
                  appScrollReveal
                  [revealDelayMs]="($index % 2) * 90"
                  [launch]="launch"
                  headingLevel="h3"
                  [priority]="$index < 2"
                />
              }
            </div>
          }

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
