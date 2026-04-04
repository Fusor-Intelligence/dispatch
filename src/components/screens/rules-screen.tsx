'use client'

import { ScreenShell } from '@/components/layout/screen-shell'
import { useDispatchStore } from '@/lib/store'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TonePreset } from '@/lib/types'

const TOGGLE_RULES = [
  { key: 'requireReviewForCancellations' as const, label: 'Require review for cancellations', desc: 'Cancellation requests always need human approval before responding' },
  { key: 'alwaysEscalateAngry' as const, label: 'Always escalate angry complaints', desc: 'Messages with angry sentiment are immediately flagged for senior review' },
  { key: 'routeCriticalBugsToEngineering' as const, label: 'Route critical bug reports to engineering', desc: 'High-severity technical issues go straight to the engineering queue' },
]

const TONE_OPTIONS: { key: TonePreset; label: string; desc: string }[] = [
  { key: 'calm', label: 'Calm', desc: 'Measured and professional' },
  { key: 'apologetic', label: 'Apologetic', desc: 'Empathetic and understanding' },
  { key: 'concise', label: 'Concise', desc: 'Brief and to the point' },
  { key: 'premium', label: 'Premium', desc: 'High-touch white-glove tone' },
]

export function RulesScreen() {
  const { agentRules, setAgentRules, navigateTo } = useDispatchStore()

  return (
    <ScreenShell className="flex items-center justify-center px-6">
      <div className="w-full max-w-2xl">
        <div className="dispatch-kicker mb-4 text-center">Rules of Engagement</div>
        <h2 className="text-center font-heading text-4xl text-[#f6f1e8]">
          Teach Dispatch how to operate
        </h2>
        <p className="mx-auto mt-3 mb-8 max-w-md text-center text-sm text-[#8ea0b5]">
          Based on the briefing, configure how aggressively Dispatch should act on your behalf.
        </p>

        {/* Confidence threshold */}
        <div className="dispatch-panel mb-5 p-5">
          {/* Confidence Threshold */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span style={{
                fontFamily: "'Apparat', system-ui, sans-serif",
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.35)',
              }}>Confidence Threshold</span>
              <span style={{
                fontFamily: "'Apparat', system-ui, sans-serif",
                fontSize: '20px',
                fontWeight: 300,
                color: '#f3b36b',
                letterSpacing: '-0.02em',
              }}>{Math.round(agentRules.autoApproveThreshold * 100)}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={99}
              value={Math.round(agentRules.autoApproveThreshold * 100)}
              onChange={e => setAgentRules({ autoApproveThreshold: Number(e.target.value) / 100 })}
              className="dispatch-slider"
              style={{ width: '100%' }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '9px',
              color: 'rgba(255,255,255,0.2)',
              letterSpacing: '0.1em',
            }}>
              <span>50% — PERMISSIVE</span>
              <span>99% — STRICT</span>
            </div>
          </div>
        </div>

        {/* Toggle rules */}
        <div className="dispatch-panel mb-5 divide-y divide-[rgba(255,255,255,0.06)] px-5">
          {TOGGLE_RULES.map((rule) => (
            <button
              key={rule.key}
              onClick={() => setAgentRules({ [rule.key]: !agentRules[rule.key] })}
              className="flex w-full items-center justify-between py-4 text-left"
            >
              <div>
                <div className="text-sm font-medium text-[#d8e1ea]">{rule.label}</div>
                <div className="mt-0.5 text-xs text-[#6c7d92]">{rule.desc}</div>
              </div>
              <span
                className={cn(
                  'relative ml-4 h-5 w-9 shrink-0 rounded-full transition-colors',
                  agentRules[rule.key] ? 'bg-[#f3b36b]' : 'bg-[rgba(255,255,255,0.12)]'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
                    agentRules[rule.key] ? 'translate-x-4' : 'translate-x-0.5'
                  )}
                />
              </span>
            </button>
          ))}
        </div>

        {/* Tone selector */}
        <div className="dispatch-panel mb-8 p-5">
          <div className="mb-3 text-sm font-semibold text-[#f4efe7]">Reply tone</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TONE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setAgentRules({ tone: opt.key })}
                className={cn(
                  'rounded-[1rem] border px-3 py-3 text-center transition-all',
                  agentRules.tone === opt.key
                    ? 'border-[rgba(243,179,107,0.35)] bg-[rgba(243,179,107,0.12)] text-[#ffdcb3]'
                    : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[#9fb0c5] hover:bg-[rgba(255,255,255,0.06)]'
                )}
              >
                <div className="text-sm font-semibold">{opt.label}</div>
                <div className="mt-0.5 text-[10px] opacity-70">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => navigateTo('command')}
            className="inline-flex items-center gap-3 rounded-[1.4rem] border border-[rgba(243,179,107,0.3)] bg-[linear-gradient(180deg,_rgba(243,179,107,0.2),_rgba(86,52,22,0.2))] px-8 py-4 font-semibold text-white transition hover:border-[rgba(243,179,107,0.5)]"
          >
            Activate Dispatch
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </ScreenShell>
  )
}
