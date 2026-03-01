interface ScheduleItem {
    time: string
    title: string
    subtitle?: string
    tags?: { label: string; color: string }[]
    isCurrent?: boolean
    avatars?: string[]
}

interface TodayScheduleProps {
    items: ScheduleItem[]
}

export function TodaySchedule({ items }: TodayScheduleProps) {
    return (
        <div className="surface-card" style={{ height: '100%' }}>
            <h3 className="text-heading-md" style={{ marginBottom: 20 }}>Today's Schedule</h3>

            {items.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '40px 20px',
                    color: 'var(--color-text-muted)',
                }}>
                    <p style={{ fontSize: 14, marginBottom: 8 }}>No sessions scheduled today</p>
                    <p style={{ fontSize: 12 }}>Add an exam or start a Pomodoro session</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {items.map((item, index) => (
                        <div key={index} style={{ display: 'flex', gap: 16 }}>
                            {/* Timeline dot + line */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 16 }}>
                                <div style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: item.isCurrent ? 'var(--color-brand)' : 'var(--color-text-muted)',
                                    marginTop: 6, flexShrink: 0,
                                    boxShadow: item.isCurrent ? '0 0 0 4px rgba(91,91,214,0.2)' : 'none',
                                    position: 'relative',
                                }}>
                                    {item.isCurrent && (
                                        <div style={{
                                            position: 'absolute', inset: -4,
                                            borderRadius: '50%',
                                            border: '2px solid var(--color-brand)',
                                            animation: 'pulse-ring 2s infinite',
                                        }} />
                                    )}
                                </div>
                                {index < items.length - 1 && (
                                    <div style={{
                                        width: 1, flex: 1,
                                        background: 'rgba(255,255,255,0.08)',
                                        marginTop: 4,
                                    }} />
                                )}
                            </div>

                            {/* Content */}
                            <div style={{ paddingBottom: 24, flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    {item.isCurrent && (
                                        <span style={{
                                            fontSize: 11, fontWeight: 600, color: 'var(--color-success)',
                                            textTransform: 'uppercase', letterSpacing: '0.05em',
                                        }}>Now</span>
                                    )}
                                    <span className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>
                                        {item.time}
                                    </span>
                                </div>
                                <div className="text-body-md" style={{ fontWeight: 600, marginBottom: 4 }}>
                                    {item.title}
                                </div>
                                {item.subtitle && (
                                    <div className="text-body-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                                        {item.subtitle}
                                    </div>
                                )}
                                {item.tags && item.tags.length > 0 && (
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        {item.tags.map((tag, ti) => (
                                            <span key={ti} style={{
                                                display: 'inline-flex', padding: '2px 8px',
                                                borderRadius: 'var(--radius-sm)', fontSize: 11,
                                                background: `${tag.color}20`, color: tag.color, fontWeight: 500,
                                            }}>
                                                {tag.label}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
