# Dispatch V7 Implementation Plan
## From Scrolling Dashboard to 5-Screen Agentic Command Center

---

## 1. Architecture Overview

### Current State (V6)
- Single `page.tsx` with 14 `useState` hooks rendering a scrolling dashboard
- All state management inline, no store
- 7 dashboard components in `src/components/dashboard/`
- 1 layout component (`header.tsx`)
- 9 shadcn/ui components available
- Design tokens in CSS custom properties (`--dispatch-*`)
- Zustand v5.0.12 installed but unused

### Target State (V7)
- `page.tsx` becomes a thin shell rendering the active screen
- Single Zustand store manages all app state including current screen
- 5 screen components in `src/components/screens/`
- Floating bottom nav in `src/components/layout/`
- Reusable sub-components extracted as needed
- Each screen fills 100vh, no scroll, 16:9 optimized
- CSS transitions between screens (no router)

### File Structure After V7

```
src/
  app/
    page.tsx                    ← MODIFY: thin shell, renders current screen
    layout.tsx                  ← MODIFY: add overflow-hidden to body
    globals.css                 ← MODIFY: add screen transition animations + new utility classes
  lib/
    store.ts                    ← CREATE: Zustand store
    types.ts                    ← MODIFY: add new types for screens, rules, sweep state
    utils.ts                    ← KEEP: unchanged
    constants.ts                ← MODIFY: add screen constants
    api.ts                      ← CREATE: extracted fetch/post helpers from page.tsx
    routing.ts                  ← KEEP: unchanged
    db.ts                       ← KEEP: unchanged
    ai.ts                       ← KEEP: unchanged
    gmail.ts                    ← KEEP: unchanged
    seed-data.ts                ← KEEP: unchanged
  components/
    screens/
      deploy-screen.tsx         ← CREATE: Screen 1 - Mission Handoff
      sweep-screen.tsx          ← CREATE: Screen 2 - Live Sweep
      brief-screen.tsx          ← CREATE: Screen 3 - Agent Brief
      rules-screen.tsx          ← CREATE: Screen 4 - Rules of Engagement
      command-screen.tsx         ← CREATE: Screen 5 - Command Deck
    layout/
      bottom-nav.tsx            ← CREATE: Floating bottom pill nav
      header.tsx                ← KEEP: preserved for potential reuse in command-screen
      screen-shell.tsx          ← CREATE: shared 100vh container with transitions
    dashboard/
      (all existing files)      ← KEEP: reuse in command-screen where applicable
    command/
      queue-panel.tsx           ← CREATE: Ready to Send / Needs Review / Escalation panels
      incident-card.tsx         ← CREATE: cluster-as-case card
      email-row.tsx             ← CREATE: compact email row for command deck
      activity-feed.tsx         ← CREATE: "Dispatch is doing now" side panel
      email-action-bar.tsx      ← CREATE: approve/edit/override/escalate/silence actions
    sweep/
      action-log.tsx            ← CREATE: streaming action log entries
      progress-ring.tsx         ← CREATE: visual progress indicator
    brief/
      narrative-block.tsx       ← CREATE: "I reviewed X emails" narrative item
      summary-card.tsx          ← CREATE: Handled | Needs Judgment | Recurring Incident cards
      hero-cluster.tsx          ← CREATE: biggest pattern hero card
    deploy/
      mission-preset.tsx        ← CREATE: selectable mission preset card
      guardrail-toggle.tsx      ← CREATE: guardrail toggle row
```

---

## 2. Zustand Store Schema

**File: `src/lib/store.ts`**

