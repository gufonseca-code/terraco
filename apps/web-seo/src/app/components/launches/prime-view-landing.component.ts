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
  viewChild,
  viewChildren,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  BAIRROS_BH,
  LancamentosService,
  LeadsService,
  SITE_NAME,
  SITE_URL,
  buildWhatsAppUrl,
  formatCurrencyBRL,
  type Lancamento,
  type LaunchMediaItem,
} from '../../core';
import {
  type JourneyDestination,
  NextJourneyComponent,
} from '../shared/next-journey.component';
import { SectionHandoffComponent } from '../shared/section-handoff.component';
import { FavoriteButtonComponent } from './favorite-button.component';
import { ImageLightboxComponent } from './image-lightbox.component';
import { LaunchCardComponent } from './launch-card.component';
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
    SectionHandoffComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      aria-labelledby="launch-heading"
      class="flex flex-1 flex-col justify-start bg-canvas pt-2 pb-10 sm:py-8 lg:py-10"
    >
      <div class="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div class="terraco-reveal mb-2 flex items-center justify-between gap-3 sm:mb-4">
          <a
            routerLink="/lancamentos"
            class="terraco-link-underline inline-flex min-h-[34px] items-center gap-1.5 text-[14px] font-normal text-ink-muted transition-colors duration-150 hover:text-ink sm:min-h-[40px]"
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

        <!-- M3 Expressive Compact Hero Card (28px outer shell / 20px concentric media inset) -->
        <article
          class="terraco-reveal-delay terraco-floating-card overflow-hidden rounded-[28px] bg-elevated p-2 sm:p-2.5"
        >
          <div class="grid gap-3 sm:gap-4 lg:grid-cols-12 lg:gap-5">
            <!-- Mídia principal com cantos concêntricos e altura contida -->
            <div
              [class.terraco-skeleton]="!imageLoaded()"
              class="group relative aspect-[21/9] w-full min-w-0 overflow-hidden rounded-[20px] bg-surface sm:aspect-[16/9] lg:col-span-7 lg:aspect-auto lg:min-h-[390px] lg:max-h-[430px] lg:rounded-[22px]"
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
                class="relative z-[1] h-full w-full rounded-[20px] object-cover object-center lg:absolute lg:inset-0 lg:rounded-[22px]"
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
                  class="terraco-btn absolute right-2.5 bottom-2.5 z-10 inline-flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-pill border border-border-subtle bg-elevated/95 px-3 py-1 text-[12px] font-medium text-ink shadow-chip backdrop-blur-xs hover:border-brand/40 sm:right-3 sm:bottom-3 sm:min-h-[38px] sm:px-3.5 sm:text-[13px]"
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
                  <span class="tabular-nums">{{ galleryImages().length }} fotos</span>
                </button>
              }

              <div class="absolute top-2.5 right-2.5 z-10 sm:top-3 sm:right-3">
                <app-favorite-button
                  [slug]="item().slug"
                  [nome]="item().nome"
                />
              </div>
            </div>

            <!-- Painel compacto de decisão e conversão -->
            <div
              class="flex min-w-0 flex-col justify-between gap-2.5 px-2 pt-0.5 pb-1.5 sm:gap-3.5 sm:px-3 sm:py-2 lg:col-span-5 lg:py-3 lg:pr-3.5 lg:pl-0"
            >
              <div class="min-w-0 space-y-0.5">
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
                  class="font-display text-[clamp(1.625rem,3vw,2.125rem)] font-medium not-italic leading-[1.08] tracking-[-0.025em] text-ink text-balance"
                >
                  {{ item().nome }}
                </h1>
              </div>

              <!-- Ficha técnica enxuta em container tonal Areia Suave -->
              <dl
                class="grid grid-cols-2 gap-x-3 gap-y-2 rounded-[18px] bg-surface/80 px-3.5 py-2.5 sm:gap-x-4 sm:gap-y-2.5 sm:px-4 sm:py-3"
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
                  <div class="space-y-0.5 border-t border-border-subtle/80 pt-1.5">
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
                  <div class="space-y-0.5 border-t border-border-subtle/80 pt-1.5">
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
                  <div class="space-y-0.5 border-t border-border-subtle/80 pt-1.5">
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
                  <div class="space-y-0.5 border-t border-border-subtle/80 pt-1.5">
                    <dt class="text-[12px] font-normal text-ink-muted sm:text-[13px]">
                      Tipologias
                    </dt>
                    <dd class="line-clamp-1 text-[13px] font-normal leading-[1.3] text-ink sm:text-[14px]">
                      {{ item().tipologias }}
                    </dd>
                  </div>
                }
              </dl>

              <!-- Chips de intenção M3 Expressive (1 linha rolável no mobile, 2x2 no desktop) + CTA principal -->
              <div class="min-w-0 space-y-2 sm:space-y-2.5">
                <div
                  role="group"
                  aria-label="Assunto para conversa no WhatsApp"
                  class="terraco-no-scrollbar flex w-full min-w-0 gap-1.5 overflow-x-auto pb-0.5 lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0"
                >
                  @for (option of intentOptions; track option.key) {
                    <button
                      type="button"
                      (click)="selectIntent(option.key)"
                      [attr.aria-pressed]="selectedIntent() === option.key"
                      [class]="
                        selectedIntent() === option.key
                          ? 'terraco-m3-chip flex min-h-[36px] shrink-0 cursor-pointer items-center justify-center border border-ink bg-ink px-3.5 py-1 text-center text-[13px] font-medium leading-[1.25] whitespace-nowrap text-ink-inverse shadow-chip lg:min-h-[40px] lg:whitespace-normal'
                          : 'terraco-m3-chip flex min-h-[36px] shrink-0 cursor-pointer items-center justify-center border border-border-subtle bg-surface/75 px-3.5 py-1 text-center text-[13px] font-normal leading-[1.25] whitespace-nowrap text-ink hover:border-border-strong hover:bg-surface lg:min-h-[40px] lg:whitespace-normal'
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
                  class="terraco-btn terraco-btn-moss flex min-h-[44px] w-full items-center justify-center rounded-pill bg-brand px-5 py-2 text-[14px] font-medium leading-[1.35] text-ink-inverse hover:bg-brand-hover sm:min-h-[48px] sm:py-2.5"
                >
                  Falar no WhatsApp
                </a>

                <div>
                  @if (callbackSubmitted()) {
                    <p
                      role="status"
                      data-testid="launch-callback-success"
                      class="rounded-[14px] border border-brand/25 bg-surface/60 px-3.5 py-2 text-[13px] font-normal leading-[1.45] text-ink"
                    >
                      Recebemos seu contato. Um especialista retorna em instantes sobre {{ selectedIntentLabel() }}.
                    </p>
                  } @else if (callbackOpen()) {
                    <form
                      (submit)="submitCallbackLead($event)"
                      animate.enter="terraco-chip-enter"
                      class="space-y-2.5 rounded-[18px] border border-border-subtle bg-surface/60 p-3.5"
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
                        class="min-h-[40px] w-full rounded-[12px] border border-border-subtle bg-elevated px-3 py-1.5 text-[13px] text-ink placeholder:text-ink-muted/70 focus:border-brand focus:outline-none"
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
                          class="min-h-[40px] flex-1 rounded-[12px] border border-border-subtle bg-elevated px-3 py-1.5 text-[13px] text-ink placeholder:text-ink-muted/70 focus:border-brand focus:outline-none tabular-nums"
                        />
                        <button
                          type="submit"
                          [disabled]="callbackSubmitting()"
                          class="terraco-btn inline-flex min-h-[40px] shrink-0 cursor-pointer items-center justify-center rounded-pill border border-brand bg-brand px-4 py-1.5 text-[13px] font-medium text-ink-inverse hover:bg-brand-hover disabled:opacity-60"
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
                      class="terraco-link-underline w-full cursor-pointer py-0.5 text-center text-[13px] font-normal text-ink-muted transition-colors duration-150 hover:text-ink"
                    >
                      Prefere que um especialista te chame?
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>
        </article>

        <!-- Trilha fixa M3 Expressive com scroll-spy (visível já na dobra mobile) -->
        <nav
          #sectionNav
          aria-label="Seções do empreendimento"
          class="terraco-no-scrollbar sticky top-3 z-20 mt-3.5 flex items-center gap-1.5 overflow-x-auto rounded-pill border border-border-subtle bg-elevated/95 p-1.5 shadow-card backdrop-blur-md sm:mt-5"
        >
          @if (item().condicoesEspeciais?.length) {
            <a
              #sectionNavLink
              data-section-id="condicoes"
              href="#condicoes"
              (click)="scrollToSection($event, 'condicoes')"
              [attr.aria-current]="activeSection() === 'condicoes' ? 'true' : null"
              [class]="sectionNavPillClass('condicoes')"
            >
              Condições
            </a>
          }
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
          @if (item().diferenciais.length > 0) {
            <a
              #sectionNavLink
              data-section-id="diferenciais"
              href="#diferenciais"
              (click)="scrollToSection($event, 'diferenciais')"
              [attr.aria-current]="activeSection() === 'diferenciais' ? 'true' : null"
              [class]="sectionNavPillClass('diferenciais')"
            >
              Diferenciais
            </a>
          }
          @if (item().plantas?.length) {
            <a
              #sectionNavLink
              data-section-id="plantas"
              href="#plantas"
              (click)="scrollToSection($event, 'plantas')"
              [attr.aria-current]="activeSection() === 'plantas' ? 'true' : null"
              [class]="sectionNavPillClass('plantas')"
            >
              Plantas
            </a>
          }
          <a
            #sectionNavLink
            data-section-id="simulador"
            href="#simulador"
            (click)="scrollToSection($event, 'simulador')"
            [attr.aria-current]="activeSection() === 'simulador' ? 'true' : null"
            [class]="sectionNavPillClass('simulador')"
          >
            Simular entrada
          </a>
          @if (hasGallery()) {
            <a
              #sectionNavLink
              data-section-id="galeria"
              href="#galeria"
              (click)="scrollToSection($event, 'galeria')"
              [attr.aria-current]="activeSection() === 'galeria' ? 'true' : null"
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
              [attr.aria-current]="activeSection() === 'outros-lancamentos' ? 'true' : null"
              [class]="sectionNavPillClass('outros-lancamentos')"
            >
              Outros em BH
            </a>
          }
        </nav>

        <div class="mt-8 space-y-12 sm:mt-10 sm:space-y-14">
          @if (item().condicoesEspeciais?.length) {
            <section
              id="condicoes"
              aria-labelledby="special-conditions-heading"
              class="terraco-cobogo-band rounded-lg border border-brand/25 bg-surface/55 p-5 sm:p-8 scroll-mt-24"
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
                Facilidades vigentes para entrada e financiamento. Consulte a
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
            id="sobre"
            aria-labelledby="about-heading"
            class="scroll-mt-24"
          >
            <h2
              id="about-heading"
              class="font-display text-[clamp(1.375rem,2.2vw,1.75rem)] font-medium not-italic leading-[1.18] tracking-[-0.02em] text-ink text-balance"
            >
              Sobre o empreendimento
            </h2>

            <p
              class="mt-3 max-w-3xl text-base font-normal leading-[1.65] text-ink"
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

            @if (item().diferenciais.length > 0) {
              <div class="mt-5">
                <app-section-handoff
                  prompt="Quer ver o que o condomínio oferece?"
                  label="Explorar diferenciais e lazer"
                  targetId="diferenciais"
                />
              </div>
            }
          </section>

          @if (item().diferenciais.length > 0) {
            <section
              id="diferenciais"
              aria-labelledby="features-heading"
              class="border-t border-border-subtle pt-10 scroll-mt-24"
            >
              <h2
                id="features-heading"
                class="font-display text-[clamp(1.375rem,2.2vw,1.75rem)] font-medium not-italic leading-[1.18] tracking-[-0.02em] text-ink text-balance"
              >
                Diferenciais &amp; Lazer
              </h2>

              <ul
                class="mt-6 grid grid-cols-1 gap-x-10 gap-y-3.5 sm:grid-cols-2"
              >
                @for (diferencial of item().diferenciais; track diferencial) {
                  <li
                    class="flex items-start gap-2.5 text-[15px] font-normal leading-[1.55] text-ink"
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

              @if (item().plantas?.length) {
                <div class="mt-6">
                  <app-section-handoff
                    prompt="Próximo passo:"
                    label="Ver plantas e metragens"
                    targetId="plantas"
                  />
                </div>
              }
            </section>
          }

          @defer (on viewport; hydrate on interaction) {
            <app-launch-floor-plans [item]="item()" />
          } @placeholder {
            <div
              id="plantas"
              aria-hidden="true"
              class="min-h-[480px] rounded-lg border border-border-subtle bg-elevated scroll-mt-24"
            ></div>
          }

          @defer (on viewport; hydrate on interaction) {
            <app-launch-simulator [item]="item()" />
          } @placeholder {
            <div
              id="simulador"
              aria-hidden="true"
              class="min-h-[440px] rounded-lg border border-border-subtle bg-elevated scroll-mt-24"
            ></div>
          }

          @if (hasGallery()) {
            <section
              id="galeria"
              aria-labelledby="gallery-heading"
              class="border-t border-border-subtle pt-10 scroll-mt-24"
            >
              <h2
                id="gallery-heading"
                class="font-display text-[clamp(1.375rem,2.2vw,1.75rem)] font-medium not-italic leading-[1.18] tracking-[-0.02em] text-ink text-balance"
              >
                Galeria do empreendimento
              </h2>

              <div
                class="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3"
              >
                @for (media of galleryImages(); track media.url; let i = $index) {
                  <button
                    type="button"
                    (click)="openLightbox(i)"
                    [attr.aria-label]="
                      'Ampliar imagem ' + (i + 1) + ': ' + media.alt
                    "
                    class="group relative aspect-[4/3] overflow-hidden rounded-md border border-border-subtle bg-surface text-left transition-colors duration-150 hover:border-brand/40 cursor-pointer"
                  >
                    <img
                      [src]="media.url"
                      [alt]="media.alt"
                      [attr.width]="media.width ?? null"
                      [attr.height]="media.height ?? null"
                      loading="lazy"
                      decoding="async"
                      class="h-full w-full object-cover object-center"
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
              class="border-t border-border-subtle pt-10 scroll-mt-24"
            >
              <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div class="space-y-1">
                  <h2
                    id="other-launches-heading"
                    class="font-display text-[clamp(1.375rem,2.2vw,1.75rem)] font-medium not-italic leading-[1.18] tracking-[-0.02em] text-ink text-balance"
                  >
                    Outros lançamentos em BH para comparar
                  </h2>
                  <p class="text-[14px] font-normal text-ink-muted">
                    Compare plantas, bairros e condições antes de decidir.
                  </p>
                </div>

                <a
                  routerLink="/lancamentos"
                  class="terraco-link-underline inline-flex min-h-[40px] items-center text-[14px] font-medium text-brand transition-colors duration-150 hover:text-brand-hover"
                >
                  Ver catálogo completo
                </a>
              </div>

              <div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                @for (other of otherLaunches(); track other.slug) {
                  <app-launch-card
                    [launch]="other"
                    headingLevel="h3"
                  />
                }
              </div>
            </section>
          }
        </div>
      </div>

      <div class="mt-12 sm:mt-14">
        <app-next-journey
          heading="Continue sua pesquisa"
          [destinations]="nextDestinations()"
        />
      </div>

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
  private readonly lancamentosService = inject(LancamentosService);

  readonly item = input.required<Lancamento>();
  private readonly itemSlug = computed(() => this.item().slug);

  readonly activeSection = linkedSignal<string, string>({
    source: this.itemSlug,
    computation: () =>
      this.item().condicoesEspeciais?.length ? 'condicoes' : 'sobre',
  });

  readonly otherLaunches = computed<readonly Lancamento[]>(() =>
    this.lancamentosService
      .lancamentos()
      .filter((launch) => launch.slug !== this.item().slug)
  );

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
  private readonly sectionNav =
    viewChild<ElementRef<HTMLElement>>('sectionNav');
  private readonly sectionNavLinks =
    viewChildren<ElementRef<HTMLAnchorElement>>('sectionNavLink');

  private ignoreScrollSpyUntil = 0;
  private pendingScrollSettleTimer: ReturnType<typeof setTimeout> | null = null;

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
        'condicoes',
        'sobre',
        'diferenciais',
        'plantas',
        'simulador',
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

      this.destroyRef.onDestroy(() => {
        observer.disconnect();
        if (this.pendingScrollSettleTimer !== null) {
          clearTimeout(this.pendingScrollSettleTimer);
          this.pendingScrollSettleTimer = null;
        }
      });
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
      return `${base} terraco-m3-chip--active bg-brand font-medium text-ink-inverse shadow-chip`;
    }
    return `${base} bg-elevated font-normal text-ink-muted hover:bg-surface hover:text-ink`;
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
    const stickyOffset = navHeight + 24;

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
    // Re-align once after @defer hydration or smooth scroll if layout shifted.
    this.pendingScrollSettleTimer = setTimeout(() => {
      this.pendingScrollSettleTimer = null;
      const freshTarget = this.document.getElementById(sectionId);
      if (!freshTarget) return;
      const currentTop = freshTarget.getBoundingClientRect().top;
      if (Math.abs(currentTop - stickyOffset) > 28) {
        scrollToTarget(false);
      }
    }, 520);
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
