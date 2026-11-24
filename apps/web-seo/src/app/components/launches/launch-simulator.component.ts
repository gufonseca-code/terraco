import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  ENABLE_FLUTTER_APP_LINKS,
  FavoritesService,
  LancamentosService,
  buildWhatsAppUrl,
  formatCurrencyBRL,
  type Lancamento,
} from '../../core';

const MIN_PROPERTY_VALUE = 300_000;
const MAX_PROPERTY_VALUE = 2_000_000;
const PROPERTY_VALUE_STEP = 10_000;
const DEFAULT_PROPERTY_VALUE = 450_000;
const MAX_ENTRY_RATIO = 0.8;
const ANNUAL_INTEREST_RATE = 0.0999;
const MONTHLY_INTEREST_RATE = Math.pow(1 + ANNUAL_INTEREST_RATE, 1 / 12) - 1;

const DOWN_PAYMENT_PRESETS = [10, 20, 30] as const;

interface FgtsPreset {
  readonly value: number;
  readonly label: string;
}

const FGTS_PRESETS: readonly FgtsPreset[] = [
  { value: 0, label: 'R$ 0' },
  { value: 30_000, label: 'R$ 30 mil' },
  { value: 60_000, label: 'R$ 60 mil' },
  { value: 100_000, label: 'R$ 100 mil' },
];

const TERM_YEAR_PRESETS = [20, 30, 35] as const;

function resolveInitialPropertyValue(item: Lancamento): number {
  const price = item.precoAPartirDe;
  if (typeof price === 'number' && Number.isFinite(price) && price > 0) {
    return Math.min(MAX_PROPERTY_VALUE, Math.max(MIN_PROPERTY_VALUE, price));
  }
  return DEFAULT_PROPERTY_VALUE;
}

