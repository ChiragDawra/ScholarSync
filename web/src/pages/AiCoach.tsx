export default function AiCoach() {
    return (
        <div className="animate-fade-in-up">
            <h1 className="text-display" style={{ marginBottom: 8 }}>
                AI Study Coach <span className="badge-muted" style={{ fontSize: 12, padding: '2px 8px', verticalAlign: 'middle' }}>Beta</span>
            </h1>
            <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)', marginBottom: 32 }}>
                Get personalized study plans and academic insights
            </p>
            <div className="surface-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
                <p style={{ fontSize: 48, marginBottom: 16 }}>✨</p>
                <p className="text-heading-md" style={{ marginBottom: 8 }}>Coming on Day 5</p>
                <p className="text-body-md" style={{ color: 'var(--color-text-muted)' }}>
                    Chat with AI, generate weekly plans, and get inline scheduling cards
                </p>
            </div>
        </div>
    )
}
