# ScholarSync — Tech Stack Documentation

**Version:** 1.0  
**Platforms:** Web (React) · iOS (Expo) · Android (Expo)  
**Architecture:** Monorepo — shared business logic across web and mobile  

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│                                                             │
│   ┌──────────────────┐        ┌──────────────────────────┐  │
│   │   Web App        │        │   Mobile App             │  │
│   │   React (Vite)   │        │   React Native (Expo)    │  │
│   │   Tailwind CSS   │        │   NativeWind             │  │
│   │   shadcn/ui      │        │   Expo Router            │  │
│   └────────┬─────────┘        └───────────┬──────────────┘  │
│            │                              │                  │
│            └──────────┬───────────────────┘                  │
│                       │                                      │
│              ┌────────▼────────┐                            │
│              │  /shared layer  │                            │
│              │  hooks · utils  │                            │
│              │  api · types    │                            │
│              └────────┬────────┘                            │
└───────────────────────┼─────────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────────────┐
│                 BACKEND LAYER                               │
│                       │                                     │
│         ┌─────────────▼──────────────────┐                 │
│         │         Firebase               │                 │
│         │  Auth · Firestore · FCM        │                 │
│         │  Cloud Functions · Hosting     │                 │
│         └─────────────┬──────────────────┘                 │
│                       │                                     │
│         ┌─────────────▼──────────────────┐                 │
│         │       Anthropic Claude API     │                 │
│         │   (proxied via Cloud Function) │                 │
│         └────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

**Monorepo structure** — Web and mobile share all business logic (hooks, utilities, API calls, TypeScript types) through a `/shared` directory. Only the UI layer differs between platforms. This means writing core logic once and having it work everywhere.

**Firebase as backend** — Firebase provides authentication, real-time database, push notifications, and serverless functions in a single platform. This eliminates the need to build and host a custom API server, which significantly reduces complexity for a project of this scope.

**Claude API via proxy** — The Anthropic API key is never exposed to the client. All AI requests are routed through a Firebase Cloud Function that holds the key server-side, validates the user's session, enforces rate limits, and then calls the Claude API.

**Expo managed workflow** — Using Expo's managed workflow means no Xcode or Android Studio configuration is needed for the core app. The Expo EAS cloud build service handles generating the iOS and Android binaries.

---

## 2. Monorepo Structure

