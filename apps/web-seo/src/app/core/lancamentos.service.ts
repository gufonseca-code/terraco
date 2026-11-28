import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import {
  Injectable,
  InjectionToken,
  PLATFORM_ID,
  TransferState,
  computed,
  inject,
  makeStateKey,
  signal,
} from '@angular/core';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import {
  FIRESTORE_READ_TIMEOUT_MS,
  pickNonEmptyArray,
  pickNonEmptyString,
  serializeTimestamp,
  withTimeout,
} from './firestore.utils';
import { normalizeSearchText } from './format.utils';
import { FirebaseService } from './firebase.service';
import {
  LANCAMENTOS,
  type Lancamento,
  type LaunchDocItem,
  type LaunchEntornoItem,
  type LaunchFloorPlan,
  type LaunchMediaItem,
  type LaunchPilarGroup,
  QUICK_NEIGHBORHOODS,
  SEARCH_SUGGESTIONS,
  buildWhatsAppUrl,
  filterLancamentos,
  getLancamentoBySlug,
} from './lancamentos.data';
import { FLUTTER_APP_URL } from './site.config';

export interface ServerLaunchesReader {
  loadList(): Promise<Lancamento[]>;
  loadBySlug(slug: string): Promise<Lancamento | undefined>;
}

export const SERVER_LAUNCHES_READER = new InjectionToken<ServerLaunchesReader>(
  'terraco.server.launchesReader'
);

export const LANCAMENTOS_DATA_SOURCE = new InjectionToken<Lancamento[]>(
  'terraco.lancamentos.dataSource',
  {
    providedIn: 'root',
    factory: () => LANCAMENTOS,
  }
);

const LAUNCHES_COLLECTION = 'launches';

const LAUNCHES_LIST_STATE_KEY = makeStateKey<Lancamento[]>(
  'terraco:firestore:launches:list'
);

function launchDetailStateKey(slug: string) {
  return makeStateKey<Lancamento | null>(
    `terraco:firestore:launches:detail:${slug}`
  );
}

