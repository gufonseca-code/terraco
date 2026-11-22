import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChildren,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LancamentosService } from '../../core';
import { FavoriteButtonComponent } from './favorite-button.component';
import { LaunchCardSkeletonComponent } from './launch-skeleton.component';

@Component({
  selector: 'app-launch-explorer',
  imports: [RouterLink, FavoriteButtonComponent, LaunchCardSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isLoading() && lancamentos().length === 0) {
      <section
        aria-labelledby="lancamentos-heading"
        class="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16"
      >
        <h1
          id="lancamentos-heading"
          animate.enter="terraco-reveal"
          class="font-display text-[clamp(1.75rem,3vw,2.25rem)] font-medium leading-[1.12] tracking-[-0.02em] text-ink text-balance"
        >
          Lançamentos
        </h1>

        <div class="mt-8 grid gap-8">
          <app-launch-card-skeleton />
        </div>
      </section>
    } @else if (lancamentos().length > 0) {
      <section
        aria-labelledby="lancamentos-heading"
        class="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16"
      >
        <h1
          id="lancamentos-heading"
          animate.enter="terraco-reveal"
          class="font-display text-[clamp(1.75rem,3vw,2.25rem)] font-medium leading-[1.12] tracking-[-0.02em] text-ink text-balance"
        >
          Lançamentos
        </h1>

        <div class="mt-8 grid gap-8">
          @for (launch of lancamentos(); track launch.slug) {
            <article
              [attr.id]="$first ? 'resultados-lancamentos' : null"
              animate.enter="terraco-reveal-delay"
              class="terraco-plate max-w-xl overflow-hidden rounded-lg bg-elevated scroll-mt-24"
            >
              <div
                [class.terraco-skeleton]="!isImageLoaded(launch.slug)"
                class="relative aspect-[16/10] overflow-hidden rounded-t-[calc(var(--radius-lg)-1px)] border-b border-border-subtle bg-surface"
              >
                <a
                  [routerLink]="['/lancamentos', launch.slug]"
                  class="relative z-[1] block h-full w-full overflow-hidden rounded-t-[calc(var(--radius-lg)-1px)]"
                  [attr.aria-label]="'Conhecer ' + launch.nome"
                >
                  <img
                    #coverImg
                    data-testid="lancamentos-cover-image"
                    [attr.data-slug]="launch.slug"
                    [src]="launch.imagem"
                    [alt]="launch.imagemAlt"
                    [width]="launch.imagemWidth"
                    [height]="launch.imagemHeight"
                    [style.view-transition-name]="'launch-image-' + launch.slug"
                    (load)="markImageLoaded(launch.slug)"
                    (error)="markImageLoaded(launch.slug)"
                    fetchpriority="high"
                    decoding="async"
                    class="h-full w-full rounded-t-[calc(var(--radius-lg)-1px)] object-cover object-center"
                  />
                </a>

                <div class="absolute top-3.5 right-3.5 z-10 sm:top-4 sm:right-4">
                  <app-favorite-button [slug]="launch.slug" [nome]="launch.nome" />
                </div>
              </div>

              <div
                class="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-5"
              >
                <div class="space-y-1">
                  <p class="text-[13px] font-normal text-ink-muted">
                    {{ launch.bairro }}, {{ launch.cidade }}
                  </p>
                  <h2
                    [style.view-transition-name]="'launch-title-' + launch.slug"
                    class="font-display text-[1.375rem] font-medium leading-[1.18] tracking-[-0.015em] text-ink text-balance sm:text-2xl"
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
                  class="terraco-btn terraco-btn-moss inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-pill bg-brand px-5 py-2.5 text-sm font-medium leading-[1.35] text-ink-inverse hover:bg-brand-hover"
                >
                  Conhecer lançamento
                </a>
              </div>

              <dl
                class="grid grid-cols-1 divide-y divide-border-subtle border-t border-border-subtle bg-surface/45 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
              >
                <div class="space-y-0.5 px-5 py-3 sm:px-6">
                  <dt class="text-[13px] font-normal text-ink-muted">Dormitórios</dt>
                  <dd
                    class="text-[15px] font-normal leading-[1.4] text-ink tabular-nums"
                  >
                    {{ launch.quartos }}
                  </dd>
                </div>
                <div class="space-y-0.5 px-5 py-3 sm:px-6">
                  <dt class="text-[13px] font-normal text-ink-muted">Metragem</dt>
                  <dd
                    class="text-[15px] font-normal leading-[1.4] text-ink tabular-nums"
                  >
                    {{ launch.metragem }}
                  </dd>
                </div>
                <div class="space-y-0.5 px-5 py-3 sm:px-6">
                  <dt class="text-[13px] font-normal text-ink-muted">Lazer</dt>
                  <dd class="text-[15px] font-normal leading-[1.4] text-ink">
                    Lazer completo
                  </dd>
                </div>
              </dl>
            </article>
          }
        </div>
      </section>
    }
  `,
})
export class LaunchExplorerComponent {
  private readonly lancamentosService = inject(LancamentosService);
  readonly lancamentos = this.lancamentosService.lancamentos;
  readonly isLoading = this.lancamentosService.isLoadingList;
  private readonly loadedSlugs = signal<ReadonlySet<string>>(new Set());
  private readonly coverImages =
    viewChildren<ElementRef<HTMLImageElement>>('coverImg');

  constructor() {
    afterNextRender(() => {
      for (const ref of this.coverImages()) {
        const el = ref.nativeElement;
        const slug = el.dataset['slug'];
        if (slug && el.complete && el.naturalWidth > 0) {
          this.markImageLoaded(slug);
        }
      }
    });
  }

  isImageLoaded(slug: string): boolean {
    return this.loadedSlugs().has(slug);
  }

  markImageLoaded(slug: string): void {
    this.loadedSlugs.update((current) => {
      if (current.has(slug)) {
        return current;
      }
      const next = new Set(current);
      next.add(slug);
      return next;
    });
  }
}
