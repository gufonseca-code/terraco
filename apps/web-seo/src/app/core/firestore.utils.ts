export const FIRESTORE_READ_TIMEOUT_MS = 3500;

export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Firestore read timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

export function serializeTimestamp(value: unknown): string | null | undefined {
  if (value === null || value === undefined) {
    return value as null | undefined;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: unknown }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return undefined;
}

export function pickNonEmptyString(remote: unknown, fallback?: string): string {
  return typeof remote === 'string' && remote.trim().length > 0
    ? remote
    : (fallback ?? '');
}

export function pickNonEmptyArray<T>(remote: unknown, fallback?: T[]): T[] {
  return Array.isArray(remote) && remote.length > 0
    ? (remote as T[])
    : (fallback ?? []);
}
