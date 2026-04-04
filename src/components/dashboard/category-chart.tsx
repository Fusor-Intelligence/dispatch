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
    <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-5">
      <div className="text-[13px] font-semibold mb-4">Category Breakdown</div>
      <div className="h-[160px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold">{total || 0}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1 text-[11px] text-[#a0a0b0]">
            <span className="w-2 h-2 rounded-sm" style={{ background: entry.color }} />
            {entry.label} ({total ? Math.round((entry.value / total) * 100) : 0}%)
          </div>
        ))}
      </div>
    </div>
  )
}
