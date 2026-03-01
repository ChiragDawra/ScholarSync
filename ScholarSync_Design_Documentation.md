# 🎨 ScholarSync — Design Documentation

> **Version:** 1.0  
> **Design Tool:** Google Stitch (AI-Generated)  
> **Screens Documented:** 6 (Dashboard, Pomodoro, Assignments, Analytics, GPA Predictor, AI Coach)

---

## 1. Design Foundations

### 1.1 Color Palette

#### Background Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `bg-base` | `#0D0D14` | Main app background (deepest black-navy) |
| `bg-surface` | `#13131F` | Card / panel background |
| `bg-surface-raised` | `#1A1A2E` | Elevated cards, modals, sidebar |
| `bg-input` | `#1E1E30` | Input fields, search bars |
| `bg-sidebar` | `#111120` | Left sidebar background |

#### Brand / Primary
| Token | Hex | Usage |
|-------|-----|-------|
| `brand-primary` | `#5B5BD6` | Primary buttons, active nav, CTA |
| `brand-primary-hover` | `#4747C2` | Hover state on primary |
| `brand-secondary` | `#7C3AED` | Gradients, AI elements, upgrade CTAs |
| `brand-gradient` | `#5B5BD6 → #7C3AED` | Upgrade button, AI coach icon, accents |

#### Text Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `text-primary` | `#FFFFFF` | Headlines, primary labels |
| `text-secondary` | `#A0A0B8` | Subtitles, descriptions, meta |
| `text-muted` | `#5E5E7A` | Placeholder, disabled, timestamps |
| `text-link` | `#7C6FE0` | Hyperlinks, AI insight highlights |

#### Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#22C55E` | Completed badges, positive trends, Done column |
| `warning` | `#F59E0B` | Medium priority, "Due Today" badge, warning |
| `danger` | `#EF4444` | High priority, overdue, low retention |
| `info` | `#6366F1` | Info icons, streak, general tags |
| `orange-accent` | `#F97316` | Day streak icon, focus areas icons |

#### Subject Colors (Tag Pills)
| Subject | Color |
|---------|-------|
| CS / DSA | `#6366F1` (indigo) |
| Physics | `#A855F7` (purple) |
| Chemistry | `#EC4899` (pink) |
| Math | `#3B82F6` (blue) |
| History | `#10B981` (emerald) |
| Literature | `#F59E0B` (amber) |
| General | `#64748B` (slate) |

#### Heatmap Scale (Study Consistency)
| Level | Hex | Hours |
|-------|-----|-------|
| Empty | `#1E1E30` | 0 hrs |
| Level 1 | `#312E81` | 0–1 hr |
| Level 2 | `#4338CA` | 1–2 hrs |
| Level 3 | `#5B5BD6` | 2–3 hrs |
| Level 4 | `#7C6FE0` | 3+ hrs |

---

### 1.2 Typography

**Font Family:** `Inter` (Google Fonts)  
**Fallback:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

| Style | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `display` | 32px | 700 | 1.2 | Welcome heading, page title |
| `heading-xl` | 28px | 700 | 1.3 | Section headers (GPA Predictor, Analytics Overview) |
| `heading-lg` | 22px | 700 | 1.3 | Card titles, sub-page titles |
| `heading-md` | 18px | 600 | 1.4 | Card section headers, "Today's Schedule" |
| `heading-sm` | 15px | 600 | 1.4 | Column headers, labels |
| `body-lg` | 15px | 400 | 1.6 | Primary body text, descriptions |
| `body-md` | 14px | 400 | 1.5 | Secondary body, card content |
| `body-sm` | 13px | 400 | 1.5 | Meta info, timestamps, subtitles |
| `label` | 12px | 500 | 1.4 | Badges, tags, table column headers (UPPERCASE) |
| `stat-number` | 36px | 700 | 1.0 | Stat card big numbers (32.5h, 12, 5, 4d) |
| `timer` | 72px | 700 | 1.0 | Pomodoro countdown display |

---

### 1.3 Spacing System

