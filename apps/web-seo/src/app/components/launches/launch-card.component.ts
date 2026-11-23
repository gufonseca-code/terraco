import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
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
import { Router, RouterLink } from '@angular/router';
import {
  CardResizeDirective,
  LeadsService,
  extractBrazilianPhoneDigits,
  formatBrazilianPhone,
  type Lancamento,
} from '../../core';
import { FavoriteButtonComponent } from './favorite-button.component';

@Component({
  selector: 'app-launch-card',
  imports: [RouterLink, FormField, FavoriteButtonComponent, CardResizeDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block h-full',
  },
  template: `
    <article
      appCardResize
      [attr.id]="cardId()"
      animate.enter="terraco-reveal-delay"
      (click)="onCardClick($event)"
      class="terraco-plate group relative flex h-full flex-col overflow-hidden rounded-lg bg-elevated scroll-mt-24 cursor-pointer"
    >
      <div
        [class.terraco-skeleton]="!imageLoaded()"
        class="relative h-60 w-full shrink-0 overflow-hidden rounded-t-[calc(var(--radius-lg)-1px)] border-b border-border-subtle bg-surface sm:h-64"
      >
        <img
          #coverImg
          data-testid="lancamentos-cover-image"
          [attr.data-slug]="launch().slug"
          [src]="launch().imagem"
          [alt]="launch().imagemAlt"
          [width]="launch().imagemWidth"
          [height]="launch().imagemHeight"
          [style.view-transition-name]="'launch-image-' + launch().slug"
          [attr.fetchpriority]="priority() ? 'high' : 'auto'"
          [attr.loading]="priority() ? 'eager' : 'lazy'"
          (load)="markImageLoaded()"
          (error)="markImageLoaded()"
          decoding="async"
          class="h-full w-full rounded-t-[calc(var(--radius-lg)-1px)] object-cover object-[center_25%] transition-transform duration-300 ease-out group-hover:scale-[1.02]"
        />

        <div class="absolute top-3.5 right-3.5 z-10 sm:top-4 sm:right-4">
          <app-favorite-button [slug]="launch().slug" [nome]="launch().nome" />
        </div>
      </div>

      <div
        class="flex flex-1 flex-col justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1">
            <p class="text-[13px] font-normal text-ink-muted">
              {{ launch().bairro }}, {{ launch().cidade }}
            </p>
            <h2
              [style.view-transition-name]="'launch-title-' + launch().slug"
              class="font-display text-[1.375rem] font-medium leading-[1.18] tracking-[-0.015em] text-ink text-balance"
            >
              <a
                [routerLink]="['/lancamentos', launch().slug]"
                class="transition-colors duration-150 hover:text-brand group-hover:text-brand"
              >
                {{ launch().nome }}
              </a>
            </h2>
          </div>

          <a
            [routerLink]="['/lancamentos', launch().slug]"
            class="terraco-link-underline inline-flex min-h-[44px] shrink-0 items-center text-[13px] font-medium text-brand hover:text-brand-hover"
          >
            Conhecer lançamento
          </a>
        </div>

        <div class="border-t border-border-subtle pt-4 cursor-auto">
          @if (submitted()) {
            <div
              role="status"
              animate.enter="terraco-reveal"
              class="space-y-2 rounded-md bg-success-bg px-4 py-3.5 text-success-fg"
            >
              <p class="text-[14px] font-medium leading-[1.35]">
                Contato recebido!
              </p>
              <p class="text-[13px] font-normal leading-[1.45]">
                Em breve nossa equipe fala com você sobre o {{ launch().nome }}.
              </p>
              <button
                type="button"
                (click)="resetForm()"
                class="terraco-link-underline inline-flex min-h-[36px] items-center text-[13px] font-medium text-success-fg cursor-pointer"
              >
                Enviar outro contato
              </button>
            </div>
          } @else {
            <form
              (submit)="onLeadSubmit($event)"
              novalidate
              [attr.aria-label]="'Solicitar informações sobre ' + launch().nome"
              class="space-y-3"
            >
              <p class="text-[13px] font-medium leading-[1.35] text-ink">
                Receba valores e plantas no seu contato
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

              <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
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
                    class="min-h-[42px] w-full rounded-sm border border-border-subtle bg-canvas px-3 py-2 text-[14px] font-normal text-ink placeholder:text-ink-muted/70 transition-colors duration-150 hover:border-ink/25 focus-visible:border-brand disabled:opacity-60"
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
                    Telefone ou WhatsApp
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
                    class="min-h-[42px] w-full rounded-sm border border-border-subtle bg-canvas px-3 py-2 text-[14px] font-normal text-ink tabular-nums placeholder:text-ink-muted/70 transition-colors duration-150 hover:border-ink/25 focus-visible:border-brand disabled:opacity-60"
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

              <button
                type="submit"
                [disabled]="submitting()"
                class="terraco-btn terraco-btn-moss inline-flex min-h-[44px] w-full items-center justify-center rounded-pill bg-brand px-5 py-2.5 text-[13px] font-medium leading-[1.35] text-ink-inverse hover:bg-brand-hover disabled:cursor-wait disabled:opacity-70 cursor-pointer"
              >
                @if (submitting()) {
                  Enviando contato...
                } @else {
                  Quero mais informações
                }
              </button>
            </form>
          }
        </div>
      </div>

      <dl
        class="mt-auto grid grid-cols-1 divide-y divide-border-subtle border-t border-border-subtle bg-surface/45 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
      >
        <div class="space-y-0.5 px-5 py-3 sm:px-5">
          <dt class="text-[13px] font-normal text-ink-muted">Dormitórios</dt>
          <dd
            class="text-[15px] font-normal leading-[1.4] text-ink tabular-nums"
          >
            {{ launch().quartos }}
          </dd>
        </div>
        <div class="space-y-0.5 px-5 py-3 sm:px-5">
          <dt class="text-[13px] font-normal text-ink-muted">Metragem</dt>
          <dd
            class="text-[15px] font-normal leading-[1.4] text-ink tabular-nums"
          >
            {{ launch().metragem }}
          </dd>
        </div>
        <div class="space-y-0.5 px-5 py-3 sm:px-5">
          <dt class="text-[13px] font-normal text-ink-muted">Lazer</dt>
          <dd class="text-[15px] font-normal leading-[1.4] text-ink">
            {{ lazerLabel() }}
          </dd>
        </div>
      </dl>
    </article>
  `,
})
export class LaunchCardComponent {
  private readonly router = inject(Router);
  private readonly leadsService = inject(LeadsService);

