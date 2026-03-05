import { Timestamp } from 'firebase/firestore'

export interface User {
    uid: string
    name: string
    college: string
    gradingSystem: 'cgpa' | 'percentage'
    streakCutoffTime: string
    subjects: Subject[]
    fcmTokens: string[]
    onboardingComplete: boolean
    notificationPreferences?: NotificationPreferences
}

export interface Subject {
    id: string
    name: string
    color: string
    courseCode?: string
}

export interface Exam {
    id: string
    subjectId: string
    date: Timestamp
    difficulty: 1 | 2 | 3 | 4 | 5
    notificationsSent: string[]
}

export interface Assignment {
    id: string
    title: string
    description?: string
    subjectId: string
    dueDate: Timestamp
    complexity: 'easy' | 'medium' | 'high'
    status: 'todo' | 'in_progress' | 'done'
    priority: number
    teamMode: boolean
    assignees: string[]
    headerImageUrl?: string
}

export interface Session {
    id: string
    subjectId: string
    durationMinutes: number
    date: Timestamp
    todosTotal: number
    todosCompleted: number
    pauseCount: number
    focusScore: number
}

export interface Streak {
    current: number
    longest: number
    lastLoggedDate: string
    freezesRemaining: number
    heatmap: Record<string, number>
}

export interface Goal {
    id: string
    title: string
    type: 'weekly' | 'monthly'
    targetDate: Timestamp
    progress: number
    done: boolean
    aiSuggested: boolean
}

export interface Course {
    id: string
    subjectId: string
    courseCode: string
    currentScore: number
    maxScore: number
    creditHours: number
    semester: string
}

export interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Timestamp
    schedulingCard?: SchedulingCard
}

export interface SchedulingCard {
    subject: string
    date: string
    startTime: string
    endTime: string
    confirmed: boolean
}

export interface StudyBlock {
    id: string
    subjectId: string
    subjectName: string
    date: string
    startTime: string
    endTime: string
    type: string
    completed: boolean
}

export interface RequiredScoreResult {
    courseId: string
    subjectName: string
    courseCode: string
    currentScore: number
    maxScore: number
    creditHours: number
    requiredFinalScore: number
    difficulty: 'easy' | 'challenging' | 'hard'
    predictedGrade: string
}

export interface NotificationPreferences {
    streakWarning: boolean
    examAlerts: boolean
    assignmentAlerts: boolean
    weeklySummary: boolean
    streakWarningMinutes: number
}

export interface UserSettings {
    theme: 'dark' | 'light'
    notificationPreferences: NotificationPreferences
    aiRequestsToday: number
    aiRequestsResetDate: string
}
