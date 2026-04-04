'use client'

import type { DashboardStats } from '@/lib/types'

interface StatsCardsProps {
  stats: DashboardStats | null
}

export function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) return null

  const cards = [
    {
      label: 'Total Emails',
      value: stats.totalEmails,
      color: '#f7cf9a',
      trend: `+${Math.floor(stats.totalEmails * 0.25)} today`,
      accent: 'rgba(243,179,107,0.24)',
    },
    {
      label: 'Auto-Resolved',
      value: stats.autoResolved,
      color: '#8ce7b1',
      trend: `${stats.totalEmails > 0 ? Math.round((stats.autoResolved / stats.totalEmails) * 100) : 0}% resolution rate`,
      accent: 'rgba(74,222,128,0.2)',
    },
    {
      label: 'Avg Response',
      value: `${stats.avgResponseTime}s`,
      color: '#91c8ff',
      trend: 'vs 4.2h industry avg',
      accent: 'rgba(96,165,250,0.18)',
    },
    {
      label: 'Open Issues',
      value: stats.openIssues,
      color: '#f8a88f',
      trend: `${stats.openIssues} critical clusters`,
      accent: 'rgba(248,117,92,0.18)',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="dispatch-panel relative overflow-hidden p-5"
        >
          <div
            className="absolute inset-x-0 top-0 h-20"
            style={{ background: `linear-gradient(180deg, ${card.accent}, transparent)` }}
          />
          <div className="relative">
            <div className="dispatch-kicker mb-3">{card.label}</div>
            <div className="mb-2 text-4xl font-semibold tracking-tight" style={{ color: card.color }}>
              {card.value}
            </div>
            <div className="text-sm text-[#9fb0c5]">{card.trend}</div>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    card.label === 'Avg Response'
                      ? 82
                      : typeof card.value === 'number'
                        ? Math.max(16, Math.min(card.value * 8, 100))
                        : 72
                  )}%`,
                  background: card.color,
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
