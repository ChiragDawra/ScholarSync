# ScholarSync — Product Requirements Document

**Version:** 1.0  
**Product Type:** Web + Mobile (iOS & Android)  
**Target Users:** College / University Students  

---

## 1. Product Overview

### 1.1 What is ScholarSync?

ScholarSync is an all-in-one academic operating system for college students. It brings together exam tracking, assignment management, focus sessions, streak gamification, GPA prediction, and AI-powered coaching into a single unified product — available on both web and mobile.

### 1.2 Problem Statement

College students today manage their academic life across too many disconnected tools — a calendar for deadlines, a separate timer app for Pomodoro, spreadsheets for grade tracking, and nothing at all for streaks or AI-driven insights. The result is missed deadlines, broken study habits, and zero visibility into how daily behavior affects long-term academic outcomes.

### 1.3 Vision

> One app. Every academic habit. Zero excuses. ScholarSync turns scattered student life into a focused, data-driven, and gamified system — so you always know what to do next.

### 1.4 Goals

- Give students a single place to manage all academic work
- Make study habits measurable and consistent through streak gamification
- Surface AI-driven insights that help students study smarter, not harder
- Predict academic outcomes so students can course-correct before it's too late
- Be genuinely useful every single day, not just around exam time

---

## 2. Users

### 2.1 Primary User

**College / University Student (India-first, globally usable)**

- Age: 17–24
- Enrolled in undergraduate or postgraduate programs
- Juggles multiple subjects, assignments, and extracurriculars simultaneously
- Already uses tools like Notion, Google Calendar, LeetCode, or GitHub
- Motivated by streaks, progress visibility, and gamified systems
- Primarily on mobile but also uses a laptop for studying

### 2.2 Secondary Users

- High school students preparing for competitive exams
- Postgraduate / PhD students managing coursework and research
- Students in any stream — Engineering, Medical, Commerce, Arts

### 2.3 User Needs

| Need | Description |
|------|-------------|
| Centralization | One place for exams, assignments, study sessions, and goals |
| Accountability | Streak system that nudges them before habits break |
| Focus | Structured Pomodoro sessions linked to their actual subjects |
| Awareness | Real-time visibility into study patterns and weak areas |
| Prediction | Know what final scores they need to hit their target GPA |
| Guidance | AI coach that gives personalized, context-aware study advice |

---

## 3. Features

### 3.1 Exam Hub

Students can add upcoming exams and the app tracks countdowns, schedules study sessions, and sends timely reminders.

**Requirements:**

- Student can add an exam with: subject name, exam date & time, difficulty level (1–5 stars), and subject color tag
- Each exam displays a live countdown (e.g. "4 days left")
- Exam urgency is color-coded: green (more than 7 days), yellow (3–7 days), red (fewer than 3 days)
- Exams are sorted by date ascending by default
- The app auto-generates recommended daily study blocks for each subject based on days remaining and difficulty level
- These study blocks appear in Today's Schedule on the Dashboard
- Reminders are sent at: 7 days before, 3 days before, 1 day before, and 3 hours before the exam

---

### 3.2 Assignment Board

A Kanban-style board where students manage all their assignments across subjects.

**Requirements:**

- Three columns: To Do, In Progress, Done
- Each assignment card contains: course code tag, title, optional description, due date, complexity (Easy / Medium / High), AI priority score (1–10), and assignee avatar(s)
- Cards can be dragged between columns to update status
- An "Add Assignment" action opens a slide-in drawer with a form
- Students can search assignments by keyword
- Students can filter assignments by subject, priority, or due date
- Cards highlight a "Due Today" badge when the due date matches today
- Cards can optionally include a header image (e.g. for lab reports, creative work)
- The AI priority score is calculated based on complexity, due date urgency, and subject weight
- A notification is sent when an assignment is due within 24 hours
- Team mode: multiple students can be assigned to a single card, shown as stacked avatars

---

### 3.3 Pomodoro Studio

