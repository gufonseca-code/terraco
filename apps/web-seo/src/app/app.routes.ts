import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home.page';
import { LancamentosPageComponent } from './pages/lancamentos.page';
import { LancamentoDetailPageComponent } from './pages/lancamento-detail.page';
import { NotFoundPageComponent } from './pages/not-found.page';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
  },
  {
    path: 'lancamentos',
    component: LancamentosPageComponent,
  },
  {
    path: 'lancamentos/:slug',
    component: LancamentoDetailPageComponent,
  },
  {
    path: '**',
    component: NotFoundPageComponent,
  },
];
