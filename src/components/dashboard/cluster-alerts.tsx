'use client'

import type { IssueCluster } from '@/lib/types'

interface ClusterAlertsProps {
  clusters: IssueCluster[]
}

const severityStyles: Record<string, { border: string; bg: string; badge: string; badgeText: string }> = {
  critical: { border: '#f3755c', bg: 'linear-gradient(180deg, rgba(73,27,23,0.94), rgba(31,13,13,0.92))', badge: '#f3755c', badgeText: '#fff5f3' },
  high: { border: '#f3b36b', bg: 'linear-gradient(180deg, rgba(63,40,20,0.94), rgba(26,17,12,0.92))', badge: '#f3b36b', badgeText: '#2d1d0f' },
  medium: { border: '#f8e08f', bg: 'linear-gradient(180deg, rgba(55,51,22,0.94), rgba(22,20,13,0.92))', badge: '#f8e08f', badgeText: '#2d2814' },
  low: { border: '#7f92a8', bg: 'linear-gradient(180deg, rgba(21,30,41,0.94), rgba(10,16,23,0.92))', badge: '#7f92a8', badgeText: '#f8fafc' },
}

export function ClusterAlerts({ clusters }: ClusterAlertsProps) {
  const criticalCount = clusters.filter((c) => c.severity === 'critical').length

  return (
    <section className="dispatch-panel overflow-hidden p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="dispatch-kicker mb-2">Pattern Detection</div>
          <div className="text-xl font-semibold text-[#f4efe7]">Issue Clusters</div>
          <p className="mt-1 text-sm text-[#9fb0c5]">
            The repeated problems worth escalating before the inbox buries them.
          </p>
        </div>
        {criticalCount > 0 && (
          <span className="dispatch-pill border-[#5d2f2c] bg-[rgba(243,117,92,0.12)] text-[#ffc3b7]">
            {criticalCount} CRITICAL
          </span>
        )}
      </div>
      {clusters.length === 0 ? (
        <div className="mt-5 rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-5 py-6 text-sm text-[#91a2b7]">
          No recurring issue clusters yet. Once complaints or bug reports start repeating, they’ll appear here.
        </div>
      ) : (
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {clusters.map((cluster) => {
            const style = severityStyles[cluster.severity] || severityStyles.low
            return (
              <div
                key={cluster.id}
                className="rounded-[24px] border p-4"
                style={{
                  borderColor: style.border,
                  background: style.bg,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 18px 42px ${style.border}12`,
                }}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-[#fff7ed]">{cluster.title}</div>
                    <div className="mt-1 text-xs text-[#c8d3de]">
                      {cluster.emailCount} reports • first seen {new Date(cluster.firstSeen).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.22em]"
                    style={{ background: style.badge, color: style.badgeText }}
                  >
                    {cluster.severity.toUpperCase()}
                  </span>
                </div>
                <div className="mb-3 flex flex-wrap gap-2 text-[11px] text-[#d6e1eb]">
                  {cluster.trending && (
                    <span className="rounded-full border border-[rgba(255,255,255,0.16)] px-2 py-1 text-[#ffd5c7]">
                      Trending up
                    </span>
                  )}
                  <span className="rounded-full border border-[rgba(255,255,255,0.12)] px-2 py-1">
                    Last seen {new Date(cluster.lastSeen).toLocaleDateString()}
                  </span>
                </div>
                <div className="rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-3 text-sm leading-6 text-[#f5f7fa]">
                  <span className="font-semibold text-[#f3b36b]">Suggested action:</span> {cluster.suggestedAction}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
