import type { Request, RequestHandler } from 'express';

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_PRUNE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const WEBHOOK_TIMEOUT_MS = 4000;

const MAX_FAVORITES_ITEMS = 10;
const MAX_FAVORITE_SLUG_LENGTH = 100;

export interface SanitizedLeadWebhookPayload {
  phone: string;
  launchSlug: string;
  name?: string;
  email?: string;
  intent?: string;
  searchedTerm?: string;
  source?: string;
  favorites?: string[];
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  leadId?: string;
}

const INTENT_LABELS: Record<string, string> = {
  plantas_valores: 'Plantas e valores',
  simular_entrada: 'Simular entrada',
  agendar_visita: 'Agendar visita',
  tirar_duvida: 'Tirar dúvida',
  busca_sem_resultado: 'Busca sem resultado',
};

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseRequiredString(
  value: unknown,
  minLength: number,
  maxLength: number,
): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length < minLength || trimmed.length > maxLength) {
    return null;
  }
  return trimmed;
}

function parseOptionalString(
  value: unknown,
  maxLength: number,
): { ok: true; value?: string } | { ok: false } {
  if (value === undefined || value === null) {
    return { ok: true, value: undefined };
  }
  if (typeof value !== 'string') {
    return { ok: false };
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: true, value: undefined };
  }
  if (trimmed.length > maxLength) {
    return { ok: false };
  }
  return { ok: true, value: trimmed };
}

function parseOptionalFavorites(
  value: unknown,
): { ok: true; value?: string[] } | { ok: false } {
  if (value === undefined || value === null) {
    return { ok: true, value: undefined };
  }
  if (!Array.isArray(value) || value.length > MAX_FAVORITES_ITEMS) {
    return { ok: false };
  }
  const sanitized: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string') {
      return { ok: false };
    }
    const trimmed = item.trim();
    if (!trimmed || trimmed.length > MAX_FAVORITE_SLUG_LENGTH) {
      return { ok: false };
    }
    sanitized.push(trimmed);
  }
  return { ok: true, value: sanitized.length > 0 ? sanitized : undefined };
}

function validateAndSanitizePayload(
  rawBody: unknown,
): { ok: true; payload: SanitizedLeadWebhookPayload } | { ok: false; error: string } {
  if (!isPlainRecord(rawBody)) {
    return { ok: false, error: 'Payload inválido.' };
  }

  const phone = parseRequiredString(rawBody['phone'], 8, 25);
  if (!phone) {
    return { ok: false, error: 'Campo phone inválido (esperado 8..25 caracteres).' };
  }

  const launchSlug = parseRequiredString(rawBody['launchSlug'], 1, 100);
  if (!launchSlug) {
    return {
      ok: false,
      error: 'Campo launchSlug inválido (esperado 1..100 caracteres).',
    };
  }

  const name = parseOptionalString(rawBody['name'], 120);
  const email = parseOptionalString(rawBody['email'], 160);
  const intent = parseOptionalString(rawBody['intent'], 80);
  const searchedTerm = parseOptionalString(rawBody['searchedTerm'], 120);
  const source = parseOptionalString(rawBody['source'], 60);
  const utmSource = parseOptionalString(rawBody['utmSource'], 80);
  const utmMedium = parseOptionalString(rawBody['utmMedium'], 80);
  const utmCampaign = parseOptionalString(rawBody['utmCampaign'], 120);
  const leadId = parseOptionalString(rawBody['leadId'], 120);
  const favorites = parseOptionalFavorites(rawBody['favorites']);

  if (
    !name.ok ||
    !email.ok ||
    !intent.ok ||
    !searchedTerm.ok ||
    !source.ok ||
    !utmSource.ok ||
    !utmMedium.ok ||
    !utmCampaign.ok ||
    !leadId.ok ||
    !favorites.ok
  ) {
    return { ok: false, error: 'Um ou mais campos opcionais são inválidos.' };
  }

  const payload: SanitizedLeadWebhookPayload = {
    phone,
    launchSlug,
    ...(name.value ? { name: name.value } : {}),
    ...(email.value ? { email: email.value } : {}),
    ...(intent.value ? { intent: intent.value } : {}),
    ...(searchedTerm.value ? { searchedTerm: searchedTerm.value } : {}),
    ...(source.value ? { source: source.value } : {}),
    ...(favorites.value ? { favorites: favorites.value } : {}),
    ...(utmSource.value ? { utmSource: utmSource.value } : {}),
    ...(utmMedium.value ? { utmMedium: utmMedium.value } : {}),
    ...(utmCampaign.value ? { utmCampaign: utmCampaign.value } : {}),
    ...(leadId.value ? { leadId: leadId.value } : {}),
  };

  return { ok: true, payload };
}

function extractClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim().length > 0) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) {
      return first;
    }
  } else if (Array.isArray(forwarded) && forwarded.length > 0) {
    const first = forwarded[0]?.split(',')[0]?.trim();
    if (first) {
      return first;
    }
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function buildWhatsappDirectUrl(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) {
    return '';
  }
  const withCountryCode =
    digits.startsWith('55') && digits.length >= 12 ? digits : `55${digits}`;
  return `https://wa.me/${withCountryCode}`;
}

