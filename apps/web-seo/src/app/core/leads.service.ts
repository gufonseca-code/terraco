import { Injectable, inject, signal } from '@angular/core';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
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
  message?: string;
  source?: string;
  intent?: LeadIntent;
  searchedTerm?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface DemandLeadInput {
  phone: string;
  searchedTerm: string;
}

export interface LeadCreatePayload {
  name?: string;
  email?: string;
  phone: string;
  launchSlug: string;
  message?: string;
  source?: string;
  intent?: LeadIntent;
  searchedTerm?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  createdAt: ReturnType<typeof serverTimestamp>;
}

export interface LeadSubmissionResult {
  id: string;
  persisted: boolean;
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
 * Write-only client service for the `leads` Firestore collection.
 * Never performs any read/query on `leads` (which is denied by firestore.rules).
 */
@Injectable({ providedIn: 'root' })
export class LeadsService {
  private readonly firebase = inject(FirebaseService);
  private readonly utmService = inject(UtmService);

  readonly submitting = signal<boolean>(false);
  readonly lastError = signal<string | null>(null);
  readonly lastSubmittedId = signal<string | null>(null);

  async createLead(input: LeadCreateInput): Promise<LeadSubmissionResult> {
    const name = input.name?.trim() || undefined;
    const email = input.email?.trim().toLowerCase() || undefined;
    const phone = input.phone.trim();
    const launchSlug = input.launchSlug.trim() || 'geral';
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

    try {
      const db = this.firebase.getFirestore();
      if (!db) {
        const localId = `local-${Date.now()}`;
        this.lastSubmittedId.set(localId);
        return { id: localId, persisted: false };
      }

      const payload: LeadCreatePayload = {
        phone,
        launchSlug,
        source,
        createdAt: serverTimestamp(),
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(message ? { message } : {}),
        ...(intent ? { intent } : {}),
        ...(searchedTerm ? { searchedTerm } : {}),
        ...(utmSource ? { utmSource } : {}),
        ...(utmMedium ? { utmMedium } : {}),
        ...(utmCampaign ? { utmCampaign } : {}),
      };

      const docRef = await addDoc(collection(db, 'leads'), payload);
      this.lastSubmittedId.set(docRef.id);
      return { id: docRef.id, persisted: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Não foi possível enviar seu contato. Tente novamente.';
      this.lastError.set(errorMessage);
      throw err;
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
      source: 'zero-results-search',
      intent: 'busca_sem_resultado',
      ...(searchedTerm ? { searchedTerm } : {}),
    });
  }
}