Base unit: `4px`

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Micro gaps |
| `space-2` | 8px | Tight padding (badge inner) |
| `space-3` | 12px | Small gaps between elements |
| `space-4` | 16px | Standard padding (card inner) |
| `space-5` | 20px | Medium gaps |
| `space-6` | 24px | Card padding, section gaps |
| `space-8` | 32px | Large section spacing |
| `space-10` | 40px | Between major sections |
| `space-12` | 48px | Page-level padding |

---

### 1.4 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 6px | Badges, tags, small chips |
| `radius-md` | 10px | Input fields, small cards |
| `radius-lg` | 14px | Standard cards, panels |
| `radius-xl` | 18px | Large cards, modals |
| `radius-full` | 9999px | Pills, avatar circles, toggle buttons |

---

### 1.5 Shadows & Elevation

```css
/* Surface card */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3);

/* Elevated card (hover / active) */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3);

/* Modal / Overlay */
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);

/* AI insight card (glowing) */
box-shadow: 0 0 20px rgba(91, 91, 214, 0.15), 0 4px 12px rgba(0, 0, 0, 0.4);
```

---

### 1.6 Border Styles

```css
/* Default card border */
border: 1px solid rgba(255, 255, 255, 0.06);

/* Active / focus border */
border: 1px solid rgba(91, 91, 214, 0.5);

/* Input focus */
border: 1px solid #5B5BD6;

/* Subtle divider */
border-bottom: 1px solid rgba(255, 255, 255, 0.05);
```

---

## 2. Layout System

### 2.1 Navigation Patterns

Three different nav patterns are used across screens:

#### Pattern A — Left Sidebar + Content (Dashboard, Assignments)
```
┌──────────────┬─────────────────────────────────┐
│  Sidebar     │         Main Content             │
│  (260px)     │         (flex: 1)                │
│              │                                  │
│  Logo        │  Page Header                     │
│  Nav Items   │  Content Grid                    │
│  ...         │                                  │
│  Settings    │                                  │
│  Upgrade CTA │                                  │
└──────────────┴─────────────────────────────────┘
```
- Sidebar width: **260px** (fixed)
- Active nav item: `bg-brand-primary`, `border-radius: radius-lg`, full-width highlight
- Inactive nav item: text-secondary, hover → text-primary + subtle bg

#### Pattern B — Top Navigation Bar (Analytics, GPA, AI Coach)
```
┌─────────────────────────────────────────────────┐
│  Logo   Nav Links              Search  Upgrade   │
│         (horizontal)           Bar     Pro       │
├─────────────────────────────────────────────────┤
│                  Main Content                   │
└─────────────────────────────────────────────────┘
```
- Navbar height: **56px**
- Active nav link: underline + white text
- Inactive: `text-secondary`, hover → `text-primary`

#### Pattern C — Hybrid (AI Coach — top bar + left icon rail)
- Slim left icon rail: **48px** wide
- Top bar with chat-specific controls
- Right panel: **280px** (weekly plan)

---

### 2.2 Grid System

| Layout | Columns | Gap |
|--------|---------|-----|
| Stat cards row | 4 equal columns | 16px |
| Dashboard main (heatmap + schedule) | 60% / 40% | 20px |
| Analytics charts (weekly + distribution) | 55% / 40% | 20px |
| GPA (main + grade dist) | 65% / 32% | 20px |
| Kanban board | 3 equal columns | 20px |

---

### 2.3 Page Max Width

- Max content width: **1200px** (centered on large screens)
- Side padding: `48px` left/right on desktop

---

## 3. Component Specifications

### 3.1 Stat Cards

Used on: Dashboard, Analytics

```
┌──────────────────────────────┐
│  [Icon]   Label              │  ← 40px icon container, brand-colored bg
│                              │
│  Value         Trend Badge   │  ← stat-number + small trend chip
│  Sub-label                   │  ← text-muted, body-sm
└──────────────────────────────┘
```

- Background: `bg-surface`
- Border: `1px solid rgba(255,255,255,0.06)`
- Border radius: `radius-lg` (14px)
- Padding: `24px`
- Icon container: `40px × 40px`, `border-radius: 10px`, brand color with `opacity-20` background
- Trend badge: green `↑12%` or red `↓2%` with arrow icon, `font-size: 12px`, `font-weight: 600`

