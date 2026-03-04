import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus, X, Trash2, GraduationCap, BookOpen,
    TrendingUp, Award, Target, ChevronDown, ChevronUp,
} from 'lucide-react'
import { collection, addDoc, deleteDoc, updateDoc, doc, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@shared/api/firebase'
import type { Course } from '@shared/types'
import toast from 'react-hot-toast'

// Grade scale mapping (10-point CGPA)
const GRADE_SCALE = [
    { grade: 'O', minScore: 90, points: 10 },
    { grade: 'A+', minScore: 80, points: 9 },
    { grade: 'A', minScore: 70, points: 8 },
    { grade: 'B+', minScore: 60, points: 7 },
    { grade: 'B', minScore: 50, points: 6 },
    { grade: 'C', minScore: 40, points: 5 },
    { grade: 'P', minScore: 30, points: 4 },
    { grade: 'F', minScore: 0, points: 0 },
]

function getGradeInfo(score: number) {
    const pct = score
    for (const g of GRADE_SCALE) {
        if (pct >= g.minScore) return g
    }
    return GRADE_SCALE[GRADE_SCALE.length - 1]
}

function getDifficultyInfo(required: number) {
    if (required <= 0) return { label: 'Cleared', color: '#10B981' }
    if (required <= 50) return { label: 'Easy', color: '#10B981' }
    if (required <= 75) return { label: 'Moderate', color: '#F59E0B' }
    if (required <= 90) return { label: 'Hard', color: '#EF4444' }
    return { label: 'Very Hard', color: '#DC2626' }
}

export default function GpaPredictor() {
    const { user, profile } = useAuth()
    const isCgpa = profile?.gradingSystem === 'cgpa' || !profile?.gradingSystem
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [showGradeRef, setShowGradeRef] = useState(false)
    const [targetGpa, setTargetGpa] = useState(8.0)

    // Form state
    const [formSubjectId, setFormSubjectId] = useState('')
    const [formCode, setFormCode] = useState('')
    const [formScore, setFormScore] = useState('')
    const [formMax, setFormMax] = useState('100')
    const [formCredits, setFormCredits] = useState('3')
    const [formSemester, setFormSemester] = useState('Sem 1')
    const [saving, setSaving] = useState(false)

    const subjects = profile?.subjects || []

    useEffect(() => {
        if (!user) return
        const load = async () => {
            try {
                const ref = collection(db, 'users', user.uid, 'courses')
                const snap = await getDocs(query(ref, orderBy('semester', 'asc')))
                setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Course)))
            } catch (err) {
                console.warn('Could not load courses:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [user])

    const handleAddCourse = async () => {
        if (!user || !formSubjectId || !formScore) {
            toast.error('Fill required fields')
            return
        }
        setSaving(true)
        try {
            const courseData = {
                subjectId: formSubjectId,
                courseCode: formCode.trim() || '—',
                currentScore: parseFloat(formScore),
                maxScore: parseFloat(formMax) || 100,
                creditHours: parseInt(formCredits) || 3,
                semester: formSemester.trim() || 'Sem 1',
            }
            const ref = collection(db, 'users', user.uid, 'courses')
            const docRef = await addDoc(ref, courseData)
            setCourses(prev => [...prev, { id: docRef.id, ...courseData }])
            setShowModal(false)
            resetForm()
            toast.success('Course added!')
        } catch {
            toast.error('Failed to save')
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteCourse = async (courseId: string) => {
        if (!user) return
        try {
            await deleteDoc(doc(db, 'users', user.uid, 'courses', courseId))
            setCourses(prev => prev.filter(c => c.id !== courseId))
            toast.success('Course removed')
        } catch {
            toast.error('Failed to delete')
        }
    }

    const resetForm = () => {
        setFormSubjectId('')
        setFormCode('')
        setFormScore('')
        setFormMax('100')
        setFormCredits('3')
        setFormSemester('Sem 1')
    }

    // ── Calculated values ──
    const currentGpa = useMemo(() => {
        if (!courses.length) return 0
        if (isCgpa) {
            let totalCredits = 0
            let totalPoints = 0
            courses.forEach(c => {
                const pct = (c.currentScore / c.maxScore) * 100
                const grade = getGradeInfo(pct)
                totalCredits += c.creditHours
                totalPoints += grade.points * c.creditHours
            })
            return totalCredits > 0 ? totalPoints / totalCredits : 0
        } else {
            let totalCredits = 0
            let totalWeighted = 0
            courses.forEach(c => {
                const pct = (c.currentScore / c.maxScore) * 100
                totalCredits += c.creditHours
                totalWeighted += pct * c.creditHours
            })
            return totalCredits > 0 ? totalWeighted / totalCredits : 0
        }
    }, [courses, isCgpa])

    // Semester grouping
    const semesters = useMemo(() => {
        const map: Record<string, Course[]> = {}
        courses.forEach(c => {
            const sem = c.semester || 'Other'
            if (!map[sem]) map[sem] = []
            map[sem].push(c)
        })
        return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
    }, [courses])

    // Required scores for target GPA
    const requiredScores = useMemo(() => {
        return courses.map(c => {
            const pct = (c.currentScore / c.maxScore) * 100
            const currentGrade = getGradeInfo(pct)
            let reqScore = 0

            if (isCgpa) {
                // Find the minimum grade points needed to achieve target GPA
                const totalCredits = courses.reduce((s, x) => s + x.creditHours, 0)
                const otherPoints = courses
                    .filter(x => x.id !== c.id)
                    .reduce((s, x) => {
                        const p = (x.currentScore / x.maxScore) * 100
                        return s + getGradeInfo(p).points * x.creditHours
                    }, 0)
                const neededPoints = targetGpa * totalCredits - otherPoints
                const neededGradePoints = neededPoints / c.creditHours

                // Find the minimum percentage for that grade
                const targetGrade = GRADE_SCALE.find(g => g.points >= neededGradePoints)
                if (targetGrade) {
                    reqScore = targetGrade.minScore
                } else {
                    reqScore = 100 // impossible
                }
            } else {
                const totalCredits = courses.reduce((s, x) => s + x.creditHours, 0)
                const otherWeighted = courses
                    .filter(x => x.id !== c.id)
                    .reduce((s, x) => s + ((x.currentScore / x.maxScore) * 100) * x.creditHours, 0)
                reqScore = ((targetGpa * totalCredits) - otherWeighted) / c.creditHours
            }

            const subj = subjects.find(s => s.id === c.subjectId)
            const difficulty = getDifficultyInfo(reqScore)

            return {
                courseId: c.id,
                subjectName: subj?.name || 'Unknown',
                courseCode: c.courseCode,
                currentScore: pct,
                creditHours: c.creditHours,
                requiredScore: Math.max(0, Math.min(100, reqScore)),
                difficulty,
                currentGrade: currentGrade.grade,
            }
        })
    }, [courses, targetGpa, isCgpa, subjects])

    // Semester GPA calculation
    const semesterGpa = (semCourses: Course[]) => {
        if (!semCourses.length) return '—'
        if (isCgpa) {
            let tc = 0, tp = 0
            semCourses.forEach(c => {
                const pct = (c.currentScore / c.maxScore) * 100
                tc += c.creditHours
                tp += getGradeInfo(pct).points * c.creditHours
            })
            return tc > 0 ? (tp / tc).toFixed(2) : '—'
        } else {
            let tc = 0, tw = 0
            semCourses.forEach(c => {
                const pct = (c.currentScore / c.maxScore) * 100
                tc += c.creditHours
                tw += pct * c.creditHours
            })
            return tc > 0 ? (tw / tc).toFixed(1) + '%' : '—'
        }
    }

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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div>
                    <h1 className="text-display" style={{ marginBottom: 4 }}>GPA Predictor 🧮</h1>
                    <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)' }}>
                        Track courses and predict what you need on finals
                    </p>
                </div>
                <button className="btn btn-gradient" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Add Course
                </button>
            </div>

            {/* GPA Overview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                <motion.div
                    className="surface-card"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', padding: '24px' }}
                >
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366F1, #A855F7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 12px',
                    }}>
                        <GraduationCap size={28} color="white" />
                    </div>
                    <p className="text-label" style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>
                        Current {isCgpa ? 'CGPA' : 'Score'}
                    </p>
                    <p className="text-heading-lg" style={{ fontSize: 32 }}>
                        {courses.length ? (isCgpa ? currentGpa.toFixed(2) : currentGpa.toFixed(1) + '%') : '—'}
                    </p>
                </motion.div>

                <motion.div
                    className="surface-card"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ textAlign: 'center', padding: '24px' }}
                >
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #F59E0B, #F97316)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 12px',
                    }}>
                        <Target size={28} color="white" />
                    </div>
                    <p className="text-label" style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>
                        Target {isCgpa ? 'CGPA' : 'Score'}
                    </p>
                    <p className="text-heading-lg" style={{ fontSize: 32, color: '#F59E0B' }}>
                        {isCgpa ? targetGpa.toFixed(1) : targetGpa.toFixed(0) + '%'}
                    </p>
                </motion.div>

                <motion.div
                    className="surface-card"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ textAlign: 'center', padding: '24px' }}
                >
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10B981, #14B8A6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 12px',
                    }}>
                        <BookOpen size={28} color="white" />
                    </div>
                    <p className="text-label" style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>Courses</p>
                    <p className="text-heading-lg" style={{ fontSize: 32 }}>{courses.length}</p>
                </motion.div>
            </div>

            {/* Target GPA Slider */}
            {courses.length > 0 && (
                <div className="surface-card" style={{ marginBottom: 24, padding: '24px' }}>
                    <h3 className="text-heading-sm" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TrendingUp size={16} color="#F59E0B" /> Target {isCgpa ? 'CGPA' : 'Score'} Slider
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>
                            {isCgpa ? '4.0' : '40%'}
                        </span>
                        <input
                            type="range"
                            min={isCgpa ? 4 : 40}
                            max={isCgpa ? 10 : 100}
                            step={isCgpa ? 0.1 : 1}
                            value={targetGpa}
                            onChange={e => setTargetGpa(parseFloat(e.target.value))}
                            style={{
                                flex: 1, height: 6, appearance: 'none', borderRadius: 3,
                                background: `linear-gradient(to right, #6366F1 0%, #F59E0B ${((targetGpa - (isCgpa ? 4 : 40)) / (isCgpa ? 6 : 60)) * 100}%, rgba(255,255,255,0.1) ${((targetGpa - (isCgpa ? 4 : 40)) / (isCgpa ? 6 : 60)) * 100}%)`,
                                cursor: 'pointer',
                            }}
                        />
                        <span className="text-heading-sm" style={{ color: '#F59E0B', minWidth: 60, textAlign: 'right' }}>
                            {isCgpa ? targetGpa.toFixed(1) : targetGpa.toFixed(0) + '%'}
                        </span>
                    </div>
                </div>
            )}

            {/* Required Scores Table */}
            {courses.length > 0 && requiredScores.length > 0 && (
                <div className="surface-card" style={{ marginBottom: 24, padding: '24px' }}>
                    <h3 className="text-heading-sm" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Award size={16} color="#A855F7" /> Required Scores for Target
                    </h3>
                    <div style={{ display: 'grid', gap: 8 }}>
                        {requiredScores.map(r => (
                            <div key={r.courseId} style={{
                                display: 'flex', alignItems: 'center', gap: 16,
                                padding: '14px 16px', borderRadius: 'var(--radius-md)',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.04)',
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <span className="text-body-md" style={{ fontWeight: 600 }}>{r.subjectName}</span>
                                        <span className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>({r.courseCode})</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>
                                            Current: {r.currentScore.toFixed(0)}% ({r.currentGrade})
                                        </span>
                                        <span className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>
                                            • {r.creditHours} credits
                                        </span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p className="text-heading-sm" style={{ color: r.difficulty.color }}>
                                        {r.requiredScore.toFixed(0)}%
                                    </p>
                                    <span style={{
                                        fontSize: 11, fontWeight: 600,
                                        padding: '2px 8px', borderRadius: 'var(--radius-full)',
                                        background: `${r.difficulty.color}20`, color: r.difficulty.color,
                                    }}>
                                        {r.difficulty.label}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Courses by Semester */}
            {semesters.length > 0 ? (
                semesters.map(([sem, semCourses]) => (
                    <div key={sem} style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <h2 className="text-heading-md" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                📘 {sem}
                            </h2>
                            <span className="text-body-sm" style={{
                                padding: '4px 12px', borderRadius: 'var(--radius-full)',
                                background: 'rgba(99,102,241,0.1)', color: '#6366F1', fontWeight: 600,
                            }}>
                                {isCgpa ? 'SGPA' : 'Avg'}: {semesterGpa(semCourses)}
                            </span>
                        </div>
                        <div style={{ display: 'grid', gap: 8 }}>
                            {semCourses.map(course => {
                                const pct = (course.currentScore / course.maxScore) * 100
                                const grade = getGradeInfo(pct)
                                const subj = subjects.find(s => s.id === course.subjectId)
                                const subjectColor = subj?.color || '#64748B'

                                return (
                                    <motion.div
                                        key={course.id}
                                        className="exam-card"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{ borderLeft: `3px solid ${subjectColor}` }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                                    <span className="subject-tag" style={{
                                                        background: `${subjectColor}20`, color: subjectColor,
                                                    }}>
                                                        {subj?.name || 'Unknown'}
                                                    </span>
                                                    <span className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>
                                                        {course.courseCode}
                                                    </span>
                                                    <span style={{
                                                        fontSize: 11, fontWeight: 700,
                                                        padding: '2px 8px', borderRadius: 'var(--radius-full)',
                                                        background: 'rgba(99,102,241,0.1)', color: '#6366F1',
                                                    }}>
                                                        {course.creditHours} cr
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <span className="text-body-md" style={{ fontWeight: 500 }}>
                                                        Score: {course.currentScore}/{course.maxScore} ({pct.toFixed(0)}%)
                                                    </span>
                                                    {isCgpa && (
                                                        <span style={{
                                                            fontSize: 12, fontWeight: 700,
                                                            padding: '2px 10px', borderRadius: 'var(--radius-full)',
                                                            background: 'rgba(16,185,129,0.1)', color: '#10B981',
                                                        }}>
                                                            Grade: {grade.grade} ({grade.points} pts)
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Score bar */}
                                                <div style={{
                                                    marginTop: 8, width: '100%', maxWidth: 200, height: 4,
                                                    background: 'rgba(255,255,255,0.06)', borderRadius: 2,
                                                }}>
                                                    <div style={{
                                                        width: `${Math.min(pct, 100)}%`, height: '100%',
                                                        background: subjectColor, borderRadius: 2,
                                                        transition: 'width 300ms ease',
                                                    }} />
                                                </div>
                                            </div>
                                            <button
                                                className="btn btn-icon btn-sm"
                                                onClick={() => handleDeleteCourse(course.id)}
                                                style={{ width: 32, height: 32 }}
                                            >
                                                <Trash2 size={14} color="var(--color-danger)" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                ))
            ) : (
                <div className="surface-card empty-state">
                    <p className="emoji">🧮</p>
                    <p className="text-heading-md" style={{ marginBottom: 8, color: 'var(--color-text-primary)' }}>No courses yet</p>
                    <p className="text-body-md">Add your first course to start predicting your GPA</p>
                </div>
            )}

            {/* Grade Scale Reference */}
            {isCgpa && (
                <div className="surface-card" style={{ marginTop: 8, padding: '20px 24px' }}>
                    <button
                        onClick={() => setShowGradeRef(!showGradeRef)}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)',
                        }}
                    >
                        <span className="text-heading-sm">Grade Scale Reference</span>
                        {showGradeRef ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <AnimatePresence>
                        {showGradeRef && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ overflow: 'hidden', marginTop: 12 }}
                            >
                                <div style={{
                                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                                    gap: 8,
                                }}>
                                    {GRADE_SCALE.map(g => (
                                        <div key={g.grade} style={{
                                            padding: '10px 14px', borderRadius: 'var(--radius-md)',
                                            background: 'rgba(255,255,255,0.02)',
                                            border: '1px solid rgba(255,255,255,0.04)',
                                            textAlign: 'center',
                                        }}>
                                            <p className="text-heading-sm" style={{ color: '#6366F1' }}>{g.grade}</p>
                                            <p className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>
                                                ≥{g.minScore}% • {g.points} pts
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Add Course Modal */}
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
                                <h2 className="text-heading-lg">Add Course</h2>
                                <button className="btn btn-icon" onClick={() => setShowModal(false)}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="form-group">
                                <label>Subject *</label>
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
                                    <label>Course Code</label>
                                    <input
                                        className="input"
                                        value={formCode}
                                        onChange={e => setFormCode(e.target.value)}
                                        placeholder="e.g. CS101"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Semester</label>
                                    <input
                                        className="input"
                                        value={formSemester}
                                        onChange={e => setFormSemester(e.target.value)}
                                        placeholder="e.g. Sem 1"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                <div className="form-group">
                                    <label>Current Score *</label>
                                    <input
                                        className="input"
                                        type="number"
                                        value={formScore}
                                        onChange={e => setFormScore(e.target.value)}
                                        placeholder="85"
                                        min={0}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Max Score</label>
                                    <input
                                        className="input"
                                        type="number"
                                        value={formMax}
                                        onChange={e => setFormMax(e.target.value)}
                                        placeholder="100"
                                        min={1}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Credits</label>
                                    <input
                                        className="input"
                                        type="number"
                                        value={formCredits}
                                        onChange={e => setFormCredits(e.target.value)}
                                        placeholder="3"
                                        min={1}
                                        max={6}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                <button className="btn btn-ghost" onClick={() => setShowModal(false)} style={{ flex: 1 }}>
                                    Cancel
                                </button>
                                <button className="btn btn-gradient" onClick={handleAddCourse} disabled={saving} style={{ flex: 1 }}>
                                    {saving ? 'Saving...' : 'Add Course'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
