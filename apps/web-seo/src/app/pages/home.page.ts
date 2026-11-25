import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { GuidedDiscoveryComponent } from '../components/hero/guided-discovery.component';
import { HeroSearchComponent } from '../components/hero/hero-search.component';
import { TrustConciergeComponent } from '../components/hero/trust-concierge.component';
import { FeaturedLaunchesComponent } from '../components/launches/featured-launches.component';
import { FooterComponent, NavbarComponent } from '../components/layout';
import {
  type JourneyDestination,
  NextJourneyComponent,
} from '../components/shared/next-journey.component';
import { SeoService } from '../core';

const HOME_NEXT_DESTINATIONS: readonly JourneyDestination[] = [
  {
    title: 'Catálogo completo em BH',
    description:
      'Filtre por bairro, tipologia e salve seus favoritos para comparar lado a lado.',
    actionLabel: 'Explorar lançamentos',
    route: '/lancamentos',
  },
  {
    title: 'Prime View no Estoril',
    description:
      '2 quartos com suíte, Garden e Coberturas Lineares a 2 minutos da Av. Barão Homem de Melo.',
    actionLabel: 'Conhecer lançamento',
    route: ['/lancamentos', 'prime-view'],
  },
  {
    title: 'Guias de bairros em BH',
    description:
      'Entenda mobilidade, serviços e perfil dos imóveis em Estoril, Santa Efigênia, Serrano e Buritis.',
    actionLabel: 'Ler guia do Estoril',
    route: ['/bairros', 'estoril'],
  },
];

@Component({
  selector: 'app-home-page',
  imports: [
    NavbarComponent,
    HeroSearchComponent,
    GuidedDiscoveryComponent,
    FeaturedLaunchesComponent,
    TrustConciergeComponent,
    NextJourneyComponent,
    FooterComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-dvh flex-col bg-canvas">
      <app-navbar [animateLogo]="true" />
      <main id="homepage" tabindex="-1" class="flex flex-1 flex-col">
        <app-hero-search />
        <app-featured-launches />
        @defer (on viewport; hydrate on viewport) {
          <app-guided-discovery />
        } @placeholder {
          <section
            aria-hidden="true"
            class="min-h-[420px] border-t border-border-subtle bg-surface py-12 sm:py-16 lg:py-24"
          ></section>
        }
        @defer (on viewport; hydrate on viewport) {
          <app-trust-concierge />
        } @placeholder {
          <section
            aria-hidden="true"
            class="min-h-[420px] bg-ink py-12 sm:py-16 lg:py-24"
          ></section>
        }
        <app-next-journey
          heading="Por onde seguir agora"
          subtitle="Escolha um dos caminhos abaixo para continuar sua pesquisa em Belo Horizonte."
          variant="editorial"
          [destinations]="nextDestinations"
        />
      </main>
      <app-footer />
    </div>
  `,
})
export class HomePageComponent implements OnInit {
  private readonly seoService = inject(SeoService);
  readonly nextDestinations = HOME_NEXT_DESTINATIONS;

  ngOnInit(): void {
    this.seoService.updateHomeMeta();
  }
}
