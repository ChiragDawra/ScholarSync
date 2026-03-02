import { format } from 'date-fns'
import { getFocusScoreLabel } from '@shared/utils/focusScore'
import type { Session, Subject } from '@shared/types'

interface SessionHistoryProps {
    sessions: Session[]
    subjects: Subject[]
}

export default function SessionHistory({ sessions, subjects }: SessionHistoryProps) {
    const getSubject = (id: string) => subjects.find(s => s.id === id)

    if (sessions.length === 0) {
        return (
            <div className="surface-card" style={{ textAlign: 'center', padding: 32 }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
                    No sessions yet. Start a Pomodoro to see your history here!
                </p>
            </div>
        )
    }

    return (
        <div className="surface-card" style={{ overflow: 'hidden' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Session History</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {['Subject', 'Duration', 'Date', 'Focus Score'].map(col => (
                                <th key={col} style={{
                                    fontSize: 11, fontWeight: 700,
                                    textTransform: 'uppercase' as const,
                                    letterSpacing: '0.08em',
                                    color: 'var(--color-text-muted)',
                                    padding: '8px 12px',
                                    textAlign: 'left',
                                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                                }}>
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.slice(0, 10).map((session) => {
                            const subject = getSubject(session.subjectId)
                            const scoreInfo = getFocusScoreLabel(session.focusScore)
                            const dateStr = session.date && 'toDate' in session.date
                                ? format(session.date.toDate(), 'MMM d, h:mm a')
                                : format(new Date(), 'MMM d, h:mm a')

                            return (
                                <tr key={session.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '10px 12px', fontSize: 13 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{
                                                width: 8, height: 8, borderRadius: '50%',
                                                background: subject?.color || '#5B5BD6',
                                            }} />
                                            {subject?.name || 'Unknown'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px 12px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                                        {session.durationMinutes} min
                                    </td>
                                    <td style={{ padding: '10px 12px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                                        {dateStr}
                                    </td>
                                    <td style={{ padding: '10px 12px' }}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 4,
                                            padding: '2px 10px', borderRadius: 'var(--radius-full)',
                                            fontSize: 12, fontWeight: 600,
                                            background: `${scoreInfo.color}15`,
                                            color: scoreInfo.color,
                                        }}>
                                            {session.focusScore} · {scoreInfo.label}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
