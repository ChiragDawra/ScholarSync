/**
 * Calculate a 0-100 focus score for a completed Pomodoro session.
 * 
 * Formula:
 * - Base score: 60 (for completing the session)
 * - Task bonus: up to +20 (proportion of todos completed)
 * - Pause penalty: -5 per pause (capped at -20)
 * - Duration bonus: +10 if session >= 25 min, +20 if >= 50 min
 * 
 * Result is clamped to [0, 100]
 */
export function calculateFocusScore(params: {
    todosTotal: number
    todosCompleted: number
    pauseCount: number
    durationMinutes: number
}): number {
    const { todosTotal, todosCompleted, pauseCount, durationMinutes } = params

    // Base score for completing a session
    let score = 60

    // Task completion bonus (0-20 points)
    if (todosTotal > 0) {
        score += Math.round((todosCompleted / todosTotal) * 20)
    } else {
        score += 10 // partial credit if no todos set
    }

    // Pause penalty (-5 per pause, max -20)
    score -= Math.min(pauseCount * 5, 20)

    // Duration bonus
    if (durationMinutes >= 50) {
        score += 20
    } else if (durationMinutes >= 25) {
        score += 10
    }

    return Math.max(0, Math.min(100, score))
}

/**
 * Get a label and color for a focus score
 */
export function getFocusScoreLabel(score: number): { label: string; color: string } {
    if (score >= 90) return { label: 'Excellent', color: '#10B981' }
    if (score >= 70) return { label: 'Good', color: '#6366F1' }
    if (score >= 50) return { label: 'Fair', color: '#F59E0B' }
    return { label: 'Low', color: '#EF4444' }
}
