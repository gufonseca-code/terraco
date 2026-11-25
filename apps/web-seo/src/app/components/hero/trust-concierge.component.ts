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
      class="bg-ink py-12 text-ink-inverse sm:py-16 lg:py-24 scroll-mt-24"
    >
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          class="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12 xl:gap-16"
        >
          <div class="lg:col-span-5">
            <h2
              id="trust-concierge-heading"
              class="max-w-md font-display text-[clamp(1.75rem,3vw,2.25rem)] font-medium not-italic leading-[1.1] tracking-[-0.025em] text-ink-inverse text-balance"
            >
              Atendimento claro em BH, no seu ritmo
            </h2>

            <ul
              class="mt-6 divide-y divide-ink-inverse/15 border-t border-ink-inverse/15 sm:mt-8"
            >
              @for (pillar of pillars; track pillar.index) {
                <li class="py-4 first:pt-5 last:pb-0 sm:py-5 sm:first:pt-6">
                  <h3
                    class="font-display text-[1.125rem] font-medium not-italic leading-[1.25] tracking-[-0.015em] text-ink-inverse text-balance"
                  >
                    {{ pillar.title }}
                  </h3>
                  <p
                    class="mt-1.5 max-w-[46ch] text-[15px] font-normal leading-[1.55] text-ink-inverse/80 sm:text-[16px]"
                  >
                    {{ pillar.description }}
                  </p>
                </li>
              }
            </ul>
          </div>

          <div
            class="border-t border-ink-inverse/15 pt-8 lg:col-span-7 lg:border-t-0 lg:border-l lg:border-ink-inverse/15 lg:pt-0 lg:pl-12 xl:pl-16"
          >
            <h3
              class="font-display text-[clamp(1.375rem,2.4vw,1.75rem)] font-medium not-italic leading-[1.18] tracking-[-0.02em] text-ink-inverse text-balance"
            >
              Quer falar direto sobre o seu plano?
            </h3>
            <p
              class="mt-2 max-w-[52ch] text-[15px] font-normal leading-[1.55] text-ink-inverse/80 sm:text-[16px]"
            >
              Escolha o assunto para abrir o WhatsApp com a mensagem pronta.
            </p>

            <div
              role="group"
              aria-label="Assunto para conversa no WhatsApp"
              class="mt-5 flex flex-wrap gap-2.5 sm:mt-6"
            >
              @for (option of intentOptions; track option.id) {
                @let active = selectedIntentId() === option.id;
                <button
                  type="button"
                  (click)="selectIntent(option.id)"
                  [attr.aria-pressed]="active"
                  [class]="
                    active
                      ? 'terraco-m3-chip inline-flex min-h-[42px] w-auto cursor-pointer items-center gap-2.5 border border-ink-inverse bg-ink-inverse px-4 py-2 text-left text-[13px] font-medium leading-[1.3] text-ink shadow-chip sm:min-h-[44px] sm:text-[14px]'
                      : 'terraco-m3-chip inline-flex min-h-[42px] w-auto cursor-pointer items-center gap-2.5 border border-ink-inverse/20 bg-transparent px-4 py-2 text-left text-[13px] font-normal leading-[1.3] text-ink-inverse/90 hover:border-ink-inverse/45 hover:bg-ink-inverse/10 hover:text-ink-inverse sm:min-h-[44px] sm:text-[14px]'
                  "
                >
                  <span>{{ option.label }}</span>
                </button>
              }
            </div>

            <div class="mt-6 border-t border-ink-inverse/15 pt-5 sm:mt-7 sm:pt-6">
              <p
                class="max-w-[54ch] border-l-2 border-ink-inverse/30 pl-4 text-[15px] font-normal leading-[1.55] text-ink-inverse/85"
              >
                “{{ selectedIntent().message }}”
              </p>

              <a
                [href]="whatsappHref()"
                target="_blank"
                rel="noopener noreferrer"
                class="terraco-btn mt-5 inline-flex min-h-[46px] w-fit items-center justify-center rounded-pill bg-action px-6 py-2.5 text-[14px] font-medium leading-[1.35] text-white hover:bg-action-hover"
              >
                Falar no WhatsApp
              </a>
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
