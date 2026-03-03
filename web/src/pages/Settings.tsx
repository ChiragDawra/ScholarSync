import { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { LogOut, Trash2, Plus, X, Check, Pencil } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const SUBJECT_COLORS = ['#6366F1', '#A855F7', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#F97316', '#14B8A6', '#8B5CF6']

export default function Settings() {
    const { user, profile, signOut, saveProfile } = useAuth()

    // Editable fields
    const [editingName, setEditingName] = useState(false)
    const [editingCollege, setEditingCollege] = useState(false)
    const [nameValue, setNameValue] = useState(profile?.name || '')
    const [collegeValue, setCollegeValue] = useState(profile?.college || '')

    // Subjects
    const [newSubject, setNewSubject] = useState('')
    const [addingSubject, setAddingSubject] = useState(false)

    // Preferences
    const [savingPref, setSavingPref] = useState(false)

    const handleSaveName = async () => {
        if (!nameValue.trim()) { toast.error('Name cannot be empty'); return }
        try {
            await saveProfile({ name: nameValue.trim() })
            setEditingName(false)
            toast.success('Name updated')
        } catch { toast.error('Failed to save') }
    }

    const handleSaveCollege = async () => {
        try {
            await saveProfile({ college: collegeValue.trim() })
            setEditingCollege(false)
            toast.success('College updated')
        } catch { toast.error('Failed to save') }
    }

    const handleAddSubject = async () => {
        if (!newSubject.trim()) return
        const existing = profile?.subjects || []
        const color = SUBJECT_COLORS[existing.length % SUBJECT_COLORS.length]
        const subject = {
            id: Date.now().toString(),
            name: newSubject.trim(),
            color,
        }
        try {
            await saveProfile({ subjects: [...existing, subject] })
            setNewSubject('')
            setAddingSubject(false)
            toast.success('Subject added')
        } catch { toast.error('Failed to add subject') }
    }

    const handleRemoveSubject = async (subjectId: string) => {
        const updated = (profile?.subjects || []).filter(s => s.id !== subjectId)
        try {
            await saveProfile({ subjects: updated })
            toast.success('Subject removed')
        } catch { toast.error('Failed to remove') }
    }

    const handleGradingChange = async (system: 'cgpa' | 'percentage') => {
        setSavingPref(true)
        try {
            await saveProfile({ gradingSystem: system })
            toast.success('Grading system updated')
        } catch { toast.error('Failed to save') }
        finally { setSavingPref(false) }
    }

    const handleCutoffChange = async (time: string) => {
        setSavingPref(true)
        try {
            await saveProfile({ streakCutoffTime: time })
            toast.success('Cutoff time updated')
        } catch { toast.error('Failed to save') }
        finally { setSavingPref(false) }
    }

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-display" style={{ marginBottom: 8 }}>Settings</h1>
            <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)', marginBottom: 32 }}>
                Manage your profile, subjects, and preferences
            </p>

            {/* Profile */}
            <div className="surface-card" style={{ marginBottom: 16 }}>
                <h3 className="text-heading-md" style={{ marginBottom: 20 }}>Profile</h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-alt))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden', flexShrink: 0,
                    }}>
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>
                                {(profile?.name || 'U')[0].toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div className="text-body-sm" style={{ color: 'var(--color-text-muted)', marginBottom: 2 }}>
                            {user?.email}
                        </div>
                    </div>
                </div>

                {/* Name */}
                <div style={{ marginBottom: 16 }}>
                    <label className="text-label" style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>
                        Display Name
                    </label>
                    {editingName ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input
                                className="input"
                                value={nameValue}
                                onChange={e => setNameValue(e.target.value)}
                                autoFocus
                                onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                            />
                            <button className="btn btn-sm btn-primary" onClick={handleSaveName}>
                                <Check size={14} />
                            </button>
                            <button className="btn btn-sm btn-ghost" onClick={() => { setEditingName(false); setNameValue(profile?.name || '') }}>
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span className="text-body-lg" style={{ fontWeight: 500 }}>{profile?.name || 'Not set'}</span>
                            <button
                                className="btn btn-icon btn-sm"
                                onClick={() => { setEditingName(true); setNameValue(profile?.name || '') }}
                                style={{ width: 28, height: 28 }}
                            >
                                <Pencil size={12} />
                            </button>
                        </div>
                    )}
                </div>

                {/* College */}
                <div>
                    <label className="text-label" style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>
                        College / University
                    </label>
                    {editingCollege ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input
                                className="input"
                                value={collegeValue}
                                onChange={e => setCollegeValue(e.target.value)}
                                autoFocus
                                onKeyDown={e => e.key === 'Enter' && handleSaveCollege()}
                                placeholder="Enter your college"
                            />
                            <button className="btn btn-sm btn-primary" onClick={handleSaveCollege}>
                                <Check size={14} />
                            </button>
                            <button className="btn btn-sm btn-ghost" onClick={() => { setEditingCollege(false); setCollegeValue(profile?.college || '') }}>
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span className="text-body-lg" style={{ fontWeight: 500, color: profile?.college ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                                {profile?.college || 'Not set'}
                            </span>
                            <button
                                className="btn btn-icon btn-sm"
                                onClick={() => { setEditingCollege(true); setCollegeValue(profile?.college || '') }}
                                style={{ width: 28, height: 28 }}
                            >
                                <Pencil size={12} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Subjects */}
            <div className="surface-card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 className="text-heading-md">Subjects</h3>
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={() => setAddingSubject(true)}
                    >
                        <Plus size={14} /> Add
                    </button>
                </div>

                <AnimatePresence>
                    {addingSubject && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ marginBottom: 16, overflow: 'hidden' }}
                        >
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input
                                    className="input"
                                    placeholder="Subject name (e.g. Physics)"
                                    value={newSubject}
                                    onChange={e => setNewSubject(e.target.value)}
                                    autoFocus
                                    onKeyDown={e => e.key === 'Enter' && handleAddSubject()}
                                />
                                <button className="btn btn-sm btn-primary" onClick={handleAddSubject}>
                                    <Check size={14} />
                                </button>
                                <button className="btn btn-sm btn-ghost" onClick={() => { setAddingSubject(false); setNewSubject('') }}>
                                    <X size={14} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {profile?.subjects?.length ? (
                        profile.subjects.map(s => (
                            <motion.span
                                key={s.id}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: '6px 12px', borderRadius: 'var(--radius-full)',
                                    background: `${s.color}20`, color: s.color,
                                    fontSize: 13, fontWeight: 500,
                                }}
                            >
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                                {s.name}
                                <button
                                    onClick={() => handleRemoveSubject(s.id)}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: s.color, opacity: 0.6, padding: 0,
                                        display: 'flex', alignItems: 'center',
                                        marginLeft: 2,
                                    }}
                                >
                                    <X size={12} />
                                </button>
                            </motion.span>
                        ))
                    ) : (
                        <p className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>
                            No subjects added yet — click Add to get started
                        </p>
                    )}
                </div>
            </div>

            {/* Preferences */}
            <div className="surface-card" style={{ marginBottom: 16 }}>
                <h3 className="text-heading-md" style={{ marginBottom: 20 }}>Preferences</h3>

                {/* Grading System */}
                <div style={{ marginBottom: 20 }}>
                    <label className="text-label" style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>
                        Grading System
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {([
                            { value: 'cgpa' as const, label: '10-Point CGPA' },
                            { value: 'percentage' as const, label: 'Percentage' },
                        ]).map(opt => (
                            <button
                                key={opt.value}
                                className="btn btn-sm"
                                disabled={savingPref}
                                onClick={() => handleGradingChange(opt.value)}
                                style={{
                                    background: profile?.gradingSystem === opt.value ? 'var(--color-brand)' : 'var(--color-bg-raised)',
                                    color: profile?.gradingSystem === opt.value ? 'white' : 'var(--color-text-secondary)',
                                    border: `1px solid ${profile?.gradingSystem === opt.value ? 'var(--color-brand)' : 'rgba(255,255,255,0.06)'}`,
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Streak Cutoff */}
                <div>
                    <label className="text-label" style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>
                        Daily Streak Cutoff
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {['21:00', '22:00', '23:00', '23:59'].map(time => {
                            const current = profile?.streakCutoffTime || '23:00'
                            const h = parseInt(time.split(':')[0])
                            const label = h === 0 ? '12 AM' : h > 12 ? `${h - 12} PM` : h === 12 ? '12 PM' : `${h} AM`
                            const fullLabel = time === '23:59' ? 'Midnight' : label
                            return (
                                <button
                                    key={time}
                                    className="btn btn-sm"
                                    disabled={savingPref}
                                    onClick={() => handleCutoffChange(time)}
                                    style={{
                                        background: current === time ? 'var(--color-brand)' : 'var(--color-bg-raised)',
                                        color: current === time ? 'white' : 'var(--color-text-secondary)',
                                        border: `1px solid ${current === time ? 'var(--color-brand)' : 'rgba(255,255,255,0.06)'}`,
                                    }}
                                >
                                    {fullLabel}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Account Actions */}
            <div className="surface-card">
                <h3 className="text-heading-md" style={{ marginBottom: 16 }}>Account</h3>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-outline" onClick={signOut}>
                        <LogOut size={16} /> Sign Out
                    </button>
                    <button className="btn btn-danger">
                        <Trash2 size={16} /> Delete Account
                    </button>
                </div>
            </div>
        </div>
    )
}
