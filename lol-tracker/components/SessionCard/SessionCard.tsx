'use client'

import { motion } from 'framer-motion'
import { getEncouragementMessage } from './encouragementMessage'

interface SessionCardProps {
  total: number
  wins: number
  losses: number
  winRate: number
  lpChange: number
  tier: string
  rank: string
  lp: number
  currentStreak: number
  streakType: 'win' | 'loss' | null
}

export default function SessionCard({
  total,
  wins,
  losses,
  winRate,
  lpChange,
  tier,
  rank,
  lp,
  currentStreak,
  streakType,
}: SessionCardProps) {
  const message = getEncouragementMessage(winRate, currentStreak, streakType)
  const sign = lpChange >= 0 ? '+' : ''

  return (
    <section className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'linear-gradient(180deg, #0A0A0F, #0F1923)' }}
    >
      <motion.div
        className="glass-card p-8 md:p-12 max-w-2xl w-full"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <p className="text-text-secondary text-sm uppercase tracking-wider mb-6">Session en cours</p>

        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <p className="font-beaufort text-6xl text-accent-gold-light">{total}</p>
            <p className="text-text-secondary mt-1">parties</p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-lg">
              <span className="text-accent-green">{wins}W</span>
              {' · '}
              <span className="text-accent-red">{losses}L</span>
              {' · '}
              <span className="text-accent-gold-light">{winRate}% WR</span>
            </p>
            <p className="font-beaufort text-3xl" style={{
              color: lpChange >= 0 ? '#3CB95E' : '#D44B4B'
            }}>
              {sign}{lpChange} LP
            </p>
            <p className="text-text-secondary text-sm">
              {tier.charAt(0) + tier.slice(1).toLowerCase()} {rank} · {lp} LP
            </p>
          </div>
        </div>

        <motion.p
          className="mt-8 italic text-accent-gold-light/80 text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          &ldquo;{message}&rdquo;
        </motion.p>
      </motion.div>
    </section>
  )
}
