import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FavoritesService,
  LancamentosService,
  type Lancamento,
  buildWhatsAppUrl,
  formatCurrencyBRL,
} from '../../core';

@Component({
  selector: 'app-favorites-tray',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape($event)',
  },
  template: `
    @if (savedLaunches().length > 0 && !isOpen()) {
      <aside
        aria-label="Lançamentos salvos"
        animate.enter="terraco-chip-enter"
        animate.leave="terraco-chip-leave"
        class="fixed bottom-4 left-1/2 z-40 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-2.5 rounded-pill border border-border-subtle bg-elevated/95 px-4 py-2.5 shadow-floating backdrop-blur-md sm:gap-3"
      >
        <div class="flex items-center gap-2 pl-0.5 text-sm font-normal text-ink">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="h-4 w-4 shrink-0 text-highlight"
          >
            <path
              d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"
            />
          </svg>
          <span class="whitespace-nowrap tabular-nums">
            @if (savedCount() === 1) {
              1 lançamento salvo
            } @else {
              {{ savedCount() }} lançamentos salvos
            }
          </span>
        </div>

        <button
          type="button"
          (click)="open()"
          class="terraco-btn terraco-btn-moss inline-flex min-h-[38px] shrink-0 cursor-pointer items-center justify-center rounded-pill bg-brand px-4 text-[13px] font-medium whitespace-nowrap text-ink-inverse hover:bg-brand-hover"
        >
          {{ savedCount() >= 2 ? 'Comparar' : 'Ver salvo' }}
        </button>

        <button
          type="button"
          (click)="clearAll()"
          aria-label="Limpar lançamentos salvos"
          class="terraco-btn inline-flex min-h-[38px] shrink-0 cursor-pointer items-center justify-center rounded-pill px-2.5 text-[13px] font-medium whitespace-nowrap text-ink-muted hover:bg-surface hover:text-ink"
        >
          Limpar
        </button>
      </aside>
    }

    @if (isOpen() && savedLaunches().length > 0) {
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Comparar lançamentos salvos"
        (click)="onBackdropClick($event)"
        class="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      >
        <div
          class="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-lg border border-border-subtle bg-elevated shadow-floating sm:rounded-lg"
        >
          <header
            class="flex items-start justify-between gap-4 border-b border-border-subtle px-5 py-4 sm:px-6 sm:py-5"
          >
            <div class="min-w-0">
              <h2
                class="font-display text-xl leading-[1.2] font-medium tracking-[-0.02em] text-ink sm:text-2xl"
              >
                @if (savedCount() >= 2) {
                  Comparar lançamentos
                } @else {
                  Lançamento salvo
                }
              </h2>
              <p class="mt-1 text-sm font-normal text-ink-muted tabular-nums">
                @if (savedCount() === 1) {
                  1 imóvel salvo para consulta rápida.
                } @else {
                  {{ savedCount() }} imóveis salvos lado a lado.
                }
              </p>
            </div>

            <button
              #closeButton
              type="button"
              (click)="close()"
              aria-label="Fechar comparador"
              class="terraco-btn inline-flex min-h-[44px] min-w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-pill border border-border-subtle bg-canvas text-ink hover:border-ink/25 hover:bg-surface"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-5 w-5"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </header>

          <div class="flex-1 overflow-auto">
            <table class="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr class="border-b border-border-subtle">
                  <th
                    scope="col"
                    class="sticky left-0 z-10 w-36 bg-elevated px-4 py-4 align-bottom text-xs font-medium text-ink-muted sm:w-44 sm:px-6"
                  >
                    Comparativo
                  </th>
                  @for (launch of savedLaunches(); track launch.slug) {
                    <th
                      scope="col"
                      class="min-w-[220px] px-4 py-4 align-top font-normal sm:px-5"
                    >
                      <div class="flex flex-col gap-3">
                        <a
                          [routerLink]="['/lancamentos', launch.slug]"
                          (click)="close()"
                          class="group block overflow-hidden rounded-sm border border-border-subtle bg-surface"
                        >
                          <img
                            [src]="launch.imagem"
                            [alt]="launch.imagemAlt || launch.nome"
                            [attr.width]="launch.imagemWidth"
                            [attr.height]="launch.imagemHeight"
                            loading="lazy"
                            decoding="async"
                            class="aspect-[16/10] w-full object-cover"
                          />
                        </a>

                        <div class="flex items-start justify-between gap-2">
                          <div class="min-w-0">
                            <a
                              [routerLink]="['/lancamentos', launch.slug]"
                              (click)="close()"
                              class="font-display block text-base leading-[1.25] font-medium tracking-[-0.01em] text-ink hover:text-brand"
                            >
                              {{ launch.nome }}
                            </a>
                            <p class="mt-0.5 text-[13px] font-normal text-ink-muted">
                              {{ launch.bairro }}
                            </p>
                          </div>

                          <button
                            type="button"
                            (click)="removeLaunch(launch.slug)"
                            [attr.aria-label]="'Remover ' + launch.nome + ' dos salvos'"
                            class="terraco-btn inline-flex min-h-[32px] shrink-0 cursor-pointer items-center rounded-pill px-2.5 text-[12px] font-medium text-ink-muted hover:bg-surface hover:text-ink"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    </th>
                  }
                </tr>
              </thead>

              <tbody class="divide-y divide-border-subtle text-[13px] leading-[1.5] text-ink">
                <tr>
                  <th
                    scope="row"
                    class="sticky left-0 z-10 bg-elevated px-4 py-3.5 align-top font-medium text-ink-muted sm:px-6"
                  >
                    Dormitórios
                  </th>
                  @for (launch of savedLaunches(); track launch.slug) {
                    <td class="px-4 py-3.5 align-top font-normal sm:px-5">
                      {{ formatValue(launch.quartos) }}
                    </td>
                  }
                </tr>

                <tr>
                  <th
                    scope="row"
                    class="sticky left-0 z-10 bg-elevated px-4 py-3.5 align-top font-medium text-ink-muted sm:px-6"
                  >
                    Metragem
                  </th>
                  @for (launch of savedLaunches(); track launch.slug) {
                    <td class="px-4 py-3.5 align-top font-normal tabular-nums sm:px-5">
                      {{ formatValue(launch.metragem) }}
                    </td>
                  }
                </tr>

                <tr>
                  <th
                    scope="row"
                    class="sticky left-0 z-10 bg-elevated px-4 py-3.5 align-top font-medium text-ink-muted sm:px-6"
                  >
                    Tipologias
                  </th>
                  @for (launch of savedLaunches(); track launch.slug) {
                    <td class="px-4 py-3.5 align-top font-normal sm:px-5">
                      {{ formatValue(launch.tipologias) }}
                    </td>
                  }
                </tr>

                <tr>
                  <th
                    scope="row"
                    class="sticky left-0 z-10 bg-elevated px-4 py-3.5 align-top font-medium text-ink-muted sm:px-6"
                  >
                    Vagas
                  </th>
                  @for (launch of savedLaunches(); track launch.slug) {
                    <td class="px-4 py-3.5 align-top font-normal tabular-nums sm:px-5">
                      {{ formatValue(launch.vagas) }}
                    </td>
                  }
                </tr>

                <tr>
                  <th
                    scope="row"
                    class="sticky left-0 z-10 bg-elevated px-4 py-3.5 align-top font-medium text-ink-muted sm:px-6"
                  >
                    Entrega
                  </th>
                  @for (launch of savedLaunches(); track launch.slug) {
                    <td class="px-4 py-3.5 align-top font-normal tabular-nums sm:px-5">
                      {{ formatValue(launch.entrega) }}
                    </td>
                  }
                </tr>

                <tr>
                  <th
                    scope="row"
                    class="sticky left-0 z-10 bg-elevated px-4 py-3.5 align-top font-medium text-ink-muted sm:px-6"
                  >
                    A partir de
                  </th>
                  @for (launch of savedLaunches(); track launch.slug) {
                    <td class="px-4 py-3.5 align-top font-medium tabular-nums text-ink sm:px-5">
                      {{ formatPrice(launch.precoAPartirDe) }}
                    </td>
                  }
                </tr>

                <tr>
                  <th
                    scope="row"
                    class="sticky left-0 z-10 bg-elevated px-4 py-4 align-top font-medium text-ink-muted sm:px-6"
                  >
                    Principais diferenciais
                  </th>
                  @for (launch of savedLaunches(); track launch.slug) {
                    <td class="px-4 py-4 align-top font-normal sm:px-5">
                      @if (launch.diferenciais.length > 0) {
                        <ul class="space-y-1.5">
                          @for (
                            item of launch.diferenciais.slice(0, 3);
                            track $index
                          ) {
                            <li class="flex items-start gap-2">
                              <span
                                aria-hidden="true"
                                class="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-pill bg-brand"
                              ></span>
                              <span>{{ item }}</span>
                            </li>
                          }
                        </ul>
                      } @else {
                        <span class="text-ink-muted">Sob consulta</span>
                      }
                    </td>
                  }
                </tr>
              </tbody>
            </table>
          </div>

          <footer
            class="flex flex-col items-stretch justify-between gap-3 border-t border-border-subtle bg-canvas px-5 py-4 sm:flex-row sm:items-center sm:px-6"
          >
            <p class="text-[13px] font-normal text-ink-muted">
              Sem compromisso — enviamos plantas, tabela e condições direto no seu WhatsApp.
            </p>

            <a
              [href]="whatsappComparatorHref()"
              target="_blank"
              rel="noopener noreferrer"
              class="terraco-btn terraco-btn-moss inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-pill bg-brand px-5 text-[13px] font-medium text-ink-inverse hover:bg-brand-hover"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4 shrink-0"
              >
                <path
                  d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
                />
              </svg>
              Receber esse comparativo no meu WhatsApp
            </a>
          </footer>
        </div>
      </div>
    }
  `,
})
export class FavoritesTrayComponent {
  private readonly favoritesService = inject(FavoritesService);
  private readonly lancamentosService = inject(LancamentosService);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly isOpen = signal(false);

