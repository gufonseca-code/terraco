import { Listbox, Option } from '@angular/aria/listbox';
import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
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
  imports: [NgOptimizedImage, Listbox, Option, ImageLightboxComponent],
  template: `
    @if (hasPlans()) {
      <section
        id="plantas"
        aria-labelledby="floor-plans-heading"
        class="rounded-xl border border-border-subtle bg-elevated p-5 shadow-card sm:p-8 scroll-mt-28"
      >
        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <div class="space-y-1.5">
            <h2
              id="floor-plans-heading"
              class="font-display text-[clamp(1.375rem,2.4vw,1.75rem)] font-medium not-italic leading-[1.16] tracking-[-0.02em] text-ink text-balance"
            >
              Plantas e tipologias
            </h2>
            <p class="max-w-2xl text-[14px] font-normal leading-[1.55] text-ink-muted sm:text-[15px]">
              Explore todas as opções de {{ item().metragem }} sem cadastro. Toque em uma planta para ver medidas, ampliar ou pedir a tabela.
            </p>
          </div>

          <p class="text-[13px] font-normal text-ink-muted tabular-nums">
            {{ plans().length }}
            {{ plans().length === 1 ? 'planta disponível' : 'plantas disponíveis' }}
          </p>
        </div>

        @if (categories().length > 2) {
          <div
            role="group"
            aria-label="Filtrar plantas por tipologia"
            class="terraco-m3-group terraco-no-scrollbar mt-5 w-fit max-w-full overflow-x-auto pb-1"
          >
            @for (category of categories(); track category.name) {
              <button
                type="button"
                (click)="selectCategory(category.name)"
                [attr.aria-pressed]="selectedCategory() === category.name"
                [class]="
                  selectedCategory() === category.name
                    ? 'terraco-m3-group-item inline-flex min-h-[42px] shrink-0 cursor-pointer items-center gap-1.5 border border-brand bg-brand px-4 py-1.5 text-[13px] font-medium text-ink-inverse shadow-chip'
                    : 'terraco-m3-group-item inline-flex min-h-[42px] shrink-0 cursor-pointer items-center gap-1.5 border border-border-subtle bg-surface/80 px-4 py-1.5 text-[13px] font-normal text-ink hover:border-border-strong hover:bg-surface'
                "
              >
                <span>{{ category.name }}</span>
                <span
                  [class]="
                    selectedCategory() === category.name
                      ? 'text-[12px] text-ink-inverse/80 tabular-nums'
                      : 'text-[12px] text-ink-muted tabular-nums'
                  "
                >
                  {{ category.count }}
                </span>
              </button>
            }
          </div>
        }

        <div class="mt-6 grid gap-6 lg:grid-cols-12 lg:items-start">
          <!-- Lista seletora: swipe horizontal fluido no mobile, lista vertical no desktop -->
          <div
            ngListbox
            [value]="activePlanSelection()"
            (valueChange)="onPlanSelectionChange($event)"
            orientation="vertical"
            [multi]="false"
            selectionMode="follow"
            class="terraco-no-scrollbar flex gap-2.5 overflow-x-auto pb-2 lg:col-span-5 lg:block lg:max-h-[580px] lg:space-y-2.5 lg:overflow-y-auto lg:pb-0 lg:pr-1"
            aria-label="Lista de plantas"
          >
            @for (plan of filteredPlans(); track plan.id) {
              @let isSelected = activePlan()?.id === plan.id;
              <div
                ngOption
                [value]="plan.id"
                [label]="plan.titulo"
                (click)="selectPlan(plan.id)"
                [class]="
                  isSelected
                    ? 'terraco-m3-select-card group flex w-[238px] shrink-0 cursor-pointer flex-col justify-between gap-2.5 border border-brand bg-brand-container/65 p-4 text-left shadow-chip lg:w-full'
                    : 'terraco-m3-select-card group flex w-[238px] shrink-0 cursor-pointer flex-col justify-between gap-2.5 border border-border-subtle bg-surface/65 p-4 text-left hover:border-border-strong hover:bg-surface lg:w-full'
                "
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p
                      class="truncate text-[14px] font-medium leading-snug text-ink"
                    >
                      {{ plan.titulo }}
                    </p>
                    <p class="mt-0.5 text-[13px] font-normal text-ink-muted">
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
                  class="flex items-center justify-between gap-2 border-t border-border-subtle/75 pt-2 text-[13px]"
                >
                  @if (plan.precoAPartirDe) {
                    <span class="font-medium text-brand tabular-nums">
                      A partir de {{ formatPrice(plan.precoAPartirDe) }}
                    </span>
                  } @else {
                    <span class="font-normal text-ink-muted">
                      Tabela sob consulta
                    </span>
                  }
                  @if (plan.unidades) {
                    <span class="truncate text-ink-muted">
                      {{ plan.unidades }}
                    </span>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Palco da planta selecionada -->
          @if (activePlan(); as plan) {
            <div class="rounded-[22px] bg-canvas p-4 sm:p-6 lg:col-span-7">
              <div
                class="relative flex items-center justify-center overflow-hidden rounded-[18px] border border-border-subtle/70 bg-elevated p-3 sm:p-5"
              >
                <img
                  [ngSrc]="plan.imagem"
                  [alt]="plan.alt"
                  [width]="plan.width"
                  [height]="plan.height"
                  class="max-h-[340px] w-auto object-contain sm:max-h-[410px]"
                />

                <button
                  type="button"
                  (click)="openActivePlanLightbox()"
                  aria-label="Ampliar planta em tela cheia"
                  class="terraco-btn absolute right-3 bottom-3 inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-pill border border-border-subtle bg-elevated/95 px-3.5 py-1.5 text-[13px] font-medium text-ink shadow-chip backdrop-blur-xs hover:border-brand/40"
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
                  <span>Ampliar</span>
                </button>
              </div>

              <div class="mt-5 space-y-4">
                <div
                  class="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <div>
                    <h3
                      class="font-display text-[1.25rem] font-medium not-italic leading-[1.22] tracking-[-0.015em] text-ink"
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
                      <p class="text-[13px] font-normal text-ink-muted">
                        A partir de
                      </p>
                      <p
                        class="font-display text-[1.375rem] font-medium leading-tight text-ink tabular-nums"
                      >
                        {{ formatPrice(plan.precoAPartirDe) }}
                      </p>
                    </div>
                  }
                </div>

                <!-- Especificações transparentes -->
                <dl
                  class="grid grid-cols-2 gap-3 border-y border-border-subtle py-3.5 sm:grid-cols-3"
                >
                  <div>
                    <dt class="text-[13px] font-normal text-ink-muted">
                      Área privativa
                    </dt>
                    <dd
                      class="mt-0.5 text-[14px] font-medium text-ink tabular-nums"
                    >
                      {{ plan.metragem }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-[13px] font-normal text-ink-muted">
                      Configuração
                    </dt>
                    <dd class="mt-0.5 text-[14px] font-medium text-ink">
                      {{ plan.quartos }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-[13px] font-normal text-ink-muted">
                      Banhos
                    </dt>
                    <dd class="mt-0.5 text-[14px] font-medium text-ink">
                      {{ plan.banhos }}
                    </dd>
                  </div>
                </dl>

                @if (plan.entradaExemplo || plan.parcelaExemplo) {
                  <div
                    class="flex flex-wrap items-center justify-between gap-2 rounded-[14px] bg-surface/85 px-4 py-3 text-[13px]"
                  >
                    <span class="font-normal text-ink-muted">
                      Referência de fluxo na obra
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

                <!-- Intenção em 1 toque + CTA contextual -->
                <div class="space-y-3 border-t border-border-subtle pt-4">
                  <div class="flex flex-wrap items-center gap-2">
                    @for (intent of intentOptions; track intent.key) {
                      <button
                        type="button"
                        (click)="selectIntent(intent.key)"
                        [attr.aria-pressed]="selectedIntent() === intent.key"
                        [class]="
                          selectedIntent() === intent.key
                            ? 'terraco-m3-chip inline-flex min-h-[40px] cursor-pointer items-center border border-ink bg-ink px-3.5 py-1.5 text-[13px] font-medium text-ink-inverse shadow-chip'
                            : 'terraco-m3-chip inline-flex min-h-[40px] cursor-pointer items-center border border-border-subtle bg-elevated px-3.5 py-1.5 text-[13px] font-normal text-ink-muted hover:border-border-strong hover:text-ink'
                        "
                      >
                        {{ intent.label }}
                      </button>
                    }
                  </div>

                  <a
                    [href]="activePlanWhatsappHref()"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="terraco-btn terraco-btn-moss inline-flex min-h-[46px] w-full items-center justify-center rounded-pill bg-brand px-5 py-2.5 text-center text-[13px] font-medium text-ink-inverse hover:bg-brand-hover"
                  >
                    {{ activeIntentOption().ctaLabel }}
                  </a>
                </div>
              </div>
            </div>
          }
        </div>
      </section>

      @defer (when lightboxOpen()) {
        <app-image-lightbox
          [images]="filteredPlanMedia()"
          [initialIndex]="lightboxIndex()"
          [isOpen]="lightboxOpen()"
          (closed)="closeLightbox()"
        />
      }
    }
  `,
})
export class LaunchFloorPlansComponent {
  readonly item = input.required<Lancamento>();
  private readonly itemSlug = computed(() => this.item().slug);
  readonly intentOptions = PLAN_INTENT_OPTIONS;

  readonly selectedCategory = linkedSignal({
    source: this.itemSlug,
    computation: () => 'Todas',
  });
  readonly selectedPlanId = linkedSignal<string, string | null>({
    source: this.itemSlug,
    computation: () => null,
  });
  readonly selectedIntent = linkedSignal<string, PlanIntentKey>({
    source: this.itemSlug,
    computation: () => 'tabela_planta',
  });
  readonly lightboxOpen = linkedSignal({
    source: this.itemSlug,
    computation: () => false,
  });
  readonly lightboxIndex = linkedSignal({
    source: this.itemSlug,
    computation: () => 0,
  });

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

  readonly activePlanSelection = computed<string[]>(() => {
    const current = this.activePlan();
    return current ? [current.id] : [];
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

  formatPrice(value: number): string {
    return formatCurrencyBRL(value);
  }

  onPlanSelectionChange(values: readonly string[]): void {
    const nextId = values[0];
    if (nextId) {
      this.selectedPlanId.set(nextId);
    }
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
}
