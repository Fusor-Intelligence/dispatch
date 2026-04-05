import type { CSSProperties } from 'react'

export const APPARAT: CSSProperties = {
  fontFamily: "'KMR Apparat', system-ui, sans-serif",
}

export const APPARAT_FONT = "'KMR Apparat', system-ui, sans-serif"

export const CATEGORY_COLORS: Record<string, string> = {
  refund: '#818cf8',
  cancellation: '#c084fc',
  bug_report: '#f87171',
  feature_request: '#2dd4bf',
  general_inquiry: '#94a3b8',
  complaint: '#fb923c',
}

export const CATEGORY_LABELS: Record<string, string> = {
  refund: 'Refund',
  cancellation: 'Cancel',
  bug_report: 'Bug',
  feature_request: 'Feature',
  general_inquiry: 'Inquiry',
  complaint: 'Complaint',
}

export const URGENCY_COLORS: Record<string, string> = {
  low: '#6b6b80',
  medium: '#eab308',
  high: '#f97316',
  critical: '#dc2626',
}

export const SENTIMENT_COLORS: Record<string, string> = {
  positive: '#4ade80',
  neutral: '#6b6b80',
  negative: '#fb923c',
  angry: '#f87171',
}

export const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  auto_replied: { bg: '#064e3b', text: '#34d399' },
  routed: { bg: '#1e1b4b', text: '#818cf8' },
  needs_review: { bg: '#451a03', text: '#fb923c' },
  new: { bg: '#1e1e2e', text: '#6b6b80' },
  resolved: { bg: '#064e3b', text: '#34d399' },
}

export const MAX_EMAILS = 200
export const BATCH_SIZE = 10
export const CLUSTER_SUMMARY_CAP = 50
