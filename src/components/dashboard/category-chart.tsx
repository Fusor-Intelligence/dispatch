'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const COLORS: Record<string, string> = {
  refund: '#6366f1',
  bug_report: '#f87171',
  cancellation: '#c084fc',
  feature_request: '#2dd4bf',
  complaint: '#fb923c',
  general_inquiry: '#94a3b8',
}

const LABELS: Record<string, string> = {
  refund: 'Refund',
  bug_report: 'Bug',
  cancellation: 'Cancel',
  feature_request: 'Feature',
  complaint: 'Complaint',
  general_inquiry: 'Inquiry',
}

interface CategoryChartProps {
  breakdown: Record<string, number> | undefined
  total: number | undefined
}

export function CategoryChart({ breakdown, total }: CategoryChartProps) {
  if (!breakdown) return null

  const data = Object.entries(breakdown).map(([name, value]) => ({
    name,
    value,
    color: COLORS[name] || '#6b6b80',
    label: LABELS[name] || name,
  }))

  return (
    <div className="dispatch-panel p-5">
      <div className="dispatch-kicker mb-2">Mix Analysis</div>
      <div className="mb-4 text-lg font-semibold text-[#f4efe7]">Category Breakdown</div>
      <div className="relative h-[190px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={78}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-[0.24em] text-[#6f8399]">Total</div>
            <span className="text-2xl font-semibold text-[#f4efe7]">{total || 0}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between text-[12px] text-[#a9b8c8]">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: entry.color }} />
              <span>{entry.label}</span>
            </div>
            <span className="font-mono text-[#dce5ee]">
              {entry.value} · {total ? Math.round((entry.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
