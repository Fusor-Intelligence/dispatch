import type { Category, Urgency, Sentiment } from './types'

export function routeEmail(category: Category, urgency: Urgency, sentiment: Sentiment): string {
  if (category === 'bug_report' && (urgency === 'high' || urgency === 'critical')) {
    return 'Engineering'
  }
  if (category === 'complaint' && sentiment === 'angry') {
    return 'Senior Support'
  }
  if (category === 'refund' && (urgency === 'high' || urgency === 'critical')) {
    return 'Manager'
  }
  if (category === 'feature_request') {
    return 'Product'
  }
  return 'General Support'
}

export function determineStatus(
  confidence: number,
): 'auto_replied' | 'needs_review' | 'routed' {
  if (confidence >= 0.9) return 'auto_replied'
  if (confidence >= 0.75) return 'needs_review'
  return 'routed'
}
