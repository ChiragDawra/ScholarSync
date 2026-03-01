import { Sparkles } from 'lucide-react'

interface AiInsightCardProps {
    message: string
    onDismiss?: () => void
    onAction?: () => void
    actionLabel?: string
}

export function AiInsightCard({ message, onDismiss, onAction, actionLabel = 'Create Plan' }: AiInsightCardProps) {
    return (
        <div className="ai-card">
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-alt))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    <Sparkles size={18} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{
                        fontSize: 14, fontWeight: 600, marginBottom: 6,
                        color: 'var(--color-text-primary)',
                    }}>
                        AI Coach Insight
                    </div>
                    <p className="text-body-md" style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.6,
                    }}>
                        ⚡ {message}
                    </p>
                    <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                        {onDismiss && (
                            <button className="btn btn-ghost btn-sm" onClick={onDismiss}>
                                Dismiss
                            </button>
                        )}
                        {onAction && (
                            <button className="btn btn-primary btn-sm" onClick={onAction}>
                                {actionLabel}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
