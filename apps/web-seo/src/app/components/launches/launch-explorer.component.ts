import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LANCAMENTOS, type Lancamento } from '../../core';
import { FavoriteButtonComponent } from './favorite-button.component';

@Component({
  selector: 'app-launch-explorer',
  imports: [RouterLink, FavoriteButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (launch) {
      <section
        aria-labelledby="lancamentos-heading"
        class="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 sm:py-7 lg:px-8"
      >
        <h1
          id="lancamentos-heading"
          class="terraco-reveal font-display text-[clamp(1.875rem,3.2vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.02em] text-ink text-balance"
        >
          Lançamentos
        </h1>

        <article
          id="resultados-lancamentos"
          class="terraco-reveal terraco-reveal-delay terraco-plate mt-4 max-w-xl overflow-hidden rounded-lg bg-elevated sm:mt-5 scroll-mt-24"
        >
          <div
            class="relative aspect-[16/10] overflow-hidden border-b border-border-subtle bg-surface"
          >
            <a
              [routerLink]="['/lancamentos', launch.slug]"
              class="block h-full w-full"
              [attr.aria-label]="'Conhecer ' + launch.nome"
            >
              <img
                data-testid="lancamentos-cover-image"
                [src]="launch.imagem"
                [alt]="launch.imagemAlt"
                [width]="launch.imagemWidth"
                [height]="launch.imagemHeight"
                fetchpriority="high"
                decoding="async"
                class="h-full w-full object-cover object-center"
              />
            </a>

            <div class="absolute top-3.5 right-3.5 z-10 sm:top-4 sm:right-4">
              <app-favorite-button [slug]="launch.slug" [nome]="launch.nome" />
            </div>
          </div>

          <div
            class="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-5"
          >
            <div class="space-y-1">
              <p class="text-xs font-medium text-ink-muted">
                {{ launch.bairro }}, {{ launch.cidade }}
              </p>
              <h2
                class="font-display text-2xl font-bold leading-[1.15] tracking-[-0.02em] text-ink sm:text-[1.75rem]"
              >
                <a
                  [routerLink]="['/lancamentos', launch.slug]"
                  class="transition-colors duration-150 hover:text-brand"
                >
                  {{ launch.nome }}
                </a>
              </h2>
            </div>

            <a
              [routerLink]="['/lancamentos', launch.slug]"
              class="terraco-btn terraco-btn-moss inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-pill bg-brand px-5 py-2.5 text-sm font-semibold leading-[1.35] text-ink-inverse hover:bg-brand-hover"
            >
              Conhecer lançamento
            </a>
          </div>

          <dl
            class="grid grid-cols-1 divide-y divide-border-subtle border-t border-border-subtle bg-surface/45 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
          >
            <div class="space-y-0.5 px-5 py-3.5 sm:px-6">
              <dt class="text-xs font-medium text-ink-muted">Dormitórios</dt>
              <dd
                class="text-sm font-semibold leading-[1.35] text-ink tabular-nums"
              >
                {{ launch.quartos }}
              </dd>
            </div>
            <div class="space-y-0.5 px-5 py-3.5 sm:px-6">
              <dt class="text-xs font-medium text-ink-muted">Metragem</dt>
              <dd
                class="text-sm font-semibold leading-[1.35] text-ink tabular-nums"
              >
                {{ launch.metragem }}
              </dd>
            </div>
            <div class="space-y-0.5 px-5 py-3.5 sm:px-6">
              <dt class="text-xs font-medium text-ink-muted">Lazer</dt>
              <dd class="text-sm font-semibold leading-[1.35] text-ink">
                Lazer completo
              </dd>
            </div>
          </dl>
        </article>
      </section>
    }
  `,
})
export class LaunchExplorerComponent {
  readonly launch: Lancamento | undefined = LANCAMENTOS[0];
}