**Dashboard stat card extras:**
- Subtitle text below value (e.g. "vs last week", "Keep it burning!")
- Badge inline with value (e.g. "+1" in green, "1 Overdue" in red)
- Subject label next to value (e.g. "Chemistry" in brand color)

---

### 3.2 Navigation Sidebar

```
┌─────────────────────────┐
│  [Avatar] Name          │  ← 36px avatar, name bold, subtitle muted
│           Premium Plan  │
├─────────────────────────┤
│  ▌ Dashboard  ←active  │  ← full-width highlight, brand bg
│    Exams                │
│    Assignments          │
│    Pomodoro             │
│    Goals                │
│    Analytics            │
│    GPA Predictor        │
│    AI Coach             │
├─────────────────────────┤
│  ⚙ Settings             │
├─────────────────────────┤
│  🚀 Upgrade Pro         │  ← gradient button, full-width
└─────────────────────────┘
```

- Width: `260px`
- Nav item height: `44px`
- Nav item padding: `12px 16px`
- Nav item border-radius: `10px`
- Active: `background: #5B5BD6`, `color: white`
- Icon size: `18px`, same color as text
- Upgrade CTA: full-width gradient button `#5B5BD6 → #7C3AED`, `border-radius: radius-full`

---

### 3.3 Heatmap (Study Consistency)

- Style: GitHub contribution graph
- Grid: Mon / Wed / Fri row labels (left), week columns extending right
- Cell size: approx `12px × 12px`, gap: `3px`
- Cell border-radius: `2px`
- 5-level color scale (see Color Palette section)
- Legend: "Less ■■■■ More" bottom-right, `text-muted`
- Filter button: `Last 6 Months` pill — `bg-surface-raised`, `border-radius: radius-full`

---

### 3.4 Today's Schedule (Timeline)

```
●  Now • 10:00 - 11:30 AM          ← green dot for current
   Physics: Mechanics Review
   [Chapter 4]  [Pomodoro]          ← tag chips

○  12:30 - 01:30 PM
   Lunch Break
   Cafeteria

○  02:00 - 04:00 PM
   Calculus II Assignment
   [Due Today]                      ← orange warning chip

○  05:00 - 06:00 PM
   Group Study: Chemistry
   [Avatar] [Avatar]                ← member avatars
```

- Timeline dot: `8px` circle, `bg-brand-primary`, current item has animated pulse ring
- Connector line: `1px solid rgba(255,255,255,0.08)` vertical line
- Time label: `text-muted`, `body-sm`
- Event title: `text-primary`, `body-md`, `font-weight: 600`
- Tag chips: `6px radius`, `12px font`, colored background per type

---

### 3.5 AI Insight Card

```
┌──────────────────────────────────────────────────────┐
│  [✦ Icon]  AI Coach Insight                          │
│  ⚡ You study 40% less before weekends...            │
│      Start today to avoid cramming.                  │
│                              [Dismiss] [Create Plan] │
└──────────────────────────────────────────────────────┘
```

- Background: subtle indigo gradient `rgba(91, 91, 214, 0.08)` + `border: 1px solid rgba(91, 91, 214, 0.3)`
- Border radius: `radius-xl` (18px)
- AI icon: `40px` circle, `brand-gradient` background, sparkle `✦` icon in white
- Dismiss button: ghost style, `text-secondary`
- Primary CTA: `bg-brand-primary`, `border-radius: radius-full`

---

### 3.6 Pomodoro Timer

```
         ╭──────────────────╮
        ╱   ┌─────────────┐  ╲
       │    │   25:00     │   │  ← 72px bold white
       │    │ Focus Session│   │  ← muted subtext
        ╲   └─────────────┘  ╱
         ╰──────────────────╯
              ↺    ▶    ⏸
           Reset  Start  Pause
```

- Ring: SVG circle, `stroke: #5B5BD6`, `stroke-width: 8px`, `stroke-linecap: round`
- Ring background track: `stroke: #1E1E30`
- Ring size: approx `280px × 280px`
- Ring color transition: green `#22C55E` (start) → orange `#F59E0B` (50%) → red `#EF4444` (80%)
- Center time: `font-size: 72px`, `font-weight: 700`
- "Focus Session" label: `text-muted`, `body-sm`, centered below time
- Control buttons: Reset + Pause → `48px` circle, `bg-surface-raised`; Start → `56px` circle, `bg-white`, `color: bg-base` (filled play)
- Subject tabs: pill chips above timer, active → `bg-brand-primary`

