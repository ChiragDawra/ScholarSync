import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import {
    LayoutDashboard, BookOpen, ClipboardList, Timer, Target,
    BarChart3, Calculator, Sparkles, Settings, Flame
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@shared/api/firebase'
import type { Streak } from '@shared/types'

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/exams', label: 'Exams', icon: BookOpen },
    { path: '/assignments', label: 'Assignments', icon: ClipboardList },
    { path: '/pomodoro', label: 'Pomodoro', icon: Timer },
    { path: '/goals', label: 'Goals', icon: Target },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/gpa', label: 'GPA Predictor', icon: Calculator },
    { path: '/ai-coach', label: 'AI Coach', icon: Sparkles },
]

export function Sidebar() {
    const { user, profile } = useAuth()
    const location = useLocation()
    const [streak, setStreak] = useState(0)

    useEffect(() => {
        if (!user) return
        const loadStreak = async () => {
            try {
                const streakRef = doc(db, 'users', user.uid, 'streak', 'data')
                const snap = await getDoc(streakRef)
                if (snap.exists()) setStreak((snap.data() as Streak).current || 0)
            } catch { }
        }
        loadStreak()
    }, [user])

    return (
        <aside style={{
            width: 260,
            minHeight: '100vh',
            background: 'var(--color-bg-sidebar)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px 12px',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 40,
            overflowY: 'auto',
        }}>
            {/* User Profile */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '8px 12px',
                marginBottom: 8,
            }}>
                <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-alt))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                }}>
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>
                            {(profile?.name || user?.displayName || 'U').charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {profile?.name || user?.displayName || 'Student'}
                    </div>
                    {profile?.college && (
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                            {profile.college}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', margin: '8px 0 12px' }} />

            {/* Navigation */}
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path
                    const Icon = item.icon
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '10px 16px',
                                borderRadius: 'var(--radius-md)',
                                textDecoration: 'none',
                                fontSize: 14,
                                fontWeight: isActive ? 600 : 400,
                                color: isActive ? 'white' : 'var(--color-text-secondary)',
                                background: isActive ? 'var(--color-brand)' : 'transparent',
                                transition: 'all 150ms ease',
                                height: 44,
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                                    e.currentTarget.style.color = 'var(--color-text-primary)'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'transparent'
                                    e.currentTarget.style.color = 'var(--color-text-secondary)'
                                }
                            }}
                        >
                            <Icon size={18} />
                            <span>{item.label}</span>
                            {item.label === 'AI Coach' && (
                                <span className="badge-muted" style={{
                                    marginLeft: 'auto',
                                    fontSize: 10,
                                    padding: '1px 6px',
                                }}>Beta</span>
                            )}
                            {item.label === 'Pomodoro' && streak > 0 && (
                                <span style={{
                                    marginLeft: 'auto',
                                    display: 'inline-flex', alignItems: 'center', gap: 3,
                                    fontSize: 11, fontWeight: 700,
                                    color: '#F97316',
                                    background: 'rgba(249,115,22,0.1)',
                                    padding: '1px 8px',
                                    borderRadius: 'var(--radius-full)',
                                }}>
                                    <Flame size={10} /> {streak}
                                </span>
                            )}
                        </NavLink>
                    )
                })}
            </nav>

            {/* Bottom — Settings only */}
            <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 8 }} />
                <NavLink
                    to="/settings"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 16px',
                        borderRadius: 'var(--radius-md)',
                        textDecoration: 'none',
                        fontSize: 14,
                        color: location.pathname === '/settings' ? 'white' : 'var(--color-text-secondary)',
                        background: location.pathname === '/settings' ? 'var(--color-brand)' : 'transparent',
                        height: 44,
                    }}
                >
                    <Settings size={18} />
                    <span>Settings</span>
                </NavLink>
            </div>
        </aside>
    )
}
