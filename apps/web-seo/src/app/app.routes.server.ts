import { inject } from '@angular/core';
import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
import { BairrosService, LancamentosService } from './core';

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
    fallback: PrerenderFallback.Server,
    async getPrerenderParams() {
      const lancamentosService = inject(LancamentosService);
      const items = await lancamentosService.loadLancamentos();
      return items.map((item) => ({ slug: item.slug }));
    },
  },
  {
    path: 'bairros',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'bairros/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Server,
    async getPrerenderParams() {
      const bairrosService = inject(BairrosService);
      const items = await bairrosService.loadBairros();
      return items.map((bairro) => ({ slug: bairro.slug }));
    },
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
