'use client'

import { useDeferredValue, useState } from 'react'
import type { SupportEmail } from '@/lib/types'

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  refund:          { bg: '#1e1e3e', text: '#818cf8', border: '#818cf8' },
  bug_report:      { bg: '#2a1a1a', text: '#f87171', border: '#f87171' },
  cancellation:    { bg: '#1a1a2e', text: '#c084fc', border: '#c084fc' },
  feature_request: { bg: '#0a1a1a', text: '#2dd4bf', border: '#2dd4bf' },
  general_inquiry: { bg: '#1a1a1e', text: '#94a3b8', border: '#94a3b8' },
  complaint:       { bg: '#2a1a0a', text: '#fb923c', border: '#fb923c' },
}

const CATEGORY_LABELS: Record<string, string> = {
  refund:          'Refund',
  bug_report:      'Bug',
  cancellation:    'Cancel',
  feature_request: 'Feature',
  general_inquiry: 'Inquiry',
  complaint:       'Complaint',
}

const URGENCY_COLORS: Record<string, string> = {
  critical: '#f3755c',
  high:     '#f3b36b',
  medium:   '#f8e08f',
  low:      '#4b5a6e',
}

const URGENCY_LEFT_BORDER: Record<string, string> = {
  critical: '#f3755c',
  high:     '#f3b36b',
  medium:   '#f8e08f',
  low:      '#2e3d50',
}

const SENTIMENT_COLORS: Record<string, string> = {
  angry:    '#f87171',
  negative: '#fb923c',
  neutral:  '#6b6b80',
  positive: '#4ade80',
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  auto_replied: { bg: '#064e3b', text: '#34d399', label: 'Auto-Replied' },
  routed:       { bg: '#1e1b4b', text: '#818cf8', label: 'Routed' },
  needs_review: { bg: '#451a03', text: '#fb923c', label: 'Review' },
  new:          { bg: '#1e1e2e', text: '#6b6b80', label: 'New' },
  resolved:     { bg: '#064e3b', text: '#34d399', label: 'Resolved' },
}

const URGENCY_RANK: Record<string, number> = {
  critical: 4,
  high:     3,
  medium:   2,
  low:      1,
}

// Category order for grouped display
const CATEGORY_ORDER = [
  'bug_report',
  'complaint',
  'refund',
  'cancellation',
  'feature_request',
  'general_inquiry',
]

const STATUS_FILTERS = [
  { key: 'all',          label: 'All' },
  { key: 'needs_review', label: 'Review' },
  { key: 'auto_replied', label: 'Auto-Replied' },
  { key: 'routed',       label: 'Routed' },
]

const URGENCY_OPTIONS = [
  { key: 'all',      label: 'All' },
  { key: 'critical', label: 'Critical' },
  { key: 'high',     label: 'High' },
  { key: 'medium',   label: 'Medium' },
  { key: 'low',      label: 'Low' },
]

const SORT_OPTIONS = [
  { key: 'newest',     label: 'Newest' },
  { key: 'oldest',     label: 'Oldest' },
  { key: 'urgency',    label: 'Urgency' },
  { key: 'confidence', label: 'Confidence' },
]

interface InboxTableProps {
  emails: SupportEmail[]
  selectedEmail: SupportEmail | null
  onSelectEmail: (email: SupportEmail | null) => void
  statusFilter: string
  onFilterChange: (filter: string) => void
  busy: boolean
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 60) return `${mins}m`
  if (hours < 24) return `${hours}h`
  return `${days}d`
}

function senderInitial(from: string): string {
  const name = from.split('@')[0].replace(/[._+]/g, ' ').trim()
  return name.charAt(0).toUpperCase()
}

// Derive a consistent accent color for a sender from category
function avatarColor(email: SupportEmail): string {
  const catStyle = CATEGORY_STYLES[email.category ?? 'general_inquiry'] ?? CATEGORY_STYLES.general_inquiry
  return catStyle.border
}

