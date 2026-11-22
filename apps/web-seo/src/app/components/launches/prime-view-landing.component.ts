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
  CardResizeDirective,
  SITE_NAME,
  SITE_URL,
  buildWhatsAppUrl,
  type Lancamento,
} from '../../core';
import { ImageLightboxComponent } from './image-lightbox.component';

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
        mainEntity: {
          '@type': 'ApartmentComplex',
          name: item.nome,
          description: `${item.quartos}, ${item.metragem} (${item.tipologias}), ${item.vagas}. ${item.resumo}`,
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
  imports: [RouterLink, ImageLightboxComponent, CardResizeDirective],
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
          appCardResize
          animate.enter="terraco-reveal-delay"
          class="terraco-floating-card overflow-hidden rounded-lg bg-elevated"
        >
          <div class="grid lg:grid-cols-12">
            <div
              [class.terraco-skeleton]="!imageLoaded()"
              class="relative aspect-[2/1] w-full overflow-hidden rounded-t-[calc(var(--radius-lg)-1px)] border-b border-border-subtle bg-surface sm:aspect-[5/3] lg:col-span-7 lg:aspect-auto lg:h-[460px] lg:rounded-tr-none lg:rounded-l-[calc(var(--radius-lg)-1px)] lg:border-b-0 lg:border-r lg:border-border-subtle"
            >
              <button
                #heroTrigger
                type="button"
                data-testid="launch-hero-trigger"
                (click)="openLightbox()"
                [attr.aria-label]="'Ampliar foto de ' + item().nome"
                class="terraco-card-media-trigger relative z-[1] block h-full w-full overflow-hidden rounded-t-[calc(var(--radius-lg)-1px)] text-left lg:rounded-tr-none lg:rounded-l-[calc(var(--radius-lg)-1px)] cursor-zoom-in"
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
                  class="terraco-card-media-img h-full w-full rounded-t-[calc(var(--radius-lg)-1px)] object-cover object-[center_25%] lg:rounded-tr-none lg:rounded-l-[calc(var(--radius-lg)-1px)]"
                />

                <span
                  aria-hidden="true"
                  class="terraco-card-media-scrim pointer-events-none absolute inset-0 bg-ink/18 opacity-0"
                ></span>

                <span
                  aria-hidden="true"
                  class="terraco-card-media-hint pointer-events-none absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-pill border border-ink-inverse/20 bg-ink/75 px-3 py-1.5 text-[13px] font-medium leading-none text-ink-inverse opacity-0 backdrop-blur-xs"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="h-3.5 w-3.5"
                  >
                    <path d="M15 3h6v6" />
                    <path d="M9 21H3v-6" />
                    <path d="m21 3-7 7" />
                    <path d="m3 21 7-7" />
                  </svg>
                  <span>Ampliar</span>
                </span>
              </button>
            </div>

            <div
              class="flex flex-col justify-between gap-3 p-4 sm:gap-5 sm:p-6 lg:col-span-5 lg:gap-6 lg:p-6"
            >
              <div class="space-y-1.5 sm:space-y-2">
                <p class="text-[13px] font-normal text-ink-muted">
                  {{ item().bairro }}, {{ item().cidade }}, {{ item().uf }}
                </p>

                <h1
                  id="launch-heading"
                  [style.view-transition-name]="'launch-title-' + item().slug"
                  class="font-display text-[clamp(1.75rem,3vw,2.25rem)] font-medium leading-[1.12] tracking-[-0.02em] text-ink text-balance"
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
                  <dt class="text-[13px] font-normal text-ink-muted">Vagas</dt>
                  <dd
                    class="text-[15px] font-normal leading-[1.4] text-ink tabular-nums"
                  >
                    {{ item().vagas }}
                  </dd>
                </div>

                <div class="space-y-1">
                  <dt class="text-[13px] font-normal text-ink-muted">
                    Tipologias
                  </dt>
                  <dd class="text-[15px] font-normal leading-[1.4] text-ink">
                    {{ item().tipologias || 'Lazer completo' }}
                  </dd>
                </div>
              </dl>

              <div class="space-y-2.5 sm:space-y-3">
                <p class="text-[15px] font-normal leading-[1.5] text-ink-muted">
                  Plantas, valores e condições direto no WhatsApp.
                </p>

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
      </div>
    </section>

    @if (isLightboxOpen()) {
      <app-image-lightbox
        [src]="item().imagem"
        [alt]="item().imagemAlt"
        [title]="item().nome"
        [originElement]="heroTrigger"
        (closed)="closeLightbox()"
      />
    }
  `,
})
export class PrimeViewLandingComponent {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  readonly item = input.required<Lancamento>();
  readonly imageLoaded = signal<boolean>(false);
  readonly isLightboxOpen = signal<boolean>(false);
  private readonly heroImg = viewChild<ElementRef<HTMLImageElement>>('heroImg');
  protected readonly heroTrigger =
    viewChild<ElementRef<HTMLButtonElement>>('heroTrigger');

  readonly whatsappHref = computed(() =>
    buildWhatsAppUrl(this.item().whatsappMensagem)
  );

  constructor() {
    afterNextRender(() => {
      const el = this.heroImg()?.nativeElement;
      if (el?.complete && el.naturalWidth > 0) {
        this.imageLoaded.set(true);
      }
    });

    effect(() => {
      // Reset image loaded state when navigating between different launch slugs.
      this.item().slug;
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

  openLightbox(): void {
    this.isLightboxOpen.set(true);
  }

  closeLightbox(): void {
    this.isLightboxOpen.set(false);
    this.heroTrigger()?.nativeElement.focus();
  }
}
