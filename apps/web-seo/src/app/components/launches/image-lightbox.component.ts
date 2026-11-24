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
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import type { LaunchMediaItem } from '../../core';

@Component({
  selector: 'app-image-lightbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
  template: `
    @if (isOpen() && currentImage(); as media) {
      <div
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="dialogAriaLabel()"
        (click)="onBackdropClick($event)"
        class="fixed inset-0 z-50 flex flex-col items-center justify-between bg-ink/90 p-4 backdrop-blur-sm sm:p-6"
      >
        <div
          class="flex w-full max-w-5xl items-center justify-between gap-4"
        >
          <p
            class="text-sm font-normal text-ink-inverse/85 tabular-nums"
            aria-live="polite"
          >
            {{ currentIndex() + 1 }} / {{ totalImages() }}
          </p>

          <button
            #closeButton
            type="button"
            (click)="close()"
            aria-label="Fechar galeria"
            class="terraco-btn inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-pill border border-ink-inverse/20 bg-ink/60 px-3 text-[13px] font-medium text-ink-inverse hover:border-ink-inverse/40 hover:bg-ink"
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
        </div>

        <div
          (click)="onBackdropClick($event)"
          class="relative my-4 flex w-full max-w-5xl flex-1 items-center justify-center"
        >
          @if (hasMultiple()) {
            <button
              type="button"
              (click)="previous()"
              aria-label="Imagem anterior"
              class="terraco-btn absolute left-0 z-10 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-pill border border-ink-inverse/20 bg-ink/70 text-ink-inverse hover:border-ink-inverse/45 hover:bg-ink sm:left-2"
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
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          }

          <figure
            class="flex max-h-full max-w-full flex-col items-center justify-center px-12 sm:px-16"
          >
            <img
              [src]="media.url"
              [alt]="media.alt"
              [attr.width]="media.width ?? null"
              [attr.height]="media.height ?? null"
              decoding="async"
              class="max-h-[72vh] w-auto max-w-full rounded-md object-contain shadow-floating"
            />
          </figure>

          @if (hasMultiple()) {
            <button
              type="button"
              (click)="next()"
              aria-label="Próxima imagem"
              class="terraco-btn absolute right-0 z-10 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-pill border border-ink-inverse/20 bg-ink/70 text-ink-inverse hover:border-ink-inverse/45 hover:bg-ink sm:right-2"
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
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          }
        </div>

        <div class="w-full max-w-2xl text-center">
          @if (media.alt) {
            <p class="text-sm font-normal leading-[1.5] text-ink-inverse/90">
              {{ media.alt }}
            </p>
          }
        </div>
      </div>
    }
  `,
})
export class ImageLightboxComponent {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly images = input.required<readonly LaunchMediaItem[]>();
  readonly initialIndex = input<number>(0);
  readonly isOpen = input<boolean>(false);
  readonly closed = output<void>();

  readonly currentIndex = signal<number>(0);

  private readonly closeButton =
    viewChild<ElementRef<HTMLButtonElement>>('closeButton');

  readonly totalImages = computed(() => this.images().length);
  readonly hasMultiple = computed(() => this.totalImages() > 1);

  readonly currentImage = computed<LaunchMediaItem | null>(() => {
    const list = this.images();
    if (list.length === 0) return null;
    const idx = this.clampIndex(this.currentIndex(), list.length);
    return list[idx] ?? null;
  });

  readonly dialogAriaLabel = computed(() => {
    const alt = this.currentImage()?.alt;
    return alt ? `Galeria de imagens: ${alt}` : 'Galeria de imagens';
  });

  private previousOverflow = '';

  constructor() {
    effect(() => {
      if (!this.isOpen()) return;
      const total = this.images().length;
      this.currentIndex.set(this.clampIndex(this.initialIndex(), total));
    });

    effect(() => {
      if (!this.isBrowser) return;

      if (this.isOpen()) {
        this.previousOverflow = this.document.body.style.overflow;
        this.document.body.style.overflow = 'hidden';
        queueMicrotask(() => {
          this.closeButton()?.nativeElement.focus();
        });
      } else {
        this.document.body.style.overflow = this.previousOverflow;
      }
    });

    this.destroyRef.onDestroy(() => {
      if (this.isBrowser && this.isOpen()) {
        this.document.body.style.overflow = this.previousOverflow;
      }
    });
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.isOpen()) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.previous();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.next();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  previous(): void {
    const total = this.totalImages();
    if (total <= 1) return;
    this.currentIndex.update((index) => (index - 1 + total) % total);
  }

  next(): void {
    const total = this.totalImages();
    if (total <= 1) return;
    this.currentIndex.update((index) => (index + 1) % total);
  }

  close(): void {
    this.closed.emit();
  }

  private clampIndex(index: number, length: number): number {
    if (length <= 0) return 0;
    if (!Number.isFinite(index) || index < 0) return 0;
    if (index >= length) return length - 1;
    return Math.floor(index);
  }
}
