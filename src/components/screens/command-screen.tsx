'use client'

import { useState } from 'react'
import { ScreenShell } from '@/components/layout/screen-shell'
import { useDispatchStore } from '@/lib/store'
import { approveEmail, fetchAllData } from '@/lib/api'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SupportEmail, IssueCluster } from '@/lib/types'

type TabId = 'all' | 'ready' | 'review' | 'escalated' | 'incidents'

const TABS: { id: TabId; label: string }[] = [
  { id: 'all',       label: 'All'       },
  { id: 'ready',     label: 'Send'      },
  { id: 'review',    label: 'Review'    },
  { id: 'escalated', label: 'Escalated' },
  { id: 'incidents', label: 'Incidents' },
]

const URGENCY_DOT: Record<string, string> = {
  critical: '#f3755c',
  high:     '#f3b36b',
  medium:   '#f8e08f',
  low:      '#444f5e',
}

const CATEGORY_LABEL: Record<string, string> = {
  refund:          'REFUND REQUEST',
  bug_report:      'BUG REPORT',
  cancellation:    'CANCELLATION',
  feature_request: 'FEATURE REQUEST',
  general_inquiry: 'GENERAL INQUIRY',
  complaint:       'COMPLAINT',
}

export function CommandScreen() {
  const {
    emails,
    clusters,
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

  const [tab, setTab] = useState<TabId>('all')
  const [weight, setWeight] = useState(285)
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null)

  // Filtered email buckets
  const readyEmails     = emails.filter(e => e.status === 'auto_replied' && (e.confidence ?? 0) >= agentRules.autoApproveThreshold)
  const reviewEmails    = emails.filter(e => e.status === 'needs_review')
  const escalatedEmails = emails.filter(e => e.assignedTo === 'Senior Support' || e.assignedTo === 'Manager')

  const listEmails =
    tab === 'ready'     ? readyEmails :
    tab === 'review'    ? reviewEmails :
    tab === 'escalated' ? escalatedEmails :
    tab === 'incidents' ? [] :
    emails

  const selectedEmail   = emails.find(e => e.id === selectedEmailId) ?? null
  const selectedCluster = clusters.find(c => c.id === selectedClusterId) ?? null

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
      setFlashMessage('Draft created in Gmail.')
    } catch (err) {
      setFlashError(err instanceof Error ? err.message : 'Failed.')
    } finally {
      setApprovingEmailId(null)
    }
  }

  return (
    <ScreenShell className="flex flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <div
        className="flex shrink-0 items-center justify-between px-6 pt-5 pb-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Logo */}
        <div
          style={{
            fontFamily: "'Apparat', system-ui, sans-serif",
            fontSize: '28px',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#f0f0f0',
          }}
        >
          Dispatch
        </div>

        {/* Weight slider */}
        <div className="flex items-center gap-4">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                fontFamily: "'Apparat', system-ui, sans-serif",
                fontSize: '9px', fontWeight: 600,
                letterSpacing: '0.28em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)',
              }}>Weight</span>
              <span style={{
                fontFamily: "'Apparat', system-ui, sans-serif",
                fontSize: '13px', fontWeight: 400,
                color: 'rgba(255,255,255,0.6)',
                minWidth: '28px', textAlign: 'right',
              }}>{weight}</span>
            </div>
            <input
              type="range"
              min={300} max={900} step={1}
              value={weight}
              onChange={e => setWeight(Number(e.target.value))}
              className="dispatch-slider"
              style={{ width: '200px' }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '7px 16px',
                borderRadius: '9999px',
                border: '1px solid',
                borderColor: tab === t.id ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)',
                background: tab === t.id ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                fontFamily: "'Apparat', system-ui, sans-serif",
                fontSize: '11px',
                fontWeight: tab === t.id ? 600 : 400,
                letterSpacing: '0.06em',
                color: tab === t.id ? '#f0f0f0' : 'rgba(255,255,255,0.35)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* Left column: email / cluster list */}
        <div
          className="flex flex-col overflow-hidden"
          style={{
            width: '320px',
            flexShrink: 0,
            borderRight: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Section label */}
          <div style={{
            padding: '12px 20px 8px',
            fontFamily: "'Apparat', system-ui, sans-serif",
            fontSize: '9px', fontWeight: 600,
            letterSpacing: '0.3em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.2)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}>
            {tab === 'incidents' ? 'Issues Tracking' : 'Client Email'}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {tab === 'incidents' ? (
              clusters.length === 0 ? (
                <EmptyState label="No active incidents." />
              ) : clusters.map(c => (
                <ClusterRow
                  key={c.id}
                  cluster={c}
                  isSelected={selectedClusterId === c.id}
                  onSelect={() => setSelectedClusterId(selectedClusterId === c.id ? null : c.id)}
                />
              ))
            ) : listEmails.length === 0 ? (
              <EmptyState label="No emails in this queue." />
            ) : listEmails.map(email => (
              <EmailBucketRow
                key={email.id}
                email={email}
                isSelected={selectedEmailId === email.id}
                onSelect={() => selectEmail(selectedEmailId === email.id ? null : email.id)}
              />
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

          {tab === 'incidents' && selectedCluster ? (
            /* Incident detail */
            <ClusterDetail cluster={selectedCluster} />
          ) : selectedEmail ? (
            <>
              {/* Email body — variable weight display */}
              <div
                className="flex-1 overflow-y-auto"
                style={{ padding: '28px 36px', minHeight: 0 }}
              >
                <div style={{
                  fontFamily: "'Apparat', system-ui, sans-serif",
                  fontSize: '10px', fontWeight: 500,
                  letterSpacing: '0.22em', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.28)',
                  marginBottom: '16px',
                }}>
                  {selectedEmail.from}
                </div>

                <div style={{
                  fontFamily: "'Apparat', system-ui, sans-serif",
                  fontSize: '26px',
                  fontWeight: weight,
                  lineHeight: 1.4,
                  letterSpacing: weight > 600 ? '-0.02em' : '-0.01em',
                  color: 'rgba(255,255,255,0.82)',
                  transition: 'font-weight 0.2s ease',
                  maxWidth: '720px',
                }}>
                  {selectedEmail.body}
                </div>
              </div>

              {/* Insight cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1px',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.06)',
                  flexShrink: 0,
                  height: '200px',
                }}
              >
                {/* Insight 01 — AI Classification */}
                <div style={{
                  background: '#0A0A0A',
                  padding: '20px 24px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    fontFamily: "'Apparat', system-ui, sans-serif",
                    fontSize: '9px', fontWeight: 600,
                    letterSpacing: '0.3em', textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.2)',
                    marginBottom: '14px',
                  }}>Insight 01</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
                    {[
                      ['Category', CATEGORY_LABEL[selectedEmail.category ?? ''] ?? 'Pending'],
                      ['Urgency',  (selectedEmail.urgency ?? 'pending').toUpperCase()],
                      ['Sentiment', (selectedEmail.sentiment ?? 'pending').toUpperCase()],
                      ['Confidence', `${Math.round((selectedEmail.confidence ?? 0) * 100)}%`],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div style={{
                          fontFamily: "'Apparat', system-ui, sans-serif",
                          fontSize: '9px', letterSpacing: '0.16em',
                          color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
                          marginBottom: '3px',
                        }}>{k}</div>
                        <div style={{
                          fontFamily: "'Apparat', system-ui, sans-serif",
                          fontSize: '13px', fontWeight: 500,
                          color: 'rgba(255,255,255,0.7)',
                          letterSpacing: '-0.01em',
                        }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Insight 02 — Summary + action */}
                <div style={{
                  background: '#0A0A0A',
                  padding: '20px 24px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    fontFamily: "'Apparat', system-ui, sans-serif",
                    fontSize: '9px', fontWeight: 600,
                    letterSpacing: '0.3em', textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.2)',
                    marginBottom: '14px',
                  }}>Insight 02</div>
                  {selectedEmail.summary ? (
                    <div style={{
                      fontFamily: "'Apparat', system-ui, sans-serif",
                      fontSize: '13px', fontWeight: 400,
                      lineHeight: 1.6,
                      color: 'rgba(255,255,255,0.55)',
                    }}>{selectedEmail.summary}</div>
                  ) : (
                    <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>No summary.</div>
                  )}
                  {/* Approve action */}
                  {selectedEmail.autoReplyDraft && (selectedEmail.status === 'needs_review' || selectedEmail.status === 'auto_replied') && (
                    <button
                      onClick={() => handleApprove(selectedEmail.id)}
                      disabled={approvingEmailId === selectedEmail.id || !gmailConnected}
                      style={{
                        marginTop: '14px',
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '7px 16px',
                        borderRadius: '9999px',
                        background: '#f3b36b',
                        color: '#0A0A0A',
                        fontFamily: "'Apparat', system-ui, sans-serif",
                        fontSize: '11px', fontWeight: 600,
                        letterSpacing: '0.1em', textTransform: 'uppercase',
                        border: 'none', cursor: 'pointer',
                        opacity: approvingEmailId === selectedEmail.id ? 0.6 : 1,
                        transition: 'filter 0.2s ease',
                      }}
                    >
                      <Check size={12} />
                      {approvingEmailId === selectedEmail.id ? 'Approving…' : 'Approve & Send'}
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Empty right state */
            <div className="flex flex-1 items-center justify-center">
              <div style={{
                fontFamily: "'Apparat', system-ui, sans-serif",
                fontSize: '13px', fontWeight: 400,
                letterSpacing: '0.16em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.12)',
              }}>
                Select an email
              </div>
            </div>
          )}
        </div>
      </div>
    </ScreenShell>
  )
}

// ── Sub-components ──

function EmailBucketRow({
  email, isSelected, onSelect,
}: {
  email: SupportEmail; isSelected: boolean; onSelect: () => void
}) {
  const dotColor = URGENCY_DOT[email.urgency ?? 'low'] ?? URGENCY_DOT.low
  const label = CATEGORY_LABEL[email.category ?? ''] ?? 'PENDING'

  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '13px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: isSelected ? 'rgba(255,255,255,0.05)' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.12s ease',
        borderLeft: `2px solid ${isSelected ? dotColor : 'transparent'}`,
      }}
      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)' }}
      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
    >
      {/* Square indicator */}
      <span style={{
        width: '6px', height: '6px',
        flexShrink: 0,
        background: dotColor,
        borderRadius: '1px',
      }} />

      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{
          fontFamily: "'Apparat', system-ui, sans-serif",
          fontSize: '11px', fontWeight: isSelected ? 600 : 500,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: isSelected ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          transition: 'color 0.12s ease',
        }}>{label}</div>
        <div style={{
          fontFamily: "'Apparat', system-ui, sans-serif",
          fontSize: '10px', fontWeight: 400,
          color: 'rgba(255,255,255,0.22)',
          marginTop: '2px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{email.from}</div>
      </div>
    </div>
  )
}

function ClusterRow({
  cluster, isSelected, onSelect,
}: {
  cluster: IssueCluster; isSelected: boolean; onSelect: () => void
}) {
  const sevColor = cluster.severity === 'critical' ? '#f3755c' : cluster.severity === 'high' ? '#f3b36b' : cluster.severity === 'medium' ? '#f8e08f' : '#444f5e'

  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '13px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: isSelected ? 'rgba(255,255,255,0.05)' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.12s ease',
        borderLeft: `2px solid ${isSelected ? sevColor : 'transparent'}`,
      }}
      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)' }}
      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
    >
      <span style={{ width: '6px', height: '6px', flexShrink: 0, background: sevColor, borderRadius: '1px' }} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{
          fontFamily: "'Apparat', system-ui, sans-serif",
          fontSize: '11px', fontWeight: isSelected ? 600 : 500,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: isSelected ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>Issues Tracking</div>
        <div style={{
          fontFamily: "'Apparat', system-ui, sans-serif",
          fontSize: '10px', color: 'rgba(255,255,255,0.22)',
          marginTop: '2px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{cluster.emailCount} reports · {cluster.title}</div>
      </div>
    </div>
  )
}

function ClusterDetail({ cluster }: { cluster: IssueCluster }) {
  const sevColor = cluster.severity === 'critical' ? '#f3755c' : cluster.severity === 'high' ? '#f3b36b' : '#f8e08f'

  return (
    <div style={{ padding: '28px 36px', flex: 1, overflowY: 'auto' }}>
      <div style={{
        fontFamily: "'Apparat', system-ui, sans-serif",
        fontSize: '9px', fontWeight: 600, letterSpacing: '0.3em',
        textTransform: 'uppercase', color: sevColor, marginBottom: '12px',
      }}>{cluster.severity} · {cluster.emailCount} reports</div>
      <div style={{
        fontFamily: "'Apparat', system-ui, sans-serif",
        fontSize: '28px', fontWeight: 500,
        lineHeight: 1.35, letterSpacing: '-0.02em',
        color: 'rgba(255,255,255,0.82)',
        maxWidth: '640px', marginBottom: '24px',
      }}>{cluster.title}</div>
      <div style={{
        fontFamily: "'Apparat', system-ui, sans-serif",
        fontSize: '13px', fontWeight: 400,
        lineHeight: 1.7, color: 'rgba(255,255,255,0.45)',
        maxWidth: '560px',
      }}>
        <span style={{ color: '#f3b36b', fontWeight: 600 }}>Recommended action: </span>
        {cluster.suggestedAction}
      </div>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div style={{
      padding: '40px 20px',
      textAlign: 'center',
      fontFamily: "'Apparat', system-ui, sans-serif",
      fontSize: '11px', letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.15)',
    }}>{label}</div>
  )
}