---

### 3.7 Session Goals Panel

```
┌──────────────────────────────────┐
│  ✓ Session Goals           [+]   │
│                                  │
│  ☐ Solve 5 Dynamic Programming   │
│      problems                    │
│      In Progress ← brand color   │
│                                  │
│  ☐ Review Binary Tree notes      │
│      15 mins est.                │
│                                  │
│  ☐ Complete weekly quiz          │
│      DSA                         │
│                                  │
│  ☑ Read Chapter 4    ← strikethrough
│      Done                        │
└──────────────────────────────────┘
```

- Panel background: `bg-surface`, `border-radius: radius-lg`
- Checkbox: custom styled, `18px`, `border-radius: 4px`, brand color when checked
- Completed item: `text-decoration: line-through`, `text-muted`
- Status sub-label: "In Progress" → `text-brand-primary`; "Done" → `text-muted`

---

### 3.8 Session History Table

| Column | Style |
|--------|-------|
| Subject | Colored dot + name |
| Duration | `text-secondary` |
| Date | `text-muted` |
| Focus Score | Pill badge: green (90+), yellow (80-89), orange (<80) |

- Table header: `UPPERCASE`, `12px`, `letter-spacing: 0.08em`, `text-muted`
- Row border: `1px solid rgba(255,255,255,0.04)`
- Row hover: `bg-surface-raised`
- Focus Score badge: `border-radius: radius-sm`, colored background with matching text

---

### 3.9 Kanban Board (Assignments)

#### Column Headers
```
● To Do   3        ⋯
● In Progress  2   ⋯
● Done    5        ⋯
```
- Status dot: `8px` circle — `#F59E0B` (To Do), `#6366F1` (In Progress), `#22C55E` (Done)
- Count badge: `text-muted`, `body-sm`
- Column width: equal thirds, min `280px`

#### Assignment Card
```
┌─────────────────────────────────┐
│  [MATH 101]      [Score: 9.2]   │  ← course tag + AI score chip
│  Calculus Problem Set 4         │  ← heading-md
│  Complete problems 1-15 from... │  ← body-sm text-secondary
│                                 │
│  📅 Oct 12   • High   [Avatar]  │  ← meta row
└─────────────────────────────────┘
```
- Card background: `bg-surface`
- Border: `1px solid rgba(255,255,255,0.06)`
- Border radius: `radius-lg`
- Course tag: `6px radius`, small colored bg, `label` typography, `12px`
- AI Score chip: `6px radius`, indigo bg, `Score: 9.2` white text
- Priority badge: `High` → red, `Med` → yellow, `Low` → green — text only with dot
- Avatar: `28px` circle, initials or photo
- "In Progress" cards can have a header image (full-width photo at top of card)

---

### 3.10 Analytics Charts

#### Bar Chart — Weekly Study Hours
- Chart type: Grouped vertical bars
- Bar color: `#5B5BD6` with `opacity: 0.8`
- Bar hover: `opacity: 1` + tooltip
- X-axis labels: subject abbreviations (Math, Phys, Hist, CS...)
- No Y-axis grid lines — clean minimal look

#### Donut Chart — Subject Distribution
- Stroke width: thick (~24px)
- Center label: large percentage + subject name
- Colors: per subject color tokens above
- Legend: horizontal dots + subject name + percentage below chart

#### Line + Bar Chart — 30-Day Activity
- Bars: `#5B5BD6`, low opacity
- Line overlay: `#A78BFA` (lighter purple), 2px stroke, smooth curve
- Two legend items: "Daily Hours" (dot) + "7-Day Avg" (dot)
- X-axis: date labels, sparse (every 5-7 days)
- Trend badge top-right: `+8% vs last month`, `bg-surface-raised`, green text

---

### 3.11 GPA Predictor — Slider

```
6.0  ─────────────●───────────  10.0
                  ↑
               [9.0 large]
```

- Track: `4px` height, `bg-surface-raised`
- Fill: `bg-brand-primary`
- Thumb: `20px` circle, `bg-white`, `box-shadow: 0 0 8px rgba(91,91,214,0.6)`
- Value display: large `9.0` in brand color, `font-size: 48px`, `font-weight: 700`
- Range labels `6.0` and `10.0`: `text-muted`, `body-sm`

