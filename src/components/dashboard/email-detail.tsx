'use client'

import type { SupportEmail } from '@/lib/types'

const CATEGORY_LABELS: Record<string, string> = {
  refund: 'Refund',
  bug_report: 'Bug Report',
  cancellation: 'Cancellation',
  feature_request: 'Feature Request',
  general_inquiry: 'General Inquiry',
  complaint: 'Complaint',
}

interface EmailDetailProps {
  email: SupportEmail
  onClose: () => void
  onApprove: (id: string) => void
  approving: boolean
  gmailConnected: boolean
}

export function EmailDetail({ email, onClose, onApprove, approving, gmailConnected }: EmailDetailProps) {
  return (
    <div className="dispatch-panel mt-4 overflow-hidden">
      <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] px-5 py-4">
        <div>
          <div className="dispatch-kicker mb-1">Case Review</div>
          <span className="text-sm font-semibold text-[#f4efe7]">Email Detail</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-full border border-[rgba(255,255,255,0.08)] px-3 py-1 text-sm text-[#9fb0c5] transition hover:bg-[rgba(255,255,255,0.05)] hover:text-white"
        >
          Close
        </button>
      </div>

      <div className="space-y-4 p-5">
        <div className="rounded-[24px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-4">
          <div className="text-lg font-semibold text-[#f4efe7]">{email.subject}</div>
          <div className="mt-2 text-xs text-[#8ea0b5]">
            From: {email.from} &middot; {new Date(email.receivedAt).toLocaleString()}
          </div>
        </div>

        <div className="rounded-[24px] border border-[rgba(255,255,255,0.07)] bg-[rgba(8,14,21,0.65)] p-4">
          <div className="dispatch-kicker mb-3 text-[#7ea8d9]">
            AI Analysis
          </div>
          <div className="grid gap-3 text-xs sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <div className="mb-1 text-[#72859b]">Category</div>
              <div className="font-medium text-[#f4efe7]">{email.category ? (CATEGORY_LABELS[email.category] || email.category) : 'Pending classification'}</div>
            </div>
            <div>
              <div className="mb-1 text-[#72859b]">Urgency</div>
              <div className="font-medium capitalize text-[#f4efe7]">{email.urgency || 'pending'}</div>
            </div>
            <div>
              <div className="mb-1 text-[#72859b]">Sentiment</div>
              <div className="font-medium capitalize text-[#f4efe7]">{email.sentiment || 'pending'}</div>
            </div>
            <div>
              <div className="mb-1 text-[#72859b]">Confidence</div>
              <div className="font-medium text-[#f4efe7]">{Math.round((email.confidence || 0) * 100)}%</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-1 text-xs text-[#72859b]">Summary</div>
            <div className="text-sm leading-6 text-[#d8e1ea]">{email.summary || 'Pending AI analysis.'}</div>
          </div>
          {email.assignedTo && (
            <div className="mt-4">
              <div className="mb-1 text-xs text-[#72859b]">Routed To</div>
              <div className="text-sm font-medium text-[#9bc2f2]">{email.assignedTo}</div>
            </div>
          )}
        </div>

        <div>
          <div className="dispatch-kicker mb-2">
            Original Email
          </div>
          <div className="rounded-[24px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-4 text-sm leading-7 whitespace-pre-wrap text-[#d8e1ea]">
            {email.body}
          </div>
        </div>

        {email.autoReplyDraft && (
          <div>
            <div className="dispatch-kicker mb-2 text-[#90e5ac]">
              AI Draft Reply
            </div>
            <div className="rounded-[24px] border border-[#264731] bg-[linear-gradient(180deg,_rgba(12,30,20,0.94),_rgba(8,19,14,0.92))] p-4 text-sm leading-7 whitespace-pre-wrap text-[#d8e1ea]">
              {email.autoReplyDraft}
            </div>
            {(email.status === 'needs_review' || email.status === 'auto_replied') && (
              <button
                onClick={() => onApprove(email.id)}
                disabled={approving || !gmailConnected}
                className="mt-3 rounded-full border border-[#327b52] bg-[#79d99c] px-4 py-2 text-xs font-semibold text-[#0b160f] transition hover:bg-[#8fe3ad] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {approving ? 'Creating Gmail Draft...' : 'Approve & Create Gmail Draft'}
              </button>
            )}
            {!gmailConnected && (email.status === 'needs_review' || email.status === 'auto_replied') && (
              <div className="mt-2 text-[11px] text-[#f6c67d]">
                Connect Gmail to create a draft instead of sending live mail.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
