/**
 * Claude AI Chat Utility
 * Calls the Anthropic Messages API through the Vite dev proxy
 * to get intelligent responses for free-text study questions.
 */

import type { Exam, Assignment, Session, Goal, Streak, Subject } from '@shared/types'

interface ClaudeChatOptions {
    userMessage: string
    subjects: Subject[]
    exams: Exam[]
    assignments: Assignment[]
    sessions: Session[]
    goals: Goal[]
    streak: Streak | null
    userName: string
}

function toDate(ts: any): Date {
    if (ts?.toDate) return ts.toDate()
    if (ts?.seconds) return new Date(ts.seconds * 1000)
    return new Date(ts)
}

function buildSystemPrompt(opts: ClaudeChatOptions): string {
    const { subjects, exams, assignments, sessions, goals, streak, userName } = opts

    // Build context summary
    const subjectList = subjects.map(s => s.name).join(', ') || 'None added'

    const upcomingExams = exams
        .filter(e => toDate(e.date).getTime() > Date.now())
        .slice(0, 5)
        .map(e => {
            const subj = subjects.find(s => s.id === e.subjectId)
            const d = toDate(e.date)
            const daysLeft = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            return `${subj?.name || 'Unknown'}: ${daysLeft}d away (difficulty ${e.difficulty}/5)`
        })
        .join('\n  - ') || 'None upcoming'

    const pendingAssignments = assignments
        .filter(a => a.status !== 'done')
        .slice(0, 5)
        .map(a => {
            const subj = subjects.find(s => s.id === a.subjectId)
            const d = toDate(a.dueDate)
            const daysLeft = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            return `"${a.title}" (${subj?.name || 'General'}): ${daysLeft}d left, ${a.complexity}, status: ${a.status}`
        })
        .join('\n  - ') || 'All done!'

    const totalStudyHours = Math.round(sessions.reduce((s, x) => s + x.durationMinutes, 0) / 60 * 10) / 10
    const avgFocus = sessions.length > 0
        ? Math.round(sessions.reduce((s, x) => s + x.focusScore, 0) / sessions.length)
        : 0

    const activeGoals = goals.filter(g => !g.done).length
    const doneGoals = goals.filter(g => g.done).length

    return `You are an AI Study Coach inside ScholarSync, a student productivity app. You help ${userName} with study planning, exam preparation, time management, and academic motivation.

STUDENT CONTEXT:
- Subjects: ${subjectList}
- Upcoming Exams:
  - ${upcomingExams}
- Pending Assignments:
  - ${pendingAssignments}
- Study Stats: ${totalStudyHours}h total across ${sessions.length} sessions, ${avgFocus}% avg focus
- Streak: ${streak?.current ?? 0} days (longest: ${streak?.longest ?? 0})
- Goals: ${activeGoals} active, ${doneGoals} completed

RULES:
- Be concise and actionable — students are busy
- Use markdown formatting: **bold** for emphasis, bullet points for lists
- Reference their actual data when giving advice
- Be encouraging but honest
- If asked about something unrelated to academics, politely redirect
- Keep responses under 300 words
- Don't use emojis excessively, max 2-3 per response`
}

export async function askClaude(opts: ClaudeChatOptions): Promise<string> {
    const systemPrompt = buildSystemPrompt(opts)

    try {
        const response = await fetch('/api/claude', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1024,
                system: systemPrompt,
                messages: [{ role: 'user', content: opts.userMessage }],
            }),
        })

        if (!response.ok) {
            const err = await response.text()
            console.warn('Claude API error:', response.status, err)
            return ''
        }

        const data = await response.json()
        const text = data?.content?.[0]?.text
        return text || ''
    } catch (err) {
        console.warn('Claude request failed:', err)
        return ''
    }
}

export function isClaudeAvailable(): boolean {
    // The Vite dev proxy handles the API key — only works in dev mode.
    // In production, /api/claude has no proxy and will 404.
    try {
        return typeof window !== 'undefined' && (import.meta as any)?.env?.DEV === true
    } catch {
        return false
    }
}