#### Course Performance Table Rows
- Subject icon: `36px` square, `border-radius: 8px`, subject-colored bg with white icon
- Progress bar: `6px` height, `border-radius: radius-full`
  - Blue → "Solid B" performance
  - Purple → "Risk" (low score)
  - Orange → "Excellent"
  - Teal → "Average"
- Predicted grade: dropdown select, `bg-surface`, `border-radius: radius-sm`
- Required final chip: green bg (easy), red bg (high difficulty), `border-radius: radius-sm`

---

### 3.12 AI Coach — Chat Interface

#### Message Bubbles
```
[Bot Avatar]  ScholarSync AI
              ╔═══════════════════════════════╗
              ║ Hello! Based on your recent   ║  ← bg-surface-raised, left-aligned
              ║ quiz scores...                ║
              ╚═══════════════════════════════╝
              10:42 AM

                                          You [Avatar]
              ╔═══════════════════════════════╗
              ║ That sounds good, but I have  ║  ← brand-primary bg, right-aligned
              ║ a club meeting until 8:30...  ║
              ╚═══════════════════════════════╝
                                      10:45 AM
```

- Bot bubble: `bg-surface-raised`, `border-radius: 14px 14px 14px 4px` (tail bottom-left)
- User bubble: `bg-brand-primary`, `border-radius: 14px 14px 4px 14px` (tail bottom-right)
- Bot avatar: `36px`, brand gradient circle with robot icon
- User avatar: `36px`, photo
- Timestamp: `text-muted`, `12px`, below bubble
- Date separator: center pill chip — `bg-surface-raised`, "Today, Oct 24"

#### Inline Schedule Card (inside bot message)
- Background: `bg-base` (darker than bubble)
- Border: `1px solid rgba(91,91,214,0.3)`
- Border-radius: `radius-md`
- Confirm button: `bg-brand-primary`, right-aligned

#### Input Bar
- Background: `bg-surface-raised`
- Border-radius: `radius-full`
- Left icon: `+` attachment button
- Placeholder: "Ask your coach anything..." `text-muted`
- Send button: `40px` circle, `bg-brand-primary`
- "Generate Weekly Plan" CTA: centered above input, `✦` icon, ghost style with border

---

### 3.13 Weekly Plan Panel (AI Coach)

```
┌───────────────────────────────┐
│  This Week's Plan             │
│  Based on your goals   [View] │
├───────────────────────────────┤
│  Mon, Oct 23      ✓ Completed │
│  ┃ Calculus I                 │
│    1h 30m • Practice Problems │
├───────────────────────────────┤
│  Tue, Oct 24      TODAY badge │
│  ┃ History Essay Draft  ✓     │
│    10:00 AM • 45m             │
│  ┃ Organic Chem Review  ▶     │
│    09:00 PM • 1h 15m          │
│  ████████░░ 65% Goal          │
├───────────────────────────────┤
│  Wed, Oct 25      Upcoming    │
│  ...                          │
└───────────────────────────────┘
```

- Panel width: `280px`
- Day card: `bg-surface`, `border-radius: radius-lg`
- Day header: date bold left, status badge right (`Completed` green, `TODAY` brand pill, `Upcoming` muted)
- Session item: `3px` left border in subject color, title + time meta
- Progress bar: `6px`, `border-radius: radius-full`, brand color fill
- "Plan not finalized": dashed border card, `text-muted`

---

### 3.14 Badges & Chips

| Type | Background | Text | Radius | Size |
|------|-----------|------|--------|------|
| Priority High | `rgba(239,68,68,0.15)` | `#EF4444` | 4px | 12px |
| Priority Med | `rgba(245,158,11,0.15)` | `#F59E0B` | 4px | 12px |
| Priority Low | `rgba(34,197,94,0.15)` | `#22C55E` | 4px | 12px |
| Due Today | `rgba(245,158,11,0.2)` | `#F59E0B` | 6px | 12px |
| Overdue | `rgba(239,68,68,0.2)` | `#EF4444` | 6px | 12px |
| Completed | `rgba(34,197,94,0.2)` | `#22C55E` | 6px | 12px |
| Beta | `rgba(255,255,255,0.1)` | `#A0A0B8` | 6px | 11px |
| Today (plan) | `#5B5BD6` | `#FFFFFF` | full | 12px |
| Pomodoro tag | `rgba(99,102,241,0.2)` | `#818CF8` | full | 12px |
| +1 streak | `rgba(34,197,94,0.2)` | `#22C55E` | full | 12px |

