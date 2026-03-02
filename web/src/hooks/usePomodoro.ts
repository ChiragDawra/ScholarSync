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

export function usePomodoro(): PomodoroReturn {
    const [state, setState] = useState<PomodoroState>('idle')
    const [config, setConfig] = useState<PomodoroConfig>(PRESETS['25/5'])
    const [timeLeft, setTimeLeft] = useState(config.focusMinutes * 60)
    const [totalTime, setTotalTime] = useState(config.focusMinutes * 60)
    const [subjectId, setSubjectId] = useState<string | null>(null)
    const [pauseCount, setPauseCount] = useState(0)
    const [elapsedFocusSeconds, setElapsedFocusSeconds] = useState(0)

    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const prevStateRef = useRef<PomodoroState>('idle')

    const clearTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    }, [])

    const startTimer = useCallback(() => {
        clearTimer()
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
            try {
                const audio = new AudioContext()
                const oscillator = audio.createOscillator()
                const gain = audio.createGain()
                oscillator.connect(gain)
                gain.connect(audio.destination)
                oscillator.frequency.value = 800
                oscillator.type = 'sine'
                gain.gain.value = 0.3
                oscillator.start()
                setTimeout(() => {
                    oscillator.stop()
                    audio.close()
                }, 500)
            } catch { }

            const breakSeconds = config.breakMinutes * 60
            setState('break')
            setTotalTime(breakSeconds)
            setTimeLeft(breakSeconds)
            startTimer()
        } else if (timeLeft === 0 && state === 'break') {
            // Break complete → back to idle
            try {
                const audio = new AudioContext()
                const oscillator = audio.createOscillator()
                const gain = audio.createGain()
                oscillator.connect(gain)
                gain.connect(audio.destination)
                oscillator.frequency.value = 600
                oscillator.type = 'sine'
                gain.gain.value = 0.3
                oscillator.start()
                setTimeout(() => {
                    gain.gain.setValueAtTime(0.3, audio.currentTime)
                    gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.5)
                    setTimeout(() => { oscillator.stop(); audio.close() }, 600)
                }, 300)
            } catch { }

            setState('idle')
        }
    }, [timeLeft, state, config.breakMinutes, startTimer])

    // Track elapsed focus time
    useEffect(() => {
        if (state === 'focus') {
            const id = setInterval(() => {
                setElapsedFocusSeconds(prev => prev + 1)
            }, 1000)
            return () => clearInterval(id)
        }
    }, [state])

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
    useEffect(() => () => clearTimer(), [clearTimer])

    const start = useCallback((sid: string) => {
        setSubjectId(sid)
        setPauseCount(0)
        setElapsedFocusSeconds(0)
        const focusSeconds = config.focusMinutes * 60
        setTotalTime(focusSeconds)
        setTimeLeft(focusSeconds)
        setState('focus')
        startTimer()
    }, [config.focusMinutes, startTimer])

    const pause = useCallback(() => {
        if (state === 'focus' || state === 'break') {
            prevStateRef.current = state
            setState('paused')
            clearTimer()
            setPauseCount(prev => prev + 1)
        }
    }, [state, clearTimer])

    const resume = useCallback(() => {
        if (state === 'paused') {
            setState(prevStateRef.current)
            startTimer()
        }
    }, [state, startTimer])

    const reset = useCallback(() => {
        clearTimer()
        setState('idle')
        setTimeLeft(config.focusMinutes * 60)
        setTotalTime(config.focusMinutes * 60)
        setSubjectId(null)
        setPauseCount(0)
        setElapsedFocusSeconds(0)
    }, [clearTimer, config.focusMinutes])

    const handleSetConfig = useCallback((newConfig: PomodoroConfig) => {
        setConfig(newConfig)
        if (state === 'idle') {
            const seconds = newConfig.focusMinutes * 60
            setTimeLeft(seconds)
            setTotalTime(seconds)
        }
    }, [state])

    const progress = totalTime > 0 ? 1 - timeLeft / totalTime : 0

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
