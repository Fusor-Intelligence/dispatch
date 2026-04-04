'use client'

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
  emails: any[]
  selectedEmail: any
  onSelectEmail: (email: any) => void
  statusFilter: string
  onFilterChange: (filter: string) => void
}

export function InboxTable({ emails, selectedEmail, onSelectEmail, statusFilter, onFilterChange }: InboxTableProps) {
  return (
    <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1e1e2e] flex justify-between items-center">
        <span className="text-sm font-semibold">Inbox ({emails.length} emails)</span>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={`text-[11px] px-2.5 py-1 rounded-xl cursor-pointer transition-colors ${
                statusFilter === f.key
                  ? 'bg-[#6366f1] text-white'
                  : 'bg-[#1e1e2e] text-[#a0a0b0] hover:bg-[#2a2a3a]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[32px_1fr_80px_70px_80px_90px] items-center px-5 py-2.5 text-[11px] text-[#4a4a5a] border-b border-[#1e1e2e] font-semibold gap-3">
        <span></span>
        <span>From / Subject</span>
        <span>Category</span>
        <span>Sentiment</span>
        <span>Confidence</span>
        <span>Status</span>
      </div>

      {emails.length === 0 ? (
        <div className="px-5 py-8 text-center text-[#6b6b80] text-sm">
          No emails found. Click &quot;Sync Inbox&quot; to load data.
        </div>
      ) : (
        emails.map((email) => {
          const urgencyColor = URGENCY_COLORS[email.urgency] || URGENCY_COLORS.low
          const catStyle = CATEGORY_STYLES[email.category] || CATEGORY_STYLES.general_inquiry
          const sentColor = SENTIMENT_COLORS[email.sentiment] || SENTIMENT_COLORS.neutral
          const statusStyle = STATUS_STYLES[email.status] || STATUS_STYLES.new
          const isSelected = selectedEmail?.id === email.id

          return (
            <div
              key={email.id}
              onClick={() => onSelectEmail(isSelected ? null : email)}
              className={`grid grid-cols-[32px_1fr_80px_70px_80px_90px] items-center px-5 py-3 border-b border-[#1a1a24] text-[13px] gap-3 cursor-pointer transition-colors ${
                isSelected ? 'bg-[#1a1a2e]' : 'hover:bg-[#16161f]'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: urgencyColor,
                  boxShadow: email.urgency === 'critical' ? `0 0 6px ${urgencyColor}66` : 'none',
                }}
              />
              <div className="overflow-hidden">
                <div className="font-medium text-[13px]">{email.from}</div>
                <div className="text-[#6b6b80] text-xs whitespace-nowrap overflow-hidden text-ellipsis">
                  {email.subject}
                </div>
              </div>
              <span
                className="text-[10px] px-2 py-0.5 rounded uppercase font-semibold"
                style={{ background: catStyle.bg, color: catStyle.text }}
              >
                {CATEGORY_LABELS[email.category] || email.category}
              </span>
              <span className="text-[11px] capitalize" style={{ color: sentColor }}>
                {email.sentiment}
              </span>
              <span className="text-[#6b6b80]">
                {Math.round((email.confidence || 0) * 100)}%
              </span>
              <span
                className="text-[10px] px-2 py-1 rounded text-center"
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
