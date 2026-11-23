import { DOCUMENT } from '@angular/common';
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
  buildWhatsAppUrl,
  formatCurrencyBRL,
  type Lancamento,
  type LaunchFloorPlan,
  type LaunchMediaItem,
} from '../../core';
import { ImageLightboxComponent } from './image-lightbox.component';

type PlanIntentKey = 'tabela_planta' | 'simular_entrada' | 'agendar_visita';

interface PlanIntentOption {
  readonly key: PlanIntentKey;
  readonly label: string;
  readonly ctaLabel: string;
}

const PLAN_INTENT_OPTIONS: readonly PlanIntentOption[] = [
  {
    key: 'tabela_planta',
    label: 'Tabela e disponibilidade',
    ctaLabel: 'Receber tabela desta planta no WhatsApp',
  },
  {
    key: 'simular_entrada',
    label: 'Simular entrada',
    ctaLabel: 'Simular entrada desta planta no WhatsApp',
  },
  {
    key: 'agendar_visita',
    label: 'Agendar visita',
    ctaLabel: 'Agendar visita para esta planta',
  },
];

@Component({
  selector: 'app-launch-floor-plans',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ImageLightboxComponent],
  template: `
    @if (hasPlans()) {
      <section
        id="plantas"
        aria-labelledby="floor-plans-heading"
        class="rounded-lg border border-border-subtle bg-elevated p-5 sm:p-8"
      >
        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <div class="space-y-1.5">
            <h2
              id="floor-plans-heading"
              class="font-display text-[clamp(1.25rem,2vw,1.5rem)] font-medium not-italic leading-[1.2] tracking-[-0.015em] text-ink text-balance"
            >
              Plantas e tipologias
            </h2>
            <p class="max-w-2xl text-sm font-normal leading-relaxed text-ink-muted">
              Explore as opções de {{ item().metragem }} sem cadastro. Selecione
              uma planta para ampliar os detalhes ou consultar condições.
            </p>
          </div>

          <p class="text-xs font-normal text-ink-muted tabular-nums">
            {{ plans().length }}
            {{ plans().length === 1 ? 'planta disponível' : 'plantas disponíveis' }}
          </p>
        </div>

        @if (categories().length > 2) {
          <div
            role="group"
            aria-label="Filtrar plantas por tipologia"
            class="mt-5 flex flex-wrap gap-2"
          >
            @for (category of categories(); track category.name) {
              <button
                type="button"
                (click)="selectCategory(category.name)"
                [attr.aria-pressed]="selectedCategory() === category.name"
                [class]="
                  selectedCategory() === category.name
                    ? 'terraco-btn inline-flex min-h-[38px] items-center gap-1.5 rounded-pill border border-brand bg-brand px-3.5 py-1.5 text-[13px] font-medium text-ink-inverse'
                    : 'terraco-btn inline-flex min-h-[38px] items-center gap-1.5 rounded-pill border border-border-subtle bg-surface px-3.5 py-1.5 text-[13px] font-medium text-ink hover:border-ink/30'
                "
              >
                <span>{{ category.name }}</span>
                <span
                  [class]="
                    selectedCategory() === category.name
                      ? 'text-xs text-ink-inverse/80 tabular-nums'
                      : 'text-xs text-ink-muted tabular-nums'
                  "
                >
                  {{ category.count }}
                </span>
              </button>
            }
          </div>
        }

        <div class="mt-6 grid gap-6 lg:grid-cols-12 lg:items-start">
          <!-- Selector list: horizontal scroll on mobile, vertical list on desktop -->
          <div
            class="flex gap-2.5 overflow-x-auto pb-2 lg:col-span-5 lg:block lg:max-h-[560px] lg:space-y-2.5 lg:overflow-y-auto lg:pb-0 lg:pr-1"
            role="listbox"
            aria-label="Lista de plantas"
          >
            @for (plan of filteredPlans(); track plan.id) {
              @let isSelected = activePlan()?.id === plan.id;
              <button
                type="button"
                role="option"
                [attr.aria-selected]="isSelected"
                (click)="selectPlan(plan.id)"
                [class]="
                  isSelected
                    ? 'terraco-btn group flex w-[230px] shrink-0 flex-col justify-between gap-2 rounded-md border border-brand bg-brand/[0.06] p-3.5 text-left lg:w-full'
                    : 'terraco-btn group flex w-[230px] shrink-0 flex-col justify-between gap-2 rounded-md border border-border-subtle bg-surface/65 p-3.5 text-left hover:border-ink/30 hover:bg-surface lg:w-full'
                "
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p
                      class="truncate text-[14px] font-medium leading-snug text-ink"
                    >
                      {{ plan.titulo }}
                    </p>
                    <p class="mt-0.5 text-[12px] font-normal text-ink-muted">
                      {{ plan.quartos }} · {{ plan.banhos }}
                    </p>
                  </div>
                  <span
                    class="shrink-0 text-[13px] font-medium text-ink tabular-nums"
                  >
                    {{ plan.metragem }}
                  </span>
                </div>

                <div
                  class="flex items-center justify-between gap-2 border-t border-border-subtle/70 pt-2 text-[12px]"
                >
                  @if (plan.precoAPartirDe) {
                    <span class="font-medium text-brand tabular-nums">
                      A partir de {{ formatPrice(plan.precoAPartirDe) }}
                    </span>
                  } @else {
                    <span class="font-normal text-ink-muted">
                      Valor sob consulta
                    </span>
                  }
                  @if (plan.unidades) {
                    <span class="truncate text-ink-muted">
                      {{ plan.unidades }}
                    </span>
                  }
                </div>
              </button>
            }
          </div>

          <!-- Active floor plan stage -->
          @if (activePlan(); as plan) {
            <div
              class="rounded-md border border-border-subtle bg-canvas p-4 sm:p-6 lg:col-span-7"
            >
              <div
                class="relative flex items-center justify-center overflow-hidden rounded-md border border-border-subtle bg-elevated p-3 sm:p-5"
              >
                <img
                  [src]="plan.imagem"
                  [alt]="plan.alt"
                  [width]="plan.width"
                  [height]="plan.height"
                  loading="lazy"
                  decoding="async"
                  class="max-h-[340px] w-auto object-contain sm:max-h-[400px]"
                />

                <button
                  type="button"
                  (click)="openActivePlanLightbox()"
                  aria-label="Ampliar planta em tela cheia"
                  class="terraco-btn absolute right-3 bottom-3 inline-flex min-h-[38px] items-center gap-1.5 rounded-pill border border-border-subtle bg-elevated/95 px-3 py-1.5 text-[12px] font-medium text-ink shadow-xs backdrop-blur-xs hover:border-ink/35"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="h-3.5 w-3.5"
                  >
                    <path d="M15 3h6v6" />
                    <path d="M9 21H3v-6" />
                    <path d="M21 3l-7 7" />
                    <path d="M3 21l7-7" />
                  </svg>
                  <span>Ampliar planta</span>
                </button>
              </div>

              <div class="mt-5 space-y-4">
                <div
                  class="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <div>
                    <h3
                      class="font-display text-lg font-medium not-italic leading-snug tracking-[-0.01em] text-ink"
                    >
                      {{ plan.titulo }}
                    </h3>
                    @if (plan.destaque || plan.unidades) {
                      <p class="mt-0.5 text-[13px] font-normal text-ink-muted">
                        {{ plan.destaque }}
                        @if (plan.destaque && plan.unidades) {
                          <span> · </span>
                        }
                        @if (plan.unidades) {
                          <span>{{ plan.unidades }}</span>
                        }
                      </p>
                    }
                  </div>

                  @if (plan.precoAPartirDe) {
                    <div class="sm:text-right">
                      <p class="text-[12px] font-normal text-ink-muted">
                        A partir de
                      </p>
                      <p
                        class="font-display text-xl font-medium leading-tight text-ink tabular-nums"
                      >
                        {{ formatPrice(plan.precoAPartirDe) }}
                      </p>
                    </div>
                  }
                </div>

                <!-- Transparent specs row -->
                <dl
                  class="grid grid-cols-2 gap-3 rounded-md border border-border-subtle bg-elevated p-3.5 sm:grid-cols-3"
                >
                  <div>
                    <dt class="text-[12px] font-normal text-ink-muted">
                      Área privativa
                    </dt>
                    <dd
                      class="mt-0.5 text-[14px] font-medium text-ink tabular-nums"
                    >
                      {{ plan.metragem }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-[12px] font-normal text-ink-muted">
                      Configuração
                    </dt>
                    <dd class="mt-0.5 text-[14px] font-medium text-ink">
                      {{ plan.quartos }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-[12px] font-normal text-ink-muted">
                      Banhos
                    </dt>
                    <dd class="mt-0.5 text-[14px] font-medium text-ink">
                      {{ plan.banhos }}
                    </dd>
                  </div>
                </dl>

                @if (plan.entradaExemplo || plan.parcelaExemplo) {
                  <div
                    class="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border-subtle bg-surface/60 px-3.5 py-2.5 text-[13px]"
                  >
                    <span class="font-normal text-ink-muted">
                      Referência de fluxo na obra:
                    </span>
                    <span class="font-medium text-ink tabular-nums">
                      @if (plan.entradaExemplo) {
                        Entrada {{ formatPrice(plan.entradaExemplo) }}
                      }
                      @if (plan.entradaExemplo && plan.parcelaExemplo) {
                        <span> · </span>
                      }
                      @if (plan.parcelaExemplo) {
                        {{ plan.parcelaExemplo }}
                      }
                    </span>
                  </div>
                }

                <!-- Progressive intent + contextual WhatsApp CTA -->
                <div class="space-y-3 border-t border-border-subtle pt-4">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-[12px] font-normal text-ink-muted">
                      O que você precisa agora:
                    </span>
                    @for (intent of intentOptions; track intent.key) {
                      <button
                        type="button"
                        (click)="selectIntent(intent.key)"
                        [attr.aria-pressed]="selectedIntent() === intent.key"
                        [class]="
                          selectedIntent() === intent.key
                            ? 'terraco-btn rounded-pill border border-brand bg-brand/10 px-3 py-1 text-[12px] font-medium text-brand'
                            : 'terraco-btn rounded-pill border border-border-subtle bg-elevated px-3 py-1 text-[12px] font-normal text-ink-muted hover:border-ink/30 hover:text-ink'
                        "
                      >
                        {{ intent.label }}
                      </button>
                    }
                  </div>

                  <div class="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                    <a
                      [href]="activePlanWhatsappHref()"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="terraco-btn inline-flex min-h-[44px] flex-1 items-center justify-center rounded-md bg-brand px-4 py-2.5 text-[13px] font-medium text-ink-inverse hover:bg-brand-hover"
                    >
                      {{ activeIntentOption().ctaLabel }}
                    </a>

                    <button
                      type="button"
                      (click)="scrollToSimulator()"
                      class="terraco-btn inline-flex min-h-[44px] items-center justify-center rounded-md border border-border-subtle bg-elevated px-4 py-2.5 text-[13px] font-medium text-ink hover:border-ink/30"
                    >
                      Simular entrada abaixo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </section>

      <app-image-lightbox
        [images]="filteredPlanMedia()"
        [initialIndex]="lightboxIndex()"
        [isOpen]="lightboxOpen()"
        (closed)="closeLightbox()"
      />
    }
  `,
})
export class LaunchFloorPlansComponent {
  private readonly document = inject(DOCUMENT);

