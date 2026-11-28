import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { buildWhatsAppUrl } from '../../core';
import { M3ButtonDirective } from '../shared/m3-tactile.directives';
import { ViewTransitionDirective } from '../shared/view-transition.directive';
import { FooterCobogoBackdropComponent } from './footer-cobogo-backdrop.component';
import { TerracoLogoComponent } from './terraco-logo.component';

@Component({
  selector: 'app-footer',
  imports: [
    RouterLink,
    M3ButtonDirective,
    ViewTransitionDirective,
    FooterCobogoBackdropComponent,
    TerracoLogoComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer
      id="contato"
      appViewTransition="footer"
      class="terraco-cobogo-surface relative isolate mt-auto overflow-hidden border-t border-border-subtle bg-[#103626] scroll-mt-24"
    >
      <app-footer-cobogo-backdrop />
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#103626]/40 via-[#103626]/30 to-[#103626]/20 md:hidden"
      ></div>
      <div
        class="relative z-10 mx-auto flex max-w-7xl flex-col gap-6 px-4 py-14 sm:px-6 sm:py-16 lg:px-8 md:flex-row md:items-end md:justify-between"
      >
        <div class="max-w-md space-y-3">
          <app-terraco-logo [inverted]="true" [animate]="false" />
          <p class="text-base font-normal leading-[1.55] text-ink-inverse/92">
            Curadoria de lançamentos residenciais em Belo Horizonte, com
            atendimento direto no WhatsApp.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-4 sm:gap-6">
          <a
            routerLink="/lancamentos"
            appM3Button
            variant="tonal"
            class="inline-flex min-h-[44px] items-center justify-center border border-ink/10 bg-canvas/88 px-5 py-3 text-[15px] leading-[1.35] backdrop-blur-[2px] hover:bg-elevated focus-visible:text-ink"
          >
            Lançamentos
          </a>
          <a
            [href]="whatsappHref"
            target="_blank"
            rel="noopener noreferrer"
            appM3Button
            variant="tonal"
            class="inline-flex min-h-[44px] items-center justify-center bg-canvas px-6 py-3 text-[15px] leading-[1.35] text-ink shadow-chip hover:bg-surface focus-visible:text-ink"
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>

      <div class="relative z-10 border-t border-ink/12 bg-canvas/76 backdrop-blur-[3px]">
        <div
          class="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-sm font-normal text-ink/80 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"
        >
          <nav
            aria-label="Guias de bairros em BH"
            class="flex flex-wrap items-center gap-x-5 gap-y-1"
          >
            <span class="text-ink/75">Bairros em BH</span>
            @for (guide of neighborhoodGuides; track guide.route) {
              <a
                [routerLink]="guide.route"
                class="terraco-link-nav inline-flex min-h-[44px] items-center px-3 text-ink/85 hover:text-ink focus-visible:text-ink"
              >
                {{ guide.label }}
              </a>
            }
          </nav>

          <div
            class="flex flex-wrap items-center gap-x-4 gap-y-1 tabular-nums text-ink/80"
          >
            <span>© 2026 Terraço</span>
            <span>Belo Horizonte, MG</span>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  readonly neighborhoodGuides = [
    { label: 'Estoril', route: '/bairros/estoril' },
    { label: 'Prado', route: '/bairros/prado' },
    { label: 'Santa Efigênia', route: '/bairros/santa-efigenia' },
    { label: 'Serrano', route: '/bairros/serrano' },
    { label: 'Buritis', route: '/bairros/buritis' },
  ] as const;

  readonly whatsappHref = buildWhatsAppUrl(
    'Oi! Gostaria de conversar sobre um lançamento na Terraço.'
  );
}
