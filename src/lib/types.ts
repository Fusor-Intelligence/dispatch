export type Category = 'refund' | 'cancellation' | 'bug_report' | 'feature_request' | 'general_inquiry' | 'complaint'
export type Urgency = 'low' | 'medium' | 'high' | 'critical'
export type Sentiment = 'positive' | 'neutral' | 'negative' | 'angry'
export type EmailStatus = 'new' | 'auto_replied' | 'routed' | 'needs_review' | 'resolved'
export type Severity = 'low' | 'medium' | 'high' | 'critical'

export interface SupportEmail {
  id: string
  gmailId: string
  threadId: string
  from: string
  subject: string
  body: string
  receivedAt: string
  category: Category | null
  urgency: Urgency | null
  sentiment: Sentiment | null
  confidence: number
  summary: string | null
  status: EmailStatus
  assignedTo: string | null
  autoReplyDraft: string | null
  clusterId: string | null
}

export interface IssueCluster {
  id: string
  title: string
  category: string
  emailCount: number
  firstSeen: string
  lastSeen: string
  severity: Severity
  trending: boolean
  suggestedAction: string
  emailIds: string[]
}

export interface ClassificationResult {
  category: Category
  urgency: Urgency
  sentiment: Sentiment
  confidence: number
  summary: string
}

export interface DashboardStats {
  totalEmails: number
  autoResolved: number
  avgResponseTime: number
  openIssues: number
  supportDebt: number
  categoryBreakdown: Record<Category, number>
  urgencyBreakdown: Record<Urgency, number>
  routingQueue: Record<string, number>
}

export interface CountRow {
  count: number
}

export interface GmailSyncEmail {
  gmailId: string
  threadId: string
  from: string
  subject: string
  body: string
  receivedAt: string
}

export interface GmailStatus {
  connected: boolean
}

// V7 Screen types
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