```
scholarsync/
│
├── web/                            # React web application
│   ├── src/
│   │   ├── pages/                  # Route-level page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Exams.tsx
│   │   │   ├── Assignments.tsx
│   │   │   ├── Pomodoro.tsx
│   │   │   ├── Goals.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── GpaPredictor.tsx
│   │   │   ├── AiCoach.tsx
│   │   │   └── Settings.tsx
│   │   ├── components/             # Web-specific UI components
│   │   │   ├── layout/             # Sidebar, AppLayout, Topbar
│   │   │   ├── dashboard/          # StatCard, Heatmap, Schedule
│   │   │   ├── pomodoro/           # TimerRing, SessionGoals
│   │   │   ├── assignments/        # KanbanBoard, AssignmentCard
│   │   │   ├── analytics/          # BarChart, LineChart, DonutChart
│   │   │   ├── gpa/                # CourseTable, GpaSlider
│   │   │   ├── ai-coach/           # ChatBubble, WeeklyPlanPanel
│   │   │   └── ui/                 # Shared primitives (Button, Badge, Modal)
│   │   ├── hooks/                  # Re-exports from /shared/hooks
│   │   ├── store/                  # Zustand global state slices
│   │   ├── lib/                    # Web-specific utilities
│   │   │   └── notifications.ts    # FCM web push setup
│   │   ├── App.tsx                 # Root component + router
│   │   └── main.tsx                # Entry point
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── mobile/                         # Expo React Native application
│   ├── app/                        # expo-router file-based routes
│   │   ├── (tabs)/                 # Tab navigation screens
│   │   │   ├── index.tsx           # Dashboard tab
│   │   │   ├── assignments.tsx
│   │   │   ├── pomodoro.tsx
│   │   │   ├── analytics.tsx
│   │   │   └── more.tsx
│   │   ├── exams.tsx
│   │   ├── goals.tsx
│   │   ├── gpa.tsx
│   │   ├── ai-coach.tsx
│   │   ├── settings.tsx
│   │   └── _layout.tsx             # Root layout + auth guard
│   ├── components/                 # Mobile-specific UI components
│   ├── lib/                        # Mobile-specific utilities
│   │   └── notifications.ts        # Expo Notifications setup
│   ├── app.json                    # Expo config
│   ├── eas.json                    # EAS build profiles
│   └── tsconfig.json
│
├── shared/                         # Shared across web and mobile
│   ├── hooks/
│   │   ├── useAuth.ts              # Authentication state
│   │   ├── useExams.ts             # Exam CRUD + countdowns
│   │   ├── useAssignments.ts       # Assignment CRUD + status
│   │   ├── usePomodoro.ts          # Timer state machine
│   │   ├── useSessions.ts          # Session history + aggregation
│   │   ├── useStreak.ts            # Streak logic + heatmap data
│   │   ├── useGoals.ts             # Goals CRUD + progress
│   │   ├── useAnalytics.ts         # Data aggregation for charts
│   │   └── useAiCoach.ts           # Claude API chat state
│   ├── utils/
│   │   ├── gpaCalculator.ts        # Required score calculation logic
│   │   ├── studyScheduler.ts       # Auto-schedule study blocks
│   │   ├── streakUtils.ts          # Streak increment / reset logic
│   │   ├── focusScore.ts           # Focus score calculation
│   │   └── dateUtils.ts            # Timezone-aware date helpers
│   ├── api/
│   │   ├── firebase.ts             # Firebase app initialization
│   │   ├── firestore.ts            # All Firestore read/write functions
│   │   ├── claudeApi.ts            # Claude API call wrapper
│   │   └── fcm.ts                  # FCM token registration
│   ├── types/
│   │   └── index.ts                # All TypeScript interfaces and types
│   └── constants/
│       └── index.ts                # App-wide constants (durations, limits)
│
└── functions/                      # Firebase Cloud Functions
    ├── src/
    │   ├── aiProxy.ts              # Claude API proxy + rate limiting
    │   ├── streakReminder.ts       # Scheduled streak warning notifications
    │   ├── examAlerts.ts           # Scheduled exam countdown notifications
    │   ├── assignmentAlerts.ts     # Assignment due notifications
    │   └── weeklySummary.ts        # Sunday weekly recap notification
    ├── package.json
    └── tsconfig.json
```

---

## 3. Web Application

### 3.1 Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18 | UI framework |
| `react-dom` | ^18 | DOM rendering |
| `vite` | ^5 | Build tool and dev server |
| `typescript` | ^5 | Type safety throughout |

**Why Vite over Create React App:** Vite has significantly faster hot module replacement during development and produces smaller production bundles. CRA is deprecated and no longer maintained.

### 3.2 Routing

| Package | Version | Purpose |
|---------|---------|---------|
| `react-router-dom` | ^6 | Client-side routing |

Route structure:
```
/                   → Dashboard
/exams              → Exam Hub
/assignments        → Assignment Board
/pomodoro           → Pomodoro Studio
/goals              → Goals Board
/analytics          → Analytics Dashboard
/gpa                → GPA Predictor
/ai-coach           → AI Study Coach
/settings           → Settings
/onboarding         → Onboarding flow (new users only)
```

### 3.3 Styling

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | ^3 | Utility-first CSS |
| `@shadcn/ui` | latest | Accessible component primitives |
| `framer-motion` | ^11 | Animations and transitions |
| `class-variance-authority` | ^0.7 | Component variant management |
| `clsx` | ^2 | Conditional class merging |

