'use client'

import { useEffect } from 'react'
import { useDispatchStore } from '@/lib/store'
import { fetchJson } from '@/lib/api'
import { DeployScreen } from '@/components/screens/deploy-screen'
import { SweepScreen } from '@/components/screens/sweep-screen'
import { BriefScreen } from '@/components/screens/brief-screen'
import { RulesScreen } from '@/components/screens/rules-screen'
import { CommandScreen } from '@/components/screens/command-screen'
import { BottomNav } from '@/components/layout/bottom-nav'
import type { GmailStatus, ScreenId } from '@/lib/types'

const SCREENS: Record<ScreenId, React.ComponentType> = {
  deploy: DeployScreen,
  sweep: SweepScreen,
  brief: BriefScreen,
  rules: RulesScreen,
  command: CommandScreen,
}

export default function App() {
  const { currentScreen, transitionDirection, setGmailConnected, setLoading } = useDispatchStore()

  useEffect(() => {
    fetchJson<GmailStatus>('/api/gmail/status')
      .then((data) => setGmailConnected(data.connected))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [setGmailConnected, setLoading])

  const ScreenComponent = SCREENS[currentScreen]

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div
        key={currentScreen}
        className={
          transitionDirection === 'forward'
            ? 'screen-enter-forward h-full'
            : 'screen-enter-backward h-full'
        }
      >
        <ScreenComponent />
      </div>
      <BottomNav />
    </div>
  )
}
