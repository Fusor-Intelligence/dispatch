'use client'

import { ScreenShell } from '@/components/layout/screen-shell'
import { useDispatchStore } from '@/lib/store'
import { CheckCircle, AlertTriangle, Layers, ArrowRight } from 'lucide-react'

export function BriefScreen() {
  const { emails, clusters, stats, navigateTo } = useDispatchStore()

  const totalEmails = stats?.totalEmails ?? emails.length
  const handledCount = emails.filter((e) => e.status === 'auto_replied' || e.status === 'resolved').length
  const reviewCount = emails.filter((e) => e.status === 'needs_review').length
  const incidentCount = clusters.length
  const heroCluster = clusters[0] ?? null
  const biggestClusterEmailCount = heroCluster?.emailCount ?? 0

  const narrativeLines = [
    { text: 'I reviewed', value: totalEmails, suffix: 'support emails.' },
    { text: '', value: handledCount, suffix: 'can be handled automatically.' },
    { text: '', value: reviewCount, suffix: 'need human review.' },
    ...(biggestClusterEmailCount > 1
      ? [{ text: '', value: biggestClusterEmailCount, suffix: 'appear tied to the same issue.' }]
      : []),
  ]

  return (
    <ScreenShell className="flex flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <div
        className="flex shrink-0 items-center justify-between px-6"
        style={{ height: '56px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          style={{
            fontFamily: "'Apparat', system-ui, sans-serif",
            fontSize: '28px',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          Dispatch
        </div>
        <div
          style={{
            fontFamily: "'Apparat', system-ui, sans-serif",
            fontSize: '9px',
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.25)',
          }}
        >
          Brief
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-6 py-12">

          {/* Narrative */}
          <div className="mb-10 space-y-2 text-center">
            {narrativeLines.map((line, i) => (
              <div
                key={i}
                className="number-reveal"
                style={{
                  fontFamily: "'Apparat', system-ui, sans-serif",
                  fontSize: '32px',
                  fontWeight: 300,
                  lineHeight: 1.45,
                  color: 'rgba(255,255,255,0.75)',
                  animationDelay: `${i * 150}ms`,
                }}
              >
                {line.text}{line.text ? ' ' : ''}
                <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{line.value}</span>{' '}
                {line.suffix}
              </div>
            ))}
          </div>

          {/* Three summary cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {/* Handled */}
            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '20px',
              }}
            >
              <CheckCircle size={24} style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '12px' }} />
              <div style={{ fontSize: '36px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: "'Apparat', system-ui, sans-serif" }}>{handledCount}</div>
              <div style={{ marginTop: '4px', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.6)', fontFamily: "'Apparat', system-ui, sans-serif" }}>Handled</div>
              <div style={{ marginTop: '4px', fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: "'Apparat', system-ui, sans-serif" }}>Auto-replied or resolved by AI</div>
            </div>

            {/* Needs Judgment */}
            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '20px',
              }}
            >
              <AlertTriangle size={24} style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '12px' }} />
              <div style={{ fontSize: '36px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: "'Apparat', system-ui, sans-serif" }}>{reviewCount}</div>
              <div style={{ marginTop: '4px', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.6)', fontFamily: "'Apparat', system-ui, sans-serif" }}>Needs Judgment</div>
              <div style={{ marginTop: '4px', fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: "'Apparat', system-ui, sans-serif" }}>Requires human review before action</div>
            </div>

            {/* Recurring Incidents */}
            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '20px',
              }}
            >
              <Layers size={24} style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '12px' }} />
              <div style={{ fontSize: '36px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: "'Apparat', system-ui, sans-serif" }}>{incidentCount}</div>
              <div style={{ marginTop: '4px', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.6)', fontFamily: "'Apparat', system-ui, sans-serif" }}>Recurring Incidents</div>
              <div style={{ marginTop: '4px', fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: "'Apparat', system-ui, sans-serif" }}>Clusters of related complaints</div>
            </div>
          </div>

          {/* Hero cluster card */}
          {heroCluster && (
            <div
              className="mb-8"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderLeftWidth: '3px',
                borderLeftColor: 'rgba(255,255,255,0.25)',
                borderRadius: '16px',
                padding: '24px',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div
                    style={{
                      fontFamily: "'Apparat', system-ui, sans-serif",
                      fontSize: '9px',
                      fontWeight: 600,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.2)',
                      marginBottom: '8px',
                    }}
                  >
                    Biggest Pattern
                  </div>
                  <div
                    style={{
                      fontFamily: "'Apparat', system-ui, sans-serif",
                      fontSize: '20px',
                      fontWeight: 500,
                      color: 'rgba(255,255,255,0.82)',
                    }}
                  >
                    {heroCluster.title}
                  </div>
                  <div
                    style={{
                      marginTop: '8px',
                      fontFamily: "'Apparat', system-ui, sans-serif",
                      fontSize: '13px',
                      color: 'rgba(255,255,255,0.35)',
                    }}
                  >
                    {heroCluster.emailCount} reports · Severity: {heroCluster.severity}
                    {heroCluster.trending && ' · Trending'}
                  </div>
                </div>
                <span
                  style={{
                    flexShrink: 0,
                    borderRadius: '9999px',
                    padding: '6px 12px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.06)',
                    fontFamily: "'Apparat', system-ui, sans-serif",
                    fontSize: '9px',
                    fontWeight: 600,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  {heroCluster.severity}
                </span>
              </div>
              <div
                style={{
                  marginTop: '16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.04)',
                  padding: '16px',
                  fontFamily: "'Apparat', system-ui, sans-serif",
                  fontSize: '13px',
                  lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.65)',
                }}
              >
                <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Recommended action:</span>{' '}
                {heroCluster.suggestedAction}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={() => navigateTo('rules')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                borderRadius: '9999px',
                background: '#fff',
                color: '#0A0A0A',
                border: 'none',
                padding: '14px 32px',
                fontFamily: "'Apparat', system-ui, sans-serif",
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.88' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
            >
              Set Rules
              <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </div>
    </ScreenShell>
  )
}
