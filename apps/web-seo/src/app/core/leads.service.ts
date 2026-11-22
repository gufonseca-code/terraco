import { Injectable, inject, signal } from '@angular/core';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { FirebaseService } from './firebase.service';

export interface LeadCreateInput {
  name: string;
  email: string;
  phone: string;
  launchSlug: string;
  message?: string;
}

export interface LeadCreatePayload {
  name: string;
  email: string;
  phone: string;
  launchSlug: string;
  message?: string;
  source?: string;
  createdAt: ReturnType<typeof serverTimestamp>;
}

export interface LeadSubmissionResult {
  id: string;
  persisted: boolean;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Write-only client service for the `leads` Firestore collection.
 * Never performs any read/query on `leads` (which is denied by firestore.rules).
 */
@Injectable({ providedIn: 'root' })
export class LeadsService {
  private readonly firebase = inject(FirebaseService);

  readonly submitting = signal<boolean>(false);
  readonly lastError = signal<string | null>(null);
  readonly lastSubmittedId = signal<string | null>(null);

  async createLead(input: LeadCreateInput): Promise<LeadSubmissionResult> {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const phone = input.phone.trim();
    const launchSlug = input.launchSlug.trim() || 'geral';
    const message = input.message?.trim();

    if (name.length < 2 || name.length > 120) {
      throw new Error('Informe um nome válido (entre 2 e 120 caracteres).');
    }
    if (email.length < 5 || email.length > 160 || !EMAIL_PATTERN.test(email)) {
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
        name,
        email,
        phone,
        launchSlug,
        source: 'web-seo',
        createdAt: serverTimestamp(),
        ...(message ? { message } : {}),
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
}
