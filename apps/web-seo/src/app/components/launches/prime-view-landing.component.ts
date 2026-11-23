import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  SITE_NAME,
  SITE_URL,
  buildWhatsAppUrl,
  formatCurrencyBRL,
  type Lancamento,
  type LaunchMediaItem,
} from '../../core';
import { ImageLightboxComponent } from './image-lightbox.component';
import { LaunchSimulatorComponent } from './launch-simulator.component';

export type LaunchIntentKey =
  | 'plantas_valores'
  | 'simular_entrada'
  | 'agendar_visita'
  | 'tirar_duvida';

interface LaunchIntentOption {
  readonly key: LaunchIntentKey;
  readonly label: string;
  readonly buildMessage: (item: Lancamento) => string;
}

const LAUNCH_INTENT_OPTIONS: readonly LaunchIntentOption[] = [
  {
    key: 'plantas_valores',
    label: 'Plantas e valores',
    buildMessage: (item) =>
      `Oi! Quero receber as plantas e a tabela de valores do ${item.nome} (${item.bairro}).`,
  },
  {
    key: 'simular_entrada',
    label: 'Simular entrada',
    buildMessage: (item) =>
      `Oi! Gostaria de simular entrada, parcelas e uso de FGTS no ${item.nome} (${item.bairro}).`,
  },
  {
    key: 'agendar_visita',
    label: 'Agendar visita',
    buildMessage: (item) =>
      `Oi! Quero agendar uma visita para conhecer o ${item.nome} (${item.bairro}).`,
  },
  {
    key: 'tirar_duvida',
    label: 'Tirar dúvida',
    buildMessage: (item) =>
      `Oi! Tenho uma dúvida sobre o ${item.nome} (${item.bairro}).`,
  },
];

