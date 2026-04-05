'use client'

import { ScreenShell } from '@/components/layout/screen-shell'
import { useDispatchStore } from '@/lib/store'
import { seedDemo } from '@/lib/api'
import { Zap, MessageSquare, AlertTriangle, Layers } from 'lucide-react'

const ICONS: Record<string, typeof Zap> = { Zap, MessageSquare, AlertTriangle, Layers }

export function DeployScreen() {
  const {
    missionPresets,
    guardrails,
    togglePreset,
    toggleGuardrail,
    gmailConnected,
    setDataSource,
    navigateTo,
    setLoading,
  } = useDispatchStore()

  const handleStartDemo = async () => {
    setLoading(true)
    try {
      await seedDemo()
      setDataSource('demo')
      navigateTo('sweep')
    } catch (err) {
      console.error('Failed to seed demo:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleConnectGmail = () => {
    window.location.assign('/api/gmail/connect')
  }

  const handleStartSweep = () => {
    if (gmailConnected) {
      setDataSource('gmail')
      navigateTo('sweep')
    } else {
      handleStartDemo()
    }
  }

  return (
    <ScreenShell className="flex flex-col overflow-hidden">
      {/* ── Body ── */}
      <div className="flex flex-1 items-center justify-center overflow-y-auto" style={{ padding: '36px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '64px', width: '100%', maxWidth: '1320px', alignItems: 'center' }}>

          {/* Left: Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Kicker */}
            <div className="stagger-fade-up" style={{
              '--stagger': 0,
              fontFamily: "'KMR Apparat', system-ui, sans-serif",
              fontSize: '9px',
              fontWeight: 300,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.2)',
            } as React.CSSProperties}>
              Mission Briefing
            </div>

            {/* Brand lockup */}
            <div className="stagger-fade-up" style={{ '--stagger': 1 } as React.CSSProperties}>
              <p style={{
                maxWidth: '420px',
                fontSize: '15px',
                fontWeight: 300,
                lineHeight: 1.75,
                color: 'rgba(255,255,255,0.45)',
                fontFamily: "'KMR Apparat', system-ui, sans-serif",
              }}>
                Your AI support operator. It reads every conversation, drafts
                replies, flags what needs attention — you stay in control.
              </p>
            </div>

            {/* Gmail status pill */}
            <div className="stagger-fade-up" style={{ '--stagger': 2 } as React.CSSProperties}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '5px 12px',
                borderRadius: '9999px',
                background: 'rgba(255,255,255,0.06)',
                fontFamily: "'KMR Apparat', system-ui, sans-serif",
                fontSize: '11px',
                fontWeight: 300,
                letterSpacing: '0.06em',
                color: 'rgba(255,255,255,0.45)',
              }}>
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '9999px',
                  background: gmailConnected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)',
                  flexShrink: 0,
                }} />
                {gmailConnected ? 'Gmail linked' : 'Gmail not connected'}
              </span>
            </div>
          </div>

          {/* Right: Mission Config */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Connect inbox card */}
            <div className="stagger-fade-up dispatch-card-hover" style={{
              '--stagger': 3,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '24px',
            } as React.CSSProperties}>
              <div style={{
                fontFamily: "'KMR Apparat', system-ui, sans-serif",
                fontSize: '17px',
                fontWeight: 400,
                color: 'rgba(255,255,255,0.82)',
              }}>
                Connect your support inbox
              </div>
              <p style={{
                marginTop: '4px',
                fontSize: '13px',
                fontWeight: 300,
                color: 'rgba(255,255,255,0.35)',
                fontFamily: "'KMR Apparat', system-ui, sans-serif",
              }}>
                Choose a mission profile and Dispatch will begin investigating.
              </p>
            </div>

            {/* Mission presets */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {missionPresets.map((preset, i) => {
                const Icon = ICONS[preset.icon] || Zap
                return (
                  <button
                    key={preset.id}
                    onClick={() => togglePreset(preset.id)}
                    className="stagger-fade-up dispatch-card-hover"
                    style={{
                      '--stagger': 4 + i,
                      background: preset.selected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)',
                      borderRadius: '8px',
                      padding: '16px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontFamily: "'KMR Apparat', system-ui, sans-serif",
                      border: 'none',
                    } as React.CSSProperties}
                  >
                    <Icon
                      size={20}
                      style={{
                        marginBottom: '8px',
                        color: preset.selected ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)',
                        transition: 'color 0.15s ease',
                      }}
                    />
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 400,
                      color: 'rgba(255,255,255,0.82)',
                    }}>
                      {preset.label}
                    </div>
                    <div style={{
                      marginTop: '3px',
                      fontSize: '11px',
                      fontWeight: 300,
                      color: 'rgba(255,255,255,0.35)',
                    }}>
                      {preset.description}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Guardrails */}
            <div className="stagger-fade-up" style={{ '--stagger': 8 } as React.CSSProperties}>
              {guardrails.map((g, i) => (
                <button
                  key={g.id}
                  onClick={() => toggleGuardrail(g.id)}
                  style={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 0',
                    borderBottom: i < guardrails.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    background: 'transparent',
                    border: 'none',
                    borderBottomColor: i < guardrails.length - 1 ? 'rgba(255,255,255,0.06)' : undefined,
                    borderBottomStyle: i < guardrails.length - 1 ? 'solid' : undefined,
                    borderBottomWidth: i < guardrails.length - 1 ? '1px' : undefined,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: "'KMR Apparat', system-ui, sans-serif",
                  }}
                >
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 300,
                    color: 'rgba(255,255,255,0.7)',
                  }}>
                    {g.label}
                  </span>
                  {/* Toggle */}
                  <span className="dispatch-toggle-track" style={{
                    position: 'relative',
                    display: 'inline-block',
                    height: '20px',
                    width: '36px',
                    borderRadius: '9999px',
                    background: g.enabled ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.12)',
                    flexShrink: 0,
                  }}>
                    <span className="dispatch-toggle-thumb" style={{
                      position: 'absolute',
                      top: '2px',
                      left: g.enabled ? '16px' : '2px',
                      height: '16px',
                      width: '16px',
                      borderRadius: '9999px',
                      background: '#0A0A0A',
                    }} />
                  </span>
                </button>
              ))}
            </div>

            {/* CTAs */}
            <div className="stagger-fade-up" style={{
              '--stagger': 9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              paddingTop: '4px',
            } as React.CSSProperties}>
              {!gmailConnected ? (
                <button
                  onClick={handleConnectGmail}
                  className="dispatch-btn-ghost"
                  style={{
                    borderRadius: '9999px',
                    background: 'rgba(255,255,255,0.06)',
                    border: 'none',
                    padding: '14px 32px',
                    fontFamily: "'KMR Apparat', system-ui, sans-serif",
                    fontSize: '13px',
                    fontWeight: 300,
                    color: 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                  }}
                >
                  Connect Gmail
                </button>
              ) : (
                <button
                  onClick={handleStartDemo}
                  className="dispatch-btn-ghost"
                  style={{
                    borderRadius: '9999px',
                    background: 'rgba(255,255,255,0.06)',
                    border: 'none',
                    padding: '14px 32px',
                    fontFamily: "'KMR Apparat', system-ui, sans-serif",
                    fontSize: '13px',
                    fontWeight: 300,
                    color: 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                  }}
                >
                  Use Demo Data
                </button>
              )}

              <button
                onClick={handleStartSweep}
                className="dispatch-btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 32px',
                  borderRadius: '9999px',
                  background: '#fff',
                  color: '#0A0A0A',
                  fontFamily: "'KMR Apparat', system-ui, sans-serif",
                  fontSize: '13px',
                  fontWeight: 400,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Zap size={15} />
                Launch Sweep
              </button>
            </div>
          </div>
        </div>
      </div>
    </ScreenShell>
  )
}
