import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { motion } from 'framer-motion'
import {
    Clock, Target, BookOpen, CheckCircle2, TrendingUp,
    Activity, PieChart as PiIcon, Flame
} from 'lucide-react'
import { collection, getDocs, query, orderBy, doc, getDoc, limit } from 'firebase/firestore'
import { db } from '@shared/api/firebase'
import type { Session, Streak, Assignment, Goal } from '@shared/types'
import { getDefaultStreak } from '@shared/utils/streakUtils'
import { format, subDays, startOfDay } from 'date-fns'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Area, AreaChart, Legend,
} from 'recharts'

const CHART_COLORS = ['#6366F1', '#A855F7', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#F97316', '#14B8A6', '#8B5CF6']
const STATUS_COLORS: Record<string, string> = { todo: '#6366F1', in_progress: '#F59E0B', done: '#10B981' }
const STATUS_LABELS: Record<string, string> = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' }

function StatCardSmall({ icon: Icon, iconColor, label, value, subtitle }: {
    icon: any; iconColor: string; label: string; value: string; subtitle?: string
}) {
    return (
        <motion.div
            className="surface-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px' }}
        >
            <div style={{
                width: 44, height: 44, borderRadius: 'var(--radius-md)',
                background: `${iconColor}15`, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
            }}>
                <Icon size={20} color={iconColor} />
            </div>
            <div>
                <p className="text-label" style={{ color: 'var(--color-text-muted)', marginBottom: 2 }}>{label}</p>
                <p className="text-heading-md" style={{ fontSize: 22, lineHeight: 1 }}>{value}</p>
                {subtitle && (
                    <p className="text-body-sm" style={{ color: 'var(--color-text-muted)', marginTop: 2 }}>{subtitle}</p>
                )}
            </div>
        </motion.div>
    )
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{
            background: 'var(--color-bg-raised)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 'var(--radius-md)', padding: '10px 14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
            <p className="text-body-sm" style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} className="text-body-sm" style={{ color: p.color, fontWeight: 600 }}>
                    {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
                </p>
            ))}
        </div>
    )
}

