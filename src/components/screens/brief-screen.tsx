'use client'

import { ScreenShell } from '@/components/layout/screen-shell'
import { useDispatchStore } from '@/lib/store'
import { APPARAT } from '@/lib/constants'

export function BriefScreen() {
  const { emails, clusters, stats } = useDispatchStore()

  const totalEmails  = stats?.totalEmails ?? emails.length
  const handledCount = emails.filter(e => e.status === 'auto_replied' || e.status === 'resolved').length
  const reviewCount  = emails.filter(e => e.status === 'needs_review').length
  const incidentCount = clusters.length
  const heroCluster  = clusters[0] ?? null

  const quoteText = [
    `I Reviewed ${totalEmails} Support Emails.`,
    `${handledCount} Can Be Handled Automatically.`,
    `${reviewCount} Need Human Review.`,
    ...(incidentCount > 0 ? [`${incidentCount} ${incidentCount === 1 ? 'Pattern' : 'Patterns'} Detected.`] : []),
  ].join(' ')

  const quoteWords = quoteText.split(' ')

  const insightCards = [
    { label: 'Insight 01', value: handledCount,   sub: 'Auto-replied or resolved'  },
    { label: 'Insight 02', value: reviewCount,    sub: 'Need Human Review'          },
    { label: 'Insight 03', value: totalEmails,    sub: 'Can Be Handled Automatically' },
  ]

  return (
    <ScreenShell
      className="flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0A0A0A 50%, #1C1C1C 112.05%, #2E4246 136.61%)' }}
    >
      {/* Body */}
      <div
        className="flex min-h-0 flex-1 flex-col"
        style={{ padding: '36px 36px 36px 36px' }}
      >
        {/* AGENT: label */}
        <div className="stagger-fade-up" style={{
          '--stagger': 0,
          ...APPARAT,
          fontWeight: 300,
          fontSize: '18px',
          lineHeight: '48px',
          textTransform: 'uppercase',
          color: '#FFFFFF',
          marginBottom: '0px',
        } as React.CSSProperties}>
          Agent:
        </div>

        {/* Quote — word-by-word reveal */}
        <div
          className="flex-1 flex items-start stagger-fade-up"
          style={{ '--stagger': 1, paddingBottom: '32px' } as React.CSSProperties}
        >
          <div className="word-reveal" style={{
            ...APPARAT,
            fontWeight: 300,
            fontSize: '48px',
            lineHeight: '48px',
            textTransform: 'capitalize',
            color: '#F6F1E8',
            maxWidth: '943px',
          }}>
            {quoteWords.map((word, i) => (
              <span key={i} style={{ '--word-i': i } as React.CSSProperties}>
                {word}{i < quoteWords.length - 1 ? ' ' : ''}
              </span>
            ))}
          </div>
        </div>

        {/* Cards row */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '14px',
          flexShrink: 0,
          height: '165px',
        }}>
          {insightCards.map((card, i) => (
            <div
              key={card.label}
              className="stagger-fade-up dispatch-card-hover"
              style={{
                '--stagger': 3 + i,
                position: 'relative',
                flex: 1,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '20px 17px',
                gap: '10px',
                isolation: 'isolate',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              } as React.CSSProperties}
            >
              {/* Accent rectangle */}
              <div style={{
                position: 'absolute',
                width: '6px',
                height: '7px',
                left: '17px',
                top: '60px',
                background: 'rgba(217,217,217,0.5)',
                zIndex: 1,
              }} />

              {/* Inner wrapper */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '60px',
                alignSelf: 'stretch',
              }}>
                {/* Top row: label + number */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  alignSelf: 'stretch',
                }}>
                  <div style={{
                    ...APPARAT,
                    fontWeight: 300,
                    fontSize: '18px',
                    lineHeight: '100%',
                    textTransform: 'capitalize',
                    color: '#FFFFFF',
                  }}>
                    {card.label}
                  </div>
                  <div style={{
                    ...APPARAT,
                    fontWeight: 300,
                    fontSize: '64px',
                    lineHeight: '48px',
                    textTransform: 'capitalize',
                    color: '#FFFFFF',
                  }}>
                    {card.value}
                  </div>
                </div>

                {/* Description — right-aligned */}
                <div style={{
                  ...APPARAT,
                  fontWeight: 300,
                  fontSize: '18px',
                  lineHeight: '100%',
                  textAlign: 'right',
                  textTransform: 'capitalize',
                  color: '#FFFFFF',
                  alignSelf: 'stretch',
                }}>
                  {card.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScreenShell>
  )
}
