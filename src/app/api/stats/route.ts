import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  const db = getDb()

  const totalEmails = (db.prepare('SELECT COUNT(*) as count FROM emails').get() as any).count
  const autoResolved = (db.prepare("SELECT COUNT(*) as count FROM emails WHERE status IN ('auto_replied', 'resolved')").get() as any).count
  const openIssues = (db.prepare("SELECT COUNT(*) as count FROM clusters WHERE severity IN ('high', 'critical')").get() as any).count

  const categoryRows = db.prepare(
    'SELECT category, COUNT(*) as count FROM emails WHERE category IS NOT NULL GROUP BY category'
  ).all() as { category: string; count: number }[]

  const urgencyRows = db.prepare(
    'SELECT urgency, COUNT(*) as count FROM emails WHERE urgency IS NOT NULL GROUP BY urgency'
  ).all() as { urgency: string; count: number }[]

  const routingRows = db.prepare(
    'SELECT assignedTo, COUNT(*) as count FROM emails WHERE assignedTo IS NOT NULL GROUP BY assignedTo'
  ).all() as { assignedTo: string; count: number }[]

  const categoryBreakdown: Record<string, number> = {}
  for (const row of categoryRows) categoryBreakdown[row.category] = row.count

  const urgencyBreakdown: Record<string, number> = {}
  for (const row of urgencyRows) urgencyBreakdown[row.urgency] = row.count

  const routingQueue: Record<string, number> = {}
  for (const row of routingRows) routingQueue[row.assignedTo] = row.count

  return NextResponse.json({
    totalEmails,
    autoResolved,
    avgResponseTime: 28,
    openIssues,
    categoryBreakdown,
    urgencyBreakdown,
    routingQueue,
  })
}
