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
  readonly index: string;
  readonly title: string;
  readonly description: string;
}

const TRUST_PILLARS: readonly TrustPillar[] = [
  {
    index: '01',
    title: 'Ficha completa antes do contato',
    description:
      'Metragem, faixa de preço e previsão de entrega ficam abertas na página para você avaliar sem cadastro.',
  },
  {
    index: '02',
    title: 'Sem ligações nem spam',
    description:
      'A conversa começa no WhatsApp apenas com o assunto que você escolher, sem repassar seu número.',
  },
  {
    index: '03',
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
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          class="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12 xl:gap-16"
        >
          <div class="lg:col-span-5">
            <h2
              id="trust-concierge-heading"
              class="max-w-md font-display text-[clamp(1.75rem,3vw,2.25rem)] font-medium not-italic leading-[1.12] tracking-[-0.025em] text-ink text-balance"
            >
              Atendimento claro em BH, no seu ritmo
            </h2>

            <ol
              class="mt-8 divide-y divide-border-subtle border-t border-border-subtle sm:mt-10"
            >
              @for (pillar of pillars; track pillar.index) {
                <li
                  class="grid grid-cols-[2.25rem_1fr] items-baseline gap-3 py-5 first:pt-6 last:pb-0 sm:gap-4"
                >
                  <span
                    aria-hidden="true"
                    class="font-display text-[15px] font-medium tabular-nums tracking-[-0.01em] text-brand"
                  >
                    {{ pillar.index }}
                  </span>
                  <div>
                    <h3
                      class="font-display text-[1.125rem] font-medium not-italic leading-[1.25] tracking-[-0.015em] text-ink text-balance"
                    >
                      {{ pillar.title }}
                    </h3>
                    <p
                      class="mt-1.5 text-[16px] font-normal leading-[1.55] text-ink-muted"
                    >
                      {{ pillar.description }}
                    </p>
                  </div>
                </li>
              }
            </ol>
          </div>

          <div class="lg:col-span-7">
            <div
              class="terraco-plate rounded-[28px] bg-elevated p-6 sm:p-8 lg:p-10"
            >
              <h3
                class="font-display text-[1.375rem] font-medium not-italic leading-[1.2] tracking-[-0.02em] text-ink text-balance sm:text-[1.5rem]"
              >
                Quer falar direto sobre o seu plano?
              </h3>
              <p
                class="mt-2 text-[15px] font-normal leading-[1.55] text-ink-muted"
              >
                Escolha o assunto para abrir o WhatsApp com a mensagem pronta.
              </p>

              <div
                role="group"
                aria-label="Assunto para conversa no WhatsApp"
                class="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2"
              >
                @for (option of intentOptions; track option.id) {
                  @let active = selectedIntentId() === option.id;
                  <button
                    type="button"
                    (click)="selectIntent(option.id)"
                    [attr.aria-pressed]="active"
                    [class]="
                      active
                        ? 'terraco-m3-chip inline-flex min-h-[46px] w-full cursor-pointer items-center justify-between gap-3 border border-ink bg-ink px-4 py-2.5 text-left text-[14px] font-medium leading-[1.3] text-ink-inverse shadow-chip'
                        : 'terraco-m3-chip inline-flex min-h-[46px] w-full cursor-pointer items-center justify-between gap-3 border border-border-subtle bg-canvas/70 px-4 py-2.5 text-left text-[14px] font-normal leading-[1.3] text-ink hover:border-border-strong hover:bg-surface/80'
                    "
                  >
                    <span>{{ option.label }}</span>
                    <span
                      aria-hidden="true"
                      [class]="
                        active
                          ? 'h-2 w-2 shrink-0 rounded-full bg-accent'
                          : 'h-2 w-2 shrink-0 rounded-full border border-border-strong'
                      "
                    ></span>
                  </button>
                }
              </div>

              <div class="mt-6 rounded-[20px] bg-surface/65 p-4 sm:p-5">
                <p
                  class="text-[14px] font-normal leading-[1.5] text-ink-muted"
                >
                  “{{ selectedIntent().message }}”
                </p>

                <a
                  [href]="whatsappHref()"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="terraco-btn terraco-btn-moss mt-4 inline-flex min-h-[48px] w-full items-center justify-center rounded-pill bg-brand px-6 py-3 text-[14px] font-medium leading-[1.35] text-ink-inverse hover:bg-brand-hover"
                >
                  Falar no WhatsApp
                </a>
              </div>
            </div>
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
