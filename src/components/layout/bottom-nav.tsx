'use client';

import { useDispatchStore } from '@/lib/store';
import { Rocket, Zap, FileText, Settings2, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { ScreenId } from '@/lib/types';

const NAV_ITEMS: { id: ScreenId; icon: typeof Rocket; label: string }[] = [
  { id: 'deploy',  icon: Rocket,          label: 'CONFIGURE' },
  { id: 'sweep',   icon: Zap,             label: 'SWEEP'     },
  { id: 'brief',   icon: FileText,        label: 'BRIEF'     },
  { id: 'rules',   icon: Settings2,       label: 'RULES'     },
  { id: 'command', icon: LayoutDashboard, label: 'COMMAND'   },
];

export function BottomNav() {
  const { currentScreen, screenHistory, navigateTo } = useDispatchStore();
  const [displayLabel, setDisplayLabel] = useState('');
  const [labelVisible, setLabelVisible] = useState(true);

  const activeItem = NAV_ITEMS.find(item => item.id === currentScreen) ?? NAV_ITEMS[0];

  useEffect(() => {
    setLabelVisible(false);
    const t = setTimeout(() => {
      setDisplayLabel(activeItem.label);
      setLabelVisible(true);
    }, 100);
    return () => clearTimeout(t);
  }, [currentScreen, activeItem.label]);

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
      <div
        className="flex items-center gap-1 px-3"
        style={{
          height: '48px',
          borderRadius: '9999px',
          background: 'rgba(10, 10, 10, 0.92)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 24px 48px rgba(0,0,0,0.6)',
        }}
      >
        {/* Left: Wordmark */}
        <div
          className="px-2 select-none"
          style={{
            fontFamily: "'Apparat', system-ui, sans-serif",
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.25)',
            textTransform: 'uppercase',
            minWidth: '52px',
          }}
        >
          DSP
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.07)' }} />

        {/* Nav items */}
        <div className="flex items-center gap-0.5 px-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            const isReachable = screenHistory.includes(item.id);

            return (
              <button
                key={item.id}
                onClick={() => isReachable && navigateTo(item.id)}
                disabled={!isReachable}
                className="relative flex flex-col items-center justify-center"
                style={{
                  padding: '6px 10px',
                  borderRadius: '9999px',
                  background: isActive ? 'rgba(243, 179, 107, 0.1)' : 'transparent',
                  transition: 'background 0.2s ease, opacity 0.2s ease',
                  cursor: isReachable ? 'pointer' : 'default',
                  border: 'none',
                  outline: 'none',
                  opacity: isReachable ? 1 : 0.35,
                }}
              >
                <Icon
                  size={16}
                  style={{
                    color: isActive ? '#f3b36b' : 'rgba(255,255,255,0.3)',
                    transition: 'color 0.2s ease',
                    strokeWidth: isActive ? 2 : 1.5,
                  }}
                />
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '4px',
                      height: '2px',
                      borderRadius: '9999px',
                      background: '#f3b36b',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.07)' }} />

        {/* Right: Current screen label */}
        <div
          className="px-2 select-none"
          style={{
            fontFamily: "'Apparat', system-ui, sans-serif",
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '0.3em',
            color: 'rgba(255,255,255,0.35)',
            textTransform: 'uppercase',
            minWidth: '60px',
            opacity: labelVisible ? 1 : 0,
            transition: 'opacity 0.15s ease',
          }}
        >
          {displayLabel}
        </div>
      </div>
    </div>
  );
}
