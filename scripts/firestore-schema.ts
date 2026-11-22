/**
 * Canonical Firestore data model & Storage path contract for Terraço Platform.
 *
 * Keep synchronized with:
 * - `firestore.rules` (security validation)
 * - `apps/web-seo/src/app/core/lancamentos.data.ts` (Angular SSR vitrine)
 * - `scripts/migrate-launches-to-firestore.mjs` (seed/migration pipeline)
 */

export const FIRESTORE_COLLECTIONS = {
  LAUNCHES: 'launches',
  LEADS: 'leads',
} as const;

export const FREE_TIER_STORAGE_REGIONS = [
  'us-central1',
  'us-west1',
  'us-east1',
] as const;

export interface LaunchMediaItem {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface LaunchDocItem {
  titulo: string;
  url: string;
}

/**
 * Stored at `launches/{slug}` (document ID === `slug`).
 * Contains ONLY texts, numeric/boolean metadata, and public HTTPS/relative URLs.
 * Never store base64 data URIs or binary blobs in Firestore.
 */
export interface LaunchDocument {
  slug: string;
  nome: string;
  construtora: string;
  tagline: string;
  bairro: string;
  cidade: string;
  uf: string;
  endereco: string;
  badge: string;
  tags: string[];
  quartos: string;
  metragem: string;
  tipologias: string;
  vagas: string;
  precoAPartirDe?: number;
  entrega?: string;
  resumo: string;
  corCapa: 'moss' | 'ipe' | 'guava';
  imagem: string;
  imagemWidth: number;
  imagemHeight: number;
  imagemAlt: string;
  diferenciais: string[];
  whatsappMensagem: string;
  galeria?: LaunchMediaItem[];
  bookUrl?: string;
  plantasUrls?: LaunchDocItem[];
  published: boolean;
  order: number;
  updatedAt?: unknown;
}

/**
 * Stored at `leads/{leadId}` (auto-generated ID).
 * Write-only from public clients (`allow create` with strict validation;
 * `allow read, update, delete: if false`).
 */
export interface LeadCreatePayload {
  name: string;
  email: string;
  phone: string;
  launchSlug: string;
  message?: string;
  source?: string;
  createdAt: unknown;
}

export const LEAD_ALLOWED_FIELDS = [
  'name',
  'email',
  'phone',
  'launchSlug',
  'message',
  'source',
  'createdAt',
] as const;

export const LEAD_REQUIRED_FIELDS = [
  'name',
  'email',
  'phone',
  'launchSlug',
  'createdAt',
] as const;

export function buildStorageLaunchImagePath(slug: string, filename: string): string {
  return `launches/${slug}/images/${filename}`;
}

export function buildStorageLaunchDocPath(slug: string, filename: string): string {
  return `launches/${slug}/docs/${filename}`;
}

export function buildStorageSiteImagePath(filename: string): string {
  return `site/images/${filename}`;
}