---

### 3.15 Buttons

| Variant | Background | Text | Border | Radius |
|---------|-----------|------|--------|--------|
| Primary | `#5B5BD6` | White | — | full |
| Primary Gradient | `#5B5BD6 → #7C3AED` | White | — | full |
| Ghost | Transparent | `text-secondary` | — | full |
| Outline | Transparent | White | `1px solid rgba(255,255,255,0.15)` | md |
| Icon Circle | `bg-surface-raised` | `text-secondary` | `1px solid rgba(255,255,255,0.08)` | full |
| Upgrade Pro | `#7C3AED gradient` | White | — | full |
| Danger | `rgba(239,68,68,0.15)` | `#EF4444` | — | md |

- Button height: `40px` (default), `32px` (small), `48px` (large)
- Padding: `16px 20px` (default), `12px 16px` (small)
- Font: `14px`, `font-weight: 600`
- All buttons: hover → `opacity: 0.85` + subtle scale `1.01`
- Focus: `outline: 2px solid #5B5BD6`, `outline-offset: 2px`

---

### 3.16 Floating Action Button (FAB)

- Size: `52px × 52px`
- Shape: circle
- Background: `bg-brand-primary`
- Icon: `+` white, `24px`
- Position: fixed, `bottom: 32px`, `right: 32px`
- Shadow: `0 4px 20px rgba(91, 91, 214, 0.5)`
- Hover: scale `1.05` + shadow intensifies

---

## 4. Screen-by-Screen Breakdown

### Screen 1 — Dashboard

**Layout:** Left sidebar (Pattern A) + 2-column content  
**Sections:**
1. Greeting header + date chip (top)
2. 4-column stat cards row
3. Left 60%: Study Consistency heatmap card
4. Right 40%: Today's Schedule card
5. Full-width AI Coach Insight card (bottom)

**Key UX Notes:**
- Date shown in top-right pill chip: calendar icon + date, `bg-surface`, `border-radius: radius-full`
- Greeting uses emoji 👋 inline with heading
- FAB (`+` circle) fixed bottom-right for quick add
- Heatmap card has a "Last 6 Months" filter pill top-right

---

### Screen 2 — Pomodoro Studio

**Layout:** Top nav bar (Pattern B) + 2-column main  
**Sections:**
1. Left panel: Subject tabs → Timer ring → Controls → Session History table
2. Right panel: Session Goals checklist + Music player (bottom)

**Key UX Notes:**
- Navigation is top bar style (not sidebar) on this screen
- Music player at bottom of right panel: song name + artist + play button
- "View All" link in Session History header

---

### Screen 3 — Assignments Board

**Layout:** Left sidebar (Pattern A) + 3-column Kanban  
**Sections:**
1. Page title + subtitle (top-left of content)
2. Search bar + Filter button + Add Assignment button (top-right)
3. Three Kanban columns: To Do / In Progress / Done
4. "In Progress" cards can show header images

**Key UX Notes:**
- Search bar: `bg-surface`, `border-radius: radius-full`, magnifier icon prefix
- Sidebar has additional items: Calendar, Study Groups, Grades (vs Dashboard sidebar)
- Column card counts shown next to column title

---

### Screen 4 — Analytics Overview

**Layout:** Top nav bar (Pattern B) + single column content  
**Sections:**
1. Page title + subtitle + Week/Month/Semester tabs
2. 4 stat cards (Total Hours, Avg Focus, Tasks Done, Streak)
3. Row: Weekly Study Hours bar chart + Subject Distribution donut
4. Full-width: 30-Day Activity bar + line chart
5. Bottom row: AI Learning Insight card (left) + Focus Areas card (right)

