import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const db = getDb()
  db.prepare('UPDATE emails SET status = ? WHERE id = ?').run('resolved', id)
  const email = db.prepare('SELECT * FROM emails WHERE id = ?').get(id)
  return NextResponse.json(email)
}
