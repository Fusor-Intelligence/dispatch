'use client'

import { ScreenShell } from '@/components/layout/screen-shell'
import { useDispatchStore } from '@/lib/store'
import { CheckCircle, AlertTriangle, Layers, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const SEVERITY_STYLES: Record<string, { border: string; bg: string; badge: string; badgeText: string }> = {
  critical: { border: '#f3755c', bg: 'linear-gradient(180deg, rgba(73,27,23,0.94), rgba(31,13,13,0.92))', badge: '#f3755c', badgeText: '#fff5f3' },
  high: { border: '#f3b36b', bg: 'linear-gradient(180deg, rgba(63,40,20,0.94), rgba(26,17,12,0.92))', badge: '#f3b36b', badgeText: '#2d1d0f' },
  medium: { border: '#f8e08f', bg: 'linear-gradient(180deg, rgba(55,51,22,0.94), rgba(22,20,13,0.92))', badge: '#f8e08f', badgeText: '#2d2814' },
  low: { border: '#7f92a8', bg: 'linear-gradient(180deg, rgba(21,30,41,0.94), rgba(10,16,23,0.92))', badge: '#7f92a8', badgeText: '#f8fafc' },
}

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
    <ScreenShell className="flex items-center justify-center px-6">
      <div className="w-full max-w-4xl">
        <div className="dispatch-kicker mb-6 text-center">Agent Brief</div>

        {/* Narrative */}
        <div className="mb-10 space-y-2 text-center">
          {narrativeLines.map((line, i) => (
            <div
              key={i}
              className="number-reveal font-heading text-2xl leading-relaxed text-[#d8e1ea] sm:text-3xl"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {line.text}{line.text ? ' ' : ''}
              <span className="font-semibold text-[#f3b36b]">{line.value}</span>{' '}
              {line.suffix}
            </div>
          ))}
        </div>

        {/* Three summary blocks */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="dispatch-panel relative overflow-hidden p-5">
            <div className="absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,_rgba(74,222,128,0.16),_transparent)]" />
            <div className="relative">
              <CheckCircle size={24} className="mb-3 text-[#6ee7b7]" />
              <div className="text-3xl font-semibold text-[#8ce7b1]">{handledCount}</div>
              <div className="mt-1 text-sm font-medium text-[#d8e1ea]">Handled</div>
              <div className="mt-1 text-xs text-[#8ea0b5]">Auto-replied or resolved by AI</div>
            </div>
          </div>

          <div className="dispatch-panel relative overflow-hidden p-5">
            <div className="absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,_rgba(243,179,107,0.16),_transparent)]" />
            <div className="relative">
              <AlertTriangle size={24} className="mb-3 text-[#f3b36b]" />
              <div className="text-3xl font-semibold text-[#ffd6a8]">{reviewCount}</div>
              <div className="mt-1 text-sm font-medium text-[#d8e1ea]">Needs Judgment</div>
              <div className="mt-1 text-xs text-[#8ea0b5]">Requires human review before action</div>
            </div>
          </div>

          <div className="dispatch-panel relative overflow-hidden p-5">
            <div className="absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,_rgba(243,117,92,0.16),_transparent)]" />
            <div className="relative">
              <Layers size={24} className="mb-3 text-[#f3755c]" />
              <div className="text-3xl font-semibold text-[#f8a88f]">{incidentCount}</div>
              <div className="mt-1 text-sm font-medium text-[#d8e1ea]">Recurring Incidents</div>
              <div className="mt-1 text-xs text-[#8ea0b5]">Clusters of related complaints</div>
            </div>
          </div>
        </div>

        {/* Hero cluster card */}
        {heroCluster && (
          <div
            className="mb-8 rounded-[28px] border p-6"
            style={{
              borderColor: SEVERITY_STYLES[heroCluster.severity]?.border ?? '#7f92a8',
              background: SEVERITY_STYLES[heroCluster.severity]?.bg ?? SEVERITY_STYLES.low.bg,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 18px 42px ${(SEVERITY_STYLES[heroCluster.severity]?.border ?? '#7f92a8')}12`,
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="dispatch-kicker mb-2 text-[#f3b36b]">Biggest Pattern</div>
                <div className="text-xl font-semibold text-[#fff7ed]">{heroCluster.title}</div>
                <div className="mt-2 text-sm text-[#c8d3de]">
                  {heroCluster.emailCount} reports · Severity: {heroCluster.severity}
                  {heroCluster.trending && ' · Trending'}
                </div>
              </div>
              <span
                className="shrink-0 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em]"
                style={{
                  background: SEVERITY_STYLES[heroCluster.severity]?.badge,
                  color: SEVERITY_STYLES[heroCluster.severity]?.badgeText,
                }}
              >
                {heroCluster.severity}
              </span>
            </div>
            <div className="mt-4 rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-4 text-sm leading-6 text-[#f5f7fa]">
              <span className="font-semibold text-[#f3b36b]">Recommended action:</span>{' '}
              {heroCluster.suggestedAction}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => navigateTo('rules')}
            className="inline-flex items-center gap-3 rounded-[1.4rem] border border-[rgba(243,179,107,0.3)] bg-[linear-gradient(180deg,_rgba(243,179,107,0.2),_rgba(86,52,22,0.2))] px-8 py-4 font-semibold text-white transition hover:border-[rgba(243,179,107,0.5)]"
          >
            Set Rules
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </ScreenShell>
  )
}
