'use client'

interface RoutingQueueProps {
  queue: Record<string, number> | undefined
}

export function RoutingQueue({ queue }: RoutingQueueProps) {
  if (!queue) return null

  const entries = Object.entries(queue).sort((a, b) => b[1] - a[1])
  const maxCount = Math.max(...entries.map(([, count]) => count), 1)

  return (
    <div className="dispatch-panel p-5">
      <div className="dispatch-kicker mb-2">Ownership</div>
      <div className="mb-4 text-lg font-semibold text-[#f4efe7]">Routing Queue</div>
      {entries.map(([team, count], i) => (
        <div
          key={team}
          className={`py-3 text-xs ${
            i < entries.length - 1 ? 'border-b border-[rgba(255,255,255,0.06)]' : ''
          }`}
        >
          <div className="mb-1 flex items-center justify-between">
            <span className="font-medium text-[#e5ebf2]">{team}</span>
            <span className="rounded-full bg-[rgba(255,255,255,0.04)] px-2.5 py-0.5 text-[11px] text-[#aab9c9]">
              {count}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.05)]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,_#f3b36b,_#7aa9db)]"
              style={{ width: `${Math.max((count / maxCount) * 100, count > 0 ? 12 : 0)}%` }}
            />
          </div>
        </div>
      ))}
      {entries.length === 0 && (
        <div className="py-2 text-xs text-[#8ea0b5]">No emails routed yet</div>
      )}
    </div>
  )
}
