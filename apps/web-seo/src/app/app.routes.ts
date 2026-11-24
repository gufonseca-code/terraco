import { inject } from '@angular/core';
import { type ResolveFn, type Routes } from '@angular/router';
import { type Lancamento, LancamentosService } from './core';
import { HomePageComponent } from './pages/home.page';
import { LancamentosPageComponent } from './pages/lancamentos.page';
import { LancamentoDetailPageComponent } from './pages/lancamento-detail.page';
import { BairroDetailPageComponent } from './pages/bairro-detail.page';
import { NotFoundPageComponent } from './pages/not-found.page';

const lancamentosListResolver: ResolveFn<Lancamento[]> = () =>
  inject(LancamentosService).loadLancamentos();

const lancamentoDetailResolver: ResolveFn<Lancamento | undefined> = (route) => {
  const slug = route.paramMap.get('slug') ?? '';
  return inject(LancamentosService).loadBySlug(slug);
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
    component: LancamentosPageComponent,
    resolve: {
      lancamentos: lancamentosListResolver,
    },
  },
  {
    path: 'lancamentos/:slug',
    component: LancamentoDetailPageComponent,
    resolve: {
      lancamento: lancamentoDetailResolver,
    },
  },
  {
    path: 'bairros/:slug',
    component: BairroDetailPageComponent,
    resolve: {
      lancamentos: lancamentosListResolver,
    },
  },
  {
    path: '**',
    component: NotFoundPageComponent,
  },
];
