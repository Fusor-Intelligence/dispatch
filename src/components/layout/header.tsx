'use client'

import type { DashboardStats } from '@/lib/types'

interface HeaderProps {
  stats: DashboardStats | null
  gmailConnected: boolean
  syncing: boolean
  onSync: () => void
  onConnect: () => void
  onLoadDemo: () => void
}

export function Header({ stats, gmailConnected, syncing, onSync, onConnect, onLoadDemo }: HeaderProps) {
  const automationRate = stats && stats.totalEmails > 0
    ? Math.round((stats.autoResolved / stats.totalEmails) * 100)
    : 0

  return (
    <div className="dispatch-panel-strong relative mb-6 overflow-hidden p-5 sm:p-7">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(243,179,107,0.18),_transparent_34%),radial-gradient(circle_at_25%_0%,_rgba(99,102,241,0.16),_transparent_30%)]" />
      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <div className="dispatch-kicker mb-3">Support Intelligence Console</div>
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-[rgba(243,179,107,0.25)] bg-[linear-gradient(180deg,_rgba(243,179,107,0.22),_rgba(243,179,107,0.08))] text-2xl font-semibold text-[#ffd8ac] shadow-[0_14px_30px_rgba(243,179,107,0.12)]">
              D
            </div>
            <div className="space-y-2">
              <div className="font-heading text-4xl leading-none text-[#f6f1e8] sm:text-5xl">
                Dispatch
              </div>
              <p className="max-w-2xl text-sm leading-6 text-[#a8b7c8] sm:text-[15px]">
                Turn a support inbox into an incident feed: auto-draft repetitive replies,
                route edge cases, and surface the product issues that keep showing up.
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <span className="dispatch-pill">
              <span className={`h-2 w-2 rounded-full ${gmailConnected ? 'bg-[#6ee7b7]' : 'bg-[#fb923c]'}`} />
              {gmailConnected ? 'Gmail linked' : 'Gmail disconnected'}
            </span>
            <span className="dispatch-pill">{stats?.totalEmails ?? 0} emails in view</span>
            <span className="dispatch-pill">{automationRate}% automation rate</span>
            <span className="dispatch-pill">{stats?.openIssues ?? 0} active issue clusters</span>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:w-[380px]">
          {gmailConnected ? (
            <button
              onClick={onSync}
              disabled={syncing}
              className="rounded-[1.35rem] border border-[#2c4760] bg-[linear-gradient(180deg,_#12273a,_#0d1b29)] px-4 py-3 text-left text-sm text-white transition hover:border-[#3d6286] hover:bg-[linear-gradient(180deg,_#18324a,_#102233)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="font-semibold">{syncing ? 'Syncing Inbox...' : 'Sync Inbox'}</div>
              <div className="mt-1 text-xs text-[#8fb5d8]">Ingest Gmail, classify, route, and refresh the dashboard.</div>
            </button>
          ) : (
            <button
              onClick={onConnect}
              className="rounded-[1.35rem] border border-[rgba(243,179,107,0.28)] bg-[linear-gradient(180deg,_rgba(243,179,107,0.18),_rgba(86,52,22,0.18))] px-4 py-3 text-left text-sm text-white transition hover:border-[rgba(243,179,107,0.45)] hover:bg-[linear-gradient(180deg,_rgba(243,179,107,0.24),_rgba(86,52,22,0.26))]"
            >
              <div className="font-semibold">Connect Gmail</div>
              <div className="mt-1 text-xs text-[#f3d2aa]">Use the live inbox path for the real demo loop.</div>
            </button>
          )}
          <button
            onClick={onLoadDemo}
            disabled={syncing}
            className="rounded-[1.35rem] border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-left text-sm text-white transition hover:border-[rgba(255,255,255,0.16)] hover:bg-[rgba(255,255,255,0.06)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="font-semibold">{syncing ? 'Loading Demo State...' : 'Load Demo Data'}</div>
            <div className="mt-1 text-xs text-[#a6b6c8]">Fallback dataset with resolved drafts, routes, and recurring issues.</div>
          </button>
        </div>
      </div>
    </div>
  )
}
