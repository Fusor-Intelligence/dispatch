'use client'

import { ScreenShell } from '@/components/layout/screen-shell'
import { useDispatchStore } from '@/lib/store'
import { ArrowRight } from 'lucide-react'
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
    <ScreenShell className="flex flex-col overflow-hidden">
      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto">
        <div style={{ padding: '36px' }}>

          {/* Heading */}
          <h2
            className="stagger-fade-up"
            style={{
              '--stagger': 0,
              fontFamily: "'KMR Apparat', system-ui, sans-serif",
              fontSize: '36px',
              fontWeight: 300,
              textAlign: 'center',
              color: 'rgba(255,255,255,0.82)',
              marginBottom: '12px',
            } as React.CSSProperties}
          >
            Teach Dispatch how to operate
          </h2>
          <p
            className="stagger-fade-up"
            style={{
              '--stagger': 1,
              fontFamily: "'KMR Apparat', system-ui, sans-serif",
              fontSize: '14px',
              fontWeight: 300,
              textAlign: 'center',
              color: 'rgba(255,255,255,0.35)',
              maxWidth: '400px',
              margin: '0 auto 32px',
              lineHeight: 1.6,
            } as React.CSSProperties}
          >
            Based on the briefing, configure how aggressively Dispatch should act on your behalf.
          </p>

          {/* Confidence threshold panel */}
          <div
            className="stagger-fade-up dispatch-card-hover"
            style={{
              '--stagger': 2,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '8px',
            } as React.CSSProperties}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  style={{
                    fontFamily: "'KMR Apparat', system-ui, sans-serif",
                    fontSize: '9px',
                    fontWeight: 300,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.25)',
                  }}
                >
                  Confidence Threshold
                </span>
                <span
                  style={{
                    fontFamily: "'KMR Apparat', system-ui, sans-serif",
                    fontSize: '24px',
                    fontWeight: 300,
                    color: 'rgba(255,255,255,0.82)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {Math.round(agentRules.autoApproveThreshold * 100)}%
                </span>
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
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '9px',
                  fontFamily: "'KMR Apparat', system-ui, sans-serif",
                  fontWeight: 300,
                  color: 'rgba(255,255,255,0.18)',
                  letterSpacing: '0.1em',
                }}
              >
                <span>50% — PERMISSIVE</span>
                <span>99% — STRICT</span>
              </div>
            </div>
          </div>

          {/* Toggle rules */}
          <div
            className="stagger-fade-up"
            style={{
              '--stagger': 3,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              marginBottom: '8px',
              overflow: 'hidden',
            } as React.CSSProperties}
          >
            {TOGGLE_RULES.map((rule, idx) => (
              <button
                key={rule.key}
                onClick={() => setAgentRules({ [rule.key]: !agentRules[rule.key] })}
                style={{
                  display: 'flex',
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  background: 'transparent',
                  border: 'none',
                  borderTop: idx > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'KMR Apparat', system-ui, sans-serif",
                      fontSize: '14px',
                      fontWeight: 400,
                      color: 'rgba(255,255,255,0.82)',
                      marginBottom: '2px',
                    }}
                  >
                    {rule.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "'KMR Apparat', system-ui, sans-serif",
                      fontSize: '12px',
                      fontWeight: 300,
                      color: 'rgba(255,255,255,0.35)',
                    }}
                  >
                    {rule.desc}
                  </div>
                </div>
                {/* Toggle track — spring animation */}
                <span
                  className="dispatch-toggle-track"
                  style={{
                    position: 'relative',
                    flexShrink: 0,
                    marginLeft: '16px',
                    display: 'inline-block',
                    width: '36px',
                    height: '20px',
                    borderRadius: '9999px',
                    background: agentRules[rule.key] ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.12)',
                  }}
                >
                  <span
                    className="dispatch-toggle-thumb"
                    style={{
                      position: 'absolute',
                      top: '2px',
                      left: agentRules[rule.key] ? '18px' : '2px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '9999px',
                      background: '#0A0A0A',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                    }}
                  />
                </span>
              </button>
            ))}
          </div>

          {/* Tone selector */}
          <div
            className="stagger-fade-up"
            style={{
              '--stagger': 4,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '32px',
            } as React.CSSProperties}
          >
            <div
              style={{
                fontFamily: "'KMR Apparat', system-ui, sans-serif",
                fontSize: '13px',
                fontWeight: 300,
                color: 'rgba(255,255,255,0.45)',
                marginBottom: '12px',
                letterSpacing: '0.04em',
              }}
            >
              Reply tone
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TONE_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setAgentRules({ tone: opt.key })}
                  className="dispatch-card-hover"
                  style={{
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: agentRules.tone === opt.key ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)',
                    background: agentRules.tone === opt.key ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.03)',
                    padding: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'KMR Apparat', system-ui, sans-serif",
                      fontSize: '13px',
                      fontWeight: 400,
                      color: agentRules.tone === opt.key ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)',
                      transition: 'color 0.15s ease',
                    }}
                  >
                    {opt.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "'KMR Apparat', system-ui, sans-serif",
                      fontSize: '10px',
                      fontWeight: 300,
                      marginTop: '2px',
                      color: agentRules.tone === opt.key ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)',
                      transition: 'color 0.15s ease',
                    }}
                  >
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="stagger-fade-up text-center" style={{ '--stagger': 5 } as React.CSSProperties}>
            <button
              onClick={() => navigateTo('command')}
              className="dispatch-btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                borderRadius: '9999px',
                background: '#fff',
                color: '#0A0A0A',
                border: 'none',
                padding: '14px 32px',
                fontFamily: "'KMR Apparat', system-ui, sans-serif",
                fontSize: '13px',
                fontWeight: 400,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Activate Dispatch
              <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </div>
    </ScreenShell>
  )
}
