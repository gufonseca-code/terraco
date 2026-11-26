import { Listbox, Option } from '@angular/aria/listbox';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import {
  buildWhatsAppUrl,
  formatCurrencyBRL,
  type Lancamento,
  type LaunchFloorPlan,
  type LaunchMediaItem,
} from '../../core';
import { ImageLightboxComponent } from './image-lightbox.component';

@Component({
  selector: 'app-launch-floor-plans',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Listbox, Option, ImageLightboxComponent],
  styles: `
    .m3e-chip {
      border-radius: 9999px;
      transition:
        border-radius 240ms var(--ease-expressive, cubic-bezier(0.2, 0, 0, 1)),
        background-color 160ms var(--ease-expressive, cubic-bezier(0.2, 0, 0, 1)),
        border-color 160ms var(--ease-expressive, cubic-bezier(0.2, 0, 0, 1)),
        color 160ms var(--ease-expressive, cubic-bezier(0.2, 0, 0, 1)),
        transform 160ms var(--ease-expressive, cubic-bezier(0.2, 0, 0, 1));
    }

    .m3e-chip[aria-pressed='true'],
    .m3e-tonal-btn:hover,
    .m3e-tonal-btn:active {
      border-radius: 14px;
    }

    .m3e-chip:active {
      transform: scale(0.97);
    }

    .m3e-plan-item {
      border-radius: 20px;
      transition:
        border-radius 240ms var(--ease-expressive, cubic-bezier(0.2, 0, 0, 1)),
        background-color 160ms var(--ease-expressive, cubic-bezier(0.2, 0, 0, 1)),
        color 160ms var(--ease-expressive, cubic-bezier(0.2, 0, 0, 1)),
        transform 160ms var(--ease-expressive, cubic-bezier(0.2, 0, 0, 1));
    }

    .m3e-plan-item[aria-selected='true'] {
      border-radius: 14px;
    }

    .m3e-plan-item:active {
      transform: scale(0.985);
    }

    .m3e-tonal-btn {
      border-radius: 9999px;
      transition:
        border-radius 240ms cubic-bezier(0.2, 0, 0, 1),
        background-color 160ms cubic-bezier(0.2, 0, 0, 1),
        color 160ms cubic-bezier(0.2, 0, 0, 1);
    }

    @keyframes m3e-plan-stage-enter {
      from {
        opacity: 0;
        transform: translateY(6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .m3e-plan-stage {
      animation: m3e-plan-stage-enter 220ms cubic-bezier(0.2, 0, 0, 1) both;
    }

    @media (prefers-reduced-motion: reduce) {
      .m3e-chip,
      .m3e-plan-item,
      .m3e-tonal-btn {
        transition: none;
      }

      .m3e-chip:active,
      .m3e-plan-item:active {
        transform: none;
      }

      .m3e-plan-stage {
        animation: none;
      }
    }
  `,
  template: `
    @if (hasPlans()) {
      <section
        id="plantas"
        aria-labelledby="floor-plans-heading"
        class="scroll-mt-36"
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

          <p class="text-[13px] font-normal text-ink-muted tabular-nums">
            {{ plans().length }}
            {{ plans().length === 1 ? 'planta disponível' : 'plantas disponíveis' }}
          </p>
        </div>

        @if (categories().length > 2) {
          <div
            role="group"
            aria-label="Filtrar plantas por tipologia"
            class="mt-5 flex flex-wrap items-center gap-2"
          >
            @for (category of categories(); track category.name) {
              @let active = selectedCategory() === category.name;
              <button
                type="button"
                (click)="selectCategory(category.name)"
                [attr.aria-pressed]="active"
                [class]="
                  active
                    ? 'm3e-chip inline-flex min-h-[38px] shrink-0 cursor-pointer items-center gap-1.5 border border-transparent bg-[#1C1B19] px-4 py-1.5 text-[13px] font-medium text-[#FAF8F4] shadow-chip'
                    : 'm3e-chip inline-flex min-h-[38px] shrink-0 cursor-pointer items-center gap-1.5 border border-transparent bg-canvas px-4 py-1.5 text-[13px] font-medium text-[#1C1B19] hover:bg-elevated'
                "
              >
                <span>{{ category.name }}</span>
                <span
                  [class]="
                    active
                      ? 'text-[12px] text-ink-inverse/75 tabular-nums'
                      : 'text-[12px] text-ink-muted tabular-nums'
                  "
                >
                  {{ category.count }}
                </span>
              </button>
            }
          </div>
        }

        <div class="mt-6 grid gap-5 lg:grid-cols-12 lg:items-start lg:gap-6">
          <!-- Mobile (< md): Seletor horizontal tátil compacto com scroll suave -->
          <div
            role="group"
            aria-label="Selecionar planta"
            class="terraco-no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 md:hidden"
          >
            @for (plan of filteredPlans(); track plan.id) {
              @let isSelected = activePlan()?.id === plan.id;
              <button
                type="button"
                (click)="selectPlan(plan.id)"
                [attr.aria-pressed]="isSelected"
                [class]="
                  isSelected
                    ? 'm3e-chip inline-flex min-h-[40px] shrink-0 cursor-pointer items-center gap-2 border border-transparent bg-[#1C1B19] px-4 py-1.5 text-[13px] font-medium text-[#FAF8F4] shadow-chip'
                    : 'm3e-chip inline-flex min-h-[40px] shrink-0 cursor-pointer items-center gap-2 border border-transparent bg-canvas px-4 py-1.5 text-[13px] font-normal text-[#1C1B19] hover:bg-elevated'
                "
              >
                <span>{{ plan.titulo }}</span>
                <span
                  [class]="
                    isSelected
                      ? 'text-[12px] text-[#FAF8F4]/75 tabular-nums'
                      : 'text-[12px] text-ink-muted tabular-nums'
                  "
                >
                  {{ plan.metragem }}
                </span>
              </button>
            }
          </div>

          <!-- Desktop/Tablet (>= md): Lista editorial leve com item ativo em tonal #F3EFE6 -->
          <div
            ngListbox
            [value]="activePlanSelection()"
            (valueChange)="onPlanSelectionChange($event)"
            orientation="vertical"
            [multi]="false"
            selectionMode="follow"
            class="hidden rounded-[20px] bg-canvas p-2 md:grid md:grid-cols-2 md:gap-1.5 lg:col-span-5 lg:block lg:max-h-[560px] lg:space-y-1.5 lg:overflow-y-auto"
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
                    ? 'm3e-plan-item group flex w-full cursor-pointer flex-col justify-between gap-2 border border-transparent bg-[#F3EFE6] p-3.5 text-left text-[#1C1B19]'
                    : 'm3e-plan-item group flex w-full cursor-pointer flex-col justify-between gap-2 border border-transparent bg-transparent p-3.5 text-left text-[#1C1B19] hover:bg-[#F3EFE6]/55'
                "
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p
                      [class]="
                        isSelected
                          ? 'truncate text-[14px] font-semibold leading-snug text-[#1C1B19]'
                          : 'truncate text-[14px] font-medium leading-snug text-[#1C1B19]'
                      "
                    >
                      {{ plan.titulo }}
                    </p>
                    <p class="mt-0.5 text-[13px] font-normal text-ink-muted">
                      {{ plan.quartos }} · {{ plan.banhos }}
                    </p>
                  </div>
                  <span
                    [class]="
                      isSelected
                        ? 'shrink-0 text-[13px] font-semibold text-[#1C1B19] tabular-nums'
                        : 'shrink-0 text-[13px] font-medium text-[#1C1B19] tabular-nums'
                    "
                  >
                    {{ plan.metragem }}
                  </span>
                </div>

                <div
                  class="flex items-center justify-between gap-2 border-t border-border-subtle/70 pt-2 text-[13px]"
                >
                  @if (plan.precoAPartirDe) {
                    <span
                      [class]="
                        isSelected
                          ? 'font-semibold text-[#1C1B19] tabular-nums'
                          : 'font-medium text-[#1C1B19] tabular-nums'
                      "
                    >
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
              </div>
            }
          </div>

          <!-- Active floor plan stage -->
          @if (activePlan(); as plan) {
            <div class="rounded-md bg-canvas p-4 sm:p-6 lg:col-span-7">
              <div
                class="relative flex items-center justify-center overflow-hidden rounded-md bg-elevated p-3 sm:p-5"
              >
                @for (currentPlan of [plan]; track currentPlan.id) {
                  <img
                    data-testid="active-floor-plan-image"
                    [src]="currentPlan.imagem"
                    [alt]="currentPlan.alt"
                    [attr.width]="currentPlan.width"
                    [attr.height]="currentPlan.height"
                    decoding="async"
                    class="max-h-[340px] w-auto object-contain sm:max-h-[400px]"
                  />
                }

                <button
                  type="button"
                  (click)="openActivePlanLightbox()"
                  aria-label="Ampliar planta em tela cheia"
                  class="terraco-btn absolute right-3 bottom-3 inline-flex min-h-[38px] items-center gap-1.5 rounded-pill border border-border-subtle bg-elevated/95 px-3 py-1.5 text-[13px] font-medium text-ink shadow-xs backdrop-blur-xs hover:border-ink/35"
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
                      <p class="text-[13px] font-normal text-ink-muted">
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
                    class="flex flex-wrap items-center justify-between gap-2 rounded-md bg-surface/75 px-3.5 py-2.5 text-[13px]"
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

                <div class="pt-1">
                  <a
                    [href]="activePlanWhatsappHref()"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="floor-plan-whatsapp-link"
                    class="terraco-link-underline inline-flex items-center gap-1.5 text-[13px] font-medium text-brand hover:text-brand-hover"
                  >
                    <span>Tirar dúvida sobre esta planta</span>
                    <span aria-hidden="true">→</span>
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
  readonly activePlanChange = output<LaunchFloorPlan | null>();
  private readonly itemSlug = computed(() => this.item().slug);

  readonly selectedCategory = linkedSignal({
    source: this.itemSlug,
    computation: () => 'Todas',
  });
  readonly selectedPlanId = linkedSignal<string, string | null>({
    source: this.itemSlug,
    computation: () => null,
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

  readonly activePlanWhatsappHref = computed(() => {
    const launch = this.item();
    const plan = this.activePlan();
    if (!plan) {
      return buildWhatsAppUrl(launch.whatsappMensagem);
    }
    const unitsText = plan.unidades ? `, ${plan.unidades}` : '';
    const priceText = plan.precoAPartirDe
      ? ` (a partir de ${formatCurrencyBRL(plan.precoAPartirDe)})`
      : '';
    return buildWhatsAppUrl(
      `Oi! Gostaria de tirar uma dúvida sobre a planta ${plan.titulo} (${plan.metragem}${unitsText}) do ${launch.nome} (${launch.bairro})${priceText}.`
    );
  });

  constructor() {
    effect(() => {
      this.activePlanChange.emit(this.activePlan());
    });
  }

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