A subject-linked focus timer with session tracking and per-session goals.

**Requirements:**

- Default timer: 25 minutes work / 5 minutes break
- Students can choose from preset durations: 25/5, 50/10
- A circular SVG ring surrounds the timer display and visually depletes as time passes
- Ring color changes dynamically: green at start, orange at 50% elapsed, red at 80% elapsed
- Students select a subject tag before starting a session
- Each session has a to-do checklist scoped to that session only — students can add tasks, check them off, and uncompleted tasks remain visible
- The browser / app tab title updates to show remaining time while a session is active
- A sound plays when a work phase ends and when a break ends
- On session complete, the session is saved automatically: subject, duration, date, number of tasks completed vs total, and a focus score
- Session history is shown in a table below the timer: Subject, Duration, Date, Focus Score
- Focus Score is a 0–100 metric calculated from: session completion rate, tasks completed rate, and interruptions (pauses)
- A small music / lo-fi player widget is available in the right panel for ambient sound while studying

---

### 3.4 Streak Engine

A daily study streak system modeled after GitHub's contribution graph and LeetCode's streak mechanic.

**Requirements:**

- A streak increments by 1 each calendar day that the student logs at least one completed Pomodoro session
- If a student misses a day, the streak resets to 0
- Students set a personal daily cutoff time (e.g. 11:00 PM) — this is the deadline by which they must log a session to keep the streak alive
- A push notification fires 1–2 hours before the daily cutoff if no session has been logged that day, warning the student their streak is at risk
- The current streak count is always visible in the sidebar / nav
- An annual heatmap (GitHub contribution graph style) visualizes every day's study activity, colored by hours studied
- Heatmap color scale: 5 levels from empty (no study) to deep violet (3+ hours)
- Streak stats are shown: current streak, longest streak ever, total days studied
- Streak Freeze: students get 1 freeze per week — using it counts the day as studied without requiring a session, preventing a streak break during genuine emergencies

---

### 3.5 Goals Board

A space for students to set and track weekly and monthly academic goals.

**Requirements:**

- Students can create Weekly goals and Monthly goals
- Each goal has: title, type (weekly / monthly), target completion date, and optional progress value (0–100%)
- Goals are displayed as cards with a circular progress ring showing % completion
- Students can mark a goal as Done — triggers a celebration animation
- AI-suggested goals: the AI coach analyzes upcoming exams and past patterns and suggests 3 relevant goals the student can accept or dismiss
- Completed goals are visually struck through / grayed out but remain visible until the end of the week/month

---

### 3.6 Analytics Dashboard

Data visualizations that help students understand their study patterns and identify weak areas.

**Requirements:**

- Filter scope: Week / Month / Semester — applies to all charts simultaneously
- **Bar chart:** Study hours per subject for the selected period
- **Line chart:** Daily study hours over the last 30 days, with a 7-day rolling average line overlaid
- **Donut chart:** Subject time distribution as percentages — shows which subjects are getting the most attention
- **Heatmap:** Same GitHub-style annual heatmap as on Dashboard, accessible here as well
- **Weak Subjects card:** Lists subjects with below-average study time for the period, highlighted in orange/red with retention % and grade trend
- **AI Learning Insight card:** A natural language paragraph generated by the AI that identifies patterns, anomalies, and actionable suggestions (e.g. "You're excelling in CS but your focus in English Literature has dropped 15%. Consider shorter, more frequent sessions.")
- Insight card has two actions: Adjust Schedule (opens AI coach with context) and Dismiss
- Stat summary cards at top of page: Total Hours, Avg Focus Score, Tasks Done, Current Streak — each with a trend indicator vs the previous period

---

### 3.7 GPA Predictor

A calculator that tells students exactly what they need to score in finals to hit their target GPA.

**Requirements:**

