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
  required,
  submit,
  validate,
} from '@angular/forms/signals';
import { LeadsService } from '../../core';

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
  imports: [FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
  template: `
    @if (successTerm(); as term) {
      <div
        role="status"
        class="rounded-md border border-success-fg/20 bg-success-bg px-4 py-3.5 text-[14px] font-normal leading-[1.5] text-success-fg"
      >
        @if (customSuccessMessage()) {
          {{ customSuccessMessage() }}
        } @else if (term === 'essa região') {
          Combinado! Assim que entrar um novo lançamento por aqui, te chamamos no WhatsApp.
        } @else {
          Combinado! Assim que entrar um lançamento em {{ term }}, te chamamos no WhatsApp.
        }
      </div>
    } @else {
      <form
        (submit)="handleSubmit($event)"
        novalidate
        [class]="
          compact()
            ? 'flex w-full max-w-md flex-col gap-2.5 sm:flex-row sm:items-center'
            : 'flex flex-col gap-3 sm:flex-row sm:items-center'
        "
      >
        <label [for]="inputId()" class="sr-only">
          Seu WhatsApp com DDD
        </label>
        <input
          [id]="inputId()"
          type="tel"
          autocomplete="tel"
          inputmode="tel"
          placeholder="(31) 99999-9999"
          [formField]="alertForm.phone"
          (input)="onPhoneInput()"
          class="min-h-[44px] w-full min-w-0 flex-1 rounded-pill border border-border-subtle bg-canvas px-4 py-2.5 text-[14px] font-normal text-ink placeholder:text-ink-muted transition-[border-color,box-shadow] duration-150 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 disabled:opacity-60 tabular-nums"
        />
        <button
          type="submit"
          [disabled]="submitting()"
          class="terraco-btn terraco-btn-moss inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-pill bg-brand px-5 py-2.5 text-[13px] font-medium leading-[1.35] text-ink-inverse hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          @if (submitting()) {
            Enviando...
          } @else {
            Me avise no WhatsApp
          }
        </button>
      </form>

      @if (displayError(); as errorMsg) {
        <p
          role="alert"
          class="mt-3 rounded-sm bg-error-bg px-3.5 py-2 text-[13px] font-normal text-error-fg"
        >
          {{ errorMsg }}
        </p>
      }
    }
  `,
})
export class WhatsappAlertFormComponent {
  private readonly leadsService = inject(LeadsService);

  readonly inputId = input<string>('whatsapp-alert-input');
  readonly searchedTerm = input<string>('Belo Horizonte');
  readonly fallbackTerm = input<string>('essa região');
  readonly customSuccessMessage = input<string>('');
  readonly resetKey = input<string>('');
  readonly compact = input<boolean>(false);

  private readonly model = signal({ phone: '' });
  readonly submitting = signal<boolean>(false);
  readonly submitError = signal<string>('');
  readonly successTerm = signal<string>('');

  readonly alertForm = form(this.model, (schemaPath) => {
    required(schemaPath.phone, {
      message: 'Informe um WhatsApp válido com DDD (ex: (31) 99999-9999).',
    });
    validate(schemaPath.phone, ({ value }) => {
      const digits = value().replace(/\D/g, '');
      if (digits.length > 0 && digits.length < 10) {
        return {
          kind: 'phoneLength',
          message: 'Informe um WhatsApp válido com DDD (ex: (31) 99999-9999).',
        };
      }
      return undefined;
    });
    disabled(schemaPath.phone, () => this.submitting());
  });

  readonly displayError = computed<string>(() => {
    if (this.submitError()) {
      return this.submitError();
    }
    const phoneState = this.alertForm.phone();
    if (phoneState.touched() && phoneState.invalid()) {
      return phoneState.errors()[0]?.message ?? '';
    }
    return '';
  });

  constructor() {
    effect(() => {
      this.resetKey();
      this.model.set({ phone: '' });
      this.alertForm().reset();
      this.submitting.set(false);
      this.submitError.set('');
      this.successTerm.set('');
    });
  }

  onPhoneInput(): void {
    const formatted = formatBrazilianPhone(this.model().phone);
    if (formatted !== this.model().phone) {
      this.model.set({ phone: formatted });
    }
    if (this.submitError()) {
      this.submitError.set('');
    }
  }

  handleSubmit(event: Event): void {
    event.preventDefault();
    if (this.submitting()) {
      return;
    }

    this.submitError.set('');
    void submit(this.alertForm, async () => {
      const term = this.searchedTerm().trim();
      this.submitting.set(true);
      try {
        await this.leadsService.captureDemandLead({
          phone: this.model().phone.trim(),
          searchedTerm: term || 'Belo Horizonte',
        });
        this.successTerm.set(term || this.fallbackTerm());
        this.model.set({ phone: '' });
        this.alertForm().reset();
      } catch (err) {
        this.submitError.set(
          err instanceof Error
            ? err.message
            : 'Não foi possível salvar seu WhatsApp agora. Tente novamente.'
        );
      } finally {
        this.submitting.set(false);
      }
    });
  }
}
