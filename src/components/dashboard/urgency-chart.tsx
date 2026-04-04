'use client'

import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts'

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

  return (
    <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-5">
      <div className="text-[13px] font-semibold mb-4">Urgency Distribution</div>
      <div className="h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              tick={{ fill: '#6b6b80', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
