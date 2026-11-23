import { DOCUMENT, isPlatformBrowser } from '@angular/common';
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
  signal,
  viewChild,
} from '@angular/core';
import {
  FormField,
  disabled,
  form,
  maxLength,
  minLength,
  required,
  submit,
  validate,
} from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import {
  CardResizeDirective,
  LeadsService,
  SITE_NAME,
  SITE_URL,
  buildWhatsAppUrl,
  extractBrazilianPhoneDigits,
  formatBrazilianPhone,
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
  imports: [RouterLink, FormField, ImageLightboxComponent, CardResizeDirective],
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
              class="relative flex w-full items-center justify-center overflow-hidden rounded-t-[calc(var(--radius-lg)-1px)] border-b border-border-subtle bg-surface lg:col-span-7 lg:rounded-tr-none lg:rounded-l-[calc(var(--radius-lg)-1px)] lg:border-b-0 lg:border-r lg:border-border-subtle"
            >
              <button
                #heroTrigger
                type="button"
                data-testid="launch-hero-trigger"
                (click)="openLightbox()"
                [attr.aria-label]="'Ampliar foto de ' + item().nome"
                class="terraco-card-media-trigger relative z-[1] block aspect-square w-full overflow-hidden rounded-t-[calc(var(--radius-lg)-1px)] text-left lg:rounded-tr-none lg:rounded-l-[calc(var(--radius-lg)-1px)] cursor-zoom-in"
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
                  class="terraco-card-media-img h-full w-full object-fill"
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
              class="flex flex-col justify-between gap-3 p-4 sm:gap-5 sm:p-6 lg:col-span-5 lg:gap-5 lg:p-6"
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
                class="grid grid-cols-2 gap-x-4 gap-y-2.5 border-y border-border-subtle py-2.5 sm:gap-x-6 sm:gap-y-4 sm:py-4"
              >
                <div class="space-y-0.5 sm:space-y-1">
                  <dt class="text-[13px] font-normal text-ink-muted">
                    Dormitórios
                  </dt>
                  <dd
                    class="text-[15px] font-normal leading-[1.4] text-ink tabular-nums"
                  >
                    {{ item().quartos }}
                  </dd>
                </div>

                <div class="space-y-0.5 sm:space-y-1">
                  <dt class="text-[13px] font-normal text-ink-muted">Metragem</dt>
                  <dd
                    class="text-[15px] font-normal leading-[1.4] text-ink tabular-nums"
                  >
                    {{ item().metragem }}
                  </dd>
                </div>

                <div class="space-y-0.5 sm:space-y-1">
                  <dt class="text-[13px] font-normal text-ink-muted">Vagas</dt>
                  <dd
                    class="text-[15px] font-normal leading-[1.4] text-ink tabular-nums"
                  >
                    {{ item().vagas }}
                  </dd>
                </div>

                <div class="space-y-0.5 sm:space-y-1">
                  <dt class="text-[13px] font-normal text-ink-muted">
                    Tipologias
                  </dt>
                  <dd class="text-[15px] font-normal leading-[1.4] text-ink">
                    {{ item().tipologias || 'Lazer completo' }}
                  </dd>
                </div>
              </dl>

              <form
                (submit)="onWhatsAppSubmit($event)"
                novalidate
                [attr.aria-label]="'Solicitar atendimento no WhatsApp sobre ' + item().nome"
                class="space-y-2.5 sm:space-y-3"
              >
                <p class="text-[14px] font-normal leading-[1.45] text-ink-muted sm:text-[15px]">
                  Plantas, valores e condições direto no WhatsApp.
                </p>

                <!-- Honeypot field for bot filtering -->
                <div class="sr-only" aria-hidden="true">
                  <label [attr.for]="honeypotInputId()">Website</label>
                  <input
                    [id]="honeypotInputId()"
                    type="text"
                    tabindex="-1"
                    autocomplete="off"
                    [formField]="leadForm.website"
                  />
                </div>

                <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-1">
                  <div class="space-y-1">
                    <label
                      [attr.for]="nameInputId()"
                      class="block text-[12px] font-normal text-ink-muted"
                    >
                      Nome
                    </label>
                    <input
                      [id]="nameInputId()"
                      type="text"
                      autocomplete="name"
                      placeholder="Seu nome"
                      [formField]="leadForm.name"
                      [attr.aria-invalid]="nameHasError() ? 'true' : null"
                      [attr.aria-describedby]="nameHasError() ? nameErrorId() : null"
                      class="min-h-[40px] w-full rounded-sm border border-border-subtle bg-canvas px-3 py-2 text-[14px] font-normal text-ink placeholder:text-ink-muted/70 transition-colors duration-150 hover:border-ink/25 focus-visible:border-brand disabled:opacity-60 sm:min-h-[42px]"
                    />
                    @if (nameHasError()) {
                      <p
                        [id]="nameErrorId()"
                        class="text-[12px] font-normal leading-[1.35] text-error-fg"
                      >
                        {{ leadForm.name().errors()[0].message }}
                      </p>
                    }
                  </div>

                  <div class="space-y-1">
                    <label
                      [attr.for]="phoneInputId()"
                      class="block text-[12px] font-normal text-ink-muted"
                    >
                      Número para contato
                    </label>
                    <input
                      [id]="phoneInputId()"
                      type="tel"
                      inputmode="tel"
                      autocomplete="tel"
                      placeholder="(31) 99999-9999"
                      [formField]="leadForm.phone"
                      (blur)="onPhoneBlur()"
                      [attr.aria-invalid]="phoneHasError() ? 'true' : null"
                      [attr.aria-describedby]="phoneHasError() ? phoneErrorId() : null"
                      class="min-h-[40px] w-full rounded-sm border border-border-subtle bg-canvas px-3 py-2 text-[14px] font-normal text-ink tabular-nums placeholder:text-ink-muted/70 transition-colors duration-150 hover:border-ink/25 focus-visible:border-brand disabled:opacity-60 sm:min-h-[42px]"
                    />
                    @if (phoneHasError()) {
                      <p
                        [id]="phoneErrorId()"
                        class="text-[12px] font-normal leading-[1.35] text-error-fg"
                      >
                        {{ leadForm.phone().errors()[0].message }}
                      </p>
                    }
                  </div>
                </div>

                @if (submitError(); as errorMessage) {
                  <p
                    role="alert"
                    class="rounded-sm bg-error-bg px-3 py-2 text-[12px] font-normal leading-[1.4] text-error-fg"
                  >
                    {{ errorMessage }}
                  </p>
                }

                @if (submitted()) {
                  <div
                    role="status"
                    animate.enter="terraco-reveal"
                    class="rounded-sm bg-success-bg px-3 py-2 text-[12px] font-normal leading-[1.4] text-success-fg"
                  >
                    Contato registrado! Se o WhatsApp não abriu automaticamente,
                    <a
                      [href]="whatsappHref()"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="font-medium underline underline-offset-2"
                    >
                      clique aqui para continuar
                    </a>.
                  </div>
                }

                <button
                  type="submit"
                  [disabled]="submitting()"
                  class="terraco-btn terraco-btn-moss flex min-h-[46px] w-full items-center justify-center rounded-pill bg-brand px-6 py-2.5 text-sm font-medium leading-[1.35] text-ink-inverse hover:bg-brand-hover disabled:cursor-wait disabled:opacity-70 sm:min-h-[50px] sm:py-3 cursor-pointer"
                >
                  @if (submitting()) {
                    Abrindo WhatsApp...
                  } @else {
                    Falar no WhatsApp
                  }
                </button>
              </form>
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
  private readonly platformId = inject(PLATFORM_ID);
  private readonly leadsService = inject(LeadsService);

  readonly item = input.required<Lancamento>();
  readonly imageLoaded = signal<boolean>(false);
  readonly isLightboxOpen = signal<boolean>(false);
  readonly submitting = signal<boolean>(false);
  readonly submitted = signal<boolean>(false);
  readonly submitError = signal<string | null>(null);

  private readonly heroImg = viewChild<ElementRef<HTMLImageElement>>('heroImg');
  protected readonly heroTrigger =
    viewChild<ElementRef<HTMLButtonElement>>('heroTrigger');

  protected readonly leadModel = signal({
    name: '',
    phone: '',
    website: '',
  });

  protected readonly leadForm = form(this.leadModel, (s) => {
    required(s.name, { message: 'Informe seu nome.' });
    minLength(s.name, 2, { message: 'Digite pelo menos 2 caracteres.' });
    maxLength(s.name, 120, { message: 'Nome muito longo.' });

    required(s.phone, { message: 'Informe seu telefone ou WhatsApp.' });
    validate(s.phone, ({ value }) => {
      const digits = extractBrazilianPhoneDigits(value());
      if (digits.length === 0) {
        return undefined;
      }
      if (digits.length < 10 || digits.length > 11) {
        return {
          kind: 'brazilianPhone',
          message: 'Informe um número com DDD (10 ou 11 dígitos).',
        };
      }
      return undefined;
    });

    disabled(s.name, { when: () => this.submitting() });
    disabled(s.phone, { when: () => this.submitting() });
  });

  readonly nameInputId = computed(() => `lead-name-${this.item().slug}`);
  readonly phoneInputId = computed(() => `lead-phone-${this.item().slug}`);
  readonly honeypotInputId = computed(() => `lead-site-${this.item().slug}`);
  readonly nameErrorId = computed(() => `lead-name-err-${this.item().slug}`);
  readonly phoneErrorId = computed(() => `lead-phone-err-${this.item().slug}`);

  readonly nameHasError = computed(
    () =>
      this.leadForm.name().touched() && this.leadForm.name().errors().length > 0,
  );
  readonly phoneHasError = computed(
    () =>
      this.leadForm.phone().touched() &&
      this.leadForm.phone().errors().length > 0,
  );

  readonly whatsappHref = computed(() =>
    buildWhatsAppUrl(this.item().whatsappMensagem),
  );

  constructor() {
    afterNextRender(() => {
      const el = this.heroImg()?.nativeElement;
      if (el?.complete && el.naturalWidth > 0) {
        this.imageLoaded.set(true);
      }
    });

    effect(() => {
      // Reset image loaded & submission state when navigating between different launch slugs.
      this.item().slug;
      const el = this.heroImg()?.nativeElement;
      this.imageLoaded.set(Boolean(el?.complete && el.naturalWidth > 0));
      this.submitted.set(false);
      this.submitError.set(null);
    });

    effect(() => {
      const currentItem = this.item();
      const jsonLd = buildJsonLd(currentItem);
      const serialized = JSON.stringify(jsonLd).replace(/</g, '\\u003c');

      let scriptEl = this.document.getElementById(
        'launch-jsonld',
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

  onPhoneBlur(): void {
    const current = this.leadModel().phone;
    const formatted = formatBrazilianPhone(current);
    if (formatted && formatted !== current) {
      this.leadModel.update((model) => ({ ...model, phone: formatted }));
    }
  }

  onWhatsAppSubmit(event: Event): void {
    event.preventDefault();
    this.submitError.set(null);

    const isValid = this.leadForm().valid();
    if (isValid && isPlatformBrowser(this.platformId)) {
      // Open WhatsApp synchronously inside the user gesture so browsers never block the pop-up.
      window.open(this.whatsappHref(), '_blank', 'noopener,noreferrer');
    }

    void submit(this.leadForm, async () => {
      this.submitting.set(true);
      try {
        const { name, phone, website } = this.leadModel();
        await this.leadsService.createLead({
          name,
          phone,
          website,
          launchSlug: this.item().slug,
          launchName: this.item().nome,
          source: 'web-seo:launch-detail-whatsapp',
        });
        this.submitted.set(true);
      } catch (error) {
        this.submitError.set(
          error instanceof Error
            ? error.message
            : 'Não foi possível enviar seu contato. Tente novamente.',
        );
      } finally {
        this.submitting.set(false);
      }
    });
  }

  openLightbox(): void {
    this.isLightboxOpen.set(true);
  }

  closeLightbox(): void {
    this.isLightboxOpen.set(false);
    this.heroTrigger()?.nativeElement.focus();
  }
}
