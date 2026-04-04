import { create } from 'zustand'
import type {
  SupportEmail,
  IssueCluster,
  DashboardStats,
  ScreenId,
  TonePreset,
  SweepPhase,
  SweepStepData,
} from './types'

const SCREEN_ORDER: ScreenId[] = ['deploy', 'sweep', 'brief', 'rules', 'command']

export interface MissionPreset {
  id: string
  label: string
  description: string
  icon: string
  selected: boolean
}

export interface Guardrail {
  id: string
  label: string
  enabled: boolean
}

export interface AgentRules {
  autoApproveThreshold: number
  requireReviewForCancellations: boolean
  alwaysEscalateAngry: boolean
  routeCriticalBugsToEngineering: boolean
  tone: TonePreset
}

export interface SweepProgress {
  phase: SweepPhase
  steps: SweepStepData[]
  syncResult?: { synced: number; total: number }
  classifyResult?: { classified: number; failed: number; draftsGenerated: number; total: number }
  clusterResult?: { clusters: number; processedEmails?: number }
  error?: string
}

export interface DispatchStore {
  // Navigation
  currentScreen: ScreenId
  screenHistory: ScreenId[]
  transitionDirection: 'forward' | 'backward'
  navigateTo: (screen: ScreenId) => void

  // Deploy
  missionPresets: MissionPreset[]
  guardrails: Guardrail[]
  togglePreset: (id: string) => void
  toggleGuardrail: (id: string) => void
  dataSource: 'gmail' | 'demo' | null
  setDataSource: (source: 'gmail' | 'demo') => void

  // Sweep
  sweepProgress: SweepProgress
  setSweepPhase: (phase: SweepPhase) => void
  addSweepStep: (step: SweepStepData) => void
  updateSweepStep: (id: string, update: Partial<SweepStepData>) => void
  setSweepResult: (key: 'syncResult' | 'classifyResult' | 'clusterResult', value: unknown) => void
  setSweepError: (error: string) => void

  // Data cache
  emails: SupportEmail[]
  clusters: IssueCluster[]
  stats: DashboardStats | null
  gmailConnected: boolean
  setEmails: (emails: SupportEmail[]) => void
  setClusters: (clusters: IssueCluster[]) => void
  setStats: (stats: DashboardStats | null) => void
  setGmailConnected: (connected: boolean) => void

  // Rules
  agentRules: AgentRules
  setAgentRules: (rules: Partial<AgentRules>) => void

  // Command deck
  selectedEmailId: string | null
  commandFilter: string
  approvingEmailId: string | null
  selectEmail: (id: string | null) => void
  setCommandFilter: (filter: string) => void
  setApprovingEmailId: (id: string | null) => void

  // Flash
  flashMessage: string | null
  flashError: string | null
  setFlashMessage: (msg: string | null) => void
  setFlashError: (msg: string | null) => void

  // Loading
  loading: boolean
  setLoading: (loading: boolean) => void
}

const DEFAULT_PRESETS: MissionPreset[] = [
  { id: 'workload', label: 'Reduce support workload', description: 'Auto-handle repetitive tickets so your team focuses on what matters', icon: 'Zap', selected: false },
  { id: 'reply', label: 'Reply to repetitive requests', description: 'Draft responses for common questions and known issues', icon: 'MessageSquare', selected: false },
  { id: 'escalate', label: 'Escalate anything risky', description: 'Flag angry, urgent, or high-value conversations immediately', icon: 'AlertTriangle', selected: false },
  { id: 'surface', label: 'Surface product issues fast', description: 'Detect recurring patterns and cluster them into incidents', icon: 'Layers', selected: false },
]

const DEFAULT_GUARDRAILS: Guardrail[] = [
  { id: 'no-auto-send', label: 'Never send without approval', enabled: true },
  { id: 'auto-draft', label: 'Auto-draft refunds and cancellations', enabled: true },
  { id: 'escalate-angry', label: 'Escalate angry or urgent messages', enabled: true },
]

const DEFAULT_RULES: AgentRules = {
  autoApproveThreshold: 0.9,
  requireReviewForCancellations: true,
  alwaysEscalateAngry: true,
  routeCriticalBugsToEngineering: true,
  tone: 'calm',
}

export const useDispatchStore = create<DispatchStore>((set, get) => ({
  // Navigation
  currentScreen: 'deploy',
  screenHistory: ['deploy'],
  transitionDirection: 'forward',
  navigateTo: (screen) => {
    const { currentScreen, screenHistory } = get()
    const currentIdx = SCREEN_ORDER.indexOf(currentScreen)
    const targetIdx = SCREEN_ORDER.indexOf(screen)
    const direction = targetIdx >= currentIdx ? 'forward' : 'backward'
    const history = screenHistory.includes(screen) ? screenHistory : [...screenHistory, screen]
    set({ currentScreen: screen, screenHistory: history, transitionDirection: direction })
  },

  // Deploy
  missionPresets: DEFAULT_PRESETS,
  guardrails: DEFAULT_GUARDRAILS,
  togglePreset: (id) =>
    set((s) => ({
      missionPresets: s.missionPresets.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p)),
    })),
  toggleGuardrail: (id) =>
    set((s) => ({
      guardrails: s.guardrails.map((g) => (g.id === id ? { ...g, enabled: !g.enabled } : g)),
    })),
  dataSource: null,
  setDataSource: (source) => set({ dataSource: source }),

  // Sweep
  sweepProgress: { phase: 'idle', steps: [] },
  setSweepPhase: (phase) => set((s) => ({ sweepProgress: { ...s.sweepProgress, phase } })),
  addSweepStep: (step) =>
    set((s) => ({ sweepProgress: { ...s.sweepProgress, steps: [...s.sweepProgress.steps, step] } })),
  updateSweepStep: (id, update) =>
    set((s) => ({
      sweepProgress: {
        ...s.sweepProgress,
        steps: s.sweepProgress.steps.map((st) => (st.id === id ? { ...st, ...update } : st)),
      },
    })),
  setSweepResult: (key, value) =>
    set((s) => ({ sweepProgress: { ...s.sweepProgress, [key]: value } })),
  setSweepError: (error) =>
    set((s) => ({ sweepProgress: { ...s.sweepProgress, phase: 'error', error } })),

  // Data cache
  emails: [],
  clusters: [],
  stats: null,
  gmailConnected: false,
  setEmails: (emails) => set({ emails }),
  setClusters: (clusters) => set({ clusters }),
  setStats: (stats) => set({ stats }),
  setGmailConnected: (connected) => set({ gmailConnected: connected }),

  // Rules
  agentRules: DEFAULT_RULES,
  setAgentRules: (rules) => set((s) => ({ agentRules: { ...s.agentRules, ...rules } })),

  // Command deck
  selectedEmailId: null,
  commandFilter: 'all',
  approvingEmailId: null,
  selectEmail: (id) => set({ selectedEmailId: id }),
  setCommandFilter: (filter) => set({ commandFilter: filter }),
  setApprovingEmailId: (id) => set({ approvingEmailId: id }),

  // Flash
  flashMessage: null,
  flashError: null,
  setFlashMessage: (msg) => set({ flashMessage: msg }),
  setFlashError: (msg) => set({ flashError: msg }),

  // Loading
  loading: true,
  setLoading: (loading) => set({ loading }),
}))
