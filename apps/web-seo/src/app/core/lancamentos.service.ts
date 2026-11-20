import { Injectable, InjectionToken, computed, inject, signal } from '@angular/core';
import {
  LANCAMENTOS,
  Lancamento,
  QUICK_NEIGHBORHOODS,
  SEARCH_SUGGESTIONS,
  buildWhatsAppUrl,
  filterLancamentos,
  getLancamentoBySlug,
} from './lancamentos.data';
import { FLUTTER_APP_URL } from './site.config';

export const LANCAMENTOS_DATA_SOURCE = new InjectionToken<Lancamento[]>(
  'terraco.lancamentos.dataSource',
  {
    providedIn: 'root',
    factory: () => LANCAMENTOS,
  }
);

@Injectable({ providedIn: 'root' })
export class LancamentosService {
  private readonly initialData =
    inject(LANCAMENTOS_DATA_SOURCE, { optional: true }) ?? LANCAMENTOS;

  readonly lancamentos = signal<Lancamento[]>(this.initialData);
  readonly searchQuery = signal<string>('');
  readonly activeFilter = signal<string>('Todos');
  readonly suggestions = signal<string[]>(SEARCH_SUGGESTIONS);
  readonly quickNeighborhoods = signal<string[]>(QUICK_NEIGHBORHOODS);

  readonly filteredLancamentos = computed(() =>
    filterLancamentos(this.searchQuery(), this.activeFilter(), this.lancamentos())
  );

  setSearchQuery(q: string): void {
    this.searchQuery.set(q);
  }

  setActiveFilter(filter: string): void {
    this.activeFilter.set(filter);
  }

  getBySlug(slug: string): Lancamento | undefined {
    return (
      this.lancamentos().find((item) => item.slug === slug) ??
      getLancamentoBySlug(slug)
    );
  }

  buildWhatsAppUrl(mensagem: string): string {
    return buildWhatsAppUrl(mensagem);
  }

  buildFlutterAppDeepLink(
    path: string,
    params?: Record<string, string>
  ): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${FLUTTER_APP_URL}${normalizedPath}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }
    return url.toString();
  }
}
