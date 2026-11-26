import { DOCUMENT, NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  BAIRROS_BH,
  LancamentosService,
  type LeadIntent,
  LeadsService,
  SITE_NAME,
  SITE_URL,
  buildWhatsAppUrl,
  formatCurrencyBRL,
  type Lancamento,
  type LaunchEntornoItem,
  type LaunchFloorPlan,
  type LaunchMediaItem,
  type LaunchPilarGroup,
} from '../../core';
import {
  type JourneyDestination,
  NextJourneyComponent,
} from '../shared/next-journey.component';
import { FavoriteButtonComponent } from './favorite-button.component';
import { ImageLightboxComponent } from './image-lightbox.component';
import { LaunchCardComponent } from './launch-card.component';
import { LaunchFloorPlansComponent } from './launch-floor-plans.component';
import {
  LaunchSimulatorComponent,
  type LaunchSimulationSummary,
} from './launch-simulator.component';
import { formatBrazilianPhone } from './whatsapp-alert-form.component';

export type LaunchIntentKey =
  | 'tabela_condicoes'
  | 'agendar_visita'
  | 'duvida_plantas'
  | 'conhecer_bairro';

interface LaunchIntentOption {
  readonly key: LaunchIntentKey;
  readonly leadIntent: LeadIntent;
  readonly label: string;
  readonly buildMessage: (item: Lancamento) => string;
}

interface HeroMetricItem {
  readonly label: string;
  readonly value: string;
  readonly highlight?: boolean;
  readonly tabular?: boolean;
}

