import { useAuth } from '@/lib/AuthContext'
import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Login() {
    const { signInWithGoogle } = useAuth()

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-bg-base)',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Background gradient orbs */}
            <div style={{
                position: 'absolute',
                width: 500,
                height: 500,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(91,91,214,0.15) 0%, transparent 70%)',
                top: -100,
                right: -100,
            }} />
            <div style={{
                position: 'absolute',
                width: 400,
                height: 400,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
                bottom: -100,
                left: -50,
            }} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                    background: 'var(--color-bg-surface)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '48px 40px',
                    maxWidth: 440,
                    width: '100%',
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 1,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                }}
            >
                {/* Logo */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    marginBottom: 32,
                }}>
                    <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 'var(--radius-lg)',
                        background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-alt))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Sparkles size={24} color="white" />
                    </div>
                    <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
                        Scholar<span style={{ color: 'var(--color-brand)' }}>Sync</span>
                    </span>
                </div>

                <h1 style={{
                    fontSize: 24,
                    fontWeight: 700,
                    marginBottom: 8,
                    lineHeight: 1.3,
                }}>
                    Welcome Back 👋
                </h1>
                <p style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: 15,
                    marginBottom: 36,
                    lineHeight: 1.6,
                }}>
                    Your all-in-one academic operating system.<br />
                    Sign in to continue your study streak!
                </p>

                <button
                    onClick={signInWithGoogle}
                    style={{
                        width: '100%',
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12,
                        background: 'white',
                        color: '#1f1f1f',
                        border: 'none',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                        transition: 'all 150ms ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)'
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Sign in with Google
                </button>

                <p style={{
                    color: 'var(--color-text-muted)',
                    fontSize: 12,
                    marginTop: 24,
                }}>
                    One app. Every academic habit. Zero excuses.
                </p>
            </motion.div>
        </div>
    )
}
