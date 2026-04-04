import { NextRequest, NextResponse } from 'next/server'
import { seedDatabase } from '@/lib/seed-data'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const result = seedDatabase({
      reset: Boolean(body?.reset),
      mode: body?.mode === 'unclassified' ? 'unclassified' : 'demo',
    })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Seed error:', error)
    const message = error instanceof Error ? error.message : 'Seed failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
