// Barrel export for the shared package
export * from './types'
export * from './constants'
export { calculateFocusScore, getFocusScoreLabel } from './utils/focusScore'
export { checkRateLimit, rateLimitedAction } from './utils/rateLimit'
export { sanitizeString, sanitizeNumber, sanitizeEmail } from './utils/sanitize'
export { updateStreak, isStreakAtRisk, getDefaultStreak } from './utils/streakUtils'
export {
  generateWeeklyPlan, analyzeFocusAreas, generateExamStrategy,
  analyzeAssignmentPriorities, generateMotivation,
  type StudyBlock as EngineStudyBlock, type Insight, type CoachResponse, type EngineContext,
} from './utils/studyEngine'
export { askClaude, isClaudeAvailable } from './utils/claudeChat'
export { auth, db, googleProvider } from './api/firebase'
