export default function Pomodoro() {
    return (
        <div className="animate-fade-in-up">
            <h1 className="text-display" style={{ marginBottom: 8 }}>Pomodoro Studio ⏱️</h1>
            <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)', marginBottom: 32 }}>
                Focus timer with session tracking
            </p>
            <div className="surface-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
                <p style={{ fontSize: 48, marginBottom: 16 }}>⏱️</p>
                <p className="text-heading-md" style={{ marginBottom: 8 }}>Coming on Day 2</p>
                <p className="text-body-md" style={{ color: 'var(--color-text-muted)' }}>
                    SVG ring timer, session goals, focus scoring, and session history
                </p>
            </div>
        </div>
    )
}