**Why shadcn/ui:** Unlike traditional component libraries, shadcn/ui components are copied directly into the codebase, giving full control over styling and behavior. Components are built on Radix UI primitives which are fully accessible out of the box.

### 3.4 State Management

| Package | Version | Purpose |
|---------|---------|---------|
| `zustand` | ^4 | Global client state |
| `@tanstack/react-query` | ^5 | Server state, caching, and synchronization |

**State split:**
- **Zustand** manages: authenticated user object, active Pomodoro timer state, UI preferences (sidebar open/closed, active theme)
- **React Query** manages: all Firestore data fetching, caching, background refetch, and optimistic updates

### 3.5 Data Visualization

| Package | Version | Purpose |
|---------|---------|---------|
| `recharts` | ^2 | Bar, line, and donut charts |
| `react-calendar-heatmap` | ^1 | GitHub-style annual heatmap |

### 3.6 Drag and Drop

| Package | Version | Purpose |
|---------|---------|---------|
| `@dnd-kit/core` | ^6 | Drag and drop primitives |
| `@dnd-kit/sortable` | ^8 | Sortable list utilities (Kanban columns) |

**Why @dnd-kit over react-beautiful-dnd:** react-beautiful-dnd is unmaintained. @dnd-kit is actively maintained, has better accessibility support, and works with React 18's concurrent features.

### 3.7 Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| `date-fns` | ^3 | Date formatting, calculations, timezone handling |
| `lucide-react` | ^0.400 | Icon set (consistent with design) |
| `react-hot-toast` | ^2 | In-app toast notifications |
| `zod` | ^3 | Schema validation for form inputs and API responses |
| `react-hook-form` | ^7 | Form state management and validation |

---

## 4. Mobile Application

### 4.1 Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| `expo` | ~51 | Managed workflow + native APIs |
| `react-native` | 0.74 | Cross-platform mobile UI |
| `typescript` | ^5 | Type safety |

**Why Expo managed workflow:** Eliminates the need to configure Xcode or Android Studio for the core application. The Expo SDK handles native API access (notifications, haptics, secure storage) through a stable, cross-platform JavaScript interface. EAS Build handles the actual compilation in the cloud.

### 4.2 Navigation

| Package | Version | Purpose |
|---------|---------|---------|
| `expo-router` | ~3 | File-based routing (like Next.js for mobile) |
| `react-native-screens` | ~3 | Native screen containers for performance |
| `react-native-safe-area-context` | 4.x | Safe area inset handling on all devices |

**Tab navigation structure:**
```
Bottom Tabs:
  Tab 1 → Dashboard (Home icon)
  Tab 2 → Assignments (Clipboard icon)
  Tab 3 → Pomodoro (Timer icon)
  Tab 4 → Analytics (Chart icon)
  Tab 5 → More (Grid icon) → links to Exams, GPA, Goals, AI Coach, Settings
```

### 4.3 Styling

| Package | Version | Purpose |
|---------|---------|---------|
| `nativewind` | ^4 | Tailwind CSS utility classes in React Native |
| `react-native-reanimated` | ~3 | High-performance animations (runs on UI thread) |
| `react-native-gesture-handler` | ~2 | Native gesture recognition |

**Why NativeWind:** Allows using the same Tailwind class names on mobile as on web, making the design tokens consistent and reducing context switching between web and mobile styling.

### 4.4 Mobile-Specific Native APIs

| Package | Version | Purpose |
|---------|---------|---------|
| `expo-notifications` | ~0.28 | Local and push notification scheduling |
| `expo-background-fetch` | ~12 | Background task for pre-cutoff streak check |
| `expo-task-manager` | ~11 | Registers background tasks |
| `expo-secure-store` | ~13 | Encrypted local storage for auth tokens |
| `expo-haptics` | ~13 | Haptic feedback (streak update, timer complete) |
| `@react-native-async-storage/async-storage` | ^1 | Offline data caching |
| `@gorhom/bottom-sheet` | ^4 | Native bottom sheet for modals and forms |

