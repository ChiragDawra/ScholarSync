import { useMemo } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { StatCard } from '../components/dashboard/StatCard'
import { StudyHeatmap } from '../components/dashboard/StudyHeatmap'
import { TodaySchedule } from '../components/dashboard/TodaySchedule'
import { AiInsightCard } from '../components/dashboard/AiInsightCard'
import { Clock, Flame, BookOpen, Brain, Plus, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
    const { user, profile } = useAuth()
    const navigate = useNavigate()
    const today = new Date()

    // Generate sample heatmap data for demo
    const heatmapData = useMemo(() => {
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
    }, [])

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
                    value="32.5h"
                    subtitle="vs last week"
                    trend={{ value: '+12%', positive: true }}
                />
                <StatCard
                    icon={Flame}
                    iconColor="#F97316"
                    label="Day Streak"
                    value="12"
                    subtitle="Keep it burning!"
                    badge={{ text: '+1', color: '#22C55E' }}
                />
                <StatCard
                    icon={BookOpen}
                    iconColor="#A855F7"
                    label="Upcoming Exams"
                    value="3"
                    subtitle="Next: Physics in 4 days"
                />
                <StatCard
                    icon={Brain}
                    iconColor="#EC4899"
                    label="Focus Area"
                    value="Chemistry"
                    subtitle="Lowest study time"
                    badge={{ text: '1 Overdue', color: '#EF4444' }}
                />
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '60% 1fr', gap: 20, marginBottom: 24 }}>
                <StudyHeatmap data={heatmapData} />
                <TodaySchedule items={scheduleItems} />
            </div>

            {/* AI Insight Card */}
            <AiInsightCard
                message="You study 40% less before weekends. Your Physics exam is in 4 days — start today with 2 Pomodoro sessions focused on Mechanics to avoid last-minute cramming."
                onDismiss={() => { }}
                onAction={() => navigate('/ai-coach')}
                actionLabel="Create Plan"
            />

            {/* FAB */}
            <motion.button
                className="fab"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 20 }}
                onClick={() => { }}
            >
                <Plus size={24} />
            </motion.button>
        </div>
    )
}
