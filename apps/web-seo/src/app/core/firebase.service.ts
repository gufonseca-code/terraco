import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  TransferState,
  inject,
  makeStateKey,
} from '@angular/core';
import type { FirebaseApp } from 'firebase/app';
import type { AppCheck } from 'firebase/app-check';
import type { Firestore } from 'firebase/firestore';
import {
  FIREBASE_CONFIG,
  type FirebaseEnvironmentConfig,
  isFirebaseConfigured,
} from './site.config';

const FIREBASE_CONFIG_STATE_KEY = makeStateKey<FirebaseEnvironmentConfig>(
  'terraco:firebase-config'
);

const EMULATOR_CONNECTED_INSTANCES = new WeakSet<Firestore>();

function parseHostAndPort(
  hostPort: string,
  defaultPort: number
): { host: string; port: number } {
  const cleaned = hostPort.replace(/^https?:\/\//, '');
  const [hostPart, portPart] = cleaned.split(':');
  const parsedPort = portPart ? Number.parseInt(portPart, 10) : defaultPort;
  return {
    host: hostPart || '127.0.0.1',
    port: Number.isFinite(parsedPort) ? parsedPort : defaultPort,
  };
}

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly transferState = inject(TransferState);
  private readonly injectedConfig = inject(FIREBASE_CONFIG);

  readonly config: FirebaseEnvironmentConfig;
  readonly isConfigured: boolean;

  private appInstance: FirebaseApp | null = null;
  private firestoreInstance: Firestore | null = null;
  private appCheckInstance: AppCheck | null = null;

  constructor() {
    if (
      isPlatformBrowser(this.platformId) &&
      this.transferState.hasKey(FIREBASE_CONFIG_STATE_KEY)
    ) {
      const transferred = this.transferState.get(
        FIREBASE_CONFIG_STATE_KEY,
        this.injectedConfig
      );
      this.transferState.remove(FIREBASE_CONFIG_STATE_KEY);
      this.config = transferred;
    } else {
      this.config = this.injectedConfig;
      if (isPlatformServer(this.platformId)) {
        // Transfer public client config from SSR server env to browser hydration.
        this.transferState.set(FIREBASE_CONFIG_STATE_KEY, {
          apiKey: this.config.apiKey,
          authDomain: this.config.authDomain,
          projectId: this.config.projectId,
          storageBucket: this.config.storageBucket,
          messagingSenderId: this.config.messagingSenderId,
          appId: this.config.appId,
          measurementId: this.config.measurementId,
          firestoreDatabaseId: this.config.firestoreDatabaseId,
          recaptchaEnterpriseSiteKey: this.config.recaptchaEnterpriseSiteKey,
          useEmulators: this.config.useEmulators,
          emulators: this.config.emulators,
        });
      }
    }

    this.isConfigured = isFirebaseConfigured(this.config);
  }

  async getFirebaseApp(): Promise<FirebaseApp | null> {
    if (!this.isConfigured) {
      return null;
    }

    if (this.appInstance) {
      return this.appInstance;
    }

    const { getApp, getApps, initializeApp } = await import('firebase/app');
    const existingApps = getApps();
    this.appInstance =
      existingApps.length > 0
        ? getApp()
        : initializeApp({
            apiKey: this.config.apiKey,
            authDomain: this.config.authDomain,
            projectId: this.config.projectId,
            storageBucket: this.config.storageBucket,
            messagingSenderId: this.config.messagingSenderId,
            appId: this.config.appId,
            measurementId: this.config.measurementId,
          });

    return this.appInstance;
  }

  async getFirestore(): Promise<Firestore | null> {
    if (!this.isConfigured) {
      return null;
    }

    if (this.firestoreInstance) {
      return this.firestoreInstance;
    }

    const app = await this.getFirebaseApp();
    if (!app) {
      return null;
    }

    if (isPlatformBrowser(this.platformId)) {
      await this.initAppCheck();
    }

    const { connectFirestoreEmulator, getFirestore } = await import(
      'firebase/firestore'
    );

    const databaseId = this.config.firestoreDatabaseId;
    const db =
      databaseId && databaseId !== '(default)'
        ? getFirestore(app, databaseId)
        : getFirestore(app);

    if (this.config.useEmulators && !EMULATOR_CONNECTED_INSTANCES.has(db)) {
      const { host, port } = parseHostAndPort(
        this.config.emulators?.firestoreHost ?? '127.0.0.1:8080',
        8080
      );
      connectFirestoreEmulator(db, host, port);
      EMULATOR_CONNECTED_INSTANCES.add(db);
    }

    this.firestoreInstance = db;
    return db;
  }

  /**
   * Initializes Firebase App Check with reCAPTCHA Enterprise strictly in the browser.
   * Safe no-op on SSR server and when site key / Firebase config is absent.
   */
  async initAppCheck(): Promise<AppCheck | null> {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    if (this.appCheckInstance) {
      return this.appCheckInstance;
    }

    const siteKey = this.config.recaptchaEnterpriseSiteKey?.trim();
    if (!siteKey) {
      return null;
    }

    if (this.config.appCheckDebugToken) {
      (globalThis as Record<string, unknown>)['FIREBASE_APPCHECK_DEBUG_TOKEN'] =
        this.config.appCheckDebugToken;
    } else {
      const hostname =
        typeof window !== 'undefined' ? window.location.hostname : '';
      const isLocalhost =
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '[::1]';
      if (isLocalhost) {
        return null;
      }
    }

    const app = await this.getFirebaseApp();
    if (!app) {
      return null;
    }

    const { ReCaptchaEnterpriseProvider, initializeAppCheck } = await import(
      'firebase/app-check'
    );

    this.appCheckInstance = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });

    return this.appCheckInstance;
  }
}
