"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "terraco:favoritos";
const FAVORITES_EVENT = "terraco-favorites-change";
const EMPTY_FAVORITES: string[] = [];

let cachedRaw: string | null = null;
let cachedList: string[] = EMPTY_FAVORITES;

function readFavoritesSnapshot(): string[] {
  if (typeof window === "undefined") return EMPTY_FAVORITES;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedList;

    cachedRaw = raw;
    if (!raw) {
      cachedList = EMPTY_FAVORITES;
      return cachedList;
    }

    const parsed = JSON.parse(raw);
    cachedList = Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : EMPTY_FAVORITES;
    return cachedList;
  } catch {
    return EMPTY_FAVORITES;
  }
}

function getServerSnapshot(): string[] {
  return EMPTY_FAVORITES;
}

function subscribeFavorites(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === STORAGE_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(FAVORITES_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(FAVORITES_EVENT, onStoreChange);
  };
}

/**
 * Persists and notifies favorite property slug changes in localStorage.
 */
export function toggleFavoriteSlug(slug: string): void {
  if (typeof window === "undefined") return;

  const current = readFavoritesSnapshot();
  const next = current.includes(slug)
    ? current.filter((item) => item !== slug)
    : [...current, slug];

  const serialized = JSON.stringify(next);
  cachedRaw = serialized;
  cachedList = next;

  try {
    window.localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // Ignore storage quota or private-mode write errors
  }

  window.dispatchEvent(new Event(FAVORITES_EVENT));
}

/**
 * Returns the reactive list of favorited property slugs.
 */
export function useFavorites(): string[] {
  return useSyncExternalStore(
    subscribeFavorites,
    readFavoritesSnapshot,
    getServerSnapshot
  );
}

interface FavoriteButtonProps {
  slug: string;
  nome: string;
}

/**
 * Interactive favorite toggle button styled with the Rosa Goiaba highlight token.
 */
export function FavoriteButton({ slug, nome }: FavoriteButtonProps) {
  const favorites = useFavorites();
  const isFavorited = favorites.includes(slug);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavoriteSlug(slug);
      }}
      aria-pressed={isFavorited}
      aria-label={
        isFavorited
          ? `Remover ${nome} dos favoritos`
          : `Salvar ${nome} nos favoritos`
      }
      className={`terraco-btn group inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border cursor-pointer backdrop-blur-sm ${
        isFavorited
          ? "border-highlight bg-highlight text-ink shadow-card"
          : "border-border-subtle bg-elevated/92 text-ink shadow-card hover:border-ink/25 hover:bg-elevated hover:text-highlight"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`h-4 w-4 transition-transform duration-200 ease-out group-active:scale-90 motion-reduce:transition-none ${
          isFavorited ? "scale-110 fill-current" : "scale-100"
        }`}
      >
        <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
      </svg>
    </button>
  );
}