export function normalizeLancamento(
  slug: string,
  raw: Record<string, unknown>
): Lancamento {
  const resolvedSlug =
    typeof raw['slug'] === 'string' && raw['slug'] ? raw['slug'] : slug;
  const canonical = getLancamentoBySlug(resolvedSlug);

  const corCapaRaw = raw['corCapa'];
  const corCapa: Lancamento['corCapa'] =
    corCapaRaw === 'moss' || corCapaRaw === 'ipe' || corCapaRaw === 'guava'
      ? corCapaRaw
      : (canonical?.corCapa ?? 'moss');

  const construtora = pickNonEmptyString(
    raw['construtora'],
    canonical?.construtora
  ).trim();
  const estrutura = pickNonEmptyString(raw['estrutura'], canonical?.estrutura);
  const projetos = pickNonEmptyString(raw['projetos'], canonical?.projetos);
  const registro = pickNonEmptyString(raw['registro'], canonical?.registro);
  const entrega = pickNonEmptyString(raw['entrega'], canonical?.entrega);
  const bookUrl = pickNonEmptyString(raw['bookUrl'], canonical?.bookUrl);

  const pilares = pickNonEmptyArray<LaunchPilarGroup>(
    raw['pilares'],
    canonical?.pilares
  );
  const entorno = pickNonEmptyArray<LaunchEntornoItem>(
    raw['entorno'],
    canonical?.entorno
  );
  const condicoesEspeciais = pickNonEmptyArray<string>(
    raw['condicoesEspeciais'],
    canonical?.condicoesEspeciais
  );
  const galeria = pickNonEmptyArray<LaunchMediaItem>(
    raw['galeria'],
    canonical?.galeria
  );
  const plantas = pickNonEmptyArray<LaunchFloorPlan>(
    raw['plantas'],
    canonical?.plantas
  );
  const plantasUrls = pickNonEmptyArray<LaunchDocItem>(
    raw['plantasUrls'],
    canonical?.plantasUrls
  );

  const precoAPartirDe =
    typeof raw['precoAPartirDe'] === 'number'
      ? raw['precoAPartirDe']
      : canonical?.precoAPartirDe;
  const entradaMinima =
    typeof raw['entradaMinima'] === 'number'
      ? raw['entradaMinima']
      : canonical?.entradaMinima;

  return {
    slug: resolvedSlug,
    nome: pickNonEmptyString(raw['nome'], canonical?.nome),
    ...(construtora ? { construtora } : {}),
    tagline: pickNonEmptyString(raw['tagline'], canonical?.tagline),
    bairro: pickNonEmptyString(raw['bairro'], canonical?.bairro),
    cidade: pickNonEmptyString(raw['cidade'], canonical?.cidade),
    uf: pickNonEmptyString(raw['uf'], canonical?.uf),
    endereco: pickNonEmptyString(raw['endereco'], canonical?.endereco),
    ...(estrutura ? { estrutura } : {}),
    ...(projetos ? { projetos } : {}),
    ...(registro ? { registro } : {}),
    badge: pickNonEmptyString(raw['badge'], canonical?.badge || 'Lançamento'),
    tags: pickNonEmptyArray<string>(raw['tags'], canonical?.tags).map(String),
    quartos: pickNonEmptyString(raw['quartos'], canonical?.quartos),
    metragem: pickNonEmptyString(raw['metragem'], canonical?.metragem),
    tipologias: pickNonEmptyString(raw['tipologias'], canonical?.tipologias),
    vagas: pickNonEmptyString(raw['vagas'], canonical?.vagas),
    ...(typeof precoAPartirDe === 'number' ? { precoAPartirDe } : {}),
    ...(typeof entradaMinima === 'number' ? { entradaMinima } : {}),
    ...(entrega ? { entrega } : {}),
    resumo: pickNonEmptyString(raw['resumo'], canonical?.resumo),
    corCapa,
    imagem: pickNonEmptyString(raw['imagem'], canonical?.imagem),
    imagemWidth:
      typeof raw['imagemWidth'] === 'number'
        ? raw['imagemWidth']
        : (canonical?.imagemWidth ?? 1024),
    imagemHeight:
      typeof raw['imagemHeight'] === 'number'
        ? raw['imagemHeight']
        : (canonical?.imagemHeight ?? 614),
    imagemAlt: pickNonEmptyString(raw['imagemAlt'], canonical?.imagemAlt),
    diferenciais: pickNonEmptyArray<string>(
      raw['diferenciais'],
      canonical?.diferenciais
    ).map(String),
    ...(pilares.length > 0 ? { pilares } : {}),
    ...(entorno.length > 0 ? { entorno } : {}),
    ...(condicoesEspeciais.length > 0 ? { condicoesEspeciais } : {}),
    whatsappMensagem: pickNonEmptyString(
      raw['whatsappMensagem'],
      canonical?.whatsappMensagem
    ),
    ...(galeria.length > 0 ? { galeria } : {}),
    ...(plantas.length > 0 ? { plantas } : {}),
    ...(bookUrl ? { bookUrl } : {}),
    ...(plantasUrls.length > 0 ? { plantasUrls } : {}),
    ...(typeof raw['published'] === 'boolean'
      ? { published: raw['published'] }
      : canonical?.published !== undefined
        ? { published: canonical.published }
        : {}),
    ...(typeof raw['order'] === 'number'
      ? { order: raw['order'] }
      : canonical?.order !== undefined
        ? { order: canonical.order }
        : {}),
    ...(raw['updatedAt'] !== undefined
      ? { updatedAt: serializeTimestamp(raw['updatedAt']) }
      : {}),
  };
}

