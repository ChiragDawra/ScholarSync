import { useAuth } from '@/lib/AuthContext'
import { LogOut, User, Trash2 } from 'lucide-react'

export default function Settings() {
    const { user, profile, signOut } = useAuth()

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-display" style={{ marginBottom: 8 }}>Settings ⚙️</h1>
            <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)', marginBottom: 32 }}>
                Manage your profile, subjects, and preferences
            </p>

            {/* Profile */}
            <div className="surface-card" style={{ marginBottom: 16 }}>
                <h3 className="text-heading-md" style={{ marginBottom: 16 }}>Profile</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-alt))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden',
                    }}>
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <User size={24} color="white" />
                        )}
                    </div>
                    <div>
                        <div className="text-heading-sm">{profile?.name || user?.displayName}</div>
                        <div className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>
                            {user?.email}
                        </div>
                        {profile?.college && (
                            <div className="text-body-sm" style={{ color: 'var(--color-text-secondary)', marginTop: 2 }}>
                                {profile.college}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Subjects */}
            <div className="surface-card" style={{ marginBottom: 16 }}>
                <h3 className="text-heading-md" style={{ marginBottom: 16 }}>Subjects</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {profile?.subjects?.map((s) => (
                        <span key={s.id} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '6px 14px', borderRadius: 'var(--radius-full)',
                            background: `${s.color}20`, color: s.color,
                            fontSize: 13, fontWeight: 500,
                        }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                            {s.name}
                        </span>
                    )) || (
                            <p className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>
                                No subjects added yet
                            </p>
                        )}
                </div>
            </div>

            {/* Quick Info */}
            <div className="surface-card" style={{ marginBottom: 16 }}>
                <h3 className="text-heading-md" style={{ marginBottom: 16 }}>Preferences</h3>
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
                        <span className="text-body-md">{profile?.streakCutoffTime || '23:00'}</span>
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