```typescript
import { create } from 'zustand'
import type {
  SupportEmail, IssueCluster, DashboardStats, GmailStatus,
  Category, Urgency, Sentiment, EmailStatus
} from './types'

// Screen identifiers
export type ScreenId = 'deploy' | 'sweep' | 'brief' | 'rules' | 'command'

// Mission presets selected on the deploy screen
export interface MissionPreset {
  id: string
  label: string
  description: string
  icon: string  // lucide icon name
  selected: boolean
}

// Guardrail toggles from deploy screen
export interface Guardrail {
  id: string
  label: string
  enabled: boolean
}

// Individual step in the sweep action log
export interface SweepStep {
  id: string
  label: string
  status: 'pending' | 'running' | 'done' | 'error'
  detail?: string       // e.g. "47 conversations read"
  timestamp?: number
}

// Sweep progress aggregate
export interface SweepProgress {
  phase: 'idle' | 'syncing' | 'classifying' | 'clustering' | 'complete' | 'error'
  steps: SweepStep[]
  syncResult?: { synced: number; total: number }
  classifyResult?: { classified: number; failed: number; draftsGenerated: number; total: number }
  clusterResult?: { clusters: number; processedEmails?: number }
  error?: string
}

// Rules of Engagement from Screen 4
export interface AgentRules {
  autoApproveThreshold: number       // 0.0 to 1.0, default 0.9
  requireReviewForCancellations: boolean
  alwaysEscalateAngry: boolean
  routeCriticalBugsToEngineering: boolean
  tone: 'calm' | 'apologetic' | 'concise' | 'premium'
}

// The full store
export interface DispatchStore {
  // Navigation
  currentScreen: ScreenId
  screenHistory: ScreenId[]
  transitionDirection: 'forward' | 'backward'
  navigateTo: (screen: ScreenId) => void

  // Deploy screen state
  missionPresets: MissionPreset[]
  guardrails: Guardrail[]
  togglePreset: (id: string) => void
  toggleGuardrail: (id: string) => void
  dataSource: 'gmail' | 'demo' | null

  // Sweep screen state
  sweepProgress: SweepProgress
  setSweepProgress: (progress: Partial<SweepProgress>) => void
  addSweepStep: (step: SweepStep) => void
  updateSweepStep: (id: string, update: Partial<SweepStep>) => void

  // Data cache (replaces useState hooks in page.tsx)
  emails: SupportEmail[]
  clusters: IssueCluster[]
  stats: DashboardStats | null
  gmailConnected: boolean
  setEmails: (emails: SupportEmail[]) => void
  setClusters: (clusters: IssueCluster[]) => void
  setStats: (stats: DashboardStats | null) => void
  setGmailConnected: (connected: boolean) => void

  // Rules screen state
  agentRules: AgentRules
  setAgentRules: (rules: Partial<AgentRules>) => void

  // Command screen state
  selectedEmailId: string | null
  statusFilter: string
  approvingEmailId: string | null
  selectEmail: (id: string | null) => void
  setStatusFilter: (filter: string) => void
  setApprovingEmailId: (id: string | null) => void

  // Flash messages
  flashMessage: string | null
  flashError: string | null
  setFlashMessage: (msg: string | null) => void
  setFlashError: (msg: string | null) => void

  // Loading states
  loading: boolean
  setLoading: (loading: boolean) => void
}
```

Key design decisions for the store:
- `screenHistory` enables the bottom nav to know which screens have been visited (gating forward-only navigation until the sweep has run).
- `transitionDirection` drives CSS animation direction (slide-left for forward, slide-right for backward).
- `navigateTo` computes direction by comparing screen indices and pushes to history.
- `sweepProgress` contains the full state machine for the live sweep, including individual step statuses.
- `agentRules` persists the user's policy choices from Screen 4, used to filter/sort the command deck in Screen 5.
- The data cache (`emails`, `clusters`, `stats`) replaces the 14 useState hooks in the current page.tsx.

Default values:
- `currentScreen: 'deploy'`
- `missionPresets`: 4 presets all unselected
- `guardrails`: 3 guardrails, "Never send without approval" enabled by default
- `agentRules`: `{ autoApproveThreshold: 0.9, requireReviewForCancellations: true, alwaysEscalateAngry: true, routeCriticalBugsToEngineering: true, tone: 'calm' }`
- `sweepProgress`: `{ phase: 'idle', steps: [] }`

---

## 3. New Types

**Additions to `src/lib/types.ts`:**

```typescript
// Add to existing file:
export type ScreenId = 'deploy' | 'sweep' | 'brief' | 'rules' | 'command'

export type TonePreset = 'calm' | 'apologetic' | 'concise' | 'premium'

export type SweepPhase = 'idle' | 'syncing' | 'classifying' | 'clustering' | 'complete' | 'error'

export interface SweepStepData {
  id: string
  label: string
  status: 'pending' | 'running' | 'done' | 'error'
  detail?: string
  timestamp?: number
}
```

---

## 4. API Helper Extraction

**File: `src/lib/api.ts`** (extracted from page.tsx)

Extract the `fetchJson` and `postJson` helpers into a shared module. These are currently defined as local functions in page.tsx. The sweep screen and command screen both need them.

