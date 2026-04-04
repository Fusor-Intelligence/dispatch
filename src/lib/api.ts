import type { DashboardStats, GmailStatus, IssueCluster, SupportEmail } from './types'

export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }
  return response.json() as Promise<T>
}

export async function postJson<T>(url: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    let message = `Failed to post ${url}: ${response.status}`
    try {
      const error = (await response.json()) as { error?: string }
      if (error.error) message = error.error
    } catch {
      // Ignore JSON parsing failures for non-JSON error payloads.
    }
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

export async function fetchAllData() {
  const [stats, emails, clusters, gmailStatus] = await Promise.all([
    fetchJson<DashboardStats>('/api/stats'),
    fetchJson<SupportEmail[]>('/api/emails'),
    fetchJson<IssueCluster[]>('/api/clusters'),
    fetchJson<GmailStatus>('/api/gmail/status'),
  ])
  return { stats, emails, clusters, gmailConnected: gmailStatus.connected }
}

export async function runSync() {
  return postJson<{ synced: number; total: number }>('/api/gmail/sync')
}

export async function runClassify() {
  return postJson<{ classified: number; failed: number; draftsGenerated: number; total: number }>('/api/emails/classify')
}

export async function runCluster() {
  return postJson<{ clusters: number; processedEmails?: number; message?: string }>('/api/clusters')
}

export async function seedDemo() {
  return postJson<{ message: string }>('/api/seed', { reset: true })
}

export async function approveEmail(id: string) {
  return postJson<{ email: SupportEmail; draftId?: string; message: string }>(`/api/emails/${id}/approve`)
}
