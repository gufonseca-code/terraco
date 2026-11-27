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
      class="terraco-cobogo-surface mt-auto border-t border-border-subtle bg-surface scroll-mt-24"
    >
      <div
        class="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 sm:py-14 lg:px-8 md:flex-row md:items-end md:justify-between"
      >
        <div class="max-w-md space-y-3">
          <app-terraco-logo [animate]="false" />
          <p class="text-base font-normal leading-[1.55] text-ink-muted">
            Curadoria de lançamentos residenciais em Belo Horizonte, com
            atendimento direto no WhatsApp.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-6">
          <a
            routerLink="/lancamentos"
            class="terraco-link-underline inline-flex min-h-[44px] items-center px-1 text-[15px] font-normal leading-[1.35] text-ink-muted transition-colors duration-150 motion-reduce:transition-none hover:text-ink"
          >
            Lançamentos
          </a>
          <a
            [href]="whatsappHref"
            target="_blank"
            rel="noopener noreferrer"
            class="terraco-btn inline-flex min-h-[44px] items-center justify-center rounded-pill bg-action px-6 py-3 text-[15px] font-medium leading-[1.35] text-white hover:bg-action-hover"
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>

      <div class="border-t border-border-subtle/80">
        <div
          class="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-sm font-normal text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"
        >
          <nav
            aria-label="Guias de bairros em BH"
            class="flex flex-wrap items-center gap-x-5 gap-y-1"
          >
            <span class="text-ink-muted/80">Bairros em BH</span>
            @for (guide of neighborhoodGuides; track guide.route) {
              <a
                [routerLink]="guide.route"
                class="terraco-link-underline inline-flex min-h-[44px] items-center text-ink-muted transition-colors duration-150 motion-reduce:transition-none hover:text-ink focus-visible:text-ink"
              >
                {{ guide.label }}
              </a>
            }
          </nav>

          <div
            class="flex flex-wrap items-center gap-x-4 gap-y-1 tabular-nums"
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