function buildJsonLd(item: Lancamento): Record<string, unknown> {
  const pageUrl = `${SITE_URL}/lancamentos/${item.slug}`;
  const imageUrl = /^https?:\/\//i.test(item.imagem)
    ? item.imagem
    : `${SITE_URL}${item.imagem}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Início',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Lançamentos',
            item: `${SITE_URL}/lancamentos`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: item.nome,
            item: pageUrl,
          },
        ],
      },
      {
        '@type': 'RealEstateListing',
        name: `${item.nome} — ${item.bairro}, ${item.cidade}`,
        description: item.resumo,
        url: pageUrl,
        image: imageUrl,
        ...(typeof item.precoAPartirDe === 'number'
          ? {
              offers: {
                '@type': 'Offer',
                priceCurrency: 'BRL',
                price: item.precoAPartirDe,
                availability: 'https://schema.org/InStock',
                url: pageUrl,
              },
            }
          : {}),
        mainEntity: {
          '@type': 'ApartmentComplex',
          name: item.nome,
          description: `${[item.quartos, `${item.metragem} (${item.tipologias})`, item.vagas].filter(Boolean).join(', ')}. ${item.resumo}`,
          url: pageUrl,
          image: imageUrl,
          address: {
            '@type': 'PostalAddress',
            streetAddress: item.endereco,
            addressLocality: item.cidade,
            addressRegion: item.uf,
            addressCountry: 'BR',
          },
          amenityFeature: item.diferenciais.map((diferencial) => ({
            '@type': 'LocationFeatureSpecification',
            name: diferencial,
            value: true,
          })),
        },
        provider: {
          '@type': 'RealEstateAgent',
          name: SITE_NAME,
          url: SITE_URL,
        },
      },
    ],
  };
}

@Component({
  selector: 'app-prime-view-landing',
  imports: [RouterLink, ImageLightboxComponent, LaunchSimulatorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      aria-labelledby="launch-heading"
      class="flex flex-1 flex-col justify-start bg-canvas py-4 sm:py-12 lg:py-16"
    >
      <div class="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div animate.enter="terraco-reveal" class="mb-3 sm:mb-6">
          <a
            routerLink="/lancamentos"
            class="terraco-link-underline inline-flex min-h-[40px] items-center text-sm font-normal text-ink-muted transition-colors duration-150 hover:text-ink sm:min-h-[44px]"
          >
            Voltar para lançamentos
          </a>
        </div>

        <article
          animate.enter="terraco-reveal-delay"
          class="terraco-floating-card overflow-hidden rounded-lg bg-elevated"
        >
          <div class="grid lg:grid-cols-12">
            <div
              [class.terraco-skeleton]="!imageLoaded()"
              class="group relative aspect-[2/1] w-full overflow-hidden rounded-t-[calc(var(--radius-lg)-1px)] border-b border-border-subtle bg-surface sm:aspect-[5/3] lg:col-span-7 lg:aspect-auto lg:min-h-[460px] lg:rounded-tr-none lg:rounded-l-[calc(var(--radius-lg)-1px)] lg:border-b-0 lg:border-r lg:border-border-subtle"
            >
              <img
                #heroImg
                data-testid="launch-hero-image"
                [src]="item().imagem"
                [alt]="item().imagemAlt"
                [width]="item().imagemWidth"
                [height]="item().imagemHeight"
                [style.view-transition-name]="'launch-image-' + item().slug"
                (load)="markImageLoaded()"
                (error)="markImageLoaded()"
                fetchpriority="high"
                decoding="async"
                class="relative z-[1] h-full w-full rounded-t-[calc(var(--radius-lg)-1px)] object-cover object-center transition-transform duration-300 lg:rounded-tr-none lg:rounded-l-[calc(var(--radius-lg)-1px)]"
                [class.group-hover:scale-[1.02]]="hasGallery()"
              />
              @if (hasGallery()) {
                <button
                  type="button"
                  (click)="openLightbox(0)"
                  [attr.aria-label]="'Abrir galeria de imagens de ' + item().nome"
                  class="absolute inset-0 z-[2] cursor-zoom-in focus-visible:outline-offset-[-2px]"
                ></button>
              }
            </div>

            <div
              class="flex flex-col justify-between gap-4 p-4 sm:gap-5 sm:p-6 lg:col-span-5 lg:gap-6 lg:p-6"
            >
              <div class="space-y-1.5 sm:space-y-2">
                <p class="text-[13px] font-normal leading-[1.4] text-ink-muted">
                  {{ item().bairro }}, {{ item().cidade }}, {{ item().uf }}
                </p>

                <h1
                  id="launch-heading"
                  [style.view-transition-name]="'launch-title-' + item().slug"
                  class="font-display text-[clamp(1.75rem,3vw,2.25rem)] font-medium not-italic leading-[1.12] tracking-[-0.02em] text-ink text-balance"
                >
                  {{ item().nome }}
                </h1>
              </div>

              <dl
                class="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-border-subtle py-3 sm:gap-x-6 sm:gap-y-4 sm:py-4"
              >
                <div class="space-y-1">
                  <dt class="text-[13px] font-normal text-ink-muted">
                    Dormitórios
                  </dt>
                  <dd
                    class="text-[15px] font-normal leading-[1.4] text-ink tabular-nums"
                  >
                    {{ item().quartos }}
                  </dd>
                </div>

                <div class="space-y-1">
                  <dt class="text-[13px] font-normal text-ink-muted">Metragem</dt>
                  <dd
                    class="text-[15px] font-normal leading-[1.4] text-ink tabular-nums"
                  >
                    {{ item().metragem }}
                  </dd>
                </div>

                <div class="space-y-1">
                  <dt class="text-[13px] font-normal text-ink-muted">
                    Tipologias
                  </dt>
                  <dd class="text-[15px] font-normal leading-[1.4] text-ink">
                    {{ item().tipologias }}
                  </dd>
                </div>

                @if (item().vagas) {
                  <div class="space-y-1">
                    <dt class="text-[13px] font-normal text-ink-muted">Vagas</dt>
                    <dd
                      class="text-[15px] font-normal leading-[1.4] text-ink tabular-nums"
                    >
                      {{ item().vagas }}
                    </dd>
                  </div>
                }

                @if (item().entrega) {
                  <div class="space-y-1">
                    <dt class="text-[13px] font-normal text-ink-muted">
                      Previsão de entrega
                    </dt>
                    <dd
                      class="text-[15px] font-normal leading-[1.4] text-ink tabular-nums"
                    >
                      {{ item().entrega }}
                    </dd>
                  </div>
                }

                @if (formattedPrice(); as price) {
                  <div class="space-y-1">
                    <dt class="text-[13px] font-normal text-ink-muted">
                      A partir de
                    </dt>
                    <dd
                      class="text-[15px] font-medium leading-[1.4] text-ink tabular-nums"
                    >
                      {{ price }}
                    </dd>
                  </div>
                }
              </dl>

              <div class="space-y-3">
                <p class="text-[14px] font-normal leading-[1.45] text-ink-muted">
                  Como podemos ajudar sobre o {{ item().nome }}?
                </p>

                <div
                  role="group"
                  aria-label="Assunto para conversa no WhatsApp"
                  class="grid grid-cols-2 gap-2"
                >
                  @for (option of intentOptions; track option.key) {
                    <button
                      type="button"
                      (click)="selectIntent(option.key)"
                      [attr.aria-pressed]="selectedIntent() === option.key"
                      [class]="
                        selectedIntent() === option.key
                          ? 'terraco-btn flex min-h-[40px] items-center justify-center rounded-pill border border-brand bg-brand/10 px-3 py-1.5 text-center text-[13px] font-medium leading-[1.3] text-brand'
                          : 'terraco-btn flex min-h-[40px] items-center justify-center rounded-pill border border-border-subtle bg-surface/60 px-3 py-1.5 text-center text-[13px] font-normal leading-[1.3] text-ink-muted hover:border-ink/25 hover:text-ink'
                      "
                    >
                      {{ option.label }}
                    </button>
                  }
                </div>

                <a
                  [href]="whatsappHref()"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="terraco-btn terraco-btn-moss flex min-h-[46px] w-full items-center justify-center rounded-pill bg-brand px-6 py-2.5 text-sm font-medium leading-[1.35] text-ink-inverse hover:bg-brand-hover sm:min-h-[50px] sm:py-3"
                >
                  Falar no WhatsApp
                </a>
              </div>
            </div>
          </div>
        </article>

        <div class="mt-8 space-y-8 sm:mt-10 sm:space-y-10">
          @if (item().condicoesEspeciais?.length) {
            <section
              aria-labelledby="special-conditions-heading"
              class="rounded-lg border border-brand/25 bg-surface/55 p-5 sm:p-8"
            >
              <h2
                id="special-conditions-heading"
                class="font-display text-[clamp(1.25rem,2vw,1.5rem)] font-medium not-italic leading-[1.2] tracking-[-0.015em] text-ink text-balance"
              >
                Condições especiais de pagamento
              </h2>

              <p
                class="mt-2 max-w-3xl text-[15px] font-normal leading-[1.5] text-ink-muted"
              >
                Facilidades vigentes para entrada e financiamento — consulte a
                disponibilidade da unidade.
              </p>

              <ul class="mt-5 space-y-3">
                @for (
                  condicao of item().condicoesEspeciais ?? [];
                  track condicao
                ) {
                  <li
                    class="flex items-start gap-2.5 text-[15px] font-normal leading-[1.5] text-ink"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="mt-0.5 h-4 w-4 shrink-0 text-brand"
                    >
                      <path d="M4.5 10.5 8 14l7.5-8" />
                    </svg>
                    <span>{{ condicao }}</span>
                  </li>
                }
              </ul>

              <div class="mt-5 border-t border-border-subtle pt-4">
                <a
                  [href]="specialConditionsWhatsappHref()"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="terraco-link-underline inline-flex items-center text-[14px] font-medium text-brand transition-colors duration-150 hover:text-brand-hover"
                >
                  Simular essas condições no WhatsApp
                </a>
              </div>
            </section>
          }

          <section
            aria-labelledby="about-heading"
            class="rounded-lg border border-border-subtle bg-elevated p-5 sm:p-8"
          >
            <h2
              id="about-heading"
              class="font-display text-[clamp(1.25rem,2vw,1.5rem)] font-medium not-italic leading-[1.2] tracking-[-0.015em] text-ink text-balance"
            >
              Sobre o empreendimento
            </h2>

            <p
              class="mt-3 max-w-3xl text-[15px] font-normal leading-[1.6] text-ink sm:text-base"
            >
              {{ item().resumo }}
            </p>

            @if (item().endereco) {
              <dl
                class="mt-6 grid grid-cols-1 gap-4 border-t border-border-subtle pt-5"
              >
                <div class="space-y-1">
                  <dt class="text-[13px] font-normal text-ink-muted">Endereço</dt>
                  <dd class="text-[15px] font-normal leading-[1.45] text-ink">
                    {{ item().endereco }}
                  </dd>
                </div>
              </dl>
            }
          </section>

          @if (item().diferenciais.length > 0) {
            <section
              aria-labelledby="features-heading"
              class="rounded-lg border border-border-subtle bg-elevated p-5 sm:p-8"
            >
              <h2
                id="features-heading"
                class="font-display text-[clamp(1.25rem,2vw,1.5rem)] font-medium not-italic leading-[1.2] tracking-[-0.015em] text-ink text-balance"
              >
                Diferenciais &amp; Lazer
              </h2>

              <ul
                class="mt-5 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2"
              >
                @for (diferencial of item().diferenciais; track diferencial) {
                  <li
                    class="flex items-start gap-2.5 text-[15px] font-normal leading-[1.5] text-ink"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="mt-0.5 h-4 w-4 shrink-0 text-brand"
                    >
                      <path d="M4.5 10.5 8 14l7.5-8" />
                    </svg>
                    <span>{{ diferencial }}</span>
                  </li>
                }
              </ul>
            </section>
          }

          <app-launch-simulator [item]="item()" />

          @if (hasGallery()) {
            <section
              aria-labelledby="gallery-heading"
              class="rounded-lg border border-border-subtle bg-elevated p-5 sm:p-8"
            >
              <h2
                id="gallery-heading"
                class="font-display text-[clamp(1.25rem,2vw,1.5rem)] font-medium not-italic leading-[1.2] tracking-[-0.015em] text-ink text-balance"
              >
                Galeria e Plantas
              </h2>

              <div
                class="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3"
              >
                @for (media of galleryImages(); track media.url; let i = $index) {
                  <button
                    type="button"
                    (click)="openLightbox(i)"
                    [attr.aria-label]="
                      'Ampliar imagem ' + (i + 1) + ': ' + media.alt
                    "
                    class="group relative aspect-[4/3] overflow-hidden rounded-md border border-border-subtle bg-surface text-left transition-colors duration-150 hover:border-brand/40"
                  >
                    <img
                      [src]="media.url"
                      [alt]="media.alt"
                      [attr.width]="media.width ?? null"
                      [attr.height]="media.height ?? null"
                      loading="lazy"
                      decoding="async"
                      class="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </button>
                }
              </div>
            </section>
          }
        </div>
      </div>

      <app-image-lightbox
        [images]="galleryImages()"
        [initialIndex]="lightboxIndex()"
        [isOpen]="lightboxOpen()"
        (closed)="closeLightbox()"
      />
    </section>
  `,
})
export class PrimeViewLandingComponent {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  readonly item = input.required<Lancamento>();
  readonly imageLoaded = signal<boolean>(false);
  readonly selectedIntent = signal<LaunchIntentKey>('plantas_valores');
  readonly lightboxOpen = signal<boolean>(false);
  readonly lightboxIndex = signal<number>(0);

