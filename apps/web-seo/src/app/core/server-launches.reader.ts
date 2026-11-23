import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Lancamento } from './lancamentos.data';
import {
  ServerLaunchesReader,
  normalizeLancamento,
} from './lancamentos.service';
import { resolveFirebaseEnvConfig } from './site.config';

const LAUNCHES_COLLECTION = 'launches';
const ADMIN_APP_NAME = 'terraco-ssr-admin';

function getAdminFirestore() {
  const config = resolveFirebaseEnvConfig();
  const existing = getApps().find((app) => app.name === ADMIN_APP_NAME);

  const app =
    existing ??
    initializeApp(
      {
        projectId: config.projectId,
        ...(config.useEmulators ? {} : { credential: applicationDefault() }),
      },
      ADMIN_APP_NAME
    );

  const databaseId = config.firestoreDatabaseId;
  return databaseId && databaseId !== '(default)'
    ? getFirestore(app, databaseId)
    : getFirestore(app);
}

/**
 * Server-only Firestore reader powered by `firebase-admin`.
 * Trusted server credentials bypass App Check safely during SSR & prerendering,
 * allowing `firestore.googleapis.com` to remain `ENFORCED` for browser clients.
 */
export function createServerLaunchesReader(): ServerLaunchesReader {
  return {
    async loadList(): Promise<Lancamento[]> {
      const db = getAdminFirestore();
      const colRef = db.collection(LAUNCHES_COLLECTION);

      try {
        const snap = await colRef
          .where('published', '==', true)
          .orderBy('order', 'asc')
          .get();
        return snap.docs.map((docSnap) =>
          normalizeLancamento(
            docSnap.id,
            docSnap.data() as Record<string, unknown>
          )
        );
      } catch {
        const snap = await colRef.get();
        return snap.docs
          .map((docSnap) =>
            normalizeLancamento(
              docSnap.id,
              docSnap.data() as Record<string, unknown>
            )
          )
          .filter((item) => item.published !== false)
          .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      }
    },

    async loadBySlug(slug: string): Promise<Lancamento | undefined> {
      const db = getAdminFirestore();
      const snap = await db.collection(LAUNCHES_COLLECTION).doc(slug).get();
      if (!snap.exists) {
        return undefined;
      }

      const raw = snap.data() as Record<string, unknown>;
      if (raw['published'] === false) {
        return undefined;
      }

      return normalizeLancamento(snap.id, raw);
    },
  };
}
