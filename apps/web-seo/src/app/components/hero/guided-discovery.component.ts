import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LancamentosService, rankLancamentosByObjetivo } from '../../core';
import { SectionHandoffComponent } from '../shared/section-handoff.component';

type ObjetivoOption = 'Sair do aluguel' | 'Dar um upgrade' | 'Investir';
type TipologiaOption =
  | 'Studio ou 1 quarto'
  | '2 quartos com suíte'
  | 'Garden ou cobertura';
type RegiaoOption =
  | 'Estoril / Buritis'
  | 'Santa Efigênia'
  | 'Serrano / Castelo'
  | 'Qualquer região';

interface NeighborhoodGuideLink {
  readonly label: string;
  readonly route: string;
}

const OBJETIVO_OPTIONS: readonly ObjetivoOption[] = [
  'Sair do aluguel',
  'Dar um upgrade',
  'Investir',
];

const TIPOLOGIA_OPTIONS: readonly TipologiaOption[] = [
  'Studio ou 1 quarto',
  '2 quartos com suíte',
  'Garden ou cobertura',
];

const REGIAO_OPTIONS: readonly RegiaoOption[] = [
  'Estoril / Buritis',
  'Santa Efigênia',
  'Serrano / Castelo',
  'Qualquer região',
];

const TIPOLOGIA_MATCHERS: Record<
  TipologiaOption,
  { readonly keywords: readonly string[]; readonly query: string }
> = {
  'Studio ou 1 quarto': {
    keywords: ['studio', '1 quarto'],
    query: 'Studio',
  },
  '2 quartos com suíte': {
    keywords: ['2 quartos', '2 suites'],
    query: '2 quartos',
  },
  'Garden ou cobertura': {
    keywords: ['garden', 'cobertura'],
    query: 'Garden',
  },
};

const REGIAO_MATCHERS: Record<
  RegiaoOption,
  { readonly keywords: readonly string[]; readonly query: string | null }
> = {
  'Estoril / Buritis': {
    keywords: ['estoril', 'buritis'],
    query: 'Estoril',
  },
  'Santa Efigênia': {
    keywords: ['santa efigenia'],
    query: 'Santa Efigênia',
  },
  'Serrano / Castelo': {
    keywords: ['serrano', 'castelo'],
    query: 'Serrano',
  },
  'Qualquer região': {
    keywords: [],
    query: null,
  },
};

const NEIGHBORHOOD_GUIDES: readonly NeighborhoodGuideLink[] = [
  { label: 'Estoril', route: '/bairros/estoril' },
  { label: 'Santa Efigênia', route: '/bairros/santa-efigenia' },
  { label: 'Serrano', route: '/bairros/serrano' },
  { label: 'Buritis', route: '/bairros/buritis' },
];

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

