import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { DEFAULT_SUBJECT_COLORS } from '@shared/constants'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Plus, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import type { Subject } from '@shared/types'
import toast from 'react-hot-toast'

const STEPS = ['Profile', 'Subjects', 'Preferences']

export default function Onboarding() {
    const { user, saveProfile } = useAuth()
    const navigate = useNavigate()
    const [step, setStep] = useState(0)
    const [name, setName] = useState(user?.displayName || '')
    const [college, setCollege] = useState('')
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [subjectInput, setSubjectInput] = useState('')
    const [cutoffTime, setCutoffTime] = useState('23:00')
    const [gradingSystem, setGradingSystem] = useState<'cgpa' | 'percentage'>('cgpa')
    const [saving, setSaving] = useState(false)

    const addSubject = () => {
        if (!subjectInput.trim()) return
        const newSubject: Subject = {
            id: crypto.randomUUID(),
            name: subjectInput.trim(),
            color: DEFAULT_SUBJECT_COLORS[subjects.length % DEFAULT_SUBJECT_COLORS.length],
        }
        setSubjects([...subjects, newSubject])
        setSubjectInput('')
    }

    const removeSubject = (id: string) => {
        setSubjects(subjects.filter((s) => s.id !== id))
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            addSubject()
        }
    }

    const handleComplete = async () => {
        setSaving(true)
        try {
            await saveProfile({
                uid: user!.uid,
                name: name || user?.displayName || 'Student',
                college,
                subjects,
                gradingSystem,
                streakCutoffTime: cutoffTime,
                onboardingComplete: true,
                fcmTokens: [],
            })
            toast.success('Profile saved! Welcome to ScholarSync 🎉')
            // Navigate directly to dashboard — profile state is already updated
            navigate('/dashboard', { replace: true })
        } catch (err) {
            console.error('Failed to save profile:', err)
            toast.error('Failed to save. Please try again.')
            setSaving(false)
        }
    }

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-bg-base)',
            padding: 24,
            overflow: 'hidden',
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    background: 'var(--color-bg-surface)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '28px 32px',
                    maxWidth: 520,
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                }}
            >
                {/* Logo */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
                    justifyContent: 'center',
                }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 'var(--radius-md)',
                        background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-alt))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Sparkles size={18} color="white" />
                    </div>
                    <span style={{ fontSize: 22, fontWeight: 800 }}>
                        Scholar<span style={{ color: 'var(--color-brand)' }}>Sync</span>
                    </span>
                </div>

                {/* Progress indicator */}
                <div style={{
                    display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20,
                }}>
                    {STEPS.map((s, i) => (
                        <div key={s} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 600,
                                background: i <= step ? 'var(--color-brand)' : 'var(--color-bg-raised)',
                                color: i <= step ? 'white' : 'var(--color-text-muted)',
                                transition: 'all 200ms ease',
                            }}>
                                {i < step ? <Check size={14} /> : i + 1}
                            </div>
                            <span style={{
                                fontSize: 12, color: i <= step ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                            }}>{s}</span>
                            {i < STEPS.length - 1 && (
                                <div style={{
                                    width: 32, height: 2, background: i < step ? 'var(--color-brand)' : 'var(--color-bg-raised)',
                                    borderRadius: 1, margin: '0 2px',
                                }} />
                            )}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* Step 1: Profile */}
                    {step === 0 && (
                        <motion.div
                            key="step-0"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h2 className="text-heading-lg" style={{ marginBottom: 8 }}>Let's get started! 🚀</h2>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 24 }}>
                                Tell us a bit about yourself
                            </p>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--color-text-secondary)' }}>
                                    Your Name *
                                </label>
                                <input
                                    className="input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--color-text-secondary)' }}>
                                    College / University
                                </label>
                                <input
                                    className="input"
                                    value={college}
                                    onChange={(e) => setCollege(e.target.value)}
                                    placeholder="e.g. MIT, Stanford, IIT Delhi"
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Subjects */}
                    {step === 1 && (
                        <motion.div
                            key="step-1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h2 className="text-heading-lg" style={{ marginBottom: 8 }}>Your Subjects 📚</h2>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 24 }}>
                                Add the subjects you're studying this semester
                            </p>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                                <input
                                    className="input"
                                    value={subjectInput}
                                    onChange={(e) => setSubjectInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type subject name and press Enter"
                                    style={{ flex: 1 }}
                                />
                                <button className="btn btn-primary btn-icon" onClick={addSubject} style={{ flexShrink: 0 }}>
                                    <Plus size={18} />
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {subjects.map((s) => (
                                    <motion.span
                                        key={s.id}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            padding: '6px 12px',
                                            borderRadius: 'var(--radius-full)',
                                            background: `${s.color}20`,
                                            color: s.color,
                                            fontSize: 13,
                                            fontWeight: 500,
                                        }}
                                    >
                                        <span style={{
                                            width: 8, height: 8, borderRadius: '50%',
                                            background: s.color,
                                        }} />
                                        {s.name}
                                        <button
                                            onClick={() => removeSubject(s.id)}
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                color: s.color, padding: 0, display: 'flex',
                                            }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </motion.span>
                                ))}
                            </div>
                            {subjects.length === 0 && (
                                <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 12 }}>
                                    No subjects added yet. You can always add more later in Settings.
                                </p>
                            )}
                        </motion.div>
                    )}

                    {/* Step 3: Preferences */}
                    {step === 2 && (
                        <motion.div
                            key="step-2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h2 className="text-heading-lg" style={{ marginBottom: 8 }}>Almost Done! ⚡</h2>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 24 }}>
                                Set your daily streak cutoff and grading system
                            </p>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--color-text-secondary)' }}>
                                    Daily Streak Cutoff Time
                                </label>
                                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                                    You must log at least one study session before this time to keep your streak alive.
                                </p>
                                <input
                                    className="input"
                                    type="time"
                                    value={cutoffTime}
                                    onChange={(e) => setCutoffTime(e.target.value)}
                                    style={{ maxWidth: 200 }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 10, color: 'var(--color-text-secondary)' }}>
                                    Grading System
                                </label>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    {(['cgpa', 'percentage'] as const).map((gs) => (
                                        <button
                                            key={gs}
                                            onClick={() => setGradingSystem(gs)}
                                            style={{
                                                flex: 1,
                                                padding: '14px 16px',
                                                borderRadius: 'var(--radius-lg)',
                                                border: `2px solid ${gradingSystem === gs ? 'var(--color-brand)' : 'rgba(255,255,255,0.06)'}`,
                                                background: gradingSystem === gs ? 'rgba(91,91,214,0.1)' : 'var(--color-bg-raised)',
                                                color: gradingSystem === gs ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                                                cursor: 'pointer',
                                                fontFamily: 'var(--font-sans)',
                                                fontSize: 14,
                                                fontWeight: 600,
                                                transition: 'all 150ms ease',
                                            }}
                                        >
                                            {gs === 'cgpa' ? '10-Point CGPA' : 'Percentage'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation buttons */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginTop: 24, gap: 12,
                }}>
                    {step > 0 ? (
                        <button
                            className="btn btn-ghost"
                            onClick={() => setStep(step - 1)}
                        >
                            <ChevronLeft size={16} /> Back
                        </button>
                    ) : <div />}

                    {step < 2 ? (
                        <button
                            className="btn btn-primary"
                            onClick={() => setStep(step + 1)}
                            disabled={step === 0 && !name.trim()}
                            style={{ opacity: step === 0 && !name.trim() ? 0.5 : 1 }}
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button
                            className="btn btn-gradient btn-lg"
                            onClick={handleComplete}
                            disabled={saving}
                            style={{ opacity: saving ? 0.7 : 1 }}
                        >
                            {saving ? 'Setting up...' : "Let's Go! 🎉"}
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