@Component({
  selector: 'app-launch-simulator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
  styles: `
    .simulator-range {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 6px;
      border-radius: 9999px;
      background-color: var(--color-border-subtle);
      cursor: pointer;
    }

    .simulator-range::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 22px;
      height: 22px;
      border-radius: 9999px;
      background-color: var(--color-brand-primary);
      border: 3px solid var(--color-bg-elevated);
      box-shadow: 0 2px 8px rgba(30, 29, 27, 0.18);
      transition: transform 140ms var(--ease-ui), background-color 140ms var(--ease-ui);
    }

    .simulator-range::-webkit-slider-thumb:hover {
      background-color: var(--color-brand-primary-hover);
      transform: scale(1.06);
    }

    .simulator-range::-moz-range-thumb {
      width: 22px;
      height: 22px;
      border-radius: 9999px;
      background-color: var(--color-brand-primary);
      border: 3px solid var(--color-bg-elevated);
      box-shadow: 0 2px 8px rgba(30, 29, 27, 0.18);
      transition: transform 140ms var(--ease-ui), background-color 140ms var(--ease-ui);
    }

    .simulator-range::-moz-range-thumb:hover {
      background-color: var(--color-brand-primary-hover);
      transform: scale(1.06);
    }
  `,
  template: `
    <section
      id="simulador"
      aria-labelledby="simulator-heading"
      data-testid="launch-simulator"
      class="rounded-lg border border-border-subtle bg-elevated p-5 sm:p-8 scroll-mt-24"
    >
      <div class="space-y-1.5">
        <h2
          id="simulator-heading"
          class="font-display text-[clamp(1.25rem,2vw,1.5rem)] font-medium not-italic leading-[1.2] tracking-[-0.015em] text-ink text-balance"
        >
          Simule entrada e parcela
        </h2>
        <p class="text-[14px] font-normal leading-[1.5] text-ink-muted sm:text-[15px]">
          Ajuste valor, entrada, FGTS e prazo para estimar o financiamento do {{ item().nome }}.
        </p>
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-12 lg:gap-8">
        <!-- Controles da simulação -->
        <div class="space-y-5 lg:col-span-7">
          <div class="space-y-2.5">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <label
                for="simulator-property-value"
                class="text-[14px] font-normal text-ink"
              >
                Valor do imóvel
              </label>
              <span
                data-testid="simulator-property-value-display"
                class="text-[18px] font-medium leading-[1.2] tracking-[-0.01em] text-ink tabular-nums"
              >
                {{ formattedPropertyValue() }}
              </span>
            </div>

            <input
              id="simulator-property-value"
              type="range"
              [min]="minPropertyValue"
              [max]="maxPropertyValue"
              [step]="propertyValueStep"
              [value]="propertyValue()"
              (input)="onPropertyValueInput($event)"
              aria-label="Valor do imóvel para simulação"
              class="simulator-range"
            />

            <div class="flex items-center justify-between gap-2 text-[13px] font-normal text-ink-muted">
              <span class="tabular-nums">{{ formattedMinValue }}</span>
              <span>{{ propertyValueHint() }}</span>
              <span class="tabular-nums">{{ formattedMaxValue }}</span>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-baseline justify-between gap-2">
              <span class="text-[14px] font-normal text-ink">Entrada em recursos próprios</span>
              <span class="text-[13px] font-normal text-ink-muted tabular-nums">
                {{ formattedCashDownPayment() }}
              </span>
            </div>
            <div
              role="group"
              aria-label="Percentual de entrada"
              class="terraco-m3-group"
            >
              @for (percent of downPaymentPresets; track percent) {
                <button
                  type="button"
                  (click)="selectDownPaymentPercent(percent)"
                  [attr.aria-pressed]="downPaymentPercent() === percent"
                  [class]="
                    downPaymentPercent() === percent
                      ? 'terraco-m3-group-item flex min-h-[42px] flex-1 cursor-pointer items-center justify-center border border-brand bg-brand px-3 py-1.5 text-[13px] font-medium leading-[1.3] text-ink-inverse tabular-nums shadow-chip'
                      : 'terraco-m3-group-item flex min-h-[42px] flex-1 cursor-pointer items-center justify-center border border-border-subtle bg-surface/75 px-3 py-1.5 text-[13px] font-normal leading-[1.3] text-ink tabular-nums hover:border-border-strong hover:bg-surface'
                  "
                >
                  {{ percent }}%
                </button>
              }
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-baseline justify-between gap-2">
              <span class="text-[14px] font-normal text-ink">Uso de FGTS</span>
              <span class="text-[13px] font-normal text-ink-muted tabular-nums">
                {{ formattedFgts() }}
              </span>
            </div>
            <div
              role="group"
              aria-label="Valor estimado de FGTS"
              class="terraco-m3-group-grid grid-cols-2 sm:grid-cols-4"
            >
              @for (preset of fgtsPresets; track preset.value) {
                <button
                  type="button"
                  (click)="selectFgtsAmount(preset.value)"
                  [attr.aria-pressed]="clampedFgts() === preset.value"
                  [class]="
                    clampedFgts() === preset.value
                      ? 'terraco-m3-group-item flex min-h-[42px] cursor-pointer items-center justify-center border border-brand bg-brand px-3 py-1.5 text-[13px] font-medium leading-[1.3] text-ink-inverse tabular-nums shadow-chip'
                      : 'terraco-m3-group-item flex min-h-[42px] cursor-pointer items-center justify-center border border-border-subtle bg-surface/75 px-3 py-1.5 text-[13px] font-normal leading-[1.3] text-ink tabular-nums hover:border-border-strong hover:bg-surface'
                  "
                >
                  {{ preset.label }}
                </button>
              }
            </div>
          </div>

          <div class="space-y-2">
            <span class="block text-[14px] font-normal text-ink">Prazo de financiamento</span>
            <div
              role="group"
              aria-label="Prazo de financiamento em anos"
              class="terraco-m3-group"
            >
              @for (years of termYearPresets; track years) {
                <button
                  type="button"
                  (click)="selectTermYears(years)"
                  [attr.aria-pressed]="termYears() === years"
                  [class]="
                    termYears() === years
                      ? 'terraco-m3-group-item flex min-h-[42px] flex-1 cursor-pointer items-center justify-center border border-brand bg-brand px-3 py-1.5 text-[13px] font-medium leading-[1.3] text-ink-inverse tabular-nums shadow-chip'
                      : 'terraco-m3-group-item flex min-h-[42px] flex-1 cursor-pointer items-center justify-center border border-border-subtle bg-surface/75 px-3 py-1.5 text-[13px] font-normal leading-[1.3] text-ink tabular-nums hover:border-border-strong hover:bg-surface'
                  "
                >
                  {{ years }} anos
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Resumo da simulação + ponte para o App Flutter -->
        <div
          class="flex flex-col justify-between gap-5 rounded-md border border-border-subtle bg-canvas p-5 lg:col-span-5"
        >
          <div class="space-y-4">
            <div class="space-y-1">
              <p class="text-[13px] font-normal text-ink-muted">
                Parcela mensal estimada
              </p>
              <p
                data-testid="simulator-monthly-payment"
                class="font-display text-[clamp(1.75rem,3vw,2.125rem)] font-medium not-italic leading-[1.1] tracking-[-0.02em] text-brand tabular-nums"
              >
                {{ formattedMonthlyPayment() }}
                <span class="font-sans text-[14px] font-normal text-ink-muted">/mês</span>
              </p>
            </div>

            <dl class="space-y-2.5 border-t border-border-subtle pt-4">
              <div class="flex items-baseline justify-between gap-3">
                <dt class="text-[13px] font-normal text-ink-muted">
                  Entrada total (recursos + FGTS)
                </dt>
                <dd class="text-[14px] font-medium text-ink tabular-nums">
                  {{ formattedDownPaymentTotal() }}
                </dd>
              </div>

              <div class="flex items-baseline justify-between gap-3">
                <dt class="text-[13px] font-normal text-ink-muted">
                  Valor financiado
                </dt>
                <dd class="text-[14px] font-normal text-ink tabular-nums">
                  {{ formattedFinancedAmount() }}
                </dd>
              </div>

              <div class="flex items-baseline justify-between gap-3">
                <dt class="text-[13px] font-normal text-ink-muted">
                  Renda familiar sugerida
                </dt>
                <dd class="text-[14px] font-normal text-ink tabular-nums">
                  {{ formattedSuggestedIncome() }}
                </dd>
              </div>
            </dl>
          </div>

          <div class="space-y-2.5">
            <a
              [href]="whatsappSimulationHref()"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="simulator-whatsapp-cta"
              class="terraco-btn terraco-btn-moss flex min-h-[46px] w-full items-center justify-center rounded-pill bg-brand px-5 py-2.5 text-center text-[13px] font-medium leading-[1.35] text-ink-inverse hover:bg-brand-hover"
            >
              Enviar simulação no WhatsApp
            </a>

            @if (showFlutterAppCta) {
              <a
                [href]="flutterDeepLink()"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="simulator-flutter-cta"
                class="terraco-btn flex min-h-[42px] w-full items-center justify-center rounded-pill border border-border-subtle bg-elevated px-5 py-2 text-center text-[13px] font-normal leading-[1.35] text-ink hover:border-ink/30 hover:bg-surface/60"
              >
                Salvar simulação e ver plantas interativas
              </a>
            }
          </div>
        </div>
      </div>

      <p class="mt-5 border-t border-border-subtle pt-4 text-[13px] font-normal leading-[1.5] text-ink-muted">
        Simulação estimativa para planejamento inicial. Taxas, correção (INCC/IPCA) e aprovação de crédito variam conforme o banco e a tabela vigente.
      </p>
    </section>
  `,
})
export class LaunchSimulatorComponent {
  private readonly lancamentosService = inject(LancamentosService);
  private readonly favoritesService = inject(FavoritesService);

