import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent, NavbarComponent } from '../components/layout';
import {
  type JourneyDestination,
  NextJourneyComponent,
} from '../components/shared/next-journey.component';
import {
  BAIRROS_BH,
  type BairroGuide,
  LancamentosService,
  SeoService,
} from '../core';

interface BairroIndexRow {
  readonly bairro: BairroGuide;
  readonly launchCount: number;
  readonly isNearbyOnly: boolean;
  readonly searchQuery: string;
}

const BAIRROS_NEXT_DESTINATIONS: readonly JourneyDestination[] = [
  {
    title: 'Catálogo completo em BH',
    description:
      'Compare plantas, metragens e valores de todos os lançamentos disponíveis na cidade.',
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
];

@Component({
  selector: 'app-bairros-page',
  imports: [
    RouterLink,
    NavbarComponent,
    NextJourneyComponent,
    FooterComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-dvh flex-col bg-canvas">
      <app-navbar />

      <main id="bairros-index" tabindex="-1" class="flex-1">
        <section
          aria-labelledby="bairros-heading"
          class="bg-canvas pt-6 pb-12 sm:pt-10 sm:pb-16 lg:pt-14 lg:pb-20"
        >
          <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav
              aria-label="Navegação estrutural"
              class="mb-4 flex items-center gap-2 text-[13px] font-normal text-ink-muted"
            >
              <a
                routerLink="/"
                class="transition-colors duration-150 hover:text-ink"
              >
                Início
              </a>
              <span aria-hidden="true">/</span>
              <span class="text-ink">Bairros</span>
            </nav>

            <div class="max-w-2xl space-y-3">
              <h1
                id="bairros-heading"
                class="font-display text-[clamp(2rem,4vw,3rem)] font-medium not-italic leading-[1.06] tracking-[-0.03em] text-ink text-balance"
              >
                Bairros em Belo Horizonte
              </h1>
              <p
                class="text-[15px] font-normal leading-[1.55] text-ink-muted sm:text-base"
              >
                Mobilidade, rotina de serviços e perfil dos lançamentos nas
                regiões que acompanhamos em BH.
              </p>
            </div>

            <div
              class="mt-8 divide-y divide-border-subtle border-y border-border-subtle sm:mt-10 lg:mt-12"
            >
              @for (row of bairroRows(); track row.bairro.slug) {
                <article
                  class="grid gap-4 py-7 sm:py-8 lg:grid-cols-12 lg:items-start lg:gap-8 lg:py-9"
                >
                  <div class="space-y-2 lg:col-span-4">
                    <div class="flex flex-wrap items-center gap-2.5">
                      <p class="text-[13px] font-normal text-ink-muted">
                        {{ row.bairro.regiao }}
                      </p>
                      <span
                        class="inline-flex items-center rounded-pill bg-success-bg px-2.5 py-0.5 text-[12px] font-medium leading-[1.3] text-success-fg tabular-nums"
                      >
                        @if (row.launchCount > 0) {
                          {{ row.launchCount }}
                          {{
                            row.launchCount === 1
                              ? row.isNearbyOnly
                                ? 'lançamento próximo'
                                : 'lançamento'
                              : row.isNearbyOnly
                                ? 'lançamentos próximos'
                                : 'lançamentos'
                          }}
                        } @else {
                          Guia completo
                        }
                      </span>
                    </div>

                    <h2
                      class="font-display text-[1.5rem] font-medium not-italic leading-[1.16] tracking-[-0.02em] text-ink text-balance"
                    >
                      <a
                        [routerLink]="['/bairros', row.bairro.slug]"
                        class="transition-colors duration-150 hover:text-action-hover"
                      >
                        {{ row.bairro.nome }}
                      </a>
                    </h2>
                  </div>

                  <div class="space-y-3 lg:col-span-5">
                    <p
                      class="max-w-[54ch] text-[15px] font-normal leading-[1.55] text-ink-muted"
                    >
                      {{ row.bairro.resumo }}
                    </p>
                    <p
                      class="max-w-[54ch] text-[14px] font-normal leading-[1.5] text-ink"
                    >
                      <span class="font-medium">Mobilidade:</span>
                      {{ row.bairro.mobilidade }}
                    </p>
                  </div>

                  <div
                    class="flex flex-wrap items-center gap-4 pt-1 lg:col-span-3 lg:flex-col lg:items-end lg:gap-2 lg:pt-0"
                  >
                    <a
                      [routerLink]="['/bairros', row.bairro.slug]"
                      class="terraco-btn inline-flex min-h-[42px] items-center justify-center rounded-pill bg-action px-5 py-2 text-[13px] font-medium leading-[1.35] text-white hover:bg-action-hover"
                    >
                      Ler guia do bairro
                    </a>

                    @if (row.launchCount > 0) {
                      <a
                        [routerLink]="['/lancamentos']"
                        [queryParams]="{ q: row.searchQuery }"
                        class="terraco-link-underline inline-flex min-h-[40px] items-center text-[13px] font-medium text-ink transition-colors duration-150 hover:text-action-hover"
                      >
                        Ver lançamentos na região
                      </a>
                    }
                  </div>
                </article>
              }
            </div>
          </div>
        </section>

        <app-next-journey
          heading="Continue explorando BH"
          subtitle="Acesse o catálogo completo ou veja o lançamento em destaque."
          variant="editorial"
          [destinations]="nextDestinations"
        />
      </main>

      <app-footer />
    </div>
  `,
})
export class BairrosPageComponent implements OnInit {
  private readonly lancamentosService = inject(LancamentosService);
  private readonly seoService = inject(SeoService);

  readonly bairros = BAIRROS_BH;
  readonly nextDestinations = BAIRROS_NEXT_DESTINATIONS;

  readonly bairroRows = computed<readonly BairroIndexRow[]>(() => {
    const allLaunches = this.lancamentosService.lancamentos();
    return this.bairros.map((bairro) => {
      const directMatches = allLaunches.filter((item) =>
        bairro.matchBairros.some(
          (name) => name.toLowerCase() === item.bairro.trim().toLowerCase()
        )
      );
      if (directMatches.length > 0) {
        return {
          bairro,
          launchCount: directMatches.length,
          isNearbyOnly: false,
          searchQuery: bairro.nome,
        };
      }

      const nearby = bairro.nearbyBairros ?? [];
      const nearbyMatches = allLaunches.filter((item) =>
        nearby.some(
          (name) => name.toLowerCase() === item.bairro.trim().toLowerCase()
        )
      );
      return {
        bairro,
        launchCount: nearbyMatches.length,
        isNearbyOnly: nearbyMatches.length > 0,
        searchQuery: nearby[0] ?? bairro.nome,
      };
    });
  });

  ngOnInit(): void {
    this.seoService.updateBairrosIndexMeta(this.bairros);
  }
}
