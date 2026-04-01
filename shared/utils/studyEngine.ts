/**
 * Local AI Study Engine
 *
 * Analyses user data (exams, assignments, sessions, streak, goals)
 * and produces context-aware study plans, insights, and scheduling suggestions.
 * No external API — runs entirely on the client.
 */

import type { Exam, Assignment, Session, Goal, Streak, Subject } from '@shared/types'

// ── Output types ──

export interface StudyPlanBlock {
    subject: string
    subjectColor: string
    date: string          // YYYY-MM-DD
    startTime: string     // HH:MM
    endTime: string       // HH:MM
    type: 'exam-prep' | 'assignment' | 'review' | 'practice'
    reason: string
}

export interface Insight {
    title: string
    body: string
    type: 'tip' | 'warning' | 'praise' | 'suggestion'
    icon: string
}

export interface CoachResponse {
    text: string
    blocks?: StudyPlanBlock[]
    insights?: Insight[]
}

// ── Helpers ──

function toDate(ts: any): Date {
    if (ts == null) return new Date(0)
    if (ts?.toDate) return ts.toDate()
    if (ts?.seconds) return new Date(ts.seconds * 1000)
    const d = new Date(ts)
    return isNaN(d.getTime()) ? new Date(0) : d
}

function daysUntil(date: Date): number {
    return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function formatDate(d: Date): string {
    return d.toISOString().slice(0, 10)
}

function addDays(date: Date, n: number): Date {
    const d = new Date(date)
    d.setDate(d.getDate() + n)
    return d
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function urgencyScore(daysLeft: number, difficulty: number): number {
    if (daysLeft <= 0) return 0  // already passed
    const timeWeight = Math.max(0, 10 - daysLeft) / 10
    return (timeWeight * 0.6 + (difficulty / 5) * 0.4) * 100
}

// ── Engine Context ──

export interface EngineContext {
    subjects: Subject[]
    exams: Exam[]
    assignments: Assignment[]
    sessions: Session[]
    goals: Goal[]
    streak: Streak | null
    userName: string
}

// ── Generators ──

export function generateWeeklyPlan(ctx: EngineContext): CoachResponse {
    const { exams, assignments, subjects, sessions, userName } = ctx
    const today = new Date()
    const blocks: StudyPlanBlock[] = []

    // Score each subject by urgency
    const subjectScores: Record<string, { score: number; reason: string; name: string; color: string }> = {}

    // Exam urgency
    exams.forEach(e => {
        const d = toDate(e.date)
        const left = daysUntil(d)
        if (left <= 0 || left > 14) return
        const subj = subjects.find(s => s.id === e.subjectId)
        if (!subj) return
        const score = urgencyScore(left, e.difficulty)
        const existing = subjectScores[subj.id]?.score || 0
        subjectScores[subj.id] = {
            score: Math.max(existing, score),
            reason: `Exam in ${left}d (difficulty ${e.difficulty}/5)`,
            name: subj.name,
            color: subj.color,
        }
    })

    // Assignment urgency
    assignments
        .filter(a => a.status !== 'done')
        .forEach(a => {
            const d = toDate(a.dueDate)
            const left = daysUntil(d)
            if (left <= 0 || left > 14) return
            const subj = subjects.find(s => s.id === a.subjectId)
            const name = subj?.name || 'General'
            const color = subj?.color || '#64748B'
            const diffNum = ({ easy: 1, medium: 3, high: 5 } as const)[a.complexity as 'easy' | 'medium' | 'high'] ?? 3
            const score = urgencyScore(left, diffNum)
            const id = subj?.id || 'general'
            const existing = subjectScores[id]?.score || 0
            if (score > existing) {
                subjectScores[id] = { score, reason: `"${a.title}" due in ${left}d`, name, color }
            }
        })

    // Sort by urgency
    const ranked = Object.entries(subjectScores)
        .sort(([, a], [, b]) => b.score - a.score)

    if (ranked.length === 0) {
        return {
            text: `Hey ${userName}! 🎉 You're all clear — no upcoming exams or assignments in the next 2 weeks. Great time to review past topics or set new goals!`,
            insights: [{
                title: 'All Caught Up',
                body: 'No urgent deadlines. Consider doing light review or exploring new study topics.',
                type: 'praise',
                icon: '🌟',
            }],
        }
    }

    // Allocate study blocks for the next 7 days
    const startHour = 9
    const slotsPerDay = 4 // 4 × 1.5hr slots
    const slotDuration = 90 // minutes

    for (let day = 0; day < 7; day++) {
        const date = addDays(today, day + 1)
        const dateStr = formatDate(date)
        const dayName = DAY_NAMES[date.getDay()]
        const daySlots = day < 2 ? slotsPerDay : Math.min(slotsPerDay, 3) // More slots early in week

        for (let slot = 0; slot < daySlots; slot++) {
            const subjectIdx = (day * daySlots + slot) % ranked.length
            const [, info] = ranked[subjectIdx]

            const slotStart = startHour + slot * 2
            const startTime = `${String(slotStart).padStart(2, '0')}:00`
            const endHour = slotStart + 1
            const endTime = `${String(endHour).padStart(2, '0')}:30`

            const isExamRelated = info.reason.includes('Exam')
            blocks.push({
                subject: info.name,
                subjectColor: info.color,
                date: dateStr,
                startTime,
                endTime,
                type: isExamRelated ? 'exam-prep' : 'assignment',
                reason: `${dayName}: ${info.reason}`,
            })
        }
    }

    // Build insights
    const insights: Insight[] = []
    const topSubjects = ranked.slice(0, 3)
    topSubjects.forEach(([, info]) => {
        insights.push({
            title: info.name,
            body: info.reason,
            type: info.score > 70 ? 'warning' : 'tip',
            icon: info.score > 70 ? '🔴' : '🟡',
        })
    })

    // Session-based insight
    const totalSessions = sessions.length
    const avgFocus = totalSessions > 0
        ? Math.round(sessions.reduce((s, x) => s + x.focusScore, 0) / totalSessions)
        : 0

    if (avgFocus > 0) {
        insights.push({
            title: 'Focus Trend',
            body: `Your average focus score is ${avgFocus}%. ${avgFocus >= 75 ? 'Excellent! Keep it up.' : avgFocus >= 50 ? 'Good, but there\'s room for improvement.' : 'Try shorter sessions with fewer distractions.'}`,
            type: avgFocus >= 75 ? 'praise' : 'suggestion',
            icon: avgFocus >= 75 ? '🔥' : '💡',
        })
    }

    return {
        text: `Here's your personalized study plan for the next 7 days, ${userName}! I've allocated ${blocks.length} study blocks based on your upcoming exams and assignments, prioritized by urgency.`,
        blocks,
        insights,
    }
}

export function analyzeFocusAreas(ctx: EngineContext): CoachResponse {
    const { sessions, subjects, userName, exams } = ctx
    const insights: Insight[] = []

    // Calculate study time per subject
    const subjectTime: Record<string, { minutes: number; sessions: number; avgFocus: number; name: string }> = {}
    sessions.forEach(s => {
        const subj = subjects.find(x => x.id === s.subjectId)
        const name = subj?.name || 'General'
        if (!subjectTime[name]) subjectTime[name] = { minutes: 0, sessions: 0, avgFocus: 0, name }
        subjectTime[name].minutes += s.durationMinutes
        subjectTime[name].sessions += 1
        subjectTime[name].avgFocus += s.focusScore
    })

    // Average focus
    Object.values(subjectTime).forEach(v => {
        v.avgFocus = v.sessions > 0 ? Math.round(v.avgFocus / v.sessions) : 0
    })

    const ranked = Object.values(subjectTime).sort((a, b) => a.minutes - b.minutes)

    if (ranked.length === 0) {
        return {
            text: `Hey ${userName}, I don't have enough session data yet to analyze your focus areas. Start a few Pomodoro sessions and I'll have insights for you!`,
            insights: [{
                title: 'No Data Yet',
                body: 'Complete a few study sessions in the Pomodoro Studio to unlock focus analysis.',
                type: 'suggestion',
                icon: '📊',
            }],
        }
    }

    // Find underloved subjects (have exams but low study time)
    const examSubjects = new Set(exams.map(e => {
        const subj = subjects.find(s => s.id === e.subjectId)
        return subj?.name || ''
    }).filter(Boolean))

    const neglected = [...examSubjects].filter(name => {
        const time = subjectTime[name]
        return !time || time.minutes < 60
    })

    if (neglected.length > 0) {
        insights.push({
            title: 'Neglected Exam Subjects',
            body: `You have exams in ${neglected.join(', ')} but haven't studied them much. Consider allocating more time.`,
            type: 'warning',
            icon: '⚠️',
        })
    }

    // Top performer
    const bestFocus = [...ranked].sort((a, b) => b.avgFocus - a.avgFocus)[0]
    if (bestFocus && bestFocus.avgFocus > 0) {
        insights.push({
            title: `Best Focus: ${bestFocus.name}`,
            body: `${bestFocus.avgFocus}% average focus across ${bestFocus.sessions} sessions. Whatever you're doing here, replicate it!`,
            type: 'praise',
            icon: '🏆',
        })
    }

    // Weakest focus
    const worstFocus = ranked.filter(r => r.avgFocus > 0).sort((a, b) => a.avgFocus - b.avgFocus)[0]
    if (worstFocus && worstFocus !== bestFocus && worstFocus.avgFocus < 70) {
        insights.push({
            title: `Needs Attention: ${worstFocus.name}`,
            body: `Only ${worstFocus.avgFocus}% average focus. Try shorter sessions, a quieter environment, or the Pomodoro technique.`,
            type: 'suggestion',
            icon: '💡',
        })
    }

    // Study distribution
    const totalMinutes = ranked.reduce((s, r) => s + r.minutes, 0)
    const distribution = ranked
        .map(r => `${r.name}: ${Math.round(r.minutes / 60 * 10) / 10}h (${Math.round(r.minutes / totalMinutes * 100)}%)`)
        .join('\n• ')

    return {
        text: `Here's your focus area analysis, ${userName}:\n\n• ${distribution}\n\nTotal study time: ${Math.round(totalMinutes / 60 * 10) / 10} hours across ${sessions.length} sessions.`,
        insights,
    }
}

export function generateExamStrategy(ctx: EngineContext): CoachResponse {
    const { exams, subjects, sessions, userName } = ctx
    const insights: Insight[] = []
    const blocks: StudyPlanBlock[] = []

    const upcoming = exams
        .filter(e => daysUntil(toDate(e.date)) > 0 && daysUntil(toDate(e.date)) <= 14)
        .sort((a, b) => toDate(a.date).getTime() - toDate(b.date).getTime())

    if (upcoming.length === 0) {
        return {
            text: `No exams in the next 2 weeks, ${userName}! Use this time for deep review or getting ahead on assignments.`,
            insights: [{
                title: 'Exam-Free Zone',
                body: 'Great time to consolidate knowledge or work on weaker subjects.',
                type: 'praise',
                icon: '✅',
            }],
        }
    }

    upcoming.forEach(exam => {
        const subj = subjects.find(s => s.id === exam.subjectId)
        const name = subj?.name || 'Unknown'
        const color = subj?.color || '#64748B'
        const dLeft = daysUntil(toDate(exam.date))

        // Check how much they've studied this subject
        const subjectSessions = sessions.filter(s => s.subjectId === exam.subjectId)
        const totalHours = Math.round(subjectSessions.reduce((s, x) => s + x.durationMinutes, 0) / 60 * 10) / 10

        let strategy: string
        let insightType: Insight['type']

        if (dLeft <= 2) {
            strategy = `URGENT — ${name} exam in ${dLeft}d! Focus on past papers and key concepts. No new topics.`
            insightType = 'warning'
        } else if (dLeft <= 5) {
            strategy = `${name} exam in ${dLeft}d. Mix active recall with practice problems. You've logged ${totalHours}h so far.`
            insightType = totalHours < 3 ? 'warning' : 'tip'
        } else {
            strategy = `${name} exam in ${dLeft}d. Start with weak areas, build up to full practice tests.`
            insightType = 'tip'
        }

        insights.push({
            title: `${name} — ${dLeft} days`,
            body: strategy,
            type: insightType,
            icon: dLeft <= 2 ? '🔴' : dLeft <= 5 ? '🟡' : '🟢',
        })

        // Generate 2 prep blocks per exam
        const today = new Date()
        for (let i = 0; i < Math.min(2, dLeft); i++) {
            const date = addDays(today, i + 1)
            blocks.push({
                subject: name,
                subjectColor: color,
                date: formatDate(date),
                startTime: '10:00',
                endTime: '11:30',
                type: 'exam-prep',
                reason: `${name} exam prep (${dLeft - i - 1}d before exam)`,
            })
        }
    })

    return {
        text: `Exam strategy ready, ${userName}! You have ${upcoming.length} exam${upcoming.length > 1 ? 's' : ''} in the next 2 weeks. Here's what I recommend:`,
        blocks,
        insights,
    }
}

export function analyzeAssignmentPriorities(ctx: EngineContext): CoachResponse {
    const { assignments, subjects, userName } = ctx
    const insights: Insight[] = []

    const pending = assignments
        .filter(a => a.status !== 'done')
        .map(a => {
            const subj = subjects.find(s => s.id === a.subjectId)
            const dLeft = daysUntil(toDate(a.dueDate))
            const diffNum = ({ easy: 1, medium: 2, high: 3 } as const)[a.complexity as 'easy' | 'medium' | 'high'] ?? 2
            return { ...a, subjectName: subj?.name || 'General', daysLeft: dLeft, diffNum }
        })
        .filter(a => a.daysLeft > 0)
        .sort((a, b) => {
            // Sort by urgency: combined score of days left and complexity
            const aScore = (1 / Math.max(1, a.daysLeft)) * a.diffNum
            const bScore = (1 / Math.max(1, b.daysLeft)) * b.diffNum
            return bScore - aScore
        })

    if (pending.length === 0) {
        return {
            text: `All assignments done, ${userName}! 🎉 You're ahead of the game.`,
            insights: [{
                title: 'All Clear',
                body: 'No pending assignments. Consider working on goals or reviewing for exams.',
                type: 'praise',
                icon: '🌟',
            }],
        }
    }

    const overdue = assignments.filter(a => a.status !== 'done' && daysUntil(toDate(a.dueDate)) <= 0)
    if (overdue.length > 0) {
        insights.push({
            title: `${overdue.length} Overdue`,
            body: `You have ${overdue.length} overdue assignment${overdue.length > 1 ? 's' : ''}. Tackle these first!`,
            type: 'warning',
            icon: '🚨',
        })
    }

    // Top 5 priority list
    const top5 = pending.slice(0, 5)
    const priorityList = top5
        .map((a, i) => `${i + 1}. **${a.title}** (${a.subjectName}) — ${a.daysLeft}d left, ${a.complexity} complexity`)
        .join('\n')

    const inProgress = assignments.filter(a => a.status === 'in_progress').length
    if (inProgress > 0) {
        insights.push({
            title: `${inProgress} In Progress`,
            body: 'Finish what you\'ve started before picking up new tasks.',
            type: 'tip',
            icon: '⚡',
        })
    }

    return {
        text: `Here are your assignment priorities, ${userName}:\n\n${priorityList}\n\n${pending.length > 5 ? `...and ${pending.length - 5} more.` : ''}`,
        insights,
    }
}

export function generateMotivation(ctx: EngineContext): CoachResponse {
    const { streak, sessions, goals, userName } = ctx
    const insights: Insight[] = []

    // Streak
    if (streak) {
        if (streak.current >= 7) {
            insights.push({
                title: `${streak.current}-Day Streak! 🔥`,
                body: `Incredible consistency! Your longest streak is ${streak.longest} days. Keep the momentum going.`,
                type: 'praise',
                icon: '🔥',
            })
        } else if (streak.current >= 3) {
            insights.push({
                title: `${streak.current}-Day Streak`,
                body: `Good momentum! Push for a full week. Your record is ${streak.longest} days.`,
                type: 'tip',
                icon: '📈',
            })
        } else if (streak.current === 0) {
            insights.push({
                title: 'Start a New Streak',
                body: 'Complete one study session today to begin a new streak!',
                type: 'suggestion',
                icon: '💪',
            })
        }
    }

    // Goals progress
    const activeGoals = goals.filter(g => !g.done)
    const doneGoals = goals.filter(g => g.done)
    if (doneGoals.length > 0) {
        insights.push({
            title: `${doneGoals.length} Goals Completed`,
            body: `You've crushed ${doneGoals.length} goal${doneGoals.length > 1 ? 's' : ''}! ${activeGoals.length > 0 ? `${activeGoals.length} more to go.` : 'Set some new ones!'}`,
            type: 'praise',
            icon: '🎯',
        })
    }

    // Total study time
    const totalHours = Math.round(sessions.reduce((s, x) => s + x.durationMinutes, 0) / 60 * 10) / 10
    if (totalHours > 0) {
        insights.push({
            title: `${totalHours}h Total Study Time`,
            body: `Across ${sessions.length} sessions. ${totalHours >= 20 ? 'Amazing dedication!' : totalHours >= 10 ? 'Solid progress!' : 'Keep building the habit!'}`,
            type: totalHours >= 10 ? 'praise' : 'suggestion',
            icon: '📚',
        })
    }

    const quotes = [
        'The secret of getting ahead is getting started. — Mark Twain',
        'It does not matter how slowly you go as long as you do not stop. — Confucius',
        'Education is the passport to the future. — Malcolm X',
        'The more that you read, the more things you will know. — Dr. Seuss',
        'Success is the sum of small efforts, repeated day in and day out. — Robert Collier',
    ]
    const quote = quotes[Math.floor(Math.random() * quotes.length)]

    return {
        text: `You're doing great, ${userName}! 💪\n\n*"${quote}"*\n\nHere's a snapshot of your journey so far:`,
        insights,
    }
}
