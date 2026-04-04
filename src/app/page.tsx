'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { ClusterAlerts } from '@/components/dashboard/cluster-alerts'
import { InboxTable } from '@/components/dashboard/inbox-table'
import { CategoryChart } from '@/components/dashboard/category-chart'
import { UrgencyChart } from '@/components/dashboard/urgency-chart'
import { RoutingQueue } from '@/components/dashboard/routing-queue'
import { EmailDetail } from '@/components/dashboard/email-detail'
import type { DashboardStats, GmailStatus, IssueCluster, SupportEmail } from '@/lib/types'

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }
  return response.json() as Promise<T>
}

async function postJson<T>(url: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    let message = `Failed to post ${url}: ${response.status}`
    try {
      const error = await response.json() as { error?: string }
      if (error.error) message = error.error
    } catch {
      // Ignore JSON parsing failures for non-JSON error payloads.
    }
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [emails, setEmails] = useState<SupportEmail[]>([])
  const [clusters, setClusters] = useState<IssueCluster[]>([])
  const [gmailConnected, setGmailConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [approvingEmailId, setApprovingEmailId] = useState<string | null>(null)
  const [selectedEmail, setSelectedEmail] = useState<SupportEmail | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [flashMessage, setFlashMessage] = useState<string | null>(null)
  const [flashError, setFlashError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const [nextStats, nextEmails, nextClusters, nextGmailStatus] = await Promise.all([
        fetchJson<DashboardStats>('/api/stats'),
        fetchJson<SupportEmail[]>('/api/emails'),
        fetchJson<IssueCluster[]>('/api/clusters'),
        fetchJson<GmailStatus>('/api/gmail/status'),
      ])
      setStats(nextStats)
      setEmails(nextEmails)
      setClusters(nextClusters)
      setGmailConnected(nextGmailStatus.connected)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSync = async () => {
    setSyncing(true)
    setFlashMessage(null)
    setFlashError(null)
    try {
      const syncResult = await postJson<{ synced: number; total: number }>('/api/gmail/sync')
      const classifyResult = await postJson<{ classified: number; failed: number; draftsGenerated: number }>('/api/emails/classify')
      await postJson<{ clusters: number; message?: string }>('/api/clusters')
      await fetchData()
      setFlashMessage(
        `Synced ${syncResult.synced}/${syncResult.total} emails, classified ${classifyResult.classified}, generated ${classifyResult.draftsGenerated} drafts.`
      )
    } catch {
      console.error('Failed to sync Gmail inbox')
      setFlashError('Inbox sync failed before classification/routing completed.')
    } finally {
      setSyncing(false)
    }
  }

  const handleConnect = () => {
    window.location.assign('/api/gmail/connect')
  }

  const handleLoadDemo = async () => {
    setSyncing(true)
    setFlashMessage(null)
    setFlashError(null)
    try {
      await postJson('/api/seed')
      await fetchData()
      setFlashMessage('Loaded demo inbox data with response drafts and routing states.')
    } catch (error) {
      console.error('Failed to load demo data:', error)
      setFlashError('Failed to load demo data.')
    } finally {
      setSyncing(false)
    }
  }

  const handleApprove = async (id: string) => {
    setApprovingEmailId(id)
    setFlashMessage(null)
    setFlashError(null)

    try {
      await postJson(`/api/emails/${id}/approve`)
      await fetchData()
      setFlashMessage('Draft created in Gmail and email marked resolved.')
    } catch (error) {
      console.error('Failed to create Gmail draft:', error)
      setFlashError(error instanceof Error ? error.message : 'Failed to create Gmail draft.')
    } finally {
      setApprovingEmailId(null)
    }
  }

  const filteredEmails = statusFilter === 'all'
    ? emails
    : emails.filter((e) => e.status === statusFilter)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="dispatch-panel rounded-[30px] px-8 py-6 text-lg text-[#9fb0c5]">
          Loading Dispatch...
        </div>
      </div>
    )
  }

  return (
    <div className="dispatch-shell">
      <div className="pointer-events-none absolute inset-x-20 top-0 -z-10 h-72 rounded-full bg-[radial-gradient(circle,_rgba(243,179,107,0.18),_transparent_62%)] blur-3xl" />
      <Header
        stats={stats}
        gmailConnected={gmailConnected}
        syncing={syncing}
        onSync={handleSync}
        onConnect={handleConnect}
        onLoadDemo={handleLoadDemo}
      />
      {flashMessage && (
        <div className="dispatch-panel mb-4 rounded-[22px] border-[#284734] bg-[linear-gradient(180deg,_rgba(17,38,26,0.94),_rgba(8,17,13,0.92))] px-4 py-3 text-sm text-[#9ae6b4]">
          {flashMessage}
        </div>
      )}
      {flashError && (
        <div className="dispatch-panel mb-4 rounded-[22px] border-[#4f2925] bg-[linear-gradient(180deg,_rgba(52,22,18,0.94),_rgba(18,10,10,0.92))] px-4 py-3 text-sm text-[#f8b4a8]">
          {flashError}
        </div>
      )}
      <StatsCards stats={stats} />
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_360px]">
        <div className="space-y-5">
          <ClusterAlerts clusters={clusters} />
          <InboxTable
            emails={filteredEmails}
            selectedEmail={selectedEmail}
            onSelectEmail={setSelectedEmail}
            statusFilter={statusFilter}
            onFilterChange={setStatusFilter}
          />
          {selectedEmail && (
            <EmailDetail
              email={selectedEmail}
              onClose={() => setSelectedEmail(null)}
              onApprove={handleApprove}
              approving={approvingEmailId === selectedEmail.id}
              gmailConnected={gmailConnected}
            />
          )}
        </div>
        <div className="flex flex-col gap-5 xl:sticky xl:top-5 xl:self-start">
          <CategoryChart breakdown={stats?.categoryBreakdown} total={stats?.totalEmails} />
          <UrgencyChart breakdown={stats?.urgencyBreakdown} />
          <RoutingQueue queue={stats?.routingQueue} />
        </div>
      </div>
    </div>
  )
}
