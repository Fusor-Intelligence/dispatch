'use client'

interface RoutingQueueProps {
  queue: Record<string, number> | undefined
}

export function RoutingQueue({ queue }: RoutingQueueProps) {
  if (!queue) return null

  const entries = Object.entries(queue).sort((a, b) => b[1] - a[1])

  return (
    <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-5">
      <div className="text-[13px] font-semibold mb-4">Routing Queue</div>
      {entries.map(([team, count], i) => (
        <div
          key={team}
          className={`flex justify-between items-center py-2.5 text-xs ${
            i < entries.length - 1 ? 'border-b border-[#1a1a24]' : ''
          }`}
        >
          <span className="font-medium">{team}</span>
          <span className="bg-[#1e1e2e] px-2.5 py-0.5 rounded-full text-[11px]">
            {count}
          </span>
        </div>
      ))}
      {entries.length === 0 && (
        <div className="text-[#6b6b80] text-xs py-2">No emails routed yet</div>
      )}
    </div>
  )
}