export function InboxTable({
  emails,
  selectedEmail,
  onSelectEmail,
  statusFilter,
  onFilterChange,
  busy,
}: InboxTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const deferredSearchQuery = useDeferredValue(searchQuery)

  const normalizedQuery = deferredSearchQuery.trim().toLowerCase()

  const visibleEmails = emails
    .filter((email) => {
      if (statusFilter !== 'all' && email.status !== statusFilter) return false
      if (urgencyFilter !== 'all' && email.urgency !== urgencyFilter) return false
      if (!normalizedQuery) return true
      return [email.from, email.subject, email.summary ?? '', email.assignedTo ?? ''].some(
        (v) => v.toLowerCase().includes(normalizedQuery),
      )
    })
    .slice()
    .sort((a, b) => {
      if (sortBy === 'oldest')
        return new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime()
      if (sortBy === 'confidence')
        return (b.confidence ?? 0) - (a.confidence ?? 0)
      if (sortBy === 'urgency')
        return (URGENCY_RANK[b.urgency ?? 'low'] ?? 0) - (URGENCY_RANK[a.urgency ?? 'low'] ?? 0)
      return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
    })

  // Group emails by category for section headers
  const grouped: { category: string; items: SupportEmail[] }[] = []
  const seen = new Set<string>()

  // First pass: ordered categories
  for (const cat of CATEGORY_ORDER) {
    const items = visibleEmails.filter((e) => e.category === cat)
    if (items.length > 0) {
      grouped.push({ category: cat, items })
      seen.add(cat)
    }
  }
  // Catch-all for uncategorized
  const rest = visibleEmails.filter((e) => !seen.has(e.category ?? ''))
  if (rest.length > 0) {
    grouped.push({ category: 'pending', items: rest })
  }

  const SECTION_LABEL: Record<string, string> = {
    bug_report:      'Bug Reports',
    complaint:       'Complaints',
    refund:          'Refunds',
    cancellation:    'Cancellations',
    feature_request: 'Feature Requests',
    general_inquiry: 'General Inquiry',
    pending:         'Uncategorized',
  }

  return (
    <div className="dispatch-panel flex h-full min-h-0 overflow-hidden">
      {/* ── Left: email list ─────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Search + filter bar */}
        <div
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          className="flex flex-col gap-2 px-4 py-3"
        >
          {/* Search input */}
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search emails…"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              outline: 'none',
              color: '#eef4fb',
            }}
            className="w-full rounded-none px-3 py-2 text-sm placeholder:text-[#4e6070] focus:border-b-[rgba(243,179,107,0.35)]"
          />

          {/* Filter pills row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {/* Status filters */}
            <div className="flex gap-1">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => onFilterChange(f.key)}
                  style={
                    statusFilter === f.key
                      ? {
                          background: 'rgba(243,179,107,0.13)',
                          color: '#ffdcb3',
                          border: '1px solid rgba(243,179,107,0.32)',
                        }
                      : {
                          background: 'rgba(255,255,255,0.03)',
                          color: '#6c8099',
                          border: '1px solid rgba(255,255,255,0.07)',
                        }
                  }
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] transition-colors"
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Urgency pills */}
            <div className="flex gap-1">
              {URGENCY_OPTIONS.map((u) => (
                <button
                  key={u.key}
                  onClick={() => setUrgencyFilter(u.key)}
                  style={
                    urgencyFilter === u.key
                      ? {
                          background: u.key !== 'all'
                            ? `${URGENCY_COLORS[u.key]}22`
                            : 'rgba(255,255,255,0.08)',
                          color: u.key !== 'all' ? URGENCY_COLORS[u.key] : '#d8e1ea',
                          border: `1px solid ${u.key !== 'all' ? URGENCY_COLORS[u.key] + '55' : 'rgba(255,255,255,0.2)'}`,
                        }
                      : {
                          background: 'transparent',
                          color: '#4e6070',
                          border: '1px solid rgba(255,255,255,0.05)',
                        }
                  }
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] transition-colors"
                >
                  {u.label}
                </button>
              ))}
            </div>

            {/* Sort — right-aligned */}
            <div className="ml-auto flex gap-1">
              {SORT_OPTIONS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSortBy(s.key)}
                  style={
                    sortBy === s.key
                      ? { color: '#9fb0c5', borderBottom: '1px solid rgba(159,176,197,0.4)' }
                      : { color: '#3d5065', borderBottom: '1px solid transparent' }
                  }
                  className="pb-px text-[10px] uppercase tracking-[0.14em] transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Busy banner */}
        {busy && (
          <div
            style={{ borderBottom: '1px solid rgba(122,169,219,0.14)', background: 'rgba(122,169,219,0.07)' }}
            className="px-4 py-1.5 text-[11px] text-[#a8caec]"
          >
            Refreshing queue…
          </div>
        )}

        {/* Email list — scrollable */}
        <div className="flex-1 overflow-y-auto">
          {visibleEmails.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-[#4e6070]">
              {emails.length === 0
                ? 'No emails found. Sync inbox or load demo data.'
                : 'No emails match the current filters.'}
            </div>
          ) : (
            grouped.map(({ category, items }) => (
              <div key={category}>
                {/* Section header */}
                <div
                  style={{
                    fontSize: '9px',
                    letterSpacing: '0.3em',
                    color: 'rgba(255,255,255,0.22)',
                    background: 'rgba(255,255,255,0.02)',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    padding: '7px 16px',
                    textTransform: 'uppercase',
                    userSelect: 'none',
                  }}
                >
                  {SECTION_LABEL[category] ?? category} — {items.length}
                </div>

                {/* Rows */}
                {items.map((email) => {
                  const isSelected = selectedEmail?.id === email.id
                  const urgencyKey = email.urgency ?? 'low'
                  const borderColor = isSelected
                    ? URGENCY_LEFT_BORDER[urgencyKey]
                    : `${URGENCY_LEFT_BORDER[urgencyKey]}66`

                  return (
                    <div
                      key={email.id}
                      onClick={() => onSelectEmail(isSelected ? null : email)}
                      style={{
                        borderLeft: `2px solid ${borderColor}`,
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        background: isSelected
                          ? 'rgba(243,179,107,0.06)'
                          : undefined,
                        transition: 'background 0.15s, border-color 0.15s',
                        minHeight: '52px',
                        cursor: 'pointer',
                      }}
                      className={
                        isSelected ? 'px-4 py-3' : 'px-4 py-3 hover:bg-[rgba(255,255,255,0.03)]'
                      }
                    >
                      <div className="flex items-center gap-3">
                        {/* Sender name */}
                        <span
                          className="min-w-0 shrink-0 text-[13px] font-medium text-[#e8ddd0]"
                          style={{ width: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {email.from.split('@')[0].replace(/[._+]/g, ' ')}
                        </span>

                        {/* Subject */}
                        <span
                          className="min-w-0 flex-1 truncate text-[12px] text-[#5e7489]"
                        >
                          {email.subject}
                        </span>

                        {/* Timestamp */}
                        <span
                          className="shrink-0 font-mono text-[10px] text-[#374a5c]"
                        >
                          {formatTime(email.receivedAt)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Right: sticky detail panel ───────────────────────────── */}
      <div
        style={{
          width: '380px',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {selectedEmail ? (
          <EmailDetailPanel
            email={selectedEmail}
            onClose={() => onSelectEmail(null)}
          />
        ) : (
          <EmptyDetailState />
        )}
      </div>
    </div>
  )
}

// ── Detail panel ──────────────────────────────────────────────────────────────

function EmailDetailPanel({
  email,
  onClose,
}: {
  email: SupportEmail
  onClose: () => void
}) {
  const urgencyKey = email.urgency ?? 'low'
  const catKey = email.category ?? 'general_inquiry'
  const catStyle = CATEGORY_STYLES[catKey] ?? CATEGORY_STYLES.general_inquiry
  const catLabel = CATEGORY_LABELS[catKey] ?? 'Pending'
  const urgencyColor = URGENCY_COLORS[urgencyKey] ?? URGENCY_COLORS.low
  const statusStyle = STATUS_STYLES[email.status] ?? STATUS_STYLES.new
  const sentColor = SENTIMENT_COLORS[email.sentiment ?? 'neutral'] ?? SENTIMENT_COLORS.neutral
  const initLetter = senderInitial(email.from)
  const accentColor = avatarColor(email)

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Avatar + sender block */}
      <div
        style={{
          padding: '28px 24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: `linear-gradient(160deg, ${accentColor}0d 0%, transparent 60%)`,
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            float: 'right',
            color: '#4e6070',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            lineHeight: 1,
            marginTop: '-4px',
          }}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Avatar circle */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: `${accentColor}22`,
            border: `1.5px solid ${accentColor}55`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 300,
            color: accentColor,
            marginBottom: '16px',
            letterSpacing: '-0.01em',
          }}
        >
          {initLetter}
        </div>

        {/* Sender name */}
        <div
          style={{
            fontSize: '24px',
            fontWeight: 300,
            letterSpacing: '-0.02em',
            color: '#f4efe7',
            lineHeight: 1.2,
            marginBottom: '6px',
          }}
        >
          {email.from.split('@')[0].replace(/[._+]/g, ' ')}
        </div>
        <div
          style={{
            fontSize: '11px',
            color: '#4e6070',
            marginBottom: '12px',
            fontFamily: 'monospace',
          }}
        >
          {email.from}
        </div>

        {/* Subject */}
        <div
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: '#8ea0b5',
            lineHeight: 1.4,
            marginBottom: '14px',
          }}
        >
          {email.subject}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <span
            style={{
              background: catStyle.bg,
              color: catStyle.text,
              border: `1px solid ${catStyle.border}33`,
              fontSize: '9px',
              letterSpacing: '0.18em',
              padding: '3px 8px',
              borderRadius: '999px',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            {catLabel}
          </span>
          <span
            style={{
              background: `${urgencyColor}1a`,
              color: urgencyColor,
              border: `1px solid ${urgencyColor}44`,
              fontSize: '9px',
              letterSpacing: '0.18em',
              padding: '3px 8px',
              borderRadius: '999px',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            {urgencyKey}
          </span>
          <span
            style={{
              background: statusStyle.bg,
              color: statusStyle.text,
              fontSize: '9px',
              letterSpacing: '0.16em',
              padding: '3px 8px',
              borderRadius: '999px',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            {statusStyle.label}
          </span>
          {email.sentiment && (
            <span
              style={{
                background: 'rgba(255,255,255,0.04)',
                color: sentColor,
                fontSize: '9px',
                letterSpacing: '0.14em',
                padding: '3px 8px',
                borderRadius: '999px',
                textTransform: 'capitalize',
                fontWeight: 500,
              }}
            >
              {email.sentiment}
            </span>
          )}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '16px 24px' }}>
        {/* AI analysis */}
        {(email.summary || email.confidence) && (
          <div
            style={{
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(8,14,21,0.6)',
              padding: '12px 14px',
              marginBottom: '14px',
            }}
          >
            <div
              style={{
                fontSize: '9px',
                letterSpacing: '0.28em',
                color: '#7ea8d9',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              AI Analysis
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <div style={{ color: '#4e6070', fontSize: '10px' }}>Confidence</div>
                <div style={{ color: '#d8e1ea', fontWeight: 500, fontFamily: 'monospace' }}>
                  {Math.round((email.confidence ?? 0) * 100)}%
                </div>
              </div>
              {email.assignedTo && (
                <div>
                  <div style={{ color: '#4e6070', fontSize: '10px' }}>Assigned</div>
                  <div style={{ color: '#d8e1ea', fontWeight: 500 }}>{email.assignedTo}</div>
                </div>
              )}
            </div>
            {email.summary && (
              <div
                style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  lineHeight: 1.6,
                  color: '#9fb0c5',
                }}
              >
                {email.summary}
              </div>
            )}
          </div>
        )}

        {/* Email body */}
        <div
          style={{
            fontSize: '12px',
            lineHeight: 1.75,
            color: '#8ea0b5',
            whiteSpace: 'pre-wrap',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(255,255,255,0.02)',
            padding: '12px 14px',
            marginBottom: '14px',
          }}
        >
          {email.body}
        </div>

        {/* AI draft reply */}
        {email.autoReplyDraft && (
          <div style={{ marginBottom: '14px' }}>
            <div
              style={{
                fontSize: '9px',
                letterSpacing: '0.28em',
                color: '#6ee7a0',
                textTransform: 'uppercase',
                marginBottom: '6px',
              }}
            >
              AI Draft Reply
            </div>
            <div
              style={{
                fontSize: '12px',
                lineHeight: 1.75,
                color: '#c8d3de',
                whiteSpace: 'pre-wrap',
                borderRadius: '12px',
                border: '1px solid #1a3d28',
                background: 'linear-gradient(180deg, rgba(12,30,20,0.94), rgba(8,19,14,0.92))',
                padding: '12px 14px',
              }}
            >
              {email.autoReplyDraft}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div
        style={{
          padding: '14px 24px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          gap: '8px',
        }}
      >
        <button
          style={{
            flex: 1,
            background: 'rgba(120,217,156,0.12)',
            border: '1px solid rgba(50,123,82,0.5)',
            color: '#79d99c',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 600,
            padding: '8px 12px',
            cursor: 'pointer',
            letterSpacing: '0.06em',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(120,217,156,0.2)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(120,217,156,0.12)'
          }}
        >
          Reply with AI
        </button>
        <button
          style={{
            flex: 1,
            background: 'rgba(243,117,92,0.1)',
            border: '1px solid rgba(243,117,92,0.3)',
            color: '#f3755c',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 600,
            padding: '8px 12px',
            cursor: 'pointer',
            letterSpacing: '0.06em',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(243,117,92,0.18)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(243,117,92,0.1)'
          }}
        >
          Escalate
        </button>
        <button
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#4e6070',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 600,
            padding: '8px 14px',
            cursor: 'pointer',
            letterSpacing: '0.06em',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

function EmptyDetailState() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
        textAlign: 'center',
        gap: '10px',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '4px',
        }}
      >
        <span style={{ fontSize: '20px', opacity: 0.3 }}>✉</span>
      </div>
      <div
        style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.18)',
          letterSpacing: '0.04em',
        }}
      >
        Select an email
      </div>
      <div
        style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.09)',
          letterSpacing: '0.02em',
          lineHeight: 1.5,
        }}
      >
        Click any row in the list
        <br />
        to view the full detail here.
      </div>
    </div>
  )
}
