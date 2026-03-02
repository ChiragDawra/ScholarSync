import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Play, Pause, Flame, BookOpen, Zap } from 'lucide-react'
import { collection, addDoc, getDocs, query, orderBy, limit, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'

import { useAuth } from '@/lib/AuthContext'
import { db } from '@shared/api/firebase'
import { usePomodoro, POMODORO_PRESETS } from '@/hooks/usePomodoro'
import { calculateFocusScore } from '@shared/utils/focusScore'
import { updateStreak, getDefaultStreak } from '@shared/utils/streakUtils'
import type { Session, Streak, Subject } from '@shared/types'

import TimerRing from '@/components/pomodoro/TimerRing'
import SessionGoals from '@/components/pomodoro/SessionGoals'
import SessionHistory from '@/components/pomodoro/SessionHistory'

interface Todo {
    id: string
    text: string
    done: boolean
}

type PresetKey = '25/5' | '50/10' | 'debug'

export default function Pomodoro() {
    const { user, profile } = useAuth()
    const pomodoro = usePomodoro()
    const [todos, setTodos] = useState<Todo[]>([])
    const [sessions, setSessions] = useState<Session[]>([])
    const [streak, setStreak] = useState<Streak>(getDefaultStreak())
    const [selectedPreset, setSelectedPreset] = useState<PresetKey>('25/5')
    const [sessionSaved, setSessionSaved] = useState(false)

    const subjects: Subject[] = profile?.subjects || []
    const selectedSubject = subjects.find(s => s.id === pomodoro.subjectId)

    // Load sessions & streak from Firestore
    useEffect(() => {
        if (!user) return
        const loadData = async () => {
            try {
                // Load sessions
                const sessionsRef = collection(db, 'users', user.uid, 'sessions')
                const q = query(sessionsRef, orderBy('date', 'desc'), limit(20))
                const snap = await getDocs(q)
                setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Session)))

                // Load streak
                const streakRef = doc(db, 'users', user.uid, 'streak', 'data')
                const streakSnap = await getDoc(streakRef)
                if (streakSnap.exists()) {
                    setStreak(streakSnap.data() as Streak)
                }
            } catch (err) {
                console.warn('Could not load session data:', err)
            }
        }
        loadData()
    }, [user])

    // Auto-save session when focus completes (transitions to break)
    useEffect(() => {
        if (pomodoro.state === 'break' && !sessionSaved) {
            saveSession()
            setSessionSaved(true)
        }
        if (pomodoro.state === 'focus') {
            setSessionSaved(false)
        }
    }, [pomodoro.state])

    const saveSession = useCallback(async () => {
        if (!user || !pomodoro.subjectId) return
        const focusScore = calculateFocusScore({
            todosTotal: todos.length,
            todosCompleted: todos.filter(t => t.done).length,
            pauseCount: pomodoro.pauseCount,
            durationMinutes: Math.round(pomodoro.elapsedFocusSeconds / 60),
        })

        const session: Omit<Session, 'id'> = {
            subjectId: pomodoro.subjectId,
            durationMinutes: Math.round(pomodoro.elapsedFocusSeconds / 60),
            date: Timestamp.now(),
            todosTotal: todos.length,
            todosCompleted: todos.filter(t => t.done).length,
            pauseCount: pomodoro.pauseCount,
            focusScore,
        }

        try {
            const sessionsRef = collection(db, 'users', user.uid, 'sessions')
            const docRef = await addDoc(sessionsRef, session)
            setSessions(prev => [{ id: docRef.id, ...session } as Session, ...prev])

            // Update streak
            const newStreak = updateStreak(streak, profile?.streakCutoffTime || '23:59')
            const streakRef = doc(db, 'users', user.uid, 'streak', 'data')
            await setDoc(streakRef, newStreak)
            setStreak(newStreak)

            toast.success(`Session complete! Focus score: ${focusScore}`, {
                icon: '🎯',
                duration: 4000,
            })

            if (newStreak.current > streak.current) {
                toast.success(`🔥 Streak: ${newStreak.current} days!`, { duration: 3000 })
            }
        } catch (err) {
            console.error('Error saving session:', err)
            toast.error('Could not save session')
        }
    }, [user, pomodoro, todos, streak, profile])

    const handleStart = (subjectId: string) => {
        setTodos([])
        setSessionSaved(false)
        pomodoro.start(subjectId)
    }

    const handlePresetChange = (key: PresetKey) => {
        setSelectedPreset(key)
        pomodoro.setConfig(POMODORO_PRESETS[key])
    }

    const isActive = pomodoro.state !== 'idle'
    const phaseLabel = pomodoro.state === 'break' ? 'Break Time ☕' : 'Focus Session'

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
                    Pomodoro Studio
                </h1>
                <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4 }}>
                    Stay focused. Build streaks. Track progress.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
                {/* ─── Left: Timer ─── */}
                <div>
                    {/* Subject tabs */}
                    {!isActive && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}
                        >
                            {subjects.length === 0 ? (
                                <div style={{
                                    padding: '12px 20px',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px dashed rgba(255,255,255,0.1)',
                                    fontSize: 13, color: 'var(--color-text-muted)',
                                }}>
                                    <BookOpen size={14} style={{ marginRight: 6, display: 'inline' }} />
                                    Add subjects in Settings to get started
                                </div>
                            ) : (
                                subjects.map(subject => (
                                    <motion.button
                                        key={subject.id}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => handleStart(subject.id)}
                                        style={{
                                            padding: '8px 18px',
                                            borderRadius: 'var(--radius-full)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            background: `${subject.color}10`,
                                            color: subject.color,
                                            fontSize: 13, fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: 6,
                                        }}
                                    >
                                        <div style={{
                                            width: 8, height: 8, borderRadius: '50%',
                                            background: subject.color,
                                        }} />
                                        {subject.name}
                                    </motion.button>
                                ))
                            )}
                        </motion.div>
                    )}

                    {/* Active subject indicator */}
                    <AnimatePresence>
                        {isActive && selectedSubject && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    padding: '6px 16px',
                                    borderRadius: 'var(--radius-full)',
                                    background: `${selectedSubject.color}15`,
                                    border: `1px solid ${selectedSubject.color}30`,
                                    fontSize: 13, fontWeight: 600,
                                    color: selectedSubject.color,
                                    marginBottom: 24,
                                }}
                            >
                                <div style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: selectedSubject.color,
                                }} />
                                {selectedSubject.name}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Timer Ring */}
                    <div className="surface-card" style={{
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', padding: 40,
                    }}>
                        <TimerRing
                            progress={pomodoro.progress}
                            timeLeft={pomodoro.timeLeft}
                            state={pomodoro.state}
                            label={phaseLabel}
                        />

                        {/* Duration presets */}
                        {!isActive && (
                            <div style={{ display: 'flex', gap: 8, marginTop: 28 }}>
                                {(['25/5', '50/10', 'debug'] as PresetKey[]).map(key => (
                                    <button
                                        key={key}
                                        onClick={() => handlePresetChange(key)}
                                        style={{
                                            padding: '6px 16px',
                                            borderRadius: 'var(--radius-full)',
                                            border: selectedPreset === key ? '1px solid var(--color-brand)' : '1px solid rgba(255,255,255,0.08)',
                                            background: selectedPreset === key ? 'rgba(91,91,214,0.12)' : 'transparent',
                                            color: selectedPreset === key ? 'var(--color-brand)' : 'var(--color-text-muted)',
                                            fontSize: 13, fontWeight: 600,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {key === 'debug' ? '⚡ 30s' : key}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Controls */}
                        <div style={{ display: 'flex', gap: 16, marginTop: 28 }}>
                            {isActive && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => pomodoro.reset()}
                                    style={{
                                        width: 48, height: 48, borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        color: 'var(--color-text-secondary)',
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}
                                >
                                    <RotateCcw size={18} />
                                </motion.button>
                            )}

                            {isActive && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => pomodoro.state === 'paused' ? pomodoro.resume() : pomodoro.pause()}
                                    style={{
                                        width: 64, height: 64, borderRadius: '50%',
                                        background: pomodoro.state === 'paused'
                                            ? 'linear-gradient(135deg, var(--color-brand), var(--color-brand-alt))'
                                            : 'rgba(255,255,255,0.08)',
                                        border: 'none',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: pomodoro.state === 'paused' ? '0 4px 20px rgba(91,91,214,0.4)' : 'none',
                                    }}
                                >
                                    {pomodoro.state === 'paused' ? <Play size={24} /> : <Pause size={24} />}
                                </motion.button>
                            )}
                        </div>
                    </div>

                    {/* Session stats when active */}
                    <AnimatePresence>
                        {isActive && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: 12, marginTop: 16,
                                }}
                            >
                                <div className="surface-card" style={{ textAlign: 'center', padding: 16 }}>
                                    <Zap size={16} color="#F59E0B" style={{ margin: '0 auto 6px' }} />
                                    <div style={{ fontSize: 20, fontWeight: 700 }}>
                                        {Math.floor(pomodoro.elapsedFocusSeconds / 60)}m
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Elapsed</div>
                                </div>
                                <div className="surface-card" style={{ textAlign: 'center', padding: 16 }}>
                                    <Pause size={16} color="#EF4444" style={{ margin: '0 auto 6px' }} />
                                    <div style={{ fontSize: 20, fontWeight: 700 }}>{pomodoro.pauseCount}</div>
                                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Pauses</div>
                                </div>
                                <div className="surface-card" style={{ textAlign: 'center', padding: 16 }}>
                                    <Flame size={16} color="#F97316" style={{ margin: '0 auto 6px' }} />
                                    <div style={{ fontSize: 20, fontWeight: 700 }}>{streak.current}</div>
                                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Streak</div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ─── Right: Goals & Streak ─── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <SessionGoals
                        todos={todos}
                        setTodos={setTodos}
                        disabled={pomodoro.state === 'idle'}
                    />

                    {/* Streak card */}
                    <div className="surface-card">
                        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Flame size={16} color="#F97316" /> Streak
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                            <div style={{ textAlign: 'center' }}>
                                <motion.div
                                    key={streak.current}
                                    initial={{ scale: 1.3 }}
                                    animate={{ scale: 1 }}
                                    style={{ fontSize: 24, fontWeight: 800, color: '#F97316' }}
                                >
                                    {streak.current}
                                </motion.div>
                                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Current</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 800 }}>{streak.longest}</div>
                                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Longest</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 800 }}>
                                    {Object.keys(streak.heatmap).length}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Total Days</div>
                            </div>
                        </div>

                        {/* Streak freeze */}
                        <div style={{
                            marginTop: 16, paddingTop: 16,
                            borderTop: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 600 }}>🧊 Streak Freeze</div>
                                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                                    {streak.freezesRemaining} remaining this week
                                </div>
                            </div>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%',
                                background: streak.freezesRemaining > 0 ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 14,
                            }}>
                                {streak.freezesRemaining > 0 ? '🧊' : '❌'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Session History ─── */}
            <div style={{ marginTop: 32 }}>
                <SessionHistory sessions={sessions} subjects={subjects} />
            </div>
        </div>
    )
}
