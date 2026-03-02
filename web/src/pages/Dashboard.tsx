import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { StatCard } from '../components/dashboard/StatCard'
import { StudyHeatmap } from '../components/dashboard/StudyHeatmap'
import { TodaySchedule } from '../components/dashboard/TodaySchedule'
import { AiInsightCard } from '../components/dashboard/AiInsightCard'
import { Clock, Flame, BookOpen, Brain, Plus, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, doc, getDoc, orderBy, limit } from 'firebase/firestore'
import { db } from '@shared/api/firebase'
import type { Session, Streak } from '@shared/types'
import { getDefaultStreak } from '@shared/utils/streakUtils'

export default function Dashboard() {
    const { user, profile } = useAuth()
    const navigate = useNavigate()
    const today = new Date()

    const [sessions, setSessions] = useState<Session[]>([])
    const [streak, setStreak] = useState<Streak>(getDefaultStreak())
    const [loading, setLoading] = useState(true)

    // Load real data from Firestore
    useEffect(() => {
        if (!user) return
        const load = async () => {
            try {
                // Load sessions
                const sessionsRef = collection(db, 'users', user.uid, 'sessions')
                const q = query(sessionsRef, orderBy('date', 'desc'), limit(50))
                const snap = await getDocs(q)
                setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Session)))

                // Load streak
                const streakRef = doc(db, 'users', user.uid, 'streak', 'data')
                const streakSnap = await getDoc(streakRef)
                if (streakSnap.exists()) {
                    setStreak(streakSnap.data() as Streak)
                }
            } catch (err) {
                console.warn('Could not load dashboard data:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [user])

    // Calculate real stats
    const totalStudyHours = useMemo(() => {
        const total = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0)
        return (total / 60).toFixed(1)
    }, [sessions])

    const avgFocusScore = useMemo(() => {
        if (sessions.length === 0) return 0
        const total = sessions.reduce((sum, s) => sum + (s.focusScore || 0), 0)
        return Math.round(total / sessions.length)
    }, [sessions])

    // Use real heatmap data or fallback to demo
    const heatmapData = useMemo(() => {
        if (Object.keys(streak.heatmap).length > 0) {
            return streak.heatmap
        }
        // Fallback demo data if no real data yet
        const data: Record<string, number> = {}
        const now = new Date()
        for (let i = 0; i < 180; i++) {
            const d = new Date(now)
            d.setDate(d.getDate() - i)
            const key = d.toISOString().slice(0, 10)
            const rand = Math.random()
            if (rand > 0.3) {
                data[key] = Math.random() * 4
            }
        }
        return data
    }, [streak.heatmap])

    const scheduleItems = [
        {
            time: '10:00 - 11:30 AM',
            title: 'Physics: Mechanics Review',
            subtitle: 'Chapter 4 — Forces & Motion',
            tags: [
                { label: 'Pomodoro', color: '#6366F1' },
                { label: 'Chapter 4', color: '#A855F7' },
            ],
            isCurrent: true,
        },
        {
            time: '12:30 - 01:30 PM',
            title: 'Lunch Break',
            subtitle: 'Cafeteria',
            tags: [],
            isCurrent: false,
        },
        {
            time: '02:00 - 04:00 PM',
            title: 'Calculus II Assignment',
            tags: [{ label: 'Due Today', color: '#F59E0B' }],
            isCurrent: false,
        },
        {
            time: '05:00 - 06:00 PM',
            title: 'Group Study: Chemistry',
            subtitle: 'Organic Reactions',
            tags: [{ label: 'Group', color: '#10B981' }],
            isCurrent: false,
        },
    ]

    const greeting = useMemo(() => {
        const hour = today.getHours()
        if (hour < 12) return 'Good Morning'
        if (hour < 17) return 'Good Afternoon'
        return 'Good Evening'
    }, [today])

    return (
        <div className="animate-fade-in-up">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                <div>
                    <h1 className="text-display">
                        {greeting}, {profile?.name?.split(' ')[0] || 'Student'} 👋
                    </h1>
                    <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>
                        Here's your academic overview for today
                    </p>
                </div>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 16px', borderRadius: 'var(--radius-full)',
                    background: 'var(--color-bg-surface)',
                    border: '1px solid rgba(255,255,255,0.06)',
                }}>
                    <Calendar size={14} color="var(--color-text-muted)" />
                    <span className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {format(today, 'EEEE, MMMM d, yyyy')}
                    </span>
                </div>
            </div>

            {/* Stat Cards Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                <StatCard
                    icon={Clock}
                    iconColor="#6366F1"
                    label="Study Hours"
                    value={`${totalStudyHours}h`}
                    subtitle={`${sessions.length} sessions total`}
                    trend={sessions.length > 0 ? { value: `${sessions.length}`, positive: true } : undefined}
                />
                <StatCard
                    icon={Flame}
                    iconColor="#F97316"
                    label="Day Streak"
                    value={streak.current.toString()}
                    subtitle={streak.current > 0 ? 'Keep it burning!' : 'Start a session!'}
                    badge={streak.current > 0 ? { text: `Best: ${streak.longest}`, color: '#22C55E' } : undefined}
                />
                <StatCard
                    icon={BookOpen}
                    iconColor="#A855F7"
                    label="Avg Focus"
                    value={sessions.length > 0 ? `${avgFocusScore}%` : '—'}
                    subtitle={sessions.length > 0 ? 'Across all sessions' : 'Complete a session'}
                />
                <StatCard
                    icon={Brain}
                    iconColor="#EC4899"
                    label="Total Days"
                    value={Object.keys(streak.heatmap).length.toString()}
                    subtitle="Days studied"
                />
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '60% 1fr', gap: 20, marginBottom: 24 }}>
                <StudyHeatmap data={heatmapData} />
                <TodaySchedule items={scheduleItems} />
            </div>

            {/* AI Insight Card */}
            <AiInsightCard
                message={streak.current > 0
                    ? `Great job! You're on a ${streak.current}-day streak. Your average focus score is ${avgFocusScore}%. Try a Pomodoro session today to keep the momentum going!`
                    : 'Start your first Pomodoro session to build your streak! Select a subject and hit focus to begin tracking your study patterns.'}
                onDismiss={() => { }}
                onAction={() => navigate('/pomodoro')}
                actionLabel={streak.current > 0 ? 'Study Now' : 'Start Session'}
            />

            {/* FAB */}
            <motion.button
                className="fab"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 20 }}
                onClick={() => navigate('/pomodoro')}
            >
                <Plus size={24} />
            </motion.button>
        </div>
    )
}
