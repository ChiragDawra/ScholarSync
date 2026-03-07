import {
    createContext, useContext, useState, useEffect,
    useCallback, ReactNode
} from 'react'
import {
    onAuthStateChanged,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signOut as fbSignOut,
    type User as FirebaseUser
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, googleProvider, db } from '@shared/api/firebase'
import type { User } from '@shared/types'
import toast from 'react-hot-toast'

interface AuthContextType {
    user: FirebaseUser | null
    profile: User | null
    loading: boolean
    signInWithGoogle: () => Promise<FirebaseUser>
    signOut: () => Promise<void>
    saveProfile: (data: Partial<User>) => Promise<void>
    isAuthenticated: boolean
    needsOnboarding: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<FirebaseUser | null>(null)
    const [profile, setProfile] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    // Handle redirect result on initial load (fallback from popup-blocked scenario)
    useEffect(() => {
        getRedirectResult(auth)
            .then((result) => {
                if (result?.user) {
                    // onAuthStateChanged will pick this up automatically
                    console.log('Redirect sign-in successful:', result.user.displayName)
                }
            })
            .catch((error) => {
                // Only log real errors, not the "no redirect" case
                if (error?.code !== 'auth/no-auth-event') {
                    console.warn('Redirect result error:', error?.code)
                }
            })
    }, [])

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser)
            if (firebaseUser) {
                try {
                    const profileDoc = await getDoc(
                        doc(db, 'users', firebaseUser.uid, 'profile', 'data')
                    )
                    setProfile(profileDoc.exists() ? (profileDoc.data() as User) : null)
                } catch (err) {
                    console.warn('Could not load profile:', err)
                    setProfile(null)
                }
            } else {
                setProfile(null)
            }
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    const signInWithGoogle = useCallback(async (): Promise<FirebaseUser> => {
        try {
            const result = await signInWithPopup(auth, googleProvider)
            return result.user
        } catch (error: any) {
            const code = error?.code as string

            // Popup was blocked by the browser — fall back to redirect flow
            if (code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user') {
                toast('Opening Google sign-in…', { icon: '🔑' })
                await signInWithRedirect(auth, googleProvider)
                // Page will redirect — promise never resolves here
                return new Promise(() => {})
            }

            // Misconfiguration errors
            if (
                code === 'auth/configuration-not-found' ||
                code === 'auth/invalid-api-key' ||
                code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.'
            ) {
                toast.error('Firebase is not configured correctly. Check your .env.local file.')
                console.error('Firebase config error:', code)
                throw error
            }

            // Domain not authorized in Firebase Console
            if (code === 'auth/unauthorized-domain') {
                toast.error(
                    'This domain is not authorized. Add it in Firebase Console → Authentication → Settings → Authorized domains.'
                )
                console.error('Unauthorized domain. Add localhost and your deploy URL to Firebase Console.')
                throw error
            }

            // Any other error
            console.error('Google sign-in failed:', code, error.message)
            toast.error(`Sign-in failed: ${error.message ?? code}`)
            throw error
        }
    }, [])

    const signOut = useCallback(async () => {
        await fbSignOut(auth)
        setProfile(null)
    }, [])

    const saveProfile = useCallback(async (profileData: Partial<User>) => {
        if (!user) return
        const ref = doc(db, 'users', user.uid, 'profile', 'data')
        await setDoc(ref, { ...profileData, uid: user.uid }, { merge: true })
        setProfile((prev) =>
            prev ? ({ ...prev, ...profileData } as User) : (profileData as User)
        )
    }, [user])

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            signInWithGoogle,
            signOut,
            saveProfile,
            isAuthenticated: !!user,
            needsOnboarding: !!user && !profile?.onboardingComplete,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