```typescript
export async function fetchJson<T>(url: string): Promise<T> { ... }
export async function postJson<T>(url: string, body?: unknown): Promise<T> { ... }
```

Also add typed wrappers for the specific API calls:

```typescript
export async function fetchAllData() { ... }  // parallel fetch of stats, emails, clusters, gmail status
export async function runSync() { ... }        // POST /api/gmail/sync
export async function runClassify() { ... }    // POST /api/emails/classify
export async function runCluster() { ... }     // POST /api/clusters
export async function seedDemo() { ... }       // POST /api/seed
export async function approveEmail(id: string) { ... }  // POST /api/emails/:id/approve
```

---

## 5. Screen-by-Screen Component Design

### 5.1 Screen Shell (`src/components/layout/screen-shell.tsx`)

A shared wrapper for all 5 screens that provides:
- `h-screen w-screen overflow-hidden` container
- CSS transition classes based on `transitionDirection` from the store
- The gold radial gradient ambient glow from the current body CSS (preserved)
- Grid overlay background (already on body via ::before pseudo)

Props: `{ children: ReactNode; className?: string }`

The transition mechanism: Each screen is wrapped in a div with a CSS class that animates on mount/unmount. Using the `tw-animate-css` library already imported, the animations available are `animate-in`, `fade-in`, `slide-in-from-*`, `zoom-in-*`. We apply:
- Forward navigation: new screen uses `animate-in fade-in-0 slide-in-from-right-4 duration-500`
- Backward navigation: new screen uses `animate-in fade-in-0 slide-in-from-left-4 duration-500`
- A `key={currentScreen}` on the transition wrapper forces React to unmount/remount, triggering the CSS animation.

No need for `AnimatePresence` or framer-motion; the tw-animate-css + key-based remount pattern is sufficient.

### 5.2 Screen 1: Deploy (`src/components/screens/deploy-screen.tsx`)

**Layout:** Full viewport, no scroll. CSS grid: `grid-cols-[1fr_1.2fr]` at xl, stacked at smaller breakpoints.

**Left column:**
- Dispatch logo block (reuse the "D" icon + Fraunces heading from header.tsx)
- `dispatch-kicker` text: "MISSION BRIEFING"
- Heading (font-heading): "Dispatch"
- Subheading: Brief description of the operator concept

**Right column:**
- Prompt-like card: "Connect your support inbox" (dispatch-panel-strong)
- Mission presets as 4 selectable cards (dispatch-panel with accent border when selected):
  - "Reduce support workload"
  - "Reply to repetitive requests"
  - "Escalate anything risky"
  - "Surface product issues fast"
  Each card: icon (lucide), title, 1-line description. Toggle on click. Selected state: `border-[var(--dispatch-accent)]` glow.
- Guardrail toggles (3 items):
  - "Never send without approval" (default on)
  - "Auto-draft refunds and cancellations"
  - "Escalate angry or urgent messages"
  Simple toggle rows with a custom styled checkbox/switch.
- Two CTA buttons at bottom:
  - Primary: "Start Sweep" (gold accent gradient, `dispatch-panel-strong` style) - calls `POST /api/seed` (demo path) or triggers Gmail OAuth
  - Secondary: "Connect Gmail Instead" or "Use Demo Data" (ghost style)

**Behavior:**
- "Start Sweep" with demo path: calls `POST /api/seed { reset: true }`, then `navigateTo('sweep')`
- "Connect Gmail" button: `window.location.assign('/api/gmail/connect')` (same as current)
- On return from Gmail OAuth, check `gmailConnected` and if true, auto-navigate to sweep
- Store the user's preset and guardrail selections in Zustand

**Sub-components:**
- `src/components/deploy/mission-preset.tsx` - Selectable card with icon, title, description, selected state
- `src/components/deploy/guardrail-toggle.tsx` - Toggle row with label and custom switch

### 5.3 Screen 2: Sweep (`src/components/screens/sweep-screen.tsx`)

**Layout:** Full viewport, centered content. Single column, max-w-2xl centered.

**Visual structure:**
- Top: "LIVE SWEEP" kicker + "Investigating your inbox" heading (font-heading)
- Center: Streaming action log with animated steps
- Bottom: Progress summary that fills in as steps complete

