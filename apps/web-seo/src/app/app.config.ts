import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  PreloadAllModules,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withPreloading,
  withViewTransitions,
} from '@angular/router';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { FirebaseService } from './core';

function getSnapshotPath(snapshot: ActivatedRouteSnapshot): string {
  return snapshot.pathFromRoot
    .flatMap((route) => route.url.map((segment) => segment.path))
    .join('/');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withViewTransitions({
        onViewTransitionCreated: ({ transition, from, to }) => {
          if (
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ) {
            transition.skipTransition();
            return;
          }

          if (getSnapshotPath(from) === getSnapshotPath(to)) {
            transition.skipTransition();
          }
        },
      }),
      withComponentInputBinding(),
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
      withPreloading(PreloadAllModules),
    ),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideAppInitializer(() => {
      // Browser-guarded inside FirebaseService (no-op on SSR server).
      inject(FirebaseService).initAppCheck();
    }),
  ],
};
