'use client'

import { ScreenShell } from '@/components/layout/screen-shell'
import { TopBar } from '@/components/layout/top-bar'
import { useDispatchStore } from '@/lib/store'
import { seedDemo } from '@/lib/api'
import { Zap, MessageSquare, AlertTriangle, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

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
      {/* ── Top bar ── */}
      <TopBar label="Configure" />

      {/* ── Body ── */}
      <div className="flex flex-1 items-center justify-center overflow-y-auto px-[42px] py-10 xl:px-16">
        <div className="grid w-full max-w-[1320px] gap-12 xl:grid-cols-[1fr_1.25fr] xl:items-center">

          {/* Left: Brand */}
          <div className="space-y-6">
            {/* Kicker */}
            <div style={{
              fontFamily: "'KMR Apparat', system-ui, sans-serif",
              fontSize: '9px',
              fontWeight: 600,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.2)',
            }}>
              Mission Briefing
            </div>

            {/* Brand lockup */}
            <div className="flex items-start gap-5">
              {/* D icon */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '64px',
                width: '64px',
                flexShrink: 0,
                borderRadius: '1.6rem',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.06)',
                fontFamily: "'KMR Apparat', system-ui, sans-serif",
                fontSize: '28px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.82)',
              }}>
                D
              </div>

              <div>
                <h1 style={{
                  fontFamily: "'KMR Apparat', system-ui, sans-serif",
                  fontSize: '56px',
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: '-0.03em',
                  color: 'rgba(255,255,255,0.85)',
                }}>
                  Dispatch
                </h1>
                <p style={{
                  marginTop: '12px',
                  maxWidth: '420px',
                  fontSize: '15px',
                  lineHeight: 1.75,
                  color: 'rgba(255,255,255,0.45)',
                  fontFamily: "'KMR Apparat', system-ui, sans-serif",
                }}>
                  Assign an AI operator to your support inbox. It reads, triages,
                  drafts replies, and surfaces the issues that matter — you approve
                  the decisions.
                </p>
              </div>
            </div>

            {/* Gmail status pill */}
            <div className="flex flex-wrap gap-2.5">
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '5px 12px',
                borderRadius: '9999px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)',
                fontFamily: "'KMR Apparat', system-ui, sans-serif",
                fontSize: '11px',
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
          <div className="space-y-5">
            {/* Connect inbox card */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '24px',
            }}>
              <div style={{
                fontFamily: "'KMR Apparat', system-ui, sans-serif",
                fontSize: '17px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.82)',
              }}>
                Connect your support inbox
              </div>
              <p style={{
                marginTop: '4px',
                fontSize: '13px',
                color: 'rgba(255,255,255,0.35)',
                fontFamily: "'KMR Apparat', system-ui, sans-serif",
              }}>
                Choose a mission profile and Dispatch will begin investigating.
              </p>
            </div>

            {/* Mission presets */}
            <div className="grid grid-cols-2 gap-3">
              {missionPresets.map((preset) => {
                const Icon = ICONS[preset.icon] || Zap
                return (
                  <button
                    key={preset.id}
                    onClick={() => togglePreset(preset.id)}
                    style={{
                      background: preset.selected ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${preset.selected ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: '14px',
                      padding: '16px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease, border-color 0.15s ease',
                      fontFamily: "'KMR Apparat', system-ui, sans-serif",
                    }}
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
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.82)',
                    }}>
                      {preset.label}
                    </div>
                    <div style={{
                      marginTop: '3px',
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.35)',
                    }}>
                      {preset.description}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Guardrails */}
            <div style={{ borderRadius: '14px' }}>
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
                    color: 'rgba(255,255,255,0.7)',
                  }}>
                    {g.label}
                  </span>
                  {/* Toggle */}
                  <span style={{
                    position: 'relative',
                    display: 'inline-block',
                    height: '20px',
                    width: '36px',
                    borderRadius: '9999px',
                    background: g.enabled ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.12)',
                    transition: 'background 0.2s ease',
                    flexShrink: 0,
                  }}>
                    <span style={{
                      position: 'absolute',
                      top: '2px',
                      left: g.enabled ? '16px' : '2px',
                      height: '16px',
                      width: '16px',
                      borderRadius: '9999px',
                      background: '#0A0A0A',
                      transition: 'left 0.2s ease',
                    }} />
                  </span>
                </button>
              ))}
            </div>

            {/* CTAs */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              paddingTop: '4px',
            }}>
              {!gmailConnected ? (
                <button
                  onClick={handleConnectGmail}
                  style={{
                    borderRadius: '9999px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'transparent',
                    padding: '12px 20px',
                    fontFamily: "'KMR Apparat', system-ui, sans-serif",
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                >
                  Connect Gmail
                </button>
              ) : (
                <button
                  onClick={handleStartDemo}
                  style={{
                    borderRadius: '9999px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'transparent',
                    padding: '12px 20px',
                    fontFamily: "'KMR Apparat', system-ui, sans-serif",
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                >
                  Use Demo Data
                </button>
              )}

              <button
                onClick={handleStartSweep}
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
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'filter 0.2s ease, transform 0.2s cubic-bezier(0, .55, .45, 1)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(0.92)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
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
