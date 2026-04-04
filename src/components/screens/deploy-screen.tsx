'use client'

import { ScreenShell } from '@/components/layout/screen-shell'
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
    <ScreenShell className="flex items-center justify-center px-8">
      <div className="grid w-full max-w-[1320px] gap-12 xl:grid-cols-[1fr_1.25fr] xl:items-center">
        {/* Left: Brand */}
        <div className="space-y-6">
          <div className="dispatch-kicker">Mission Briefing</div>
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.6rem] border border-[rgba(243,179,107,0.25)] bg-[linear-gradient(180deg,_rgba(243,179,107,0.22),_rgba(243,179,107,0.08))] text-3xl font-semibold text-[#ffd8ac] shadow-[0_14px_30px_rgba(243,179,107,0.12)]">
              D
            </div>
            <div>
              <h1 className="font-heading text-5xl leading-none text-[#f6f1e8] sm:text-6xl">
                Dispatch
              </h1>
              <p className="mt-3 max-w-md text-[15px] leading-7 text-[#a8b7c8]">
                Assign an AI operator to your support inbox. It reads, triages,
                drafts replies, and surfaces the issues that matter — you approve
                the decisions.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <span className="dispatch-pill">
              <span className={`h-2 w-2 rounded-full ${gmailConnected ? 'bg-[#6ee7b7]' : 'bg-[#fb923c]'}`} />
              {gmailConnected ? 'Gmail linked' : 'Gmail not connected'}
            </span>
          </div>
        </div>

        {/* Right: Mission Config */}
        <div className="space-y-5">
          {/* Prompt card */}
          <div className="dispatch-panel-strong p-6">
            <div className="text-lg font-semibold text-[#f4efe7]">Connect your support inbox</div>
            <p className="mt-1 text-sm text-[#8ea0b5]">
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
                  className={cn(
                    'dispatch-panel p-4 text-left transition-all',
                    preset.selected
                      ? 'border-[rgba(243,179,107,0.35)] shadow-[0_0_24px_rgba(243,179,107,0.08)]'
                      : 'hover:border-[rgba(255,255,255,0.14)]'
                  )}
                >
                  <Icon
                    size={20}
                    className={cn(
                      'mb-2',
                      preset.selected ? 'text-[#f3b36b]' : 'text-[#6c7d92]'
                    )}
                  />
                  <div className="text-sm font-semibold text-[#f4efe7]">{preset.label}</div>
                  <div className="mt-1 text-xs text-[#8ea0b5]">{preset.description}</div>
                </button>
              )
            })}
          </div>

          {/* Guardrails */}
          <div className="dispatch-panel space-y-0 divide-y divide-[rgba(255,255,255,0.06)] px-5">
            {guardrails.map((g) => (
              <button
                key={g.id}
                onClick={() => toggleGuardrail(g.id)}
                className="flex w-full items-center justify-between py-3.5 text-left"
              >
                <span className="text-sm text-[#d8e1ea]">{g.label}</span>
                <span
                  className={cn(
                    'relative h-5 w-9 rounded-full transition-colors',
                    g.enabled ? 'bg-[#f3b36b]' : 'bg-[rgba(255,255,255,0.12)]'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
                      g.enabled ? 'translate-x-4' : 'translate-x-0.5'
                    )}
                  />
                </span>
              </button>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex items-center justify-between gap-3 pt-1">
            {!gmailConnected ? (
              <button
                onClick={handleConnectGmail}
                className="rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-5 py-3 text-sm text-[#9fb0c5] transition hover:bg-[rgba(255,255,255,0.06)]"
              >
                Connect Gmail
              </button>
            ) : (
              <button
                onClick={handleStartDemo}
                className="rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-5 py-3 text-sm text-[#9fb0c5] transition hover:bg-[rgba(255,255,255,0.06)]"
              >
                Use Demo Data
              </button>
            )}
            <button
              onClick={handleStartSweep}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 32px',
                borderRadius: '9999px',
                background: '#f3b36b',
                color: '#0A0A0A',
                fontFamily: "'Apparat', system-ui, sans-serif",
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                border: 'none',
                cursor: 'pointer',
                transition: 'filter 0.375s ease, transform 0.375s cubic-bezier(0, .55, .45, 1)',
                boxShadow: '0 8px 32px rgba(243, 179, 107, 0.3)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.1)';
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
    </ScreenShell>
  )
}
