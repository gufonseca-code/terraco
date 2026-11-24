import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { BAIRROS_BH, LancamentosService, rankLancamentosByObjetivo } from '../../core';

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

const ARCH_TINT_CLASSES = [
  'bg-brand-container/65',
  'bg-accent-soft/75',
  'bg-highlight-soft/75',
  'bg-surface/90',
] as const;

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

@Component({
  selector: 'app-guided-discovery',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      id="descoberta-guiada"
      aria-labelledby="guided-discovery-heading"
      class="border-t border-border-subtle bg-canvas py-16 sm:py-20 lg:py-24 scroll-mt-20"
    >
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div class="max-w-2xl space-y-2.5">
          <h2
            id="guided-discovery-heading"
            class="font-display text-[clamp(1.75rem,3.2vw,2.375rem)] font-medium not-italic leading-[1.1] tracking-[-0.025em] text-ink text-balance"
          >
            Qual momento combina com você?
          </h2>
          <p class="text-[15px] font-normal leading-[1.58] text-ink-muted">
            Toque nas opções para filtrar em tempo real, sem cadastro e sem compromisso.
          </p>
        </div>

        <div class="mt-8 grid gap-5 lg:grid-cols-12 sm:mt-10">
          <!-- Controles táteis M3 Expressive -->
          <div
            class="terraco-card rounded-xl border border-border-subtle bg-elevated p-5 shadow-card sm:p-7 lg:col-span-7"
          >
            <div class="space-y-6">
              <fieldset class="space-y-2.5">
                <legend class="text-[14px] font-medium leading-[1.35] text-ink">
                  Seu objetivo
                </legend>
                <div class="terraco-m3-group-grid grid-cols-1 sm:grid-cols-3">
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
                <div class="terraco-m3-group-grid grid-cols-1 sm:grid-cols-3">
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
                <div class="terraco-m3-group-grid grid-cols-2 sm:grid-cols-4">
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

            @if (hasSelection()) {
              <div class="mt-6 border-t border-border-subtle pt-4">
                <button
                  type="button"
                  (click)="clearSelections()"
                  class="terraco-link-underline inline-flex min-h-[40px] cursor-pointer items-center px-1 text-[13px] font-normal text-ink-muted transition-colors duration-150 hover:text-ink"
                >
                  Limpar seleção
                </button>
              </div>
            }
          </div>

          <!-- Painel vivo em Verde Musgo Urbano + destaque Ipê Solar -->
          <div
            class="terraco-cobogo-moss flex flex-col justify-between gap-6 rounded-xl bg-brand p-6 text-ink-inverse shadow-floating sm:p-7 lg:col-span-5"
          >
            <div class="space-y-4">
              <div class="space-y-1.5">
                <h3
                  class="font-display text-[1.3125rem] font-medium not-italic leading-[1.2] tracking-[-0.015em] text-ink-inverse text-balance"
                >
                  @if (!hasSelection()) {
                    Sua curadoria em BH
                  } @else if (matchedLancamentos().length > 0) {
                    {{ matchedCountHeadline() }}
                  } @else {
                    Nenhum match exato agora
                  }
                </h3>
                <p class="text-[14px] font-normal leading-[1.5] text-ink-inverse/82">
                  @if (!hasSelection()) {
                    Comece combinando objetivo, tamanho ou bairro ao lado.
                  } @else if (matchedLancamentos().length > 0) {
                    Toque em um lançamento para ver plantas e simular entrada.
                  } @else {
                    Explore o catálogo completo ou cadastre um alerta de bairro.
                  }
                </p>
              </div>

              @if (previewLaunches().length > 0) {
                <ul class="space-y-2.5">
                  @for (launch of previewLaunches(); track launch.slug) {
                    <li>
                      <a
                        [routerLink]="['/lancamentos', launch.slug]"
                        class="group flex items-center gap-3 rounded-[18px] border border-ink-inverse/14 bg-ink-inverse/8 p-2.5 transition-[background-color,border-color] duration-150 hover:border-accent/60 hover:bg-ink-inverse/14"
                      >
                        <img
                          [src]="launch.imagem"
                          [alt]="launch.imagemAlt"
                          width="72"
                          height="54"
                          loading="lazy"
                          decoding="async"
                          class="h-13 w-16 shrink-0 rounded-[12px] object-cover"
                        />
                        <div class="min-w-0 flex-1">
                          <p class="font-display truncate text-[1rem] font-medium leading-[1.25] text-ink-inverse">
                            {{ launch.nome }}
                          </p>
                          <p class="truncate text-[13px] font-normal text-ink-inverse/78 tabular-nums">
                            {{ launch.bairro }} · {{ launch.metragem }}
                          </p>
                        </div>
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.8"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="h-4 w-4 shrink-0 text-accent transition-transform duration-150 group-hover:translate-x-0.5"
                        >
                          <path d="M7.5 5 12.5 10 7.5 15" />
                        </svg>
                      </a>
                    </li>
                  }
                </ul>
              }
            </div>

            <a
              [routerLink]="['/lancamentos']"
              [queryParams]="ctaQueryParams()"
              class="terraco-btn terraco-btn-ipe inline-flex min-h-[48px] w-full items-center justify-center rounded-pill bg-accent px-6 py-3 text-[14px] font-medium leading-[1.35] text-ink hover:bg-accent-hover tabular-nums"
            >
              {{ ctaLabel() }}
            </a>
          </div>
        </div>

        <!-- Bairros em foco (Fachada Viva arched cards) -->
        <div class="mt-14 sm:mt-16">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h3
              class="font-display text-[1.375rem] font-medium not-italic leading-[1.2] tracking-[-0.02em] text-ink text-balance"
            >
              Guias de bairros em Belo Horizonte
            </h3>
            <p class="text-[14px] font-normal text-ink-muted">
              Mobilidade, rotina a pé e lançamentos por região.
            </p>
          </div>

          <nav
            aria-label="Guias de bairros em BH"
            class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            @for (bairro of bairrosGuides; track bairro.slug; let i = $index) {
              <a
                [routerLink]="['/bairros', bairro.slug]"
                [class]="'terraco-arch-card flex flex-col justify-between gap-4 p-5 ' + archTintClass(i)"
              >
                <div class="space-y-1.5 pt-1">
                  <p class="text-[13px] font-normal text-ink-muted">
                    {{ bairro.regiao }}
                  </p>
                  <p
                    class="font-display text-[1.25rem] font-medium leading-[1.2] tracking-[-0.015em] text-ink"
                  >
                    {{ bairro.nome }}
                  </p>
                  <p class="line-clamp-2 text-[14px] font-normal leading-[1.5] text-ink-muted">
                    {{ bairro.resumo }}
                  </p>
                </div>

                <span class="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand">
                  <span>Ver guia do bairro</span>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="h-3.5 w-3.5"
                  >
                    <path d="M7.5 5 12.5 10 7.5 15" />
                  </svg>
                </span>
              </a>
            }
          </nav>
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
  readonly bairrosGuides = BAIRROS_BH;

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

  readonly previewLaunches = computed(() =>
    this.matchedLancamentos().slice(0, 3)
  );

  readonly matchedCountHeadline = computed(() => {
    const count = this.matchedLancamentos().length;
    return count === 1
      ? '1 lançamento combina com você'
      : `${count} lançamentos combinam com você`;
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

  archTintClass(index: number): string {
    return ARCH_TINT_CLASSES[index % ARCH_TINT_CLASSES.length];
  }

  segmentClass(selected: boolean): string {
    const base =
      'terraco-m3-group-item inline-flex min-h-[44px] cursor-pointer items-center justify-center border px-3.5 py-2 text-center text-[13px] leading-[1.35]';
    if (selected) {
      return `${base} border-brand bg-brand font-medium text-ink-inverse shadow-chip hover:bg-brand-hover`;
    }
    return `${base} border-border-subtle bg-surface/70 font-normal text-ink hover:border-border-strong hover:bg-surface`;
  }
}
