
// @ts-ignore
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// @ts-ignore
import { getAuth } from 'firebase/auth';
// @ts-ignore
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
appId: import.meta.env.VITE_FIREBASE_APP_ID,
measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase only if it hasn't been initialized yet
let app;
try {
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
        // Analytics is optional, initialize if supported
        if (typeof window !== 'undefined') {
            try {
                getAnalytics(app);
            } catch (e) {
                console.log("Analytics not supported in this environment");
            }
        }
    } else {
        app = getApp();
    }
} catch (error) {
    console.error("Firebase initialization error:", error);
}

export const db = app ? getFirestore(app) : {} as any;
export const storage = app ? getStorage(app) : {} as any;
export const auth = app ? getAuth(app) : {} as any;