**Key UX Notes:**
- Stat cards on Analytics use `UPPERCASE` label style (different from Dashboard)
- Focus Areas card has "ATTENTION NEEDED" badge in orange/red top-right
- AI insight highlights subject names in brand/orange color inline within paragraph text
- `Adjust Schedule` + `Dismiss` buttons on AI card

---

### Screen 5 — GPA Predictor

**Layout:** Top nav bar + single column  
**Sections:**
1. Page title + semester dropdown (top)
2. Left panel: Target CGPA slider + insight text box + 3 summary stat cards
3. Right panel: Grade Distribution donut chart
4. Full-width: Course Performance table with pagination

**Key UX Notes:**
- Semester selector: dropdown with calendar icon, `bg-surface`, `border-radius: radius-full`
- Insight text box inside slider card: light bulb icon, indigo bg, highlighted subject names in orange
- `+ Add Course` link top-right of performance table
- Table pagination: "Showing 4 of 6 courses" + Previous/Next buttons

---

### Screen 6 — AI Study Coach

**Layout:** Hybrid (top bar + slim left icon rail + chat + right plan panel)  
**Sections:**
1. Top bar with chat controls (history icon, overflow menu)
2. Slim left icon rail (4 icons: grid, robot, notes, calendar + settings at bottom)
3. Main chat area (scrollable messages)
4. "Generate Weekly Plan" CTA centered above input
5. Input bar (full-width, bottom)
6. Right panel: "This Week's Plan" — day-by-day schedule cards

**Key UX Notes:**
- Left icon rail is very slim (~48px), only icons (no labels)
- Bot name shown above each bot message: "ScholarSync AI"
- Disclaimer at very bottom: "ScholarSync AI can make mistakes..." — `text-muted`, centered
- Weekly Streak card at very bottom of right panel: trophy icon, day count, week comparison

---

## 5. Motion & Animation Guidelines

| Interaction | Animation | Duration | Easing |
|-------------|-----------|----------|--------|
| Page transition | Fade in + slide up 8px | 200ms | `ease-out` |
| Card hover | Scale `1.01` + shadow lift | 150ms | `ease-out` |
| Modal open | Scale `0.96 → 1` + fade | 200ms | `ease-out` |
| Drawer slide-in | Slide from right | 250ms | `ease-out` |
| Timer ring progress | SVG stroke-dashoffset | Real-time | `linear` |
| Streak counter update | Bounce scale `1 → 1.2 → 1` | 400ms | `spring` |
| Heatmap cell hover | Scale `1 → 1.3` + brightness | 100ms | `ease` |
| Button press | Scale `1 → 0.97` | 100ms | `ease-in` |
| FAB appear | Scale `0 → 1` + fade | 300ms | `spring` |

---

## 6. Responsive Breakpoints

| Breakpoint | Width | Changes |
|------------|-------|---------|
| Desktop XL | 1440px+ | Full layout, all panels visible |
| Desktop | 1200px | Default design target |
| Tablet | 768px | Sidebar collapses to icon-only; right panels hidden |
| Mobile | 375px | Bottom tab nav; single column; timer fills screen |

---

## 7. Iconography

- **Icon set:** Lucide Icons (consistent throughout)
- **Sizes used:** `16px` (inline/label), `18px` (nav), `20px` (card icon), `24px` (FAB, buttons)
- **Icon color:** matches text color of context (`text-secondary` default, `white` on colored bg)
- **Nav icons:** each section has a unique Lucide icon (grid for Dashboard, book for Exams, etc.)

---

## 8. Implementation Notes

### Tailwind CSS Custom Tokens
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#5B5BD6',
          secondary: '#7C3AED',
        },
        surface: {
          base: '#0D0D14',
          DEFAULT: '#13131F',
          raised: '#1A1A2E',
          input: '#1E1E30',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '18px',
      }
    }
  }
}
```

### CSS Variables
```css
:root {
  --color-bg-base: #0D0D14;
  --color-bg-surface: #13131F;
  --color-bg-raised: #1A1A2E;
  --color-brand: #5B5BD6;
  --color-brand-alt: #7C3AED;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #A0A0B8;
  --color-text-muted: #5E5E7A;
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;
}
```

---

*ScholarSync Design Documentation — v1.0 | Extracted from Google Stitch AI-generated designs*