### 4.5 State Management on Mobile

Mobile uses the exact same Zustand stores and React Query setup from the `/shared` layer. No separate state management is needed.

---

## 5. Shared Layer

The `/shared` directory contains all business logic that is imported by both the web and mobile apps. Nothing in this layer contains any web-specific or React Native-specific imports.

### 5.1 TypeScript Types (`shared/types/index.ts`)

```typescript
export interface User {
  uid: string
  name: string
  college: string
  gradingSystem: 'cgpa' | 'percentage'
  streakCutoffTime: string       // "23:00" in user's local timezone
  subjects: Subject[]
  fcmTokens: string[]
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
  priority: number               // AI-calculated 1–10
  teamMode: boolean
  assignees: string[]            // user UIDs
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
  focusScore: number             // 0–100
}

export interface Streak {
  current: number
  longest: number
  lastLoggedDate: string         // ISO date string "2025-03-01"
  freezesRemaining: number
  heatmap: Record<string, number> // { "2025-03-01": 2.5 }
}

export interface Goal {
  id: string
  title: string
  type: 'weekly' | 'monthly'
  targetDate: Timestamp
  progress: number               // 0–100
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
```

### 5.2 Key Utility Functions

#### `shared/utils/gpaCalculator.ts`
```typescript
// Given current scores, credit hours, and a target CGPA,
// returns the required final exam score for each course.
// Supports both 10-point CGPA and percentage grading systems.

calculateRequiredScores(
  courses: Course[],
  targetCgpa: number,
  gradingSystem: 'cgpa' | 'percentage'
): RequiredScoreResult[]
```

#### `shared/utils/studyScheduler.ts`
```typescript
// Given a list of upcoming exams, generates a day-by-day
// study block schedule distributed across available days.
// Weights each subject by difficulty and days remaining.

generateStudySchedule(
  exams: Exam[],
  subjects: Subject[],
  daysAhead: number
): StudyBlock[]
```

#### `shared/utils/streakUtils.ts`
```typescript
// Determines whether today's date (in user's local timezone)
// represents a streak continuation, same-day re-log, or a reset.

updateStreak(
  currentStreak: Streak,
  sessionDate: Date,
  userTimezone: string
): Streak

// Returns true if the user has not yet logged a session today
// and the current time is within the warning window before cutoff.
isStreakAtRisk(
  lastLoggedDate: string,
  cutoffTime: string,
  warningWindowMinutes: number,
  now: Date
): boolean
```

#### `shared/utils/focusScore.ts`
```typescript
// Calculates a 0–100 focus score for a completed session based on:
// completion rate, tasks done, and number of pauses.

calculateFocusScore(
  durationMinutes: number,
  targetMinutes: number,
  todosCompleted: number,
  todosTotal: number,
  pauseCount: number
): number
```

---

## 6. Backend — Firebase

### 6.1 Firebase Services Used

| Service | Purpose |
|---------|---------|
| Firebase Authentication | Google OAuth — user identity and session management |
| Cloud Firestore | Primary database — real-time NoSQL document store |
| Firebase Cloud Functions | Serverless backend — scheduled notifications, AI proxy |
| Firebase Cloud Messaging | Push notifications — web and mobile |
| Firebase Hosting | Optional static hosting for the web app |

### 6.2 Firestore Data Model

```
users/
  {uid}/
    profile:            User document (name, college, gradingSystem, streakCutoffTime, subjects[])
    streak:             Streak document (current, longest, lastLoggedDate, freezesRemaining, heatmap{})
    fcmTokens:          Array of FCM tokens (one per device/browser)
    
    exams/
      {examId}:         Exam document

    assignments/
      {assignmentId}:   Assignment document

    sessions/
      {sessionId}:      Pomodoro session document

    goals/
      {goalId}:         Goal document

    courses/
      {courseId}:       Course document (for GPA predictor)

    chatHistory/
      {messageId}:      Chat message document (AI coach conversation)

    settings:           Notification preferences, theme, notification timing config
```

