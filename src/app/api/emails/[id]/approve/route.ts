import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { createReplyDraft } from '@/lib/gmail'
import type { SupportEmail } from '@/lib/types'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const db = getDb()
  const email = db.prepare('SELECT * FROM emails WHERE id = ?').get(id) as SupportEmail | undefined

  if (!email) {
    return NextResponse.json({ error: 'Email not found' }, { status: 404 })
  }

  if (!email.autoReplyDraft) {
    return NextResponse.json({ error: 'No draft reply is available for this email' }, { status: 400 })
  }

  try {
    const draftId = await createReplyDraft(email)
    db.prepare('UPDATE emails SET status = ? WHERE id = ?').run('resolved', id)
    const updated = db.prepare('SELECT * FROM emails WHERE id = ?').get(id)

    return NextResponse.json({
      email: updated,
      draftId,
      message: 'Draft created in Gmail',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create Gmail draft'
    const status = message === 'Gmail not connected' ? 503 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
