'use client'

import React, { useRef, useEffect, useState } from 'react'
import { useDispatchStore } from '@/lib/store'
import type { ScreenId } from '@/lib/types'
import { APPARAT_FONT } from '@/lib/constants'

const NAV_TABS: { id: ScreenId; label: string }[] = [
  { id: 'deploy',  label: 'Config'  },
  { id: 'sweep',   label: 'Sweep'   },
  { id: 'brief',   label: 'Brief'   },
  { id: 'command', label: 'Review'  },
]

export function TopBar() {
  const { currentScreen, navigateTo } = useDispatchStore()
  const navRef = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (!navRef.current) return
    const activeIdx = NAV_TABS.findIndex(t => t.id === currentScreen)
    if (activeIdx < 0) return
    const btn = navRef.current.children[activeIdx + 1] as HTMLElement // +1 for the indicator div
    if (!btn) return
    setIndicator({ left: btn.offsetLeft, width: btn.offsetWidth })
    if (!mounted) setMounted(true)
  }, [currentScreen, mounted])

  const navTabs = (
    <div ref={navRef} style={{ position: 'relative', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
      {/* Sliding active indicator */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: indicator.left,
          width: indicator.width,
          height: '100%',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.2)',
          transition: mounted ? 'left 0.3s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      {NAV_TABS.map(tab => {
        const isActive = currentScreen === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => navigateTo(tab.id)}
            className="dispatch-btn-ghost"
            style={{
              position: 'relative',
              zIndex: 1,
              width: '84px',
              height: '29px',
              background: 'transparent',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: APPARAT_FONT,
              fontWeight: 300,
              fontSize: '12px',
              lineHeight: '29px',
              textTransform: 'capitalize',
              color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
              transition: 'color 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingLeft: '9px',
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '80px',
        padding: '0 36px',
        flexShrink: 0,
        pointerEvents: 'auto',
      }}
    >
      {/* Logo lockup */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
        <span
          style={{
            fontFamily: APPARAT_FONT,
            fontSize: '48px',
            fontWeight: 300,
            letterSpacing: '-0.05em',
            textTransform: 'capitalize',
            color: '#F6F1E8',
            lineHeight: '120%',
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

      {/* Nav tabs */}
      <div>
        {navTabs}
      </div>
    </div>
  )
}
