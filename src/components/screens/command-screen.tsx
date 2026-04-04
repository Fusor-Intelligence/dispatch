'use client'

import { useState } from 'react'
import { ScreenShell } from '@/components/layout/screen-shell'
import { useDispatchStore } from '@/lib/store'
import { approveEmail, fetchAllData } from '@/lib/api'
import {
  Send,
  Eye,
  AlertTriangle,
  Layers,
  Check,
  ArrowUpRight,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SupportEmail, IssueCluster } from '@/lib/types'

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

const SEVERITY_STYLES: Record<string, { border: string; badge: string; badgeText: string }> = {
  critical: { border: '#f3755c', badge: '#f3755c', badgeText: '#fff5f3' },
  high: { border: '#f3b36b', badge: '#f3b36b', badgeText: '#2d1d0f' },
  medium: { border: '#f8e08f', badge: '#f8e08f', badgeText: '#2d2814' },
  low: { border: '#7f92a8', badge: '#7f92a8', badgeText: '#f8fafc' },
}

type QueueFilter = 'all' | 'ready' | 'review' | 'escalated' | 'incidents'

export function CommandScreen() {
  const {
    emails,
    clusters,
    stats,
    agentRules,
    gmailConnected,
    selectedEmailId,
    selectEmail,
    approvingEmailId,
    setApprovingEmailId,
    setEmails,
    setClusters,
    setStats,
    setGmailConnected,
    setFlashMessage,
    setFlashError,
  } = useDispatchStore()

  const [queueFilter, setQueueFilter] = useState<QueueFilter>('all')

  // Queue counts
  const readyToSend = emails.filter(
    (e) => e.status === 'auto_replied' && (e.confidence ?? 0) >= agentRules.autoApproveThreshold
  )
  const needsReview = emails.filter((e) => e.status === 'needs_review')
  const escalated = emails.filter((e) =>
    e.assignedTo === 'Senior Support' || e.assignedTo === 'Manager'
  )

  const filteredEmails =
    queueFilter === 'ready' ? readyToSend
    : queueFilter === 'review' ? needsReview
    : queueFilter === 'escalated' ? escalated
    : queueFilter === 'incidents' ? [] // incidents show clusters, not emails
    : emails

  const selectedEmail = emails.find((e) => e.id === selectedEmailId) ?? null

  const handleApprove = async (id: string) => {
    setApprovingEmailId(id)
    setFlashMessage(null)
    setFlashError(null)
    try {
      await approveEmail(id)
      const data = await fetchAllData()
      setEmails(data.emails)
      setClusters(data.clusters)
      setStats(data.stats)
      setGmailConnected(data.gmailConnected)
      setFlashMessage('Draft created in Gmail and email marked resolved.')
    } catch (err) {
      console.error('Failed to approve:', err)
      setFlashError(err instanceof Error ? err.message : 'Failed to create Gmail draft.')
    } finally {
      setApprovingEmailId(null)
    }
  }

  // Activity feed: recent emails sorted by date, showing their status
  const activityItems = [...emails]
    .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
    .slice(0, 12)

  return (
    <ScreenShell>
      <div className="flex h-full flex-col overflow-hidden px-4 pt-4 sm:px-6">
        {/* Header bar */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="dispatch-kicker mb-1">Supervision</div>
            <h2 className="font-heading text-2xl text-[#f6f1e8]">Command Deck</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="dispatch-pill">
              <span className={`h-2 w-2 rounded-full ${gmailConnected ? 'bg-[#6ee7b7]' : 'bg-[#fb923c]'}`} />
              {gmailConnected ? 'Live' : 'Demo mode'}
            </span>
            <span className="dispatch-pill">{emails.length} emails</span>
          </div>
        </div>

        {/* Queue panels */}
        <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <QueuePanel
            label="Ready to Send"
            count={readyToSend.length}
            icon={Send}
            color="#6ee7b7"
            accent="rgba(74,222,128,0.14)"
            active={queueFilter === 'ready'}
            onClick={() => setQueueFilter(queueFilter === 'ready' ? 'all' : 'ready')}
          />
          <QueuePanel
            label="Needs Review"
            count={needsReview.length}
            icon={Eye}
            color="#f3b36b"
            accent="rgba(243,179,107,0.14)"
            active={queueFilter === 'review'}
            onClick={() => setQueueFilter(queueFilter === 'review' ? 'all' : 'review')}
          />
          <QueuePanel
            label="Escalations"
            count={escalated.length}
            icon={AlertTriangle}
            color="#f3755c"
            accent="rgba(243,117,92,0.14)"
            active={queueFilter === 'escalated'}
            onClick={() => setQueueFilter(queueFilter === 'escalated' ? 'all' : 'escalated')}
          />
          <QueuePanel
            label="Incidents"
            count={clusters.length}
            icon={Layers}
            color="#818cf8"
            accent="rgba(129,140,248,0.14)"
            active={queueFilter === 'incidents'}
            onClick={() => setQueueFilter(queueFilter === 'incidents' ? 'all' : 'incidents')}
          />
        </div>

        {/* Main content grid */}
        <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[1fr_320px]">
          {/* Left: email list or incidents */}
          <div className="dispatch-panel flex flex-col overflow-hidden">
            {queueFilter === 'incidents' ? (
              <IncidentList clusters={clusters} />
            ) : (
              <>
                <div className="border-b border-[rgba(255,255,255,0.06)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#66788e]">
                  {queueFilter === 'all' ? 'All Emails' : queueFilter === 'ready' ? 'Ready to Send' : queueFilter === 'review' ? 'Needs Review' : 'Escalations'}
                  <span className="ml-2 text-[#9fb0c5]">({filteredEmails.length})</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {filteredEmails.length === 0 ? (
                    <div className="px-4 py-10 text-center text-sm text-[#6c7d92]">
                      No emails in this queue.
                    </div>
                  ) : (
                    filteredEmails.map((email) => (
                      <EmailRow
                        key={email.id}
                        email={email}
                        isSelected={selectedEmailId === email.id}
                        onSelect={() => selectEmail(selectedEmailId === email.id ? null : email.id)}
                        onApprove={() => handleApprove(email.id)}
                        approving={approvingEmailId === email.id}
                        gmailConnected={gmailConnected}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right: activity feed or email detail */}
          <div className="dispatch-panel flex flex-col overflow-hidden">
            {selectedEmail ? (
              <EmailDetailPanel
                email={selectedEmail}
                onClose={() => selectEmail(null)}
                onApprove={() => handleApprove(selectedEmail.id)}
                approving={approvingEmailId === selectedEmail.id}
                gmailConnected={gmailConnected}
              />
            ) : (
              <ActivityFeed items={activityItems} />
            )}
          </div>
        </div>
      </div>
    </ScreenShell>
  )
}

// --- Sub-components inlined for the command screen ---

function QueuePanel({
  label, count, icon: Icon, color, accent, active, onClick,
}: {
  label: string; count: number; icon: typeof Send; color: string; accent: string; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'dispatch-panel relative overflow-hidden p-4 text-left transition-all',
        active && 'border-[rgba(243,179,107,0.3)] shadow-[0_0_20px_rgba(243,179,107,0.06)]'
      )}
    >
      <div className="absolute inset-x-0 top-0 h-12" style={{ background: `linear-gradient(180deg, ${accent}, transparent)` }} />
      <div className="relative flex items-start justify-between">
        <div>
          <Icon size={16} style={{ color }} className="mb-2" />
          <div className="text-2xl font-semibold" style={{ color }}>{count}</div>
          <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#6c7d92]">{label}</div>
        </div>
      </div>
    </button>
  )
}

function EmailRow({
  email, isSelected, onSelect, onApprove, approving, gmailConnected,
}: {
  email: SupportEmail; isSelected: boolean; onSelect: () => void; onApprove: () => void; approving: boolean; gmailConnected: boolean
}) {
  const urgColor = URGENCY_COLORS[email.urgency ?? 'low'] ?? URGENCY_COLORS.low
  const catStyle = CATEGORY_STYLES[email.category ?? 'general_inquiry'] ?? CATEGORY_STYLES.general_inquiry

  return (
    <div
      className={cn(
        'border-b border-[rgba(255,255,255,0.05)] px-4 py-3 transition-colors',
        isSelected
          ? 'bg-[linear-gradient(90deg,_rgba(243,179,107,0.08),_transparent)]'
          : 'cursor-pointer hover:bg-[rgba(255,255,255,0.03)]'
      )}
    >
      <div className="flex items-center gap-3" onClick={onSelect}>
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: urgColor, boxShadow: email.urgency === 'critical' ? `0 0 8px ${urgColor}66` : 'none' }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-[#f4efe7]">{email.from}</span>
            {email.assignedTo && (
              <span className="rounded-full border border-[rgba(255,255,255,0.08)] px-2 py-0.5 text-[9px] text-[#93a6bb]">
                {email.assignedTo}
              </span>
            )}
          </div>
          <div className="mt-0.5 truncate text-xs text-[#dce4ec]">{email.subject}</div>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em]"
          style={{ background: catStyle.bg, color: catStyle.text }}
        >
          {CATEGORY_LABELS[email.category ?? ''] ?? 'Pending'}
        </span>
        <span className="shrink-0 font-mono text-[11px] text-[#6c7d92]">
          {Math.round((email.confidence ?? 0) * 100)}%
        </span>
      </div>

      {/* Inline actions */}
      {isSelected && (
        <div className="mt-2 flex items-center gap-2 pl-5">
          {email.autoReplyDraft && (email.status === 'needs_review' || email.status === 'auto_replied') && (
            <button
              onClick={(e) => { e.stopPropagation(); onApprove() }}
              disabled={approving || !gmailConnected}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#327b52] bg-[#79d99c] px-3 py-1 text-[10px] font-semibold text-[#0b160f] transition hover:bg-[#8fe3ad] disabled:opacity-50"
            >
              <Check size={12} />
              {approving ? 'Approving...' : 'Approve'}
            </button>
          )}
          <button className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.1)] px-3 py-1 text-[10px] font-medium text-[#9fb0c5] transition hover:bg-[rgba(255,255,255,0.05)]">
            <ArrowUpRight size={12} />
            Escalate
          </button>
        </div>
      )}
    </div>
  )
}

function IncidentList({ clusters }: { clusters: IssueCluster[] }) {
  if (clusters.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-sm text-[#6c7d92]">
        No active incidents detected.
      </div>
    )
  }
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="border-b border-[rgba(255,255,255,0.06)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#66788e]">
        Active Incidents <span className="ml-2 text-[#9fb0c5]">({clusters.length})</span>
      </div>
      {clusters.map((cluster) => {
        const style = SEVERITY_STYLES[cluster.severity] ?? SEVERITY_STYLES.low
        return (
          <div key={cluster.id} className="border-b border-[rgba(255,255,255,0.05)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-[#fff7ed]">{cluster.title}</div>
                <div className="mt-1 text-xs text-[#c8d3de]">
                  {cluster.emailCount} reports
                  {cluster.trending && <span className="ml-2 text-[#ffd5c7]">Trending</span>}
                </div>
              </div>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em]"
                style={{ background: style.badge, color: style.badgeText }}
              >
                {cluster.severity}
              </span>
            </div>
            <div className="mt-2 text-xs leading-5 text-[#a9b8c8]">
              <span className="font-semibold text-[#f3b36b]">Action:</span> {cluster.suggestedAction}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function EmailDetailPanel({
  email, onClose, onApprove, approving, gmailConnected,
}: {
  email: SupportEmail; onClose: () => void; onApprove: () => void; approving: boolean; gmailConnected: boolean
}) {
  return (
    <div className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] px-4 py-3">
        <div className="dispatch-kicker">Case Review</div>
        <button onClick={onClose} className="rounded-full p-1 text-[#6c7d92] transition hover:bg-[rgba(255,255,255,0.06)]">
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        <div className="text-sm font-semibold text-[#f4efe7]">{email.subject}</div>
        <div className="text-xs text-[#8ea0b5]">
          From: {email.from} &middot; {new Date(email.receivedAt).toLocaleString()}
        </div>

        <div className="rounded-[16px] border border-[rgba(255,255,255,0.07)] bg-[rgba(8,14,21,0.65)] p-3">
          <div className="dispatch-kicker mb-2 text-[10px] text-[#7ea8d9]">AI Analysis</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-[#72859b]">Category</span><div className="font-medium text-[#d8e1ea]">{email.category ?? 'Pending'}</div></div>
            <div><span className="text-[#72859b]">Urgency</span><div className="font-medium capitalize text-[#d8e1ea]">{email.urgency ?? 'pending'}</div></div>
            <div><span className="text-[#72859b]">Sentiment</span><div className="font-medium capitalize text-[#d8e1ea]">{email.sentiment ?? 'pending'}</div></div>
            <div><span className="text-[#72859b]">Confidence</span><div className="font-medium text-[#d8e1ea]">{Math.round((email.confidence ?? 0) * 100)}%</div></div>
          </div>
          {email.summary && (
            <div className="mt-2 text-xs leading-5 text-[#d8e1ea]">{email.summary}</div>
          )}
        </div>

        <div className="rounded-[16px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-3 text-xs leading-6 whitespace-pre-wrap text-[#c8d3de]">
          {email.body}
        </div>

        {email.autoReplyDraft && (
          <div>
            <div className="dispatch-kicker mb-1 text-[10px] text-[#90e5ac]">AI Draft Reply</div>
            <div className="rounded-[16px] border border-[#264731] bg-[linear-gradient(180deg,_rgba(12,30,20,0.94),_rgba(8,19,14,0.92))] p-3 text-xs leading-6 whitespace-pre-wrap text-[#d8e1ea]">
              {email.autoReplyDraft}
            </div>
            {(email.status === 'needs_review' || email.status === 'auto_replied') && (
              <button
                onClick={onApprove}
                disabled={approving || !gmailConnected}
                className="mt-2 rounded-full border border-[#327b52] bg-[#79d99c] px-4 py-1.5 text-[10px] font-semibold text-[#0b160f] transition hover:bg-[#8fe3ad] disabled:opacity-50"
              >
                {approving ? 'Creating Draft...' : 'Approve & Create Gmail Draft'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ActivityFeed({ items }: { items: SupportEmail[] }) {
  const STATUS_LABELS: Record<string, string> = {
    auto_replied: 'Auto-drafted reply',
    routed: 'Routed to team',
    needs_review: 'Flagged for review',
    resolved: 'Resolved',
    new: 'New email received',
  }

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="border-b border-[rgba(255,255,255,0.08)] px-4 py-3">
        <div className="dispatch-kicker text-[10px]">Dispatch Activity</div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {items.map((email) => (
          <div key={email.id} className="border-b border-[rgba(255,255,255,0.04)] px-4 py-3">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f3b36b]" />
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-[#d8e1ea]">
                  {STATUS_LABELS[email.status] ?? email.status}
                </div>
                <div className="mt-0.5 truncate text-[10px] text-[#6c7d92]">
                  {email.from} — {email.subject}
                </div>
                {email.assignedTo && (
                  <div className="mt-0.5 text-[10px] text-[#8ea0b5]">
                    → {email.assignedTo}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
