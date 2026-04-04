import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { clusterIssues } from '@/lib/ai'
import { randomUUID } from 'crypto'

interface ClusterRow {
  id: string
  title: string
  category: string | null
  emailCount: number
  firstSeen: string
  lastSeen: string
  severity: string
  trending: number
  suggestedAction: string
  emailIds: string
}

export async function GET() {
  const db = getDb()
  const clusters = db.prepare(`
    SELECT * FROM clusters ORDER BY
      CASE severity
        WHEN 'critical' THEN 0
        WHEN 'high' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'low' THEN 3
      END
  `).all() as ClusterRow[]
  // Parse emailIds from JSON string
  const parsed = clusters.map((c) => ({
    ...c,
    emailIds: JSON.parse(c.emailIds || '[]'),
    trending: Boolean(c.trending),
  }))
  return NextResponse.json(parsed)
}

export async function POST() {
  const db = getDb()

  const emails = db.prepare(
    `SELECT id, summary, category FROM emails
     WHERE summary IS NOT NULL
       AND (
         category IN ('bug_report', 'complaint')
         OR lower(summary) LIKE '%wrong item%'
         OR lower(summary) LIKE '%wrong product%'
         OR lower(summary) LIKE '%sku-4472%'
       )
     LIMIT 50`
  ).all() as { id: string; summary: string; category: string }[]

  if (emails.length < 2) {
    return NextResponse.json({ clusters: 0, message: 'Not enough emails to cluster' })
  }

  try {
    const rawResults = await clusterIssues(emails)
    const validEmailIds = new Set(emails.map((email) => email.id))
    const results = rawResults
      .map((cluster) => ({
        ...cluster,
        emailIds: Array.from(new Set(cluster.emailIds)).filter((emailId) => validEmailIds.has(emailId)),
      }))
      .filter((cluster) => cluster.emailIds.length >= 2)

    // Clear old clusters
    db.prepare('DELETE FROM clusters').run()
    db.prepare('UPDATE emails SET clusterId = NULL').run()

    const insertCluster = db.prepare(`
      INSERT INTO clusters (id, title, category, emailCount, firstSeen, lastSeen, severity, trending, suggestedAction, emailIds)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const updateEmail = db.prepare('UPDATE emails SET clusterId = ? WHERE id = ?')

    for (const cluster of results) {
      const clusterId = randomUUID()
      const clusterEmails = db.prepare(
        `SELECT receivedAt, category FROM emails WHERE id IN (${cluster.emailIds.map(() => '?').join(',')})`
      ).all(...cluster.emailIds) as { receivedAt: string; category: string }[]

      const dates = clusterEmails.map((e) => e.receivedAt).sort()
      const category = clusterEmails[0]?.category || 'bug_report'

      insertCluster.run(
        clusterId,
        cluster.title,
        category,
        cluster.emailIds.length,
        dates[0] || new Date().toISOString(),
        dates[dates.length - 1] || new Date().toISOString(),
        cluster.severity,
        cluster.emailIds.length >= 3 ? 1 : 0,
        cluster.suggestedAction,
        JSON.stringify(cluster.emailIds)
      )

      for (const emailId of cluster.emailIds) {
        updateEmail.run(clusterId, emailId)
      }
    }

    return NextResponse.json({ clusters: results.length })
  } catch (error) {
    console.error('Clustering error:', error)
    const message = error instanceof Error ? error.message : 'Clustering failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