  private readonly closeButton =
    viewChild<ElementRef<HTMLButtonElement>>('closeButton');

  readonly savedLaunches = computed<Lancamento[]>(() => {
    const favorites = this.favoritesService.favorites();
    if (favorites.length === 0) {
      return [];
    }

    const bySlug = new Map(
      this.lancamentosService.lancamentos().map((launch) => [launch.slug, launch])
    );

    const matched: Lancamento[] = [];
    for (const slug of favorites) {
      const launch = bySlug.get(slug);
      if (launch) {
        matched.push(launch);
      }
    }
    return matched;
  });

  readonly savedCount = computed(() => this.savedLaunches().length);

  readonly whatsappComparatorHref = computed(() => {
    const launches = this.savedLaunches();
    if (launches.length === 0) {
      return buildWhatsAppUrl(
        'Oi! Gostaria de receber informações sobre os lançamentos da Terraço.'
      );
    }

    const formattedItems = launches.map(
      (launch) => `${launch.nome} (${launch.bairro})`
    );

    if (formattedItems.length === 1) {
      return buildWhatsAppUrl(
        `Oi! Salvei o lançamento ${formattedItems[0]} na Terraço e gostaria de receber o comparativo com plantas e condições no meu WhatsApp.`
      );
    }

    const lastItem = formattedItems[formattedItems.length - 1];
    const headItems = formattedItems.slice(0, -1).join(', ');

    return buildWhatsAppUrl(
      `Oi! Salvei estes lançamentos na Terraço para comparar: ${headItems} e ${lastItem}. Pode me enviar esse comparativo no meu WhatsApp?`
    );
  });

