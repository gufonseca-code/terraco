import { DOCUMENT, NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  BAIRROS_BH,
  FavoritesService,
  LeadsService,
  SITE_NAME,
  SITE_URL,
  buildWhatsAppUrl,
  formatCurrencyBRL,
  type Lancamento,
  type LaunchMediaItem,
} from '../../core';
import { FavoriteButtonComponent } from './favorite-button.component';
import { ImageLightboxComponent } from './image-lightbox.component';
import { LaunchFloorPlansComponent } from './launch-floor-plans.component';
import { LaunchSimulatorComponent } from './launch-simulator.component';
import { formatBrazilianPhone } from './whatsapp-alert-form.component';

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

const INITIAL_GALLERY_COUNT = 6;

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
        name: `${item.nome}, ${item.bairro}, ${item.cidade}`,
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
    LaunchFloorPlansComponent,
    LaunchSimulatorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      aria-labelledby="launch-heading"
      class="flex flex-1 flex-col justify-start bg-canvas pb-20 md:pb-16"
    >
      <!-- Faixa superior tonal Areia Suave preparada para tráfego de anúncios mobile-first -->
      <div class="border-b border-border-subtle bg-surface/60 pt-1.5 pb-5 sm:pt-6 sm:pb-10 lg:pt-7 lg:pb-12">
        <div class="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div class="terraco-reveal mb-2 flex items-center justify-between gap-3 sm:mb-4">
            <a
              routerLink="/lancamentos"
              class="terraco-link-underline inline-flex min-h-[32px] items-center gap-1.5 text-[14px] font-normal text-ink-muted transition-colors duration-150 hover:text-ink sm:min-h-[42px]"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4 shrink-0"
              >
                <path d="M12.5 5 7.5 10l5 5" />
              </svg>
              <span>Voltar para lançamentos</span>
            </a>

            @if (item().construtora) {
              <p class="hidden text-[13px] font-normal text-ink-muted sm:block">
                {{ item().construtora }}
              </p>
            }
          </div>

          <article
            class="terraco-reveal-delay terraco-floating-card overflow-hidden rounded-xl bg-elevated"
          >
            <div class="grid lg:grid-cols-12">
              <!-- Mídia principal (foto arquitetônica real, altura contida no desktop mesmo para fotos verticais) -->
              <div
                [class.terraco-skeleton]="!imageLoaded()"
                class="group relative aspect-[2/1] w-full overflow-hidden border-b border-border-subtle bg-surface sm:aspect-[16/9] lg:col-span-7 lg:aspect-auto lg:h-[520px] lg:border-r lg:border-b-0"
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
                  class="relative z-[1] h-full w-full object-cover object-center lg:absolute lg:inset-0"
                />

                @if (hasGallery()) {
                  <button
                    type="button"
                    (click)="openLightbox(0)"
                    [attr.aria-label]="'Abrir galeria de imagens de ' + item().nome"
                    class="absolute inset-0 z-[2] cursor-zoom-in focus-visible:outline-offset-[-2px]"
                  ></button>

                  <button
                    type="button"
                    (click)="openLightbox(0)"
                    class="terraco-btn absolute right-3 bottom-3 z-10 inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-pill border border-border-subtle bg-elevated/95 px-3.5 py-1.5 text-[13px] font-medium text-ink shadow-chip backdrop-blur-xs hover:border-brand/40 sm:min-h-[38px]"
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
                    <span class="tabular-nums">Ver {{ galleryImages().length }} fotos</span>
                  </button>
                }
              </div>

              <!-- Painel de decisão e conversão imediata -->
              <div
                class="flex flex-col justify-between gap-3 p-3.5 sm:gap-5 sm:p-6 lg:col-span-5 lg:p-7"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0 space-y-0.5 sm:space-y-1">
                    <p class="text-[13px] font-normal leading-[1.35] text-ink-muted">
                      @if (bairroGuideSlug(); as guideSlug) {
                        <a
                          [routerLink]="['/bairros', guideSlug]"
                          class="terraco-link-underline text-ink transition-colors duration-150 hover:text-brand"
                        >{{ item().bairro }}</a>
                      } @else {
                        <span>{{ item().bairro }}</span>
                      }<span>, {{ item().cidade }}, {{ item().uf }}</span>
                    </p>

                    <h1
                      id="launch-heading"
                      [style.view-transition-name]="'launch-title-' + item().slug"
                      class="font-display text-[clamp(1.625rem,3vw,2.375rem)] font-medium not-italic leading-[1.08] tracking-[-0.025em] text-ink text-balance"
                    >
                      {{ item().nome }}
                    </h1>

                    @if (item().tagline) {
                      <p class="hidden text-[14px] font-normal leading-[1.45] text-ink-muted sm:block">
                        {{ item().tagline }}
                      </p>
                    }
                  </div>

                  <app-favorite-button
                    [slug]="item().slug"
                    [nome]="item().nome"
                  />
                </div>

                <!-- Ficha técnica direta (transparência imediata) -->
                <dl
                  class="grid grid-cols-2 gap-x-3.5 gap-y-2 rounded-[18px] bg-surface/75 px-3.5 py-2.5 sm:gap-x-4 sm:gap-y-3 sm:px-4 sm:py-3.5"
                >
                  <div class="space-y-0.5">
                    <dt class="text-[12px] font-normal text-ink-muted sm:text-[13px]">
                      Dormitórios
                    </dt>
                    <dd
                      class="text-[13px] font-medium leading-[1.3] text-ink tabular-nums sm:text-[14px]"
                    >
                      {{ item().quartos }}
                    </dd>
                  </div>

                  <div class="space-y-0.5">
                    <dt class="text-[12px] font-normal text-ink-muted sm:text-[13px]">
                      Metragem
                    </dt>
                    <dd
                      class="text-[13px] font-medium leading-[1.3] text-ink tabular-nums sm:text-[14px]"
                    >
                      {{ item().metragem }}
                    </dd>
                  </div>

                  @if (formattedPrice(); as price) {
                    <div class="space-y-0.5 border-t border-border-subtle/80 pt-1.5 sm:pt-2">
                      <dt class="text-[12px] font-normal text-ink-muted sm:text-[13px]">
                        A partir de
                      </dt>
                      <dd
                        class="text-[13px] font-medium leading-[1.3] text-brand tabular-nums sm:text-[14px]"
                      >
                        {{ price }}
                      </dd>
                    </div>
                  } @else if (item().vagas) {
                    <div class="space-y-0.5 border-t border-border-subtle/80 pt-1.5 sm:pt-2">
                      <dt class="text-[12px] font-normal text-ink-muted sm:text-[13px]">
                        Vagas
                      </dt>
                      <dd
                        class="text-[13px] font-normal leading-[1.3] text-ink tabular-nums sm:text-[14px]"
                      >
                        {{ item().vagas }}
                      </dd>
                    </div>
                  }

                  @if (item().entrega) {
                    <div class="space-y-0.5 border-t border-border-subtle/80 pt-1.5 sm:pt-2">
                      <dt class="text-[12px] font-normal text-ink-muted sm:text-[13px]">
                        Entrega
                      </dt>
                      <dd
                        class="text-[13px] font-normal leading-[1.3] text-ink tabular-nums sm:text-[14px]"
                      >
                        {{ item().entrega }}
                      </dd>
                    </div>
                  } @else {
                    <div class="space-y-0.5 border-t border-border-subtle/80 pt-1.5 sm:pt-2">
                      <dt class="text-[12px] font-normal text-ink-muted sm:text-[13px]">
                        Tipologias
                      </dt>
                      <dd class="line-clamp-1 text-[13px] font-normal leading-[1.3] text-ink sm:line-clamp-none sm:text-[14px]">
                        {{ item().tipologias }}
                      </dd>
                    </div>
                  }
                </dl>

                <!-- Escada de conversão em 1 toque -->
                <div class="space-y-2.5 sm:space-y-3">
                  <div
                    role="group"
                    aria-label="Assunto para conversa no WhatsApp"
                    class="grid grid-cols-2 gap-1.5 sm:gap-2"
                  >
                    @for (option of intentOptions; track option.key) {
                      <button
                        type="button"
                        (click)="selectIntent(option.key)"
                        [attr.aria-pressed]="selectedIntent() === option.key"
                        [class]="
                          selectedIntent() === option.key
                            ? 'terraco-m3-chip flex min-h-[38px] cursor-pointer items-center justify-center border border-ink bg-ink px-2.5 py-1 text-center text-[13px] font-medium leading-[1.25] text-ink-inverse shadow-chip sm:min-h-[42px]'
                            : 'terraco-m3-chip flex min-h-[38px] cursor-pointer items-center justify-center border border-border-subtle bg-canvas px-2.5 py-1 text-center text-[13px] font-normal leading-[1.25] text-ink hover:border-border-strong hover:bg-surface sm:min-h-[42px]'
                        "
                      >
                        {{ option.label }}
                      </button>
                    }
                  </div>

                  <a
                    #heroWhatsappCta
                    [href]="whatsappHref()"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="terraco-btn terraco-btn-moss flex min-h-[46px] w-full items-center justify-center gap-2 rounded-pill bg-brand px-6 py-2.5 text-[14px] font-medium leading-[1.35] text-ink-inverse hover:bg-brand-hover sm:min-h-[50px]"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.85"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="h-4 w-4 shrink-0"
                    >
                      <path
                        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
                      />
                    </svg>
                    <span>Falar no WhatsApp</span>
                  </a>

                  <div class="pt-0.5">
                    @if (callbackSubmitted()) {
                      <p
                        role="status"
                        data-testid="launch-callback-success"
                        class="rounded-[14px] border border-brand/25 bg-brand-container/60 px-3.5 py-2.5 text-[13px] font-normal leading-[1.45] text-ink"
                      >
                        Recebemos seu contato. Um especialista retorna em instantes sobre {{ selectedIntentLabel() }}.
                      </p>
                    } @else if (callbackOpen()) {
                      <form
                        (submit)="submitCallbackLead($event)"
                        animate.enter="terraco-chip-enter"
                        class="space-y-2.5 rounded-[18px] border border-border-subtle bg-surface/65 p-3.5"
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
                          class="min-h-[42px] w-full rounded-[14px] border border-border-subtle bg-elevated px-3.5 py-1.5 text-[14px] text-ink placeholder:text-ink-muted/70 focus:border-brand focus:outline-none"
                        />

                        <div class="flex flex-col gap-2 sm:flex-row">
                          <input
                            type="tel"
                            [value]="callbackPhone()"
                            (input)="onCallbackPhoneInput($event)"
                            placeholder="(31) 99999-9999"
                            aria-label="Seu WhatsApp com DDD"
                            autocomplete="tel"
                            inputmode="tel"
                            required
                            class="min-h-[42px] flex-1 rounded-[14px] border border-border-subtle bg-elevated px-3.5 py-1.5 text-[14px] text-ink placeholder:text-ink-muted/70 focus:border-brand focus:outline-none tabular-nums"
                          />
                          <button
                            type="submit"
                            [disabled]="callbackSubmitting()"
                            class="terraco-btn inline-flex min-h-[42px] shrink-0 cursor-pointer items-center justify-center rounded-pill bg-brand px-5 py-1.5 text-[13px] font-medium text-ink-inverse hover:bg-brand-hover disabled:opacity-60"
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
                        class="terraco-link-underline w-full cursor-pointer py-1 text-center text-[13px] font-normal text-ink-muted transition-colors duration-150 hover:text-ink"
                      >
                        Prefere que um especialista te chame?
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>

      <!-- Barra de navegação rápida M3 Expressive (sticky abaixo do header) -->
      <div class="sticky top-[58px] z-20 border-b border-border-subtle bg-canvas/94 backdrop-blur-md sm:top-[68px]">
        <nav
          aria-label="Seções do empreendimento"
          class="terraco-no-scrollbar mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-4 py-2.5 sm:px-6 lg:px-8"
        >
          @if (item().condicoesEspeciais?.length) {
            <a
              href="#condicoes"
              (click)="scrollToSection($event, 'condicoes')"
              class="terraco-m3-chip inline-flex min-h-[38px] shrink-0 items-center border border-border-subtle bg-elevated px-4 py-1 text-[13px] font-normal text-ink hover:border-brand/40 hover:text-brand"
            >
              Condições
            </a>
          }
          @if (item().plantas?.length) {
            <a
              href="#plantas"
              (click)="scrollToSection($event, 'plantas')"
              class="terraco-m3-chip inline-flex min-h-[38px] shrink-0 items-center border border-brand/30 bg-brand-container px-4 py-1 text-[13px] font-medium text-brand hover:border-brand"
            >
              Plantas
            </a>
          }
          <a
            href="#simulador"
            (click)="scrollToSection($event, 'simulador')"
            class="terraco-m3-chip inline-flex min-h-[38px] shrink-0 items-center border border-border-subtle bg-elevated px-4 py-1 text-[13px] font-medium text-ink hover:border-brand/40 hover:text-brand"
          >
            Simular entrada
          </a>
          @if (hasGallery()) {
            <a
              href="#galeria"
              (click)="scrollToSection($event, 'galeria')"
              class="terraco-m3-chip inline-flex min-h-[38px] shrink-0 items-center border border-border-subtle bg-elevated px-4 py-1 text-[13px] font-normal text-ink hover:border-brand/40 hover:text-brand"
            >
              Galeria
            </a>
          }
          <a
            href="#sobre"
            (click)="scrollToSection($event, 'sobre')"
            class="terraco-m3-chip inline-flex min-h-[38px] shrink-0 items-center border border-border-subtle bg-elevated px-4 py-1 text-[13px] font-normal text-ink hover:border-brand/40 hover:text-brand"
          >
            Sobre
          </a>
          @if (item().diferenciais.length > 0) {
            <a
              href="#diferenciais"
              (click)="scrollToSection($event, 'diferenciais')"
              class="terraco-m3-chip inline-flex min-h-[38px] shrink-0 items-center border border-border-subtle bg-elevated px-4 py-1 text-[13px] font-normal text-ink hover:border-brand/40 hover:text-brand"
            >
              Diferenciais
            </a>
          }
        </nav>
      </div>

      <!-- Conteúdo progressivo de transparência e valor -->
      <div class="mx-auto w-full max-w-6xl space-y-12 px-4 pt-10 sm:space-y-14 sm:px-6 sm:pt-12 lg:px-8">
        <!-- 1. Condições especiais de pagamento -->
        @if (item().condicoesEspeciais?.length) {
          <section
            id="condicoes"
            aria-labelledby="special-conditions-heading"
            class="rounded-xl border border-brand/22 bg-brand-container/55 p-5 sm:p-8 scroll-mt-28"
          >
            <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div class="max-w-2xl space-y-1.5">
                <h2
                  id="special-conditions-heading"
                  class="font-display text-[clamp(1.375rem,2.4vw,1.75rem)] font-medium not-italic leading-[1.16] tracking-[-0.02em] text-ink text-balance"
                >
                  Condições especiais de pagamento
                </h2>
                <p class="text-[14px] font-normal leading-[1.55] text-ink-muted sm:text-[15px]">
                  Facilidades vigentes para entrada e fluxo durante a obra. Consulte a unidade ideal.
                </p>
              </div>
            </div>

            <ul class="mt-5 grid gap-3 sm:grid-cols-2">
              @for (
                condicao of item().condicoesEspeciais ?? [];
                track condicao
              ) {
                <li
                  class="flex items-start gap-2.5 rounded-[16px] bg-elevated/90 p-4 text-[14px] font-normal leading-[1.55] text-ink"
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

            <div class="mt-5 pt-1">
              <a
                [href]="specialConditionsWhatsappHref()"
                target="_blank"
                rel="noopener noreferrer"
                class="terraco-link-underline inline-flex min-h-[42px] items-center text-[14px] font-medium text-brand transition-colors duration-150 hover:text-brand-hover"
              >
                Simular essas condições no WhatsApp
              </a>
            </div>
          </section>
        }

        <!-- 2. Plantas e tipologias interativas -->
        @defer (on viewport; hydrate on interaction) {
          <app-launch-floor-plans [item]="item()" />
        } @placeholder {
          <div
            id="plantas"
            aria-hidden="true"
            class="min-h-[480px] rounded-xl border border-border-subtle bg-elevated scroll-mt-28"
          ></div>
        }

        <!-- 3. Simulador de entrada e parcela -->
        @defer (on viewport; hydrate on interaction) {
          <app-launch-simulator [item]="item()" />
        } @placeholder {
          <div
            id="simulador"
            aria-hidden="true"
            class="min-h-[440px] rounded-xl border border-border-subtle bg-elevated scroll-mt-28"
          ></div>
        }

        <!-- 4. Galeria curada do empreendimento -->
        @if (hasGallery()) {
          <section
            id="galeria"
            aria-labelledby="gallery-heading"
            class="border-t border-border-subtle pt-12 scroll-mt-28"
          >
            <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div class="space-y-1">
                <h2
                  id="gallery-heading"
                  class="font-display text-[clamp(1.375rem,2.4vw,1.75rem)] font-medium not-italic leading-[1.16] tracking-[-0.02em] text-ink text-balance"
                >
                  Galeria do empreendimento
                </h2>
                <p class="text-[14px] font-normal text-ink-muted">
                  Toque em qualquer imagem para ampliar em tela cheia.
                </p>
              </div>

              <p class="text-[13px] font-normal text-ink-muted tabular-nums">
                {{ galleryImages().length }} fotos
              </p>
            </div>

            <div
              class="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3"
            >
              @for (media of visibleGalleryImages(); track media.url; let i = $index) {
                <button
                  type="button"
                  (click)="openLightbox(i)"
                  [attr.aria-label]="
                    'Ampliar imagem ' + (i + 1) + ': ' + media.alt
                  "
                  [class]="
                    i === 0
                      ? 'group relative col-span-2 aspect-[16/10] cursor-pointer overflow-hidden rounded-[20px] border border-border-subtle bg-surface text-left transition-colors duration-150 hover:border-brand/45 lg:row-span-2 lg:h-full lg:aspect-auto'
                      : 'group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-[20px] border border-border-subtle bg-surface text-left transition-colors duration-150 hover:border-brand/45'
                  "
                >
                  <img
                    [src]="media.url"
                    [alt]="media.alt"
                    [attr.width]="media.width ?? null"
                    [attr.height]="media.height ?? null"
                    loading="lazy"
                    decoding="async"
                    [class]="
                      i === 0
                        ? 'h-full w-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.02] lg:absolute lg:inset-0'
                        : 'h-full w-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.02]'
                    "
                  />
                </button>
              }
            </div>

            @if (hasMoreGalleryImages()) {
              <div class="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  (click)="toggleAllGallery()"
                  class="terraco-m3-chip inline-flex min-h-[44px] cursor-pointer items-center border border-border-strong bg-elevated px-5 py-2 text-[13px] font-medium text-ink hover:border-brand hover:text-brand"
                >
                  @if (showAllGallery()) {
                    Mostrar galeria resumida
                  } @else {
                    Ver todas as {{ galleryImages().length }} fotos
                  }
                </button>
              </div>
            }
          </section>
        }

        <!-- 5. Sobre o empreendimento & Endereço -->
        <section
          id="sobre"
          aria-labelledby="about-heading"
          class="border-t border-border-subtle pt-12 scroll-mt-28"
        >
          <div class="grid gap-8 lg:grid-cols-12">
            <div class="space-y-3 lg:col-span-7">
              <h2
                id="about-heading"
                class="font-display text-[clamp(1.375rem,2.4vw,1.75rem)] font-medium not-italic leading-[1.16] tracking-[-0.02em] text-ink text-balance"
              >
                Sobre o {{ item().nome }}
              </h2>

              <p
                class="text-[16px] font-normal leading-[1.65] text-ink-muted"
              >
                {{ item().resumo }}
              </p>
            </div>

            <div class="space-y-4 rounded-[22px] border border-border-subtle bg-surface/65 p-5 sm:p-6 lg:col-span-5">
              <dl class="space-y-3.5">
                @if (item().endereco) {
                  <div class="space-y-1">
                    <dt class="text-[13px] font-normal text-ink-muted">Endereço</dt>
                    <dd class="text-[14px] font-medium leading-[1.45] text-ink">
                      {{ item().endereco }}
                    </dd>
                  </div>
                }
                @if (item().construtora) {
                  <div class="space-y-1 border-t border-border-subtle pt-3">
                    <dt class="text-[13px] font-normal text-ink-muted">Incorporação</dt>
                    <dd class="text-[14px] font-normal leading-[1.45] text-ink">
                      {{ item().construtora }}
                    </dd>
                  </div>
                }
                <div class="space-y-1 border-t border-border-subtle pt-3">
                  <dt class="text-[13px] font-normal text-ink-muted">Tipologias</dt>
                  <dd class="text-[14px] font-normal leading-[1.45] text-ink">
                    {{ item().tipologias }}
                  </dd>
                </div>
              </dl>

              @if (bairroGuideSlug(); as guideSlug) {
                <div class="border-t border-border-subtle pt-3.5">
                  <a
                    [routerLink]="['/bairros', guideSlug]"
                    class="terraco-link-underline inline-flex min-h-[40px] items-center text-[14px] font-medium text-brand hover:text-brand-hover"
                  >
                    Conhecer o guia do bairro {{ item().bairro }}
                  </a>
                </div>
              }
            </div>
          </div>
        </section>

        <!-- 6. Diferenciais & Lazer -->
        @if (item().diferenciais.length > 0) {
          <section
            id="diferenciais"
            aria-labelledby="features-heading"
            class="border-t border-border-subtle pt-12 scroll-mt-28"
          >
            <h2
              id="features-heading"
              class="font-display text-[clamp(1.375rem,2.4vw,1.75rem)] font-medium not-italic leading-[1.16] tracking-[-0.02em] text-ink text-balance"
            >
              Diferenciais e lazer
            </h2>

            <ul
              class="mt-6 grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2"
            >
              @for (diferencial of item().diferenciais; track diferencial) {
                <li
                  class="flex items-start gap-3 border-t border-border-subtle/80 pt-4 text-[15px] font-normal leading-[1.58] text-ink"
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
                  <span>{{ diferencial }}</span>
                </li>
              }
            </ul>
          </section>
        }

        <!-- 7. Bloco final de conversão para anúncios (Zero-Pressure Closing) -->
        <section
          #closingCtaSection
          aria-labelledby="closing-cta-heading"
          class="terraco-cobogo-moss rounded-2xl bg-brand p-6 text-ink-inverse shadow-floating sm:p-10"
        >
          <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div class="max-w-xl space-y-2">
              <h2
                id="closing-cta-heading"
                class="font-display text-[clamp(1.5rem,2.8vw,2.125rem)] font-medium not-italic leading-[1.12] tracking-[-0.02em] text-ink-inverse text-balance"
              >
                Quer receber o book e a tabela do {{ item().nome }}?
              </h2>
              <p class="text-[15px] font-normal leading-[1.55] text-ink-inverse/82">
                Enviamos plantas em alta resolução, disponibilidade atualizada e fluxo personalizado direto no seu WhatsApp. Sem ligações indesejadas.
              </p>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                [href]="closingWhatsappHref()"
                target="_blank"
                rel="noopener noreferrer"
                class="terraco-btn terraco-btn-ipe inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-pill bg-accent px-6 py-3 text-[14px] font-medium leading-[1.35] text-ink hover:bg-accent-hover"
              >
                Receber tabela no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </div>

      <!-- Barra flutuante M3 Expressive no mobile (aparece só após rolar além do CTA principal e some ao chegar no fechamento/rodapé) -->
      @if (showMobileDock() && !isBottomZoneVisible() && !hasFavorites()) {
        <aside
          aria-label="Ações rápidas do empreendimento"
          animate.enter="terraco-toolbar-enter"
          animate.leave="terraco-toolbar-leave"
          class="fixed right-3 bottom-3 left-3 z-30 flex items-center justify-between gap-2.5 rounded-pill border border-border-subtle bg-elevated/96 px-3 py-2 shadow-floating backdrop-blur-md md:hidden"
        >
          <div class="min-w-0 pl-1.5">
            <p class="font-display truncate text-[15px] font-medium leading-tight text-ink">
              {{ item().nome }}
            </p>
            <p class="truncate text-[12px] font-normal text-ink-muted">
              {{ item().bairro }}
            </p>
          </div>

          <div class="flex shrink-0 items-center gap-1.5">
            @if (item().plantas?.length) {
              <a
                href="#plantas"
                (click)="scrollToSection($event, 'plantas')"
                class="terraco-m3-chip inline-flex min-h-[40px] items-center border border-border-subtle bg-surface px-3.5 text-[13px] font-medium text-ink"
              >
                Plantas
              </a>
            }
            <a
              [href]="whatsappHref()"
              target="_blank"
              rel="noopener noreferrer"
              [attr.aria-label]="'Conversar sobre ' + item().nome + ' no WhatsApp'"
              class="terraco-btn terraco-btn-moss inline-flex min-h-[40px] items-center justify-center rounded-pill bg-brand px-4 text-[13px] font-medium text-ink-inverse hover:bg-brand-hover"
            >
              WhatsApp
            </a>
          </div>
        </aside>
      }

      @defer (when lightboxOpen()) {
        <app-image-lightbox
          [images]="galleryImages()"
          [initialIndex]="lightboxIndex()"
          [isOpen]="lightboxOpen()"
          (closed)="closeLightbox()"
        />
      }
    </section>
  `,
})
export class PrimeViewLandingComponent {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly leadsService = inject(LeadsService);
  private readonly favoritesService = inject(FavoritesService);

  readonly item = input.required<Lancamento>();
  private readonly itemSlug = computed(() => this.item().slug);

  readonly hasFavorites = computed(
    () => this.favoritesService.favorites().length > 0
  );

  readonly showMobileDock = signal<boolean>(false);
  readonly isBottomZoneVisible = signal<boolean>(false);

  readonly imageLoaded = linkedSignal({
    source: this.itemSlug,
    computation: () => {
      const el = this.heroImg()?.nativeElement;
      return Boolean(el?.complete && el.naturalWidth > 0);
    },
  });
  readonly selectedIntent = linkedSignal<string, LaunchIntentKey>({
    source: this.itemSlug,
    computation: () => 'plantas_valores',
  });
  readonly lightboxOpen = linkedSignal({
    source: this.itemSlug,
    computation: () => false,
  });
  readonly lightboxIndex = linkedSignal({
    source: this.itemSlug,
    computation: () => 0,
  });
  readonly showAllGallery = linkedSignal({
    source: this.itemSlug,
    computation: () => false,
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
  private readonly heroWhatsappCta =
    viewChild<ElementRef<HTMLAnchorElement>>('heroWhatsappCta');
  private readonly closingCtaSection =
    viewChild<ElementRef<HTMLElement>>('closingCtaSection');

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

  readonly selectedIntentLabel = computed(() =>
    this.selectedIntentOption().label.toLowerCase()
  );

  readonly galleryImages = computed<readonly LaunchMediaItem[]>(
    () => this.item().galeria ?? []
  );

  readonly visibleGalleryImages = computed<readonly LaunchMediaItem[]>(() => {
    const all = this.galleryImages();
    return this.showAllGallery() ? all : all.slice(0, INITIAL_GALLERY_COUNT);
  });

  readonly hasMoreGalleryImages = computed(
    () => this.galleryImages().length > INITIAL_GALLERY_COUNT
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
    return buildWhatsAppUrl(
      this.selectedIntentOption().buildMessage(currentItem)
    );
  });

  readonly specialConditionsWhatsappHref = computed(() => {
    const currentItem = this.item();
    return buildWhatsAppUrl(
      `Oi! Quero simular as condições especiais de pagamento do ${currentItem.nome} (${currentItem.bairro}).`
    );
  });

  readonly closingWhatsappHref = computed(() => {
    const currentItem = this.item();
    return buildWhatsAppUrl(
      `Oi! Vi a página do ${currentItem.nome} (${currentItem.bairro}) e quero receber o book, plantas e tabela atualizada.`
    );
  });

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

      const ctaEl = this.heroWhatsappCta()?.nativeElement;
      const closingEl = this.closingCtaSection()?.nativeElement;
      const footerEl = this.document.getElementById('contato');

      const observers: IntersectionObserver[] = [];

      if (ctaEl) {
        const heroObserver = new IntersectionObserver(
          (entries) => {
            const entry = entries[0];
            if (!entry) return;
            const scrolledPast =
              !entry.isIntersecting && entry.boundingClientRect.bottom < 0;
            this.showMobileDock.set(scrolledPast);
          },
          { threshold: 0 }
        );
        heroObserver.observe(ctaEl);
        observers.push(heroObserver);
      }

      const bottomTargets = [closingEl, footerEl].filter(
        (target): target is HTMLElement => Boolean(target)
      );

      if (bottomTargets.length > 0) {
        const visibleBottomTargets = new Set<Element>();
        const bottomObserver = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                visibleBottomTargets.add(entry.target);
              } else {
                visibleBottomTargets.delete(entry.target);
              }
            }
            this.isBottomZoneVisible.set(visibleBottomTargets.size > 0);
          },
          { threshold: 0.05 }
        );
        for (const target of bottomTargets) {
          bottomObserver.observe(target);
        }
        observers.push(bottomObserver);
      }

      this.destroyRef.onDestroy(() => {
        for (const observer of observers) {
          observer.disconnect();
        }
      });
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

  toggleAllGallery(): void {
    this.showAllGallery.update((current) => !current);
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

  scrollToSection(event: MouseEvent, sectionId: string): void {
    event.preventDefault();
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const target = this.document.getElementById(sectionId);
    if (!target) {
      return;
    }
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    target.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
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
        intent: option.key,
        message: option.buildMessage(currentItem),
      });
      this.callbackSubmitted.set(true);
      this.callbackOpen.set(false);
    } catch (err) {
      this.callbackError.set(
        err instanceof Error
          ? err.message
          : 'Não foi possível enviar seu contato. Tente novamente.'
      );
    }
  }
}
