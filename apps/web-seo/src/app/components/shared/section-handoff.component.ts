import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  inject,
  input,
} from '@angular/core';

/**
 * Quiet, functional intra-page handoff link guiding the reader from the end of
 * one section straight to the next concrete section without fake scroll cues.
 */
@Component({
  selector: 'app-section-handoff',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-ink-muted">
      @if (prompt(); as promptText) {
        <span>{{ promptText }}</span>
      }
      <a
        [href]="'#' + targetId()"
        (click)="scrollToTarget($event)"
        class="terraco-link-underline group inline-flex min-h-[44px] items-center gap-1.5 font-medium text-brand transition-colors duration-150 hover:text-brand-hover focus-visible:text-brand-hover"
      >
        <span>{{ label() }}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:translate-y-0.5"
        >
          <path d="M10 4.5v11" />
          <path d="m5.5 11 4.5 4.5 4.5-4.5" />
        </svg>
      </a>
    </div>
  `,
})
export class SectionHandoffComponent {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  readonly prompt = input<string | null>(null);
  readonly label = input.required<string>();
  readonly targetId = input.required<string>();

  scrollToTarget(event: MouseEvent): void {
    event.preventDefault();
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const target = this.document.getElementById(this.targetId());
    if (!target) {
      return;
    }

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    target.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }
}
