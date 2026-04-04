'use client'

import { useEffect, useRef } from 'react'
import { ScreenShell } from '@/components/layout/screen-shell'
import { useDispatchStore } from '@/lib/store'
import { runSync, runClassify, runCluster, fetchAllData } from '@/lib/api'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEP_DEFS = [
  { id: 'sync',     label: 'Reading conversations' },
  { id: 'classify', label: 'Classifying messages and drafting responses' },
  { id: 'cluster',  label: 'Detecting recurring patterns' },
  { id: 'prepare',  label: 'Preparing your briefing' },
]

const TOP_BAR: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '56px',
  padding: '0 24px',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  flexShrink: 0,
}

const WORDMARK: React.CSSProperties = {
  fontFamily: "'Apparat', system-ui, sans-serif",
  fontSize: '28px',
  fontWeight: 700,
  letterSpacing: '-0.03em',
  color: 'rgba(255,255,255,0.85)',
}

const STATUS_LABEL: React.CSSProperties = {
  fontFamily: "'Apparat', system-ui, sans-serif",
  fontSize: '9px',
  fontWeight: 600,
  letterSpacing: '0.3em',
  textTransform: 'uppercase' as const,
  color: 'rgba(255,255,255,0.2)',
}

export function SweepScreen() {
  const {
    dataSource,
    sweepProgress,
    setSweepPhase,
    addSweepStep,
    updateSweepStep,
    setSweepResult,
    setSweepError,
    setEmails,
    setClusters,
    setStats,
    setGmailConnected,
    navigateTo,
  } = useDispatchStore()

  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    runSweep()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function runSweep() {
    // Initialize all steps as pending
    for (const def of STEP_DEFS) {
      addSweepStep({ id: def.id, label: def.label, status: 'pending' })
    }

    try {
      // Step 1: Sync (skip for demo — data already seeded)
      if (dataSource === 'gmail') {
        setSweepPhase('syncing')
        updateSweepStep('sync', { status: 'running', label: 'Reading conversations...' })
        const syncResult = await runSync()
        setSweepResult('syncResult', syncResult)
        updateSweepStep('sync', {
          status: 'done',
          detail: `${syncResult.total} conversations read`,
          timestamp: Date.now(),
        })
      } else {
        updateSweepStep('sync', {
          status: 'done',
          label: 'Loading demo inbox',
          detail: 'Pre-seeded conversations loaded',
          timestamp: Date.now(),
        })
      }

      // Step 2: Classify
      setSweepPhase('classifying')
      updateSweepStep('classify', { status: 'running', label: 'Classifying messages and drafting responses...' })
      const classifyResult = await runClassify()
      setSweepResult('classifyResult', classifyResult)
      updateSweepStep('classify', {
        status: 'done',
        detail: classifyResult.classified > 0
          ? `${classifyResult.classified} classified, ${classifyResult.draftsGenerated} drafts generated`
          : 'All messages pre-classified',
        timestamp: Date.now(),
      })

      // Step 3: Cluster
      setSweepPhase('clustering')
      updateSweepStep('cluster', { status: 'running', label: 'Detecting recurring patterns...' })
      const clusterResult = await runCluster()
      setSweepResult('clusterResult', clusterResult)
      updateSweepStep('cluster', {
        status: 'done',
        detail: `${clusterResult.clusters} issue clusters detected`,
        timestamp: Date.now(),
      })

      // Step 4: Fetch all data
      updateSweepStep('prepare', { status: 'running', label: 'Preparing your briefing...' })
      const data = await fetchAllData()
      setEmails(data.emails)
      setClusters(data.clusters)
      setStats(data.stats)
      setGmailConnected(data.gmailConnected)
      updateSweepStep('prepare', { status: 'done', timestamp: Date.now() })

      setSweepPhase('complete')

      // Auto-transition to brief
      setTimeout(() => navigateTo('brief'), 1500)
    } catch (err) {
      console.error('Sweep failed:', err)
      setSweepError(err instanceof Error ? err.message : 'Sweep failed')
    }
  }

  const { steps, phase, error } = sweepProgress

  return (
    <ScreenShell className="flex flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <div style={TOP_BAR}>
        <div style={WORDMARK}>Dispatch</div>
        <div style={STATUS_LABEL}>Sweep</div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 items-center justify-center overflow-y-auto">
        <div style={{ width: '100%', maxWidth: '560px', padding: '0 24px' }}>

          {/* Heading block */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              fontFamily: "'Apparat', system-ui, sans-serif",
              fontSize: '9px',
              fontWeight: 600,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.2)',
              marginBottom: '16px',
            }}>
              Live Sweep
            </div>
            <h2 style={{
              fontFamily: "'Apparat', system-ui, sans-serif",
              fontSize: '40px',
              fontWeight: 300,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              color: 'rgba(255,255,255,0.82)',
              margin: 0,
            }}>
              {phase === 'complete' ? 'Investigation complete' : 'Investigating your inbox'}
            </h2>
            <p style={{
              marginTop: '12px',
              maxWidth: '360px',
              marginLeft: 'auto',
              marginRight: 'auto',
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.35)',
              fontFamily: "'Apparat', system-ui, sans-serif",
            }}>
              {phase === 'complete'
                ? 'Your briefing is ready.'
                : 'Dispatch is reading, classifying, and organizing your support conversations.'}
            </p>
          </div>

          {/* Progress ring */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 40px',
            width: '112px',
            height: '112px',
          }}>
            {phase === 'complete' ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                borderRadius: '9999px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.04)',
              }}>
                <Check size={40} style={{ color: 'rgba(255,255,255,0.82)' }} />
              </div>
            ) : phase === 'error' ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                borderRadius: '9999px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.04)',
              }}>
                <X size={40} style={{ color: 'rgba(255,255,255,0.6)' }} />
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                borderRadius: '9999px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.04)',
              }}>
                {/* White spinner */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '9999px',
                  border: '2px solid rgba(255,255,255,0.1)',
                  borderTopColor: 'rgba(255,255,255,0.7)',
                  animation: 'spin 0.8s linear infinite',
                }} />
              </div>
            )}
          </div>

          {/* Action log */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}>
            {steps.map((step, i) => (
              <div
                key={step.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '16px 20px',
                  borderBottom: i < steps.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  opacity: step.status === 'pending' ? 0.4 : 1,
                  transition: 'opacity 0.2s ease',
                }}
              >
                {/* Step icon */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  flexShrink: 0,
                  marginTop: '1px',
                }}>
                  {step.status === 'running' && (
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '9999px',
                      border: '2px solid rgba(255,255,255,0.12)',
                      borderTopColor: 'rgba(255,255,255,0.7)',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                  )}
                  {step.status === 'done' && (
                    <Check size={16} style={{ color: 'rgba(255,255,255,0.82)' }} />
                  )}
                  {step.status === 'error' && (
                    <X size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
                  )}
                  {step.status === 'pending' && (
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '9999px',
                      background: 'rgba(255,255,255,0.4)',
                    }} />
                  )}
                </div>

                {/* Step text */}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontFamily: "'Apparat', system-ui, sans-serif",
                    fontSize: '13px',
                    fontWeight: 500,
                    color: step.status === 'done'
                      ? 'rgba(255,255,255,0.7)'
                      : step.status === 'running'
                      ? 'rgba(255,255,255,0.9)'
                      : 'rgba(255,255,255,0.25)',
                    transition: 'color 0.2s ease',
                  }}>
                    {step.label}
                  </div>
                  {step.detail && (
                    <div style={{
                      marginTop: '3px',
                      fontFamily: "'Apparat', system-ui, sans-serif",
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.3)',
                    }}>
                      {step.detail}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              marginTop: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)',
              padding: '12px 16px',
              fontFamily: "'Apparat', system-ui, sans-serif",
              fontSize: '13px',
              color: 'rgba(255,255,255,0.6)',
            }}>
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Spinner keyframe */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </ScreenShell>
  )
}
