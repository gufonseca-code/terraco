import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'lancamentos',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'lancamentos/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return [{ slug: 'prime-view' }];
    },
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
