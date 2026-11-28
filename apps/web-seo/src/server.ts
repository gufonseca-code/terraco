import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { handleCreateLead } from './server/leads.handler';
import { createLeadWebhookHandler } from './server/lead-webhook.handler';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine({
  allowedHosts: [
    'localhost',
    '127.0.0.1',
    'meuterraco.com.br',
    'www.meuterraco.com.br',
    '*.meuterraco.com.br',
    '*.web.app',
    '*.firebaseapp.com',
    '*.hosted.app',
    '*.run.app',
  ],
  trustProxyHeaders: true,
});

const SITE_URL = (
  process.env['NEXT_PUBLIC_SITE_URL'] ??
  process.env['SITE_URL'] ??
  'https://meuterraco.com.br'
).replace(/\/+$/, '');

const SSR_HTML_CACHE_CONTROL =
  'public, max-age=0, s-maxage=300, stale-while-revalidate=60';
const SSR_NOT_FOUND_CACHE_CONTROL = 'public, max-age=60, s-maxage=300';
const SEO_STATIC_CACHE_CONTROL =
  'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400';

app.get('/robots.txt', (_req, res) => {
  res
    .setHeader('Cache-Control', SEO_STATIC_CACHE_CONTROL)
    .type('text/plain')
    .send(`User-Agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
});

app.get('/sitemap.xml', (_req, res) => {
  res
    .setHeader('Cache-Control', SEO_STATIC_CACHE_CONTROL)
    .type('application/xml')
    .send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${SITE_URL}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1</priority>\n  </url>\n  <url>\n    <loc>${SITE_URL}/lancamentos</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n  <url>\n    <loc>${SITE_URL}/lancamentos/prime-view</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n  <url>\n    <loc>${SITE_URL}/lancamentos/upside-square</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n  <url>\n    <loc>${SITE_URL}/lancamentos/horizon</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n  <url>\n    <loc>${SITE_URL}/bairros/estoril</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n  <url>\n    <loc>${SITE_URL}/bairros/santa-efigenia</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n  <url>\n    <loc>${SITE_URL}/bairros/serrano</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n  <url>\n    <loc>${SITE_URL}/bairros/buritis</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>\n`,
    );
});

app.post('/api/leads', express.json({ limit: '16kb' }), handleCreateLead);
app.post(
  '/api/leads/notify',
  express.json({ limit: '16kb' }),
  createLeadWebhookHandler(),
);

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    immutable: true,
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 * Sets Blaze free-tier CDN Cache-Control headers on SSR HTML responses so
 * Firebase Hosting / Cloud CDN absorbs traffic and prevents repeated Firestore reads.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => {
      if (!response) {
        return next();
      }
      const headers = new Headers(response.headers);
      if (!headers.has('cache-control')) {
        if (response.status >= 200 && response.status < 300) {
          headers.set('Cache-Control', SSR_HTML_CACHE_CONTROL);
        } else if (response.status === 404) {
          headers.set('Cache-Control', SSR_NOT_FOUND_CACHE_CONTROL);
        }
      }
      const cachedResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
      return writeResponseToNodeResponse(cachedResponse, res);
    })
    .catch(next);
});

function resolvePort(): number | string {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if ((arg === '--port' || arg === '-p') && args[i + 1]) {
      return Number(args[i + 1]) || args[i + 1];
    }
    if (arg.startsWith('--port=')) {
      const val = arg.slice('--port='.length);
      return Number(val) || val;
    }
  }
  return process.env['PORT'] || 4000;
}

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by `--port <number>` CLI arg, `PORT` env variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = resolvePort();
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
