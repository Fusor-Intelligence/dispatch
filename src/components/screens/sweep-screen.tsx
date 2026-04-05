'use client'

import { useEffect, useRef } from 'react'
import { ScreenShell } from '@/components/layout/screen-shell'
import { useDispatchStore } from '@/lib/store'
import { runSync, runClassify, runCluster, fetchAllData } from '@/lib/api'
import { Check, X } from 'lucide-react'

import { APPARAT } from '@/lib/constants'

const STEP_DEFS = [
  { id: 'sync',     label: 'Reading conversations'                       },
  { id: 'classify', label: 'Classifying messages and drafting responses' },
  { id: 'cluster',  label: 'Detecting recurring patterns'                },
  { id: 'prepare',  label: 'Preparing your briefing'                     },
]

export function SweepScreen() {
  const {
    dataSource, sweepProgress,
    setSweepPhase, addSweepStep, updateSweepStep, setSweepResult, setSweepError,
    setEmails, setClusters, setStats, setGmailConnected, navigateTo,
  } = useDispatchStore()

  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    runSweep()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function runSweep() {
    for (const def of STEP_DEFS) {
      addSweepStep({ id: def.id, label: def.label, status: 'pending' })
    }
    try {
      if (dataSource === 'gmail') {
        setSweepPhase('syncing')
        updateSweepStep('sync', { status: 'running', label: 'Reading conversations...' })
        const r = await runSync()
        setSweepResult('syncResult', r)
        updateSweepStep('sync', { status: 'done', detail: `${r.total} conversations read`, timestamp: Date.now() })
      } else {
        updateSweepStep('sync', { status: 'done', label: 'Reading conversations', detail: 'Pre-seeded conversations loaded', timestamp: Date.now() })
      }
      setSweepPhase('classifying')
      updateSweepStep('classify', { status: 'running' })
      const cr = await runClassify()
      setSweepResult('classifyResult', cr)
      updateSweepStep('classify', { status: 'done', detail: cr.classified > 0 ? `${cr.classified} classified, ${cr.draftsGenerated} drafts` : 'All messages pre-classified', timestamp: Date.now() })

      setSweepPhase('clustering')
      updateSweepStep('cluster', { status: 'running' })
      const clr = await runCluster()
      setSweepResult('clusterResult', clr)
      updateSweepStep('cluster', { status: 'done', detail: `${clr.clusters} issue clusters detected`, timestamp: Date.now() })

      updateSweepStep('prepare', { status: 'running' })
      const data = await fetchAllData()
      setEmails(data.emails); setClusters(data.clusters); setStats(data.stats); setGmailConnected(data.gmailConnected)
      updateSweepStep('prepare', { status: 'done', timestamp: Date.now() })
      setSweepPhase('complete')
      setTimeout(() => navigateTo('brief'), 1500)
    } catch (err) {
      console.error('Sweep failed:', err)
      setSweepError(err instanceof Error ? err.message : 'Sweep failed')
    }
  }

  const { steps, phase, error } = sweepProgress
  const isComplete = phase === 'complete'
  const activeStep = steps.find(s => s.status === 'running')
  const doneCount = steps.filter(s => s.status === 'done').length

  return (
    <ScreenShell
      className="flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0A0A0A 50%, #1C1C1C 112.05%, #2E4246 136.61%)' }}
    >
      <div className="flex min-h-0 flex-1 flex-col" style={{ padding: '36px' }}>

        {/* Kicker */}
        <div className="stagger-fade-up" style={{ '--stagger': 0, ...APPARAT, fontWeight: 300, fontSize: '18px', lineHeight: '48px', textTransform: 'uppercase', color: '#FFFFFF' } as React.CSSProperties}>
          Sweep:
        </div>

        {/* Headline — fills remaining space */}
        <div className="flex-1 flex items-start stagger-fade-up" style={{ '--stagger': 1, paddingBottom: '32px' } as React.CSSProperties}>
          <div style={{ ...APPARAT, fontWeight: 300, fontSize: '48px', lineHeight: '48px', textTransform: 'capitalize', color: '#F6F1E8', maxWidth: '700px' }}>
            {isComplete
              ? 'Investigation Complete.'
              : activeStep
              ? `${activeStep.label}.`
              : 'Investigating Your Inbox.'}
          </div>
        </div>

        {/* Bottom row: progress card + 4 step cards */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: '14px', flexShrink: 0, height: '165px' }}>

          {/* Progress card */}
          <div className="stagger-fade-up" style={{
            '--stagger': 2,
            position: 'relative',
            flex: 1,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '20px 17px',
            isolation: 'isolate',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          } as React.CSSProperties}>
            <div style={{ position: 'absolute', width: '6px', height: '7px', left: '17px', top: '60px', background: 'rgba(217,217,217,0.5)', zIndex: 1 }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '60px', alignSelf: 'stretch' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignSelf: 'stretch', alignItems: 'flex-start' }}>
                <div style={{ ...APPARAT, fontWeight: 300, fontSize: '18px', lineHeight: '100%', color: '#FFFFFF', textTransform: 'capitalize' }}>
                  {isComplete ? 'Complete' : 'Progress'}
                </div>
                <div style={{ ...APPARAT, fontWeight: 300, fontSize: '64px', lineHeight: '48px', color: '#FFFFFF' }}>
                  {doneCount}/{STEP_DEFS.length}
                </div>
              </div>
              <div style={{ ...APPARAT, fontWeight: 300, fontSize: '18px', lineHeight: '100%', textAlign: 'right', textTransform: 'capitalize', color: '#FFFFFF', alignSelf: 'stretch' }}>
                {isComplete ? 'Briefing Ready' : 'Steps Completed'}
              </div>
            </div>
          </div>

          {/* Step cards */}
          {STEP_DEFS.map((def, i) => {
            const step = steps.find(s => s.id === def.id)
            const status = step?.status ?? 'pending'
            const isActive = status === 'running'
            const isDone = status === 'done'
            return (
              <div
                key={def.id}
                className={`stagger-fade-up${isActive ? ' dispatch-step-active' : ''}`}
                style={{
                  '--stagger': 3 + i,
                  position: 'relative',
                  flex: 1,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '20px 17px',
                  isolation: 'isolate',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  opacity: status === 'pending' ? 0.35 : 1,
                  transition: 'opacity 0.3s ease',
                } as React.CSSProperties}
              >
                <div style={{ position: 'absolute', width: '6px', height: '7px', left: '17px', top: '60px', background: isDone ? 'rgba(255,255,255,0.7)' : isActive ? 'rgba(255,255,255,0.4)' : 'rgba(217,217,217,0.3)', zIndex: 1 }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '60px', alignSelf: 'stretch' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignSelf: 'stretch', alignItems: 'flex-start' }}>
                    <div style={{ ...APPARAT, fontWeight: 300, fontSize: '18px', lineHeight: '100%', color: '#FFFFFF', textTransform: 'capitalize' }}>
                      {isActive ? (
                        <div style={{ width: '16px', height: '16px', borderRadius: '9999px', border: '2px solid rgba(255,255,255,0.15)', borderTopColor: '#FFFFFF', animation: 'spin 0.8s linear infinite' }} />
                      ) : isDone ? (
                        <Check size={18} style={{ color: '#FFFFFF' }} />
                      ) : (
                        <span style={{ opacity: 0.3 }}>—</span>
                      )}
                    </div>
                    <div style={{ ...APPARAT, fontWeight: 300, fontSize: '64px', lineHeight: '48px', color: '#FFFFFF', opacity: 0.2 }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                  </div>
                  <div style={{ ...APPARAT, fontWeight: 300, fontSize: '18px', lineHeight: '100%', textAlign: 'right', textTransform: 'capitalize', color: '#FFFFFF', alignSelf: 'stretch', opacity: status === 'pending' ? 0.5 : 1 }}>
                    {step?.detail ?? def.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </ScreenShell>
  )
}
