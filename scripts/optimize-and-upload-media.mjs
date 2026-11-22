#!/usr/bin/env node
/**
 * Terraço Media Optimization & Firebase Storage Upload Pipeline
 *
 * 1. Scans launch images (`apps/web-seo/public/images/lancamentos/**`),
 *    site images (`apps/web-seo/public/images/*`), and PDF books/plantas
 *    (`apps/web-seo/public/docs/**` and `assets/docs/**`).
 * 2. Converts all raster images (.jpg, .jpeg, .png, .avif, .tiff, .webp) to
 *    lean `.webp` using `sharp`.
 * 3. Uploads optimized `.webp` images and `.pdf` documents to Firebase Storage
 *    (free-tier eligible region: us-central1 / us-west1 / us-east1) and outputs
 *    public URLs into `scripts/media-manifest.json`.
 *
 * Usage:
 *   node scripts/optimize-and-upload-media.mjs --dry-run
 *   node scripts/optimize-and-upload-media.mjs --local-only
 *   node scripts/optimize-and-upload-media.mjs --emulator
 *   node scripts/optimize-and-upload-media.mjs --bucket terraco-a5ff7.firebasestorage.app
 */

import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const FREE_TIER_REGIONS = new Set(['us-central1', 'us-west1', 'us-east1']);
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tiff']);
const PDF_EXTENSION = '.pdf';

const LAUNCH_IMAGES_DIR = path.join(ROOT_DIR, 'apps/web-seo/public/images/lancamentos');
const SITE_IMAGES_DIR = path.join(ROOT_DIR, 'apps/web-seo/public/images');
const DOCS_SEARCH_DIRS = [
  path.join(ROOT_DIR, 'apps/web-seo/public/docs'),
  path.join(ROOT_DIR, 'assets/docs'),
];
const CACHE_DIR = path.join(ROOT_DIR, 'scripts/.media-cache');
const MANIFEST_PATH = path.join(ROOT_DIR, 'scripts/media-manifest.json');

function parseArgs(argv) {
  const args = {
    dryRun: false,
    localOnly: false,
    writeLocal: false,
    emulator: false,
    gcsUrl: false,
    quality: 82,
    maxWidth: 1920,
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || '',
    bucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--dry-run') args.dryRun = true;
    else if (token === '--local-only') args.localOnly = true;
    else if (token === '--write-local') args.writeLocal = true;
    else if (token === '--emulator') args.emulator = true;
    else if (token === '--gcs-url') args.gcsUrl = true;
    else if (token === '--quality' && argv[i + 1]) args.quality = Number(argv[++i]);
    else if (token === '--max-width' && argv[i + 1]) args.maxWidth = Number(argv[++i]);
    else if (token === '--project' && argv[i + 1]) args.projectId = argv[++i];
    else if (token === '--bucket' && argv[i + 1]) args.bucket = argv[++i];
  }

  return args;
}

async function resolveProjectConfig(args) {
  let projectId = args.projectId;
  if (!projectId) {
    const firebasercPath = path.join(ROOT_DIR, '.firebaserc');
    if (existsSync(firebasercPath)) {
      const rc = JSON.parse(await readFile(firebasercPath, 'utf8'));
      projectId = rc?.projects?.default || '';
    }
  }
  if (!projectId) {
    throw new Error('Could not resolve Firebase projectId. Pass --project or set FIREBASE_PROJECT_ID.');
  }
  const bucket = args.bucket || `${projectId}.firebasestorage.app`;
  return { projectId, bucket };
}

async function walkFiles(dir) {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walkFiles(fullPath)));
    } else if (entry.isFile()) {
      results.push(fullPath);
    }
  }
  return results;
}

