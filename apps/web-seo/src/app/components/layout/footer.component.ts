import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FavoritesService,
  SITE_CONTACT_CHANNELS,
  buildWhatsAppUrl,
} from '../../core';
import { ViewTransitionDirective } from '../shared/view-transition.directive';
import { TerracoLogoComponent } from './terraco-logo.component';

interface FooterRouteLink {
  readonly label: string;
  readonly route: string | readonly string[];
}

const NAVIGATION_LINKS: readonly FooterRouteLink[] = [
  { label: 'Início', route: '/' },
  { label: 'Lançamentos', route: '/lancamentos' },
  { label: 'Guias de bairros', route: '/bairros' },
];

const NEIGHBORHOOD_GUIDES: readonly FooterRouteLink[] = [
  { label: 'Estoril', route: '/bairros/estoril' },
  { label: 'Prado', route: '/bairros/prado' },
  { label: 'Santa Efigênia', route: '/bairros/santa-efigenia' },
  { label: 'Serrano', route: '/bairros/serrano' },
  { label: 'Buritis', route: '/bairros/buritis' },
];

const LAUNCH_HIGHLIGHTS: readonly FooterRouteLink[] = [
  { label: 'Prime View', route: ['/lancamentos', 'prime-view'] },
  { label: 'Upside Square', route: ['/lancamentos', 'upside-square'] },
  { label: 'Horizon', route: ['/lancamentos', 'horizon'] },
  { label: 'Brumadinho 165', route: ['/lancamentos', 'brumadinho-165'] },
];

const BACK_TO_TOP_SCROLL_THRESHOLD = 360;