**Action log steps (sequential, shown one at a time as they execute):**
1. "Reading conversations" → calls `POST /api/gmail/sync` (or uses seeded data)
2. "Classifying messages" → calls `POST /api/emails/classify`
3. "Grouping recurring issues" → calls `POST /api/clusters`
4. "Generating draft responses" → (included in classify, just a display step)
5. "Preparing your briefing" → fetch all data, then auto-transition

Each step renders as a row:
- Spinner (animated) when `running`
- Checkmark when `done`
- Step label
- Detail text that fills in: "47 conversations read", "31 classified, 9 drafts generated"

**Progress visualization:**
- A vertical timeline/stepper with connecting lines
- Each completed step pulses green, current step has gold accent spinner
- Use `@keyframes` for the spinner (existing tw-animate-css has `animate-spin`)

**API call sequencing (in the sweep screen's useEffect):**

```typescript
// Step 1: Sync
updateStep('sync', { status: 'running', label: 'Reading conversations...' })
const syncResult = await postJson('/api/gmail/sync')  // or skip if demo
updateStep('sync', { status: 'done', detail: `${syncResult.total} conversations read` })

// Step 2: Classify
updateStep('classify', { status: 'running', label: 'Classifying messages...' })
const classifyResult = await postJson('/api/emails/classify')
updateStep('classify', { status: 'done', detail: `${classifyResult.classified} classified, ${classifyResult.draftsGenerated} drafts` })

// Step 3: Cluster
updateStep('cluster', { status: 'running', label: 'Grouping recurring issues...' })
const clusterResult = await postJson('/api/clusters')
updateStep('cluster', { status: 'done', detail: `${clusterResult.clusters} issue clusters detected` })

// Step 4: Fetch final data
updateStep('prepare', { status: 'running', label: 'Preparing your briefing...' })
const [stats, emails, clusters] = await fetchAllData()
// Store all in Zustand
updateStep('prepare', { status: 'done' })

// Auto-transition after 1.5s delay
setTimeout(() => navigateTo('brief'), 1500)
```

**For demo data path:** When `dataSource === 'demo'`, skip the sync step (data already seeded) and go straight to classify. Since seeded demo data is already classified, the classify call returns `{ classified: 0 }`. In this case, display "Loading pre-classified data..." and skip directly to fetching data. The sweep screen should detect this and accelerate through the steps with shorter delays to still feel agentic.

**Sub-components:**
- `src/components/sweep/action-log.tsx` - The vertical timeline of steps
- `src/components/sweep/progress-ring.tsx` - Optional circular progress indicator (simple CSS, not recharts)

### 5.4 Screen 3: Brief (`src/components/screens/brief-screen.tsx`)

**Layout:** Full viewport, centered. Max-w-4xl. Vertical stack.

**Structure:**
- Top: "AGENT BRIEF" kicker
- Centered narrative: Large font-heading text blocks that read as a narrative:
  - "I reviewed **47** support emails."
  - "**31** can be handled automatically."
  - "**9** need human review."
  - "**8** appear tied to the same checkout issue."
  Numbers are derived from the store's `stats`, `emails`, and `clusters`.

- Three dominant blocks in a `grid-cols-3` row:
  1. **Handled** (green accent): count of `auto_replied` + `resolved` emails, icon: CheckCircle
  2. **Needs Judgment** (gold accent): count of `needs_review` emails, icon: AlertTriangle
  3. **Recurring Incident** (coral accent): count of clusters, icon: Layers

  Each block is a `dispatch-panel` with a large number, label, and accent gradient header.

- Hero cluster card: The highest-severity cluster from `clusters[0]` (already sorted by severity from the API). Shows:
  - Cluster title
  - Severity badge
  - Email count
  - Suggested action
  - Trending indicator
  Uses `dispatch-panel-strong` with the severity border color from the existing `severityStyles` in cluster-alerts.tsx.

- CTA: "Set Rules" button (gold accent) → `navigateTo('rules')`

**Sub-components:**
- `src/components/brief/narrative-block.tsx` - Single narrative line with animated number
- `src/components/brief/summary-card.tsx` - The three Handled/Judgment/Incident cards
- `src/components/brief/hero-cluster.tsx` - The hero cluster card (adapted from cluster-alerts.tsx)

### 5.5 Screen 4: Rules (`src/components/screens/rules-screen.tsx`)

**Layout:** Full viewport, centered. Max-w-3xl. Vertical stack.

**Structure:**
- Top: "RULES OF ENGAGEMENT" kicker
- Heading: "Teach Dispatch how to operate" (font-heading)
- Subheading: "Based on the briefing, configure how aggressively Dispatch should act."

- **Confidence threshold slider:**
  - Label: "Auto-approve drafts above this confidence"
  - HTML range input styled with gold accent track
  - Value display: "90%" (maps to 0.9)
  - Uses a custom-styled `<input type="range">`

- **Toggle rules** (4 items, each a dispatch-panel row):
  1. "Require review for cancellations" (default: on)
  2. "Always escalate angry complaints" (default: on)
  3. "Route critical bug reports to engineering" (default: on)
  4. "Never send without human approval" (from deploy guardrails, carried over)

  Each toggle: Label on left, description below, custom switch on right. Use a styled `<button>` with `role="switch"` to avoid needing additional shadcn components.

- **Tone selector** (4 options as selectable pills):
  - Calm | Apologetic | Concise | Premium/High-touch
  - Styled as `dispatch-pill` with active state using gold accent border
  - Only one selected at a time (radio-like behavior)

- CTA: "Activate Dispatch" (gold accent, large) → `navigateTo('command')`

**State:** All selections stored in `agentRules` in the Zustand store.

### 5.6 Screen 5: Command Deck (`src/components/screens/command-screen.tsx`)

**Layout:** Full viewport. CSS grid: `grid-cols-[1fr_340px]` at xl. The left side is the main operational area, the right side is the activity feed.

This is the most complex screen and reuses/adapts several existing dashboard components.

**Left column - Main operational area:**

Top section: 4 queue panels in a `grid-cols-2 xl:grid-cols-4` row:
1. **Ready to Send** - Emails with status `auto_replied` and confidence >= threshold
2. **Needs Review** - Emails with status `needs_review`
3. **Escalations** - Emails routed to Senior Support or Manager
4. **Incidents** - Active clusters (from `clusters` in store)

Each queue panel: `dispatch-panel` with count badge, accent color matching the queue type, and click to filter the email list below.

Middle section: Filtered email list (compact rows, not the full table):
- Reuses the filtering/sorting logic from `inbox-table.tsx` but with a more compact row design
- Each row: urgency dot, from, subject (truncated), category badge, confidence %, action buttons
- Action buttons inline: Approve (green), Edit (gold), Escalate (coral), Silence (muted)
- Clicking a row expands an inline detail panel (adapted from `email-detail.tsx`)

Bottom section: Active incidents (adapted from `cluster-alerts.tsx`):
- Clusters displayed as "cases" with severity, email count, trending indicator, suggested action
- Each incident is expandable to show the linked emails

**Right column - Activity Feed:**
- "DISPATCH IS DOING NOW" kicker
- Scrollable list of recent actions (auto-approve events, routing decisions, draft generations)
- This is a synthetic feed built from the emails data (sorted by receivedAt, showing status changes)
- Each entry: timestamp, icon, description, confidence badge

**How the command deck replaces the old inbox table:**
- The inbox table's grid layout (`grid-cols-[44px_minmax(0,1.4fr)_100px_92px_86px_110px]`) is replaced by a more compact layout with inline actions
- The filtering UI (status pills, category/urgency/sort dropdowns) moves into the queue panel click-to-filter behavior
- The email detail dialog is now an inline expansion rather than a separate section below the table
- The stats cards, category chart, urgency chart, and routing queue are NOT directly reused on the command deck; their data is synthesized into the queue panels and activity feed
- The cluster alerts component logic is reused for the incidents section

**Reuse from existing components:**
- `CATEGORY_STYLES`, `URGENCY_COLORS`, `SENTIMENT_COLORS`, `STATUS_STYLES` from `inbox-table.tsx` / `constants.ts` - extracted to constants
- Severity styling from `cluster-alerts.tsx` - reused for incident cards
- Approve button pattern from `email-detail.tsx` - adapted for inline action bar
- `fetchJson`/`postJson` helpers - moved to `api.ts`

**Sub-components:**
- `src/components/command/queue-panel.tsx` - Ready to Send / Needs Review / Escalation / Incident count panel
- `src/components/command/email-row.tsx` - Compact email row with inline actions
- `src/components/command/incident-card.tsx` - Cluster-as-case card
- `src/components/command/activity-feed.tsx` - Right sidebar feed
- `src/components/command/email-action-bar.tsx` - Approve/Edit/Escalate/Silence buttons

### 5.7 Bottom Nav (`src/components/layout/bottom-nav.tsx`)

**Layout:** Fixed at bottom center of viewport. `fixed bottom-6 left-1/2 -translate-x-1/2 z-50`.

**Design:** Floating pill shape. `dispatch-panel-strong` background with strong backdrop-blur. Rounded-full. Height ~48px.

**Content:** 5 nav items in a row:
1. Deploy (Rocket icon)
2. Sweep (Radar icon)
3. Brief (FileText icon)
4. Rules (Shield icon)
5. Command (LayoutDashboard icon)

Each item: Icon + label text (small). Active state: gold accent color + subtle gold glow background. Inactive: muted text color.

**Behavior:**
- Visible on all 5 screens
- Items before `screenHistory`'s furthest-reached screen are clickable (can go back)
- Items beyond current screen are disabled/dimmed until visited
- Exception: once sweep completes, all subsequent screens unlock
- Clicking calls `navigateTo(screen)` which also sets `transitionDirection`

**Current screen indicator:** A small dot or underline below the active icon using `bg-[var(--dispatch-accent)]`.

---

## 6. CSS and Animation Approach

### globals.css additions

Add to the `@layer components` section:

```css
/* Screen transition container */
.screen-enter-forward {
  animation: slideInFromRight 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.screen-enter-backward {
  animation: slideInFromLeft 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideInFromRight {
  from { opacity: 0; transform: translateX(40px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes slideInFromLeft {
  from { opacity: 0; transform: translateX(-40px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* Sweep step animations */
.sweep-step-enter {
  animation: fadeSlideUp 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Pulse glow for active/running states */
.pulse-gold {
  animation: pulseGold 2s ease-in-out infinite;
}
@keyframes pulseGold {
  0%, 100% { box-shadow: 0 0 0 0 rgba(243, 179, 107, 0.2); }
  50% { box-shadow: 0 0 20px 4px rgba(243, 179, 107, 0.15); }
}

/* Brief screen number count-up animation */
.number-reveal {
  animation: numberReveal 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes numberReveal {
  from { opacity: 0; transform: translateY(8px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Bottom nav pill */
.bottom-nav-pill {
  @apply dispatch-panel-strong rounded-full;
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.5),
    0 0 30px rgba(243, 179, 107, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
```

### Transition approach

Instead of page routes or complex animation libraries, use a key-based remount pattern:

```tsx
// In page.tsx
const { currentScreen, transitionDirection } = useDispatchStore()

<div
  key={currentScreen}
  className={transitionDirection === 'forward' ? 'screen-enter-forward' : 'screen-enter-backward'}
>
  {currentScreen === 'deploy' && <DeployScreen />}
  {currentScreen === 'sweep' && <SweepScreen />}
  {/* ... etc */}
</div>
```

When `currentScreen` changes, React unmounts the old screen and mounts the new one, triggering the CSS animation. This is simple, performant, and avoids animation library dependencies.

### layout.tsx changes

Add `overflow-hidden` to the body to prevent any scroll:

```tsx
<body className="min-h-full flex flex-col overflow-hidden">
```

---

## 7. page.tsx Transformation

The current 200-line page.tsx becomes approximately 40 lines:

```tsx
'use client'

import { useEffect } from 'react'
import { useDispatchStore } from '@/lib/store'
import { fetchAllData } from '@/lib/api'
import { DeployScreen } from '@/components/screens/deploy-screen'
import { SweepScreen } from '@/components/screens/sweep-screen'
import { BriefScreen } from '@/components/screens/brief-screen'
import { RulesScreen } from '@/components/screens/rules-screen'
import { CommandScreen } from '@/components/screens/command-screen'
import { BottomNav } from '@/components/layout/bottom-nav'

const SCREENS = {
  deploy: DeployScreen,
  sweep: SweepScreen,
  brief: BriefScreen,
  rules: RulesScreen,
  command: CommandScreen,
} as const

export default function App() {
  const { currentScreen, transitionDirection, setGmailConnected, setLoading } = useDispatchStore()

  // Check Gmail status on mount (needed for deploy screen)
  useEffect(() => {
    fetch('/api/gmail/status')
      .then(r => r.json())
      .then(data => setGmailConnected(data.connected))
      .finally(() => setLoading(false))
  }, [])

  const ScreenComponent = SCREENS[currentScreen]

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div
        key={currentScreen}
        className={transitionDirection === 'forward' ? 'screen-enter-forward' : 'screen-enter-backward'}
      >
        <ScreenComponent />
      </div>
      <BottomNav />
    </div>
  )
}
```

---

## 8. Implementation Order

The implementation should proceed in this sequence, with each step producing a working (if incomplete) application:

### Phase 1: Foundation (do first)
1. **`src/lib/api.ts`** - Extract fetchJson/postJson + typed API wrappers from page.tsx
2. **`src/lib/types.ts`** - Add ScreenId, SweepPhase, SweepStepData, TonePreset types
3. **`src/lib/store.ts`** - Create full Zustand store with all slices
4. **`src/components/layout/screen-shell.tsx`** - Shared 100vh screen wrapper
5. **`src/app/globals.css`** - Add screen transition animations, sweep animations, bottom-nav styles
6. **`src/app/layout.tsx`** - Add overflow-hidden to body

### Phase 2: Navigation Chrome
7. **`src/components/layout/bottom-nav.tsx`** - Floating pill nav
8. **`src/app/page.tsx`** - Transform into thin shell with screen switching

### Phase 3: Screens (in flow order)
9. **Screen 1 - Deploy:**
   - `src/components/deploy/mission-preset.tsx`
   - `src/components/deploy/guardrail-toggle.tsx`
   - `src/components/screens/deploy-screen.tsx`

10. **Screen 2 - Sweep:**
    - `src/components/sweep/action-log.tsx`
    - `src/components/sweep/progress-ring.tsx`
    - `src/components/screens/sweep-screen.tsx`

11. **Screen 3 - Brief:**
    - `src/components/brief/narrative-block.tsx`
    - `src/components/brief/summary-card.tsx`
    - `src/components/brief/hero-cluster.tsx`
    - `src/components/screens/brief-screen.tsx`

12. **Screen 4 - Rules:**
    - `src/components/screens/rules-screen.tsx` (self-contained, no sub-components needed)

13. **Screen 5 - Command:**
    - `src/components/command/queue-panel.tsx`
    - `src/components/command/email-row.tsx`
    - `src/components/command/incident-card.tsx`
    - `src/components/command/activity-feed.tsx`
    - `src/components/command/email-action-bar.tsx`
    - `src/components/screens/command-screen.tsx`

### Phase 4: Polish
14. Verify all screen transitions are smooth
15. Ensure bottom nav state gating works correctly
16. Test demo data path end-to-end (deploy -> sweep -> brief -> rules -> command)
17. Test Gmail OAuth path (deploy -> Gmail connect -> return -> sweep -> ...)
18. Responsive verification at standard breakpoints

---

## 9. Detailed Component Props and Data Flow

### Deploy Screen Data Flow
```
User selects presets/guardrails → store.togglePreset / store.toggleGuardrail
User clicks "Start Sweep" →
  if demo: POST /api/seed → store.dataSource = 'demo' → store.navigateTo('sweep')
  if gmail: window.location.assign('/api/gmail/connect') → (callback) → store.dataSource = 'gmail' → store.navigateTo('sweep')
```

### Sweep Screen Data Flow
```
On mount: read store.dataSource
  if 'demo': seeded data already exists, run classify + cluster + fetch
  if 'gmail': run sync + classify + cluster + fetch
Each API call updates store.sweepProgress with step statuses
Results stored in store.emails / store.clusters / store.stats
On complete: setTimeout → store.navigateTo('brief')
```

### Brief Screen Data Flow
```
Reads from store: emails, clusters, stats
Derives:
  - handledCount = emails.filter(e => e.status === 'auto_replied' || e.status === 'resolved').length
  - reviewCount = emails.filter(e => e.status === 'needs_review').length
  - incidentCount = clusters.length
  - heroCluster = clusters[0] (highest severity)
  - narrativeLines computed from these
No API calls, pure read from cached store data
```

### Rules Screen Data Flow
```
Reads store.agentRules for initial values
User interactions update store via setAgentRules
No API calls, purely local state
CTA navigates to command screen
```

### Command Screen Data Flow
```
Reads from store: emails, clusters, stats, agentRules
Queue panels compute counts by filtering emails:
  - readyToSend = emails.filter(e => e.status === 'auto_replied' && e.confidence >= agentRules.autoApproveThreshold)
  - needsReview = emails.filter(e => e.status === 'needs_review')
  - escalations = emails.filter(e => ['Senior Support', 'Manager'].includes(e.assignedTo))
  - incidents = clusters
Click queue panel → sets statusFilter in store → email list filters
Email actions (approve, escalate) call API endpoints, then refetch data
Activity feed: sorted list of emails by receivedAt showing their status/routing
```

---

## 10. Key Design Decisions and Tradeoffs

### Why no React Router / Next.js routes?
The 5 screens are a single-page wizard flow, not independent pages. Using filesystem routes would break the shared Zustand state, require URL management, and add unnecessary navigation complexity. The screen-switching pattern with key-based remount + CSS transitions is simpler and matches the "command center" mental model where you never leave the app.

### Why extract API helpers to a shared module?
Three screens need to call APIs (deploy, sweep, command). Duplicating fetchJson/postJson is fragile. The typed wrappers also centralize error handling.

### Why not use AnimatePresence / Framer Motion?
The project has no animation library dependency and tw-animate-css already provides the CSS animation utilities. Adding framer-motion (37KB gzipped) for simple slide transitions is unnecessary. The CSS keyframe approach is zero-overhead and the visual result is equivalent.

### Why keep existing dashboard components?
The command deck reuses patterns and constants from the existing components but with different layouts. Rather than refactoring existing components to be "generic", it is cleaner to create purpose-built command deck components that share constants/styles but have their own rendering logic. The old dashboard components can be deleted later if not needed, but keeping them avoids risk during the transition.

### How to handle the Gmail OAuth redirect?
The current OAuth flow redirects the browser. When the user returns, page.tsx checks gmail status. In V7, we need the deploy screen to detect the return. Solution: on mount, check `window.location.search` for OAuth callback parameters OR simply check `GET /api/gmail/status` and if connected + currentScreen is still 'deploy', auto-navigate to sweep.

### Responsive design for 100vh screens?
At small viewports (mobile), the 100vh constraint becomes tight. The deploy and rules screens can safely stack vertically with `overflow-y-auto` at breakpoints below `lg`. The sweep and brief screens are naturally compact. The command deck at small viewports should switch to a tab-based layout rather than side-by-side panels.

---

## 11. Files Summary

### Files to CREATE (19 new files):
1. `src/lib/store.ts` - Zustand store
2. `src/lib/api.ts` - API helper functions
3. `src/components/layout/screen-shell.tsx` - Screen wrapper
4. `src/components/layout/bottom-nav.tsx` - Floating navigation
5. `src/components/screens/deploy-screen.tsx` - Screen 1
6. `src/components/screens/sweep-screen.tsx` - Screen 2
7. `src/components/screens/brief-screen.tsx` - Screen 3
8. `src/components/screens/rules-screen.tsx` - Screen 4
9. `src/components/screens/command-screen.tsx` - Screen 5
10. `src/components/deploy/mission-preset.tsx` - Mission card
11. `src/components/deploy/guardrail-toggle.tsx` - Toggle row
12. `src/components/sweep/action-log.tsx` - Step timeline
13. `src/components/sweep/progress-ring.tsx` - Progress indicator
14. `src/components/brief/narrative-block.tsx` - Narrative line
15. `src/components/brief/summary-card.tsx` - Summary block
16. `src/components/brief/hero-cluster.tsx` - Hero cluster card
17. `src/components/command/queue-panel.tsx` - Queue count panel
18. `src/components/command/email-row.tsx` - Compact email row
19. `src/components/command/incident-card.tsx` - Cluster case card
20. `src/components/command/activity-feed.tsx` - Activity sidebar
21. `src/components/command/email-action-bar.tsx` - Action buttons

### Files to MODIFY (4 files):
1. `src/app/page.tsx` - Transform from dashboard to screen shell
2. `src/app/layout.tsx` - Add overflow-hidden
3. `src/app/globals.css` - Add animations and utility classes
4. `src/lib/types.ts` - Add new type definitions

### Files to KEEP UNCHANGED (all API routes + existing components):
- All `src/app/api/**` routes
- All `src/components/dashboard/**` (preserved for reference and potential reuse)
- All `src/components/ui/**` (shadcn components)
- `src/lib/routing.ts`, `src/lib/db.ts`, `src/lib/ai.ts`, `src/lib/gmail.ts`, `src/lib/seed-data.ts`, `src/lib/constants.ts`
- `src/components/layout/header.tsx` (preserved, may be adapted into deploy screen)
