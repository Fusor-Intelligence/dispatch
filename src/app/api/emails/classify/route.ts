import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { classifyEmail, generateReply, isClassificationFailure } from '@/lib/ai'
import { routeEmail, determineStatus } from '@/lib/routing'
import type { SupportEmail } from '@/lib/types'

export async function POST() {
  const db = getDb()
  const unclassified = db.prepare(
    "SELECT * FROM emails WHERE status = 'new' LIMIT 200"
  ).all() as SupportEmail[]

  if (unclassified.length === 0) {
    return NextResponse.json({ classified: 0, message: 'No emails to classify' })
  }

  let classified = 0
  let failed = 0
  let draftsGenerated = 0

  for (const email of unclassified) {
    try {
      const result = await classifyEmail(email.from, email.subject, email.body)

      if (isClassificationFailure(result)) {
        db.prepare(`
          UPDATE emails SET
            category = NULL, urgency = NULL, sentiment = NULL, confidence = ?,
            summary = ?, status = 'needs_review', assignedTo = NULL, autoReplyDraft = NULL
          WHERE id = ?
        `).run(result.confidence, result.summary, email.id)
        failed++
        continue
      }

      const status = determineStatus(result.confidence)
      const assignedTo = status === 'auto_replied'
        ? null
        : routeEmail(result.category, result.urgency, result.sentiment)

      let autoReplyDraft: string | null = null
      if (status === 'auto_replied' || status === 'needs_review') {
        autoReplyDraft = await generateReply(email.from, email.subject, email.body, result.category)
        draftsGenerated++
      }

      db.prepare(`
        UPDATE emails SET
          category = ?, urgency = ?, sentiment = ?, confidence = ?,
          summary = ?, status = ?, assignedTo = ?, autoReplyDraft = ?
        WHERE id = ?
      `).run(
        result.category, result.urgency, result.sentiment, result.confidence,
        result.summary, status, assignedTo, autoReplyDraft, email.id
      )
      classified++
    } catch (err) {
      console.error(`Failed to classify email ${email.id}:`, err)
      db.prepare("UPDATE emails SET status = 'needs_review', confidence = 0 WHERE id = ?").run(email.id)
      failed++
    }
  }

  return NextResponse.json({ classified, failed, draftsGenerated, total: unclassified.length })
}
