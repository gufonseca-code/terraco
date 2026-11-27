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
const BAIRROS_PATH = path.join(ROOT_DIR, 'scripts/seed-bairros.json');
const MANIFEST_PATH = path.join(ROOT_DIR, 'scripts/media-manifest.json');
const COLLECTION_NAME = 'launches';
const BAIRROS_COLLECTION_NAME = 'bairros';

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

function buildFirebaseStoragePublicUrl(bucket, storagePath) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(storagePath)}?alt=media`;
}

function buildManifestLocalPathIndex(manifest) {
  const index = new Map();
  if (!manifest?.launches) return index;
  for (const [slug, entry] of Object.entries(manifest.launches)) {
    const records = [
      entry?.cover,
      ...(Array.isArray(entry?.gallery) ? entry.gallery : []),
      ...(Array.isArray(entry?.plantas) ? entry.plantas : []),
    ].filter(Boolean);
    for (const rec of records) {
      if (rec.localPath && rec.publicUrl) {
        index.set(rec.localPath, rec);
      } else if (rec.storagePath && rec.publicUrl) {
        const filename = path.posix.basename(rec.storagePath);
        index.set(`/images/lancamentos/${slug}/${filename}`, rec);
      }
    }
  }
  return index;
}

function resolveMediaUrl(localOrRemoteUrl, manifestIndex, bucket, useStorageUrls) {
  if (!localOrRemoteUrl || typeof localOrRemoteUrl !== 'string') {
    return { url: localOrRemoteUrl, record: null };
  }
  if (!useStorageUrls || /^https?:\/\//i.test(localOrRemoteUrl)) {
    return { url: localOrRemoteUrl, record: null };
  }

  const fromManifest = manifestIndex.get(localOrRemoteUrl);
  if (fromManifest?.publicUrl) {
    return { url: fromManifest.publicUrl, record: fromManifest };
  }

  const match = localOrRemoteUrl.match(/^\/images\/lancamentos\/([^/]+)\/(.+)$/);
  if (match && bucket) {
    const [, slug, filename] = match;
    const storagePath = `launches/${slug}/images/${filename.replace(/\//g, '-')}`;
    return {
      url: buildFirebaseStoragePublicUrl(bucket, storagePath),
      record: null,
    };
  }

  return { url: localOrRemoteUrl, record: null };
}

function buildLaunchDocument(raw, index, mediaEntry, manifestIndex, bucket, useStorageUrls) {
  const slug = String(raw.slug || '').trim();
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    throw new Error(`Invalid launch slug: "${raw.slug}"`);
  }

  const resolvedCover = resolveMediaUrl(raw.imagem, manifestIndex, bucket, useStorageUrls);
  const coverFromManifest =
    resolvedCover.record ?? (useStorageUrls && mediaEntry?.cover ? mediaEntry.cover : null);
  const imagem = ensureWebpUrl(
    resolvedCover.url ?? coverFromManifest?.publicUrl ?? raw.imagem,
    slug
  );
  const imagemWidth = coverFromManifest?.width ?? raw.imagemWidth;
  const imagemHeight = coverFromManifest?.height ?? raw.imagemHeight;

  const galeria = Array.isArray(raw.galeria)
    ? raw.galeria.map((g) => {
        const resolved = resolveMediaUrl(g.url, manifestIndex, bucket, useStorageUrls);
        return stripUndefined({
          url: ensureWebpUrl(resolved.url, slug),
          alt: g.alt,
          width: resolved.record?.width ?? g.width,
          height: resolved.record?.height ?? g.height,
        });
      })
    : [];

  const plantas = Array.isArray(raw.plantas)
    ? raw.plantas.map((p) => {
        const resolved = resolveMediaUrl(p.imagem, manifestIndex, bucket, useStorageUrls);
        return stripUndefined({
          ...p,
          imagem: ensureWebpUrl(resolved.url, slug),
          width: resolved.record?.width ?? p.width,
          height: resolved.record?.height ?? p.height,
        });
      })
    : [];

  const condicoesEspeciais = Array.isArray(raw.condicoesEspeciais)
    ? raw.condicoesEspeciais
    : [];

  const bookUrl = useStorageUrls && mediaEntry?.bookUrl ? mediaEntry.bookUrl : raw.bookUrl;
  const plantasUrls =
    useStorageUrls && Array.isArray(mediaEntry?.plantasUrls) && mediaEntry.plantasUrls.length > 0
      ? mediaEntry.plantasUrls
      : raw.plantasUrls;

  const doc = stripUndefined({
    slug,
    nome: raw.nome,
    construtora: raw.construtora ?? '',
    tagline: raw.tagline,
    bairro: raw.bairro,
    cidade: raw.cidade,
    uf: raw.uf,
    endereco: raw.endereco,
    estrutura: raw.estrutura,
    projetos: raw.projetos,
    registro: raw.registro,
    badge: raw.badge,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    quartos: raw.quartos,
    metragem: raw.metragem,
    tipologias: raw.tipologias,
    vagas: raw.vagas,
    precoAPartirDe: typeof raw.precoAPartirDe === 'number' ? raw.precoAPartirDe : undefined,
    entradaMinima: typeof raw.entradaMinima === 'number' ? raw.entradaMinima : undefined,
    entrega: raw.entrega,
    resumo: raw.resumo,
    corCapa: raw.corCapa,
    imagem,
    imagemWidth,
    imagemHeight,
    imagemAlt: raw.imagemAlt,
    diferenciais: Array.isArray(raw.diferenciais) ? raw.diferenciais : [],
    pilares: Array.isArray(raw.pilares) && raw.pilares.length > 0 ? raw.pilares : undefined,
    entorno: Array.isArray(raw.entorno) && raw.entorno.length > 0 ? raw.entorno : undefined,
    condicoesEspeciais: condicoesEspeciais.length > 0 ? condicoesEspeciais : undefined,
    whatsappMensagem: raw.whatsappMensagem,
    galeria,
    plantas,
    bookUrl,
    plantasUrls,
    published: raw.published ?? true,
    order: typeof raw.order === 'number' ? raw.order : index,
  });

  assertNoBinaryOrBase64(doc, `${COLLECTION_NAME}/${slug}`);
  return doc;
}

