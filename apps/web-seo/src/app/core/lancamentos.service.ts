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
import { FirebaseService } from './firebase.service';
import {
  LANCAMENTOS,
  type Lancamento,
  type LaunchDocItem,
  type LaunchMediaItem,
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

const LAUNCHES_COLLECTION = 'launches';
const FIRESTORE_READ_TIMEOUT_MS = 3500;

const LAUNCHES_LIST_STATE_KEY = makeStateKey<Lancamento[]>(
  'terraco:firestore:launches:list'
);

function launchDetailStateKey(slug: string) {
  return makeStateKey<Lancamento | null>(
    `terraco:firestore:launches:detail:${slug}`
  );
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Firestore read timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

function serializeTimestamp(value: unknown): string | null | undefined {
  if (value === null || value === undefined) {
    return value as null | undefined;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: unknown }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return undefined;
}

function normalizeLancamento(
  slug: string,
  raw: Record<string, unknown>
): Lancamento {
  const corCapaRaw = raw['corCapa'];
  const corCapa: Lancamento['corCapa'] =
    corCapaRaw === 'moss' || corCapaRaw === 'ipe' || corCapaRaw === 'guava'
      ? corCapaRaw
      : 'moss';

  return {
    slug: typeof raw['slug'] === 'string' && raw['slug'] ? raw['slug'] : slug,
    nome: String(raw['nome'] ?? ''),
    construtora: String(raw['construtora'] ?? ''),
    tagline: String(raw['tagline'] ?? ''),
    bairro: String(raw['bairro'] ?? ''),
    cidade: String(raw['cidade'] ?? ''),
    uf: String(raw['uf'] ?? ''),
    endereco: String(raw['endereco'] ?? ''),
    badge: String(raw['badge'] ?? 'Lançamento'),
    tags: Array.isArray(raw['tags']) ? raw['tags'].map(String) : [],
    quartos: String(raw['quartos'] ?? ''),
    metragem: String(raw['metragem'] ?? ''),
    tipologias: String(raw['tipologias'] ?? ''),
    vagas: String(raw['vagas'] ?? ''),
    ...(typeof raw['precoAPartirDe'] === 'number'
      ? { precoAPartirDe: raw['precoAPartirDe'] }
      : {}),
    ...(typeof raw['entrega'] === 'string' ? { entrega: raw['entrega'] } : {}),
    resumo: String(raw['resumo'] ?? ''),
    corCapa,
    imagem: String(raw['imagem'] ?? ''),
    imagemWidth:
      typeof raw['imagemWidth'] === 'number' ? raw['imagemWidth'] : 1024,
    imagemHeight:
      typeof raw['imagemHeight'] === 'number' ? raw['imagemHeight'] : 614,
    imagemAlt: String(raw['imagemAlt'] ?? ''),
    diferenciais: Array.isArray(raw['diferenciais'])
      ? raw['diferenciais'].map(String)
      : [],
    whatsappMensagem: String(raw['whatsappMensagem'] ?? ''),
    ...(Array.isArray(raw['galeria'])
      ? { galeria: raw['galeria'] as LaunchMediaItem[] }
      : {}),
    ...(typeof raw['bookUrl'] === 'string' ? { bookUrl: raw['bookUrl'] } : {}),
    ...(Array.isArray(raw['plantasUrls'])
      ? { plantasUrls: raw['plantasUrls'] as LaunchDocItem[] }
      : {}),
    ...(typeof raw['published'] === 'boolean'
      ? { published: raw['published'] }
      : {}),
    ...(typeof raw['order'] === 'number' ? { order: raw['order'] } : {}),
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
  private readonly initialData =
    inject(LANCAMENTOS_DATA_SOURCE, { optional: true }) ?? LANCAMENTOS;

  readonly lancamentos = signal<Lancamento[]>(this.initialData);
  readonly isLoadingList = signal<boolean>(false);
  readonly isLoadingDetail = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly activeFilter = signal<string>('Todos');

  readonly suggestions = computed<string[]>(() => {
    const items = this.lancamentos();
    if (items.length === 0) {
      return SEARCH_SUGGESTIONS;
    }
    return Array.from(
      new Set([
        ...items.map((item) => item.bairro),
        ...items.map((item) => item.nome),
        ...items.flatMap((item) => item.tags),
      ])
    );
  });

  readonly quickNeighborhoods = computed<string[]>(() => {
    const items = this.lancamentos();
    if (items.length === 0) {
      return QUICK_NEIGHBORHOODS;
    }
    return Array.from(new Set(items.map((item) => item.bairro)));
  });

  readonly filteredLancamentos = computed(() =>
    filterLancamentos(this.searchQuery(), this.activeFilter(), this.lancamentos())
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
      }
      this.listLoaded = true;
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
      }
      this.listLoaded = true;
      return this.lancamentos();
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
    this.activeFilter.set(filter);
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

      return this.commitListResult(
        items.length > 0 ? items : this.initialData
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
      return this.commitDetailResult(slug, fallback);
    } finally {
      this.isLoadingDetail.set(false);
    }
  }

  private commitListResult(items: Lancamento[]): Lancamento[] {
    this.lancamentos.set(items);
    for (const item of items) {
      this.detailCache.set(item.slug, item);
    }
    this.listLoaded = true;

    if (isPlatformServer(this.platformId)) {
      this.transferState.set(LAUNCHES_LIST_STATE_KEY, items);
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
