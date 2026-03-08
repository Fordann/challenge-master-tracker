'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

interface NavbarProps {
  tier: string
  rank: string
  lp: number
  lastSyncAt?: Date
}

const TIER_COLORS: Record<string, string> = {
  IRON: '#6B6B6B',
  BRONZE: '#8B5E3C',
  SILVER: '#A0A0B0',
  GOLD: '#C89B3C',
  PLATINUM: '#21A882',
  EMERALD: '#00A86B',
  DIAMOND: '#576BCE',
  MASTER: '#9D48E0',
  GRANDMASTER: '#D44B4B',
  CHALLENGER: '#F4C874',
}

export default function Navbar({ tier, rank, lp, lastSyncAt }: NavbarProps) {
  const [syncAgo, setSyncAgo] = useState('')
  const [spinning, setSpinning] = useState(false)

  const updateSyncTime = useCallback(() => {
    if (!lastSyncAt) {
      setSyncAgo('...')
      return
    }
    const diff = Math.floor((Date.now() - new Date(lastSyncAt).getTime()) / 1000)
    if (diff < 60) setSyncAgo(`${diff}s`)
    else if (diff < 3600) setSyncAgo(`${Math.floor(diff / 60)}min`)
    else setSyncAgo(`${Math.floor(diff / 3600)}h`)
  }, [lastSyncAt])

  useEffect(() => {
    updateSyncTime()
    const interval = setInterval(updateSyncTime, 10000)
    return () => clearInterval(interval)
  }, [updateSyncTime])

  const handleRefresh = async () => {
    setSpinning(true)
    try {
      await fetch('/api/sync', { method: 'POST' })
    } catch { /* ignore */ }
    setTimeout(() => setSpinning(false), 600)
    window.location.reload()
  }

  const tierColor = TIER_COLORS[tier] || '#A0A0B0'
  const displayRank = tier === 'MASTER' || tier === 'GRANDMASTER' || tier === 'CHALLENGER'
    ? `${tier.charAt(0)}${tier.slice(1).toLowerCase()} ${lp} LP`
    : `${tier.charAt(0)}${tier.slice(1).toLowerCase()} ${rank} — ${lp} LP`

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center justify-between px-6"
      style={{
        background: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(200, 155, 60, 0.3)',
      }}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg font-beaufort text-accent-gold-light">⚔️ AbatJourBleu</span>
      </div>

      <div className="flex items-center gap-4">
        <motion.span
          className="px-3 py-1 rounded-full text-sm font-beaufort"
          style={{
            backgroundColor: `${tierColor}20`,
            color: tierColor,
            border: `1px solid ${tierColor}50`,
          }}
          key={`${tier}-${rank}-${lp}`}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {displayRank}
        </motion.span>

        <button
          onClick={handleRefresh}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors group"
          title="Rafraîchir"
        >
          <svg
            className={`w-5 h-5 text-accent-blue group-hover:drop-shadow-[0_0_6px_rgba(11,196,227,0.6)] ${spinning ? 'spin-refresh' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>

        <span className="text-xs text-text-secondary">
          ⏱ sync il y a {syncAgo}
        </span>
      </div>
    </nav>
  )
}
