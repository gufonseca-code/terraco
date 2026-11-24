import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { QUICK_NEIGHBORHOODS, SEARCH_SUGGESTIONS } from '../../core';
import { HeroIllustrationComponent } from './hero-illustration.component';
import { HeroSearchFormComponent } from './hero-search-form.component';

@Component({
  selector: 'app-hero-search',
  imports: [RouterLink, HeroSearchFormComponent, HeroIllustrationComponent],
  host: {
    class: 'flex flex-1 flex-col',
  },
  template: `
    <section
      aria-labelledby="hero-heading"
      class="relative -mt-[58px] flex flex-1 flex-col overflow-hidden bg-canvas pt-[76px] pb-12 sm:-mt-[68px] sm:pt-[108px] sm:pb-16 lg:justify-center lg:pt-[116px] lg:pb-20"
    >
      <!-- Luz solar quente sutil inspirada no Ipê Amarelo atrás da fachada -->
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_82%_26%,rgba(238,181,6,0.14),transparent_72%)]"
      ></div>

      <!-- Rail editorial alinhado à Navbar -->
      <div class="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          class="relative space-y-6 py-4 sm:space-y-7 sm:py-8 lg:max-w-[52%] lg:space-y-8 lg:py-10"
        >
          <!-- Véu sutil de Creme Papel no mobile para contraste impecável sobre a fachada -->
          <div
            aria-hidden="true"
            class="pointer-events-none absolute -inset-x-4 -top-6 -bottom-24 -z-10 bg-gradient-to-b from-canvas/96 via-canvas/92 via-76% to-transparent md:hidden"
          ></div>

          <div class="terraco-reveal space-y-4">
            <h1
              id="hero-heading"
              class="font-display max-w-[13ch] text-[clamp(2.375rem,5.2vw,3.625rem)] font-medium not-italic leading-[1.03] tracking-[-0.03em] text-ink text-balance"
            >
              Seu próximo canto, sem burocracia.
            </h1>

            <p
              class="max-w-[40ch] text-[16px] font-normal leading-[1.58] text-ink-muted"
            >
              Lançamentos selecionados em Belo Horizonte, com plantas abertas e atendimento direto no WhatsApp.
            </p>
          </div>

          <div class="terraco-reveal-delay space-y-4">
            <app-hero-search-form [suggestions]="suggestions" />

            <nav
              aria-label="Bairros em destaque"
              class="flex flex-wrap items-center gap-2 pt-0.5"
            >
              @for (bairro of quickNeighborhoods; track bairro) {
                <a
                  [routerLink]="['/lancamentos']"
                  [queryParams]="{ q: bairro }"
                  class="terraco-m3-chip inline-flex min-h-[40px] items-center border border-border-subtle bg-elevated/92 px-4 py-1.5 text-[13px] font-normal text-ink shadow-chip backdrop-blur-xs hover:border-brand/40 hover:bg-surface"
                >
                  {{ bairro }}
                </a>
              }
              <a
                href="#lancamentos-selecionados"
                (click)="scrollToFeatured($event)"
                class="terraco-link-underline inline-flex min-h-[40px] items-center px-2 text-[14px] font-medium text-brand transition-colors duration-150 hover:text-brand-hover focus-visible:text-brand-hover"
              >
                Ver lançamentos
              </a>
            </nav>
          </div>
        </div>
      </div>

      <!-- Fachada arquitetônica brasileira em camadas ancorada na borda direita -->
      <app-hero-illustration />
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSearchComponent {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  readonly suggestions = SEARCH_SUGGESTIONS;
  readonly quickNeighborhoods = QUICK_NEIGHBORHOODS;

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
