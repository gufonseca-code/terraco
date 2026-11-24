import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { buildWhatsAppUrl } from '../../core';
import { TerracoLogoComponent } from './terraco-logo.component';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, TerracoLogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer
      id="contato"
      class="terraco-cobogo-moss mt-auto bg-brand text-ink-inverse scroll-mt-24"
    >
      <div
        class="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-14 sm:py-16 lg:px-8 md:flex-row md:items-end md:justify-between"
      >
        <div class="max-w-md space-y-3.5">
          <app-terraco-logo [inverted]="true" [animate]="false" />
          <p class="text-[15px] font-normal leading-[1.6] text-ink-inverse/82">
            Imobiliária digital de lançamentos em Belo Horizonte. Plantas abertas, condições claras e conversa humana direto no WhatsApp.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-4 sm:gap-5">
          <a
            routerLink="/lancamentos"
            class="terraco-link-underline inline-flex min-h-[44px] items-center px-1 text-[14px] font-normal leading-[1.35] text-ink-inverse/85 transition-colors duration-150 hover:text-ink-inverse"
          >
            Lançamentos
          </a>
          <a
            [href]="whatsappHref"
            target="_blank"
            rel="noopener noreferrer"
            class="terraco-btn terraco-btn-ipe inline-flex min-h-[46px] items-center justify-center rounded-pill bg-accent px-6 py-3 text-[14px] font-medium leading-[1.35] text-ink hover:bg-accent-hover"
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>

      <div class="border-t border-ink-inverse/15">
        <div
          class="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-5 text-[14px] font-normal text-ink-inverse/75 sm:flex-row sm:items-center sm:justify-between lg:px-8"
        >
          <nav
            aria-label="Guias de bairros em BH"
            class="flex flex-wrap items-center gap-x-5 gap-y-1"
          >
            <span class="text-ink-inverse/60">Bairros em BH</span>
            @for (guide of neighborhoodGuides; track guide.route) {
              <a
                [routerLink]="guide.route"
                class="terraco-link-underline inline-flex min-h-[44px] items-center text-ink-inverse/82 transition-colors duration-150 hover:text-ink-inverse focus-visible:text-ink-inverse"
              >
                {{ guide.label }}
              </a>
            }
          </nav>

          <div
            class="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] tabular-nums text-ink-inverse/70"
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
    { label: 'Santa Efigênia', route: '/bairros/santa-efigenia' },
    { label: 'Serrano', route: '/bairros/serrano' },
    { label: 'Buritis', route: '/bairros/buritis' },
  ] as const;

  readonly whatsappHref = buildWhatsAppUrl(
    'Oi! Gostaria de conversar sobre um lançamento na Terraço.'
  );
}