@Injectable({ providedIn: 'root' })
export class LancamentosService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly transferState = inject(TransferState);
  private readonly firebase = inject(FirebaseService);
  private readonly serverReader = inject(SERVER_LAUNCHES_READER, {
    optional: true,
  });
  private readonly initialData =
    inject(LANCAMENTOS_DATA_SOURCE, { optional: true }) ?? LANCAMENTOS;

  readonly lancamentos = signal<Lancamento[]>(this.initialData);
  readonly isLoadingList = signal<boolean>(false);
  readonly isLoadingDetail = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly activeFilter = signal<string>('Todos');
  readonly tipologiaFilter = signal<string>('Todas');
  readonly objetivoFilter = signal<string | null>(null);

  readonly suggestions = computed<string[]>(() => {
    const items = this.lancamentos();
    if (items.length === 0) {
      return SEARCH_SUGGESTIONS;
    }
    return Array.from(
      new Set(
        [
          ...items.map((item) => item.bairro.trim()),
          ...items.map((item) => item.nome.trim()),
          ...items.map((item) => item.construtora?.trim() ?? ''),
          ...items.flatMap((item) => item.tags.map((tag) => tag.trim())),
        ].filter(Boolean)
      )
    );
  });

  readonly quickNeighborhoods = computed<string[]>(() => {
    const items = this.lancamentos();
    if (items.length === 0) {
      return QUICK_NEIGHBORHOODS;
    }
    return Array.from(
      new Set(items.map((item) => item.bairro.trim()).filter(Boolean))
    );
  });

  readonly availableFilters = computed<string[]>(() => [
    'Todos',
    ...this.quickNeighborhoods(),
  ]);

  readonly hasActiveFilters = computed<boolean>(
    () =>
      this.searchQuery().trim().length > 0 ||
      normalizeSearchText(this.activeFilter()) !== 'todos'
  );

  readonly filteredLancamentos = computed(() =>
    filterLancamentos(
      this.searchQuery(),
      this.activeFilter(),
      this.lancamentos(),
      this.tipologiaFilter(),
      this.objetivoFilter()
    )
  );

  private listLoaded = false;
  private listInFlight: Promise<Lancamento[]> | null = null;
  private readonly detailCache = new Map<string, Lancamento | null>();
  private readonly detailInFlight = new Map<
    string,
    Promise<Lancamento | undefined>
  >();

  constructor() {
    // Hydrate immediately from SSR TransferState on browser with 0 Firestore reads.
    if (
      isPlatformBrowser(this.platformId) &&
      this.transferState.hasKey(LAUNCHES_LIST_STATE_KEY)
    ) {
      const transferred = this.transferState.get(
        LAUNCHES_LIST_STATE_KEY,
        this.initialData
      );
      this.transferState.remove(LAUNCHES_LIST_STATE_KEY);
      if (transferred.length > 0) {
        this.lancamentos.set(transferred);
        for (const item of transferred) {
          this.detailCache.set(item.slug, item);
        }
        this.listLoaded = true;
      }
    }
  }

  /**
   * Loads published launches from Cloud Firestore using a single `getDocs` call
   * (no `onSnapshot` listeners) with Angular TransferState + in-memory cache
   * to guarantee 0 duplicate reads on browser hydration.
   */
  async loadLancamentos(): Promise<Lancamento[]> {
    if (this.listLoaded) {
      return this.lancamentos();
    }

    if (
      isPlatformBrowser(this.platformId) &&
      this.transferState.hasKey(LAUNCHES_LIST_STATE_KEY)
    ) {
      const transferred = this.transferState.get(
        LAUNCHES_LIST_STATE_KEY,
        this.initialData
      );
      this.transferState.remove(LAUNCHES_LIST_STATE_KEY);
      if (transferred.length > 0) {
        this.lancamentos.set(transferred);
        for (const item of transferred) {
          this.detailCache.set(item.slug, item);
        }
        this.listLoaded = true;
        return this.lancamentos();
      }
    }

    if (this.listInFlight) {
      return this.listInFlight;
    }

    const request = this.fetchLancamentosFromFirestore().finally(() => {
      this.listInFlight = null;
    });
    this.listInFlight = request;
    return request;
  }

  /**
   * Loads a single launch by slug using `getDoc` (1 document read max, no
   * `onSnapshot`), checking in-memory cache and SSR TransferState first so
   * browser hydration performs 0 Firestore reads.
   */
  async loadBySlug(slug: string): Promise<Lancamento | undefined> {
    if (!slug) {
      return undefined;
    }

    if (this.detailCache.has(slug)) {
      return this.detailCache.get(slug) ?? undefined;
    }

    if (this.listLoaded) {
      const fromList = this.lancamentos().find((item) => item.slug === slug);
      this.detailCache.set(slug, fromList ?? null);
      return fromList;
    }

    const stateKey = launchDetailStateKey(slug);
    if (
      isPlatformBrowser(this.platformId) &&
      this.transferState.hasKey(stateKey)
    ) {
      const transferred = this.transferState.get(stateKey, null);
      this.transferState.remove(stateKey);
      this.detailCache.set(slug, transferred);
      if (transferred) {
        this.upsertIntoSignal(transferred);
      }
      return transferred ?? undefined;
    }

    const existingInFlight = this.detailInFlight.get(slug);
    if (existingInFlight) {
      return existingInFlight;
    }

    const request = this.fetchLaunchBySlugFromFirestore(slug).finally(() => {
      this.detailInFlight.delete(slug);
    });
    this.detailInFlight.set(slug, request);
    return request;
  }

  setSearchQuery(q: string): void {
    this.searchQuery.set(q);
  }

  setActiveFilter(filter: string): void {
    const normalized = filter.trim();
    this.activeFilter.set(normalized.length > 0 ? normalized : 'Todos');
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.activeFilter.set('Todos');
  }

  setTipologiaFilter(tipologia: string): void {
    this.tipologiaFilter.set(tipologia || 'Todas');
  }

  setObjetivoFilter(objetivo: string | null): void {
    const trimmed = objetivo?.trim() ?? '';
    this.objetivoFilter.set(trimmed.length > 0 ? trimmed : null);
  }

  getBySlug(slug: string): Lancamento | undefined {
    if (!slug) {
      return undefined;
    }
    if (this.detailCache.has(slug)) {
      return this.detailCache.get(slug) ?? undefined;
    }
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

  private async fetchLancamentosFromFirestore(): Promise<Lancamento[]> {
    if (isPlatformServer(this.platformId) && this.serverReader) {
      this.isLoadingList.set(true);
      try {
        const items = await withTimeout(
          this.serverReader.loadList(),
          FIRESTORE_READ_TIMEOUT_MS
        );
        return this.commitListResult(
          items.length > 0 ? items : this.initialData
        );
      } catch {
        // Fall through to Web SDK / initialData fallback if Admin ADC is unavailable locally.
      } finally {
        this.isLoadingList.set(false);
      }
    }

    const db = this.firebase.getFirestore();
    if (!db) {
      return this.commitListResult(this.initialData);
    }

    this.isLoadingList.set(true);
    try {
      const colRef = collection(db, LAUNCHES_COLLECTION);
      let items: Lancamento[];

      try {
        const orderedQuery = query(
          colRef,
          where('published', '==', true),
          orderBy('order', 'asc')
        );
        const snap = await withTimeout(
          getDocs(orderedQuery),
          FIRESTORE_READ_TIMEOUT_MS
        );
        items = snap.docs.map((docSnap) =>
          normalizeLancamento(
            docSnap.id,
            docSnap.data() as Record<string, unknown>
          )
        );
      } catch {
        // Fallback when composite index is still building: single collection read + in-memory filter/sort.
        const snap = await withTimeout(
          getDocs(colRef),
          FIRESTORE_READ_TIMEOUT_MS
        );
        items = snap.docs
          .map((docSnap) =>
            normalizeLancamento(
              docSnap.id,
              docSnap.data() as Record<string, unknown>
            )
          )
          .filter((item) => item.published !== false)
          .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      }

      const mergedBySlug = new Map<string, Lancamento>();
      for (const fallbackItem of this.initialData) {
        if (fallbackItem.published !== false) {
          mergedBySlug.set(fallbackItem.slug, fallbackItem);
        }
      }
      for (const remoteItem of items) {
        mergedBySlug.set(remoteItem.slug, remoteItem);
      }
      const merged = Array.from(mergedBySlug.values()).sort(
        (a, b) => (a.order ?? 999) - (b.order ?? 999)
      );

      return this.commitListResult(
        merged.length > 0 ? merged : this.initialData
      );
    } catch {
      return this.commitListResult(this.initialData);
    } finally {
      this.isLoadingList.set(false);
    }
  }

  private async fetchLaunchBySlugFromFirestore(
    slug: string
  ): Promise<Lancamento | undefined> {
    if (isPlatformServer(this.platformId) && this.serverReader) {
      this.isLoadingDetail.set(true);
      try {
        const item = await withTimeout(
          this.serverReader.loadBySlug(slug),
          FIRESTORE_READ_TIMEOUT_MS
        );
        return this.commitDetailResult(slug, item ?? null);
      } catch {
        // Fall through to Web SDK / initialData fallback if Admin ADC is unavailable locally.
      } finally {
        this.isLoadingDetail.set(false);
      }
    }

    const db = this.firebase.getFirestore();
    if (!db) {
      const fallback =
        this.initialData.find((item) => item.slug === slug) ?? null;
      return this.commitDetailResult(slug, fallback);
    }

    this.isLoadingDetail.set(true);
    try {
      const docRef = doc(db, LAUNCHES_COLLECTION, slug);
      const snap = await withTimeout(
        getDoc(docRef),
        FIRESTORE_READ_TIMEOUT_MS
      );

      if (!snap.exists()) {
        // Check static fallback only if the catalog has not been seeded yet for a known static slug.
        const staticFallback =
          this.initialData.find((item) => item.slug === slug) ?? null;
        return this.commitDetailResult(slug, staticFallback);
      }

      const raw = snap.data() as Record<string, unknown>;
      if (raw['published'] === false) {
        return this.commitDetailResult(slug, null);
      }

      const normalized = normalizeLancamento(snap.id, raw);
      return this.commitDetailResult(slug, normalized);
    } catch {
      const fallback =
        this.initialData.find((item) => item.slug === slug) ?? null;
      return fallback
        ? this.commitDetailResult(slug, fallback)
        : undefined;
    } finally {
      this.isLoadingDetail.set(false);
    }
  }

  private commitListResult(items: Lancamento[]): Lancamento[] {
    this.lancamentos.set(items);
    for (const item of items) {
      this.detailCache.set(item.slug, item);
    }

    if (items.length > 0) {
      this.listLoaded = true;
      if (isPlatformServer(this.platformId)) {
        this.transferState.set(LAUNCHES_LIST_STATE_KEY, items);
      }
    }

    return items;
  }

  private commitDetailResult(
    slug: string,
    item: Lancamento | null
  ): Lancamento | undefined {
    this.detailCache.set(slug, item);
    if (item) {
      this.upsertIntoSignal(item);
    }

    if (isPlatformServer(this.platformId)) {
      this.transferState.set(launchDetailStateKey(slug), item);
    }

    return item ?? undefined;
  }

  private upsertIntoSignal(item: Lancamento): void {
    this.lancamentos.update((current) => {
      const idx = current.findIndex((existing) => existing.slug === item.slug);
      if (idx === -1) {
        return [...current, item];
      }
      const next = [...current];
      next[idx] = item;
      return next;
    });
  }
}
