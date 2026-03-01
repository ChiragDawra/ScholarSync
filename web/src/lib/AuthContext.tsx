import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut, type User as FirebaseUser } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, googleProvider, db } from '@shared/api/firebase'
import type { User } from '@shared/types'

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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser)
            if (firebaseUser) {
                try {
                    const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid, 'profile', 'data'))
                    if (profileDoc.exists()) {
                        setProfile(profileDoc.data() as User)
                    } else {
                        setProfile(null)
                    }
                } catch (err) {
                    console.warn('Could not load profile (Firebase may not be configured):', err)
                    setProfile(null)
                }
            } else {
                setProfile(null)
            }
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    const signInWithGoogle = useCallback(async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider)
            return result.user
        } catch (error: any) {
            if (error?.code === 'auth/configuration-not-found' || error?.code === 'auth/invalid-api-key') {
                alert('Firebase not configured yet!\n\nTo enable Google Sign-In, create a Firebase project and add your credentials to web/.env.local\n\nSee the implementation plan for details.')
            }
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
        setProfile((prev) => prev ? { ...prev, ...profileData } as User : profileData as User)
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
