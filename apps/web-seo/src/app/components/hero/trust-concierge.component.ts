import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { buildWhatsAppUrl } from '../../core';

export type WhatsAppIntentId = 'plantas' | 'simulacao' | 'visita' | 'duvida';

interface WhatsAppIntentOption {
  readonly id: WhatsAppIntentId;
  readonly label: string;
  readonly message: string;
}

const WHATSAPP_INTENT_OPTIONS: readonly WhatsAppIntentOption[] = [
  {
    id: 'plantas',
    label: 'Plantas e valores',
    message:
      'Olá! Gostaria de receber plantas e valores atualizados dos lançamentos do Terraço em BH.',
  },
  {
    id: 'simulacao',
    label: 'Simular entrada / FGTS',
    message:
      'Olá! Quero simular entrada, FGTS e condições de pagamento para lançamentos em Belo Horizonte.',
  },
  {
    id: 'visita',
    label: 'Agendar visita',
    message:
      'Olá! Gostaria de agendar uma visita presencial em um lançamento do Terraço em BH.',
  },
  {
    id: 'duvida',
    label: 'Tirar uma dúvida',
    message:
      'Olá! Tenho uma dúvida sobre os lançamentos residenciais do Terraço em BH.',
  },
];

interface TrustPillar {
  readonly title: string;
  readonly description: string;
}

const TRUST_PILLARS: readonly TrustPillar[] = [
  {
    title: 'Ficha completa antes do contato',
    description:
      'Metragem, faixa de preço e previsão de entrega ficam abertas na página para você avaliar sem cadastro.',
  },
  {
    title: 'Sem ligações nem spam',
    description:
      'A conversa começa no WhatsApp apenas com o assunto que você escolher, sem repassar seu número.',
  },
  {
    title: 'Online ou presencial em BH',
    description:
      'Compare plantas pelo celular ou agende visita direta ao decorado nos bairros de Belo Horizonte.',
  },
];

@Component({
  selector: 'app-trust-concierge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      id="como-funciona"
      aria-labelledby="trust-concierge-heading"
      class="border-t border-border-subtle bg-surface/45 py-16 sm:py-20 lg:py-24 scroll-mt-24"
    >
      <div class="mx-auto max-w-6xl px-6 lg:px-8">
        <h2
          id="trust-concierge-heading"
          class="max-w-2xl font-display text-[clamp(1.75rem,3vw,2.25rem)] font-medium not-italic leading-[1.12] tracking-[-0.025em] text-ink text-balance"
        >
          Atendimento claro em BH, no seu ritmo
        </h2>

        <div class="mt-8 grid gap-6 sm:mt-10 md:grid-cols-3">
          @for (pillar of pillars; track pillar.title) {
            <div
              class="flex flex-col gap-2 rounded-lg border border-border-subtle bg-elevated/80 p-6"
            >
              <h3
                class="font-display text-[1.125rem] font-medium not-italic leading-[1.25] tracking-[-0.015em] text-ink text-balance"
              >
                {{ pillar.title }}
              </h3>
              <p class="text-[15px] font-normal leading-[1.55] text-ink-muted">
                {{ pillar.description }}
              </p>
            </div>
          }
        </div>

        <div class="terraco-plate mt-8 rounded-lg bg-elevated p-6 sm:p-8">
          <div
            class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
          >
            <div class="space-y-4">
              <h3
                class="font-display text-[1.125rem] font-medium not-italic leading-[1.25] tracking-[-0.015em] text-ink text-balance"
              >
                Quer falar direto sobre o seu plano?
              </h3>

              <div
                role="group"
                aria-label="Assunto para conversa no WhatsApp"
                class="flex flex-wrap gap-2"
              >
                @for (option of intentOptions; track option.id) {
                  @let active = selectedIntentId() === option.id;
                  <button
                    type="button"
                    (click)="selectIntent(option.id)"
                    [attr.aria-pressed]="active"
                    [class]="
                      active
                        ? 'inline-flex min-h-[40px] items-center rounded-pill border border-ink bg-ink px-4 py-2 text-[14px] font-medium leading-[1.3] text-ink-inverse transition-colors duration-150'
                        : 'inline-flex min-h-[40px] items-center rounded-pill border border-border-subtle bg-canvas px-4 py-2 text-[14px] font-normal leading-[1.3] text-ink transition-colors duration-150 hover:border-border-strong hover:bg-surface'
                    "
                  >
                    {{ option.label }}
                  </button>
                }
              </div>
            </div>

            <a
              [href]="whatsappHref()"
              target="_blank"
              rel="noopener noreferrer"
              class="terraco-btn terraco-btn-moss inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-pill bg-brand px-6 py-3 text-[14px] font-medium leading-[1.35] text-ink-inverse hover:bg-brand-hover"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class TrustConciergeComponent {
  readonly pillars = TRUST_PILLARS;
  readonly intentOptions = WHATSAPP_INTENT_OPTIONS;
  readonly selectedIntentId = signal<WhatsAppIntentId>('plantas');

  readonly selectedIntent = computed(
    () =>
      this.intentOptions.find(
        (option) => option.id === this.selectedIntentId()
      ) ?? this.intentOptions[0]
  );

  readonly whatsappHref = computed(() =>
    buildWhatsAppUrl(this.selectedIntent().message)
  );

  selectIntent(id: WhatsAppIntentId): void {
    this.selectedIntentId.set(id);
  }
}