  readonly item = input.required<Lancamento>();

  readonly showFlutterAppCta = ENABLE_FLUTTER_APP_LINKS;
  readonly minPropertyValue = MIN_PROPERTY_VALUE;
  readonly maxPropertyValue = MAX_PROPERTY_VALUE;
  readonly propertyValueStep = PROPERTY_VALUE_STEP;
  readonly formattedMinValue = formatCurrencyBRL(MIN_PROPERTY_VALUE);
  readonly formattedMaxValue = formatCurrencyBRL(MAX_PROPERTY_VALUE);

  readonly downPaymentPresets = DOWN_PAYMENT_PRESETS;
  readonly fgtsPresets = FGTS_PRESETS;
  readonly termYearPresets = TERM_YEAR_PRESETS;

  readonly propertyValue = signal<number>(DEFAULT_PROPERTY_VALUE);
  readonly downPaymentPercent = signal<number>(20);
  readonly fgtsAmount = signal<number>(0);
  readonly termYears = signal<number>(30);

  readonly propertyValueHint = computed(() => {
    const price = this.item().precoAPartirDe;
    return typeof price === 'number' && Number.isFinite(price) && price > 0
      ? 'Baseado no valor inicial do lançamento'
      : 'Valor de referência ajustável';
  });

  readonly cashDownPayment = computed(() =>
    Math.round(this.propertyValue() * (this.downPaymentPercent() / 100))
  );

