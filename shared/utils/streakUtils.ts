import { format, isToday, isYesterday, differenceInCalendarDays, startOfDay } from 'date-fns'
import type { Streak } from '../types'

/**
 * Update streak based on a new study session.
 * Returns the updated streak object.
 */
export function updateStreak(streak: Streak, cutoffTime: string = '04:00'): Streak {
    const now = new Date()
    const todayStr = format(now, 'yyyy-MM-dd')

    // If already logged today, just return
    if (streak.lastLoggedDate === todayStr) {
        return {
            ...streak,
            heatmap: {
                ...streak.heatmap,
                [todayStr]: (streak.heatmap[todayStr] || 0) + 1,
            },
        }
    }

    const lastDate = streak.lastLoggedDate ? new Date(streak.lastLoggedDate) : null
    let newCurrent = streak.current

    if (!lastDate) {
        // First ever session
        newCurrent = 1
    } else {
        const daysDiff = differenceInCalendarDays(startOfDay(now), startOfDay(lastDate))
        if (daysDiff === 1) {
            // Consecutive day — increment!
            newCurrent = streak.current + 1
        } else if (daysDiff > 1) {
            // Missed days
            if (daysDiff === 2 && streak.freezesRemaining > 0) {
                // Use a freeze for ONE missed day
                newCurrent = streak.current + 1
                return {
                    current: newCurrent,
                    longest: Math.max(streak.longest, newCurrent),
                    lastLoggedDate: todayStr,
                    freezesRemaining: streak.freezesRemaining - 1,
                    heatmap: {
                        ...streak.heatmap,
                        [todayStr]: (streak.heatmap[todayStr] || 0) + 1,
                    },
                }
            } else {
                // Streak broken
                newCurrent = 1
            }
        }
    }

    return {
        current: newCurrent,
        longest: Math.max(streak.longest, newCurrent),
        lastLoggedDate: todayStr,
        freezesRemaining: streak.freezesRemaining,
        heatmap: {
            ...streak.heatmap,
            [todayStr]: (streak.heatmap[todayStr] || 0) + 1,
        },
    }
}

/**
 * Check if the streak is at risk (within warning window before cutoff)
 */
export function isStreakAtRisk(streak: Streak, cutoffTime: string = '23:59'): boolean {
    if (!streak.lastLoggedDate) return false
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    if (streak.lastLoggedDate === todayStr) return false // Already logged today

    const lastDate = new Date(streak.lastLoggedDate)
    const daysDiff = differenceInCalendarDays(startOfDay(new Date()), startOfDay(lastDate))
    return daysDiff >= 1 // At risk if haven't logged today
}

/**
 * Get default empty streak
 */
export function getDefaultStreak(): Streak {
    return {
        current: 0,
        longest: 0,
        lastLoggedDate: '',
        freezesRemaining: 1,
        heatmap: {},
    }
}
