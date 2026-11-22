import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { type Lancamento } from '../../core';
import { FavoriteButtonComponent } from './favorite-button.component';
import { ImageLightboxComponent } from './image-lightbox.component';

@Component({
  selector: 'app-launch-card',
  imports: [RouterLink, FavoriteButtonComponent, ImageLightboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block h-full',
  },
  template: `
    <article
      [attr.id]="cardId()"
      animate.enter="terraco-reveal-delay"
      class="terraco-plate flex h-full flex-col overflow-hidden rounded-lg bg-elevated scroll-mt-24"
    >
      <div
        [class.terraco-skeleton]="!imageLoaded()"
        class="relative h-60 w-full shrink-0 overflow-hidden rounded-t-[calc(var(--radius-lg)-1px)] border-b border-border-subtle bg-surface sm:h-64"
      >
        <button
          #coverTrigger
          type="button"
          data-testid="lancamentos-cover-trigger"
          (click)="openLightbox()"
          class="terraco-card-media-trigger relative z-[1] block h-full w-full overflow-hidden rounded-t-[calc(var(--radius-lg)-1px)] text-left cursor-zoom-in"
          [attr.aria-label]="'Ampliar foto de ' + launch().nome"
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
            class="terraco-card-media-img h-full w-full rounded-t-[calc(var(--radius-lg)-1px)] object-cover object-[center_25%]"
          />

          <span
            aria-hidden="true"
            class="terraco-card-media-scrim pointer-events-none absolute inset-0 bg-ink/18 opacity-0"
          ></span>

          <span
            aria-hidden="true"
            class="terraco-card-media-hint pointer-events-none absolute bottom-3.5 left-3.5 inline-flex items-center gap-1.5 rounded-pill border border-ink-inverse/20 bg-ink/75 px-3 py-1.5 text-[13px] font-medium leading-none text-ink-inverse opacity-0 backdrop-blur-xs"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-3.5 w-3.5"
            >
              <path d="M15 3h6v6" />
              <path d="M9 21H3v-6" />
              <path d="m21 3-7 7" />
              <path d="m3 21 7-7" />
            </svg>
            <span>Ampliar</span>
          </span>
        </button>

        <div class="absolute top-3.5 right-3.5 z-10 sm:top-4 sm:right-4">
          <app-favorite-button [slug]="launch().slug" [nome]="launch().nome" />
        </div>
      </div>

      <div
        class="flex flex-1 flex-col justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5"
      >
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
              class="transition-colors duration-150 hover:text-brand"
            >
              {{ launch().nome }}
            </a>
          </h2>
        </div>

        <div>
          <a
            [routerLink]="['/lancamentos', launch().slug]"
            class="terraco-btn terraco-btn-moss inline-flex min-h-[44px] w-full items-center justify-center rounded-pill bg-brand px-5 py-2.5 text-sm font-medium leading-[1.35] text-ink-inverse hover:bg-brand-hover sm:w-auto"
          >
            Conhecer lançamento
          </a>
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

    @if (isLightboxOpen()) {
      <app-image-lightbox
        [src]="launch().imagem"
        [alt]="launch().imagemAlt"
        [title]="launch().nome"
        [originElement]="coverTrigger"
        (closed)="closeLightbox()"
      />
    }
  `,
})
export class LaunchCardComponent {
  readonly launch = input.required<Lancamento>();
  readonly priority = input<boolean>(false);
  readonly cardId = input<string | null>(null);

  readonly imageLoaded = signal<boolean>(false);
  readonly isLightboxOpen = signal<boolean>(false);
  private readonly coverImg =
    viewChild<ElementRef<HTMLImageElement>>('coverImg');
  protected readonly coverTrigger =
    viewChild<ElementRef<HTMLButtonElement>>('coverTrigger');

  readonly lazerLabel = computed(() => {
    const lazerTag = this.launch().tags.find((tag) =>
      tag.toLowerCase().includes('lazer')
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

  openLightbox(): void {
    this.isLightboxOpen.set(true);
  }

  closeLightbox(): void {
    this.isLightboxOpen.set(false);
    this.coverTrigger()?.nativeElement.focus();
  }
}
