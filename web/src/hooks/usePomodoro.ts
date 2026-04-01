import { useState, useCallback, useRef, useEffect } from 'react'

export type PomodoroState = 'idle' | 'focus' | 'break' | 'paused'

interface PomodoroConfig {
    focusMinutes: number
    breakMinutes: number
}

interface PomodoroReturn {
    state: PomodoroState
    timeLeft: number // seconds remaining
    totalTime: number // total seconds for current phase
    subjectId: string | null
    pauseCount: number
    elapsedFocusSeconds: number
    progress: number // 0-1
    start: (subjectId: string) => void
    pause: () => void
    resume: () => void
    reset: () => void
    setConfig: (config: PomodoroConfig) => void
    config: PomodoroConfig
}

const PRESETS = {
    '25/5': { focusMinutes: 25, breakMinutes: 5 },
    '50/10': { focusMinutes: 50, breakMinutes: 10 },
    'debug': { focusMinutes: 0.5, breakMinutes: 0.25 },
}

export { PRESETS as POMODORO_PRESETS }

// ── Audio helper ──
// Plays a short tone and cleans up properly.
function playTone(frequency: number, durationMs: number): void {
    try {
        const ctx = new AudioContext()
        const oscillator = ctx.createOscillator()
        const gain = ctx.createGain()
        oscillator.connect(gain)
        gain.connect(ctx.destination)
        oscillator.frequency.value = frequency
        oscillator.type = 'sine'
        gain.gain.value = 0.3
        oscillator.start()
        gain.gain.setValueAtTime(0.3, ctx.currentTime + durationMs / 1000 * 0.6)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + durationMs / 1000)
        oscillator.stop(ctx.currentTime + durationMs / 1000 + 0.05)
        // Close context after oscillator finishes
        oscillator.onended = () => { ctx.close().catch(() => {}) }
    } catch {
        // AudioContext not available (e.g., SSR or permission denied)
    }
}

export function usePomodoro(): PomodoroReturn {
    const [state, setState] = useState<PomodoroState>('idle')
    const [config, setConfig] = useState<PomodoroConfig>(PRESETS['25/5'])
    const [timeLeft, setTimeLeft] = useState(config.focusMinutes * 60)
    const [totalTime, setTotalTime] = useState(config.focusMinutes * 60)
    const [subjectId, setSubjectId] = useState<string | null>(null)
    const [pauseCount, setPauseCount] = useState(0)
    // Track focus-phase elapsed time accumulated before the current running segment.
    // elapsedFocusSeconds is derived: accumulatedFocusBeforePause + (totalTime - timeLeft) when in focus.
    const [accumulatedFocus, setAccumulatedFocus] = useState(0)

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const prevStateRef = useRef<PomodoroState>('idle')

    const clearTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    }, [])

    const startTimer = useCallback(() => {
        // Guard: don't create a second interval if one is already running
        if (intervalRef.current) return
        intervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearTimer()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }, [clearTimer])

    // Handle timer reaching 0
    useEffect(() => {
        if (timeLeft === 0 && state === 'focus') {
            // Focus period complete → start break
            playTone(800, 500)
            const breakSeconds = Math.round(config.breakMinutes * 60)
            setState('break')
            setTotalTime(breakSeconds)
            setTimeLeft(breakSeconds)
            // Use setTimeout to defer startTimer so state updates settle first
            setTimeout(() => startTimer(), 0)
        } else if (timeLeft === 0 && state === 'break') {
            // Break complete → back to idle
            playTone(600, 800)
            setState('idle')
        }
    }, [timeLeft, state, config.breakMinutes, startTimer])

    // Update tab title
    useEffect(() => {
        if (state === 'focus' || state === 'break') {
            const mins = Math.floor(timeLeft / 60)
            const secs = timeLeft % 60
            const label = state === 'focus' ? '🔴 Focus' : '☕ Break'
            document.title = `${label} ${mins}:${secs.toString().padStart(2, '0')} — ScholarSync`
        } else {
            document.title = 'ScholarSync — Your Academic OS'
        }
    }, [state, timeLeft])

    // Cleanup on unmount
    useEffect(() => () => {
        clearTimer()
        document.title = 'ScholarSync — Your Academic OS'
    }, [clearTimer])

    const start = useCallback((sid: string) => {
        setSubjectId(sid)
        setPauseCount(0)
        setAccumulatedFocus(0)
        const focusSeconds = Math.round(config.focusMinutes * 60)
        setTotalTime(focusSeconds)
        setTimeLeft(focusSeconds)
        setState('focus')
        startTimer()
    }, [config.focusMinutes, startTimer])

    const pause = useCallback(() => {
        if (state === 'focus' || state === 'break') {
            prevStateRef.current = state
            // If pausing during focus, accumulate the elapsed focus time so far
            if (state === 'focus') {
                setAccumulatedFocus(prev => prev + (totalTime - timeLeft))
            }
            setState('paused')
            clearTimer()
            setPauseCount(prev => prev + 1)
        }
    }, [state, clearTimer, totalTime, timeLeft])

    const resume = useCallback(() => {
        if (state === 'paused') {
            const resumedState = prevStateRef.current
            // When resuming focus, totalTime resets to current timeLeft
            // so we can track the new segment's elapsed time
            if (resumedState === 'focus') {
                setTotalTime(timeLeft)
            }
            setState(resumedState)
            startTimer()
        }
    }, [state, startTimer, timeLeft])

    const reset = useCallback(() => {
        clearTimer()
        setState('idle')
        const focusSeconds = Math.round(config.focusMinutes * 60)
        setTimeLeft(focusSeconds)
        setTotalTime(focusSeconds)
        setSubjectId(null)
        setPauseCount(0)
        setAccumulatedFocus(0)
    }, [clearTimer, config.focusMinutes])

    const handleSetConfig = useCallback((newConfig: PomodoroConfig) => {
        setConfig(newConfig)
        if (state === 'idle') {
            const seconds = Math.round(newConfig.focusMinutes * 60)
            setTimeLeft(seconds)
            setTotalTime(seconds)
        }
    }, [state])

    // Derive progress from totalTime/timeLeft — no separate interval needed
    const progress = totalTime > 0 ? 1 - timeLeft / totalTime : 0

    // Derive elapsed focus seconds — accumulated from pauses + current segment
    const elapsedFocusSeconds = state === 'focus'
        ? accumulatedFocus + (totalTime - timeLeft)
        : accumulatedFocus

    return {
        state,
        timeLeft,
        totalTime,
        subjectId,
        pauseCount,
        elapsedFocusSeconds,
        progress,
        start,
        pause,
        resume,
        reset,
        setConfig: handleSetConfig,
        config,
    }
}
