'use client'

import { useEffect, useRef } from 'react'
import { ScreenShell } from '@/components/layout/screen-shell'
import { useDispatchStore } from '@/lib/store'
import { runSync, runClassify, runCluster, fetchAllData } from '@/lib/api'
import { Check, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEP_DEFS = [
  { id: 'sync', label: 'Reading conversations' },
  { id: 'classify', label: 'Classifying messages and drafting responses' },
  { id: 'cluster', label: 'Detecting recurring patterns' },
  { id: 'prepare', label: 'Preparing your briefing' },
]

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
    <ScreenShell className="flex items-center justify-center">
      <div className="w-full max-w-xl px-6">
        <div className="text-center">
          <div className="dispatch-kicker mb-4">Live Sweep</div>
          <h2 className="font-heading text-4xl text-[#f6f1e8]">
            {phase === 'complete' ? 'Investigation complete' : 'Investigating your inbox'}
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm text-[#8ea0b5]">
            {phase === 'complete'
              ? 'Your briefing is ready.'
              : 'Dispatch is reading, classifying, and organizing your support conversations.'}
          </p>
        </div>

        {/* Progress ring */}
        <div className="mx-auto my-10 flex h-28 w-28 items-center justify-center">
          {phase === 'complete' ? (
            <div className="flex h-full w-full items-center justify-center rounded-full border border-[#264731] bg-[rgba(12,30,20,0.6)]">
              <Check size={40} className="text-[#6ee7b7]" />
            </div>
          ) : phase === 'error' ? (
            <div className="flex h-full w-full items-center justify-center rounded-full border border-[#4f2925] bg-[rgba(52,22,18,0.6)]">
              <AlertCircle size={40} className="text-[#f3755c]" />
            </div>
          ) : (
            <div className="pulse-gold flex h-full w-full items-center justify-center rounded-full border border-[rgba(243,179,107,0.25)] bg-[rgba(243,179,107,0.06)]">
              <Loader2 size={36} className="animate-spin text-[#f3b36b]" />
            </div>
          )}
        </div>

        {/* Action log */}
        <div className="dispatch-panel space-y-0 divide-y divide-[rgba(255,255,255,0.06)] px-5">
          {steps.map((step, i) => (
            <div
              key={step.id}
              className={cn(
                'flex items-start gap-4 py-4',
                step.status === 'pending' && 'opacity-40'
              )}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
                {step.status === 'running' && (
                  <div className="dispatch-spinner h-5 w-5" />
                )}
                {step.status === 'done' && (
                  <Check size={18} className="text-[#6ee7b7]" />
                )}
                {step.status === 'error' && (
                  <AlertCircle size={18} className="text-[#f3755c]" />
                )}
                {step.status === 'pending' && (
                  <div className="h-2 w-2 rounded-full bg-[rgba(255,255,255,0.2)]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className={cn(
                  'text-sm font-medium',
                  step.status === 'done' ? 'text-[#d8e1ea]' : step.status === 'running' ? 'text-[#f4efe7]' : 'text-[#6c7d92]'
                )}>
                  {step.label}
                </div>
                {step.detail && (
                  <div className="mt-1 text-xs text-[#8ea0b5]">{step.detail}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-4 rounded-[22px] border border-[#4f2925] bg-[rgba(52,22,18,0.6)] px-4 py-3 text-sm text-[#f8b4a8]">
            {error}
          </div>
        )}
      </div>
    </ScreenShell>
  )
}
