'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import TimerDisplay from './TimerDisplay'

interface MountainChartProps {
  tier: string
  rank: string
  lp: number
  lpToMaster: number
  estimatedGames: number | string
}

// Emerald I through Master — positions mapped to the background image (% of viewport)
const MILESTONES = [
  { label: 'Emerald I', tier: 'EMERALD', rank: 'I', x: 57, y: 58 },
  { label: 'Diamond IV', tier: 'DIAMOND', rank: 'IV', x: 66, y: 47 },
  { label: 'Diamond III', tier: 'DIAMOND', rank: 'III', x: 70, y: 42 },
  { label: 'Diamond II', tier: 'DIAMOND', rank: 'II', x: 73, y: 37 },
  { label: 'Diamond I', tier: 'DIAMOND', rank: 'I', x: 76, y: 32 },
  { label: 'Master', tier: 'MASTER', rank: '', x: 88, y: 13 },
]

function getMilestoneIndex(tier: string, rank: string): number {
  for (let i = 0; i < MILESTONES.length; i++) {
    const m = MILESTONES[i]
    if (m.tier === tier && m.rank === rank) return i
  }
  if (tier === 'MASTER' || tier === 'GRANDMASTER' || tier === 'CHALLENGER') {
    return MILESTONES.length - 1
  }
  return -1
}

function getProgressPosition(tier: string, rank: string, lp: number): { x: number; y: number } {
  const idx = getMilestoneIndex(tier, rank)

  if (idx < 0) {
    return { x: MILESTONES[0].x, y: MILESTONES[0].y }
  }
  if (idx >= MILESTONES.length - 1) {
    return { x: MILESTONES[MILESTONES.length - 1].x, y: MILESTONES[MILESTONES.length - 1].y }
  }

  // Interpolate between current milestone and next based on LP (0-100)
  const current = MILESTONES[idx]
  const next = MILESTONES[idx + 1]
  const t = Math.min(1, Math.max(0, lp / 100))

  return {
    x: current.x + (next.x - current.x) * t,
    y: current.y + (next.y - current.y) * t,
  }
}

export default function MountainChart({ tier, rank, lp, lpToMaster, estimatedGames }: MountainChartProps) {
  const pos = getProgressPosition(tier, rank, lp)

  return (
    <section className="relative min-h-screen flex flex-col justify-end items-center pt-[60px]"
      style={{ background: '#0A0A0F' }}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/background-image.png"
          alt="Ranked Mountain"
          fill
          className="object-cover object-center"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-[#0A0A0F]/60" />
      </div>

      {/* Progress cursor — pulsing dot on the mountain */}
      <motion.div
        className="absolute z-10"
        style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="relative">
          <motion.div
            className="w-5 h-5 rounded-full bg-accent-blue"
            animate={{ boxShadow: ['0 0 8px 2px rgba(11,196,227,0.6)', '0 0 20px 6px rgba(11,196,227,0.3)', '0 0 8px 2px rgba(11,196,227,0.6)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 w-5 h-5 rounded-full border-2 border-accent-blue/50"
            animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>

      {/* Stats overlay — bottom */}
      <motion.div
        className="relative z-10 flex flex-col md:flex-row items-end justify-between w-full max-w-5xl px-6 mb-12"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="flex gap-8 md:gap-16">
          <div className="text-center">
            <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">LP Restants</p>
            <p className="font-beaufort text-4xl text-accent-gold">{lpToMaster.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">Parties Est.</p>
            <p className="font-beaufort text-4xl text-accent-gold">
              {typeof estimatedGames === 'number' ? `~ ${estimatedGames}` : '--'}
            </p>
          </div>
        </div>

        <TimerDisplay />
      </motion.div>

      {typeof estimatedGames === 'string' && (
        <motion.p
          className="relative z-10 mb-8 text-text-secondary text-sm italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {estimatedGames}
        </motion.p>
      )}
    </section>
  )
}
