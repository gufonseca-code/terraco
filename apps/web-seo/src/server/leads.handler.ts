import type { Request, Response } from 'express';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { GoogleAuth } from 'google-auth-library';
import { resolveFirebaseEnvConfig } from '../app/core/site.config';

const ADMIN_APP_NAME = 'terraco-ssr-admin';
const LEADS_COLLECTION = 'leads';
const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const DEFAULT_SPREADSHEET_ID = '1GXlTAZrO1pZNq2B8FUmie4x0IwJ-4xkH6RBom2gCIus';
const DEFAULT_SHEET_RANGE = 'Leads!A:G';
const BRASILIA_TIMEZONE = 'America/Sao_Paulo';

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const rateLimitStore = new Map<string, number[]>();

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface LeadRequestPayload {
  name?: unknown;
  phone?: unknown;
  launchSlug?: unknown;
  launchName?: unknown;
  source?: unknown;
  website?: unknown;
}

export interface LeadResponsePayload {
  id: string;
  createdAtIso: string;
  createdAtBrasilia: string;
  sheetsSynced: boolean;
}

interface SanitizedLead {
  name: string;
  phone: string;
  phoneDigits: string;
  launchSlug: string;
  launchName: string;
  source: string;
}

let cachedSheetsAuth: GoogleAuth | null = null;

function getAdminFirestore() {
  const config = resolveFirebaseEnvConfig();
  const existing = getApps().find((app) => app.name === ADMIN_APP_NAME);

  const app =
    existing ??
    initializeApp(
      {
        projectId: config.projectId,
        ...(config.useEmulators ? {} : { credential: applicationDefault() }),
      },
      ADMIN_APP_NAME,
    );

  const databaseId = config.firestoreDatabaseId;
  return databaseId && databaseId !== '(default)'
    ? getFirestore(app, databaseId)
    : getFirestore(app);
}

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim().length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function isRateLimited(ip: string, now: number): boolean {
  const timestamps = rateLimitStore.get(ip) ?? [];
  const recent = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitStore.set(ip, recent);
    return true;
  }

  recent.push(now);
  rateLimitStore.set(ip, recent);

  if (rateLimitStore.size > 2000) {
    for (const [key, list] of rateLimitStore.entries()) {
      if (list.every((ts) => now - ts >= RATE_LIMIT_WINDOW_MS)) {
        rateLimitStore.delete(key);
      }
    }
  }

  return false;
}

function formatBrazilianPhone(digits: string): string {
  const localDigits =
    digits.length >= 12 && digits.startsWith('55') ? digits.slice(2) : digits;

  if (localDigits.length === 11) {
    return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 7)}-${localDigits.slice(7)}`;
  }
  if (localDigits.length === 10) {
    return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 6)}-${localDigits.slice(6)}`;
  }
  return digits;
}

function formatBrasiliaTimestamp(date: Date): string {
  const parts = new Intl.DateTimeFormat('pt-BR', {
    timeZone: BRASILIA_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '00';

  return `${get('day')}/${get('month')}/${get('year')} ${get('hour')}:${get('minute')}:${get('second')}`;
}

function sanitizeSheetCell(value: string): string {
  const trimmed = value.replace(/[\r\n]+/g, ' ').trim();
  if (/^[=+\-@\t]/.test(trimmed)) {
    return `'${trimmed}`;
  }
  return trimmed;
}

function validateAndSanitizeLead(
  body: LeadRequestPayload,
): { ok: true; data: SanitizedLead } | { ok: false; error: string } {
  const rawName = typeof body.name === 'string' ? body.name.trim() : '';
  const rawPhone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const rawSlug =
    typeof body.launchSlug === 'string' ? body.launchSlug.trim().toLowerCase() : '';
  const rawLaunchName =
    typeof body.launchName === 'string' ? body.launchName.trim() : '';
  const rawSource =
    typeof body.source === 'string' && body.source.trim().length > 0
      ? body.source.trim().slice(0, 60)
      : 'web-seo:launch-card';

  if (rawName.length < 2 || rawName.length > 120) {
    return {
      ok: false,
      error: 'Informe seu nome completo (entre 2 e 120 caracteres).',
    };
  }

  const phoneDigits = rawPhone.replace(/\D/g, '');
  const localDigits =
    phoneDigits.length >= 12 && phoneDigits.startsWith('55')
      ? phoneDigits.slice(2)
      : phoneDigits;

  if (localDigits.length < 10 || localDigits.length > 11) {
    return {
      ok: false,
      error: 'Informe um número de telefone ou WhatsApp válido com DDD.',
    };
  }

  if (
    rawSlug.length < 1 ||
    rawSlug.length > 100 ||
    !SLUG_PATTERN.test(rawSlug)
  ) {
    return {
      ok: false,
      error: 'Referência do empreendimento inválida.',
    };
  }

  const launchName =
    rawLaunchName.length > 0 ? rawLaunchName.slice(0, 160) : rawSlug;

  return {
    ok: true,
    data: {
      name: rawName,
      phone: formatBrazilianPhone(localDigits),
      phoneDigits: localDigits,
      launchSlug: rawSlug,
      launchName,
      source: rawSource,
    },
  };
}

function getSheetsAuth(): GoogleAuth {
  if (cachedSheetsAuth) {
    return cachedSheetsAuth;
  }

  const credentialsJson = process.env['GOOGLE_SHEETS_CREDENTIALS_JSON']?.trim();
  if (credentialsJson) {
    const parsed = JSON.parse(credentialsJson) as {
      client_email?: string;
      private_key?: string;
    };
    cachedSheetsAuth = new GoogleAuth({
      credentials: parsed,
      scopes: [SHEETS_SCOPE],
    });
    return cachedSheetsAuth;
  }

  const clientEmail = process.env['GOOGLE_SHEETS_CLIENT_EMAIL']?.trim();
  const privateKey = process.env['GOOGLE_SHEETS_PRIVATE_KEY']
    ?.trim()
    .replace(/\\n/g, '\n');

  if (clientEmail && privateKey) {
    cachedSheetsAuth = new GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: [SHEETS_SCOPE],
    });
    return cachedSheetsAuth;
  }

  // Native Workload Identity / Application Default Credentials (Firebase App Hosting / Cloud Run)
  cachedSheetsAuth = new GoogleAuth({
    scopes: [SHEETS_SCOPE],
  });
  return cachedSheetsAuth;
}

