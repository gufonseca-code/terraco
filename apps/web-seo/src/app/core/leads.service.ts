import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface LeadCreateInput {
  name: string;
  phone: string;
  launchSlug: string;
  launchName: string;
  source?: string;
  website?: string;
}

export interface LeadSubmissionResult {
  id: string;
  createdAtIso: string;
  createdAtBrasilia: string;
  sheetsSynced: boolean;
}

interface LeadApiErrorBody {
  error?: string;
}

/**
 * Extracts normalized Brazilian phone digits (10 or 11 local digits without country code 55).
 */
export function extractBrazilianPhoneDigits(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length >= 12 && digits.startsWith('55')) {
    return digits.slice(2, 13);
  }
  return digits.slice(0, 11);
}

/**
 * Formats Brazilian phone digits as `(DD) 99999-9999` or `(DD) 9999-9999`.
 */
export function formatBrazilianPhone(raw: string): string {
  const digits = extractBrazilianPhoneDigits(raw);
  if (digits.length === 0) {
    return '';
  }
  if (digits.length <= 2) {
    return `(${digits}`;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Submits product lead captures to the Angular SSR server route (`POST /api/leads`),
 * which persists the lead to Firestore with an exact server timestamp and forwards
 * it automatically to Google Sheets.
 */
@Injectable({ providedIn: 'root' })
export class LeadsService {
  private readonly http = inject(HttpClient);

  async createLead(input: LeadCreateInput): Promise<LeadSubmissionResult> {
    const payload: LeadCreateInput = {
      name: input.name.trim(),
      phone: formatBrazilianPhone(input.phone) || input.phone.trim(),
      launchSlug: input.launchSlug.trim(),
      launchName: input.launchName.trim(),
      source: input.source?.trim() || 'web-seo:launch-card',
      ...(input.website ? { website: input.website } : {}),
    };

    try {
      return await firstValueFrom(
        this.http.post<LeadSubmissionResult>('/api/leads', payload),
      );
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        const body = error.error as LeadApiErrorBody | null;
        if (body?.error && typeof body.error === 'string') {
          throw new Error(body.error);
        }
        if (error.status === 0) {
          throw new Error(
            'Sem conexão no momento. Verifique sua internet e tente novamente.',
          );
        }
      }
      throw new Error(
        'Não foi possível enviar seu contato agora. Tente novamente em instantes.',
      );
    }
  }
}