  readonly intentOptions = LAUNCH_INTENT_OPTIONS;

  private readonly heroImg = viewChild<ElementRef<HTMLImageElement>>('heroImg');

  readonly galleryImages = computed<readonly LaunchMediaItem[]>(
    () => this.item().galeria ?? []
  );

  readonly hasGallery = computed(() => this.galleryImages().length > 0);

  readonly formattedPrice = computed<string | null>(() => {
    const price = this.item().precoAPartirDe;
    return typeof price === 'number' && price > 0
      ? formatCurrencyBRL(price)
      : null;
  });

  readonly whatsappHref = computed(() => {
    const currentItem = this.item();
    const currentKey = this.selectedIntent();
    const option =
      LAUNCH_INTENT_OPTIONS.find((item) => item.key === currentKey) ??
      LAUNCH_INTENT_OPTIONS[0];
    return buildWhatsAppUrl(option.buildMessage(currentItem));
  });

  readonly specialConditionsWhatsappHref = computed(() => {
    const currentItem = this.item();
    return buildWhatsAppUrl(
      `Oi! Quero simular as condições especiais de pagamento do ${currentItem.nome} (${currentItem.bairro}).`
    );
  });

  constructor() {
    afterNextRender(() => {
      const el = this.heroImg()?.nativeElement;
      if (el?.complete && el.naturalWidth > 0) {
        this.imageLoaded.set(true);
      }
    });

    effect(() => {
      // Reset per-launch interactive state when navigating between slugs.
      this.item().slug;
      this.selectedIntent.set('plantas_valores');
      this.lightboxOpen.set(false);
      this.lightboxIndex.set(0);
      const el = this.heroImg()?.nativeElement;
      this.imageLoaded.set(Boolean(el?.complete && el.naturalWidth > 0));
    });

    effect(() => {
      const currentItem = this.item();
      const jsonLd = buildJsonLd(currentItem);
      const serialized = JSON.stringify(jsonLd).replace(/</g, '\\u003c');

      let scriptEl = this.document.getElementById(
        'launch-jsonld'
      ) as HTMLScriptElement | null;
      if (!scriptEl) {
        scriptEl = this.document.createElement('script');
        scriptEl.type = 'application/ld+json';
        scriptEl.id = 'launch-jsonld';
        this.document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = serialized;
    });

    this.destroyRef.onDestroy(() => {
      const scriptEl = this.document.getElementById('launch-jsonld');
      scriptEl?.remove();
    });
  }

  markImageLoaded(): void {
    this.imageLoaded.set(true);
  }

  selectIntent(intent: LaunchIntentKey): void {
    this.selectedIntent.set(intent);
  }

  openLightbox(index: number): void {
    if (!this.hasGallery()) return;
    this.lightboxIndex.set(index);
    this.lightboxOpen.set(true);
  }

  closeLightbox(): void {
    this.lightboxOpen.set(false);
  }
}
