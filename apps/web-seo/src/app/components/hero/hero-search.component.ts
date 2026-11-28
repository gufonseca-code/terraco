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
import { Router, RouterLink } from '@angular/router';
import {
  LancamentosService,
  QUICK_NEIGHBORHOODS,
  SEARCH_SUGGESTIONS,
} from '../../core';
import { FavoriteButtonComponent } from '../launches/favorite-button.component';
import { resolveLaunchThirdSpec } from '../launches/launch-card.component';
import { ViewTransitionDirective } from '../shared/view-transition.directive';
import { HeroSearchFormComponent } from './hero-search-form.component';

@Component({
  selector: 'app-hero-search',
  imports: [
    NgOptimizedImage,
    RouterLink,
    ViewTransitionDirective,
    HeroSearchFormComponent,
    FavoriteButtonComponent,
  ],
  host: {
    class: 'block',
  },
  template: `
    <section
      aria-labelledby="hero-heading"
      class="bg-canvas pt-5 pb-6 sm:pt-8 sm:pb-10 lg:pt-10 lg:pb-14 xl:pt-12 xl:pb-16"
    >
      <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          class="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-10 xl:gap-12"
        >
          <div class="space-y-4 sm:space-y-5 lg:col-span-6 lg:space-y-6">
            <div class="terraco-reveal space-y-3 sm:space-y-4">
              <p
                class="inline-flex w-fit items-center gap-2 rounded-full border border-ink/10 bg-surface px-3 py-1 text-[12px] font-medium leading-[1.3] tracking-[0.01em] text-ink"
              >
                <span aria-hidden="true" class="inline-flex items-end gap-[2px]">
                  <span class="h-1.5 w-[2.5px] rounded-full bg-[#F06A36]"></span>
                  <span class="h-2.5 w-[2.5px] rounded-full bg-[#F06A36]"></span>
                  <span class="h-3.5 w-[2.5px] rounded-full bg-[#F06A36]"></span>
                </span>
                <span>Curadoria residencial em Belo Horizonte</span>
              </p>

              <h1
                id="hero-heading"
                appViewTransition="page-heading"
                class="max-w-[29rem] font-display text-[clamp(2rem,4.2vw,3.125rem)] font-medium leading-[1.05] tracking-[-0.03em] text-ink text-balance"
              >
                Seu próximo canto, sem burocracia.
              </h1>

              <p
                class="max-w-[44ch] text-[15px] font-normal leading-[1.5] text-ink-muted sm:text-base"
              >
                Lançamentos em Belo Horizonte, direto no WhatsApp.
              </p>
            </div>

            <div class="terraco-reveal-delay space-y-3">
              <app-hero-search-form [suggestions]="suggestions" />

              <nav
                aria-label="Atalhos de busca em BH"
                class="flex max-w-lg flex-wrap items-center gap-2"
              >
                @for (bairro of quickNeighborhoods; track bairro) {
                  <a
                    [routerLink]="['/lancamentos']"
                    [queryParams]="{ q: bairro }"
                    [attr.aria-label]="'Buscar lançamentos em ' + bairro"
                    class="inline-flex min-h-[36px] items-center rounded-pill border border-border-subtle bg-surface/80 px-3.5 py-1.5 text-[13px] font-normal leading-[1.3] text-ink transition-colors duration-150 hover:border-border-strong hover:bg-surface"
                  >
                    {{ bairro }}
                  </a>
                }
                <a
                  [routerLink]="['/lancamentos']"
                  [queryParams]="{ tipologia: '2 quartos' }"
                  class="inline-flex min-h-[36px] items-center rounded-pill border border-border-subtle bg-surface/80 px-3.5 py-1.5 text-[13px] font-normal leading-[1.3] text-ink transition-colors duration-150 hover:border-border-strong hover:bg-surface"
                >
                  2 quartos
                </a>
                <a
                  href="#lancamentos-selecionados"
                  (click)="scrollToFeatured($event)"
                  class="terraco-link-editorial hidden min-h-[36px] items-center gap-1 px-1.5 text-[13px] font-medium text-ink hover:text-action-hover focus-visible:text-action-hover sm:inline-flex"
                >
                  <span>Ver lançamentos</span>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="terraco-link-arrow h-3.5 w-3.5 shrink-0"
                  >
                    <path d="M4.5 10h11" />
                    <path d="m11 5.5 4.5 4.5-4.5 4.5" />
                  </svg>
                </a>
              </nav>
            </div>
          </div>

          @if (leadLaunch(); as lead) {
            @let leadSpec = leadThirdSpec();
            <article class="hidden lg:col-span-6 lg:block">
              <div
                [class.terraco-skeleton]="!leadImageLoaded()"
                class="group relative aspect-[16/10] overflow-hidden rounded-[24px] bg-surface"
              >
                <a
                  [routerLink]="['/lancamentos', lead.slug]"
                  class="relative z-[1] block h-full w-full overflow-hidden rounded-[24px]"
                  [attr.aria-label]="'Conhecer ' + lead.nome"
                >
                  <img
                    #heroLeadImg
                    data-testid="hero-lead-cover-image"
                    [attr.data-slug]="lead.slug"
                    [ngSrc]="lead.imagem"
                    sizes="(max-width: 767px) 200px, 640px"
                    [alt]="lead.imagemAlt"
                    [width]="lead.imagemWidth"
                    [height]="lead.imagemHeight"
                    priority
                    fetchpriority="high"
                    loading="eager"
                    (load)="markLeadImageLoaded()"
                    (error)="markLeadImageLoaded()"
                    class="h-full w-full rounded-[24px] object-cover object-center transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:scale-[1.02] motion-reduce:group-hover:scale-100"
                  />
                </a>

                <div class="absolute top-3.5 right-3.5 z-10">
                  <app-favorite-button
                    [slug]="lead.slug"
                    [nome]="lead.nome"
                  />
                </div>
              </div>

              <div class="mt-4 flex flex-col gap-3">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="flex flex-wrap items-center gap-2">
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

                  <a
                    [routerLink]="['/lancamentos', lead.slug]"
                    class="terraco-link-editorial group inline-flex min-h-[36px] items-center gap-1.5 text-[14px] font-medium leading-[1.35] text-ink hover:text-action-hover focus-visible:text-action-hover"
                  >
                    <span>Conhecer lançamento</span>
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

                <h2
                  class="font-display text-[1.5rem] font-medium not-italic leading-[1.16] tracking-[-0.02em] text-ink text-balance"
                >
                  <a
                    [routerLink]="['/lancamentos', lead.slug]"
                    class="transition-colors duration-150 hover:text-action-hover"
                  >
                    {{ lead.nome }}
                  </a>
                </h2>

                <dl
                  class="grid grid-cols-3 gap-4 border-t border-border-subtle pt-3"
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
                  @if (leadSpec) {
                    <div class="space-y-0.5">
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
                </dl>
              </div>
            </article>
          }
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSearchComponent {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly lancamentosService = inject(LancamentosService);

  readonly suggestions = SEARCH_SUGGESTIONS;
  readonly quickNeighborhoods = QUICK_NEIGHBORHOODS;

  readonly leadLaunch = computed(
    () => this.lancamentosService.lancamentos()[0] ?? null
  );
  readonly leadThirdSpec = computed(() => {
    const lead = this.leadLaunch();
    return lead ? resolveLaunchThirdSpec(lead) : null;
  });
  readonly leadImageLoaded = signal(false);

  private readonly heroLeadImg =
    viewChild<ElementRef<HTMLImageElement>>('heroLeadImg');

  constructor() {
    afterNextRender(() => {
      const el = this.heroLeadImg()?.nativeElement;
      if (el && el.complete && el.naturalWidth > 0) {
        this.leadImageLoaded.set(true);
      }
    });
  }

  markLeadImageLoaded(): void {
    this.leadImageLoaded.set(true);
  }

  scrollToFeatured(event: MouseEvent): void {
    event.preventDefault();
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const target = this.document.getElementById('lancamentos-selecionados');
    if (!target) {
      void this.router.navigate(['/lancamentos']);
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