### 6.3 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only read and write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }

    // No other collections are accessible
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 6.4 Cloud Functions

All functions are written in TypeScript and deployed to Firebase Cloud Functions (Node.js 20 runtime).

#### `aiProxy` — HTTPS Callable Function
- Validates the caller's Firebase Auth session
- Checks the user's daily AI request count in Firestore
- Rejects if the count exceeds the plan limit (10/day free, unlimited premium)
- Injects user context (exams, sessions, GPA data) into the Claude API request
- Calls the Anthropic API server-side (API key never leaves Cloud Functions)
- Saves the incremented request count back to Firestore
- Returns the Claude API response to the client

#### `streakReminder` — Scheduled Function
- Runs every 15 minutes via Cloud Scheduler
- Queries users whose `streakCutoffTime - warningWindow` falls within the current 15-minute window
- For each matching user, checks if they have a session logged today
- If no session logged, sends a push notification to all of the user's registered FCM tokens
- Uses batched FCM sends for efficiency

#### `examAlerts` — Scheduled Function
- Runs once daily at 06:00 UTC
- Queries all exam documents across all users
- For each exam, checks if today matches a notification trigger point (7d / 3d / 1d / 3hr before)
- Sends the appropriate push notification and records which notifications have been sent in `exam.notificationsSent[]` to prevent duplicates

#### `assignmentAlerts` — Scheduled Function
- Runs once daily at 08:00 UTC
- Queries assignments with `dueDate` within the next 24 hours and `status != 'done'`
- Sends a "Due tomorrow" push notification to the assignment owner

#### `weeklySummary` — Scheduled Function
- Runs every Sunday at 09:00 local time (approximated by running at multiple UTC times)
- Aggregates the past week's sessions: total hours, streak count, sessions completed
- Queries upcoming exams in the next 7 days
- Calls Claude API to generate a single personalized tip (short prompt, minimal tokens)
- Sends a rich push notification with the summary

---

## 7. AI Layer — Anthropic Claude API

### 7.1 Model

| Setting | Value |
|---------|-------|
| Model | `claude-sonnet-4-20250514` |
| Max tokens | 1000 per request |
| Access method | Via Firebase Cloud Function proxy only |

### 7.2 System Prompt

```
You are ScholarSync's AI academic coach. You help college students study smarter
and manage their academic workload effectively.

You have access to the student's current context including their upcoming exams,
assignment deadlines, recent study sessions, subject performance, and GPA data.

Your responses should be:
- Specific and actionable, not generic
- Encouraging but honest
- Brief unless a detailed plan is requested
- Referenced to the student's actual data when making suggestions

When generating a weekly study plan, respond with valid JSON only in this format:
{
  "weeklyPlan": [
    {
      "date": "YYYY-MM-DD",
      "blocks": [
        { "subject": "string", "startTime": "HH:MM", "endTime": "HH:MM", "type": "string" }
      ]
    }
  ],
  "insights": ["string", "string"],
  "suggestedGoals": ["string", "string", "string"]
}

When responding conversationally, respond in plain text only.
```

### 7.3 Context Injection

Every AI request includes the following user context, assembled by the Cloud Function before calling the API:

```typescript
interface AiContext {
  upcomingExams: Array<{ subject: string; daysUntil: number; difficulty: number }>
  pendingAssignments: Array<{ title: string; subject: string; daysUntil: number; complexity: string }>
  recentSessions: Array<{ subject: string; durationMinutes: number; date: string; focusScore: number }>   // last 14 days
  subjectHoursThisWeek: Record<string, number>
  currentStreak: number
  currentCgpa: number
  targetCgpa: number
  weakSubjects: string[]   // subjects with below-average hours this week
}
```

