#!/usr/bin/env node
/**
 * Terraço Static Catalog -> Cloud Firestore Migration & Seed Script
 *
 * Reads the seed catalog from `scripts/seed-launches.json`,
 * merges public WebP & PDF URLs from `scripts/media-manifest.json` (when enabled
 * or uploaded), validates that ONLY texts, metadata, and public URLs are stored
 * (never base64/binary blobs), and idempotently upserts `launches/{slug}`.
 *
 * Usage:
 *   node scripts/migrate-launches-to-firestore.mjs --dry-run
 *   node scripts/migrate-launches-to-firestore.mjs --emulator
 *   node scripts/migrate-launches-to-firestore.mjs --use-storage-urls
 *   node scripts/migrate-launches-to-firestore.mjs --project terraco-a5ff7 --database "(default)"
 */

import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const CATALOG_PATH = path.join(ROOT_DIR, 'scripts/seed-launches.json');
const MANIFEST_PATH = path.join(ROOT_DIR, 'scripts/media-manifest.json');
const COLLECTION_NAME = 'launches';

function parseArgs(argv) {
  const args = {
    dryRun: false,
    emulator: false,
    useStorageUrls: false,
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || '',
    databaseId: process.env.FIRESTORE_DATABASE_ID || '(default)',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--dry-run') args.dryRun = true;
    else if (token === '--emulator') args.emulator = true;
    else if (token === '--use-storage-urls') args.useStorageUrls = true;
    else if (token === '--project' && argv[i + 1]) args.projectId = argv[++i];
    else if (token === '--database' && argv[i + 1]) args.databaseId = argv[++i];
  }

  return args;
}

async function resolveProjectId(explicitProjectId) {
  if (explicitProjectId) return explicitProjectId;
  const firebasercPath = path.join(ROOT_DIR, '.firebaserc');
  if (existsSync(firebasercPath)) {
    const rc = JSON.parse(await readFile(firebasercPath, 'utf8'));
    if (rc?.projects?.default) return rc.projects.default;
  }
  throw new Error('Could not resolve Firebase projectId. Pass --project or set FIREBASE_PROJECT_ID.');
}

async function loadMediaManifest() {
  if (!existsSync(MANIFEST_PATH)) return null;
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
  } catch {
    return null;
  }
}

function assertNoBinaryOrBase64(value, fieldPath) {
  if (value === null || value === undefined) return;
  if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
    throw new Error(`Binary payload forbidden in Firestore at "${fieldPath}"`);
  }
  if (typeof value === 'string') {
    if (/^data:[^;]+;base64,/i.test(value.trim())) {
      throw new Error(`Base64 data URI forbidden in Firestore at "${fieldPath}"`);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, idx) => assertNoBinaryOrBase64(item, `${fieldPath}[${idx}]`));
    return;
  }
  if (typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      assertNoBinaryOrBase64(v, `${fieldPath}.${k}`);
    }
  }
}

