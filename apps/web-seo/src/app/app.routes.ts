import { inject } from '@angular/core';
import { type ResolveFn, type Routes } from '@angular/router';
import {
  type BairroGuide,
  BairrosService,
  type Lancamento,
  LancamentosService,
} from './core';
import { HomePageComponent } from './pages/home.page';

const lancamentosListResolver: ResolveFn<Lancamento[]> = () =>
  inject(LancamentosService).loadLancamentos();

const lancamentoDetailResolver: ResolveFn<Lancamento | undefined> = (route) => {
  const slug = route.paramMap.get('slug') ?? '';
  return inject(LancamentosService).loadBySlug(slug);
};

const bairrosListResolver: ResolveFn<BairroGuide[]> = () =>
  inject(BairrosService).loadBairros();

const bairroDetailResolver: ResolveFn<BairroGuide | undefined> = (route) => {
  const slug = route.paramMap.get('slug') ?? '';
  return inject(BairrosService).loadBySlug(slug);
};

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    resolve: {
      lancamentos: lancamentosListResolver,
    },
  },
  {
    path: 'lancamentos',
    loadComponent: () =>
      import('./pages/lancamentos.page').then((m) => m.LancamentosPageComponent),
    resolve: {
      lancamentos: lancamentosListResolver,
    },
  },
  {
    path: 'lancamentos/:slug',
    loadComponent: () =>
      import('./pages/lancamento-detail.page').then(
        (m) => m.LancamentoDetailPageComponent
      ),
    resolve: {
      lancamento: lancamentoDetailResolver,
    },
  },
  {
    path: 'bairros',
    loadComponent: () =>
      import('./pages/bairros.page').then((m) => m.BairrosPageComponent),
    resolve: {
      lancamentos: lancamentosListResolver,
      bairros: bairrosListResolver,
    },
  },
  {
    path: 'bairros/:slug',
    loadComponent: () =>
      import('./pages/bairro-detail.page').then(
        (m) => m.BairroDetailPageComponent
      ),
    resolve: {
      lancamentos: lancamentosListResolver,
      bairro: bairroDetailResolver,
    },
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found.page').then((m) => m.NotFoundPageComponent),
  },
];