  readonly item = input.required<Lancamento>();
  readonly intentOptions = PLAN_INTENT_OPTIONS;

  readonly selectedCategory = signal<string>('Todas');
  readonly selectedPlanId = signal<string | null>(null);
  readonly selectedIntent = signal<PlanIntentKey>('tabela_planta');
  readonly lightboxOpen = signal<boolean>(false);
  readonly lightboxIndex = signal<number>(0);

  readonly plans = computed<readonly LaunchFloorPlan[]>(
    () => this.item().plantas ?? []
  );

  readonly hasPlans = computed(() => this.plans().length > 0);

  readonly categories = computed(() => {
    const allPlans = this.plans();
    const counts = new Map<string, number>();
    for (const plan of allPlans) {
      counts.set(plan.categoria, (counts.get(plan.categoria) ?? 0) + 1);
    }
    return [
      { name: 'Todas', count: allPlans.length },
      ...Array.from(counts.entries()).map(([name, count]) => ({ name, count })),
    ];
  });

  readonly filteredPlans = computed<readonly LaunchFloorPlan[]>(() => {
    const category = this.selectedCategory();
    const allPlans = this.plans();
    if (category === 'Todas') {
      return allPlans;
    }
    return allPlans.filter((plan) => plan.categoria === category);
  });

