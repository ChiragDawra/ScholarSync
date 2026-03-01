// Pomodoro durations in minutes
export const POMODORO_PRESETS = {
    short: { work: 25, break: 5 },
    long: { work: 50, break: 10 },
} as const

// Exam urgency thresholds (in days)
export const EXAM_URGENCY = {
    safe: 7,     // green — more than 7 days
    warning: 3,  // yellow — 3-7 days
    // red — fewer than 3 days
} as const

// Focus score weights
export const FOCUS_SCORE_WEIGHTS = {
    completion: 0.4,
    tasksCompleted: 0.4,
    pausePenalty: 0.2,
} as const

// AI rate limits
export const AI_RATE_LIMITS = {
    free: 10,
    premium: Infinity,
} as const

// Streak defaults
export const STREAK_DEFAULTS = {
    freezesPerWeek: 1,
    defaultCutoffTime: '23:00',
    warningWindowMinutes: 120,
} as const

// Heatmap levels (hours)
export const HEATMAP_LEVELS = {
    empty: 0,
    level1: 1,
    level2: 2,
    level3: 3,
} as const

// GPA slider
export const GPA_SLIDER = {
    min: 6.0,
    max: 10.0,
    step: 0.1,
} as const

// Default subject colors
export const DEFAULT_SUBJECT_COLORS = [
    '#6366F1', // indigo (CS)
    '#A855F7', // purple (Physics)
    '#EC4899', // pink (Chemistry)
    '#3B82F6', // blue (Math)
    '#10B981', // emerald (History)
    '#F59E0B', // amber (Literature)
    '#64748B', // slate (General)
    '#F97316', // orange
    '#06B6D4', // cyan
    '#8B5CF6', // violet
] as const

// Navigation items
export const NAV_ITEMS = [
    { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/exams', label: 'Exams', icon: 'BookOpen' },
    { path: '/assignments', label: 'Assignments', icon: 'ClipboardList' },
    { path: '/pomodoro', label: 'Pomodoro', icon: 'Timer' },
    { path: '/goals', label: 'Goals', icon: 'Target' },
    { path: '/analytics', label: 'Analytics', icon: 'BarChart3' },
    { path: '/gpa', label: 'GPA Predictor', icon: 'Calculator' },
    { path: '/ai-coach', label: 'AI Coach', icon: 'Sparkles' },
] as const