export default function Analytics() {
    const { user, profile } = useAuth()
    const [sessions, setSessions] = useState<Session[]>([])
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [goals, setGoals] = useState<Goal[]>([])
    const [streak, setStreak] = useState<Streak>(getDefaultStreak())
    const [loading, setLoading] = useState(true)
    const subjects = profile?.subjects || []

    useEffect(() => {
        if (!user) return
        const load = async () => {
            try {
                // Sessions
                const sessSnap = await getDocs(query(
                    collection(db, 'users', user.uid, 'sessions'), orderBy('date', 'desc'), limit(100)
                ))
                setSessions(sessSnap.docs.map(d => ({ id: d.id, ...d.data() } as Session)))

                // Assignments
                const assignSnap = await getDocs(collection(db, 'users', user.uid, 'assignments'))
                setAssignments(assignSnap.docs.map(d => ({ id: d.id, ...d.data() } as Assignment)))

                // Goals
                const goalsSnap = await getDocs(collection(db, 'users', user.uid, 'goals'))
                setGoals(goalsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Goal)))

                // Streak
                const streakSnap = await getDoc(doc(db, 'users', user.uid, 'streak', 'data'))
                if (streakSnap.exists()) setStreak(streakSnap.data() as Streak)
            } catch (err) {
                console.warn('Analytics load error:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [user])

    // ── Computed Stats ──
    const totalHours = useMemo(() => {
        const mins = sessions.reduce((s, x) => s + (x.durationMinutes || 0), 0)
        return (mins / 60).toFixed(1)
    }, [sessions])

    const avgFocus = useMemo(() => {
        if (!sessions.length) return 0
        return Math.round(sessions.reduce((s, x) => s + (x.focusScore || 0), 0) / sessions.length)
    }, [sessions])

    const completedGoals = useMemo(() => goals.filter(g => g.done).length, [goals])

    // ── Study Hours (Last 7 Days) ──
    const studyByDay = useMemo(() => {
        const days: { day: string; hours: number }[] = []
        for (let i = 6; i >= 0; i--) {
            const d = subDays(new Date(), i)
            const key = format(d, 'yyyy-MM-dd')
            const label = format(d, 'EEE')
            const mins = sessions
                .filter(s => {
                    const sd = s.date?.toDate ? s.date.toDate() : new Date(s.date as any)
                    return format(sd, 'yyyy-MM-dd') === key
                })
                .reduce((sum, s) => sum + (s.durationMinutes || 0), 0)
            days.push({ day: label, hours: +(mins / 60).toFixed(1) })
        }
        return days
    }, [sessions])

    // ── Focus Score Trend ──
    const focusTrend = useMemo(() => {
        return sessions.slice(0, 20).reverse().map((s, i) => ({
            session: `#${i + 1}`,
            focus: s.focusScore || 0,
        }))
    }, [sessions])

    // ── Subject Distribution ──
    const subjectDist = useMemo(() => {
        const map: Record<string, number> = {}
        sessions.forEach(s => {
            const sub = subjects.find(x => x.id === s.subjectId)
            const name = sub?.name || 'Other'
            map[name] = (map[name] || 0) + (s.durationMinutes || 0)
        })
        return Object.entries(map)
            .map(([name, mins]) => ({ name, hours: +(mins / 60).toFixed(1) }))
            .sort((a, b) => b.hours - a.hours)
    }, [sessions, subjects])

    // ── Assignment Status ──
    const assignmentStatus = useMemo(() => {
        const map: Record<string, number> = { todo: 0, in_progress: 0, done: 0 }
        assignments.forEach(a => { map[a.status] = (map[a.status] || 0) + 1 })
        return Object.entries(map)
            .filter(([, v]) => v > 0)
            .map(([status, count]) => ({ name: STATUS_LABELS[status], value: count, color: STATUS_COLORS[status] }))
    }, [assignments])

    if (loading) {
        return (
            <div className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
                <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    border: '3px solid var(--color-bg-raised)', borderTopColor: 'var(--color-brand)',
                    animation: 'spin 0.8s linear infinite',
                }} />
            </div>
        )
    }

    return (
        <div className="animate-fade-in-up">
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <h1 className="text-display" style={{ marginBottom: 4 }}>Analytics Dashboard</h1>
                <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)' }}>
                    Understand your study patterns and identify areas to improve
                </p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                <StatCardSmall icon={Clock} iconColor="#6366F1" label="Study Hours" value={`${totalHours}h`} subtitle={`${sessions.length} sessions`} />
                <StatCardSmall icon={Activity} iconColor="#EC4899" label="Avg Focus" value={sessions.length ? `${avgFocus}%` : '—'} subtitle="Across all sessions" />
                <StatCardSmall icon={Flame} iconColor="#F97316" label="Current Streak" value={streak.current.toString()} subtitle={`Best: ${streak.longest}`} />
                <StatCardSmall icon={CheckCircle2} iconColor="#10B981" label="Goals Done" value={completedGoals.toString()} subtitle={`of ${goals.length} total`} />
            </div>

            {/* Charts Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                {/* Study Hours Bar Chart */}
                <div className="surface-card" style={{ padding: '24px' }}>
                    <h3 className="text-heading-sm" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TrendingUp size={16} color="#6366F1" /> Study Hours (Last 7 Days)
                    </h3>
                    {studyByDay.some(d => d.hours > 0) ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={studyByDay}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} unit="h" />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="hours" name="Hours" fill="#6366F1" radius={[6, 6, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p className="text-body-md" style={{ color: 'var(--color-text-muted)' }}>
                                No study sessions this week — start a Pomodoro!
                            </p>
                        </div>
                    )}
                </div>

                {/* Focus Score Trend */}
                <div className="surface-card" style={{ padding: '24px' }}>
                    <h3 className="text-heading-sm" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Activity size={16} color="#EC4899" /> Focus Score Trend
                    </h3>
                    {focusTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={focusTrend}>
                                <defs>
                                    <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="session" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} domain={[0, 100]} unit="%" />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="focus" name="Focus" stroke="#EC4899" fill="url(#focusGrad)" strokeWidth={2} dot={{ r: 3, fill: '#EC4899' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p className="text-body-md" style={{ color: 'var(--color-text-muted)' }}>
                                Complete sessions to see your focus trend
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Charts Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                {/* Subject Distribution */}
                <div className="surface-card" style={{ padding: '24px' }}>
                    <h3 className="text-heading-sm" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BookOpen size={16} color="#A855F7" /> Time by Subject
                    </h3>
                    {subjectDist.length > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            <ResponsiveContainer width="50%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={subjectDist}
                                        dataKey="hours"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={80}
                                        paddingAngle={3}
                                        stroke="none"
                                    >
                                        {subjectDist.map((_, i) => (
                                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                                {subjectDist.map((s, i) => (
                                    <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{
                                            width: 10, height: 10, borderRadius: '50%',
                                            background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0,
                                        }} />
                                        <span className="text-body-sm" style={{ flex: 1, color: 'var(--color-text-secondary)' }}>{s.name}</span>
                                        <span className="text-body-sm" style={{ fontWeight: 600 }}>{s.hours}h</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p className="text-body-md" style={{ color: 'var(--color-text-muted)' }}>
                                No subject data yet — tag sessions with subjects
                            </p>
                        </div>
                    )}
                </div>

                {/* Assignment Status */}
                <div className="surface-card" style={{ padding: '24px' }}>
                    <h3 className="text-heading-sm" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Target size={16} color="#F59E0B" /> Assignment Status
                    </h3>
                    {assignmentStatus.length > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            <ResponsiveContainer width="50%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={assignmentStatus}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={80}
                                        paddingAngle={3}
                                        stroke="none"
                                    >
                                        {assignmentStatus.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                                {assignmentStatus.map(s => (
                                    <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{
                                            width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0,
                                        }} />
                                        <span className="text-body-sm" style={{ flex: 1, color: 'var(--color-text-secondary)' }}>{s.name}</span>
                                        <span style={{
                                            background: `${s.color}20`, color: s.color,
                                            padding: '2px 10px', borderRadius: 'var(--radius-full)',
                                            fontSize: 13, fontWeight: 600,
                                        }}>{s.value}</span>
                                    </div>
                                ))}
                                <div style={{
                                    marginTop: 4, padding: '8px 12px', borderRadius: 'var(--radius-md)',
                                    background: 'rgba(255,255,255,0.03)',
                                }}>
                                    <span className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>
                                        Total: <strong style={{ color: 'var(--color-text-primary)' }}>{assignments.length}</strong> assignments
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p className="text-body-md" style={{ color: 'var(--color-text-muted)' }}>
                                No assignments yet — add some on the Assignment Board
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Study Heatmap Summary */}
            <div className="surface-card" style={{ padding: '24px' }}>
                <h3 className="text-heading-sm" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Flame size={16} color="#F97316" /> Study Activity Summary
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    {(() => {
                        const activeDays = Object.keys(streak.heatmap).length
                        const totalHrs = Object.values(streak.heatmap).reduce((s, v) => s + v, 0).toFixed(1)
                        const avgPerDay = activeDays > 0 ? (parseFloat(totalHrs) / activeDays).toFixed(1) : '0'
                        const bestDay = Object.entries(streak.heatmap).sort(([, a], [, b]) => b - a)[0]
                        return (
                            <>
                                <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                                    <p className="text-heading-md" style={{ color: '#6366F1', fontSize: 24 }}>{activeDays}</p>
                                    <p className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>Active Days</p>
                                </div>
                                <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                                    <p className="text-heading-md" style={{ color: '#EC4899', fontSize: 24 }}>{totalHrs}h</p>
                                    <p className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>Total Hours</p>
                                </div>
                                <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                                    <p className="text-heading-md" style={{ color: '#F59E0B', fontSize: 24 }}>{avgPerDay}h</p>
                                    <p className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>Avg per Day</p>
                                </div>
                                <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                                    <p className="text-heading-md" style={{ color: '#10B981', fontSize: 24 }}>
                                        {bestDay ? format(new Date(bestDay[0]), 'MMM d') : '—'}
                                    </p>
                                    <p className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>Best Day</p>
                                </div>
                            </>
                        )
                    })()}
                </div>
            </div>
        </div>
    )
}
