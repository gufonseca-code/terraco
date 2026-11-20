import {
  DestroyRef,
  Injectable,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const STORAGE_KEY = 'terraco:favoritos';
export const FAVORITES_EVENT = 'terraco-favorites-change';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly favorites = signal<string[]>([]);

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    this.favorites.set(this.readSnapshot());

    const handleStorage = (event: StorageEvent): void => {
      if (event.key === null || event.key === STORAGE_KEY) {
        this.favorites.set(this.readSnapshot());
      }
    };

    const handleCustomChange = (): void => {
      this.favorites.set(this.readSnapshot());
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(FAVORITES_EVENT, handleCustomChange);

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(FAVORITES_EVENT, handleCustomChange);
    });
  }

  isFavorited(slug: string): boolean {
    return this.favorites().includes(slug);
  }

  toggle(slug: string): void {
    if (!this.isBrowser) {
      return;
    }

    const current = this.readSnapshot();
    const next = current.includes(slug)
      ? current.filter((item) => item !== slug)
      : [...current, slug];

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota or private-mode write errors
    }

    this.favorites.set(next);
    window.dispatchEvent(new Event(FAVORITES_EVENT));
  }

  private readSnapshot(): string[] {
    if (!this.isBrowser) {
      return [];
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }

      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === 'string')
        : [];
    } catch {
      return [];
    }
  }
}
