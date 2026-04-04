'use client'

import type { SupportEmail } from '@/lib/types'

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  refund: { bg: '#1e1e3e', text: '#818cf8' },
  bug_report: { bg: '#2a1a1a', text: '#f87171' },
  cancellation: { bg: '#1a1a2e', text: '#c084fc' },
  feature_request: { bg: '#0a1a1a', text: '#2dd4bf' },
  general_inquiry: { bg: '#1a1a1e', text: '#94a3b8' },
  complaint: { bg: '#2a1a0a', text: '#fb923c' },
}

const CATEGORY_LABELS: Record<string, string> = {
  refund: 'Refund',
  bug_report: 'Bug',
  cancellation: 'Cancel',
  feature_request: 'Feature',
  general_inquiry: 'Inquiry',
  complaint: 'Complaint',
}

const URGENCY_COLORS: Record<string, string> = {
  critical: '#dc2626',
  high: '#f97316',
  medium: '#eab308',
  low: '#6b6b80',
}

const SENTIMENT_COLORS: Record<string, string> = {
  angry: '#f87171',
  negative: '#fb923c',
  neutral: '#6b6b80',
  positive: '#4ade80',
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  auto_replied: { bg: '#064e3b', text: '#34d399', label: 'Auto-Replied' },
  routed: { bg: '#1e1b4b', text: '#818cf8', label: 'Routed' },
  needs_review: { bg: '#451a03', text: '#fb923c', label: 'Review' },
  new: { bg: '#1e1e2e', text: '#6b6b80', label: 'New' },
  resolved: { bg: '#064e3b', text: '#34d399', label: 'Resolved' },
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'needs_review', label: 'Needs Review' },
  { key: 'auto_replied', label: 'Auto-Replied' },
  { key: 'routed', label: 'Routed' },
]

interface InboxTableProps {
  emails: SupportEmail[]
  selectedEmail: SupportEmail | null
  onSelectEmail: (email: SupportEmail | null) => void
  statusFilter: string
  onFilterChange: (filter: string) => void
}

export function InboxTable({ emails, selectedEmail, onSelectEmail, statusFilter, onFilterChange }: InboxTableProps) {
  return (
    <div className="dispatch-panel overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-[rgba(255,255,255,0.08)] px-5 py-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="dispatch-kicker mb-2">Triage Queue</div>
          <div className="text-xl font-semibold text-[#f4efe7]">Inbox</div>
          <div className="mt-1 text-sm text-[#94a3b8]">{emails.length} emails in the current view.</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors ${
                statusFilter === f.key
                  ? 'border-[rgba(243,179,107,0.38)] bg-[rgba(243,179,107,0.15)] text-[#ffdcb3]'
                  : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[#9fb0c5] hover:bg-[rgba(255,255,255,0.06)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[44px_minmax(0,1.4fr)_100px_92px_86px_110px] items-center gap-3 border-b border-[rgba(255,255,255,0.06)] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#66788e]">
        <span>Urgency</span>
        <span>From / Subject</span>
        <span>Category</span>
        <span>Sentiment</span>
        <span>Confidence</span>
        <span>Status</span>
      </div>

      {emails.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-[#8ea0b5]">
          No emails found. Click &quot;Sync Inbox&quot; to load data.
        </div>
      ) : (
        emails.map((email) => {
          const urgencyColor = email.urgency ? (URGENCY_COLORS[email.urgency] || URGENCY_COLORS.low) : URGENCY_COLORS.low
          const catStyle = email.category ? (CATEGORY_STYLES[email.category] || CATEGORY_STYLES.general_inquiry) : CATEGORY_STYLES.general_inquiry
          const sentColor = email.sentiment ? (SENTIMENT_COLORS[email.sentiment] || SENTIMENT_COLORS.neutral) : SENTIMENT_COLORS.neutral
          const statusStyle = STATUS_STYLES[email.status] || STATUS_STYLES.new
          const isSelected = selectedEmail?.id === email.id

          return (
            <div
              key={email.id}
              onClick={() => onSelectEmail(isSelected ? null : email)}
              className={`grid grid-cols-[44px_minmax(0,1.4fr)_100px_92px_86px_110px] items-center gap-3 border-b border-[rgba(255,255,255,0.05)] px-5 py-4 text-[13px] transition-colors ${
                isSelected
                  ? 'bg-[linear-gradient(90deg,_rgba(243,179,107,0.10),_rgba(255,255,255,0.03))]'
                  : 'cursor-pointer hover:bg-[rgba(255,255,255,0.035)]'
              }`}
            >
              <div className="flex flex-col items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-[#74869b]">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    background: urgencyColor,
                    boxShadow: email.urgency === 'critical' ? `0 0 10px ${urgencyColor}66` : 'none',
                  }}
                />
                <span>{email.urgency || 'new'}</span>
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="font-medium text-[#f4efe7]">{email.from}</span>
                  {email.assignedTo && (
                    <span className="rounded-full border border-[rgba(255,255,255,0.08)] px-2 py-0.5 text-[10px] text-[#93a6bb]">
                      {email.assignedTo}
                    </span>
                  )}
                </div>
                <div className="mt-1 whitespace-nowrap overflow-hidden text-ellipsis text-xs text-[#dce4ec]">
                  {email.subject}
                </div>
                <div className="mt-1 whitespace-nowrap overflow-hidden text-ellipsis text-xs text-[#71839a]">
                  {email.summary || 'Awaiting AI summary.'}
                </div>
              </div>
              <span
                className="rounded-full px-2.5 py-1 text-center text-[10px] font-semibold uppercase tracking-[0.16em]"
                style={{ background: catStyle.bg, color: catStyle.text }}
              >
                {email.category ? (CATEGORY_LABELS[email.category] || email.category) : 'Pending'}
              </span>
              <span className="text-[11px] capitalize font-medium" style={{ color: sentColor }}>
                {email.sentiment || 'pending'}
              </span>
              <span className="font-mono text-[#9fb0c5]">
                {Math.round((email.confidence || 0) * 100)}%
              </span>
              <span
                className="rounded-full px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-[0.16em]"
                style={{ background: statusStyle.bg, color: statusStyle.text }}
              >
                {statusStyle.label}
              </span>
            </div>
          )
        })
      )}
    </div>
  )
}
