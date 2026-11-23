import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { QUICK_NEIGHBORHOODS, SEARCH_SUGGESTIONS } from '../../core';
import { HeroIllustrationComponent } from './hero-illustration.component';
import { HeroSearchFormComponent } from './hero-search-form.component';

const HERO_HEADING_TEXT = 'Seu próximo canto, sem burocracia.';
const HERO_HEADING_CHARS = Array.from(HERO_HEADING_TEXT);
const TYPEWRITER_CHAR_MS = 58;
const TYPEWRITER_END_HOLD_MS = 700;

@Component({
  selector: 'app-hero-search',
  imports: [RouterLink, HeroSearchFormComponent, HeroIllustrationComponent],
  host: {
    class: 'flex flex-1 flex-col',
  },
  template: `
    <section
      aria-labelledby="hero-heading"
      class="relative flex flex-1 flex-col overflow-hidden lg:justify-center"
    >
      <!-- Rail editorial alinhado à Navbar -->
      <div class="relative z-10 mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div
          class="relative space-y-5 py-6 sm:space-y-6 sm:py-8 lg:max-w-[50%] lg:space-y-8 lg:py-12"
        >
          <!-- Véu sutil de Creme Papel no mobile para preservar contraste sobre a fachada -->
          <div
            aria-hidden="true"
            class="pointer-events-none absolute -inset-x-6 top-0 -bottom-20 -z-10 bg-gradient-to-b from-canvas/95 via-canvas/92 via-78% to-transparent md:hidden"
          ></div>
          <div class="space-y-4">
            <h1
              id="hero-heading"
              class="font-display text-[clamp(2.25rem,4.5vw,3.25rem)] font-medium leading-[1.06] tracking-[-0.03em] text-ink max-w-[14ch] text-balance"
            >
              <span class="sr-only">{{ fullHeading }}</span>
              <span aria-hidden="true">
                @if (isTyping() && visibleCount() === 0) {<span
                  class="terraco-typewriter-caret"
                ></span>}@for (char of headingChars; track $index) {<span
                  class="terraco-typewriter-char"
                  [class.is-visible]="$index < visibleCount()"
                >{{ char }}</span>@if (isTyping() && $index === visibleCount() - 1) {<span
                  class="terraco-typewriter-caret"
                ></span>}}
              </span>
            </h1>

            <p
              animate.enter="terraco-reveal"
              class="text-base font-normal leading-[1.55] text-ink-muted max-w-[42ch] md:max-w-[30ch] lg:max-w-[42ch]"
            >
              Lançamentos em Belo Horizonte, direto no WhatsApp.
            </p>
          </div>

          <div animate.enter="terraco-reveal-delay" class="space-y-3">
            <app-hero-search-form [suggestions]="suggestions" />

            <nav
              aria-label="Bairros em destaque"
              class="flex flex-wrap items-center gap-x-6 gap-y-1 pl-1"
            >
              @for (bairro of quickNeighborhoods; track bairro) {
                <a
                  [routerLink]="['/lancamentos']"
                  [queryParams]="{ q: bairro }"
                  class="terraco-link-underline inline-flex min-h-[44px] items-center text-sm font-normal text-ink-muted transition-colors duration-150 hover:text-ink focus-visible:text-ink"
                >
                  {{ bairro }}
                </a>
              }
              <a
                href="#lancamentos-selecionados"
                (click)="scrollToFeatured($event)"
                class="terraco-link-underline inline-flex min-h-[44px] items-center text-sm font-medium text-brand transition-colors duration-150 hover:text-brand-hover focus-visible:text-brand-hover"
              >
                Ver lançamentos
              </a>
            </nav>
          </div>
        </div>
      </div>

      <!-- Fachada arquitetônica ancorada na borda direita e base do viewport -->
      <app-hero-illustration />
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSearchComponent {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly fullHeading = HERO_HEADING_TEXT;
  readonly headingChars = HERO_HEADING_CHARS;
  readonly visibleCount = signal(HERO_HEADING_CHARS.length);
  readonly isTyping = signal(false);

  readonly suggestions = SEARCH_SUGGESTIONS;
  readonly quickNeighborhoods = QUICK_NEIGHBORHOODS;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    let stepTimer: number | null = null;
    let holdTimer: number | null = null;

    this.destroyRef.onDestroy(() => {
      if (stepTimer !== null) {
        window.clearInterval(stepTimer);
      }
      if (holdTimer !== null) {
        window.clearTimeout(holdTimer);
      }
    });

    afterNextRender(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      let index = 0;
      this.visibleCount.set(0);
      this.isTyping.set(true);

      stepTimer = window.setInterval(() => {
        index += 1;
        this.visibleCount.set(index);

        if (index >= HERO_HEADING_CHARS.length) {
          if (stepTimer !== null) {
            window.clearInterval(stepTimer);
            stepTimer = null;
          }
          holdTimer = window.setTimeout(() => {
            this.isTyping.set(false);
          }, TYPEWRITER_END_HOLD_MS);
        }
      }, TYPEWRITER_CHAR_MS);
    });
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