  readonly launch = input.required<Lancamento>();
  readonly priority = input<boolean>(false);
  readonly cardId = input<string | null>(null);

  readonly imageLoaded = signal<boolean>(false);
  readonly submitting = signal<boolean>(false);
  readonly submitted = signal<boolean>(false);
  readonly submitError = signal<string | null>(null);

  private readonly coverImg =
    viewChild<ElementRef<HTMLImageElement>>('coverImg');

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

  readonly nameInputId = computed(() => `lead-name-${this.launch().slug}`);
  readonly phoneInputId = computed(() => `lead-phone-${this.launch().slug}`);
  readonly honeypotInputId = computed(() => `lead-site-${this.launch().slug}`);
  readonly nameErrorId = computed(() => `lead-name-err-${this.launch().slug}`);
  readonly phoneErrorId = computed(() => `lead-phone-err-${this.launch().slug}`);

  readonly nameHasError = computed(
    () =>
      this.leadForm.name().touched() && this.leadForm.name().errors().length > 0,
  );
  readonly phoneHasError = computed(
    () =>
      this.leadForm.phone().touched() &&
      this.leadForm.phone().errors().length > 0,
  );

  readonly lazerLabel = computed(() => {
    const lazerTag = this.launch().tags.find((tag) =>
      tag.toLowerCase().includes('lazer'),
    );
    return lazerTag ?? 'Lazer completo';
  });

  constructor() {
    afterNextRender(() => {
      const el = this.coverImg()?.nativeElement;
      if (el?.complete && el.naturalWidth > 0) {
        this.imageLoaded.set(true);
      }
    });

    effect(() => {
      this.launch().slug;
      const el = this.coverImg()?.nativeElement;
      this.imageLoaded.set(Boolean(el?.complete && el.naturalWidth > 0));
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

  onLeadSubmit(event: Event): void {
    event.preventDefault();
    this.submitError.set(null);

    void submit(this.leadForm, async () => {
      this.submitting.set(true);
      try {
        const { name, phone, website } = this.leadModel();
        await this.leadsService.createLead({
          name,
          phone,
          website,
          launchSlug: this.launch().slug,
          launchName: this.launch().nome,
          source: 'web-seo:launch-card',
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

  resetForm(): void {
    this.leadModel.set({ name: '', phone: '', website: '' });
    this.leadForm().reset();
    this.submitError.set(null);
    this.submitted.set(false);
  }

  onCardClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (target?.closest('a, button, form, input, label')) {
      return;
    }
    void this.router.navigate(['/lancamentos', this.launch().slug]);
  }
}
