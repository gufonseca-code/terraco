import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import {
  Injectable,
  InjectionToken,
  PLATFORM_ID,
  TransferState,
  inject,
  makeStateKey,
  signal,
} from '@angular/core';
import {
  BAIRROS_BH,
  type BairroFaqItem,
  type BairroGuide,
  type BairroMedia,
  getBairroBySlug,
} from './bairros.data';
import {
  FIRESTORE_READ_TIMEOUT_MS,
  pickNonEmptyArray,
  pickNonEmptyString,
  serializeTimestamp,
  withTimeout,
} from './firestore.utils';
import { FirebaseService } from './firebase.service';

export const BAIRROS_DATA_SOURCE = new InjectionToken<readonly BairroGuide[]>(
  'terraco.bairros.dataSource',
  {
    providedIn: 'root',
    factory: () => BAIRROS_BH,
  }
);

const BAIRROS_COLLECTION = 'bairros';

const BAIRROS_LIST_STATE_KEY = makeStateKey<BairroGuide[]>(
  'terraco:firestore:bairros:list'
);

function bairroDetailStateKey(slug: string) {
  return makeStateKey<BairroGuide | null>(
    `terraco:firestore:bairros:detail:${slug}`
  );
}

function normalizeBairro(
  slug: string,
  raw: Record<string, unknown>
): BairroGuide {
  const resolvedSlug =
    typeof raw['slug'] === 'string' && raw['slug'] ? raw['slug'] : slug;
  const canonical = getBairroBySlug(resolvedSlug);

  const rawMedia = raw['media'];
  const media: BairroMedia | undefined =
    rawMedia &&
    typeof rawMedia === 'object' &&
    typeof (rawMedia as Record<string, unknown>)['url'] === 'string' &&
    ((rawMedia as Record<string, unknown>)['url'] as string).trim().length > 0
      ? (rawMedia as BairroMedia)
      : canonical?.media;

  const nearbyBairros = pickNonEmptyArray<string>(
    raw['nearbyBairros'],
    canonical?.nearbyBairros
  );

  return {
    slug: resolvedSlug,
    nome: pickNonEmptyString(raw['nome'], canonical?.nome),
    regiao: pickNonEmptyString(raw['regiao'], canonical?.regiao),
    cidade: pickNonEmptyString(raw['cidade'], canonical?.cidade),
    uf: pickNonEmptyString(raw['uf'], canonical?.uf),
    tituloSeo: pickNonEmptyString(raw['tituloSeo'], canonical?.tituloSeo),
    descricaoSeo: pickNonEmptyString(
      raw['descricaoSeo'],
      canonical?.descricaoSeo
    ),
    resumo: pickNonEmptyString(raw['resumo'], canonical?.resumo),
    mobilidade: pickNonEmptyString(raw['mobilidade'], canonical?.mobilidade),
    servicos: pickNonEmptyString(raw['servicos'], canonical?.servicos),
    perfilImoveis: pickNonEmptyString(
      raw['perfilImoveis'],
      canonical?.perfilImoveis
    ),
    matchBairros: pickNonEmptyArray<string>(
      raw['matchBairros'],
      canonical?.matchBairros
    ).map(String),
    ...(nearbyBairros.length > 0 ? { nearbyBairros } : {}),
    ...(media ? { media } : {}),
    faqs: pickNonEmptyArray<BairroFaqItem>(raw['faqs'], canonical?.faqs),
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
export class BairrosService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly transferState = inject(TransferState);
  private readonly firebase = inject(FirebaseService);
  private readonly initialData = [
    ...(inject(BAIRROS_DATA_SOURCE, { optional: true }) ?? BAIRROS_BH),
  ];

  readonly bairros = signal<BairroGuide[]>(this.initialData);

  private listLoaded = false;
  private listInFlight: Promise<BairroGuide[]> | null = null;
  private readonly detailCache = new Map<string, BairroGuide | null>();
  private readonly detailInFlight = new Map<
    string,
    Promise<BairroGuide | undefined>
  >();

  constructor() {
    if (
      isPlatformBrowser(this.platformId) &&
      this.transferState.hasKey(BAIRROS_LIST_STATE_KEY)
    ) {
      const transferred = this.transferState.get(
        BAIRROS_LIST_STATE_KEY,
        this.initialData
      );
      this.transferState.remove(BAIRROS_LIST_STATE_KEY);
      if (transferred.length > 0) {
        this.bairros.set(transferred);
        for (const item of transferred) {
          this.detailCache.set(item.slug, item);
        }
      }
      this.listLoaded = true;
    }
  }

  async loadBairros(): Promise<BairroGuide[]> {
    if (this.listLoaded) {
      return this.bairros();
    }

    if (
      isPlatformBrowser(this.platformId) &&
      this.transferState.hasKey(BAIRROS_LIST_STATE_KEY)
    ) {
      const transferred = this.transferState.get(
        BAIRROS_LIST_STATE_KEY,
        this.initialData
      );
      this.transferState.remove(BAIRROS_LIST_STATE_KEY);
      if (transferred.length > 0) {
        this.bairros.set(transferred);
        for (const item of transferred) {
          this.detailCache.set(item.slug, item);
        }
      }
      this.listLoaded = true;
      return this.bairros();
    }

    if (this.listInFlight) {
      return this.listInFlight;
    }

    // On browser navigation, return static/cached bairros immediately so /bairros
    // resolves without blocking on a Firestore network round-trip, then refresh
    // in the background.
    if (isPlatformBrowser(this.platformId) && this.initialData.length > 0) {
      this.listLoaded = true;
      void this.fetchBairrosFromFirestore();
      return this.bairros();
    }

    const request = this.fetchBairrosFromFirestore().finally(() => {
      this.listInFlight = null;
    });
    this.listInFlight = request;
    return request;
  }

  async loadBySlug(slug: string): Promise<BairroGuide | undefined> {
    const normalized = slug.trim().toLowerCase();
    if (!normalized) {
      return undefined;
    }

    if (this.detailCache.has(normalized)) {
      return this.detailCache.get(normalized) ?? undefined;
    }

    if (this.listLoaded) {
      const fromList = this.bairros().find((item) => item.slug === normalized);
      this.detailCache.set(normalized, fromList ?? null);
      return fromList;
    }

    const stateKey = bairroDetailStateKey(normalized);
    if (
      isPlatformBrowser(this.platformId) &&
      this.transferState.hasKey(stateKey)
    ) {
      const transferred = this.transferState.get(stateKey, null);
      this.transferState.remove(stateKey);
      this.detailCache.set(normalized, transferred);
      if (transferred) {
        this.upsertIntoSignal(transferred);
      }
      return transferred ?? undefined;
    }

    // On browser navigation, return known static bairro immediately without
    // blocking route resolution on Firestore, then refresh in the background.
    if (isPlatformBrowser(this.platformId)) {
      const staticMatch = this.bairros().find(
        (item) => item.slug === normalized
      );
      if (staticMatch) {
        this.detailCache.set(normalized, staticMatch);
        void this.fetchBairroBySlugFromFirestore(normalized);
        return staticMatch;
      }
    }

    const existingInFlight = this.detailInFlight.get(normalized);
    if (existingInFlight) {
      return existingInFlight;
    }

    const request = this.fetchBairroBySlugFromFirestore(normalized).finally(
      () => {
        this.detailInFlight.delete(normalized);
      }
    );
    this.detailInFlight.set(normalized, request);
    return request;
  }

  getBySlug(slug: string): BairroGuide | undefined {
    const normalized = slug.trim().toLowerCase();
    if (!normalized) {
      return undefined;
    }
    if (this.detailCache.has(normalized)) {
      return this.detailCache.get(normalized) ?? undefined;
    }
    return (
      this.bairros().find((item) => item.slug === normalized) ??
      getBairroBySlug(normalized)
    );
  }

  private async fetchBairrosFromFirestore(): Promise<BairroGuide[]> {
    const db = await this.firebase.getFirestore();
    if (!db) {
      return this.commitListResult(this.initialData);
    }

    try {
      const { collection, getDocs, orderBy, query, where } = await import(
        'firebase/firestore'
      );
      const colRef = collection(db, BAIRROS_COLLECTION);
      let items: BairroGuide[];

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
          normalizeBairro(
            docSnap.id,
            docSnap.data() as Record<string, unknown>
          )
        );
      } catch {
        const snap = await withTimeout(
          getDocs(colRef),
          FIRESTORE_READ_TIMEOUT_MS
        );
        items = snap.docs
          .map((docSnap) =>
            normalizeBairro(
              docSnap.id,
              docSnap.data() as Record<string, unknown>
            )
          )
          .filter((item) => item.published !== false)
          .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      }

      const mergedBySlug = new Map<string, BairroGuide>();
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
    }
  }

  private async fetchBairroBySlugFromFirestore(
    slug: string
  ): Promise<BairroGuide | undefined> {
    const db = await this.firebase.getFirestore();
    if (!db) {
      const fallback =
        this.initialData.find((item) => item.slug === slug) ?? null;
      return this.commitDetailResult(slug, fallback);
    }

    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const docRef = doc(db, BAIRROS_COLLECTION, slug);
      const snap = await withTimeout(
        getDoc(docRef),
        FIRESTORE_READ_TIMEOUT_MS
      );

      if (!snap.exists()) {
        const staticFallback =
          this.initialData.find((item) => item.slug === slug) ?? null;
        return this.commitDetailResult(slug, staticFallback);
      }

      const raw = snap.data() as Record<string, unknown>;
      if (raw['published'] === false) {
        return this.commitDetailResult(slug, null);
      }

      const normalized = normalizeBairro(snap.id, raw);
      return this.commitDetailResult(slug, normalized);
    } catch {
      const fallback =
        this.initialData.find((item) => item.slug === slug) ?? null;
      return this.commitDetailResult(slug, fallback);
    }
  }

  private commitListResult(items: BairroGuide[]): BairroGuide[] {
    this.bairros.set(items);
    for (const item of items) {
      this.detailCache.set(item.slug, item);
    }
    this.listLoaded = true;

    if (isPlatformServer(this.platformId)) {
      this.transferState.set(BAIRROS_LIST_STATE_KEY, items);
    }

    return items;
  }

  private commitDetailResult(
    slug: string,
    item: BairroGuide | null
  ): BairroGuide | undefined {
    this.detailCache.set(slug, item);
    if (item) {
      this.upsertIntoSignal(item);
    }

    if (isPlatformServer(this.platformId)) {
      this.transferState.set(bairroDetailStateKey(slug), item);
    }

    return item ?? undefined;
  }

  private upsertIntoSignal(item: BairroGuide): void {
    this.bairros.update((current) => {
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