- Students select the active semester from a dropdown
- Supports two grading systems: 10-point CGPA scale and percentage — set during onboarding
- **Target CGPA slider:** Range 6.0–10.0, step 0.1, with the current target value displayed prominently
- As the slider moves, required final exam scores update in real time across all subjects
- **Course Performance table:** One row per subject, columns are: Subject (with icon + course code), Current Score / Max Score, progress bar with performance label (Excellent / Solid / Average / Risk), Max marks, Credit Hours, Predicted Grade (dropdown), Required Final Score (colored chip)
- Required Final Score chips are color-coded: green (below 75%, achievable), orange (75–90%, challenging), red (above 90%, very high difficulty)
- Summary stat cards: Current CGPA, Estimated Total Credits, Required Average across all finals
- **Grade Distribution donut chart:** Shows predicted distribution of A / B / C grades for the semester
- An AI insight below the slider explains which specific subjects to prioritize and why
- Subjects at risk (predicted to pull the GPA below target) are highlighted by name in the AI insight in orange
- Students can add or remove courses from the table
- Table paginates if there are more than 5–6 courses

---

### 3.8 AI Study Coach

A conversational AI interface that generates personalized study plans and provides academic insights.

**Requirements:**

- Chat interface: AI messages on the left, student messages on the right, in bubble style
- The AI has full context of the student's: upcoming exams, current assignments, session history (last 14 days), GPA data, current streak, and goals
- The AI can suggest specific study sessions at specific times based on the student's history and schedule
- When the AI suggests a study session, it renders an inline scheduling card inside the chat with: subject, date, time range, and a Confirm button — clicking Confirm saves the block to the student's schedule
- "Generate Weekly Plan" button: produces a full Mon–Sun study plan based on current academic context, rendered as structured day cards in the right panel
- Right panel — "This Week's Plan": shows day-by-day plan cards, each day showing subject blocks with times and durations, completion status, and a daily progress bar
- Day states: Completed (green checkmark), Today (highlighted with TODAY badge, shows progress bar), Upcoming, Plan not finalized (dashed placeholder card)
- The AI references the student's retention patterns (e.g. "Your retention is highest in evening sessions")
- A date separator shows in the chat for each day of conversation history
- Chat history is persisted — the student can scroll back through previous conversations
- Rate limiting: maximum 10 AI requests per day per user on the free tier, displayed as a counter
- If the AI API is unavailable, the system falls back to a rule-based study plan generated locally
- A disclaimer at the bottom of the chat: "ScholarSync AI can make mistakes. Consider checking important info."
- A "Beta" badge is displayed next to the AI Coach title

---

### 3.9 Smart Notifications

Timely push notifications that keep students on track without being annoying.

**Requirements:**

- **Streak warning:** Fires 1–2 hours before the student's personal daily cutoff if no session has been logged — "🔥 Your streak is at risk! Log a session before [cutoff time]."
- **Exam countdown:** Fires at 7 days, 3 days, 1 day, and 3 hours before each exam
- **Assignment due:** Fires 24 hours before an assignment's due date
- **Weekly summary:** Every Sunday morning — recap of hours studied, streak count, upcoming exams in the next week, and one AI-generated tip
- All notification types are individually toggleable in Settings
- Students can customize the time window for the streak warning (e.g. "warn me 2 hours before" vs "1 hour before")
- Notifications work on web (via FCM web push) and mobile (via FCM / Expo Notifications)
- Clicking a notification deep-links to the relevant section of the app

---

### 3.10 Onboarding

A short setup flow for new users to personalize ScholarSync before reaching the dashboard.

**Requirements:**

- Step 1: Name + College / University name
- Step 2: Add subjects (chip input — type and press Enter to add, removable)
- Step 3: Set daily streak cutoff time + select grading system (10-point CGPA or Percentage)
- Progress indicator shows which step the student is on
- All fields are optional except name — students can skip and configure later in Settings
- On completion, the student lands on a pre-populated Dashboard with contextual empty states and prompts to add their first exam

---

### 3.11 User Profile & Settings

