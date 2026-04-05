'use client'

import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ScreenShellProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export function ScreenShell({ children, className, style }: ScreenShellProps) {
  return (
    <div className={cn('screen-shell', className)} style={style}>
      {children}
    </div>
  )
}
