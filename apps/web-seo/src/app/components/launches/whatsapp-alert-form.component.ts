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
  FormField,
  disabled,
  form,
  submit,
  validate,
} from '@angular/forms/signals';
import { LeadsService } from '../../core';
import {
  M3ButtonDirective,
  M3ChipDirective,
} from '../shared/m3-tactile.directives';

const QUICK_PREFERENCES = [
  '2 quartos',
  'Garden / Cobertura',
  'Qualquer planta',
] as const;

type QuickPreference = (typeof QUICK_PREFERENCES)[number];

export function formatBrazilianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

@Component({
  selector: 'app-whatsapp-alert-form',
  imports: [FormField, M3ButtonDirective, M3ChipDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
  template: `
    <div [class]="compact() ? '' : 'rounded-[24px] bg-surface'">
      @if (submitted()) {
        <div
          role="status"
          aria-live="polite"
          class="terraco-reveal flex items-start gap-3 rounded-[20px] border border-[#1F6F50]/20 bg-[#E5F2EC] px-4 py-3.5 text-[14px] font-normal leading-[1.55] text-[#1F6F50]"
        >
          <span
            aria-hidden="true"
            class="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1F6F50] text-white"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-3 w-3"
            >
              <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
            </svg>
          </span>
          <span>{{ successMessage() }}</span>
        </div>
      } @else {
        @if (!compact()) {
          <div class="mb-4 space-y-2.5">
            <span
              class="inline-flex items-center gap-1.5 rounded-pill bg-[#E5F2EC] px-2.5 py-0.5 text-[12px] font-medium leading-[1.3] text-[#1F6F50]"
            >
              <span
                aria-hidden="true"
                class="h-1.5 w-1.5 rounded-full bg-[#1F6F50]"
              ></span>
              Aviso em primeira mão
            </span>

            <p
              class="font-display text-[1.125rem] font-medium not-italic leading-[1.25] tracking-[-0.015em] text-ink text-balance"
            >
              Escolha seu perfil e receba no WhatsApp
            </p>

            <div
              role="group"
              aria-label="Preferência opcional de planta"
              class="flex flex-wrap items-center gap-2 pt-0.5"
            >
              @for (pref of preferences; track pref) {
                @let active = selectedPreference() === pref;
                <button
                  type="button"
                  appM3Chip
                  tone="brand"
                  [active]="active"
                  (click)="togglePreference(pref)"
                  [attr.aria-pressed]="active"
                  class="inline-flex min-h-[44px] items-center px-3.5 py-1.5 text-[13px] leading-[1.3] sm:min-h-[38px]"
                >
                  <span>{{ pref }}</span>
                </button>
              }
            </div>
          </div>
        }

        <form
          (submit)="handleSubmit($event)"
          novalidate
          [class]="
            compact()
              ? 'flex w-full max-w-md flex-col gap-2.5 sm:flex-row sm:items-center'
              : 'flex w-full flex-col gap-2.5 sm:flex-row sm:items-center'
          "
        >
          <label [attr.for]="inputId()" class="sr-only">
            Seu WhatsApp com DDD
          </label>
          <input
            [id]="inputId()"
            type="tel"
            autocomplete="tel"
            inputmode="tel"
            placeholder="(31) 99999-9999"
            aria-label="Seu WhatsApp com DDD"
            [attr.aria-invalid]="displayError() ? 'true' : null"
            [attr.aria-describedby]="displayError() ? inputId() + '-error' : null"
            [formField]="alertForm.phone"
            (input)="onPhoneInput()"
            class="min-h-[44px] w-full min-w-0 flex-1 rounded-pill border border-border-strong/70 bg-canvas px-4 py-2.5 text-[14px] font-normal text-ink placeholder:text-ink-muted transition-[border-color,box-shadow] duration-150 motion-reduce:transition-none focus-visible:border-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/25 disabled:opacity-60 tabular-nums"
          />
          <button
            type="submit"
            appM3Button
            variant="primary"
            [disabled]="submitting()"
            class="inline-flex min-h-[44px] shrink-0 items-center justify-center px-5 py-2.5 text-[13px] leading-[1.35] disabled:cursor-not-allowed disabled:opacity-60"
          >
            @if (submitting()) {
              Enviando...
            } @else {
              {{ submitLabel() }}
            }
          </button>
        </form>

        @if (displayError(); as errorMsg) {
          <p
            [id]="inputId() + '-error'"
            role="alert"
            aria-live="polite"
            class="mt-3 rounded-sm bg-error-bg px-3.5 py-2 text-[13px] font-normal text-error-fg"
          >
            {{ errorMsg }}
          </p>
        }
      }
    </div>
  `,
})
export class WhatsappAlertFormComponent {
  private readonly leadsService = inject(LeadsService);

  readonly inputId = input<string>('whatsapp-alert-input');
  readonly searchedTerm = input<string>('Belo Horizonte');
  readonly successMessage = input<string>(
    'Combinado! Assim que entrar um novo lançamento compatível, te chamamos no WhatsApp.'
  );
  readonly submitLabel = input<string>('Me avise no WhatsApp');
  readonly compact = input<boolean>(false);
  readonly resetKey = input<string>('');

  readonly preferences = QUICK_PREFERENCES;
  readonly selectedPreference = signal<QuickPreference | null>(null);

  private readonly model = signal({ phone: '' });
  readonly submitting = signal<boolean>(false);
  readonly submitted = signal<boolean>(false);
  readonly serverError = signal<string | null>(null);

  readonly alertForm = form(this.model, (schemaPath) => {
    validate(schemaPath.phone, ({ value }) => {
      const digits = value().replace(/\D/g, '');
      if (digits.length < 10) {
        return {
          kind: 'brazilianPhone',
          message: 'Informe um WhatsApp válido com DDD (ex: (31) 99999-9999).',
        };
      }
      return undefined;
    });

    disabled(schemaPath.phone, () => this.submitting());
  });

  readonly displayError = computed<string | null>(() => {
    if (this.serverError()) {
      return this.serverError();
    }
    const phoneState = this.alertForm.phone();
    if (phoneState.touched() && phoneState.invalid()) {
      return phoneState.errors()[0]?.message ?? null;
    }
    return null;
  });

  constructor() {
    effect(() => {
      this.resetKey();
      this.model.set({ phone: '' });
      this.alertForm().reset();
      this.selectedPreference.set(null);
      this.submitting.set(false);
      this.submitted.set(false);
      this.serverError.set(null);
    });
  }

  togglePreference(pref: QuickPreference): void {
    this.selectedPreference.update((current) =>
      current === pref ? null : pref
    );
  }

  onPhoneInput(): void {
    const current = this.model().phone;
    const formatted = formatBrazilianPhone(current);
    if (formatted !== current) {
      this.model.set({ phone: formatted });
    }
    if (this.serverError()) {
      this.serverError.set(null);
    }
  }

  handleSubmit(event: Event): void {
    event.preventDefault();
    if (this.submitting()) {
      return;
    }

    this.serverError.set(null);
    void submit(this.alertForm, async () => {
      this.submitting.set(true);
      try {
        const baseTerm = this.searchedTerm() || 'Belo Horizonte';
        const preference = this.selectedPreference();
        const searchedTermWithPreference = preference
          ? `${baseTerm} · ${preference}`
          : baseTerm;

        await this.leadsService.captureDemandLead({
          phone: this.model().phone.trim(),
          searchedTerm: searchedTermWithPreference,
        });
        this.submitted.set(true);
        this.model.set({ phone: '' });
        this.alertForm().reset();
      } catch (err) {
        const rawMessage = err instanceof Error ? err.message : '';
        const isRawSystemError =
          !rawMessage ||
          /permission|insufficient|firebase|firestore|network/i.test(rawMessage);
        this.serverError.set(
          isRawSystemError
            ? 'Não foi possível enviar seu WhatsApp agora. Tente novamente em instantes.'
            : rawMessage
        );
      } finally {
        this.submitting.set(false);
      }
    });
  }
}