function buildBairroDocument(raw, index, manifestIndex, bucket, useStorageUrls) {
  const slug = String(raw.slug || '').trim().toLowerCase();
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    throw new Error(`Invalid bairro slug: "${raw.slug}"`);
  }

  let media = raw.media;
  if (media?.url) {
    const resolved = resolveMediaUrl(media.url, manifestIndex, bucket, useStorageUrls);
    media = stripUndefined({
      ...media,
      url: ensureWebpUrl(resolved.url, slug),
      width: resolved.record?.width ?? media.width,
      height: resolved.record?.height ?? media.height,
    });
  }

  const doc = stripUndefined({
    slug,
    nome: raw.nome,
    regiao: raw.regiao,
    cidade: raw.cidade,
    uf: raw.uf,
    tituloSeo: raw.tituloSeo,
    descricaoSeo: raw.descricaoSeo,
    resumo: raw.resumo,
    mobilidade: raw.mobilidade,
    servicos: raw.servicos,
    perfilImoveis: raw.perfilImoveis,
    matchBairros: Array.isArray(raw.matchBairros) ? raw.matchBairros : [],
    nearbyBairros:
      Array.isArray(raw.nearbyBairros) && raw.nearbyBairros.length > 0
        ? raw.nearbyBairros
        : undefined,
    media,
    faqs: Array.isArray(raw.faqs) ? raw.faqs : [],
    published: raw.published ?? true,
    order: typeof raw.order === 'number' ? raw.order : index,
  });

  assertNoBinaryOrBase64(doc, `${BAIRROS_COLLECTION_NAME}/${slug}`);
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
  const bucket = manifest?.bucket || `${projectId}.firebasestorage.app`;
  const manifestIndex = buildManifestLocalPathIndex(manifest);

  const docs = launches.map((item, idx) => {
    const mediaEntry = manifest?.launches?.[item.slug] ?? null;
    return buildLaunchDocument(
      item,
      idx,
      mediaEntry,
      manifestIndex,
      bucket,
      Boolean(shouldUseStorageUrls)
    );
  });

  const bairrosRaw = existsSync(BAIRROS_PATH)
    ? JSON.parse(await readFile(BAIRROS_PATH, 'utf8'))
    : [];
  const bairroDocs = Array.isArray(bairrosRaw)
    ? bairrosRaw.map((item, idx) =>
        buildBairroDocument(
          item,
          idx,
          manifestIndex,
          bucket,
          Boolean(shouldUseStorageUrls)
        )
      )
    : [];

  console.log(
    `[firestore:seed] Prepared ${docs.length} launch doc(s) and ${bairroDocs.length} bairro doc(s) for project "${projectId}" (database: ${args.databaseId}, storageUrls: ${Boolean(shouldUseStorageUrls)}, bucket: ${bucket}).`
  );

  if (args.dryRun) {
    console.log('[firestore:seed] DRY-RUN mode — no writes performed. Payloads:');
    for (const doc of docs) {
      console.log(`  -> ${COLLECTION_NAME}/${doc.slug} (imagem: ${doc.imagem}, galeria: ${doc.galeria?.length ?? 0}, plantas: ${doc.plantas?.length ?? 0})`);
    }
    for (const doc of bairroDocs) {
      console.log(`  -> ${BAIRROS_COLLECTION_NAME}/${doc.slug} (media: ${doc.media?.url ?? 'none'})`);
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
  for (const doc of bairroDocs) {
    const ref = db.collection(BAIRROS_COLLECTION_NAME).doc(doc.slug);
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
    `[firestore:seed] Successfully upserted ${docs.length} launch(es) and ${bairroDocs.length} bairro(s) in ${target}: launches=[${docs.map((d) => d.slug).join(', ')}], bairros=[${bairroDocs.map((d) => d.slug).join(', ')}]`
  );
}

main().catch((err) => {
  console.error('[firestore:seed] Fatal error:', err);
  process.exit(1);
});
