export default function Exams() {
    return (
        <div className="animate-fade-in-up">
            <h1 className="text-display" style={{ marginBottom: 8 }}>Exam Hub 📝</h1>
            <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)', marginBottom: 32 }}>
                Track your upcoming exams and never miss a deadline
            </p>
            <div className="surface-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
                <p style={{ fontSize: 48, marginBottom: 16 }}>📚</p>
                <p className="text-heading-md" style={{ marginBottom: 8 }}>Coming on Day 3</p>
                <p className="text-body-md" style={{ color: 'var(--color-text-muted)' }}>
                    Add exams, see live countdowns, and auto-generate study blocks
                </p>
            </div>
        </div>
    )
}
