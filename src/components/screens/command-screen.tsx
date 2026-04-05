'use client'

import { useState } from 'react'
import { ScreenShell } from '@/components/layout/screen-shell'
import { useDispatchStore } from '@/lib/store'
import { approveEmail, fetchAllData } from '@/lib/api'
import { Check } from 'lucide-react'
import type { SupportEmail, IssueCluster } from '@/lib/types'
import { APPARAT } from '@/lib/constants'

type FilterId = 'queue' | 'review' | 'issues'

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'queue',  label: 'Queue'  },
  { id: 'review', label: 'Review' },
  { id: 'issues', label: 'Issues' },
]

const CATEGORY_LABEL: Record<string, string> = {
  refund:          'Refund Request',
  bug_report:      'Bug Report',
  cancellation:    'Cancellation',
  feature_request: 'Feature Request',
  general_inquiry: 'General Inquiry',
  complaint:       'Complaint',
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

  const [filter, setFilter] = useState<FilterId>('queue')
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null)

  const readyEmails  = emails.filter(e => e.status === 'auto_replied' && (e.confidence ?? 0) >= agentRules.autoApproveThreshold)
  const reviewEmails = emails.filter(e => e.status === 'needs_review')

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
      {/* ── Filter tabs ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 8px 0' }}>
        {FILTERS.map((f, i) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="stagger-fade-up dispatch-btn-ghost"
            style={{
              '--stagger': i,
              width: '84px',
              height: '29px',
              borderRadius: '8px',
              background: filter === f.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)',
              border: 'none',
              ...APPARAT,
              fontSize: '12px',
              fontWeight: 300,
              textTransform: 'capitalize',
              color: filter === f.id ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '9px',
            } as React.CSSProperties}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Body ── */}
      <div className="flex min-h-0 flex-1 overflow-hidden" style={{ gap: '8px', padding: '8px' }}>

        {/* ── Left column: grouped buckets ── */}
        <div
          style={{
            width: '300px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            overflowY: 'auto',
          }}
        >
          {filter === 'issues' ? (
            clusters.length === 0 ? (
              <EmptyState label="No active incidents." />
            ) : (
              <>
                <BucketHeader count={clusters.length} label="Issues Tracking" />
                {clusters.map(c => (
                  <ClusterRow
                    key={c.id}
                    cluster={c}
                    isSelected={selectedClusterId === c.id}
                    onSelect={() => setSelectedClusterId(selectedClusterId === c.id ? null : c.id)}
                  />
                ))}
              </>
            )
          ) : filter === 'review' ? (
            reviewEmails.length === 0 ? (
              <EmptyState label="No emails need review." />
            ) : (
              <>
                <BucketHeader count={reviewEmails.length} label="Need Reviews" />
                {reviewEmails.map(e => (
                  <EmailRow
                    key={e.id}
                    email={e}
                    isSelected={selectedEmailId === e.id}
                    onSelect={() => selectEmail(selectedEmailId === e.id ? null : e.id)}
                  />
                ))}
              </>
            )
          ) : (
            /* Queue: two groups stacked */
            <>
              {readyEmails.length > 0 && (
                <>
                  <BucketHeader count={readyEmails.length} label="Instant Solve" />
                  {readyEmails.map(e => (
                    <EmailRow
                      key={e.id}
                      email={e}
                      isSelected={selectedEmailId === e.id}
                      onSelect={() => selectEmail(selectedEmailId === e.id ? null : e.id)}
                    />
                  ))}
                </>
              )}
              {reviewEmails.length > 0 && (
                <>
                  <BucketHeader count={reviewEmails.length} label="Need Reviews" />
                  {reviewEmails.map(e => (
                    <EmailRow
                      key={e.id}
                      email={e}
                      isSelected={selectedEmailId === e.id}
                      onSelect={() => selectEmail(selectedEmailId === e.id ? null : e.id)}
                    />
                  ))}
                </>
              )}
              {clusters.length > 0 && (
                <>
                  <BucketHeader count={clusters.length} label="Issues Tracking" />
                  {clusters.map(c => (
                    <ClusterRow
                      key={c.id}
                      cluster={c}
                      isSelected={selectedClusterId === c.id}
                      onSelect={() => setSelectedClusterId(selectedClusterId === c.id ? null : c.id)}
                    />
                  ))}
                </>
              )}
              {readyEmails.length === 0 && reviewEmails.length === 0 && clusters.length === 0 && (
                <EmptyState label="No emails." />
              )}
            </>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="stagger-fade-in" style={{ '--stagger': 3, flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0, overflow: 'hidden' } as React.CSSProperties}>
          {filter === 'issues' && selectedCluster ? (
            <ClusterDetail cluster={selectedCluster} />
          ) : selectedEmail ? (
            <>
              {/* Email body */}
              <div
                className="dispatch-card-hover"
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '28px 32px',
                  overflowY: 'auto',
                  minHeight: 0,
                }}
              >
                <div style={{
                  ...APPARAT,
                  fontSize: '9px', fontWeight: 600,
                  letterSpacing: '0.22em', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.28)',
                  marginBottom: '16px',
                }}>
                  {selectedEmail.from}
                </div>
                <div style={{
                  ...APPARAT,
                  fontSize: '22px',
                  fontWeight: 300,
                  lineHeight: 1.5,
                  letterSpacing: '-0.01em',
                  color: 'rgba(255,255,255,0.82)',
                }}>
                  {selectedEmail.body}
                </div>
              </div>

              {/* Insight cards row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexShrink: 0 }}>
                {/* Insight 01 */}
                <div className="dispatch-card-hover" style={{
                  position: 'relative',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '20px 17px',
                  isolation: 'isolate',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}>
                  <div style={{ position: 'absolute', width: '6px', height: '7px', left: '17px', top: '60px', background: 'rgba(217,217,217,0.5)', zIndex: 1 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px', alignSelf: 'stretch' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', alignSelf: 'stretch' }}>
                      <div style={{ ...APPARAT, fontWeight: 300, fontSize: '18px', lineHeight: '100%', textTransform: 'capitalize', color: '#FFFFFF' }}>Insight 01</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', alignSelf: 'stretch' }}>
                      {[
                        ['Category',   CATEGORY_LABEL[selectedEmail.category ?? ''] ?? 'Pending'],
                        ['Urgency',    (selectedEmail.urgency ?? 'pending').toUpperCase()],
                        ['Sentiment',  (selectedEmail.sentiment ?? 'pending').toUpperCase()],
                        ['Confidence', `${Math.round((selectedEmail.confidence ?? 0) * 100)}%`],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <div style={{ ...APPARAT, fontSize: '9px', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '3px' }}>{k}</div>
                          <div style={{ ...APPARAT, fontSize: '15px', fontWeight: 300, color: '#FFFFFF' }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Insight 02 */}
                <div className="dispatch-card-hover" style={{
                  position: 'relative',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '20px 17px',
                  isolation: 'isolate',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}>
                  <div style={{ position: 'absolute', width: '6px', height: '7px', left: '17px', top: '60px', background: 'rgba(217,217,217,0.5)', zIndex: 1 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px', alignSelf: 'stretch' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', alignSelf: 'stretch' }}>
                      <div style={{ ...APPARAT, fontWeight: 300, fontSize: '18px', lineHeight: '100%', textTransform: 'capitalize', color: '#FFFFFF' }}>Insight 02</div>
                    </div>
                    {selectedEmail.summary ? (
                      <div style={{ ...APPARAT, fontSize: '13px', fontWeight: 300, lineHeight: 1.65, color: 'rgba(255,255,255,0.7)', alignSelf: 'stretch', textAlign: 'right' }}>{selectedEmail.summary}</div>
                    ) : (
                      <div style={{ ...APPARAT, fontSize: '13px', fontWeight: 300, color: 'rgba(255,255,255,0.3)' }}>No summary.</div>
                    )}
                    {selectedEmail.autoReplyDraft && (selectedEmail.status === 'needs_review' || selectedEmail.status === 'auto_replied') && (
                      <button
                        onClick={() => handleApprove(selectedEmail.id)}
                        disabled={approvingEmailId === selectedEmail.id || !gmailConnected}
                        className="dispatch-btn-primary"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '8px 18px',
                          borderRadius: '9999px',
                          background: 'rgba(255,255,255,0.85)',
                          color: '#0A0A0A',
                          ...APPARAT,
                          fontSize: '11px', fontWeight: 400,
                          letterSpacing: '0.1em', textTransform: 'uppercase',
                          border: 'none', cursor: 'pointer',
                          opacity: approvingEmailId === selectedEmail.id ? 0.5 : 1,
                        }}
                      >
                        <Check size={12} />
                        {approvingEmailId === selectedEmail.id ? 'Approving…' : 'Approve & Send'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
            }}>
              <div style={{
                ...APPARAT,
                fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.15)',
              }}>
                Select an item
              </div>
            </div>
          )}
        </div>
      </div>
    </ScreenShell>
  )
}