function formatTelegramAlert(
  lead: SanitizedLeadWebhookPayload,
  whatsappDirectUrl: string,
): string {
  const lines: string[] = [
    'Novo lead Terraço (<5 min SLA)',
    `Empreendimento: ${lead.launchSlug}`,
    `Telefone: ${lead.phone}`,
  ];

  if (lead.name) {
    lines.push(`Nome: ${lead.name}`);
  }
  if (lead.email) {
    lines.push(`E-mail: ${lead.email}`);
  }
  if (lead.intent) {
    const label = INTENT_LABELS[lead.intent] ?? lead.intent;
    lines.push(`Intenção: ${label}`);
  }
  if (lead.searchedTerm) {
    lines.push(`Busca: ${lead.searchedTerm}`);
  }
  if (lead.source) {
    lines.push(`Origem: ${lead.source}`);
  }
  if (lead.favorites && lead.favorites.length > 0) {
    lines.push(`Favoritos salvos: ${lead.favorites.join(', ')}`);
  }

  const utms = [
    lead.utmSource ? `source=${lead.utmSource}` : null,
    lead.utmMedium ? `medium=${lead.utmMedium}` : null,
    lead.utmCampaign ? `campaign=${lead.utmCampaign}` : null,
  ].filter((part): part is string => part !== null);

  if (utms.length > 0) {
    lines.push(`UTMs: ${utms.join(' | ')}`);
  }
  if (lead.leadId) {
    lines.push(`Lead ID: ${lead.leadId}`);
  }
  if (whatsappDirectUrl) {
    lines.push(`Responder no WhatsApp: ${whatsappDirectUrl}`);
  }

  return lines.join('\n');
}

async function deliverGenericWebhook(
  url: string,
  secret: string | undefined,
  lead: SanitizedLeadWebhookPayload,
  whatsappDirectUrl: string,
  receivedAt: string,
): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (secret) {
    headers['X-Terraco-Webhook-Secret'] = secret;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      event: 'terraco.lead.created',
      receivedAt,
      lead,
      whatsappDirectUrl,
    }),
    signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Generic webhook returned HTTP ${response.status}`);
  }
}

async function deliverTelegramAlert(
  botToken: string,
  chatId: string,
  lead: SanitizedLeadWebhookPayload,
  whatsappDirectUrl: string,
): Promise<void> {
  const url = `https://api.telegram.org/bot${encodeURIComponent(botToken)}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: formatTelegramAlert(lead, whatsappDirectUrl),
      disable_web_page_preview: true,
    }),
    signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Telegram API returned HTTP ${response.status}`);
  }
}

export function createLeadWebhookHandler(): RequestHandler {
  const ipTimestamps = new Map<string, number[]>();
  let lastPruneAt = Date.now();

  const pruneStaleEntries = (now: number): void => {
    const cutoff = now - RATE_LIMIT_WINDOW_MS;
    for (const [ip, timestamps] of ipTimestamps.entries()) {
      const recent = timestamps.filter((ts) => ts > cutoff);
      if (recent.length === 0) {
        ipTimestamps.delete(ip);
      } else {
        ipTimestamps.set(ip, recent);
      }
    }
    lastPruneAt = now;
  };

  const checkRateLimit = (ip: string, now: number): boolean => {
    if (now - lastPruneAt >= RATE_LIMIT_PRUNE_INTERVAL_MS) {
      pruneStaleEntries(now);
    }

    const cutoff = now - RATE_LIMIT_WINDOW_MS;
    const existing = ipTimestamps.get(ip);
    const recent = existing ? existing.filter((ts) => ts > cutoff) : [];

    if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
      ipTimestamps.set(ip, recent);
      return false;
    }

    recent.push(now);
    ipTimestamps.set(ip, recent);
    return true;
  };

  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');

    const rawBody: unknown = req.body;
    if (
      isPlainRecord(rawBody) &&
      typeof rawBody['website'] === 'string' &&
      rawBody['website'].trim().length > 0
    ) {
      res.status(200).json({ ok: true, delivered: 0, configured: false });
      return;
    }

    const clientIp = extractClientIp(req);
    if (!checkRateLimit(clientIp, Date.now())) {
      res.status(429).json({
        ok: false,
        error: 'Muitas solicitações. Tente novamente em alguns minutos.',
      });
      return;
    }

    const validation = validateAndSanitizePayload(rawBody);
    if (!validation.ok) {
      res.status(400).json({ ok: false, error: validation.error });
      return;
    }

    const lead = validation.payload;
    const receivedAt = new Date().toISOString();
    const whatsappDirectUrl = buildWhatsappDirectUrl(lead.phone);

    const webhookUrl = process.env['LEAD_WEBHOOK_URL']?.trim();
    const webhookSecret = process.env['LEAD_WEBHOOK_SECRET']?.trim();
    const telegramBotToken = process.env['TELEGRAM_BOT_TOKEN']?.trim();
    const telegramChatId = process.env['TELEGRAM_CHAT_ID']?.trim();

    const deliveries: Promise<void>[] = [];

    if (webhookUrl) {
      deliveries.push(
        deliverGenericWebhook(
          webhookUrl,
          webhookSecret,
          lead,
          whatsappDirectUrl,
          receivedAt,
        ),
      );
    }

    if (telegramBotToken && telegramChatId) {
      deliveries.push(
        deliverTelegramAlert(
          telegramBotToken,
          telegramChatId,
          lead,
          whatsappDirectUrl,
        ),
      );
    }

    const configured = deliveries.length > 0;
    if (!configured) {
      res.status(200).json({ ok: true, delivered: 0, configured: false });
      return;
    }

    const results = await Promise.allSettled(deliveries);
    let delivered = 0;

    for (const result of results) {
      if (result.status === 'fulfilled') {
        delivered += 1;
      } else {
        console.warn('[lead-webhook] Failed to deliver lead alert:', result.reason);
      }
    }

    res.status(200).json({ ok: true, delivered, configured: true });
  };
}
