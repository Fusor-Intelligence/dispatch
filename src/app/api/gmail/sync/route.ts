import { NextResponse } from 'next/server'
import { fetchEmails } from '@/lib/gmail'
import { getDb } from '@/lib/db'
import { randomUUID } from 'crypto'
import type { GmailSyncEmail } from '@/lib/types'

export async function POST() {
  try {
    const emails = await fetchEmails()
    const db = getDb()

    const insert = db.prepare(`
      INSERT OR IGNORE INTO emails (id, gmailId, threadId, "from", subject, body, receivedAt, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'new')
    `)

    let inserted = 0
    const insertMany = db.transaction((emailsToInsert: GmailSyncEmail[]) => {
      for (const email of emailsToInsert) {
        const result = insert.run(
          randomUUID(),
          email.gmailId,
          email.threadId,
          email.from,
          email.subject,
          email.body,
          email.receivedAt
        )
        if (result.changes > 0) inserted++
      }
    })

    insertMany(emails)

    return NextResponse.json({ synced: inserted, total: emails.length })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown sync error'
    console.error('Sync error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
