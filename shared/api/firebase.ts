import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Platform-aware env access: Vite uses import.meta.env, React Native uses process.env
function getEnv(viteKey: string, expoKey: string): string {
    // Try Vite env first (web)
    try {
        const viteEnv = (import.meta as any)?.env?.[viteKey]
        if (viteEnv) return viteEnv
    } catch {}
    // Fallback to process.env (React Native / Expo)
    return (process.env as any)?.[expoKey] ?? ""
}

const firebaseConfig = {
    apiKey: getEnv("VITE_FIREBASE_API_KEY", "EXPO_PUBLIC_FIREBASE_API_KEY"),
    authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN", "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: getEnv("VITE_FIREBASE_PROJECT_ID", "EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET", "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: getEnv("VITE_FIREBASE_APP_ID", "EXPO_PUBLIC_FIREBASE_APP_ID"),
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()