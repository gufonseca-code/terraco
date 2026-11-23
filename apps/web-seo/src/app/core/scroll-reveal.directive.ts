import { isPlatformBrowser } from '@angular/common';
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
 * Reveals below-the-fold elements smoothly on scroll in the browser while
 * keeping SSR/prerendered HTML immediately visible for SEO and crawlers.
 */
@Directive({
  selector: '[appScrollReveal]',
})
export class ScrollRevealDirective {
  readonly revealDelayMs = input<number>(0);

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    let observer: IntersectionObserver | null = null;
    this.destroyRef.onDestroy(() => observer?.disconnect());

    afterNextRender(() => {
      const node = this.el.nativeElement;
      const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      if (reducedMotion || typeof IntersectionObserver === 'undefined') {
        return;
      }

      if (node.getBoundingClientRect().top < window.innerHeight * 0.96) {
        return;
      }

      node.classList.add('terraco-scroll-pending');

      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) {
            return;
          }

          const delay = this.revealDelayMs();
          if (delay > 0) {
            node.style.transitionDelay = `${delay}ms`;
          }

          node.classList.remove('terraco-scroll-pending');
          node.classList.add('terraco-scroll-visible');
          observer?.disconnect();
          observer = null;
        },
        {
          threshold: 0.12,
          rootMargin: '0px 0px -32px 0px',
        }
      );

      observer.observe(node);
    });
  }
}
