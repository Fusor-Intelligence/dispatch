import { google } from 'googleapis'
import { getDb } from './db'

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send']

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
}

export function getAuthUrl(): string {
  const client = getOAuth2Client()
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  })
}

export async function handleCallback(code: string) {
  const client = getOAuth2Client()
  const { tokens } = await client.getToken(code)
  const db = getDb()
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(
    'gmail_tokens',
    JSON.stringify(tokens)
  )
  return tokens
}

export function getAuthenticatedClient() {
  const db = getDb()
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('gmail_tokens') as { value: string } | undefined
  if (!row) throw new Error('Gmail not connected')

  const client = getOAuth2Client()
  const tokens = JSON.parse(row.value)
  client.setCredentials(tokens)

  // Handle token refresh
  client.on('tokens', (newTokens) => {
    const merged = { ...tokens, ...newTokens }
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(
      'gmail_tokens',
      JSON.stringify(merged)
    )
  })

  return client
}

export async function fetchEmails(maxResults: number = 50) {
  const auth = getAuthenticatedClient()
  const gmail = google.gmail({ version: 'v1', auth })

  const list = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    q: 'in:inbox',
  })

  const messages = list.data.messages || []
  const emails = []

  for (const msg of messages) {
    try {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'full',
      })

      const headers = detail.data.payload?.headers || []
      const from = headers.find((h) => h.name === 'From')?.value || 'unknown'
      const subject = headers.find((h) => h.name === 'Subject')?.value || '(no subject)'
      const date = headers.find((h) => h.name === 'Date')?.value || new Date().toISOString()

      let body = ''
      const payload = detail.data.payload
      if (payload?.body?.data) {
        body = Buffer.from(payload.body.data, 'base64').toString('utf-8')
      } else if (payload?.parts) {
        const textPart = payload.parts.find((p) => p.mimeType === 'text/plain')
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString('utf-8')
        }
      }

      emails.push({
        gmailId: msg.id!,
        threadId: msg.threadId || msg.id!,
        from,
        subject,
        body: body.slice(0, 5000),
        receivedAt: new Date(date).toISOString(),
      })
    } catch (err) {
      console.error(`Failed to fetch email ${msg.id}:`, err)
    }
  }

  return emails
}
