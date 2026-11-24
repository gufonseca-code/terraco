import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  computed,
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
import { FavoritesTrayComponent } from './components/launches/favorites-tray.component';
import { FavoritesService } from './core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FavoritesTrayComponent],
  template: `
    @if (isNavigating()) {
      <div
        role="progressbar"
        aria-label="Carregando página"
        animate.enter="terraco-chip-enter"
        animate.leave="terraco-chip-leave"
        class="terraco-skeleton pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-accent"
      ></div>
    }
    <router-outlet />
    @defer (when hasFavorites()) {
      <app-favorites-tray />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly favoritesService = inject(FavoritesService);

  readonly isNavigating = signal(false);
  readonly hasFavorites = computed(
    () => this.favoritesService.favorites().length > 0
  );

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