function buildPublicUrl({ bucket, storagePath, emulatorHost, useGcsUrl }) {
  if (emulatorHost) {
    const host = emulatorHost.replace(/^https?:\/\//, '');
    return `http://${host}/v0/b/${bucket}/o/${encodeURIComponent(storagePath)}?alt=media`;
  }
  if (useGcsUrl) {
    return `https://storage.googleapis.com/${bucket}/${storagePath}`;
  }
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(storagePath)}?alt=media`;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function convertToWebp(sourcePath, quality, maxWidth) {
  const inputStat = await stat(sourcePath);
  const pipeline = sharp(sourcePath).rotate().resize({
    width: maxWidth,
    withoutEnlargement: true,
    fit: 'inside',
  });

  const { data, info } = await pipeline
    .webp({ quality, effort: 5 })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: data,
    width: info.width,
    height: info.height,
    originalBytes: inputStat.size,
    webpBytes: data.length,
  };
}

function inferSlugAndTargetForLaunchImage(filePath) {
  const rel = path.relative(LAUNCH_IMAGES_DIR, filePath);
  const parts = rel.split(path.sep);
  const parsed = path.parse(filePath);
  const webpFilename = `${parsed.name}.webp`;

  // Supports both `lancamentos/prime-view.webp` (cover) and `lancamentos/prime-view/fachada.jpg`
  if (parts.length === 1) {
    const slug = parsed.name;
    return {
      slug,
      isCover: true,
      storagePath: `launches/${slug}/images/${webpFilename}`,
    };
  }

  const slug = parts[0];
  const nestedName = parts.slice(1).join('-').replace(/\.[^.]+$/, '.webp');
  const isCover = parsed.name === 'cover' || parsed.name === 'capa' || parsed.name === slug;
  return {
    slug,
    isCover,
    storagePath: `launches/${slug}/images/${nestedName}`,
  };
}

function inferSlugAndTargetForDoc(baseDir, filePath) {
  const rel = path.relative(baseDir, filePath);
  const parts = rel.split(path.sep);
  const parsed = path.parse(filePath);

  if (parts.length >= 2) {
    const slug = parts[0];
    const filename = parts.slice(1).join('-');
    const lower = filename.toLowerCase();
    const kind = lower.includes('book') ? 'book' : 'planta';
    return {
      slug,
      kind,
      titulo: parsed.name.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      storagePath: `launches/${slug}/docs/${filename}`,
    };
  }

  // Flat filename convention: `<slug>-book.pdf` or `<slug>-planta-tipo.pdf`
  const match = parsed.name.match(/^([a-z0-9-]+?)-(book|planta.*)$/i);
  const slug = match ? match[1] : parsed.name;
  const kind = parsed.name.toLowerCase().includes('book') ? 'book' : 'planta';
  return {
    slug,
    kind,
    titulo: parsed.name.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    storagePath: `launches/${slug}/docs/${parsed.base}`,
  };
}

async function initStorageBucket({ projectId, bucket, emulator }) {
  if (emulator && !process.env.FIREBASE_STORAGE_EMULATOR_HOST) {
    process.env.FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199';
  }

  if (getApps().length === 0) {
    initializeApp({
      projectId,
      storageBucket: bucket,
      ...(process.env.FIREBASE_STORAGE_EMULATOR_HOST ? {} : { credential: applicationDefault() }),
    });
  }

  const storageBucket = getStorage().bucket(bucket);

  if (!process.env.FIREBASE_STORAGE_EMULATOR_HOST) {
    try {
      const [metadata] = await storageBucket.getMetadata();
      const location = String(metadata.location || '').toLowerCase();
      if (FREE_TIER_REGIONS.has(location)) {
        console.log(`[storage] Bucket "${bucket}" verified in free-tier region: ${location}`);
      } else {
        console.warn(
          `[storage] WARNING: Bucket "${bucket}" is in "${location}". Firebase free tier requires us-central1, us-west1, or us-east1.`
        );
      }
    } catch (err) {
      console.warn(`[storage] Could not inspect bucket metadata before upload: ${err.message}`);
    }
  } else {
    console.log(`[storage] Using Storage Emulator at ${process.env.FIREBASE_STORAGE_EMULATOR_HOST}`);
  }

  return storageBucket;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { projectId, bucket } = await resolveProjectConfig(args);
  const shouldUpload = !args.dryRun && !args.localOnly;

  if (args.emulator && !process.env.FIREBASE_STORAGE_EMULATOR_HOST) {
    process.env.FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199';
  }
  const emulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST || '';

  console.log(
    `[media] Mode: ${shouldUpload ? (emulatorHost ? 'UPLOAD (emulator)' : 'UPLOAD (production)') : args.dryRun ? 'DRY-RUN' : 'LOCAL-ONLY'}`
  );
  console.log(`[media] Project: ${projectId} | Bucket: ${bucket}`);

  let storageBucket = null;
  if (shouldUpload) {
    storageBucket = await initStorageBucket({ projectId, bucket, emulator: args.emulator });
  }

  await mkdir(CACHE_DIR, { recursive: true });

  const manifest = {
    generatedAt: new Date().toISOString(),
    projectId,
    bucket,
    mode: shouldUpload ? (emulatorHost ? 'emulator' : 'production') : 'local',
    launches: {},
    site: {},
  };

  const ensureLaunchEntry = (slug) => {
    if (!manifest.launches[slug]) {
      manifest.launches[slug] = {
        cover: null,
        gallery: [],
        bookUrl: null,
        plantasUrls: [],
      };
    }
    return manifest.launches[slug];
  };

  // 1. Launch images -> WebP
  const launchFiles = (await walkFiles(LAUNCH_IMAGES_DIR)).filter((f) =>
    IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase())
  );

  for (const filePath of launchFiles) {
    const { slug, isCover, storagePath } = inferSlugAndTargetForLaunchImage(filePath);
    const converted = await convertToWebp(filePath, args.quality, args.maxWidth);
    const cachePath = path.join(CACHE_DIR, storagePath);
    await mkdir(path.dirname(cachePath), { recursive: true });
    await writeFile(cachePath, converted.buffer);

    if (args.writeLocal && path.extname(filePath).toLowerCase() !== '.webp') {
      const siblingWebp = filePath.replace(/\.[^.]+$/, '.webp');
      await writeFile(siblingWebp, converted.buffer);
    }

    if (storageBucket) {
      await storageBucket.file(storagePath).save(converted.buffer, {
        resumable: false,
        contentType: 'image/webp',
        metadata: {
          cacheControl: 'public, max-age=31536000, immutable',
        },
      });
    }

    const publicUrl = buildPublicUrl({
      bucket,
      storagePath,
      emulatorHost,
      useGcsUrl: args.gcsUrl,
    });

    const entry = ensureLaunchEntry(slug);
    const record = {
      storagePath,
      publicUrl,
      width: converted.width,
      height: converted.height,
      originalBytes: converted.originalBytes,
      webpBytes: converted.webpBytes,
    };

    if (isCover && !entry.cover) {
      entry.cover = record;
    } else {
      entry.gallery.push(record);
    }

    console.log(
      `[webp] ${path.relative(ROOT_DIR, filePath)} -> ${storagePath} (${formatBytes(converted.originalBytes)} -> ${formatBytes(converted.webpBytes)}, ${converted.width}x${converted.height})`
    );
  }

  // 2. Site-level images (direct children of apps/web-seo/public/images) -> WebP
  if (existsSync(SITE_IMAGES_DIR)) {
    const entries = await readdir(SITE_IMAGES_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (!IMAGE_EXTENSIONS.has(ext)) continue;

      const filePath = path.join(SITE_IMAGES_DIR, entry.name);
      const webpName = `${path.parse(entry.name).name}.webp`;
      const storagePath = `site/images/${webpName}`;
      const converted = await convertToWebp(filePath, args.quality, args.maxWidth);
      const cachePath = path.join(CACHE_DIR, storagePath);
      await mkdir(path.dirname(cachePath), { recursive: true });
      await writeFile(cachePath, converted.buffer);

      if (args.writeLocal && ext !== '.webp') {
        await writeFile(path.join(SITE_IMAGES_DIR, webpName), converted.buffer);
      }

      if (storageBucket) {
        await storageBucket.file(storagePath).save(converted.buffer, {
          resumable: false,
          contentType: 'image/webp',
          metadata: {
            cacheControl: 'public, max-age=31536000, immutable',
          },
        });
      }

      const publicUrl = buildPublicUrl({
        bucket,
        storagePath,
        emulatorHost,
        useGcsUrl: args.gcsUrl,
      });

      manifest.site[path.parse(entry.name).name] = {
        storagePath,
        publicUrl,
        width: converted.width,
        height: converted.height,
        originalBytes: converted.originalBytes,
        webpBytes: converted.webpBytes,
      };

      console.log(
        `[webp] ${path.relative(ROOT_DIR, filePath)} -> ${storagePath} (${formatBytes(converted.originalBytes)} -> ${formatBytes(converted.webpBytes)}, ${converted.width}x${converted.height})`
      );
    }
  }

  // 3. PDFs (books & plantas) -> upload directly as application/pdf
  let pdfCount = 0;
  for (const docsDir of DOCS_SEARCH_DIRS) {
    const docFiles = (await walkFiles(docsDir)).filter(
      (f) => path.extname(f).toLowerCase() === PDF_EXTENSION
    );

    for (const filePath of docFiles) {
      pdfCount += 1;
      const { slug, kind, titulo, storagePath } = inferSlugAndTargetForDoc(docsDir, filePath);
      const pdfBuffer = await readFile(filePath);

      if (storageBucket) {
        await storageBucket.file(storagePath).save(pdfBuffer, {
          resumable: false,
          contentType: 'application/pdf',
          metadata: {
            cacheControl: 'public, max-age=86400',
          },
        });
      }

      const publicUrl = buildPublicUrl({
        bucket,
        storagePath,
        emulatorHost,
        useGcsUrl: args.gcsUrl,
      });

      const entry = ensureLaunchEntry(slug);
      if (kind === 'book') {
        entry.bookUrl = publicUrl;
      } else {
        entry.plantasUrls.push({ titulo, url: publicUrl });
      }

      console.log(
        `[pdf]  ${path.relative(ROOT_DIR, filePath)} -> ${storagePath} (${formatBytes(pdfBuffer.length)})`
      );
    }
  }

  if (pdfCount === 0) {
    console.log(
      '[pdf]  No PDFs found in apps/web-seo/public/docs/ or assets/docs/ (ready for future books/plantas).'
    );
  }

  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`[media] Manifest written to ${path.relative(ROOT_DIR, MANIFEST_PATH)}`);
}

main().catch((err) => {
  console.error('[media] Fatal error:', err);
  process.exit(1);
});
