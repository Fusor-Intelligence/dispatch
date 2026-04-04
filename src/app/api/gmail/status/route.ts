import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import type { GmailStatus } from '@/lib/types'

export async function GET() {
  const db = getDb()
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('gmail_tokens') as { value: string } | undefined

  const response: GmailStatus = {
    connected: Boolean(row?.value),
  }

  return NextResponse.json(response)
}
