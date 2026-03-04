/**
 * Simple client-side rate limiter to prevent spam-clicking
 * on Firestore write operations.
 */

const actionTimestamps: Record<string, number[]> = {}

/**
 * Check if an action is allowed. Returns true if under the limit.
 * @param action - Unique action key (e.g., 'addExam', 'addAssignment')
 * @param maxPerMinute - Maximum allowed actions per 60 seconds (default: 10)
 */
export function checkRateLimit(action: string, maxPerMinute = 10): boolean {
    const now = Date.now()
    const windowMs = 60_000

    if (!actionTimestamps[action]) {
        actionTimestamps[action] = []
    }

    // Remove timestamps older than 1 minute
    actionTimestamps[action] = actionTimestamps[action].filter(
        t => now - t < windowMs
    )

    if (actionTimestamps[action].length >= maxPerMinute) {
        return false // Rate limited
    }

    actionTimestamps[action].push(now)
    return true
}

/**
 * Higher-order wrapper: returns false if rate-limited (caller should show toast).
 */
export function rateLimitedAction(action: string, maxPerMinute = 10): boolean {
    return checkRateLimit(action, maxPerMinute)
}