### 7.4 Rate Limiting

| Plan | Daily AI requests | Reset |
|------|------------------|-------|
| Free | 10 per day | Midnight user local time |
| Premium | Unlimited | — |

Rate limit state is stored in Firestore at `users/{uid}/settings.aiRequestsToday` and `aiRequestsResetDate`. The Cloud Function increments and checks this value atomically using a Firestore transaction.

### 7.5 Fallback Behavior

If the Claude API is unavailable or the user has exceeded their daily limit, the system falls back to `shared/utils/studyScheduler.ts` which generates a rule-based weekly study plan locally without any AI call. The fallback plan is clearly labelled as "Auto-generated" rather than "AI-generated" in the UI.

---

## 8. Authentication

### 8.1 Flow

```
User clicks "Sign in with Google"
  → Firebase Auth opens Google OAuth popup
  → User authenticates with their Google account
  → Firebase Auth returns a user object and JWT
  → App checks if users/{uid}/profile exists in Firestore
    → If yes: go to Dashboard
    → If no: go to Onboarding (new user)
```

### 8.2 Session Persistence

- Web: Firebase Auth persists the session in IndexedDB — users remain logged in across browser sessions
- Mobile: Firebase Auth session is persisted in Expo SecureStore via `expo-secure-store`
- Token refresh is handled automatically by the Firebase SDK

### 8.3 Route Protection

- Web: A `ProtectedRoute` component wraps all authenticated routes. If no user is present in the auth state, the user is redirected to the login page.
- Mobile: The root `_layout.tsx` in expo-router checks auth state and redirects unauthenticated users to the login screen.

---

## 9. Push Notifications

### 9.1 Web Push (FCM)

1. On first login, the app requests notification permission from the browser
2. If granted, the FCM SDK registers a token for the current browser session
3. The token is saved to `users/{uid}/fcmTokens[]` in Firestore
4. Firebase Cloud Functions read these tokens when sending notifications

### 9.2 Mobile Push (Expo Notifications)

1. On first launch, the app requests notification permissions via `expo-notifications`
2. The Expo push token is retrieved using `Expo.Notifications.getExpoPushTokenAsync()`
3. The token is saved to `users/{uid}/fcmTokens[]` alongside web tokens
4. For the streak reminder specifically, a local notification is also scheduled client-side as a backup:
   - `expo-background-fetch` + `expo-task-manager` register a background task
   - The task runs periodically, checks if a session has been logged today, and schedules a local notification for the warning window if not

### 9.3 Notification Payload Structure

```typescript
// Streak warning
{
  title: "🔥 Streak at Risk",
  body: "Log a study session before 11:00 PM to keep your 12-day streak!",
  data: { route: "/pomodoro" }
}

// Exam countdown
{
  title: "📚 Exam in 3 Days",
  body: "Chemistry exam is on Oct 28 at 9:00 AM. Are you on track?",
  data: { route: "/exams" }
}

// Assignment due
{
  title: "📋 Assignment Due Tomorrow",
  body: "Calculus Problem Set 4 is due tomorrow.",
  data: { route: "/assignments" }
}

// Weekly summary
{
  title: "📊 Your Week in Review",
  body: "You studied 12.5 hours this week. 🔥 Streak: 8 days. 2 exams next week.",
  data: { route: "/" }
}
```

---

## 10. Deployment

### 10.1 Web — Vercel

| Setting | Value |
|---------|-------|
| Platform | Vercel |
| Build command | `vite build` |
| Output directory | `dist` |
| Node version | 20.x |
| Deploy trigger | Push to `main` branch on GitHub |

