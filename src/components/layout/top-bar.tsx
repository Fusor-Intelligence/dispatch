'use client'

import React from 'react'

interface TopBarProps {
  /** Right-side label, e.g. "Configure", "Sweep", "Brief" */
  label?: string
  /** Any additional controls to render in the center */
  center?: React.ReactNode
  /** Any additional controls to render on the right (overrides label) */
  right?: React.ReactNode
}

export function TopBar({ label, center, right }: TopBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '80px',
        padding: '0 42px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}
    >
      {/* Logo lockup */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
        <span
          style={{
            fontFamily: "'KMR Apparat', system-ui, sans-serif",
            fontSize: '48px',
            fontWeight: 300,
            letterSpacing: '-0.05em',
            textTransform: 'capitalize',
            color: '#F6F1E8',
            lineHeight: 1.2,
          }}
        >
          Dispatch
        </span>
        <span
          style={{
            color: '#FFFFFF',
            fontSize: '22px',
            lineHeight: 1,
            paddingBottom: '10px',
            opacity: 0.9,
          }}
        >
          →
        </span>
      </div>

      {/* Center slot */}
      {center && <div>{center}</div>}

      {/* Right slot */}
      <div>
        {right ?? (label ? (
          <span
            style={{
              fontFamily: "'KMR Apparat', system-ui, sans-serif",
              fontSize: '9px',
              fontWeight: 600,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.22)',
            }}
          >
            {label}
          </span>
        ) : null)}
      </div>
    </div>
  )
}
