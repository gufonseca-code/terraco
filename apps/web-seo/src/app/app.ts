import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    @if (isNavigating()) {
      <div
        role="progressbar"
        aria-label="Carregando página"
        animate.enter="terraco-chip-enter"
        animate.leave="terraco-chip-leave"
        class="terraco-skeleton pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-brand/25"
      ></div>
    }
    <router-outlet />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  readonly isNavigating = signal(false);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    let showTimer: ReturnType<typeof setTimeout> | null = null;
    const clearTimer = () => {
      if (showTimer !== null) {
        clearTimeout(showTimer);
        showTimer = null;
      }
    };

    this.destroyRef.onDestroy(clearTimer);

    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationStart) {
        clearTimer();
        // Delay 120ms so instant prerendered/cached navigations never flash.
        showTimer = setTimeout(() => {
          this.isNavigating.set(true);
        }, 120);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        clearTimer();
        this.isNavigating.set(false);
      }
    });
  }
}

export { AppComponent as App };
