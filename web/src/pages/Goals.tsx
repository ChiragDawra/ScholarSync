import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Target, Calendar, CheckCircle2, Sparkles, Trash2 } from 'lucide-react'
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@shared/api/firebase'
import type { Goal } from '@shared/types'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { DatePicker } from '@/components/ui/DatePicker'

function ProgressRing({ progress, size = 56, strokeWidth = 5 }: { progress: number; size?: number; strokeWidth?: number }) {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (progress / 100) * circumference

    const color = progress >= 100 ? '#22C55E' : progress >= 60 ? '#6366F1' : progress >= 30 ? '#F59E0B' : '#EF4444'

    return (
        <div className="progress-ring-container" style={{ width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
            </svg>
            <span className="progress-text" style={{ fontSize: size > 50 ? 14 : 11 }}>
                {Math.round(progress)}%
            </span>
        </div>
    )
}

export default function Goals() {
    const { user } = useAuth()
    const [goals, setGoals] = useState<Goal[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [filter, setFilter] = useState<'all' | 'weekly' | 'monthly'>('all')
    const [celebrateId, setCelebrateId] = useState<string | null>(null)

    // Form state
    const [formTitle, setFormTitle] = useState('')
    const [formType, setFormType] = useState<'weekly' | 'monthly'>('weekly')
    const [formTargetDate, setFormTargetDate] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!user) return
        const load = async () => {
            try {
                const ref = collection(db, 'users', user.uid, 'goals')
                const q = query(ref, orderBy('targetDate', 'asc'))
                const snap = await getDocs(q)
                setGoals(snap.docs.map(d => ({ id: d.id, ...d.data() } as Goal)))
            } catch (err) {
                console.warn('Could not load goals:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [user])

    const handleAddGoal = async () => {
        if (!user || !formTitle || !formTargetDate) {
            toast.error('Title and target date required')
            return
        }
        setSaving(true)
        try {
            const data = {
                title: formTitle,
                type: formType,
                targetDate: Timestamp.fromDate(new Date(formTargetDate)),
                progress: 0,
                done: false,
                aiSuggested: false,
            }
            const ref = collection(db, 'users', user.uid, 'goals')
            const docRef = await addDoc(ref, data)
            setGoals(prev => [...prev, { id: docRef.id, ...data }])
            setShowModal(false)
            resetForm()
            toast.success('Goal created! 🎯')
        } catch (err) {
            toast.error('Failed to create goal')
        } finally {
            setSaving(false)
        }
    }

    const handleUpdateProgress = async (goalId: string, newProgress: number) => {
        if (!user) return
        const clamped = Math.min(100, Math.max(0, newProgress))
        try {
            const isDone = clamped >= 100
            await updateDoc(doc(db, 'users', user.uid, 'goals', goalId), {
                progress: clamped,
                done: isDone,
            })
            setGoals(prev => prev.map(g =>
                g.id === goalId ? { ...g, progress: clamped, done: isDone } : g
            ))
            if (isDone) {
                setCelebrateId(goalId)
                toast.success('🎉 Goal completed!')
                setTimeout(() => setCelebrateId(null), 1000)
            }
        } catch { toast.error('Failed to update') }
    }

    const handleMarkDone = async (goalId: string) => {
        handleUpdateProgress(goalId, 100)
    }

    const handleDeleteGoal = async (goalId: string) => {
        if (!user) return
        try {
            await deleteDoc(doc(db, 'users', user.uid, 'goals', goalId))
            setGoals(prev => prev.filter(g => g.id !== goalId))
            toast.success('Goal removed')
        } catch { toast.error('Failed to delete') }
    }

    const resetForm = () => {
        setFormTitle('')
        setFormType('weekly')
        setFormTargetDate('')
    }

    const filtered = goals.filter(g => filter === 'all' || g.type === filter)
    const activeGoals = filtered.filter(g => !g.done)
    const completedGoals = filtered.filter(g => g.done)

    if (loading) {
        return (
            <div className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
                <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    border: '3px solid var(--color-bg-raised)',
                    borderTopColor: 'var(--color-brand)',
                    animation: 'spin 0.8s linear infinite',
                }} />
            </div>
        )
    }

    return (
        <div className="animate-fade-in-up">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 className="text-display" style={{ marginBottom: 4 }}>Goals Board 🎯</h1>
                    <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)' }}>
                        Set and track your academic goals
                    </p>
                </div>
                <button className="btn btn-gradient" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> New Goal
                </button>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {(['all', 'weekly', 'monthly'] as const).map(tab => (
                    <button
                        key={tab}
                        className="btn btn-sm"
                        onClick={() => setFilter(tab)}
                        style={{
                            background: filter === tab ? 'var(--color-brand)' : 'var(--color-bg-raised)',
                            color: filter === tab ? 'white' : 'var(--color-text-secondary)',
                            textTransform: 'capitalize',
                            border: `1px solid ${filter === tab ? 'var(--color-brand)' : 'rgba(255,255,255,0.06)'}`,
                        }}
                    >
                        {tab === 'all' ? '🗂 All' : tab === 'weekly' ? '📅 Weekly' : '📆 Monthly'}
                    </button>
                ))}
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                <div className="surface-card" style={{ textAlign: 'center' }}>
                    <p className="text-label" style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>Active Goals</p>
                    <p className="text-stat-number" style={{ color: 'var(--color-info)', fontSize: 28 }}>{activeGoals.length}</p>
                </div>
                <div className="surface-card" style={{ textAlign: 'center' }}>
                    <p className="text-label" style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>Completed</p>
                    <p className="text-stat-number" style={{ color: 'var(--color-success)', fontSize: 28 }}>{completedGoals.length}</p>
                </div>
                <div className="surface-card" style={{ textAlign: 'center' }}>
                    <p className="text-label" style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>Completion Rate</p>
                    <p className="text-stat-number" style={{ color: 'var(--color-brand)', fontSize: 28 }}>
                        {goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0}%
                    </p>
                </div>
            </div>

            {/* Active Goals */}
            {activeGoals.length === 0 && completedGoals.length === 0 ? (
                <div className="surface-card empty-state">
                    <p className="emoji">🎯</p>
                    <p className="text-heading-md" style={{ marginBottom: 8, color: 'var(--color-text-primary)' }}>No goals yet</p>
                    <p className="text-body-md">Create your first weekly or monthly goal to start tracking</p>
                </div>
            ) : (
                <>
                    {activeGoals.length > 0 && (
                        <div style={{ marginBottom: 32 }}>
                            <h2 className="text-heading-md" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Target size={18} color="var(--color-info)" /> Active Goals
                            </h2>
                            <div style={{ display: 'grid', gap: 12 }}>
                                <AnimatePresence>
                                    {activeGoals.map((goal, i) => (
                                        <motion.div
                                            key={goal.id}
                                            className={`goal-card ${celebrateId === goal.id ? 'animate-celebrate' : ''}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ delay: i * 0.05 }}
                                        >
                                            <ProgressRing progress={goal.progress} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                    <span className="badge" style={{
                                                        background: goal.type === 'weekly' ? 'rgba(99,102,241,0.15)' : 'rgba(168,85,247,0.15)',
                                                        color: goal.type === 'weekly' ? '#6366F1' : '#A855F7',
                                                        fontSize: 11,
                                                    }}>
                                                        {goal.type}
                                                    </span>
                                                    {goal.aiSuggested && (
                                                        <span className="badge" style={{
                                                            background: 'rgba(236, 72, 153, 0.15)',
                                                            color: '#EC4899', fontSize: 11,
                                                        }}>
                                                            <Sparkles size={10} /> AI Suggested
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-heading-sm goal-title" style={{ marginBottom: 4 }}>{goal.title}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <Calendar size={12} color="var(--color-text-muted)" />
                                                    <span className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>
                                                        Due {format(goal.targetDate.toDate(), 'MMM d, yyyy')}
                                                    </span>
                                                </div>

                                                {/* Progress Slider */}
                                                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <input
                                                        type="range"
                                                        min={0} max={100} step={5}
                                                        value={goal.progress}
                                                        onChange={e => handleUpdateProgress(goal.id, parseInt(e.target.value))}
                                                        style={{
                                                            flex: 1, height: 4, accentColor: 'var(--color-brand)',
                                                            cursor: 'pointer',
                                                        }}
                                                    />
                                                    <span className="text-body-sm" style={{ color: 'var(--color-text-muted)', width: 35, textAlign: 'right' }}>
                                                        {goal.progress}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => handleMarkDone(goal.id)}
                                                    style={{ fontSize: 12 }}
                                                >
                                                    <CheckCircle2 size={14} /> Done
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-ghost"
                                                    onClick={() => handleDeleteGoal(goal.id)}
                                                    style={{ fontSize: 12, color: 'var(--color-text-muted)' }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {completedGoals.length > 0 && (
                        <div>
                            <h2 className="text-heading-md" style={{
                                marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
                                color: 'var(--color-text-muted)',
                            }}>
                                <CheckCircle2 size={18} /> Completed
                            </h2>
                            <div style={{ display: 'grid', gap: 8 }}>
                                {completedGoals.map(goal => (
                                    <div key={goal.id} className="goal-card done">
                                        <ProgressRing progress={100} size={44} strokeWidth={4} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                                <span className="badge" style={{
                                                    background: 'rgba(255,255,255,0.06)',
                                                    color: 'var(--color-text-muted)',
                                                    fontSize: 11,
                                                }}>
                                                    {goal.type}
                                                </span>
                                            </div>
                                            <p className="text-heading-sm goal-title">{goal.title}</p>
                                        </div>
                                        <button
                                            className="btn btn-icon btn-sm"
                                            onClick={() => handleDeleteGoal(goal.id)}
                                            style={{ width: 32, height: 32 }}
                                        >
                                            <Trash2 size={14} color="var(--color-text-muted)" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Add Goal Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                                <h2 className="text-heading-lg">Create Goal</h2>
                                <button className="btn btn-icon" onClick={() => setShowModal(false)}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="form-group">
                                <label>Goal Title *</label>
                                <input
                                    className="input"
                                    placeholder="e.g. Complete 20 Pomodoro sessions"
                                    value={formTitle}
                                    onChange={e => setFormTitle(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Type</label>
                                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                    {(['weekly', 'monthly'] as const).map(type => (
                                        <button
                                            key={type}
                                            className="btn btn-sm"
                                            onClick={() => setFormType(type)}
                                            style={{
                                                background: formType === type ? 'var(--color-brand)' : 'var(--color-bg-raised)',
                                                color: formType === type ? 'white' : 'var(--color-text-muted)',
                                                border: `1px solid ${formType === type ? 'var(--color-brand)' : 'rgba(255,255,255,0.06)'}`,
                                                textTransform: 'capitalize',
                                                flex: 1,
                                            }}
                                        >
                                            {type === 'weekly' ? '📅 Weekly' : '📆 Monthly'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Target Date *</label>
                                <DatePicker value={formTargetDate} onChange={setFormTargetDate} />
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                <button className="btn btn-ghost" onClick={() => setShowModal(false)} style={{ flex: 1 }}>
                                    Cancel
                                </button>
                                <button className="btn btn-gradient" onClick={handleAddGoal} disabled={saving} style={{ flex: 1 }}>
                                    {saving ? 'Creating...' : 'Create Goal'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FAB */}
            <motion.button
                className="fab"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 20 }}
                onClick={() => setShowModal(true)}
            >
                <Plus size={24} />
            </motion.button>
        </div>
    )
}
