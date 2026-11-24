import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FavoritesService } from './favorites.service';
import { UtmService } from './utm.service';

export type LeadIntent =
  | 'plantas_valores'
  | 'simular_entrada'
  | 'agendar_visita'
  | 'tirar_duvida'
  | 'busca_sem_resultado';

export interface LeadCreateInput {
  name?: string;
  email?: string;
  phone: string;
  launchSlug: string;
  launchName?: string;
  message?: string;
  source?: string;
  intent?: LeadIntent;
  searchedTerm?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  website?: string;
}

export interface DemandLeadInput {
  phone: string;
  searchedTerm: string;
}

export interface LeadSubmissionResult {
  id: string;
  persisted?: boolean;
  createdAtIso?: string;
  createdAtBrasilia?: string;
  sheetsSynced?: boolean;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_SOURCE_LENGTH = 60;
const MAX_INTENT_LENGTH = 80;
const MAX_SEARCHED_TERM_LENGTH = 120;
const MAX_UTM_SOURCE_LENGTH = 80;
const MAX_UTM_MEDIUM_LENGTH = 80;
const MAX_UTM_CAMPAIGN_LENGTH = 120;

function normalizeOptionalString(
  value: string | undefined,
  maxLength: number,
): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.slice(0, maxLength);
}

function normalizeBrazilianPhone(rawPhone: string): string {
  const trimmed = rawPhone.trim();
  const digits = trimmed.replace(/\D/g, '');

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 13 && digits.startsWith('55')) {
    return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  if (digits.length === 12 && digits.startsWith('55')) {
    return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 8)}-${digits.slice(8)}`;
  }

  return trimmed;
}

/**
 * Client service for lead capture via `POST /api/leads` (Firestore Admin SDK +
 * Google Sheets sync) and `POST /api/leads/notify` (<5 min webhook/Telegram alert).
 */
@Injectable({ providedIn: 'root' })
export class LeadsService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly utmService = inject(UtmService);
  private readonly favoritesService = inject(FavoritesService);

  readonly submitting = signal<boolean>(false);
  readonly lastError = signal<string | null>(null);
  readonly lastSubmittedId = signal<string | null>(null);

  async createLead(input: LeadCreateInput): Promise<LeadSubmissionResult> {
    const name = input.name?.trim() || undefined;
    const email = input.email?.trim().toLowerCase() || undefined;
    const phone = input.phone.trim();
    const launchSlug = input.launchSlug.trim().toLowerCase() || 'geral';
    const launchName =
      normalizeOptionalString(input.launchName, 160) ?? launchSlug;
    const message = input.message?.trim() || undefined;
    const source =
      normalizeOptionalString(input.source, MAX_SOURCE_LENGTH) ?? 'web-seo';
    const intent = normalizeOptionalString(input.intent, MAX_INTENT_LENGTH) as
      | LeadIntent
      | undefined;
    const searchedTerm = normalizeOptionalString(
      input.searchedTerm,
      MAX_SEARCHED_TERM_LENGTH,
    );

    const capturedUtm = this.utmService.getUtmParams();
    const utmSource = normalizeOptionalString(
      input.utmSource ?? capturedUtm.utmSource,
      MAX_UTM_SOURCE_LENGTH,
    );
    const utmMedium = normalizeOptionalString(
      input.utmMedium ?? capturedUtm.utmMedium,
      MAX_UTM_MEDIUM_LENGTH,
    );
    const utmCampaign = normalizeOptionalString(
      input.utmCampaign ?? capturedUtm.utmCampaign,
      MAX_UTM_CAMPAIGN_LENGTH,
    );

    if (name !== undefined && (name.length < 2 || name.length > 120)) {
      throw new Error('Informe um nome válido (entre 2 e 120 caracteres).');
    }
    if (
      email !== undefined &&
      (email.length < 5 || email.length > 160 || !EMAIL_PATTERN.test(email))
    ) {
      throw new Error('Informe um e-mail válido.');
    }
    if (phone.length < 8 || phone.length > 25) {
      throw new Error('Informe um telefone válido com DDD.');
    }
    if (launchSlug.length < 1 || launchSlug.length > 100) {
      throw new Error('Referência do lançamento inválida.');
    }
    if (message && message.length > 1000) {
      throw new Error('A mensagem deve ter no máximo 1000 caracteres.');
    }

    this.submitting.set(true);
    this.lastError.set(null);

    const apiPayload = {
      name: name ?? 'Interessado via site',
      phone,
      launchSlug,
      launchName,
      source,
      ...(input.website ? { website: input.website } : {}),
    };

    try {
      const response = await firstValueFrom(
        this.http.post<LeadSubmissionResult>('/api/leads', apiPayload, {
          keepalive: true,
        }),
      );

      this.lastSubmittedId.set(response.id);
      this.notifyLeadWebhook({
        leadId: response.id,
        phone,
        launchSlug,
        source,
        favorites: this.favoritesService.favorites().slice(0, 10),
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(intent ? { intent } : {}),
        ...(searchedTerm ? { searchedTerm } : {}),
        ...(utmSource ? { utmSource } : {}),
        ...(utmMedium ? { utmMedium } : {}),
        ...(utmCampaign ? { utmCampaign } : {}),
      });

      return { ...response, persisted: true };
    } catch (err) {
      let friendlyMessage =
        'Não foi possível enviar seu contato agora. Tente novamente em instantes.';
      if (err instanceof HttpErrorResponse) {
        const serverError = err.error?.error;
        if (typeof serverError === 'string' && serverError.trim().length > 0) {
          friendlyMessage = serverError;
        } else if (err.status === 0) {
          friendlyMessage =
            'Sem conexão no momento. Verifique sua internet e tente novamente.';
        }
      } else if (err instanceof Error && err.message) {
        friendlyMessage = err.message;
      }

      this.lastError.set(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      this.submitting.set(false);
    }
  }

  async captureDemandLead(
    input: DemandLeadInput,
  ): Promise<LeadSubmissionResult> {
    const digits = input.phone.replace(/\D/g, '');
    const normalizedPhone = normalizeBrazilianPhone(input.phone);

    if (
      digits.length < 10 ||
      normalizedPhone.length < 8 ||
      normalizedPhone.length > 25
    ) {
      const errorMessage =
        'Informe um WhatsApp válido com DDD (ex.: (31) 99999-9999).';
      this.lastError.set(errorMessage);
      throw new Error(errorMessage);
    }

    const searchedTerm = normalizeOptionalString(
      input.searchedTerm,
      MAX_SEARCHED_TERM_LENGTH,
    );

    return this.createLead({
      phone: normalizedPhone,
      launchSlug: 'busca-sem-resultado',
      launchName: searchedTerm
        ? `Busca sem resultado: ${searchedTerm}`
        : 'Busca sem resultado',
      source: 'zero-results-search',
      intent: 'busca_sem_resultado',
      ...(searchedTerm ? { searchedTerm } : {}),
    });
  }

  private notifyLeadWebhook(payload: {
    leadId: string;
    phone: string;
    launchSlug: string;
    source: string;
    favorites: string[];
    name?: string;
    email?: string;
    intent?: LeadIntent;
    searchedTerm?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  }): void {
    if (!isPlatformBrowser(this.platformId) || typeof fetch !== 'function') {
      return;
    }

    try {
      void fetch('/api/leads/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => undefined);
    } catch {
      // Never block or degrade lead capture UX on webhook delivery failures.
    }
  }
}