function stripUndefined(obj) {
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

function ensureWebpUrl(url, slug) {
  if (!url || typeof url !== 'string') {
    throw new Error(`Launch "${slug}" is missing a valid "imagem" URL.`);
  }
  // Check pathname (ignoring query params like ?alt=media)
  const pathname = url.split('?')[0];
  const decodedPathname = decodeURIComponent(pathname);
  if (!decodedPathname.toLowerCase().endsWith('.webp')) {
    throw new Error(
      `Launch "${slug}" image "${url}" is not .webp. Run "npm run media:optimize" first.`
    );
  }
  return url;
}

function buildLaunchDocument(raw, index, mediaEntry, useStorageUrls) {
  const slug = String(raw.slug || '').trim();
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    throw new Error(`Invalid launch slug: "${raw.slug}"`);
  }

  const coverFromManifest = useStorageUrls && mediaEntry?.cover ? mediaEntry.cover : null;
  const imagem = ensureWebpUrl(coverFromManifest?.publicUrl ?? raw.imagem, slug);
  const imagemWidth = coverFromManifest?.width ?? raw.imagemWidth;
  const imagemHeight = coverFromManifest?.height ?? raw.imagemHeight;

  const galeria =
    useStorageUrls && Array.isArray(mediaEntry?.gallery) && mediaEntry.gallery.length > 0
      ? mediaEntry.gallery.map((g, i) => ({
          url: ensureWebpUrl(g.publicUrl, slug),
          alt: `${raw.nome} — foto ${i + 1}`,
          width: g.width,
          height: g.height,
        }))
      : undefined;

  const bookUrl = useStorageUrls && mediaEntry?.bookUrl ? mediaEntry.bookUrl : undefined;
  const plantasUrls =
    useStorageUrls && Array.isArray(mediaEntry?.plantasUrls) && mediaEntry.plantasUrls.length > 0
      ? mediaEntry.plantasUrls
      : undefined;

  const doc = stripUndefined({
    slug,
    nome: raw.nome,
    construtora: raw.construtora,
    tagline: raw.tagline,
    bairro: raw.bairro,
    cidade: raw.cidade,
    uf: raw.uf,
    endereco: raw.endereco,
    badge: raw.badge,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    quartos: raw.quartos,
    metragem: raw.metragem,
    tipologias: raw.tipologias,
    vagas: raw.vagas,
    precoAPartirDe: typeof raw.precoAPartirDe === 'number' ? raw.precoAPartirDe : undefined,
    entrega: raw.entrega,
    resumo: raw.resumo,
    corCapa: raw.corCapa,
    imagem,
    imagemWidth,
    imagemHeight,
    imagemAlt: raw.imagemAlt,
    diferenciais: Array.isArray(raw.diferenciais) ? raw.diferenciais : [],
    whatsappMensagem: raw.whatsappMensagem,
    galeria,
    bookUrl,
    plantasUrls,
    published: true,
    order: index,
  });

  assertNoBinaryOrBase64(doc, `${COLLECTION_NAME}/${slug}`);
  return doc;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const projectId = await resolveProjectId(args.projectId);

  if (args.emulator && !process.env.FIRESTORE_EMULATOR_HOST) {
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  }

  const launches = JSON.parse(await readFile(CATALOG_PATH, 'utf8'));
  if (!Array.isArray(launches) || launches.length === 0) {
    throw new Error(`No launches found in ${CATALOG_PATH}`);
  }

  const manifest = await loadMediaManifest();
  const shouldUseStorageUrls =
    args.useStorageUrls || (manifest && manifest.mode && manifest.mode !== 'local');

  const docs = launches.map((item, idx) => {
    const mediaEntry = manifest?.launches?.[item.slug] ?? null;
    return buildLaunchDocument(item, idx, mediaEntry, Boolean(shouldUseStorageUrls));
  });

  console.log(
    `[firestore:seed] Prepared ${docs.length} launch document(s) for project "${projectId}" (database: ${args.databaseId}, storageUrls: ${Boolean(shouldUseStorageUrls)}).`
  );

  if (args.dryRun) {
    console.log('[firestore:seed] DRY-RUN mode — no writes performed. Payloads:');
    for (const doc of docs) {
      console.log(`  -> ${COLLECTION_NAME}/${doc.slug}`);
      console.log(JSON.stringify(doc, null, 2));
    }
    return;
  }

  if (getApps().length === 0) {
    initializeApp({
      projectId,
      ...(process.env.FIRESTORE_EMULATOR_HOST ? {} : { credential: applicationDefault() }),
    });
  }

  const db =
    args.databaseId && args.databaseId !== '(default)'
      ? getFirestore(undefined, args.databaseId)
      : getFirestore();

  const batch = db.batch();
  for (const doc of docs) {
    const ref = db.collection(COLLECTION_NAME).doc(doc.slug);
    batch.set(
      ref,
      {
        ...doc,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  await batch.commit();
  const target = process.env.FIRESTORE_EMULATOR_HOST
    ? `emulator (${process.env.FIRESTORE_EMULATOR_HOST})`
    : `production (${projectId}/${args.databaseId})`;
  console.log(
    `[firestore:seed] Successfully upserted ${docs.length} document(s) to ${COLLECTION_NAME} in ${target}: ${docs.map((d) => d.slug).join(', ')}`
  );
}

main().catch((err) => {
  console.error('[firestore:seed] Fatal error:', err);
  process.exit(1);
});
