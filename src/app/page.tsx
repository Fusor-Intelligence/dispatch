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

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null)
  const [emails, setEmails] = useState<any[]>([])
  const [clusters, setClusters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmail, setSelectedEmail] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchData = async () => {
    try {
      const [statsRes, emailsRes, clustersRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/emails'),
        fetch('/api/clusters'),
      ])
      setStats(await statsRes.json())
      setEmails(await emailsRes.json())
      setClusters(await clustersRes.json())
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
    setLoading(true)
    try {
      const syncRes = await fetch('/api/gmail/sync', { method: 'POST' })
      if (!syncRes.ok) {
        await fetch('/api/seed', { method: 'POST' })
      }
      await fetchData()
    } catch {
      await fetch('/api/seed', { method: 'POST' })
      await fetchData()
    }
  }

  const handleApprove = async (id: string) => {
    await fetch(`/api/emails/${id}/approve`, { method: 'POST' })
    await fetchData()
  }

  const filteredEmails = statusFilter === 'all'
    ? emails
    : emails.filter((e) => e.status === statusFilter)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[#6b6b80] text-lg">Loading Dispatch...</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <Header onSync={handleSync} />
      <StatsCards stats={stats} />
      <ClusterAlerts clusters={clusters} />
      <div className="grid grid-cols-[1fr_340px] gap-5">
        <div>
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
            />
          )}
        </div>
        <div className="flex flex-col gap-4">
          <CategoryChart breakdown={stats?.categoryBreakdown} total={stats?.totalEmails} />
          <UrgencyChart breakdown={stats?.urgencyBreakdown} />
          <RoutingQueue queue={stats?.routingQueue} />
        </div>
      </div>
    </div>
  )
}