  readonly maxFgts = computed(() => {
    const maxTotalEntry = Math.round(this.propertyValue() * MAX_ENTRY_RATIO);
    return Math.max(0, maxTotalEntry - this.cashDownPayment());
  });

  readonly clampedFgts = computed(() =>
    Math.min(Math.max(0, this.fgtsAmount()), this.maxFgts())
  );

  readonly downPaymentTotal = computed(
    () => this.cashDownPayment() + this.clampedFgts()
  );

  readonly financedAmount = computed(() =>
    Math.max(0, this.propertyValue() - this.downPaymentTotal())
  );

  readonly estimatedMonthlyPayment = computed(() => {
    const principal = this.financedAmount();
    const months = this.termYears() * 12;
    if (principal <= 0 || months <= 0) {
      return 0;
    }
    const factor = Math.pow(1 + MONTHLY_INTEREST_RATE, months);
    return (principal * (MONTHLY_INTEREST_RATE * factor)) / (factor - 1);
  });

  readonly suggestedFamilyIncome = computed(() =>
    Math.round(this.estimatedMonthlyPayment() * 3.33)
  );

  readonly formattedPropertyValue = computed(() =>
    formatCurrencyBRL(this.propertyValue())
  );
  readonly formattedCashDownPayment = computed(() =>
    formatCurrencyBRL(this.cashDownPayment())
  );
  readonly formattedFgts = computed(() =>
    formatCurrencyBRL(this.clampedFgts())
  );
  readonly formattedDownPaymentTotal = computed(() =>
    formatCurrencyBRL(this.downPaymentTotal())
  );
  readonly formattedFinancedAmount = computed(() =>
    formatCurrencyBRL(this.financedAmount())
  );
  readonly formattedMonthlyPayment = computed(() =>
    formatCurrencyBRL(Math.round(this.estimatedMonthlyPayment()))
  );
  readonly formattedSuggestedIncome = computed(() =>
    formatCurrencyBRL(this.suggestedFamilyIncome())
  );

  readonly flutterDeepLink = computed(() => {
    const favs = this.favoritesService.favorites().join(',');
    return this.lancamentosService.buildFlutterAppDeepLink(
      '/lancamentos/' + this.item().slug,
      {
        valor: String(this.propertyValue()),
        entrada: String(this.downPaymentTotal()),
        fgts: String(this.clampedFgts()),
        prazo: String(this.termYears()),
        parcela: String(Math.round(this.estimatedMonthlyPayment())),
        ...(favs ? { favorites: favs } : {}),
      }
    );
  });

  readonly whatsappSimulationHref = computed(() => {
    const currentItem = this.item();
    const fgts = this.clampedFgts();
    const entryDetails =
      fgts > 0
        ? `${this.formattedDownPaymentTotal()} (incluindo ${this.formattedFgts()} de FGTS)`
        : this.formattedDownPaymentTotal();
    const message =
      `Oi! Fiz uma simulação para o ${currentItem.nome} (${currentItem.bairro}): ` +
      `imóvel de ${this.formattedPropertyValue()}, entrada de ${entryDetails}, ` +
      `prazo de ${this.termYears()} anos e parcela estimada de ${this.formattedMonthlyPayment()}/mês. ` +
      `Gostaria de conferir a tabela atualizada e as condições de financiamento.`;
    return buildWhatsAppUrl(message);
  });

  constructor() {
    effect(() => {
      const currentItem = this.item();
      // Reset simulator state cleanly when navigating between launch slugs.
      currentItem.slug;
      this.propertyValue.set(resolveInitialPropertyValue(currentItem));
      this.downPaymentPercent.set(20);
      this.fgtsAmount.set(0);
      this.termYears.set(30);
    });
  }

  onPropertyValueInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement | null;
    if (!inputEl) return;
    const parsed = Number(inputEl.value);
    if (!Number.isFinite(parsed)) return;
    const clamped = Math.min(
      MAX_PROPERTY_VALUE,
      Math.max(MIN_PROPERTY_VALUE, parsed)
    );
    this.propertyValue.set(clamped);
  }

  selectDownPaymentPercent(percent: number): void {
    this.downPaymentPercent.set(percent);
  }

  selectFgtsAmount(amount: number): void {
    this.fgtsAmount.set(Math.min(Math.max(0, amount), this.maxFgts()));
  }

  selectTermYears(years: number): void {
    this.termYears.set(years);
  }
}