@Component({
  selector: 'app-footer',
  imports: [RouterLink, ViewTransitionDirective, TerracoLogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer
      id="contato"
      appViewTransition="footer"
      class="mt-auto bg-canvas px-2 pt-8 sm:px-4 sm:pt-12 lg:px-6 lg:pt-14 scroll-mt-24"
    >
      <div
        class="terraco-footer-card relative mx-auto max-w-[1440px] overflow-hidden rounded-t-[32px] bg-surface"
      >
        <div aria-hidden="true" class="terraco-cobogo-debossed"></div>

        <div
          class="relative z-10 mx-auto max-w-7xl px-6 pt-12 pb-12 sm:px-10 sm:pt-16 sm:pb-12 lg:px-12 lg:pt-20 lg:pb-12"
        >
          <div
            class="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,35fr)_minmax(0,65fr)] lg:gap-16"
          >
            <!-- Bloco Esquerdo: Marca, Missão Humana e WhatsApp (~35% desktop) -->
            <div class="flex flex-col items-start">
              <app-terraco-logo [animate]="false" [accentSteps]="true" />

              <p
                class="mt-5 max-w-[36ch] text-[15px] font-normal leading-[1.6] text-ink"
              >
                Curadoria humana de lançamentos residenciais em Belo Horizonte.
                Plantas, valores e entrega abertos na página para você escolher
                com calma.
              </p>

              <div class="mt-7 flex flex-col items-start gap-2.5">
                <a
                  [href]="whatsappHref"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="terraco-btn terraco-footer-cta inline-flex min-h-[46px] items-center justify-center gap-2.5 px-6 py-3 text-[14px] font-medium leading-[1.35] text-ink-inverse no-underline"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.9"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="h-[18px] w-[18px] shrink-0"
                  >
                    <path
                      d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
                    />
                  </svg>
                  <span>Falar no WhatsApp</span>
                </a>

                <p class="text-[13px] font-normal leading-[1.45] text-ink-muted">
                  Atendimento direto em Belo Horizonte, sem robôs
                </p>
              </div>
            </div>

            <!-- Bloco Direito: Grade de 3 colunas (~65% desktop) -->
            <div
              class="grid grid-cols-1 gap-9 sm:grid-cols-3 sm:gap-8 lg:gap-10 lg:pl-6"
            >
              <nav aria-labelledby="footer-nav-heading">
                <h2
                  id="footer-nav-heading"
                  class="font-display text-base font-medium leading-[1.3] tracking-[-0.01em] text-ink"
                >
                  Navegação
                </h2>
                <ul class="mt-3.5 space-y-1">
                  @for (item of navigationLinks; track item.label) {
                    <li>
                      <a
                        [routerLink]="item.route"
                        class="terraco-footer-link inline-flex min-h-[44px] items-center text-[14px] font-normal leading-[1.4] text-ink-muted sm:min-h-[36px]"
                      >
                        {{ item.label }}
                      </a>
                    </li>
                  }
                  <li>
                    <a
                      [href]="whatsappHref"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="terraco-footer-link inline-flex min-h-[44px] items-center text-[14px] font-normal leading-[1.4] text-ink-muted sm:min-h-[36px]"
                    >
                      Atendimento direto
                    </a>
                  </li>
                </ul>
              </nav>

              <nav aria-labelledby="footer-bairros-heading">
                <h2
                  id="footer-bairros-heading"
                  class="font-display text-base font-medium leading-[1.3] tracking-[-0.01em] text-ink"
                >
                  Bairros em BH
                </h2>
                <ul class="mt-3.5 space-y-1">
                  @for (guide of neighborhoodGuides; track guide.label) {
                    <li>
                      <a
                        [routerLink]="guide.route"
                        class="terraco-footer-link inline-flex min-h-[44px] items-center text-[14px] font-normal leading-[1.4] text-ink-muted sm:min-h-[36px]"
                      >
                        {{ guide.label }}
                      </a>
                    </li>
                  }
                </ul>
              </nav>

              <nav aria-labelledby="footer-lancamentos-heading">
                <h2
                  id="footer-lancamentos-heading"
                  class="font-display text-base font-medium leading-[1.3] tracking-[-0.01em] text-ink"
                >
                  Lançamentos
                </h2>
                <ul class="mt-3.5 space-y-1">
                  @for (launch of launchHighlights; track launch.label) {
                    <li>
                      <a
                        [routerLink]="launch.route"
                        class="terraco-footer-link inline-flex min-h-[44px] items-center text-[14px] font-normal leading-[1.4] text-ink-muted sm:min-h-[36px]"
                      >
                        {{ launch.label }}
                      </a>
                    </li>
                  }
                  <li>
                    <a
                      routerLink="/lancamentos"
                      class="terraco-footer-link inline-flex min-h-[44px] items-center text-[14px] font-normal leading-[1.4] text-ink-muted sm:min-h-[36px]"
                    >
                      Ver catálogo completo
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          <!-- Rodapé inferior: Copyright e Localização -->
          <div
            class="mt-12 flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-border-subtle pt-6 text-[13px] font-normal leading-[1.4] text-ink-muted tabular-nums sm:mt-14"
          >
            <a
              routerLink="/"
              class="terraco-footer-link inline-flex min-h-[44px] items-center text-ink-muted sm:min-h-[36px]"
            >
              © 2026 Terraço
            </a>
            <span aria-hidden="true" class="text-ink/25">|</span>
            <a
              routerLink="/bairros"
              class="terraco-footer-link inline-flex min-h-[44px] items-center text-ink-muted sm:min-h-[36px]"
            >
              Belo Horizonte, MG
            </a>
          </div>
        </div>
      </div>
    </footer>

    @if (showBackToTop()) {
      <button
        type="button"
        (click)="scrollToTop()"
        aria-label="Voltar ao topo da página"
        animate.enter="terraco-backtop-enter"
        animate.leave="terraco-backtop-leave"
        [class]="backToTopClasses()"
      >
        <span aria-hidden="true" class="text-[15px] leading-none">↑</span>
        <span class="hidden sm:inline">Voltar ao topo</span>
      </button>
    }
  `,
})
export class FooterComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly favoritesService = inject(FavoritesService);

  readonly navigationLinks = NAVIGATION_LINKS;
  readonly neighborhoodGuides = NEIGHBORHOOD_GUIDES;
  readonly launchHighlights = LAUNCH_HIGHLIGHTS;

  readonly whatsappHref = buildWhatsAppUrl(
    SITE_CONTACT_CHANNELS.whatsapp.defaultMessage
  );

  readonly showBackToTop = signal(false);

  private readonly hasFavorites = computed(
    () => this.favoritesService.favorites().length > 0
  );

  readonly backToTopClasses = computed(() =>
    [
      'terraco-backtop-btn fixed right-4 z-30 inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center gap-1.5 px-3.5 text-[13px] font-medium leading-none text-ink sm:right-6 sm:px-4',
      this.hasFavorites() ? 'bottom-20 sm:bottom-6' : 'bottom-5 sm:bottom-6',
    ].join(' ')
  );

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      const updateVisibility = () => {
        const shouldShow = window.scrollY > BACK_TO_TOP_SCROLL_THRESHOLD;
        if (this.showBackToTop() !== shouldShow) {
          this.showBackToTop.set(shouldShow);
        }
      };

      updateVisibility();
      window.addEventListener('scroll', updateVisibility, { passive: true });
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', updateVisibility);
      });
    });
  }

  scrollToTop(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  }
}
