import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Star, Trash2, Clock, BookOpen, X, AlertTriangle } from 'lucide-react'
import { collection, addDoc, deleteDoc, doc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@shared/api/firebase'
import type { Exam, Subject } from '@shared/types'
import toast from 'react-hot-toast'
import { differenceInDays, differenceInHours, format } from 'date-fns'

function getCountdownInfo(examDate: Date) {
    const now = new Date()
    const daysLeft = differenceInDays(examDate, now)
    const hoursLeft = differenceInHours(examDate, now)

    if (daysLeft < 0) return { label: 'Passed', className: 'urgent', icon: '✅' }
    if (daysLeft === 0) return { label: `${hoursLeft}h left`, className: 'urgent', icon: '🔥' }
    if (daysLeft <= 3) return { label: `${daysLeft}d left`, className: 'urgent', icon: '🔴' }
    if (daysLeft <= 7) return { label: `${daysLeft}d left`, className: 'warning', icon: '🟡' }
    return { label: `${daysLeft}d left`, className: 'safe', icon: '🟢' }
}

function StarRating({ value, onChange, readonly = false }: { value: number, onChange?: (v: number) => void, readonly?: boolean }) {
    return (
        <div className="star-rating">
            {[1, 2, 3, 4, 5].map(i => (
                <span
                    key={i}
                    className="star"
                    onClick={() => !readonly && onChange?.(i)}
                    style={{ cursor: readonly ? 'default' : 'pointer' }}
                >
                    <Star
                        size={16}
                        fill={i <= value ? '#F59E0B' : 'transparent'}
                        color={i <= value ? '#F59E0B' : 'var(--color-text-muted)'}
                    />
                </span>
            ))}
        </div>
    )
}

interface ExamWithSubject extends Exam {
    subject?: Subject
}

export default function Exams() {
    const { user, profile } = useAuth()
    const [exams, setExams] = useState<ExamWithSubject[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)

    // Form state
    const [formSubjectId, setFormSubjectId] = useState('')
    const [formDate, setFormDate] = useState('')
    const [formTime, setFormTime] = useState('09:00')
    const [formDifficulty, setFormDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3)
    const [saving, setSaving] = useState(false)

    const subjects = profile?.subjects || []

    useEffect(() => {
        if (!user) return
        const load = async () => {
            try {
                const ref = collection(db, 'users', user.uid, 'exams')
                const q = query(ref, orderBy('date', 'asc'))
                const snap = await getDocs(q)
                const loaded = snap.docs.map(d => {
                    const data = d.data() as Omit<Exam, 'id'>
                    const subject = subjects.find(s => s.id === data.subjectId)
                    return { id: d.id, ...data, subject } as ExamWithSubject
                })
                setExams(loaded)
            } catch (err) {
                console.warn('Could not load exams:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [user, subjects])

    const handleAddExam = async () => {
        if (!user || !formSubjectId || !formDate) {
            toast.error('Please fill in subject and date')
            return
        }
        setSaving(true)
        try {
            const dateTime = new Date(`${formDate}T${formTime}`)
            const examData = {
                subjectId: formSubjectId,
                date: Timestamp.fromDate(dateTime),
                difficulty: formDifficulty,
                notificationsSent: [],
            }
            const ref = collection(db, 'users', user.uid, 'exams')
            const docRef = await addDoc(ref, examData)
            const subject = subjects.find(s => s.id === formSubjectId)
            setExams(prev => [...prev, { id: docRef.id, ...examData, subject }].sort(
                (a, b) => a.date.toMillis() - b.date.toMillis()
            ))
            setShowModal(false)
            resetForm()
            toast.success('Exam added!')
        } catch (err) {
            toast.error('Failed to save exam')
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteExam = async (examId: string) => {
        if (!user) return
        try {
            await deleteDoc(doc(db, 'users', user.uid, 'exams', examId))
            setExams(prev => prev.filter(e => e.id !== examId))
            toast.success('Exam removed')
        } catch (err) {
            toast.error('Failed to delete')
        }
    }

    const resetForm = () => {
        setFormSubjectId('')
        setFormDate('')
        setFormTime('09:00')
        setFormDifficulty(3)
    }

    const { upcoming, past } = useMemo(() => {
        const now = new Date()
        const upcoming = exams.filter(e => e.date.toDate() >= now)
        const past = exams.filter(e => e.date.toDate() < now)
        return { upcoming, past }
    }, [exams])

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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                <div>
                    <h1 className="text-display" style={{ marginBottom: 4 }}>Exam Hub 📝</h1>
                    <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)' }}>
                        Track upcoming exams with live countdowns
                    </p>
                </div>
                <button className="btn btn-gradient" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Add Exam
                </button>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                <div className="surface-card" style={{ textAlign: 'center' }}>
                    <p className="text-label" style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>Upcoming</p>
                    <p className="text-stat-number" style={{ color: 'var(--color-info)', fontSize: 28 }}>{upcoming.length}</p>
                </div>
                <div className="surface-card" style={{ textAlign: 'center' }}>
                    <p className="text-label" style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>This Week</p>
                    <p className="text-stat-number" style={{ color: 'var(--color-warning)', fontSize: 28 }}>
                        {upcoming.filter(e => differenceInDays(e.date.toDate(), new Date()) <= 7).length}
                    </p>
                </div>
                <div className="surface-card" style={{ textAlign: 'center' }}>
                    <p className="text-label" style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>Completed</p>
                    <p className="text-stat-number" style={{ color: 'var(--color-success)', fontSize: 28 }}>{past.length}</p>
                </div>
            </div>

            {/* Upcoming Exams */}
            {upcoming.length === 0 && past.length === 0 ? (
                <div className="surface-card empty-state">
                    <p className="emoji">📚</p>
                    <p className="text-heading-md" style={{ marginBottom: 8, color: 'var(--color-text-primary)' }}>No exams yet</p>
                    <p className="text-body-md">Add your first exam to start tracking countdowns</p>
                </div>
            ) : (
                <>
                    {upcoming.length > 0 && (
                        <div style={{ marginBottom: 32 }}>
                            <h2 className="text-heading-md" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Clock size={18} color="var(--color-info)" /> Upcoming Exams
                            </h2>
                            <div style={{ display: 'grid', gap: 12 }}>
                                <AnimatePresence>
                                    {upcoming.map((exam, i) => {
                                        const examDate = exam.date.toDate()
                                        const countdown = getCountdownInfo(examDate)
                                        const subjectColor = exam.subject?.color || '#64748B'

                                        return (
                                            <motion.div
                                                key={exam.id}
                                                className="exam-card"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ delay: i * 0.05 }}
                                                style={{ borderLeft: `3px solid ${subjectColor}` }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                        <div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                                                <span className="subject-tag" style={{
                                                                    background: `${subjectColor}20`,
                                                                    color: subjectColor,
                                                                }}>
                                                                    {exam.subject?.name || 'Unknown'}
                                                                </span>
                                                                <StarRating value={exam.difficulty} readonly />
                                                            </div>
                                                            <p className="text-body-md" style={{ color: 'var(--color-text-secondary)' }}>
                                                                📅 {format(examDate, 'EEEE, MMMM d, yyyy')} at {format(examDate, 'h:mm a')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <span className={`countdown-chip ${countdown.className}`}>
                                                            {countdown.icon} {countdown.label}
                                                        </span>
                                                        <button
                                                            className="btn btn-icon btn-sm"
                                                            onClick={() => handleDeleteExam(exam.id)}
                                                            style={{ width: 32, height: 32 }}
                                                        >
                                                            <Trash2 size={14} color="var(--color-danger)" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {past.length > 0 && (
                        <div>
                            <h2 className="text-heading-md" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-muted)' }}>
                                <BookOpen size={18} /> Past Exams
                            </h2>
                            <div style={{ display: 'grid', gap: 8 }}>
                                {past.map(exam => {
                                    const subjectColor = exam.subject?.color || '#64748B'
                                    return (
                                        <div key={exam.id} className="exam-card" style={{ opacity: 0.5, borderLeft: `3px solid ${subjectColor}` }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <span className="subject-tag" style={{
                                                        background: `${subjectColor}20`,
                                                        color: subjectColor,
                                                    }}>
                                                        {exam.subject?.name || 'Unknown'}
                                                    </span>
                                                    <span className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>
                                                        {format(exam.date.toDate(), 'MMM d, yyyy')}
                                                    </span>
                                                </div>
                                                <button
                                                    className="btn btn-icon btn-sm"
                                                    onClick={() => handleDeleteExam(exam.id)}
                                                    style={{ width: 32, height: 32 }}
                                                >
                                                    <Trash2 size={14} color="var(--color-text-muted)" />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Add Exam Modal */}
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
                                <h2 className="text-heading-lg">Add Exam</h2>
                                <button className="btn btn-icon" onClick={() => setShowModal(false)}>
                                    <X size={18} />
                                </button>
                            </div>

                            {subjects.length === 0 && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                                    background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)',
                                    marginBottom: 20,
                                }}>
                                    <AlertTriangle size={16} color="var(--color-warning)" />
                                    <p className="text-body-sm" style={{ color: 'var(--color-warning)' }}>
                                        Add subjects in Settings first to tag exams
                                    </p>
                                </div>
                            )}

                            <div className="form-group">
                                <label>Subject</label>
                                <select
                                    className="input"
                                    value={formSubjectId}
                                    onChange={e => setFormSubjectId(e.target.value)}
                                    style={{ appearance: 'none' }}
                                >
                                    <option value="">Select a subject</option>
                                    {subjects.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div className="form-group">
                                    <label>Exam Date</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={formDate}
                                        onChange={e => setFormDate(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Time</label>
                                    <input
                                        type="time"
                                        className="input"
                                        value={formTime}
                                        onChange={e => setFormTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Difficulty</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                                    <StarRating value={formDifficulty} onChange={v => setFormDifficulty(v as 1 | 2 | 3 | 4 | 5)} />
                                    <span className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>
                                        {['', 'Easy', 'Moderate', 'Medium', 'Hard', 'Very Hard'][formDifficulty]}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                <button className="btn btn-ghost" onClick={() => setShowModal(false)} style={{ flex: 1 }}>
                                    Cancel
                                </button>
                                <button className="btn btn-gradient" onClick={handleAddExam} disabled={saving} style={{ flex: 1 }}>
                                    {saving ? 'Saving...' : 'Add Exam'}
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
