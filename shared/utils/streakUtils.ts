import { format, differenceInCalendarDays, startOfDay } from 'date-fns'
import type { Streak } from '../types'

/**
 * Get the "effective date" for streak purposes, accounting for cutoff time.
 * If the current time is before the cutoff, it counts as the previous day.
 * e.g., cutoff "04:00" → a session at 2:00 AM counts as the previous day.
 */
function getEffectiveDate(date: Date, cutoffTime: string): Date {
    const [cutoffH, cutoffM] = cutoffTime.split(':').map(Number)
    const hours = date.getHours()
    const minutes = date.getMinutes()

    if (hours < cutoffH || (hours === cutoffH && minutes < cutoffM)) {
        // Before cutoff — shift to previous calendar day
        const shifted = new Date(date)
        shifted.setDate(shifted.getDate() - 1)
        return startOfDay(shifted)
    }
    return startOfDay(date)
}

/**
 * Update streak based on a new study session.
 * Returns the updated streak object.
 *
 * @param cutoffTime — HH:MM. Sessions before this time count as the previous day.
 *                     e.g., "04:00" means a 2 AM session counts for yesterday.
 */
export function updateStreak(streak: Streak, cutoffTime: string = '04:00'): Streak {
    const now = new Date()
    const effectiveDay = getEffectiveDate(now, cutoffTime)
    const todayStr = format(effectiveDay, 'yyyy-MM-dd')

    // If already logged for this effective day, just increment heatmap
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
        const daysDiff = differenceInCalendarDays(effectiveDay, startOfDay(lastDate))
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
        // daysDiff === 0 shouldn't happen (we checked todayStr above), but just in case
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
 * Check if the streak is at risk (haven't logged for the effective day yet).
 */
export function isStreakAtRisk(streak: Streak, cutoffTime: string = '23:00'): boolean {
    if (!streak.lastLoggedDate) return false

    const effectiveDay = getEffectiveDate(new Date(), cutoffTime)
    const todayStr = format(effectiveDay, 'yyyy-MM-dd')
    if (streak.lastLoggedDate === todayStr) return false // Already logged today

    const lastDate = new Date(streak.lastLoggedDate)
    const daysDiff = differenceInCalendarDays(effectiveDay, startOfDay(lastDate))
    return daysDiff >= 1 // At risk if haven't logged for the effective day
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
