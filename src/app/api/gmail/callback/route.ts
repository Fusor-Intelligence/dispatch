import { NextRequest, NextResponse } from 'next/server'
import { handleCallback } from '@/lib/gmail'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 })
  }

  try {
    await handleCallback(code)
    return NextResponse.redirect(new URL('/', request.url))
  } catch (error) {
    console.error('Gmail callback error:', error)
    return NextResponse.json({ error: 'OAuth failed' }, { status: 500 })
  }
}