const LAUNCH_INTENT_OPTIONS: readonly LaunchIntentOption[] = [
  {
    key: 'tabela_condicoes',
    leadIntent: 'plantas_valores',
    label: 'Receber tabela e condições',
    buildMessage: (item) =>
      `Oi! Quero receber a tabela atualizada e as condições do ${item.nome} (${item.bairro}).`,
  },
  {
    key: 'agendar_visita',
    leadIntent: 'agendar_visita',
    label: 'Agendar visita',
    buildMessage: (item) =>
      `Oi! Quero agendar uma visita para conhecer o ${item.nome} (${item.bairro}).`,
  },
  {
    key: 'duvida_plantas',
    leadIntent: 'simular_entrada',
    label: 'Dúvida sobre plantas',
    buildMessage: (item) =>
      `Oi! Tenho uma dúvida sobre as plantas e disponibilidades do ${item.nome} (${item.bairro}).`,
  },
  {
    key: 'conhecer_bairro',
    leadIntent: 'tirar_duvida',
    label: 'Conhecer o bairro',
    buildMessage: (item) =>
      `Oi! Gostaria de saber mais sobre a localização e o entorno do ${item.nome} no bairro ${item.bairro}.`,
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
          ...(item.construtora
            ? {
                brand: {
                  '@type': 'Organization',
                  name: item.construtora,
                },
              }
            : {}),
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
  imports: [
    NgOptimizedImage,
    RouterLink,
    FavoriteButtonComponent,
    ImageLightboxComponent,
    LaunchCardComponent,
    LaunchFloorPlansComponent,
    LaunchSimulatorComponent,
    NextJourneyComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .m3e-tab-chip {
      border-radius: 9999px;
      transition:
        border-radius 240ms cubic-bezier(0.2, 0, 0, 1),
        background-color 160ms cubic-bezier(0.2, 0, 0, 1),
        border-color 160ms cubic-bezier(0.2, 0, 0, 1),
        color 160ms cubic-bezier(0.2, 0, 0, 1);
    }

    .m3e-tab-chip[aria-pressed='true'],
    .m3e-tonal-btn:hover,
    .m3e-tonal-btn:active {
      border-radius: 12px;
    }

    .m3e-tonal-btn {
      border-radius: 9999px;
      transition:
        border-radius 240ms cubic-bezier(0.2, 0, 0, 1),
        background-color 160ms cubic-bezier(0.2, 0, 0, 1),
        border-color 160ms cubic-bezier(0.2, 0, 0, 1),
        color 160ms cubic-bezier(0.2, 0, 0, 1);
    }

    .m3e-action-pill {
      border-radius: 9999px;
      transition:
        border-radius 260ms var(--ease-expressive, cubic-bezier(0.2, 0, 0, 1)),
        background-color 160ms var(--ease-expressive, cubic-bezier(0.2, 0, 0, 1)),
        transform 220ms var(--ease-expressive, cubic-bezier(0.2, 0, 0, 1));
    }

    .m3e-action-pill:hover,
    .m3e-action-pill:active {
      border-radius: 12px;
    }

    @keyframes m3e-fab-text-spring {
      0% {
        opacity: 0;
        transform: translateY(8px) scale(0.96);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .m3e-cta-pill {
      border-radius: 16px;
      transition:
        border-radius 280ms var(--ease-expressive, cubic-bezier(0.2, 0, 0, 1)),
        background-color 160ms var(--ease-expressive, cubic-bezier(0.2, 0, 0, 1)),
        opacity 220ms var(--ease-expressive, cubic-bezier(0.2, 0, 0, 1)),
        transform 280ms var(--ease-expressive, cubic-bezier(0.2, 0, 0, 1)),
        box-shadow 280ms var(--ease-expressive, cubic-bezier(0.2, 0, 0, 1));
    }

    .m3e-cta-pill[data-state='docked']:hover,
    .m3e-cta-pill[data-state='docked']:active {
      border-radius: 12px;
    }

    .m3e-cta-pill[data-state='floating'],
    .m3e-cta-pill[data-state='retracted'] {
      border-radius: 9999px;
      box-shadow: var(--shadow-float, var(--shadow-floating));
    }

    .m3e-cta-pill[data-state='floating']:hover,
    .m3e-cta-pill[data-state='floating']:active {
      border-radius: 16px;
    }

    .m3e-fab-label {
      display: inline-block;
      animation: m3e-fab-text-spring 380ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }

    @media (prefers-reduced-motion: reduce) {
      .m3e-tab-chip,
      .m3e-tonal-btn,
      .m3e-action-pill,
      .m3e-cta-pill {
        transition: none;
      }

      .m3e-fab-label {
        animation: none;
      }
    }
  `,
  template: `
    <div class="flex flex-1 flex-col bg-canvas">
      <!-- Primeira dobra limpa e protagonista sobre #FAF8F4 -->
      <section
        aria-labelledby="launch-heading"
        class="bg-canvas pt-4 pb-6 sm:pt-7 sm:pb-10 lg:pt-10 lg:pb-12"
      >
        <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            class="terraco-reveal mb-3 flex flex-wrap items-center justify-between gap-3 sm:mb-5"
          >
            <nav aria-label="Navegação estrutural">
              <ol
                class="flex flex-wrap items-center gap-2 text-[13px] font-normal text-ink-muted"
              >
                <li>
                  <a
                    routerLink="/"
                    class="transition-colors duration-150 motion-reduce:transition-none hover:text-ink"
                  >
                    Início
                  </a>
                </li>
                <li aria-hidden="true" class="text-ink-muted/60">/</li>
                <li>
                  <a
                    routerLink="/lancamentos"
                    class="transition-colors duration-150 motion-reduce:transition-none hover:text-ink"
                  >
                    Lançamentos
                  </a>
                </li>
                <li aria-hidden="true" class="text-ink-muted/60">/</li>
                <li aria-current="page" class="text-ink">
                  {{ item().nome }}
                </li>
              </ol>
            </nav>

            @if (item().construtora) {
              <p class="hidden text-[13px] font-normal text-ink-muted sm:block">
                {{ item().construtora }}
              </p>
            }
          </div>

          <div
            class="grid gap-5 sm:gap-7 lg:grid-cols-12 lg:items-center lg:gap-10 xl:gap-12"
          >
            <!-- Mosaico fotográfico protagonista -->
            <div class="terraco-reveal-delay lg:col-span-7">
              <div class="grid gap-3 lg:grid-cols-12">
                <div
                  [class.terraco-skeleton]="!imageLoaded()"
                  [class]="
                    heroSecondaryImages().length > 0
                      ? 'group relative aspect-[16/9] w-full min-w-0 overflow-hidden rounded-[20px] bg-surface sm:aspect-[16/10] lg:col-span-9 lg:rounded-[24px]'
                      : 'group relative aspect-[16/9] w-full min-w-0 overflow-hidden rounded-[20px] bg-surface sm:aspect-[16/10] lg:col-span-12 lg:rounded-[24px]'
                  "
                >
                  <img
                    #heroImg
                    data-testid="launch-hero-image"
                    [ngSrc]="item().imagem"
                    [alt]="item().imagemAlt"
                    [width]="item().imagemWidth"
                    [height]="item().imagemHeight"
                    priority
                    [style.view-transition-name]="'launch-image-' + item().slug"
                    (load)="markImageLoaded()"
                    (error)="markImageLoaded()"
                    class="relative z-[1] h-full w-full rounded-[20px] object-cover object-center transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:scale-[1.02] motion-reduce:group-hover:scale-100 lg:rounded-[24px]"
                  />

                  @if (hasGallery()) {
                    <button
                      type="button"
                      (click)="openLightbox(0)"
                      [attr.aria-label]="
                        'Abrir galeria de imagens de ' + item().nome
                      "
                      class="absolute inset-0 z-[2] cursor-zoom-in focus-visible:outline-offset-[-2px]"
                    ></button>

                    <button
                      type="button"
                      (click)="openLightbox(0)"
                      class="terraco-btn absolute right-3 bottom-3 z-10 inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-pill border border-border-subtle bg-elevated/95 px-3.5 py-1 text-[13px] font-medium text-ink shadow-chip backdrop-blur-xs hover:border-border-strong sm:min-h-[38px]"
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
                        <rect x="3" y="3" width="18" height="18" rx="3" />
                        <circle cx="9" cy="9" r="1.5" />
                        <path d="m21 15-4.5-4.5L7 20" />
                      </svg>
                      <span class="tabular-nums">
                        {{ galleryImages().length }} fotos
                      </span>
                    </button>
                  }

                  <div class="absolute top-3 right-3 z-10">
                    <app-favorite-button
                      [slug]="item().slug"
                      [nome]="item().nome"
                    />
                  </div>
                </div>

                @if (heroSecondaryImages().length > 0) {
                  <div class="hidden lg:col-span-3 lg:flex lg:flex-col lg:gap-3">
                    @for (
                      preview of heroSecondaryImages();
                      track preview.url;
                      let idx = $index
                    ) {
                      <button
                        type="button"
                        (click)="openLightbox(idx)"
                        [attr.aria-label]="'Ampliar foto: ' + preview.alt"
                        class="group relative flex-1 overflow-hidden rounded-[18px] bg-surface cursor-pointer"
                      >
                        <img
                          [src]="preview.url"
                          [alt]="preview.alt"
                          [attr.width]="preview.width ?? null"
                          [attr.height]="preview.height ?? null"
                          decoding="async"
                          class="h-full w-full rounded-[18px] object-cover object-center transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
                        />
                      </button>
                    }
                  </div>
                }
              </div>
            </div>

            <!-- Painel editorial e CTA único em Terracota -->
            <div class="flex min-w-0 flex-col gap-3.5 sm:gap-4 lg:col-span-5">
              <div class="space-y-1.5">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="text-[13px] font-normal text-ink-muted sm:text-[14px]">
                    @if (bairroGuideSlug(); as guideSlug) {
                      <a
                        [routerLink]="['/bairros', guideSlug]"
                        class="terraco-link-underline text-ink transition-colors duration-150 motion-reduce:transition-none hover:text-brand"
                      >{{ item().bairro }}</a>
                    } @else {
                      <span>{{ item().bairro }}</span>
                    }<span>, {{ item().cidade }} - {{ item().uf }}</span>
                  </p>
                  @if (item().badge) {
                    <span
                      class="inline-flex items-center rounded-pill bg-[#E5F2EC] px-2.5 py-0.5 text-[12px] font-medium leading-[1.3] text-[#1F6F50]"
                    >
                      {{ item().badge }}
                    </span>
                  }
                </div>

                <h1
                  id="launch-heading"
                  [style.view-transition-name]="'launch-title-' + item().slug"
                  class="font-display text-[clamp(1.75rem,3.4vw,2.625rem)] font-medium not-italic leading-[1.08] tracking-[-0.025em] text-ink text-balance"
                >
                  {{ item().nome }}
                </h1>

                <p class="text-[13px] font-normal text-ink-muted sm:text-[14px]">
                  {{ item().endereco }}
                </p>
              </div>

              <!-- Ficha técnica dinâmica (somente campos disponíveis) -->
              <dl
                class="grid grid-cols-2 gap-x-4 gap-y-2.5 border-y border-border-subtle py-3 sm:gap-x-5 sm:gap-y-3 sm:py-3.5"
              >
                @for (metric of heroMetrics(); track metric.label) {
                  <div class="space-y-0.5">
                    <dt class="text-[12px] font-normal text-ink-muted sm:text-[13px]">
                      {{ metric.label }}
                    </dt>
                    <dd
                      [class]="
                        metric.highlight
                          ? 'text-[13px] font-medium leading-[1.3] text-brand sm:text-[14px]'
                          : 'text-[13px] font-medium leading-[1.3] text-ink sm:text-[14px]'
                      "
                      [class.tabular-nums]="metric.tabular"
                    >
                      {{ metric.value }}
                    </dd>
                  </div>
                }
              </dl>

              <div class="space-y-2.5">
                @let ctaState = ctaPillState();
                <div #heroCtaSlot class="min-h-[52px]">
                  <a
                    #ctaPillEl
                    [href]="contextualWhatsappHref()"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="whatsapp-cta-pill"
                    [attr.data-state]="ctaState"
                    [attr.aria-hidden]="ctaState === 'retracted' ? 'true' : null"
                    [attr.tabindex]="ctaState === 'retracted' ? -1 : null"
                    [attr.aria-label]="
                      'Abrir WhatsApp: ' +
                      floatingPillLabel() +
                      ' — ' +
                      item().nome
                    "
                    [class]="
                      ctaState === 'docked'
                        ? 'm3e-cta-pill relative flex min-h-[48px] w-full items-center justify-center gap-2.5 bg-action px-6 py-2.5 text-[14px] font-medium leading-[1.35] text-white hover:bg-action-hover'
                        : ctaState === 'floating'
                          ? 'm3e-cta-pill fixed right-4 bottom-5 z-40 inline-flex min-h-[48px] w-auto max-w-[calc(100vw-2rem)] translate-y-0 scale-100 items-center justify-center gap-2.5 bg-action px-5 py-2.5 text-[14px] font-medium leading-[1.3] text-white opacity-100 hover:bg-action-hover md:right-7 md:bottom-7'
                          : 'm3e-cta-pill pointer-events-none fixed right-4 bottom-5 z-40 inline-flex min-h-[48px] w-auto max-w-[calc(100vw-2rem)] translate-y-3 scale-90 items-center justify-center gap-2.5 bg-action px-5 py-2.5 text-[14px] font-medium leading-[1.3] text-white opacity-0 md:right-7 md:bottom-7'
                    "
                  >
                    @if (ctaState !== 'docked') {
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="h-[18px] w-[18px] shrink-0"
                      >
                        <path
                          d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                        />
                      </svg>
                    }
                    <span class="min-w-0 overflow-hidden">
                      @for (label of [floatingPillLabel()]; track label) {
                        <span
                          data-testid="whatsapp-cta-label"
                          class="m3e-fab-label block truncate"
                        >
                          {{ label }}
                        </span>
                      }
                    </span>
                  </a>
                </div>

                <div class="hidden sm:block">
                  @if (callbackSubmitted()) {
                    <p
                      role="status"
                      data-testid="launch-callback-success"
                      class="rounded-[14px] border border-[#1F6F50]/25 bg-[#E5F2EC] px-3.5 py-2.5 text-[13px] font-normal leading-[1.45] text-[#1F6F50]"
                    >
                      Recebemos seu contato. Um especialista retorna em
                      instantes sobre {{ item().nome }}.
                    </p>
                  } @else if (callbackOpen()) {
                    <form
                      (submit)="submitCallbackLead($event)"
                      animate.enter="terraco-chip-enter"
                      class="space-y-2.5 rounded-[18px] border border-border-subtle bg-surface p-4"
                    >
                      <div class="flex items-center justify-between gap-2">
                        <span class="text-[13px] font-medium text-ink">
                          Receber retorno no WhatsApp
                        </span>
                        <button
                          type="button"
                          (click)="toggleCallbackForm()"
                          class="cursor-pointer text-[13px] font-normal text-ink-muted hover:text-ink"
                        >
                          Fechar
                        </button>
                      </div>

                      <input
                        type="text"
                        [value]="callbackName()"
                        (input)="onCallbackNameInput($event)"
                        placeholder="Seu nome (opcional)"
                        aria-label="Seu nome"
                        autocomplete="name"
                        class="min-h-[40px] w-full rounded-[12px] border border-border-subtle bg-canvas px-3 py-1.5 text-[13px] text-ink placeholder:text-ink-muted/70 focus:border-brand focus:outline-none"
                      />

                      <div class="flex flex-col gap-2 sm:flex-row">
                        <input
                          type="tel"
                          [value]="callbackPhone()"
                          (input)="onCallbackPhoneInput($event)"
                          placeholder="(31) 99999-9999"
                          aria-label="Seu WhatsApp com DDD"
                          autocomplete="tel"
                          required
                          class="min-h-[40px] flex-1 rounded-[12px] border border-border-subtle bg-canvas px-3 py-1.5 text-[13px] text-ink placeholder:text-ink-muted/70 focus:border-brand focus:outline-none tabular-nums"
                        />
                        <button
                          type="submit"
                          [disabled]="callbackSubmitting()"
                          class="terraco-btn inline-flex min-h-[40px] shrink-0 cursor-pointer items-center justify-center rounded-pill bg-ink px-4 py-1.5 text-[13px] font-medium text-ink-inverse hover:bg-ink/90 disabled:opacity-60"
                        >
                          {{ callbackSubmitting() ? 'Enviando...' : 'Solicitar' }}
                        </button>
                      </div>

                      @if (callbackError(); as errorMsg) {
                        <p
                          role="alert"
                          class="rounded-sm bg-error-bg px-3 py-2 text-[13px] font-normal text-error-fg"
                        >
                          {{ errorMsg }}
                        </p>
                      }
                    </form>
                  } @else {
                    <button
                      type="button"
                      (click)="toggleCallbackForm()"
                      data-testid="launch-callback-toggle"
                      class="terraco-link-underline w-full cursor-pointer py-0.5 text-center text-[13px] font-normal text-ink-muted transition-colors duration-150 motion-reduce:transition-none hover:text-ink"
                    >
                      Prefere que um especialista te chame?
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- M3E Pill Bar sticky no escopo da página -->
      <div
        class="sticky top-[72px] z-20 mx-auto w-full max-w-7xl px-4 sm:top-[76px] sm:px-6 lg:px-8"
      >
        <nav
          #sectionNav
          aria-label="Seções do empreendimento"
          class="terraco-no-scrollbar flex items-center gap-1.5 overflow-x-auto rounded-pill border border-border-subtle bg-elevated/95 p-1.5 shadow-chip backdrop-blur-md"
        >
          <a
            #sectionNavLink
            data-section-id="sobre"
            href="#sobre"
            (click)="scrollToSection($event, 'sobre')"
            [attr.aria-current]="activeSection() === 'sobre' ? 'true' : null"
            [class]="sectionNavPillClass('sobre')"
          >
            Sobre
          </a>
          @if (pilaresList().length > 0) {
            <a
              #sectionNavLink
              data-section-id="pilares"
              href="#pilares"
              (click)="scrollToSection($event, 'pilares')"
              [attr.aria-current]="
                activeSection() === 'pilares' ? 'true' : null
              "
              [class]="sectionNavPillClass('pilares')"
            >
              Estrutura &amp; Lazer
            </a>
          }
          @if (entornoItems().length > 0) {
            <a
              #sectionNavLink
              data-section-id="entorno"
              href="#entorno"
              (click)="scrollToSection($event, 'entorno')"
              [attr.aria-current]="
                activeSection() === 'entorno' ? 'true' : null
              "
              [class]="sectionNavPillClass('entorno')"
            >
              Entorno
            </a>
          }
          @if (item().plantas?.length) {
            <a
              #sectionNavLink
              data-section-id="plantas"
              href="#plantas"
              (click)="scrollToSection($event, 'plantas')"
              [attr.aria-current]="
                activeSection() === 'plantas' ? 'true' : null
              "
              [class]="sectionNavPillClass('plantas')"
            >
              Plantas
            </a>
          }
          <a
            #sectionNavLink
            data-section-id="condicoes"
            href="#condicoes"
            (click)="scrollToSection($event, 'condicoes')"
            [attr.aria-current]="
              activeSection() === 'condicoes' ? 'true' : null
            "
            [class]="sectionNavPillClass('condicoes')"
          >
            {{ hasPrice() ? 'Simulador' : 'Tabela' }}
          </a>
          @if (hasGallery()) {
            <a
              #sectionNavLink
              data-section-id="galeria"
              href="#galeria"
              (click)="scrollToSection($event, 'galeria')"
              [attr.aria-current]="
                activeSection() === 'galeria' ? 'true' : null
              "
              [class]="sectionNavPillClass('galeria')"
            >
              Galeria
            </a>
          }
          @if (otherLaunches().length > 0) {
            <a
              #sectionNavLink
              data-section-id="outros-lancamentos"
              href="#outros-lancamentos"
              (click)="scrollToSection($event, 'outros-lancamentos')"
              [attr.aria-current]="
                activeSection() === 'outros-lancamentos' ? 'true' : null
              "
              [class]="sectionNavPillClass('outros-lancamentos')"
            >
              Comparar em BH
            </a>
          }
        </nav>
      </div>

      <!-- Sobre, Pilares (Abas/Chips M3E) e Entorno sobre #FAF8F4 -->
      <section
        aria-label="Detalhes, pilares e entorno"
        class="bg-canvas pt-10 pb-12 sm:pt-12 sm:pb-16 lg:pb-20"
      >
        <div
          class="mx-auto w-full max-w-7xl space-y-12 px-4 sm:px-6 sm:space-y-14 lg:px-8"
        >
          <!-- Sobre & Ficha Estrutural -->
          <section
            id="sobre"
            aria-labelledby="about-heading"
            class="scroll-mt-28"
          >
            <div class="grid gap-6 lg:grid-cols-12 lg:items-start lg:gap-12">
              <div class="space-y-2 lg:col-span-4">
                <h2
                  id="about-heading"
                  class="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-medium not-italic leading-[1.15] tracking-[-0.02em] text-ink text-balance"
                >
                  Sobre o empreendimento
                </h2>
                @if (item().tagline) {
                  <p class="text-[14px] font-normal text-ink-muted">
                    {{ item().tagline }}
                  </p>
                }
              </div>

              <div class="space-y-5 lg:col-span-8">
                <p
                  class="max-w-[64ch] text-[15px] font-normal leading-[1.65] text-ink sm:text-base"
                >
                  {{ item().resumo }}
                </p>

                <dl
                  class="grid gap-4 border-t border-border-subtle pt-5 sm:grid-cols-2"
                >
                  @if (item().estrutura) {
                    <div class="space-y-1">
                      <dt class="text-[13px] font-normal text-ink-muted">
                        Estrutura e implantação
                      </dt>
                      <dd
                        class="text-[14px] font-medium leading-[1.5] text-ink tabular-nums sm:text-[15px]"
                      >
                        {{ item().estrutura }}
                      </dd>
                    </div>
                  }

                  @if (item().projetos) {
                    <div class="space-y-1">
                      <dt class="text-[13px] font-normal text-ink-muted">
                        Projetos assinados
                      </dt>
                      <dd
                        class="text-[14px] font-medium leading-[1.5] text-ink sm:text-[15px]"
                      >
                        {{ item().projetos }}
                      </dd>
                    </div>
                  }

                  @if (item().registro) {
                    <div class="space-y-1 sm:col-span-2">
                      <dt class="text-[13px] font-normal text-ink-muted">
                        Incorporação e registro
                      </dt>
                      <dd
                        class="text-[13px] font-normal leading-[1.5] text-ink-muted tabular-nums"
                      >
                        {{ item().registro }}
                      </dd>
                    </div>
                  }
                </dl>
              </div>
            </div>
          </section>

          <!-- Pilares do Empreendimento por Abas/Chips M3E -->
          @if (pilaresList().length > 0) {
            <section
              id="pilares"
              aria-labelledby="pilares-heading"
              class="border-t border-border-subtle pt-12 scroll-mt-28"
            >
              <div
                class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
              >
                <div class="max-w-xl space-y-1.5">
                  <h2
                    id="pilares-heading"
                    class="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-medium not-italic leading-[1.15] tracking-[-0.02em] text-ink text-balance"
                  >
                    O que o condomínio e o apartamento oferecem
                  </h2>
                  <p class="text-[14px] font-normal text-ink-muted sm:text-[15px]">
                    Explore por dimensão para ver os itens completos sem poluir a tela.
                  </p>
                </div>

                <div
                  role="group"
                  aria-label="Dimensões do empreendimento"
                  class="flex flex-wrap items-center gap-2"
                >
                  @for (pilar of pilaresList(); track pilar.id) {
                    @let active = activePilar()?.id === pilar.id;
                    <button
                      type="button"
                      (click)="selectPilar(pilar.id)"
                      [attr.aria-pressed]="active"
                      [class]="
                        active
                          ? 'm3e-tab-chip inline-flex min-h-[40px] cursor-pointer items-center gap-2 border border-transparent bg-[#1C1B19] px-4 py-1.5 text-[13px] font-medium text-[#FAF8F4] shadow-chip sm:text-[14px]'
                          : 'm3e-tab-chip inline-flex min-h-[40px] cursor-pointer items-center gap-2 border border-transparent bg-[#F3EFE6] px-4 py-1.5 text-[13px] font-normal text-[#1C1B19] hover:bg-[#EAE3D5] sm:text-[14px]'
                      "
                    >
                      <span>{{ pilar.label }}</span>
                    </button>
                  }
                </div>
              </div>

              @if (activePilar(); as pilar) {
                <div class="mt-7 border-t border-border-subtle pt-6">
                  @if (pilar.subgrupos?.length) {
                    <div class="grid gap-8 md:grid-cols-2">
                      @for (sub of pilar.subgrupos ?? []; track sub.titulo) {
                        <div class="space-y-3">
                          <h3
                            class="font-display text-[1.125rem] font-medium not-italic leading-[1.25] tracking-[-0.015em] text-ink"
                          >
                            {{ sub.titulo }}
                          </h3>
                          <ul class="space-y-2.5">
                            @for (entry of sub.itens; track entry) {
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
                                  class="mt-1 h-4 w-4 shrink-0 text-brand"
                                >
                                  <path d="M4.5 10.5 8 14l7.5-8" />
                                </svg>
                                <span>{{ entry }}</span>
                              </li>
                            }
                          </ul>
                        </div>
                      }
                    </div>
                  } @else {
                    <ul
                      class="grid grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2 lg:grid-cols-3"
                    >
                      @for (entry of pilar.itens; track entry) {
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
                            class="mt-1 h-4 w-4 shrink-0 text-brand"
                          >
                            <path d="M4.5 10.5 8 14l7.5-8" />
                          </svg>
                          <span>{{ entry }}</span>
                        </li>
                      }
                    </ul>
                  }
                </div>
              }
            </section>
          }

          <!-- Entorno & Deslocamentos (sem iframe) -->
          @if (entornoItems().length > 0) {
            <section
              id="entorno"
              aria-labelledby="entorno-heading"
              class="border-t border-border-subtle pt-12 scroll-mt-28"
            >
              <div
                class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
              >
                <div class="space-y-2">
                  <h2
                    id="entorno-heading"
                    class="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-medium not-italic leading-[1.15] tracking-[-0.02em] text-ink text-balance"
                  >
                    Entorno &amp; Deslocamentos
                  </h2>
                  <p class="text-[14px] font-normal text-ink-muted sm:text-[15px]">
                    {{ item().endereco }} · {{ item().bairro }},
                    {{ item().cidade }} - {{ item().uf }}
                  </p>
                </div>

                <div class="flex flex-wrap items-center gap-3">
                  @if (hasEntornoModes()) {
                    <div
                      role="group"
                      aria-label="Modo de deslocamento"
                      class="flex items-center gap-2"
                    >
                      <button
                        type="button"
                        (click)="setEntornoMode('a-pe')"
                        [attr.aria-pressed]="entornoMode() === 'a-pe'"
                        [class]="
                          entornoMode() === 'a-pe'
                            ? 'm3e-tab-chip inline-flex min-h-[38px] cursor-pointer items-center border border-transparent bg-[#1C1B19] px-4 py-1.5 text-[13px] font-medium text-[#FAF8F4] shadow-chip'
                            : 'm3e-tab-chip inline-flex min-h-[38px] cursor-pointer items-center border border-transparent bg-[#F3EFE6] px-4 py-1.5 text-[13px] font-normal text-[#1C1B19] hover:bg-[#EAE3D5]'
                        "
                      >
                        A pé
                      </button>
                      <button
                        type="button"
                        (click)="setEntornoMode('carro')"
                        [attr.aria-pressed]="entornoMode() === 'carro'"
                        [class]="
                          entornoMode() === 'carro'
                            ? 'm3e-tab-chip inline-flex min-h-[38px] cursor-pointer items-center border border-transparent bg-[#1C1B19] px-4 py-1.5 text-[13px] font-medium text-[#FAF8F4] shadow-chip'
                            : 'm3e-tab-chip inline-flex min-h-[38px] cursor-pointer items-center border border-transparent bg-[#F3EFE6] px-4 py-1.5 text-[13px] font-normal text-[#1C1B19] hover:bg-[#EAE3D5]'
                        "
                      >
                        De carro
                      </button>
                    </div>
                  }

                  <a
                    [href]="googleMapsHref()"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="terraco-link-underline inline-flex min-h-[38px] items-center gap-1 text-[14px] font-medium text-brand hover:text-brand-hover"
                  >
                    <span>Abrir rotas no Google Maps</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>

              <ul
                class="mt-6 grid grid-cols-1 gap-x-10 divide-y divide-border-subtle border-y border-border-subtle sm:grid-cols-2 lg:grid-cols-3"
              >
                @for (place of visibleEntornoItems(); track place.local + place.tempo) {
                  <li
                    class="flex items-baseline justify-between gap-4 py-3.5 text-[14px] sm:text-[15px]"
                  >
                    <span class="font-normal text-ink">{{ place.local }}</span>
                    <span
                      class="shrink-0 font-medium text-[#1F6F50] tabular-nums"
                    >
                      {{ place.tempo }}
                    </span>
                  </li>
                }
              </ul>
            </section>
          }
        </div>
      </section>

      <!-- Faixa tonal Areia Clara (#F3EFE6): Plantas e Condições / Simulador -->
      <section
        aria-label="Plantas e simulação financeira"
        class="border-y border-border-subtle bg-surface py-12 sm:py-16 lg:py-20"
      >
        <div
          class="mx-auto w-full max-w-7xl space-y-12 px-4 sm:px-6 sm:space-y-16 lg:px-8"
        >
          <app-launch-floor-plans
            [item]="item()"
            (activePlanChange)="onActiveFloorPlanChange($event)"
          />

          @if (hasPrice()) {
            <div
              id="condicoes"
              class="space-y-10 border-t border-border-subtle pt-12 scroll-mt-28"
            >
              @if (item().condicoesEspeciais?.length) {
                <section aria-labelledby="special-conditions-heading">
                  <div
                    class="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12"
                  >
                    <div class="space-y-2 lg:col-span-4">
                      <h2
                        id="special-conditions-heading"
                        class="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-medium not-italic leading-[1.15] tracking-[-0.02em] text-ink text-balance"
                      >
                        Condições de pagamento
                      </h2>
                      <p
                        class="text-[14px] font-normal leading-[1.55] text-ink-muted sm:text-[15px]"
                      >
                        Referência de valores e fluxo durante a obra. Consulte a
                        disponibilidade da unidade.
                      </p>
                    </div>

                    <div class="space-y-5 lg:col-span-8">
                      <ul
                        class="divide-y divide-border-subtle border-y border-border-subtle"
                      >
                        @for (
                          condicao of item().condicoesEspeciais ?? [];
                          track condicao
                        ) {
                          <li
                            class="flex items-start gap-3 py-4 text-[15px] font-normal leading-[1.55] text-ink"
                          >
                            <svg
                              aria-hidden="true"
                              viewBox="0 0 20 20"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              class="mt-1 h-4 w-4 shrink-0 text-brand"
                            >
                              <path d="M4.5 10.5 8 14l7.5-8" />
                            </svg>
                            <span>{{ condicao }}</span>
                          </li>
                        }
                      </ul>
                    </div>
                  </div>
                </section>
              }

              <app-launch-simulator
                [item]="item()"
                (simulationChange)="onSimulationChange($event)"
              />
            </div>
          } @else {
            <section
              id="condicoes"
              aria-labelledby="table-invite-heading"
              class="border-t border-border-subtle pt-12 scroll-mt-28"
            >
              <div class="max-w-2xl space-y-2">
                <h2
                  id="table-invite-heading"
                  class="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-medium not-italic leading-[1.15] tracking-[-0.02em] text-ink text-balance"
                >
                  Tabela atualizada e condições sob consulta
                </h2>
                <p
                  class="max-w-[58ch] text-[15px] font-normal leading-[1.55] text-ink-muted sm:text-base"
                >
                  Os valores do {{ item().nome }} variam conforme tipologia,
                  andar e posição. Use o botão de WhatsApp para receber a tabela
                  vigente, sem cadastro nem compromisso.
                </p>
              </div>
            </section>
          }
        </div>
      </section>

      <!-- Galeria Curada e Comparação sobre #FAF8F4 -->
      @if (hasGallery() || otherLaunches().length > 0) {
        <section
          aria-label="Galeria e outros lançamentos"
          class="bg-canvas py-12 sm:py-16 lg:py-20"
        >
          <div
            class="mx-auto w-full max-w-7xl space-y-14 px-4 sm:px-6 lg:space-y-16 lg:px-8"
          >
            @if (hasGallery()) {
              <section
                id="galeria"
                aria-labelledby="gallery-heading"
                class="scroll-mt-28"
              >
                <div
                  class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
                >
                  <div class="space-y-1">
                    <h2
                      id="gallery-heading"
                      class="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-medium not-italic leading-[1.15] tracking-[-0.02em] text-ink text-balance"
                    >
                      Galeria do empreendimento
                    </h2>
                    <p class="text-[14px] font-normal text-ink-muted">
                      Destaques das áreas comuns, apartamentos e implantação.
                    </p>
                  </div>

                  <button
                    type="button"
                    (click)="openLightbox(0)"
                    class="terraco-btn inline-flex min-h-[40px] w-fit shrink-0 cursor-pointer items-center gap-2 rounded-pill border border-border-strong/70 bg-surface/80 px-4 py-1.5 text-[13px] font-medium text-ink hover:bg-surface tabular-nums"
                  >
                    Ver todas as {{ galleryImages().length }} fotos
                  </button>
                </div>

                <!-- Carrossel horizontal fluido no mobile; grade curada de 6 fotos no desktop -->
                <div
                  class="terraco-no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory scroll-px-4 gap-3.5 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 sm:scroll-px-6 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 md:pb-0"
                >
                  @for (
                    media of featuredGalleryImages();
                    track media.url;
                    let i = $index
                  ) {
                    <button
                      type="button"
                      (click)="openLightbox(i)"
                      [attr.aria-label]="
                        'Ampliar imagem ' + (i + 1) + ': ' + media.alt
                      "
                      class="group relative aspect-[4/3] w-[82vw] max-w-[320px] shrink-0 snap-start overflow-hidden rounded-[20px] bg-surface text-left cursor-pointer md:w-auto md:max-w-none"
                    >
                      <img
                        [src]="media.url"
                        [alt]="media.alt"
                        [attr.width]="media.width ?? null"
                        [attr.height]="media.height ?? null"
                        loading="lazy"
                        decoding="async"
                        class="h-full w-full rounded-[20px] object-cover object-center transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:scale-[1.02] motion-reduce:group-hover:scale-100"
                      />
                    </button>
                  }
                </div>
              </section>
            }

            @if (otherLaunches().length > 0) {
              <section
                id="outros-lancamentos"
                aria-labelledby="other-launches-heading"
                [class]="
                  hasGallery()
                    ? 'border-t border-border-subtle pt-12 scroll-mt-28'
                    : 'scroll-mt-28'
                "
              >
                <div
                  class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
                >
                  <div class="space-y-1">
                    <h2
                      id="other-launches-heading"
                      class="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-medium not-italic leading-[1.15] tracking-[-0.02em] text-ink text-balance"
                    >
                      Outros lançamentos em BH para comparar
                    </h2>
                    <p class="text-[14px] font-normal text-ink-muted">
                      Compare plantas, bairros e condições antes de decidir.
                    </p>
                  </div>

                  <a
                    routerLink="/lancamentos"
                    class="terraco-link-underline inline-flex min-h-[40px] w-fit items-center text-[14px] font-medium text-brand transition-colors duration-150 motion-reduce:transition-none hover:text-brand-hover"
                  >
                    Ver catálogo completo
                  </a>
                </div>

                <div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
                  @for (other of otherLaunches(); track other.slug) {
                    <app-launch-card [launch]="other" headingLevel="h3" />
                  }
                </div>
              </section>
            }
          </div>
        </section>
      }

      <!-- Faixa de contraste Grafite Quente (#1C1B19) com chips em 1 toque -->
      <section
        #launchWhatsappBand
        aria-labelledby="launch-whatsapp-band-heading"
        class="bg-ink py-12 text-ink-inverse sm:py-16 lg:py-20"
      >
        <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            class="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12 xl:gap-16"
          >
            <div class="space-y-3 lg:col-span-5">
              <h2
                id="launch-whatsapp-band-heading"
                class="max-w-md font-display text-[clamp(1.625rem,3vw,2.25rem)] font-medium not-italic leading-[1.1] tracking-[-0.025em] text-ink-inverse text-balance"
              >
                Converse direto sobre o {{ item().nome }}
              </h2>
              <p
                class="max-w-[46ch] text-[15px] font-normal leading-[1.55] text-ink-inverse/80 sm:text-base"
              >
                Escolha o assunto em 1 toque para abrir o WhatsApp com a
                mensagem pronta, sem formulário nem ligações.
              </p>
            </div>

            <div
              class="border-t border-ink-inverse/15 pt-7 lg:col-span-7 lg:border-t-0 lg:border-l lg:border-ink-inverse/15 lg:pt-0 lg:pl-12 xl:pl-16"
            >
              <div
                role="group"
                aria-label="Assunto para conversa no WhatsApp"
                class="flex flex-wrap gap-2.5"
              >
                @for (option of intentOptions; track option.key) {
                  @let active = selectedIntent() === option.key;
                  <button
                    type="button"
                    (click)="selectIntent(option.key)"
                    [attr.aria-pressed]="active"
                    [class]="
                      active
                        ? 'terraco-m3-chip inline-flex min-h-[42px] w-auto cursor-pointer items-center gap-2 border border-ink-inverse/75 bg-ink-inverse/16 px-4 py-2 text-left text-[13px] font-medium leading-[1.3] text-ink-inverse shadow-chip sm:text-[14px]'
                        : 'terraco-m3-chip inline-flex min-h-[42px] w-auto cursor-pointer items-center gap-2 border border-ink-inverse/20 bg-transparent px-4 py-2 text-left text-[13px] font-normal leading-[1.3] text-ink-inverse/90 hover:border-ink-inverse/45 hover:bg-ink-inverse/10 hover:text-ink-inverse sm:text-[14px]'
                    "
                  >
                    @if (active) {
                      <span
                        aria-hidden="true"
                        class="h-2 w-2 shrink-0 rounded-full bg-accent"
                      ></span>
                    }
                    <span>{{ option.label }}</span>
                  </button>
                }
              </div>

              <div
                class="mt-6 border-t border-ink-inverse/15 pt-5 sm:mt-7 sm:pt-6"
              >
                <p
                  data-testid="launch-whatsapp-preview"
                  class="max-w-[54ch] border-l-2 border-accent pl-4 text-[15px] font-normal leading-[1.55] text-ink-inverse/90"
                >
                  “{{ selectedIntentMessage() }}”
                </p>

                <a
                  [href]="whatsappHref()"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="terraco-btn mt-5 inline-flex min-h-[46px] w-fit items-center justify-center rounded-pill bg-action px-6 py-2.5 text-[14px] font-medium leading-[1.35] text-white hover:bg-action-hover"
                >
                  Abrir WhatsApp com esta mensagem
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <app-next-journey
        heading="Continue sua pesquisa"
        subtitle="Explore o guia do bairro, compare outros empreendimentos ou filtre pelo seu momento."
        variant="editorial"
        [destinations]="nextDestinations()"
      />

      @defer (when lightboxOpen()) {
        <app-image-lightbox
          [images]="galleryImages()"
          [initialIndex]="lightboxIndex()"
          [isOpen]="lightboxOpen()"
          (closed)="closeLightbox()"
        />
      }
    </div>
  `,
})
export class PrimeViewLandingComponent {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly leadsService = inject(LeadsService);
  private readonly lancamentosService = inject(LancamentosService);

  readonly item = input.required<Lancamento>();
  private readonly itemSlug = computed(() => this.item().slug);

  readonly activeSection = linkedSignal<string, string>({
    source: this.itemSlug,
    computation: () => 'sobre',
  });

  readonly isPastFold = linkedSignal<string, boolean>({
    source: this.itemSlug,
    computation: () => false,
  });

  readonly closingBandVisible = linkedSignal<string, boolean>({
    source: this.itemSlug,
    computation: () => false,
  });

  readonly activeFloorPlan = linkedSignal<string, LaunchFloorPlan | null>({
    source: this.itemSlug,
    computation: () => null,
  });

  readonly simulationSummary = linkedSignal<
    string,
    LaunchSimulationSummary | null
  >({
    source: this.itemSlug,
    computation: () => null,
  });

  readonly selectedPilarId = linkedSignal<string, string>({
    source: this.itemSlug,
    computation: () => 'lazer',
  });

  readonly entornoMode = linkedSignal<string, 'a-pe' | 'carro'>({
    source: this.itemSlug,
    computation: () => 'a-pe',
  });

  readonly otherLaunches = computed<readonly Lancamento[]>(() =>
    this.lancamentosService
      .lancamentos()
      .filter((launch) => launch.slug !== this.item().slug)
  );

  readonly hasPrice = computed(() => {
    const price = this.item().precoAPartirDe;
    return typeof price === 'number' && price > 0;
  });

  readonly formattedPrice = computed<string | null>(() => {
    const price = this.item().precoAPartirDe;
    return typeof price === 'number' && price > 0
      ? formatCurrencyBRL(price)
      : null;
  });

  readonly heroMetrics = computed<readonly HeroMetricItem[]>(() => {
    const current = this.item();
    const metrics: HeroMetricItem[] = [];

    if (current.quartos.trim()) {
      metrics.push({ label: 'Dormitórios', value: current.quartos });
    }
    if (current.metragem.trim()) {
      metrics.push({
        label: 'Metragem',
        value: current.metragem,
        tabular: true,
      });
    }
    const price = this.formattedPrice();
    if (price) {
      metrics.push({
        label: 'A partir de',
        value: price,
        highlight: true,
        tabular: true,
      });
    }
    if (typeof current.entradaMinima === 'number' && current.entradaMinima > 0) {
      metrics.push({
        label: 'Entrada inicial',
        value: formatCurrencyBRL(current.entradaMinima),
        tabular: true,
      });
    }
    if (current.entrega?.trim()) {
      metrics.push({
        label: 'Entrega',
        value: current.entrega,
        tabular: true,
      });
    }
    if (current.vagas.trim()) {
      metrics.push({ label: 'Vagas', value: current.vagas, tabular: true });
    }
    if (!price && current.tipologias.trim() && metrics.length < 4) {
      metrics.push({ label: 'Tipologias', value: current.tipologias });
    }

    return metrics;
  });

  readonly pilaresList = computed<readonly LaunchPilarGroup[]>(() => {
    const current = this.item();
    if (current.pilares?.length) {
      return current.pilares;
    }
    if (current.diferenciais.length > 0) {
      return [
        {
          id: 'lazer',
          label: 'Diferenciais',
          itens: current.diferenciais,
        },
      ];
    }
    return [];
  });

  readonly activePilar = computed<LaunchPilarGroup | null>(() => {
    const list = this.pilaresList();
    if (list.length === 0) return null;
    const id = this.selectedPilarId();
    return list.find((p) => p.id === id) ?? list[0];
  });

  readonly entornoItems = computed<readonly LaunchEntornoItem[]>(
    () => this.item().entorno ?? []
  );

  readonly hasEntornoModes = computed(() =>
    this.entornoItems().some((item) => item.modo === 'a-pe') &&
    this.entornoItems().some((item) => item.modo === 'carro')
  );

  readonly visibleEntornoItems = computed<readonly LaunchEntornoItem[]>(() => {
    const items = this.entornoItems();
    if (!this.hasEntornoModes()) {
      return items;
    }
    const mode = this.entornoMode();
    return items.filter((item) => item.modo === mode);
  });

  readonly googleMapsHref = computed(() => {
    const current = this.item();
    const q = `${current.endereco}, ${current.bairro}, ${current.cidade} - ${current.uf}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  });

  readonly galleryImages = computed<readonly LaunchMediaItem[]>(
    () => this.item().galeria ?? []
  );

  readonly featuredGalleryImages = computed<readonly LaunchMediaItem[]>(() =>
    this.galleryImages().slice(0, 6)
  );

  readonly heroSecondaryImages = computed<readonly LaunchMediaItem[]>(() =>
    this.galleryImages().slice(0, 2)
  );

  readonly hasGallery = computed(() => this.galleryImages().length > 0);

  readonly nextDestinations = computed<readonly JourneyDestination[]>(() => {
    const current = this.item();
    const guideSlug = this.bairroGuideSlug();
    const list: JourneyDestination[] = [];

    if (guideSlug) {
      list.push({
        title: `Guia do bairro ${current.bairro}`,
        description: `Mobilidade, serviços e perguntas frequentes sobre morar no ${current.bairro}.`,
        actionLabel: `Conhecer ${current.bairro}`,
        route: ['/bairros', guideSlug],
      });
    }

    list.push(
      {
        title: 'Todos os lançamentos em BH',
        description:
          'Filtre por bairro, tipologia e salve seus preferidos para comparar lado a lado.',
        actionLabel: 'Abrir catálogo',
        route: '/lancamentos',
      },
      {
        title: 'Descobrir pelo seu momento',
        description:
          'Combine objetivo, tamanho e região sem cadastro para encontrar o imóvel ideal.',
        actionLabel: 'Usar descoberta guiada',
        route: '/',
        fragment: 'descoberta-guiada',
      }
    );

    return list;
  });

  readonly imageLoaded = linkedSignal({
    source: this.itemSlug,
    computation: () => {
      const el = this.heroImg()?.nativeElement;
      return Boolean(el?.complete && el.naturalWidth > 0);
    },
  });
  readonly selectedIntent = linkedSignal<string, LaunchIntentKey>({
    source: this.itemSlug,
    computation: () => 'tabela_condicoes',
  });
  readonly lightboxOpen = linkedSignal({
    source: this.itemSlug,
    computation: () => false,
  });
  readonly lightboxIndex = linkedSignal({
    source: this.itemSlug,
    computation: () => 0,
  });

  readonly callbackOpen = linkedSignal({
    source: this.itemSlug,
    computation: () => false,
  });
  readonly callbackName = linkedSignal({
    source: this.itemSlug,
    computation: () => '',
  });
  readonly callbackPhone = linkedSignal({
    source: this.itemSlug,
    computation: () => '',
  });
  readonly callbackError = linkedSignal<string, string | null>({
    source: this.itemSlug,
    computation: () => null,
  });
  readonly callbackSubmitted = linkedSignal({
    source: this.itemSlug,
    computation: () => false,
  });
  readonly callbackSubmitting = this.leadsService.submitting;

  readonly intentOptions = LAUNCH_INTENT_OPTIONS;

  private readonly heroImg = viewChild<ElementRef<HTMLImageElement>>('heroImg');
  private readonly heroCtaSlot =
    viewChild<ElementRef<HTMLElement>>('heroCtaSlot');
  private readonly ctaPillEl =
    viewChild<ElementRef<HTMLAnchorElement>>('ctaPillEl');
  private readonly launchWhatsappBand =
    viewChild<ElementRef<HTMLElement>>('launchWhatsappBand');
  private readonly sectionNav =
    viewChild<ElementRef<HTMLElement>>('sectionNav');
  private readonly sectionNavLinks =
    viewChildren<ElementRef<HTMLAnchorElement>>('sectionNavLink');

  private ignoreScrollSpyUntil = 0;
  private pendingScrollSettleTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingFlipFromRect: DOMRect | null = null;
  private activeFlipAnimation: Animation | null = null;

  readonly bairroGuideSlug = computed<string | null>(() => {
    const currentBairro = this.item().bairro;
    const match = BAIRROS_BH.find((guide) =>
      guide.matchBairros.includes(currentBairro)
    );
    return match?.slug ?? null;
  });

  readonly selectedIntentOption = computed<LaunchIntentOption>(() => {
    const currentKey = this.selectedIntent();
    return (
      LAUNCH_INTENT_OPTIONS.find((item) => item.key === currentKey) ??
      LAUNCH_INTENT_OPTIONS[0]
    );
  });

  readonly selectedIntentMessage = computed(() =>
    this.selectedIntentOption().buildMessage(this.item())
  );

  readonly ctaPillState = computed<'docked' | 'floating' | 'retracted'>(() => {
    if (!this.isPastFold()) {
      return 'docked';
    }
    return this.closingBandVisible() ? 'retracted' : 'floating';
  });

  readonly floatingPillLabel = computed<string>(() => {
    const launchName = this.item().nome;
    if (!this.isPastFold()) {
      return 'Falar no WhatsApp';
    }

    switch (this.activeSection()) {
      case 'pilares':
        return 'Dúvidas sobre o condomínio';
      case 'entorno':
        return 'Perguntar sobre o bairro';
      case 'plantas': {
        const plan = this.activeFloorPlan();
        return plan ? `Dúvida: ${plan.titulo}` : 'Dúvidas sobre as plantas';
      }
      case 'condicoes':
        return 'Receber tabela e condições';
      case 'galeria':
        return 'Agendar visita';
      default:
        return `Falar sobre o ${launchName}`;
    }
  });

  readonly contextualWhatsappMessage = computed<string>(() => {
    const currentItem = this.item();
    if (!this.isPastFold()) {
      return (
        currentItem.whatsappMensagem ||
        `Oi! Estou vendo o ${currentItem.nome} (${currentItem.bairro}) e gostaria de receber mais informações.`
      );
    }

    switch (this.activeSection()) {
      case 'pilares': {
        const pilar = this.activePilar();
        const topic = pilar ? pilar.label.toLowerCase() : 'estrutura e lazer';
        return `Oi! Estava vendo os diferenciais de ${topic} do ${currentItem.nome} (${currentItem.bairro}) e gostaria de saber mais detalhes.`;
      }
      case 'entorno':
        return `Oi! Estava vendo a localização e o entorno do ${currentItem.nome} (${currentItem.bairro}) e gostaria de tirar uma dúvida sobre a região.`;
      case 'plantas': {
        const plan = this.activeFloorPlan();
        if (plan) {
          const unitsText = plan.unidades ? `, ${plan.unidades}` : '';
          const priceText = plan.precoAPartirDe
            ? ` (a partir de ${formatCurrencyBRL(plan.precoAPartirDe)})`
            : '';
          return `Oi! Estava vendo a planta ${plan.titulo} (${plan.metragem}${unitsText}) do ${currentItem.nome} (${currentItem.bairro})${priceText} e gostaria de conferir a disponibilidade.`;
        }
        return `Oi! Estava vendo as plantas do ${currentItem.nome} (${currentItem.bairro}) e gostaria de conferir a disponibilidade.`;
      }
      case 'condicoes': {
        const sim = this.simulationSummary();
        if (this.hasPrice() && sim) {
          const entryDetails = sim.hasFgts
            ? `${sim.downPaymentFormatted} (incluindo ${sim.fgtsFormatted} de FGTS)`
            : sim.downPaymentFormatted;
          return `Oi! Estava vendo as condições do ${currentItem.nome} (${currentItem.bairro}) — simulação de imóvel em ${sim.propertyValueFormatted}, entrada de ${entryDetails} e parcela estimada de ${sim.monthlyPaymentFormatted}/mês. Gostaria de conferir a tabela atualizada.`;
        }
        return `Oi! Gostaria de receber a tabela atualizada e as condições de pagamento do ${currentItem.nome} (${currentItem.bairro}).`;
      }
      case 'galeria':
        return `Oi! Estava vendo as fotos do ${currentItem.nome} (${currentItem.bairro}) e gostaria de agendar uma visita ou saber mais.`;
      case 'outros-lancamentos':
        return `Oi! Estou comparando o ${currentItem.nome} (${currentItem.bairro}) com outros lançamentos em BH e gostaria de conversar sobre as opções.`;
      default:
        return (
          currentItem.whatsappMensagem ||
          `Oi! Estou vendo o ${currentItem.nome} (${currentItem.bairro}) e gostaria de receber mais informações.`
        );
    }
  });

  readonly contextualWhatsappHref = computed(() =>
    buildWhatsAppUrl(this.contextualWhatsappMessage())
  );

  readonly whatsappHref = computed(() =>
    buildWhatsAppUrl(this.selectedIntentMessage())
  );

  constructor() {
    afterNextRender(() => {
      const el = this.heroImg()?.nativeElement;
      if (el?.complete && el.naturalWidth > 0) {
        this.imageLoaded.set(true);
      }

      if (
        !isPlatformBrowser(this.platformId) ||
        typeof IntersectionObserver === 'undefined'
      ) {
        return;
      }

      const sectionIds = [
        'sobre',
        'pilares',
        'entorno',
        'plantas',
        'condicoes',
        'galeria',
        'outros-lancamentos',
      ];
      const targets = sectionIds
        .map((id) => this.document.getElementById(id))
        .filter((node): node is HTMLElement => Boolean(node));

      if (targets.length === 0) {
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          if (
            typeof performance !== 'undefined' &&
            performance.now() < this.ignoreScrollSpyUntil
          ) {
            return;
          }
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort(
              (a, b) =>
                a.boundingClientRect.top - b.boundingClientRect.top
            );
          if (visible[0]?.target.id) {
            this.activeSection.set(visible[0].target.id);
          }
        },
        { rootMargin: '-18% 0px -62% 0px', threshold: 0 }
      );

      for (const target of targets) {
        observer.observe(target);
      }

      const ctaSlot = this.heroCtaSlot()?.nativeElement;
      let foldObserver: IntersectionObserver | null = null;
      if (ctaSlot) {
        foldObserver = new IntersectionObserver(
          (entries) => {
            const entry = entries[0];
            if (!entry) return;
            const nextPastFold =
              !entry.isIntersecting && entry.boundingClientRect.top < 0;
            if (nextPastFold === this.isPastFold()) {
              return;
            }
            const pillEl = this.ctaPillEl()?.nativeElement;
            const reducedMotion = Boolean(
              this.document.defaultView?.matchMedia(
                '(prefers-reduced-motion: reduce)'
              ).matches
            );
            if (
              pillEl &&
              !this.closingBandVisible() &&
              !reducedMotion &&
              typeof pillEl.animate === 'function'
            ) {
              this.activeFlipAnimation?.cancel();
              this.pendingFlipFromRect = pillEl.getBoundingClientRect();
            }
            this.isPastFold.set(nextPastFold);
          },
          { threshold: 0 }
        );
        foldObserver.observe(ctaSlot);
      }

      const closingBand = this.launchWhatsappBand()?.nativeElement;
      let closingObserver: IntersectionObserver | null = null;
      if (closingBand) {
        closingObserver = new IntersectionObserver(
          (entries) => {
            const entry = entries[0];
            if (!entry) return;
            this.closingBandVisible.set(entry.isIntersecting);
          },
          { threshold: 0.1 }
        );
        closingObserver.observe(closingBand);
      }

      this.destroyRef.onDestroy(() => {
        observer.disconnect();
        foldObserver?.disconnect();
        closingObserver?.disconnect();
        this.activeFlipAnimation?.cancel();
        if (this.pendingScrollSettleTimer !== null) {
          clearTimeout(this.pendingScrollSettleTimer);
          this.pendingScrollSettleTimer = null;
        }
      });
    });

    afterRenderEffect(() => {
      const pastFold = this.isPastFold();
      if (!isPlatformBrowser(this.platformId) || !this.pendingFlipFromRect) {
        return;
      }

      const first = this.pendingFlipFromRect;
      this.pendingFlipFromRect = null;

      const pillEl = this.ctaPillEl()?.nativeElement;
      if (!pillEl || typeof pillEl.animate !== 'function') {
        return;
      }

      const last = pillEl.getBoundingClientRect();
      if (
        first.width <= 0 ||
        first.height <= 0 ||
        last.width <= 0 ||
        last.height <= 0
      ) {
        return;
      }

      const dx = first.left - last.left;
      const dy = first.top - last.top;
      const sx = first.width / last.width;
      const sy = first.height / last.height;

      if (
        Math.abs(dx) < 1 &&
        Math.abs(dy) < 1 &&
        Math.abs(sx - 1) < 0.01 &&
        Math.abs(sy - 1) < 0.01
      ) {
        return;
      }

      pillEl.style.transformOrigin = 'top left';
      this.activeFlipAnimation = pillEl.animate(
        [
          {
            transform: `translate3d(${dx}px, ${dy}px, 0) scale(${sx}, ${sy})`,
            borderRadius: pastFold ? '16px' : '9999px',
          },
          {
            transform: 'translate3d(0, 0, 0) scale(1, 1)',
            borderRadius: pastFold ? '9999px' : '16px',
          },
        ],
        {
          duration: 480,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          fill: 'none',
        }
      );
      this.activeFlipAnimation.onfinish = () => {
        pillEl.style.transformOrigin = '';
        this.activeFlipAnimation = null;
      };
      this.activeFlipAnimation.oncancel = () => {
        pillEl.style.transformOrigin = '';
        this.activeFlipAnimation = null;
      };
    });

    effect(() => {
      const currentSection = this.activeSection();
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      const navEl = this.sectionNav()?.nativeElement;
      const activeEl = this.sectionNavLinks().find(
        (ref) => ref.nativeElement.dataset['sectionId'] === currentSection
      )?.nativeElement;
      if (navEl && activeEl) {
        const reducedMotion = window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        ).matches;
        const targetLeft =
          activeEl.offsetLeft -
          navEl.clientWidth / 2 +
          activeEl.offsetWidth / 2;
        navEl.scrollTo({
          left: Math.max(0, targetLeft),
          behavior: reducedMotion ? 'auto' : 'smooth',
        });
      }
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

  selectPilar(id: string): void {
    this.selectedPilarId.set(id);
  }

  setEntornoMode(mode: 'a-pe' | 'carro'): void {
    this.entornoMode.set(mode);
  }

  selectIntent(intent: LaunchIntentKey): void {
    this.selectedIntent.set(intent);
  }

  onActiveFloorPlanChange(plan: LaunchFloorPlan | null): void {
    this.activeFloorPlan.set(plan);
  }

  onSimulationChange(summary: LaunchSimulationSummary): void {
    this.simulationSummary.set(summary);
  }

  openLightbox(index: number): void {
    if (!this.hasGallery()) return;
    this.lightboxIndex.set(index);
    this.lightboxOpen.set(true);
  }

  closeLightbox(): void {
    this.lightboxOpen.set(false);
  }

  toggleCallbackForm(): void {
    this.callbackOpen.update((open) => !open);
    this.callbackError.set(null);
  }

  onCallbackNameInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement | null;
    this.callbackName.set(inputEl?.value ?? '');
  }

  sectionNavPillClass(sectionId: string): string {
    const base =
      'terraco-m3-chip inline-flex min-h-[36px] shrink-0 items-center px-3.5 py-1 text-[13px] whitespace-nowrap';
    if (this.activeSection() === sectionId) {
      return `${base} terraco-m3-chip--active bg-surface font-medium text-ink shadow-chip`;
    }
    return `${base} bg-transparent font-normal text-ink-muted hover:bg-surface/60 hover:text-ink`;
  }

  scrollToSection(event: MouseEvent, sectionId: string): void {
    event.preventDefault();
    this.activeSection.set(sectionId);
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const target = this.document.getElementById(sectionId);
    if (!target) {
      return;
    }

    if (typeof performance !== 'undefined') {
      this.ignoreScrollSpyUntil = performance.now() + 900;
    }

    const win = this.document.defaultView;
    const reducedMotion = Boolean(
      win?.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
    const navHeight =
      this.sectionNav()?.nativeElement.getBoundingClientRect().height ?? 50;
    const stickyOffset = navHeight + 92;

    const scrollToTarget = (smooth: boolean) => {
      const freshTarget = this.document.getElementById(sectionId);
      if (!freshTarget || !win) return;
      const top =
        freshTarget.getBoundingClientRect().top + win.scrollY - stickyOffset;
      win.scrollTo({
        top: Math.max(0, top),
        behavior: smooth && !reducedMotion ? 'smooth' : 'auto',
      });
    };

    scrollToTarget(true);

    if (this.pendingScrollSettleTimer !== null) {
      clearTimeout(this.pendingScrollSettleTimer);
    }
    this.pendingScrollSettleTimer = setTimeout(() => {
      this.pendingScrollSettleTimer = null;
      const freshTarget = this.document.getElementById(sectionId);
      if (!freshTarget) return;
      const currentTop = freshTarget.getBoundingClientRect().top;
      if (Math.abs(currentTop - stickyOffset) > 28) {
        scrollToTarget(false);
      }
    }, 300);
  }

  onCallbackPhoneInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement | null;
    const formatted = formatBrazilianPhone(inputEl?.value ?? '');
    this.callbackPhone.set(formatted);
    if (inputEl && inputEl.value !== formatted) {
      inputEl.value = formatted;
    }
    if (this.callbackError()) {
      this.callbackError.set(null);
    }
  }

  async submitCallbackLead(event: Event): Promise<void> {
    event.preventDefault();
    if (this.callbackSubmitting()) return;

    const rawPhone = this.callbackPhone().trim();
    const digits = rawPhone.replace(/\D/g, '');
    if (digits.length < 10) {
      this.callbackError.set(
        'Informe um WhatsApp válido com DDD (ex.: (31) 99999-9999).'
      );
      return;
    }

    this.callbackError.set(null);
    const currentItem = this.item();
    const option = this.selectedIntentOption();
    const trimmedName = this.callbackName().trim();

    try {
      await this.leadsService.createLead({
        ...(trimmedName ? { name: trimmedName } : {}),
        phone: rawPhone,
        launchSlug: currentItem.slug,
        source: 'launch-detail',
        intent: option.leadIntent,
        message: option.buildMessage(currentItem),
      });
      this.callbackSubmitted.set(true);
      this.callbackOpen.set(false);
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : '';
      const isRawSystemError =
        !rawMessage ||
        /permission|insufficient|firebase|firestore|network/i.test(rawMessage);
      this.callbackError.set(
        isRawSystemError
          ? 'Não foi possível enviar seu contato agora. Tente novamente em instantes.'
          : rawMessage
      );
    }
  }
}
