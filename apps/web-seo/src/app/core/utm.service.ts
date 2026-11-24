import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const UTM_STORAGE_KEY = 'terraco_utm_v1';

export interface UtmParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

const MAX_UTM_SOURCE_LENGTH = 80;
const MAX_UTM_MEDIUM_LENGTH = 80;
const MAX_UTM_CAMPAIGN_LENGTH = 120;

function sanitizeUtmValue(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.slice(0, maxLength);
}

/**
 * Captures and persists UTM attribution parameters (`utm_source`, `utm_medium`, `utm_campaign`)
 * in `sessionStorage` for the current browser session. Fully SSR-safe.
 */
@Injectable({ providedIn: 'root' })
export class UtmService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly utm = signal<UtmParams>({});

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    const stored = this.readFromStorage();
    const fromUrl = this.readFromLocation();
    const merged: UtmParams = {
      ...stored,
      ...fromUrl,
    };

    if (Object.keys(merged).length > 0) {
      this.writeToStorage(merged);
      this.utm.set(merged);
    }
  }

  getUtmParams(): UtmParams {
    if (!this.isBrowser) {
      return {};
    }
    return { ...this.utm() };
  }

  private readFromLocation(): UtmParams {
    try {
      const params = new URLSearchParams(window.location.search);
      const utmSource = sanitizeUtmValue(
        params.get('utm_source'),
        MAX_UTM_SOURCE_LENGTH,
      );
      const utmMedium = sanitizeUtmValue(
        params.get('utm_medium'),
        MAX_UTM_MEDIUM_LENGTH,
      );
      const utmCampaign = sanitizeUtmValue(
        params.get('utm_campaign'),
        MAX_UTM_CAMPAIGN_LENGTH,
      );

      return {
        ...(utmSource ? { utmSource } : {}),
        ...(utmMedium ? { utmMedium } : {}),
        ...(utmCampaign ? { utmCampaign } : {}),
      };
    } catch {
      return {};
    }
  }

  private readFromStorage(): UtmParams {
    try {
      const raw = window.sessionStorage.getItem(UTM_STORAGE_KEY);
      if (!raw) {
        return {};
      }

      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') {
        return {};
      }

      const record = parsed as Record<string, unknown>;
      const utmSource = sanitizeUtmValue(
        record['utmSource'],
        MAX_UTM_SOURCE_LENGTH,
      );
      const utmMedium = sanitizeUtmValue(
        record['utmMedium'],
        MAX_UTM_MEDIUM_LENGTH,
      );
      const utmCampaign = sanitizeUtmValue(
        record['utmCampaign'],
        MAX_UTM_CAMPAIGN_LENGTH,
      );

      return {
        ...(utmSource ? { utmSource } : {}),
        ...(utmMedium ? { utmMedium } : {}),
        ...(utmCampaign ? { utmCampaign } : {}),
      };
    } catch {
      return {};
    }
  }

  private writeToStorage(params: UtmParams): void {
    try {
      window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(params));
    } catch {
      // Ignore storage quota or private-mode write errors
    }
  }
}
