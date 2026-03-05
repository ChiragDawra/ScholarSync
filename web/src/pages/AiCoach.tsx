import { useState, useEffect, useRef, useMemo } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Send, Sparkles, Calendar, Target, BookOpen, Trophy,
    Clock, ChevronRight, Check, X,
} from 'lucide-react'
import { collection, getDocs, query, orderBy, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@shared/api/firebase'
import type { Exam, Assignment, Session, Goal, Streak, Subject } from '@shared/types'
import {
    generateWeeklyPlan, analyzeFocusAreas, generateExamStrategy,
    analyzeAssignmentPriorities, generateMotivation,
    type EngineContext, type CoachResponse, type StudyBlock, type Insight,
} from '@shared/utils/studyEngine'
import { askClaude } from '@shared/utils/claudeChat'
import toast from 'react-hot-toast'

interface ChatMsg {
    id: string
    role: 'user' | 'assistant'
    content: string
    blocks?: StudyBlock[]
    insights?: Insight[]
    timestamp: number
}

const PRESETS = [
    { icon: <Calendar size={15} />, label: 'Weekly Study Plan', key: 'weekly' },
    { icon: <Target size={15} />, label: 'Focus Areas', key: 'focus' },
    { icon: <BookOpen size={15} />, label: 'Exam Prep Strategy', key: 'exam' },
    { icon: <ChevronRight size={15} />, label: 'Assignment Priorities', key: 'assignments' },
    { icon: <Trophy size={15} />, label: 'Motivate Me', key: 'motivate' },
]

const TYPE_COLORS: Record<string, string> = {
    'exam-prep': '#EF4444',
    assignment: '#F59E0B',
    review: '#6366F1',
    practice: '#10B981',
}

export default function AiCoach() {
    const { user, profile } = useAuth()
    const [messages, setMessages] = useState<ChatMsg[]>([])
    const [inputValue, setInputValue] = useState('')
    const [typing, setTyping] = useState(false)
    const [dataLoaded, setDataLoaded] = useState(false)
    const chatEndRef = useRef<HTMLDivElement>(null)

    // Engine data
    const [exams, setExams] = useState<Exam[]>([])
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [sessions, setSessions] = useState<Session[]>([])
    const [goals, setGoals] = useState<Goal[]>([])
    const [streak, setStreak] = useState<Streak | null>(null)

    const subjects: Subject[] = useMemo(() => profile?.subjects || [], [profile])
    const userName = profile?.name?.split(' ')[0] || 'there'

    // Load all data on mount
    useEffect(() => {
        if (!user) return
        const loadAll = async () => {
            try {
                const uid = user.uid
                const [examSnap, assignSnap, sessionSnap, goalSnap, streakSnap] = await Promise.all([
                    getDocs(query(collection(db, 'users', uid, 'exams'), orderBy('date', 'asc'))),
                    getDocs(query(collection(db, 'users', uid, 'assignments'), orderBy('priority', 'desc'))),
                    getDocs(collection(db, 'users', uid, 'sessions')),
                    getDocs(collection(db, 'users', uid, 'goals')),
                    getDocs(collection(db, 'users', uid, 'streak')),
                ])
                setExams(examSnap.docs.map(d => ({ id: d.id, ...d.data() } as Exam)))
                setAssignments(assignSnap.docs.map(d => ({ id: d.id, ...d.data() } as Assignment)))
                setSessions(sessionSnap.docs.map(d => ({ id: d.id, ...d.data() } as Session)))
                setGoals(goalSnap.docs.map(d => ({ id: d.id, ...d.data() } as Goal)))
                if (streakSnap.docs.length > 0) {
                    setStreak(streakSnap.docs[0].data() as Streak)
                }
            } catch (err) {
                console.warn('Could not load data for AI Coach:', err)
            }
            setDataLoaded(true)
        }
        loadAll()
    }, [user])

    // Auto-scroll
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, typing])

    // Welcome message
    useEffect(() => {
        if (dataLoaded && messages.length === 0) {
            setMessages([{
                id: 'welcome',
                role: 'assistant',
                content: `Hey ${userName}! 👋 I'm your AI Study Coach. I've analyzed your academic data and I'm ready to help. Choose a prompt below or type your own question!`,
                timestamp: Date.now(),
            }])
        }
    }, [dataLoaded])

    const getContext = (): EngineContext => ({
        subjects, exams, assignments, sessions, goals, streak, userName,
    })

    const processQuery = (key: string): CoachResponse => {
        const ctx = getContext()
        switch (key) {
            case 'weekly': return generateWeeklyPlan(ctx)
            case 'focus': return analyzeFocusAreas(ctx)
            case 'exam': return generateExamStrategy(ctx)
            case 'assignments': return analyzeAssignmentPriorities(ctx)
            case 'motivate': return generateMotivation(ctx)
            default: {
                // Free text — try to match intent
                const lower = key.toLowerCase()
                if (lower.includes('plan') || lower.includes('schedule') || lower.includes('week'))
                    return generateWeeklyPlan(ctx)
                if (lower.includes('focus') || lower.includes('weak') || lower.includes('improve'))
                    return analyzeFocusAreas(ctx)
                if (lower.includes('exam') || lower.includes('test') || lower.includes('prep'))
                    return generateExamStrategy(ctx)
                if (lower.includes('assignment') || lower.includes('homework') || lower.includes('task'))
                    return analyzeAssignmentPriorities(ctx)
                if (lower.includes('motivat') || lower.includes('streak') || lower.includes('progress'))
                    return generateMotivation(ctx)
                // Default: weekly plan
                return generateWeeklyPlan(ctx)
            }
        }
    }

    const PRESET_KEYS = new Set(['weekly', 'focus', 'exam', 'assignments', 'motivate'])

    const handleSend = async (queryKey: string, displayText?: string) => {
        const userText = displayText || queryKey
        const userMsg: ChatMsg = {
            id: `u-${Date.now()}`,
            role: 'user',
            content: userText,
            timestamp: Date.now(),
        }
        setMessages(prev => [...prev, userMsg])
        setInputValue('')
        setTyping(true)

        let assistantContent = ''
        let blocks: StudyBlock[] | undefined
        let insights: Insight[] | undefined

        if (PRESET_KEYS.has(queryKey)) {
            // Preset prompts — use fast local engine
            await new Promise(r => setTimeout(r, 400 + Math.random() * 400))
            const response = processQuery(queryKey)
            assistantContent = response.text
            blocks = response.blocks
            insights = response.insights
        } else {
            // Free text — try Claude API first
            try {
                const claudeReply = await askClaude({
                    userMessage: queryKey,
                    subjects, exams, assignments, sessions, goals, streak, userName,
                })
                if (claudeReply) {
                    assistantContent = claudeReply
                } else {
                    // API returned empty — fall back to local engine
                    const response = processQuery(queryKey)
                    assistantContent = response.text
                    blocks = response.blocks
                    insights = response.insights
                }
            } catch {
                // API failed — fall back to local engine
                const response = processQuery(queryKey)
                assistantContent = response.text
                blocks = response.blocks
                insights = response.insights
            }
        }

        const assistantMsg: ChatMsg = {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: assistantContent,
            blocks,
            insights,
            timestamp: Date.now(),
        }

        setTyping(false)
        setMessages(prev => [...prev, assistantMsg])

        // Persist to Firestore
        if (user) {
            try {
                const ref = collection(db, 'users', user.uid, 'chat')
                await addDoc(ref, { role: 'user', content: userText, timestamp: Timestamp.now() })
                await addDoc(ref, { role: 'assistant', content: assistantContent, timestamp: Timestamp.now() })
            } catch { /* silent */ }
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputValue.trim() || typing) return
        handleSend(inputValue.trim(), inputValue.trim())
    }

    const renderMarkdown = (text: string) => {
        // Simple markdown: **bold**, *italic*, newlines
        return text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .split('\n')
            .join('<br/>')
    }

    return (
        <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
            {/* Header */}
            <div style={{ marginBottom: 16, flexShrink: 0 }}>
                <h1 className="text-display" style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                    AI Study Coach
                    <span className="badge-muted" style={{ fontSize: 11, padding: '2px 8px', verticalAlign: 'middle' }}>Beta</span>
                </h1>
                <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)' }}>
                    Personalized study advice powered by your academic data
                </p>
            </div>

            {/* Preset Buttons */}
            <div style={{
                display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, flexShrink: 0,
            }}>
                {PRESETS.map(p => (
                    <button
                        key={p.key}
                        className="btn btn-sm"
                        onClick={() => handleSend(p.key, p.label)}
                        disabled={typing || !dataLoaded}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'rgba(99, 102, 241, 0.08)',
                            border: '1px solid rgba(99, 102, 241, 0.15)',
                            color: '#A5B4FC',
                            borderRadius: 'var(--radius-full)',
                            padding: '6px 14px',
                            fontSize: 13,
                            cursor: typing ? 'wait' : 'pointer',
                        }}
                    >
                        {p.icon} {p.label}
                    </button>
                ))}
            </div>

            {/* Chat Messages */}
            <div style={{
                flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16,
                paddingRight: 8, paddingBottom: 16,
            }}>
                <AnimatePresence>
                    {messages.map(msg => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                display: 'flex',
                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            }}
                        >
                            {msg.role === 'assistant' && (
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                    background: 'linear-gradient(135deg, #6366F1, #A855F7)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginRight: 10, marginTop: 4,
                                }}>
                                    <Sparkles size={16} color="white" />
                                </div>
                            )}
                            <div style={{
                                maxWidth: '75%',
                                padding: '14px 18px',
                                borderRadius: msg.role === 'user'
                                    ? '18px 18px 4px 18px'
                                    : '18px 18px 18px 4px',
                                background: msg.role === 'user'
                                    ? 'linear-gradient(135deg, #6366F1, #4F46E5)'
                                    : 'var(--color-bg-raised)',
                                border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.06)' : 'none',
                                color: 'var(--color-text-primary)',
                            }}>
                                <div
                                    className="text-body-md"
                                    style={{ lineHeight: 1.6 }}
                                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                                />

                                {/* Insights */}
                                {msg.insights && msg.insights.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
                                        {msg.insights.map((ins, i) => (
                                            <div key={i} style={{
                                                padding: '10px 14px', borderRadius: 'var(--radius-md)',
                                                background: ins.type === 'warning' ? 'rgba(239,68,68,0.08)'
                                                    : ins.type === 'praise' ? 'rgba(16,185,129,0.08)'
                                                        : 'rgba(99,102,241,0.06)',
                                                border: `1px solid ${ins.type === 'warning' ? 'rgba(239,68,68,0.15)'
                                                    : ins.type === 'praise' ? 'rgba(16,185,129,0.15)'
                                                        : 'rgba(99,102,241,0.1)'}`,
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                    <span style={{ fontSize: 14 }}>{ins.icon}</span>
                                                    <span className="text-heading-sm" style={{ fontSize: 13 }}>{ins.title}</span>
                                                </div>
                                                <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                                                    {ins.body}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Study Blocks — Schedule Cards */}
                                {msg.blocks && msg.blocks.length > 0 && (
                                    <div style={{ marginTop: 14 }}>
                                        <p className="text-label" style={{
                                            color: 'var(--color-text-muted)', fontSize: 11,
                                            marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px',
                                        }}>
                                            Suggested Study Blocks
                                        </p>
                                        <div style={{
                                            display: 'grid', gap: 6,
                                            maxHeight: 280, overflowY: 'auto',
                                        }}>
                                            {msg.blocks.slice(0, 8).map((block, i) => (
                                                <div key={i} style={{
                                                    display: 'flex', alignItems: 'center', gap: 12,
                                                    padding: '10px 14px', borderRadius: 'var(--radius-md)',
                                                    background: 'rgba(255,255,255,0.02)',
                                                    border: '1px solid rgba(255,255,255,0.04)',
                                                    borderLeft: `3px solid ${block.subjectColor}`,
                                                }}>
                                                    <div style={{
                                                        width: 6, height: 6, borderRadius: '50%',
                                                        background: TYPE_COLORS[block.type] || '#6366F1',
                                                        flexShrink: 0,
                                                    }} />
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <span className="text-body-sm" style={{ fontWeight: 600 }}>
                                                                {block.subject}
                                                            </span>
                                                            <span style={{
                                                                fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                                                                padding: '1px 6px', borderRadius: 'var(--radius-full)',
                                                                background: `${TYPE_COLORS[block.type] || '#6366F1'}15`,
                                                                color: TYPE_COLORS[block.type] || '#6366F1',
                                                            }}>
                                                                {block.type.replace('-', ' ')}
                                                            </span>
                                                        </div>
                                                        <p className="text-body-sm" style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>
                                                            {block.reason}
                                                        </p>
                                                    </div>
                                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                        <p className="text-body-sm" style={{ fontWeight: 600, fontSize: 12 }}>
                                                            {block.startTime}–{block.endTime}
                                                        </p>
                                                        <p className="text-body-sm" style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>
                                                            {new Date(block.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                            {msg.blocks.length > 8 && (
                                                <p className="text-body-sm" style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 8 }}>
                                                    +{msg.blocks.length - 8} more blocks
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing indicator */}
                {typing && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                    >
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, #6366F1, #A855F7)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Sparkles size={16} color="white" />
                        </div>
                        <div style={{
                            padding: '12px 18px', borderRadius: '18px 18px 18px 4px',
                            background: 'var(--color-bg-raised)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex', gap: 4,
                        }}>
                            {[0, 1, 2].map(i => (
                                <motion.div
                                    key={i}
                                    animate={{ y: [0, -6, 0] }}
                                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                                    style={{
                                        width: 6, height: 6, borderRadius: '50%',
                                        background: 'var(--color-text-muted)',
                                    }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <form
                onSubmit={handleSubmit}
                style={{
                    display: 'flex', gap: 10, flexShrink: 0,
                    padding: '16px 0 4px',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                <input
                    className="input"
                    placeholder="Ask me anything about your studies..."
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    disabled={typing || !dataLoaded}
                    style={{ flex: 1 }}
                />
                <button
                    type="submit"
                    className="btn btn-gradient"
                    disabled={!inputValue.trim() || typing}
                    style={{
                        width: 44, height: 44, padding: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: 'var(--radius-full)',
                    }}
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    )
}
