'use client'

interface Cluster {
  id: string
  title: string
  severity: string
  emailCount: number
  firstSeen: string
  lastSeen: string
  trending: boolean
  suggestedAction: string
}

interface ClusterAlertsProps {
  clusters: Cluster[]
}

const severityStyles: Record<string, { border: string; bg: string; badge: string; badgeText: string }> = {
  critical: { border: '#dc2626', bg: '#1a0a0a', badge: '#dc2626', badgeText: 'white' },
  high: { border: '#f97316', bg: '#1a1208', badge: '#f97316', badgeText: 'white' },
  medium: { border: '#eab308', bg: '#1a1a10', badge: '#eab308', badgeText: '#1a1a1a' },
  low: { border: '#6b6b80', bg: '#12121a', badge: '#6b6b80', badgeText: 'white' },
}

export function ClusterAlerts({ clusters }: ClusterAlertsProps) {
  if (!clusters || clusters.length === 0) return null

  const criticalCount = clusters.filter((c) => c.severity === 'critical').length

  return (
    <div className="mb-5">
      <div className="text-sm font-semibold mb-3 flex items-center gap-2">
        Issue Clusters
        {criticalCount > 0 && (
          <span className="bg-[#dc2626] text-white text-[10px] px-2 py-0.5 rounded-full">
            {criticalCount} CRITICAL
          </span>
        )}
      </div>
      {clusters.map((cluster) => {
        const style = severityStyles[cluster.severity] || severityStyles.low
        return (
          <div
            key={cluster.id}
            className="rounded-xl p-4 mb-2.5"
            style={{
              border: `1px solid ${style.border}`,
              background: style.bg,
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold">{cluster.title}</span>
              <span
                className="text-[11px] px-2 py-0.5 rounded font-semibold"
                style={{ background: style.badge, color: style.badgeText }}
              >
                {cluster.severity.toUpperCase()}
              </span>
            </div>
            <div className="text-xs text-[#6b6b80] mb-2">
              {cluster.emailCount} reports
              {cluster.trending && (
                <span className="text-[#f87171] ml-1.5">trending up</span>
              )}
            </div>
            <div className="text-xs text-[#a78bfa]">
              Suggested: {cluster.suggestedAction}
            </div>
          </div>
        )
      })}
    </div>
  )
}
