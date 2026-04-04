'use client'

interface HeaderProps {
  onSync: () => void
}

export function Header({ onSync }: HeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#1e1e2e]">
      <div className="text-xl font-bold tracking-tight">
        <span className="text-[#6366f1]">D</span>ispatch
      </div>
      <div className="flex gap-3 items-center">
        <span className="text-[#4ade80] text-xs">hackathon2026SF@gmail.com connected</span>
        <button
          onClick={onSync}
          className="bg-[#6366f1] text-white border-none px-4 py-2 rounded-md text-sm cursor-pointer hover:bg-[#5558e6] transition-colors"
        >
          Sync Inbox
        </button>
      </div>
    </div>
  )
}
