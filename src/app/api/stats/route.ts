import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import type { Category, CountRow, DashboardStats, Urgency } from '@/lib/types'

export async function GET() {
  const db = getDb()

  const totalEmails = (db.prepare('SELECT COUNT(*) as count FROM emails').get() as CountRow).count
  const autoResolved = (db.prepare("SELECT COUNT(*) as count FROM emails WHERE status IN ('auto_replied', 'resolved')").get() as CountRow).count
  const openIssues = (db.prepare("SELECT COUNT(*) as count FROM clusters WHERE severity IN ('high', 'critical')").get() as CountRow).count
  const debtRows = db.prepare(
    `SELECT urgency, COUNT(*) as count
     FROM emails
     WHERE status IN ('new', 'routed', 'needs_review')
     GROUP BY urgency`
  ).all() as { urgency: Urgency | null; count: number }[]

  const supportDebt = debtRows.reduce((total, row) => {
    const debtValue = row.urgency === 'critical'
      ? 3200
      : row.urgency === 'high'
        ? 1200
        : row.urgency === 'medium'
          ? 350
          : 75

    return total + row.count * debtValue
  }, 0)

  const categoryRows = db.prepare(
    'SELECT category, COUNT(*) as count FROM emails WHERE category IS NOT NULL GROUP BY category'
  ).all() as { category: Category; count: number }[]

  const urgencyRows = db.prepare(
    'SELECT urgency, COUNT(*) as count FROM emails WHERE urgency IS NOT NULL GROUP BY urgency'
  ).all() as { urgency: Urgency; count: number }[]

  const routingRows = db.prepare(
    'SELECT assignedTo, COUNT(*) as count FROM emails WHERE assignedTo IS NOT NULL GROUP BY assignedTo'
  ).all() as { assignedTo: string; count: number }[]

  const categoryBreakdown: DashboardStats['categoryBreakdown'] = {
    refund: 0,
    cancellation: 0,
    bug_report: 0,
    feature_request: 0,
    general_inquiry: 0,
    complaint: 0,
  }
  for (const row of categoryRows) categoryBreakdown[row.category] = row.count

  const urgencyBreakdown: DashboardStats['urgencyBreakdown'] = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  }
  for (const row of urgencyRows) urgencyBreakdown[row.urgency] = row.count

  const routingQueue: Record<string, number> = {}
  for (const row of routingRows) routingQueue[row.assignedTo] = row.count

  return NextResponse.json({
    totalEmails,
    autoResolved,
    avgResponseTime: autoResolved > 0 ? 1 : 0,
    openIssues,
    supportDebt,
    categoryBreakdown,
    urgencyBreakdown,
    routingQueue,
  })
}
