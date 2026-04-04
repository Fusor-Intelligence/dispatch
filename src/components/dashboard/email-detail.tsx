'use client'

const CATEGORY_LABELS: Record<string, string> = {
  refund: 'Refund',
  bug_report: 'Bug Report',
  cancellation: 'Cancellation',
  feature_request: 'Feature Request',
  general_inquiry: 'General Inquiry',
  complaint: 'Complaint',
}

interface EmailDetailProps {
  email: any
  onClose: () => void
  onApprove: (id: string) => void
}

export function EmailDetail({ email, onClose, onApprove }: EmailDetailProps) {
  return (
    <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl mt-4 overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1e1e2e] flex justify-between items-center">
        <span className="text-sm font-semibold">Email Detail</span>
        <button
          onClick={onClose}
          className="text-[#6b6b80] hover:text-white text-sm cursor-pointer"
        >
          Close
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Email header */}
        <div>
          <div className="text-sm font-medium">{email.subject}</div>
          <div className="text-xs text-[#6b6b80] mt-1">
            From: {email.from} &middot; {new Date(email.receivedAt).toLocaleString()}
          </div>
        </div>

        {/* AI Analysis */}
        <div className="bg-[#0a0a0f] rounded-lg p-4 space-y-3">
          <div className="text-xs font-semibold text-[#6366f1] uppercase tracking-wider">
            AI Analysis
          </div>
          <div className="grid grid-cols-4 gap-4 text-xs">
            <div>
              <div className="text-[#6b6b80] mb-1">Category</div>
              <div className="font-medium">{CATEGORY_LABELS[email.category] || email.category}</div>
            </div>
            <div>
              <div className="text-[#6b6b80] mb-1">Urgency</div>
              <div className="font-medium capitalize">{email.urgency}</div>
            </div>
            <div>
              <div className="text-[#6b6b80] mb-1">Sentiment</div>
              <div className="font-medium capitalize">{email.sentiment}</div>
            </div>
            <div>
              <div className="text-[#6b6b80] mb-1">Confidence</div>
              <div className="font-medium">{Math.round((email.confidence || 0) * 100)}%</div>
            </div>
          </div>
          <div>
            <div className="text-[#6b6b80] text-xs mb-1">Summary</div>
            <div className="text-xs">{email.summary}</div>
          </div>
          {email.assignedTo && (
            <div>
              <div className="text-[#6b6b80] text-xs mb-1">Routed To</div>
              <div className="text-xs font-medium text-[#818cf8]">{email.assignedTo}</div>
            </div>
          )}
        </div>

        {/* Original email body */}
        <div>
          <div className="text-xs font-semibold text-[#6b6b80] uppercase tracking-wider mb-2">
            Original Email
          </div>
          <div className="text-xs text-[#a0a0b0] whitespace-pre-wrap leading-relaxed bg-[#0a0a0f] rounded-lg p-4">
            {email.body}
          </div>
        </div>

        {/* Auto-reply draft */}
        {email.autoReplyDraft && (
          <div>
            <div className="text-xs font-semibold text-[#4ade80] uppercase tracking-wider mb-2">
              AI Draft Reply
            </div>
            <div className="text-xs text-[#a0a0b0] whitespace-pre-wrap leading-relaxed bg-[#0a1a0a] border border-[#1a3a1a] rounded-lg p-4">
              {email.autoReplyDraft}
            </div>
            {(email.status === 'needs_review' || email.status === 'auto_replied') && email.status !== 'resolved' && (
              <button
                onClick={() => onApprove(email.id)}
                className="mt-3 bg-[#4ade80] text-[#0a0a0f] px-4 py-2 rounded-md text-xs font-semibold cursor-pointer hover:bg-[#3bca71] transition-colors"
              >
                Approve & Send
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
