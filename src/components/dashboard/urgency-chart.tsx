'use client'

const COLORS: Record<string, string> = {
  low: '#6b6b80',
  medium: '#eab308',
  high: '#f97316',
  critical: '#dc2626',
}

interface UrgencyChartProps {
  breakdown: Record<string, number> | undefined
}

export function UrgencyChart({ breakdown }: UrgencyChartProps) {
  if (!breakdown) return null

  const data = ['low', 'medium', 'high', 'critical'].map((key) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: breakdown[key] || 0,
    color: COLORS[key],
  }))
  const maxValue = Math.max(...data.map((item) => item.value), 1)

  return (
    <div className="dispatch-panel p-5">
      <div className="dispatch-kicker mb-2">Risk Profile</div>
      <div className="mb-4 text-lg font-semibold text-[#f4efe7]">Urgency Distribution</div>
      <div className="space-y-3">
        {data.map((entry) => (
          <div key={entry.name}>
            <div className="mb-1 flex items-center justify-between text-xs text-[#a9b8c8]">
              <span>{entry.name}</span>
              <span className="font-mono text-[#dce5ee]">{entry.value}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.05)]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max((entry.value / maxValue) * 100, entry.value > 0 ? 10 : 0)}%`,
                  background: entry.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
