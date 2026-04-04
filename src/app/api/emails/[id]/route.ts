import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const db = getDb()
  const email = db.prepare('SELECT * FROM emails WHERE id = ?').get(id)
  if (!email) {
    return NextResponse.json({ error: 'Email not found' }, { status: 404 })
  }
  return NextResponse.json(email)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const db = getDb()
  const body = await request.json()

  const ALLOWED_FIELDS = new Set([
    'category', 'urgency', 'sentiment', 'confidence', 'summary',
    'status', 'assignedTo', 'autoReplyDraft', 'clusterId',
  ])
  const fields = Object.keys(body).filter((f) => ALLOWED_FIELDS.has(f))
  if (fields.length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }
  const sets = fields.map((f) => `"${f}" = ?`).join(', ')
  const values = fields.map((f) => body[f])

  db.prepare(`UPDATE emails SET ${sets} WHERE id = ?`).run(...values, id)
  const updated = db.prepare('SELECT * FROM emails WHERE id = ?').get(id)
  return NextResponse.json(updated)
}
