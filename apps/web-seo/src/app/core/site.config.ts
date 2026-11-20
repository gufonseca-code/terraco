import { InjectionToken } from '@angular/core';

export const SITE_NAME = 'Terraço';

export const SITE_URL = 'https://terraco-a5ff7.web.app';

export const FLUTTER_APP_URL = 'https://app.terraco.com.br';

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
  readonly useEmulators?: boolean;
  readonly emulators?: FirebaseEmulatorEndpoints;
}

export const DEFAULT_FIREBASE_CONFIG: FirebaseEnvironmentConfig = {
  apiKey: 'demo-terraco-api-key',
  authDomain: 'terraco-a5ff7.firebaseapp.com',
  projectId: 'terraco-a5ff7',
  storageBucket: 'terraco-a5ff7.firebasestorage.app',
  messagingSenderId: '781209113133',
  appId: '1:781209113133:web:terraco000000',
  useEmulators: false,
  emulators: {
    authHost: 'http://127.0.0.1:9099',
    firestoreHost: '127.0.0.1:8080',
    storageHost: '127.0.0.1:9199',
  },
};

export const FIREBASE_CONFIG = new InjectionToken<FirebaseEnvironmentConfig>(
  'terraco.firebase.config',
  {
    providedIn: 'root',
    factory: () => DEFAULT_FIREBASE_CONFIG,
  }
);
