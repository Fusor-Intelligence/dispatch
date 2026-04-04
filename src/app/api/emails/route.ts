import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(request: NextRequest) {
  const db = getDb()
  const status = request.nextUrl.searchParams.get('status')
  const category = request.nextUrl.searchParams.get('category')

  let query = 'SELECT * FROM emails'
  const conditions: string[] = []
  const params: string[] = []

  if (status) {
    conditions.push('status = ?')
    params.push(status)
  }
  if (category) {
    conditions.push('category = ?')
    params.push(category)
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ')
  }
  query += ' ORDER BY receivedAt DESC'

  const emails = db.prepare(query).all(...params)
  return NextResponse.json(emails)
}