@Component({
  selector: 'app-guided-discovery',
  imports: [RouterLink, SectionHandoffComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      id="descoberta-guiada"
      aria-labelledby="guided-discovery-heading"
      class="border-t border-border-subtle bg-canvas py-16 sm:py-20 lg:py-24 scroll-mt-20"
    >
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          class="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-x-12 lg:gap-y-8 xl:gap-x-16"
        >
          <div class="max-w-xl space-y-3 lg:col-span-5 lg:col-start-1 lg:row-start-1">
            <h2
              id="guided-discovery-heading"
              class="font-display text-[clamp(1.75rem,3vw,2.25rem)] font-medium not-italic leading-[1.12] tracking-[-0.025em] text-ink text-balance"
            >
              Qual momento combina com você?
            </h2>
            <p class="text-[16px] font-normal leading-[1.55] text-ink-muted">
              Combine objetivo, tipologia e região sem cadastro.
            </p>
          </div>

          <div
            class="terraco-plate rounded-[28px] bg-elevated p-6 sm:p-8 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1"
          >
            <div class="space-y-6 sm:space-y-7">
              <fieldset class="space-y-2.5">
                <legend class="text-[14px] font-medium leading-[1.35] text-ink">
                  Seu objetivo
                </legend>
                <div class="terraco-m3-group-grid grid-cols-1 sm:w-fit sm:grid-cols-3">
                  @for (option of objetivoOptions; track option) {
                    <button
                      type="button"
                      [attr.aria-pressed]="objetivo() === option"
                      (click)="toggleObjetivo(option)"
                      [class]="segmentClass(objetivo() === option)"
                    >
                      {{ option }}
                    </button>
                  }
                </div>
              </fieldset>

              <fieldset class="space-y-2.5">
                <legend class="text-[14px] font-medium leading-[1.35] text-ink">
                  Tipologia
                </legend>
                <div class="terraco-m3-group-grid grid-cols-1 sm:w-fit sm:grid-cols-3">
                  @for (option of tipologiaOptions; track option) {
                    <button
                      type="button"
                      [attr.aria-pressed]="tipologia() === option"
                      (click)="toggleTipologia(option)"
                      [class]="segmentClass(tipologia() === option)"
                    >
                      {{ option }}
                    </button>
                  }
                </div>
              </fieldset>

              <fieldset class="space-y-2.5">
                <legend class="text-[14px] font-medium leading-[1.35] text-ink">
                  Região de BH
                </legend>
                <div class="terraco-m3-group-grid grid-cols-2 sm:w-fit sm:grid-cols-4">
                  @for (option of regiaoOptions; track option) {
                    <button
                      type="button"
                      [attr.aria-pressed]="regiao() === option"
                      (click)="toggleRegiao(option)"
                      [class]="segmentClass(regiao() === option)"
                    >
                      {{ option }}
                    </button>
                  }
                </div>
              </fieldset>
            </div>
          </div>

          <div
            class="rounded-[24px] bg-surface/70 p-5 sm:p-6 lg:col-span-5 lg:col-start-1 lg:row-start-2"
          >
            <div class="text-[15px] font-normal leading-[1.55] text-ink-muted">
              @if (hasSelection()) {
                @if (matchedLancamentos().length > 0) {
                  <p class="tabular-nums text-ink">
                    {{ matchedSummary() }}
                  </p>
                } @else {
                  <p>
                    Nenhum lançamento exato com essa combinação. Explore o
                    catálogo completo em BH.
                  </p>
                }
              } @else {
                <p>
                  Escolha uma ou mais opções para ver quais lançamentos combinam
                  com o seu momento.
                </p>
              }
            </div>

            <div class="mt-5 flex flex-wrap items-center gap-4">
              <a
                [routerLink]="['/lancamentos']"
                [queryParams]="ctaQueryParams()"
                class="terraco-btn terraco-btn-moss inline-flex min-h-[44px] items-center justify-center rounded-pill bg-brand px-6 py-2.5 text-[14px] font-medium leading-[1.35] text-ink-inverse hover:bg-brand-hover tabular-nums"
              >
                {{ ctaLabel() }}
              </a>

              @if (hasSelection()) {
                <button
                  type="button"
                  (click)="clearSelections()"
                  class="terraco-link-underline inline-flex min-h-[44px] items-center px-1 text-[14px] font-normal text-ink-muted transition-colors duration-150 hover:text-ink"
                >
                  Limpar
                </button>
              }
            </div>
          </div>
        </div>

        <div class="mt-10 flex flex-col gap-3 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
          <nav
            aria-label="Guias de bairros em BH"
            class="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm"
          >
            <span class="font-medium text-ink">Guias de bairros em BH</span>
            @for (guide of neighborhoodGuides; track guide.route) {
              <a
                [routerLink]="guide.route"
                class="terraco-link-underline inline-flex min-h-[44px] items-center font-normal text-ink-muted transition-colors duration-150 hover:text-ink focus-visible:text-ink"
              >
                {{ guide.label }}
              </a>
            }
          </nav>

          <app-section-handoff
            label="Como funciona o atendimento"
            targetId="como-funciona"
          />
        </div>
      </div>
    </section>
  `,
})
export class GuidedDiscoveryComponent {
  private readonly lancamentosService = inject(LancamentosService);

  readonly objetivoOptions = OBJETIVO_OPTIONS;
  readonly tipologiaOptions = TIPOLOGIA_OPTIONS;
  readonly regiaoOptions = REGIAO_OPTIONS;
  readonly neighborhoodGuides = NEIGHBORHOOD_GUIDES;

  readonly objetivo = signal<ObjetivoOption | null>(null);
  readonly tipologia = signal<TipologiaOption | null>(null);
  readonly regiao = signal<RegiaoOption | null>(null);

  readonly hasSelection = computed(
    () =>
      this.objetivo() !== null ||
      this.tipologia() !== null ||
      this.regiao() !== null
  );

  readonly matchedLancamentos = computed(() => {
    const items = this.lancamentosService.lancamentos();
    const selectedTipologia = this.tipologia();
    const selectedRegiao = this.regiao();
    const selectedObjetivo = this.objetivo();

    const filtered = items.filter((item) => {
      if (selectedRegiao && selectedRegiao !== 'Qualquer região') {
        const regiaoText = normalizeText(
          `${item.bairro} ${item.endereco} ${item.resumo}`
        );
        const regiaoKeywords = REGIAO_MATCHERS[selectedRegiao].keywords;
        const matchesRegiao = regiaoKeywords.some((keyword) =>
          regiaoText.includes(keyword)
        );
        if (!matchesRegiao) {
          return false;
        }
      }

      if (selectedTipologia) {
        const tipologiaText = normalizeText(
          `${item.quartos} ${item.tipologias} ${item.resumo}`
        );
        const tipologiaKeywords = TIPOLOGIA_MATCHERS[selectedTipologia].keywords;
        const matchesTipologia = tipologiaKeywords.some((keyword) =>
          tipologiaText.includes(keyword)
        );
        if (!matchesTipologia) {
          return false;
        }
      }

      return true;
    });

    return rankLancamentosByObjetivo(filtered, selectedObjetivo);
  });

  readonly matchedSummary = computed(() => {
    const matches = this.matchedLancamentos();
    const names = matches.map((item) => item.nome).join(', ');
    if (matches.length === 1) {
      return `1 lançamento combina com sua seleção: ${names}.`;
    }
    return `${matches.length} lançamentos combinam com sua seleção: ${names}.`;
  });

  readonly ctaLabel = computed(() => {
    if (!this.hasSelection()) {
      return 'Explorar lançamentos';
    }
    const count = this.matchedLancamentos().length;
    if (count === 0) {
      return 'Explorar lançamentos';
    }
    if (count === 1) {
      return 'Ver 1 lançamento recomendado';
    }
    return `Ver ${count} lançamentos recomendados`;
  });

  readonly ctaQueryParams = computed<Record<string, string>>(
    (): Record<string, string> => {
      if (!this.hasSelection() || this.matchedLancamentos().length === 0) {
        return {};
      }

      const params: Record<string, string> = {};
      const selectedRegiao = this.regiao();
      if (selectedRegiao) {
        const regiaoQuery = REGIAO_MATCHERS[selectedRegiao].query;
        if (regiaoQuery) {
          params['q'] = regiaoQuery;
        }
      }

      const selectedTipologia = this.tipologia();
      if (selectedTipologia) {
        params['tipologia'] = TIPOLOGIA_MATCHERS[selectedTipologia].query;
      }

      const selectedObjetivo = this.objetivo();
      if (selectedObjetivo) {
        params['objetivo'] = selectedObjetivo;
      }

      return params;
    }
  );

  toggleObjetivo(option: ObjetivoOption): void {
    this.objetivo.update((current) => (current === option ? null : option));
  }

  toggleTipologia(option: TipologiaOption): void {
    this.tipologia.update((current) => (current === option ? null : option));
  }

  toggleRegiao(option: RegiaoOption): void {
    this.regiao.update((current) => (current === option ? null : option));
  }

  clearSelections(): void {
    this.objetivo.set(null);
    this.tipologia.set(null);
    this.regiao.set(null);
  }

  segmentClass(selected: boolean): string {
    const base =
      'terraco-m3-group-item inline-flex min-h-[44px] cursor-pointer items-center justify-center border px-4 py-2 text-center text-[13px] leading-[1.35]';
    if (selected) {
      return `${base} border-brand bg-brand font-medium text-ink-inverse shadow-chip hover:bg-brand-hover`;
    }
    return `${base} border-border-subtle bg-surface/75 font-normal text-ink hover:border-border-strong hover:bg-surface`;
  }
}