// ── Sub-components ──

function BucketHeader({ count, label }: { count: number; label: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '4px 2px',
      fontFamily: "'KMR Apparat', system-ui, sans-serif",
      fontSize: '9px', fontWeight: 600,
      letterSpacing: '0.28em', textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.3)',
    }}>
      <span style={{
        fontSize: '11px', fontWeight: 600,
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: '0',
      }}>{count}</span>
      {label}
    </div>
  )
}

function EmailRow({ email, isSelected, onSelect }: {
  email: SupportEmail; isSelected: boolean; onSelect: () => void
}) {
  const label = CATEGORY_LABEL[email.category ?? ''] ?? 'Pending'

  return (
    <div
      onClick={onSelect}
      className="dispatch-card-hover"
      style={{
        background: isSelected ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '14px 16px',
        cursor: 'pointer',
        borderLeft: `3px solid ${isSelected ? 'rgba(255,255,255,0.55)' : 'transparent'}`,
      }}
    >
      <div style={{
        fontFamily: "'KMR Apparat', system-ui, sans-serif",
        fontSize: '12px', fontWeight: isSelected ? 600 : 500,
        color: isSelected ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.65)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        marginBottom: '3px',
      }}>{label}</div>
      <div style={{
        fontFamily: "'KMR Apparat', system-ui, sans-serif",
        fontSize: '11px',
        color: 'rgba(255,255,255,0.3)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{email.from}</div>
    </div>
  )
}

function ClusterRow({ cluster, isSelected, onSelect }: {
  cluster: IssueCluster; isSelected: boolean; onSelect: () => void
}) {
  return (
    <div
      onClick={onSelect}
      className="dispatch-card-hover"
      style={{
        background: isSelected ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '14px 16px',
        cursor: 'pointer',
        borderLeft: `3px solid ${isSelected ? 'rgba(255,255,255,0.55)' : 'transparent'}`,
      }}
    >
      <div style={{
        fontFamily: "'KMR Apparat', system-ui, sans-serif",
        fontSize: '12px', fontWeight: isSelected ? 600 : 500,
        color: isSelected ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.65)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        marginBottom: '3px',
      }}>{cluster.title}</div>
      <div style={{
        fontFamily: "'KMR Apparat', system-ui, sans-serif",
        fontSize: '11px',
        color: 'rgba(255,255,255,0.3)',
      }}>{cluster.emailCount} reports · {cluster.severity}</div>
    </div>
  )
}

function ClusterDetail({ cluster }: { cluster: IssueCluster }) {
  return (
    <div style={{
      flex: 1,
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '8px',
      padding: '32px 36px',
      overflowY: 'auto',
    }}>
      <div style={{
        fontFamily: "'KMR Apparat', system-ui, sans-serif",
        fontSize: '9px', fontWeight: 600, letterSpacing: '0.3em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
        marginBottom: '12px',
      }}>{cluster.severity} · {cluster.emailCount} reports</div>
      <div style={{
        fontFamily: "'KMR Apparat', system-ui, sans-serif",
        fontSize: '28px', fontWeight: 500,
        lineHeight: 1.35, letterSpacing: '-0.02em',
        color: 'rgba(255,255,255,0.82)',
        maxWidth: '640px', marginBottom: '24px',
      }}>{cluster.title}</div>
      <div style={{
        fontFamily: "'KMR Apparat', system-ui, sans-serif",
        fontSize: '13px', fontWeight: 400,
        lineHeight: 1.7, color: 'rgba(255,255,255,0.45)',
        maxWidth: '560px',
      }}>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Recommended action: </span>
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
      fontFamily: "'KMR Apparat', system-ui, sans-serif",
      fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.15)',
    }}>{label}</div>
  )
}
