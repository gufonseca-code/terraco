import { InjectionToken } from '@angular/core';

export const SITE_NAME = 'Terraço';

export const SITE_URL = 'https://terraco-a5ff7.web.app';

export const FLUTTER_APP_URL = 'https://app.terraco.com.br';

export const ENABLE_FLUTTER_APP_LINKS = false;

export const SITE_HERO_IMAGE_URL =
  'https://firebasestorage.googleapis.com/v0/b/terraco-a5ff7.firebasestorage.app/o/site%2Fimages%2Fhero-terraco.webp?alt=media';

export const DEFAULT_LAUNCH_OG_IMAGE_URL =
  'https://firebasestorage.googleapis.com/v0/b/terraco-a5ff7.firebasestorage.app/o/launches%2Fprime-view%2Fimages%2Fprime-view.webp?alt=media';

export interface FirebaseEmulatorEndpoints {
  readonly authHost?: string;
  readonly firestoreHost?: string;
  readonly storageHost?: string;
}

export interface FirebaseEnvironmentConfig {
  readonly apiKey: string;
  readonly authDomain: string;
  readonly projectId: string;
  readonly storageBucket: string;
  readonly messagingSenderId: string;
  readonly appId: string;
  readonly measurementId?: string;
  readonly firestoreDatabaseId?: string;
  readonly recaptchaEnterpriseSiteKey?: string;
  readonly appCheckDebugToken?: string | boolean;
  readonly useEmulators?: boolean;
  readonly emulators?: FirebaseEmulatorEndpoints;
}

export const DEFAULT_FIREBASE_CONFIG: FirebaseEnvironmentConfig = {
  apiKey: 'AIzaSyBKOdqHRbLWF-wxxM2DuVcn7YHWneBxFWk',
  authDomain: 'terraco-a5ff7.firebaseapp.com',
  projectId: 'terraco-a5ff7',
  storageBucket: 'terraco-a5ff7.firebasestorage.app',
  messagingSenderId: '781209113133',
  appId: '1:781209113133:web:ba33ca0e71755faed79ea4',
  measurementId: 'G-TM99M0DRMF',
  firestoreDatabaseId: '(default)',
  recaptchaEnterpriseSiteKey: '6LeStysuAAAAAMLothdZ4Fb4-DHKvDMqt35IZLtM',
  useEmulators: false,
  emulators: {
    authHost: 'http://127.0.0.1:9099',
    firestoreHost: '127.0.0.1:8080',
    storageHost: 'http://127.0.0.1:9199',
  },
};

export function isFirebaseConfigured(
  config: FirebaseEnvironmentConfig
): boolean {
  if (config.useEmulators) {
    return Boolean(config.projectId);
  }
  return Boolean(
    config.apiKey &&
      config.apiKey !== 'demo-terraco-api-key' &&
      config.projectId &&
      config.appId &&
      !config.appId.endsWith(':terraco000000')
  );
}

/**
 * Resolves runtime Firebase configuration from server environment variables
 * (e.g. Firebase App Hosting / Cloud Run) merged on top of defaults.
 * Safe to call in browser bundles (no direct Node `process` import).
 */
export function resolveFirebaseEnvConfig(
  base: FirebaseEnvironmentConfig = DEFAULT_FIREBASE_CONFIG
): FirebaseEnvironmentConfig {
  const env = (
    globalThis as { process?: { env?: Record<string, string | undefined> } }
  ).process?.env;

  if (!env) {
    return base;
  }

  const useEmulatorsRaw =
    env['NG_APP_FIREBASE_USE_EMULATORS'] ?? env['FIRESTORE_EMULATOR_HOST'];
  const useEmulators =
    useEmulatorsRaw === 'true' ||
    useEmulatorsRaw === '1' ||
    Boolean(env['FIRESTORE_EMULATOR_HOST']) ||
    base.useEmulators;

  const debugTokenRaw =
    env['NG_APP_FIREBASE_APPCHECK_DEBUG_TOKEN'] ??
    env['FIREBASE_APPCHECK_DEBUG_TOKEN'];
  const appCheckDebugToken =
    debugTokenRaw === 'true'
      ? true
      : debugTokenRaw || base.appCheckDebugToken;

  return {
    ...base,
    apiKey: env['NG_APP_FIREBASE_API_KEY'] ?? base.apiKey,
    authDomain: env['NG_APP_FIREBASE_AUTH_DOMAIN'] ?? base.authDomain,
    projectId: env['NG_APP_FIREBASE_PROJECT_ID'] ?? base.projectId,
    storageBucket: env['NG_APP_FIREBASE_STORAGE_BUCKET'] ?? base.storageBucket,
    messagingSenderId:
      env['NG_APP_FIREBASE_MESSAGING_SENDER_ID'] ?? base.messagingSenderId,
    appId: env['NG_APP_FIREBASE_APP_ID'] ?? base.appId,
    measurementId: env['NG_APP_FIREBASE_MEASUREMENT_ID'] ?? base.measurementId,
    firestoreDatabaseId:
      env['NG_APP_FIRESTORE_DATABASE_ID'] ?? base.firestoreDatabaseId,
    recaptchaEnterpriseSiteKey:
      env['NG_APP_RECAPTCHA_ENTERPRISE_SITE_KEY'] ??
      base.recaptchaEnterpriseSiteKey,
    appCheckDebugToken,
    useEmulators,
    emulators: {
      ...base.emulators,
      firestoreHost:
        env['FIRESTORE_EMULATOR_HOST'] ??
        env['NG_APP_FIRESTORE_EMULATOR_HOST'] ??
        base.emulators?.firestoreHost,
    },
  };
}

export const FIREBASE_CONFIG = new InjectionToken<FirebaseEnvironmentConfig>(
  'terraco.firebase.config',
  {
    providedIn: 'root',
    factory: () => resolveFirebaseEnvConfig(DEFAULT_FIREBASE_CONFIG),
  }
);
