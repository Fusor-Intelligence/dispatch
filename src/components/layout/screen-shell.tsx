'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ScreenShellProps {
  children: ReactNode
  className?: string
}

export function ScreenShell({ children, className }: ScreenShellProps) {
  return (
    <div className={cn('screen-shell', className)}>
      {children}
    </div>
  )
}
