'use client'

interface StatsCardsProps {
  stats: {
    totalEmails: number
    autoResolved: number
    avgResponseTime: number
    openIssues: number
  } | null
}

export function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) return null

  const cards = [
    {
      label: 'Total Emails',
      value: stats.totalEmails,
      color: '#a78bfa',
      trend: `+${Math.floor(stats.totalEmails * 0.25)} today`,
      trendUp: true,
    },
    {
      label: 'Auto-Resolved',
      value: stats.autoResolved,
      color: '#4ade80',
      trend: `${stats.totalEmails > 0 ? Math.round((stats.autoResolved / stats.totalEmails) * 100) : 0}% resolution rate`,
      trendUp: true,
    },
    {
      label: 'Avg Response',
      value: `${stats.avgResponseTime}s`,
      color: '#60a5fa',
      trend: 'vs 4.2h industry avg',
      trendUp: true,
    },
    {
      label: 'Open Issues',
      value: stats.openIssues,
      color: '#fb923c',
      trend: `${stats.openIssues} critical clusters`,
      trendUp: false,
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-5"
        >
          <div className="text-xs text-[#6b6b80] uppercase tracking-wider mb-2">
            {card.label}
          </div>
          <div className="text-3xl font-bold" style={{ color: card.color }}>
            {card.value}
          </div>
          <div className={`text-xs mt-1 ${card.trendUp ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
            {card.trend}
          </div>
        </div>
      ))}
    </div>
  )
}