async function appendLeadToGoogleSheets(row: string[]): Promise<boolean> {
  const spreadsheetId =
    process.env['GOOGLE_SHEETS_SPREADSHEET_ID']?.trim() ||
    DEFAULT_SPREADSHEET_ID;
  if (!spreadsheetId) {
    console.warn(
      '[leads] GOOGLE_SHEETS_SPREADSHEET_ID não configurado; lead salvo apenas no Firestore.',
    );
    return false;
  }

  const sheetRange =
    process.env['GOOGLE_SHEETS_RANGE']?.trim() || DEFAULT_SHEET_RANGE;

  try {
    const auth = getSheetsAuth();
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const accessToken =
      typeof tokenResponse === 'string' ? tokenResponse : tokenResponse?.token;

    if (!accessToken) {
      console.error('[leads] Não foi possível obter access token para Google Sheets.');
      return false;
    }

    const encodedRange = encodeURIComponent(sheetRange);
    const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId,
    )}/values/${encodedRange}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        majorDimension: 'ROWS',
        values: [row.map(sanitizeSheetCell)],
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error(
        `[leads] Falha ao enviar lead ao Google Sheets (${response.status}): ${details}`,
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('[leads] Erro ao sincronizar lead com Google Sheets:', error);
    return false;
  }
}

export async function handleCreateLead(
  req: Request,
  res: Response,
): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');

  const body = (req.body ?? {}) as LeadRequestPayload;

  // Silent honeypot check for automated bots
  if (typeof body.website === 'string' && body.website.trim().length > 0) {
    const now = new Date();
    res.status(201).json({
      id: 'accepted',
      createdAtIso: now.toISOString(),
      createdAtBrasilia: formatBrasiliaTimestamp(now),
      sheetsSynced: false,
    } satisfies LeadResponsePayload);
    return;
  }

  const clientIp = getClientIp(req);
  if (isRateLimited(clientIp, Date.now())) {
    res.status(429).json({
      error:
        'Muitas solicitações em sequência. Aguarde alguns minutos e tente novamente.',
    });
    return;
  }

  const validated = validateAndSanitizeLead(body);
  if (!validated.ok) {
    res.status(400).json({ error: validated.error });
    return;
  }

  const lead = validated.data;
  const capturedAt = new Date();
  const createdAtIso = capturedAt.toISOString();
  const createdAtBrasilia = formatBrasiliaTimestamp(capturedAt);

  try {
    const db = getAdminFirestore();
    const docRef = await db.collection(LEADS_COLLECTION).add({
      name: lead.name,
      phone: lead.phone,
      phoneDigits: lead.phoneDigits,
      launchSlug: lead.launchSlug,
      launchName: lead.launchName,
      source: lead.source,
      createdAt: FieldValue.serverTimestamp(),
      createdAtIso,
      createdAtBrasilia,
      sheetsSynced: false,
    });

    const sheetsSynced = await appendLeadToGoogleSheets([
      createdAtBrasilia,
      docRef.id,
      lead.launchName,
      lead.launchSlug,
      lead.name,
      lead.phone,
      lead.source,
    ]);

    if (sheetsSynced) {
      await docRef
        .update({ sheetsSynced: true })
        .catch((err) =>
          console.warn('[leads] Não foi possível marcar sheetsSynced=true:', err),
        );
    }

    res.status(201).json({
      id: docRef.id,
      createdAtIso,
      createdAtBrasilia,
      sheetsSynced,
    } satisfies LeadResponsePayload);
  } catch (error) {
    console.error('[leads] Erro ao persistir lead no Firestore:', error);
    res.status(500).json({
      error:
        'Não foi possível registrar seu contato agora. Tente novamente em instantes.',
    });
  }
}
