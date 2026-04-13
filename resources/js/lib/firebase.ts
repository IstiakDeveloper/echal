import { getAnalytics, isSupported } from 'firebase/analytics';
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';

type FirebaseWebConfig = {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
};

function readConfig(): FirebaseWebConfig | null {
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
    const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
    const appId = import.meta.env.VITE_FIREBASE_APP_ID;

    if (
        !apiKey ||
        !authDomain ||
        !projectId ||
        !storageBucket ||
        !messagingSenderId ||
        !appId
    ) {
        return null;
    }

    const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;

    return {
        apiKey,
        authDomain,
        projectId,
        storageBucket,
        messagingSenderId,
        appId,
        ...(measurementId ? { measurementId } : {}),
    };
}

let app: FirebaseApp | null = null;

/**
 * Singleton Firebase app. Throws if VITE_FIREBASE_* env vars are missing.
 */
export function getFirebaseApp(): FirebaseApp {
    if (app) {
        return app;
    }

    const existing = getApps()[0];
    if (existing) {
        app = existing;

        return app;
    }

    const config = readConfig();
    if (!config) {
        throw new Error(
            'Firebase is not configured. Add VITE_FIREBASE_* variables to your .env (see .env.example).',
        );
    }

    app = initializeApp(config);

    return app;
}

/**
 * Initialize Firebase (Analytics only runs in supported browsers).
 * Safe to call when env is unset — no-op.
 */
export function initFirebase(): void {
    if (typeof window === 'undefined') {
        return;
    }

    if (!readConfig()) {
        return;
    }

    const firebaseApp = getFirebaseApp();

    void isSupported().then((supported) => {
        if (supported) {
            getAnalytics(firebaseApp);
        }
    });
}
