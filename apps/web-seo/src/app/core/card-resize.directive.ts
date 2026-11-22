import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Directive,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  inject,
  input,
} from '@angular/core';

/**
 * Reusable native card-resize animation directive inspired by Transitions.dev.
 * Pairs `.terraco-resize` CSS transitions (for explicit width/height bindings)
 * with a `ResizeObserver` + Web Animations API tween (300ms, cubic-bezier(0.22, 1, 0.36, 1))
 * so responsive grid/content resizes animate smoothly too.
 */
@Directive({
  selector: '[appCardResize]',
  host: {
    class: 'terraco-resize',
  },
})
export class CardResizeDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  readonly resizeDuration = input<number>(300);
  readonly resizeEasing = input<string>('cubic-bezier(0.22, 1, 0.36, 1)');

  private lastWidth = 0;
  private lastHeight = 0;
  private isAnimating = false;
  private activeAnimation: Animation | null = null;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    afterNextRender(() => {
      const el = this.elementRef.nativeElement;
      if (typeof ResizeObserver === 'undefined') {
        return;
      }

      const initialRect = el.getBoundingClientRect();
      this.lastWidth = initialRect.width;
      this.lastHeight = initialRect.height;

      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry || this.isAnimating) {
          return;
        }

        const nextWidth = entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
        const nextHeight = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;

        const widthChanged = Math.abs(nextWidth - this.lastWidth) > 1.5;
        const heightChanged = Math.abs(nextHeight - this.lastHeight) > 1.5;

        if (!widthChanged && !heightChanged) {
          this.lastWidth = nextWidth;
          this.lastHeight = nextHeight;
          return;
        }

        if (this.prefersReducedMotion() || typeof el.animate !== 'function') {
          this.lastWidth = nextWidth;
          this.lastHeight = nextHeight;
          return;
        }

        const fromWidth = this.lastWidth;
        const fromHeight = this.lastHeight;

        if (fromWidth <= 0 || fromHeight <= 0) {
          this.lastWidth = nextWidth;
          this.lastHeight = nextHeight;
          return;
        }

        this.activeAnimation?.cancel();
        this.isAnimating = true;

        const anim = el.animate(
          [
            {
              width: `${fromWidth.toFixed(1)}px`,
              height: `${fromHeight.toFixed(1)}px`,
            },
            {
              width: `${nextWidth.toFixed(1)}px`,
              height: `${nextHeight.toFixed(1)}px`,
            },
          ],
          {
            duration: this.resizeDuration(),
            easing: this.resizeEasing(),
          }
        );
        this.activeAnimation = anim;

        const finalize = () => {
          this.isAnimating = false;
          this.activeAnimation = null;
          const settled = el.getBoundingClientRect();
          this.lastWidth = settled.width;
          this.lastHeight = settled.height;
        };

        anim.addEventListener('finish', finalize, { once: true });
        anim.addEventListener('cancel', finalize, { once: true });
      });

      observer.observe(el);

      this.destroyRef.onDestroy(() => {
        this.activeAnimation?.cancel();
        observer.disconnect();
      });
    });
  }

  private prefersReducedMotion(): boolean {
    const view = this.document.defaultView;
    return Boolean(
      view?.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    );
  }
}
