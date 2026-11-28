import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import {
  provideClientHydration,
  withEventReplay,
  withIncrementalHydration,
} from '@angular/platform-browser';
import { IMAGE_LOADER, type ImageLoaderConfig } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { provideTerracoWebMcpTools } from './core/webmcp.providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withViewTransitions({
        onViewTransitionCreated: ({ transition }) => {
          if (typeof document !== 'undefined' && document.hidden) {
            transition.skipTransition();
            return;
          }
          if (
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ) {
            transition.skipTransition();
            return;
          }
          transition.ready.catch(() => {});
          transition.finished.catch(() => {});
        },
      }),
      withComponentInputBinding(),
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
    ),
    provideClientHydration(withEventReplay(), withIncrementalHydration()),
    provideHttpClient(withFetch()),
    {
      provide: IMAGE_LOADER,
      useValue: (config: ImageLoaderConfig) => {
        if (
          config.width &&
          config.width <= 400 &&
          /^\/images\/lancamentos\/(prime-view|horizon|upside-square)\/cover\.webp$/.test(
            config.src,
          )
        ) {
          return config.src.replace(/\/cover\.webp$/, '/cover-400w.webp');
        }
        return config.src;
      },
    },
    provideTerracoWebMcpTools(),
  ],
};