**Requirements:**

- Google OAuth — one-tap sign in, no password required
- Profile: display name, college, avatar (from Google account)
- Subjects: add, edit, remove subjects and their colors at any time
- Semester: set current semester and switch between semesters
- Grading system: CGPA (10-point) or Percentage
- Daily streak cutoff time: configurable
- Streak freeze: shows remaining freezes for the week (1 per week)
- Notification preferences: per-type toggles (streak warning, exam alerts, assignment alerts, weekly summary)
- Notification timing: customize how far in advance each alert fires
- Appearance: Dark mode (default) / Light mode toggle
- Account: sign out, delete account

---

## 4. User Flows

### 4.1 New User Onboarding
```
Sign Up with Google
  → Onboarding Step 1: Name + College
  → Onboarding Step 2: Add Subjects
  → Onboarding Step 3: Cutoff Time + Grading System
  → Dashboard (empty state with prompts)
    → "Add your first exam" CTA
```

### 4.2 Daily Usage Loop
```
Open App
  → Dashboard: check streak, today's schedule, AI insight
  → Start Pomodoro session (subject selected, to-dos added)
  → Session completes → streak updates → session saved
  → Check / update assignment statuses on board
```

### 4.3 Exam Preparation Flow
```
Add Exam (subject, date, difficulty)
  → Auto-generates daily study blocks in schedule
  → Reminders fire at 7d / 3d / 1d / 3hr
  → Student logs Pomodoro sessions tagged to that subject
  → Analytics shows study hours vs time remaining
  → GPA Predictor shows required final score
  → AI Coach generates targeted study plan
```

### 4.4 Streak at Risk Flow
```
End of day approaches → no session logged yet
  → Push notification fires [cutoff - 2hr]: "Streak at risk!"
  → Student taps notification → deep links to Pomodoro
  → Logs a session → streak preserved
```

### 4.5 AI Coach Interaction Flow
```
Open AI Coach
  → AI greets with a context-aware suggestion
  → Student responds or adjusts the suggestion
  → AI renders an inline schedule card
  → Student confirms → session added to plan
  → Right panel updates with the new block
```

---

## 5. Non-Functional Requirements

| Requirement | Specification |
|-------------|---------------|
| Web load time | Under 2 seconds on a standard broadband connection |
| Mobile app size | Under 50MB (Expo optimized build) |
| Notification delivery | Within 60 seconds of the scheduled trigger time |
| Offline support | Pomodoro timer, to-dos, and session logging work fully offline; data syncs when connection resumes |
| Data privacy | Each user's data is fully isolated — no user can access another user's data |
| Authentication | OAuth 2.0 via Google Sign-In only |
| AI rate limiting | Max 10 AI Coach requests per day per user on the free plan |
| GPA calculation accuracy | Required final scores accurate to 1 decimal place |
| Streak accuracy | Streak must respect the user's local timezone for daily cutoff calculations |
| Session data | Sessions are saved within 3 seconds of completion |

---

## 6. Out of Scope (v1.0)

The following are explicitly not part of the initial release:

- Google Calendar / external calendar sync
- Timetable import via photo / OCR
- Friends leaderboard or social comparison features
- Shared / group Pomodoro sessions
- Note-taking or document storage
- LeetCode or GitHub integration
- In-app payments or subscription management UI
- Teacher / faculty-facing features
- Offline AI Coach (AI requires internet connection)

---

## 7. Success Metrics

| Metric | Target |
|--------|--------|
| Day-7 retention | 40% of users return after 7 days |
| Daily active streak loggers | 60% of active users log a session on any given day |
| Avg sessions per active user per week | 4+ Pomodoro sessions |
| AI Coach engagement | 30% of users interact with AI Coach at least once per week |
| GPA Predictor usage | 50% of users add at least one course within first week |
| Notification opt-in rate | 70% of users allow push notifications |

---

*ScholarSync — Empowering Academic Excellence.*
