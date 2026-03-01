import { useState, useEffect, useCallback } from 'react'
import {
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, googleProvider, db } from '../api/firebase'
import type { User } from '../types'

export function useAuth() {
    const [user, setUser] = useState<FirebaseUser | null>(null)
    const [profile, setProfile] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser)
            if (firebaseUser) {
                const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid, 'profile', 'data'))
                if (profileDoc.exists()) {
                    setProfile(profileDoc.data() as User)
                } else {
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
        } catch (error) {
            console.error('Sign in error:', error)
            throw error
        }
    }, [])

    const signOut = useCallback(async () => {
        await firebaseSignOut(auth)
        setProfile(null)
    }, [])

    const saveProfile = useCallback(async (profileData: Partial<User>) => {
        if (!user) return
        const ref = doc(db, 'users', user.uid, 'profile', 'data')
        await setDoc(ref, { ...profileData, uid: user.uid }, { merge: true })
        setProfile((prev) => prev ? { ...prev, ...profileData } : profileData as User)
    }, [user])

    return {
        user,
        profile,
        loading,
        signInWithGoogle,
        signOut,
        saveProfile,
        isAuthenticated: !!user,
        needsOnboarding: !!user && !profile?.onboardingComplete,
    }
}