  private previousOverflow = '';
  private isScrollLocked = false;

  constructor() {
    effect(() => {
      if (this.savedLaunches().length === 0 && this.isOpen()) {
        this.isOpen.set(false);
      }
    });

    effect(() => {
      if (!this.isBrowser) {
        return;
      }

      if (this.isOpen()) {
        if (!this.isScrollLocked) {
          this.previousOverflow = this.document.body.style.overflow;
          this.document.body.style.overflow = 'hidden';
          this.isScrollLocked = true;
        }
        queueMicrotask(() => {
          this.closeButton()?.nativeElement.focus();
        });
      } else if (this.isScrollLocked) {
        this.document.body.style.overflow = this.previousOverflow;
        this.isScrollLocked = false;
      }
    });

    this.destroyRef.onDestroy(() => {
      if (this.isBrowser && this.isScrollLocked) {
        this.document.body.style.overflow = this.previousOverflow;
        this.isScrollLocked = false;
      }
    });
  }

  open(): void {
    if (this.savedLaunches().length > 0) {
      this.isOpen.set(true);
    }
  }

  close(): void {
    this.isOpen.set(false);
  }

  removeLaunch(slug: string): void {
    this.favoritesService.toggle(slug);
  }

  clearAll(): void {
    const slugs = this.savedLaunches().map((launch) => launch.slug);
    for (const slug of slugs) {
      this.favoritesService.toggle(slug);
    }
    this.isOpen.set(false);
  }

  onEscape(event: Event): void {
    if (!this.isOpen()) {
      return;
    }
    event.preventDefault();
    this.close();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  formatValue(value: string | undefined): string {
    const trimmed = value?.trim();
    return trimmed ? trimmed : 'Sob consulta';
  }

  formatPrice(value: number | undefined): string {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return formatCurrencyBRL(value);
    }
    return 'Sob consulta';
  }
}
