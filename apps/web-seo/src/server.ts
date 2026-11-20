import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine({
  allowedHosts: [
    'localhost',
    '127.0.0.1',
    'terraco.com.br',
    '*.terraco.com.br',
    '*.web.app',
    '*.firebaseapp.com',
    '*.run.app',
  ],
});

const SITE_URL = (
  process.env['NEXT_PUBLIC_SITE_URL'] ??
  process.env['SITE_URL'] ??
  'https://terraco-a5ff7.web.app'
).replace(/\/+$/, '');

app.get('/robots.txt', (_req, res) => {
  res
    .type('text/plain')
    .send(`User-Agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
});

app.get('/sitemap.xml', (_req, res) => {
  res
    .type('application/xml')
    .send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${SITE_URL}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1</priority>\n  </url>\n  <url>\n    <loc>${SITE_URL}/lancamentos</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n  <url>\n    <loc>${SITE_URL}/lancamentos/prime-view</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>\n`,
    );
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
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