**Environment variables in Vercel:**
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_VAPID_KEY        # For web push notifications
```

Note: The Anthropic API key is never added to Vercel env vars. It lives exclusively in Firebase Cloud Functions environment config.

### 10.2 Mobile — Expo EAS Build

| Profile | Platform | Output | Use |
|---------|----------|--------|-----|
| `preview` | Android | `.apk` | Direct install for testing |
| `preview` | iOS | `.ipa` (simulator) | TestFlight or simulator |
| `production` | Android | `.aab` | Google Play Store |
| `production` | iOS | `.ipa` | App Store |

**Build commands:**
```bash
# Android APK for testing (no Apple Developer account needed)
eas build --platform android --profile preview

# iOS build (requires Apple Developer account)
eas build --platform ios --profile preview

# Both platforms simultaneously
eas build --platform all --profile preview
```

**`eas.json` configuration:**
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### 10.3 Firebase Cloud Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy a single function
firebase deploy --only functions:streakReminder

# Deploy Firestore security rules
firebase deploy --only firestore:rules
```

---

## 11. Development Environment

### 11.1 Prerequisites

```
Node.js          >= 20.x
npm              >= 10.x
Git              any recent version
Firebase CLI     npm install -g firebase-tools
EAS CLI          npm install -g eas-cli
Expo Go app      Installed on your physical phone (for mobile dev)
```

### 11.2 Initial Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/scholarsync.git
cd scholarsync

# Install web dependencies
cd web && npm install

# Install mobile dependencies
cd ../mobile && npm install

# Install shared layer (if managed as a local package)
cd ../shared && npm install

# Install Cloud Functions dependencies
cd ../functions && npm install

# Log in to Firebase
firebase login

# Log in to Expo (for EAS builds)
eas login
```

### 11.3 Environment Files

**`web/.env.local`**
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_VAPID_KEY=
```

**`functions/.env`**
```
ANTHROPIC_API_KEY=
```

### 11.4 Running Locally

```bash
# Start web dev server
cd web && npm run dev
# → http://localhost:5173

# Start Expo dev server for mobile
cd mobile && npx expo start
# → Scan QR code with Expo Go app on your phone

# Run Firebase emulators (local Firestore + Functions)
firebase emulators:start --only firestore,functions
# → Firestore UI: http://localhost:4000
# → Functions: http://localhost:5001
```

---

## 12. Code Quality

### 12.1 TypeScript Configuration

- `strict: true` enabled across all packages
- No `any` types allowed (use `unknown` with type guards)
- All Firebase document reads typed using the interfaces in `shared/types/index.ts`
- All Claude API responses validated with Zod before use

### 12.2 Linting and Formatting

| Tool | Config | Purpose |
|------|--------|---------|
| ESLint | `eslint-config-react-app` + custom rules | Code quality |
| Prettier | Default config, single quotes, no semicolons | Code formatting |
| Husky | Pre-commit hook | Runs lint + type-check before every commit |
| lint-staged | Runs on staged files only | Fast pre-commit checks |

### 12.3 Git Conventions

**Branch naming:**
```
feature/exam-hub
fix/streak-timezone-bug
chore/update-firebase-sdk
```

**Commit message format:**
```
feat: add drag and drop to assignment kanban
fix: streak not resetting on timezone boundary
chore: update Claude API model version
docs: update Firestore schema in tech stack doc
```

---

## 13. Security Checklist

- [ ] Firestore security rules restrict every user to their own data path only
- [ ] Anthropic API key stored in Firebase Functions environment only — never in client code, never in version control
- [ ] Firebase App Check enabled in production (prevents API abuse from non-app clients)
- [ ] All user inputs validated with Zod on both client and Cloud Function before writing to Firestore
- [ ] AI rate limiting enforced server-side in Cloud Functions, not just client-side
- [ ] FCM tokens rotated: old tokens removed from Firestore when a new token is issued for the same device
- [ ] User account deletion: Cloud Function triggered on auth user deletion that purges all `users/{uid}` Firestore data
- [ ] No PII logged in Cloud Function logs (no names, emails, or study content in logs)

---

*ScholarSync Tech Stack Documentation — v1.0*
