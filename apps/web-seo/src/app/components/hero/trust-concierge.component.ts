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
      class="bg-brand py-10 text-ink-inverse sm:py-16 lg:py-24 scroll-mt-24"
    >
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          class="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12 xl:gap-16"
        >
          <div class="lg:col-span-5">
            <h2
              id="trust-concierge-heading"
              class="max-w-md font-display text-[clamp(1.75rem,3vw,2.25rem)] font-medium not-italic leading-[1.12] tracking-[-0.025em] text-ink-inverse text-balance"
            >
              Atendimento claro em BH, no seu ritmo
            </h2>

            <ol
              class="mt-6 divide-y divide-ink-inverse/15 border-t border-ink-inverse/15 sm:mt-8 lg:mt-10"
            >
              @for (pillar of pillars; track pillar.index) {
                <li
                  class="grid grid-cols-[2rem_1fr] items-baseline gap-3 py-4 first:pt-5 last:pb-0 sm:grid-cols-[2.25rem_1fr] sm:gap-4 sm:py-5 sm:first:pt-6"
                >
                  <span
                    aria-hidden="true"
                    class="font-display text-[15px] font-medium tabular-nums tracking-[-0.01em] text-ink-inverse/80"
                  >
                    {{ pillar.index }}
                  </span>
                  <div>
                    <h3
                      class="font-display text-[1.125rem] font-medium not-italic leading-[1.25] tracking-[-0.015em] text-ink-inverse text-balance"
                    >
                      {{ pillar.title }}
                    </h3>
                    <p
                      class="mt-1 text-[15px] font-normal leading-[1.55] text-ink-inverse/80 sm:mt-1.5 sm:text-[16px]"
                    >
                      {{ pillar.description }}
                    </p>
                  </div>
                </li>
              }
            </ol>
          </div>

          <div class="lg:col-span-7">
            <div class="rounded-[24px] bg-ink p-5 sm:rounded-[28px] sm:p-8 lg:p-10">
              <h3
                class="font-display text-[1.375rem] font-medium not-italic leading-[1.2] tracking-[-0.02em] text-ink-inverse text-balance sm:text-[1.5rem]"
              >
                Quer falar direto sobre o seu plano?
              </h3>
              <p
                class="mt-2 text-[14px] font-normal leading-[1.55] text-ink-inverse/80 sm:text-[15px]"
              >
                Escolha o assunto para abrir o WhatsApp com a mensagem pronta.
              </p>

              <div
                role="group"
                aria-label="Assunto para conversa no WhatsApp"
                class="mt-5 flex flex-wrap gap-2 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-2.5"
              >
                @for (option of intentOptions; track option.id) {
                  @let active = selectedIntentId() === option.id;
                  <button
                    type="button"
                    (click)="selectIntent(option.id)"
                    [attr.aria-pressed]="active"
                    [class]="
                      active
                        ? 'terraco-m3-chip inline-flex min-h-[42px] w-auto cursor-pointer items-center justify-between gap-2.5 border border-accent bg-accent px-4 py-2 text-left text-[13px] font-medium leading-[1.3] text-ink shadow-chip sm:min-h-[46px] sm:w-full sm:text-[14px]'
                        : 'terraco-m3-chip inline-flex min-h-[42px] w-auto cursor-pointer items-center justify-between gap-2.5 border border-ink-inverse/20 bg-ink-inverse/10 px-4 py-2 text-left text-[13px] font-normal leading-[1.3] text-ink-inverse hover:border-ink-inverse/40 hover:bg-ink-inverse/15 sm:min-h-[46px] sm:w-full sm:text-[14px]'
                    "
                  >
                    <span>{{ option.label }}</span>
                    <span
                      aria-hidden="true"
                      [class]="
                        active
                          ? 'h-2 w-2 shrink-0 rounded-full bg-ink'
                          : 'h-2 w-2 shrink-0 rounded-full border border-ink-inverse/45'
                      "
                    ></span>
                  </button>
                }
              </div>

              <div class="mt-5 border-t border-ink-inverse/15 pt-4 sm:mt-6 sm:pt-5">
                <p
                  class="text-[14px] font-normal leading-[1.5] text-ink-inverse/85"
                >
                  “{{ selectedIntent().message }}”
                </p>

                <a
                  [href]="whatsappHref()"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="terraco-btn mt-4 inline-flex min-h-[46px] w-fit items-center justify-center rounded-pill bg-ink-inverse px-6 py-2.5 text-[14px] font-medium leading-[1.35] text-ink hover:bg-surface"
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
