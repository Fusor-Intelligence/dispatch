import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { clusterIssues } from '@/lib/ai'
import { randomUUID } from 'crypto'
import { CLUSTER_SUMMARY_CAP, MAX_EMAILS } from '@/lib/constants'
import type { Category, Severity } from '@/lib/types'

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

interface ClusterSourceEmail {
  id: string
  summary: string
  category: Category | null
  receivedAt: string
}

interface RawClusterResult {
  title: string
  emailIds: string[]
  severity: Severity
  suggestedAction: string
}

interface MergedCluster {
  title: string
  severity: Severity
  suggestedAction: string
  emailIds: Set<string>
}

const SEVERITY_RANK: Record<Severity, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
}

function chunkArray<T>(items: T[], chunkSize: number) {
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize))
  }
  return chunks
}

function normalizeClusterTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(the|a|an|issue|issues|problem|problems|customers|customer|reported|reporting)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function mergeClusterResults(results: RawClusterResult[]) {
  const merged = new Map<string, MergedCluster>()

  for (const cluster of results) {
    const key = normalizeClusterTitle(cluster.title) || cluster.title.toLowerCase()
    const existing = merged.get(key)

    if (!existing) {
      merged.set(key, {
        title: cluster.title,
        severity: cluster.severity,
        suggestedAction: cluster.suggestedAction,
        emailIds: new Set(cluster.emailIds),
      })
      continue
    }

    for (const emailId of cluster.emailIds) {
      existing.emailIds.add(emailId)
    }

    if (SEVERITY_RANK[cluster.severity] > SEVERITY_RANK[existing.severity]) {
      existing.severity = cluster.severity
    }

    if (cluster.title.length > existing.title.length) {
      existing.title = cluster.title
    }

    if (cluster.suggestedAction.length > existing.suggestedAction.length) {
      existing.suggestedAction = cluster.suggestedAction
    }
  }

  return Array.from(merged.values()).map((cluster) => ({
    ...cluster,
    emailIds: Array.from(cluster.emailIds),
  }))
}

function getDominantCategory(emails: ClusterSourceEmail[]): Category {
  const counts: Record<Category, number> = {
    refund: 0,
    cancellation: 0,
    bug_report: 0,
    feature_request: 0,
    general_inquiry: 0,
    complaint: 0,
  }

  for (const email of emails) {
    if (!email.category) continue
    counts[email.category] = (counts[email.category] || 0) + 1
  }

  return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'bug_report') as Category
}

function isTrendingCluster(emails: ClusterSourceEmail[]) {
  if (emails.length < 2) return false

  const now = Date.now()
  const recentCount = emails.filter((email) => now - new Date(email.receivedAt).getTime() <= 1000 * 60 * 60 * 24).length
  return recentCount >= 2 || recentCount / emails.length >= 0.6
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
    `SELECT id, summary, category, receivedAt FROM emails
     WHERE summary IS NOT NULL
       AND (
         category IN ('bug_report', 'complaint')
         OR lower(summary) LIKE '%wrong item%'
         OR lower(summary) LIKE '%wrong product%'
         OR lower(summary) LIKE '%sku-4472%'
       )
     ORDER BY receivedAt DESC
     LIMIT ?`
  ).all(MAX_EMAILS) as ClusterSourceEmail[]

  if (emails.length < 2) {
    return NextResponse.json({ clusters: 0, message: 'Not enough emails to cluster' })
  }

  try {
    const batches = chunkArray(emails, CLUSTER_SUMMARY_CAP)
    const rawResults = (
      await Promise.all(
        batches.map((batch) =>
          clusterIssues(
            batch.map((email) => ({
              id: email.id,
              summary: email.summary,
              category: email.category || 'bug_report',
            }))
          )
        )
      )
    ).flat()

    const validEmailIds = new Set(emails.map((email) => email.id))
    const results = mergeClusterResults(rawResults)
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
      const clusterEmails = emails.filter((email) => cluster.emailIds.includes(email.id))

      const dates = clusterEmails.map((e) => e.receivedAt).sort()
      const category = getDominantCategory(clusterEmails)

      insertCluster.run(
        clusterId,
        cluster.title,
        category,
        cluster.emailIds.length,
        dates[0] || new Date().toISOString(),
        dates[dates.length - 1] || new Date().toISOString(),
        cluster.severity,
        isTrendingCluster(clusterEmails) ? 1 : 0,
        cluster.suggestedAction,
        JSON.stringify(cluster.emailIds)
      )

      for (const emailId of cluster.emailIds) {
        updateEmail.run(clusterId, emailId)
      }
    }

    return NextResponse.json({
      clusters: results.length,
      processedEmails: emails.length,
      batches: batches.length,
    })
  } catch (error) {
    console.error('Clustering error:', error)
    const message = error instanceof Error ? error.message : 'Clustering failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
