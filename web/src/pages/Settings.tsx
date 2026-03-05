import { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { LogOut, Trash2, Plus, X, Check, Pencil, Download, Bell, BellOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { sanitizeString } from '@shared/utils/sanitize'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@shared/api/firebase'

const SUBJECT_COLORS = ['#6366F1', '#A855F7', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#F97316', '#14B8A6', '#8B5CF6']

export default function Settings() {
    const { user, profile, signOut, saveProfile } = useAuth()

    // Edit profile modal
    const [editing, setEditing] = useState(false)
    const [formName, setFormName] = useState('')
    const [formCollege, setFormCollege] = useState('')
    const [formGrading, setFormGrading] = useState<'cgpa' | 'percentage'>('cgpa')
    const [formCutoff, setFormCutoff] = useState('23:00')
    const [savingProfile, setSavingProfile] = useState(false)

    // Subjects
    const [newSubject, setNewSubject] = useState('')
    const [addingSubject, setAddingSubject] = useState(false)

    // Sign out confirm
    const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)

    // Notification prefs
    const [notifPrefs, setNotifPrefs] = useState({
        streakWarning: profile?.notificationPreferences?.streakWarning ?? true,
        examAlerts: profile?.notificationPreferences?.examAlerts ?? true,
        assignmentAlerts: profile?.notificationPreferences?.assignmentAlerts ?? true,
        weeklySummary: profile?.notificationPreferences?.weeklySummary ?? false,
    })
    const [savingNotif, setSavingNotif] = useState(false)

    // Data export
    const [exporting, setExporting] = useState(false)

    const openEditForm = () => {
        setFormName(profile?.name || '')
        setFormCollege(profile?.college || '')
        setFormGrading(profile?.gradingSystem || 'cgpa')
        setFormCutoff(profile?.streakCutoffTime || '23:00')
        setEditing(true)
    }

    const handleSaveProfile = async () => {
        if (!formName.trim()) { toast.error('Name is required'); return }
        setSavingProfile(true)
        try {
            await saveProfile({
                name: sanitizeString(formName, 100),
                college: sanitizeString(formCollege, 200),
                gradingSystem: formGrading,
                streakCutoffTime: formCutoff,
            })
            setEditing(false)
            toast.success('Profile updated!')
        } catch { toast.error('Failed to save') }
        finally { setSavingProfile(false) }
    }

    const handleAddSubject = async () => {
        if (!newSubject.trim()) return
        const existing = profile?.subjects || []
        const color = SUBJECT_COLORS[existing.length % SUBJECT_COLORS.length]
        const subject = { id: Date.now().toString(), name: sanitizeString(newSubject, 100), color }
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

    const handleSignOut = () => {
        setShowSignOutConfirm(false)
        signOut()
    }

    const toggleNotif = async (key: keyof typeof notifPrefs) => {
        const updated = { ...notifPrefs, [key]: !notifPrefs[key] }
        setNotifPrefs(updated)
        setSavingNotif(true)
        try {
            await saveProfile({ notificationPreferences: updated } as any)
            toast.success('Preferences updated')
        } catch { toast.error('Failed to save') }
        finally { setSavingNotif(false) }
    }

    const handleExportData = async () => {
        if (!user) return
        setExporting(true)
        try {
            const collections = ['exams', 'assignments', 'sessions', 'goals', 'courses', 'streak', 'settings']
            const exportData: Record<string, any> = { profile }

            for (const col of collections) {
                const snap = await getDocs(collection(db, 'users', user.uid, col))
                exportData[col] = snap.docs.map(d => ({ id: d.id, ...d.data() }))
            }

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `scholarsync-data-${new Date().toISOString().slice(0, 10)}.json`
            a.click()
            URL.revokeObjectURL(url)
            toast.success('Data exported!')
        } catch {
            toast.error('Failed to export data')
        } finally {
            setExporting(false)
        }
    }

    const formatCutoff = (time: string) => {
        const h = parseInt(time.split(':')[0])
        if (time === '23:59') return 'Midnight'
        return h === 0 ? '12 AM' : h > 12 ? `${h - 12} PM` : h === 12 ? '12 PM' : `${h} AM`
    }

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-display" style={{ marginBottom: 8 }}>Settings</h1>
            <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)', marginBottom: 32 }}>
                Manage your profile, subjects, and preferences
            </p>

            {/* Profile Card */}
            <div className="surface-card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h3 className="text-heading-md">Profile</h3>
                    <button className="btn btn-sm btn-outline" onClick={openEditForm}>
                        <Pencil size={13} /> Edit Profile
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
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
                    <div>
                        <div className="text-heading-sm" style={{ marginBottom: 2 }}>{profile?.name || 'Not set'}</div>
                        <div className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>{user?.email}</div>
                        {profile?.college && (
                            <div className="text-body-sm" style={{ color: 'var(--color-text-secondary)', marginTop: 2 }}>
                                {profile.college}
                            </div>
                        )}
                    </div>
                </div>

                {/* Inline details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                        <span className="text-label" style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                            Grading System
                        </span>
                        <span className="text-body-md">{profile?.gradingSystem === 'cgpa' ? '10-Point CGPA' : 'Percentage'}</span>
                    </div>
                    <div>
                        <span className="text-label" style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                            Streak Cutoff
                        </span>
                        <span className="text-body-md">{formatCutoff(profile?.streakCutoffTime || '23:00')}</span>
                    </div>
                </div>
            </div>

            {/* Subjects */}
            <div className="surface-card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 className="text-heading-md">Subjects</h3>
                    <button className="btn btn-sm btn-primary" onClick={() => setAddingSubject(true)}>
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
                                        display: 'flex', alignItems: 'center', marginLeft: 2,
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

            {/* Notification Preferences */}
            <div className="surface-card" style={{ marginBottom: 16 }}>
                <h3 className="text-heading-md" style={{ marginBottom: 16 }}>Notifications</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {([
                        { key: 'streakWarning' as const, label: 'Streak Warning', desc: 'Remind me before my streak resets' },
                        { key: 'examAlerts' as const, label: 'Exam Alerts', desc: 'Notifications for upcoming exams' },
                        { key: 'assignmentAlerts' as const, label: 'Assignment Alerts', desc: 'Reminders for assignment deadlines' },
                        { key: 'weeklySummary' as const, label: 'Weekly Summary', desc: 'Weekly progress digest' },
                    ]).map(item => (
                        <div key={item.key} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '12px 16px', borderRadius: 'var(--radius-md)',
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                {notifPrefs[item.key]
                                    ? <Bell size={16} color="#10B981" />
                                    : <BellOff size={16} color="var(--color-text-muted)" />
                                }
                                <div>
                                    <p className="text-body-md" style={{ fontWeight: 500 }}>{item.label}</p>
                                    <p className="text-body-sm" style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{item.desc}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleNotif(item.key)}
                                disabled={savingNotif}
                                style={{
                                    width: 44, height: 24, borderRadius: 12,
                                    background: notifPrefs[item.key]
                                        ? 'linear-gradient(135deg, #6366F1, #A855F7)'
                                        : 'rgba(255,255,255,0.1)',
                                    border: 'none', cursor: 'pointer', position: 'relative',
                                    transition: 'background 200ms ease',
                                }}
                            >
                                <div style={{
                                    width: 18, height: 18, borderRadius: '50%',
                                    background: 'white', position: 'absolute', top: 3,
                                    left: notifPrefs[item.key] ? 23 : 3,
                                    transition: 'left 200ms ease',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                }} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Account Actions */}
            <div className="surface-card">
                <h3 className="text-heading-md" style={{ marginBottom: 16 }}>Account</h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <button className="btn btn-outline" onClick={handleExportData} disabled={exporting}>
                        <Download size={16} /> {exporting ? 'Exporting...' : 'Export Data'}
                    </button>
                    <button className="btn btn-outline" onClick={() => setShowSignOutConfirm(true)}>
                        <LogOut size={16} /> Sign Out
                    </button>
                    <button className="btn btn-danger">
                        <Trash2 size={16} /> Delete Account
                    </button>
                </div>
            </div>

            {/* ─── Edit Profile Modal ─── */}
            <AnimatePresence>
                {editing && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setEditing(false)}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                                <h2 className="text-heading-lg">Edit Profile</h2>
                                <button className="btn btn-icon" onClick={() => setEditing(false)}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="form-group">
                                <label>Display Name *</label>
                                <input
                                    className="input"
                                    value={formName}
                                    onChange={e => setFormName(e.target.value)}
                                    placeholder="Your name"
                                />
                            </div>

                            <div className="form-group">
                                <label>College / University</label>
                                <input
                                    className="input"
                                    value={formCollege}
                                    onChange={e => setFormCollege(e.target.value)}
                                    placeholder="Your college"
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    className="input"
                                    value={user?.email || ''}
                                    disabled
                                    style={{ opacity: 0.5, cursor: 'not-allowed' }}
                                />
                            </div>

                            <div className="form-group">
                                <label>Grading System</label>
                                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                    {([
                                        { value: 'cgpa' as const, label: '10-Point CGPA' },
                                        { value: 'percentage' as const, label: 'Percentage' },
                                    ]).map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            className="btn btn-sm"
                                            onClick={() => setFormGrading(opt.value)}
                                            style={{
                                                flex: 1,
                                                background: formGrading === opt.value ? 'var(--color-brand)' : 'var(--color-bg-raised)',
                                                color: formGrading === opt.value ? 'white' : 'var(--color-text-secondary)',
                                                border: `1px solid ${formGrading === opt.value ? 'var(--color-brand)' : 'rgba(255,255,255,0.06)'}`,
                                            }}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Daily Streak Cutoff</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                                    {['21:00', '22:00', '23:00', '23:59'].map(time => {
                                        const h = parseInt(time.split(':')[0])
                                        const label = time === '23:59' ? 'Midnight' : h > 12 ? `${h - 12} PM` : `${h} AM`
                                        return (
                                            <button
                                                key={time}
                                                type="button"
                                                className="btn btn-sm"
                                                onClick={() => setFormCutoff(time)}
                                                style={{
                                                    background: formCutoff === time ? 'var(--color-brand)' : 'var(--color-bg-raised)',
                                                    color: formCutoff === time ? 'white' : 'var(--color-text-secondary)',
                                                    border: `1px solid ${formCutoff === time ? 'var(--color-brand)' : 'rgba(255,255,255,0.06)'}`,
                                                }}
                                            >
                                                {label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                                <button className="btn btn-ghost" onClick={() => setEditing(false)} style={{ flex: 1 }}>
                                    Cancel
                                </button>
                                <button className="btn btn-gradient" onClick={handleSaveProfile} disabled={savingProfile} style={{ flex: 1 }}>
                                    {savingProfile ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Sign Out Confirmation ─── */}
            <AnimatePresence>
                {showSignOutConfirm && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowSignOutConfirm(false)}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            style={{ maxWidth: 400, textAlign: 'center' }}
                        >
                            <div style={{
                                width: 56, height: 56, borderRadius: '50%',
                                background: 'rgba(239,68,68,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 20px',
                            }}>
                                <LogOut size={24} color="#EF4444" />
                            </div>
                            <h2 className="text-heading-lg" style={{ marginBottom: 8 }}>Sign Out?</h2>
                            <p className="text-body-md" style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
                                Are you sure you want to sign out? Your data will be saved and available when you sign back in.
                            </p>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => setShowSignOutConfirm(false)}
                                    style={{ flex: 1 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={handleSignOut}
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