  readonly activePlan = computed<LaunchFloorPlan | null>(() => {
    const list = this.filteredPlans();
    if (list.length === 0) return null;
    const currentId = this.selectedPlanId();
    return list.find((plan) => plan.id === currentId) ?? list[0];
  });

  readonly filteredPlanMedia = computed<readonly LaunchMediaItem[]>(() =>
    this.filteredPlans().map((plan) => ({
      url: plan.imagem,
      alt: plan.alt,
      width: plan.width,
      height: plan.height,
    }))
  );

  readonly activeIntentOption = computed(
    () =>
      PLAN_INTENT_OPTIONS.find((opt) => opt.key === this.selectedIntent()) ??
      PLAN_INTENT_OPTIONS[0]
  );

  readonly activePlanWhatsappHref = computed(() => {
    const launch = this.item();
    const plan = this.activePlan();
    if (!plan) {
      return buildWhatsAppUrl(launch.whatsappMensagem);
    }

    const priceText = plan.precoAPartirDe
      ? ` (a partir de ${formatCurrencyBRL(plan.precoAPartirDe)})`
      : '';
    const unitsText = plan.unidades ? `, ${plan.unidades}` : '';
    const intent = this.selectedIntent();

    if (intent === 'simular_entrada') {
      return buildWhatsAppUrl(
        `Oi! Quero simular entrada e fluxo de pagamento para a planta ${plan.titulo} (${plan.metragem}${unitsText}) do ${launch.nome} (${launch.bairro})${priceText}.`
      );
    }

    if (intent === 'agendar_visita') {
      return buildWhatsAppUrl(
        `Oi! Gostaria de agendar uma visita para conhecer a planta ${plan.titulo} (${plan.metragem}${unitsText}) do ${launch.nome} (${launch.bairro}).`
      );
    }

    return buildWhatsAppUrl(
      `Oi! Quero receber a tabela completa e disponibilidade da planta ${plan.titulo} (${plan.metragem}${unitsText}) do ${launch.nome} (${launch.bairro})${priceText}.`
    );
  });

  constructor() {
    effect(() => {
      this.item().slug;
      this.selectedCategory.set('Todas');
      this.selectedPlanId.set(null);
      this.selectedIntent.set('tabela_planta');
      this.lightboxOpen.set(false);
      this.lightboxIndex.set(0);
    });
  }

  formatPrice(value: number): string {
    return formatCurrencyBRL(value);
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
    const firstInCat = this.filteredPlans()[0];
    this.selectedPlanId.set(firstInCat ? firstInCat.id : null);
  }

  selectPlan(planId: string): void {
    this.selectedPlanId.set(planId);
  }

  selectIntent(intent: PlanIntentKey): void {
    this.selectedIntent.set(intent);
  }

  openActivePlanLightbox(): void {
    const current = this.activePlan();
    if (!current) return;
    const index = this.filteredPlans().findIndex((p) => p.id === current.id);
    this.lightboxIndex.set(index >= 0 ? index : 0);
    this.lightboxOpen.set(true);
  }

  closeLightbox(): void {
    this.lightboxOpen.set(false);
  }

  scrollToSimulator(): void {
    const el = this.document.getElementById('simulador');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
