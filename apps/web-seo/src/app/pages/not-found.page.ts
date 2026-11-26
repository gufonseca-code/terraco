import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent, NavbarComponent } from '../components/layout';
import {
  type JourneyDestination,
  NextJourneyComponent,
} from '../components/shared/next-journey.component';
import { SeoService } from '../core';

const NOT_FOUND_DESTINATIONS: readonly JourneyDestination[] = [
  {
    title: 'Ver lançamentos em BH',
    description:
      'Explore os empreendimentos disponíveis com plantas e condições abertas.',
    actionLabel: 'Abrir catálogo',
    route: '/lancamentos',
  },
  {
    title: 'Voltar para o início',
    description:
      'Use a busca rápida por bairro ou lançamento direto da página inicial.',
    actionLabel: 'Ir para a Home',
    route: '/',
  },
  {
    title: 'Guias de bairros em BH',
    description:
      'Conheça mobilidade, rotina e lançamentos nos principais bairros.',
    actionLabel: 'Explorar bairros',
    route: '/bairros',
  },
];

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, NavbarComponent, NextJourneyComponent, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-dvh flex-col bg-canvas">
      <app-navbar />
      <main
        id="homepage"
        tabindex="-1"
        class="flex flex-1 flex-col"
      >
        <div class="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <div class="terraco-reveal max-w-md space-y-4">
            <h1 class="font-display text-[clamp(2.25rem,4.5vw,3.25rem)] font-medium leading-[1.06] tracking-[-0.03em] text-ink text-balance">
              404
            </h1>
            <h2 class="text-base font-normal leading-[1.55] text-ink-muted">
              This page could not be found.
            </h2>
            <div class="pt-4">
              <a
                routerLink="/lancamentos"
                class="terraco-btn terraco-btn-moss inline-flex min-h-[44px] items-center justify-center rounded-pill bg-brand px-6 py-3 text-[15px] font-medium leading-[1.35] text-ink-inverse hover:bg-brand-hover"
              >
                Ver lançamentos
              </a>
            </div>
          </div>
        </div>

        <app-next-journey
          heading="Continue navegando"
          [destinations]="destinations"
        />
      </main>
      <app-footer />
    </div>
  `,
})
export class NotFoundPageComponent implements OnInit {
  private readonly seoService = inject(SeoService);
  readonly destinations = NOT_FOUND_DESTINATIONS;

  ngOnInit(): void {
    this.seoService.updateNotFoundMeta();
  }
}
