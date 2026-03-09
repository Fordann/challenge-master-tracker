'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface SessionMatch {
  id: number
  matchId: string
  champion: string
  win: boolean
  lpChange: number
  duration: number
  playedAt: string
}

interface SessionDashboardProps {
  matches: SessionMatch[]
  totalMatches: number
  ddragonVersion: string
  sessionData: {
    total: number
    wins: number
    losses: number
    winRate: number
    lpChange: number
    tier: string
    rank: string
    lp: number
  } | null
  currentStreak: number
  streakType: 'win' | 'loss' | null
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}j`
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
}

export default function SessionDashboard({
  matches,
  totalMatches,
  ddragonVersion,
  sessionData,
  currentStreak,
  streakType,
}: SessionDashboardProps) {
  const sessionMatches = matches.slice(0, 20)
  const totalWins = matches.filter((m) => m.win).length
  const totalLosses = matches.length - totalWins
  const data = sessionData || {
    total: matches.length,
    wins: totalWins,
    losses: totalLosses,
    winRate: matches.length > 0 ? Math.round((totalWins / matches.length) * 100) : 0,
    lpChange: matches.reduce((sum, m) => sum + m.lpChange, 0),
    tier: '',
    rank: '',
    lp: 0,
  }

  const lpSign = data.lpChange >= 0 ? '+' : ''
  const lpColor = data.lpChange >= 0 ? '#3CB95E' : '#D44B4B'

  return (
    <section className="relative px-6 py-20 overflow-hidden">
      {/* Section header */}
      <motion.div
        className="max-w-5xl mx-auto mb-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-text-secondary/40 text-[10px] uppercase tracking-[0.3em] mb-2">Session en cours</p>
        <div className="flex items-end gap-6 flex-wrap">
          <h2 className="font-beaufort text-4xl md:text-5xl text-accent-gold-light leading-none">
            {data.total} <span className="text-xl text-text-secondary/50">parties</span>
          </h2>
          <div className="flex items-center gap-4 pb-1">
            <span className="text-accent-green font-beaufort text-lg">{data.wins}W</span>
            <span className="text-text-secondary/30">/</span>
            <span className="text-accent-red font-beaufort text-lg">{data.losses}L</span>
            <span className="text-text-secondary/30">|</span>
            <span className="text-accent-gold font-beaufort text-lg">{data.winRate}%</span>
          </div>
        </div>

        {/* LP change + streak */}
        <div className="flex items-center gap-6 mt-4">
          <motion.div
            className="font-beaufort text-3xl"
            style={{ color: lpColor }}
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, type: 'spring' as const, stiffness: 200 }}
          >
            {lpSign}{data.lpChange} LP
          </motion.div>

          {currentStreak > 1 && (
            <motion.div
              className="flex items-center gap-2 px-3 py-1 rounded-full"
              style={{
                background: streakType === 'win'
                  ? 'rgba(60,185,94,0.1)'
                  : 'rgba(212,75,75,0.1)',
                border: `1px solid ${streakType === 'win' ? 'rgba(60,185,94,0.3)' : 'rgba(212,75,75,0.3)'}`,
              }}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, type: 'spring' as const }}
            >
              <span className="font-beaufort text-sm" style={{ color: streakType === 'win' ? '#3CB95E' : '#D44B4B' }}>
                {currentStreak} {streakType === 'win' ? 'victoires' : 'defaites'} d&apos;affilee
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Match blocks grid */}
      <motion.div
        className="max-w-5xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sessionMatches.map((match) => (
            <motion.div
              key={match.matchId}
              className="group relative flex items-center gap-4 px-4 py-3 rounded-xl overflow-hidden"
              variants={itemVariants}
              style={{
                background: match.win
                  ? 'linear-gradient(135deg, rgba(60,185,94,0.06), rgba(60,185,94,0.02))'
                  : 'linear-gradient(135deg, rgba(212,75,75,0.06), rgba(212,75,75,0.02))',
                border: `1px solid ${match.win ? 'rgba(60,185,94,0.1)' : 'rgba(212,75,75,0.1)'}`,
              }}
              whileHover={{
                borderColor: match.win ? 'rgba(60,185,94,0.3)' : 'rgba(212,75,75,0.3)',
                background: match.win
                  ? 'linear-gradient(135deg, rgba(60,185,94,0.1), rgba(60,185,94,0.04))'
                  : 'linear-gradient(135deg, rgba(212,75,75,0.1), rgba(212,75,75,0.04))',
              }}
              transition={{ duration: 0.2 }}
            >
              {/* Left accent line */}
              <div
                className="absolute left-0 top-0 bottom-0 w-[2px]"
                style={{ background: match.win ? '#3CB95E' : '#D44B4B', opacity: 0.6 }}
              />

              {/* Champion icon */}
              <div className={`w-10 h-10 rounded-lg overflow-hidden border ${
                match.win ? 'border-accent-green/30' : 'border-accent-red/30'
              } flex-shrink-0`}>
                <Image
                  src={`https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/${match.champion}.png`}
                  alt={match.champion}
                  width={40}
                  height={40}
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-accent-gold-light text-sm font-medium truncate">{match.champion}</span>
                  <span className="text-text-secondary/30 text-xs">{formatDuration(match.duration)}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`font-beaufort text-xs ${match.win ? 'text-accent-green' : 'text-accent-red'}`}>
                    {match.win ? 'VICTOIRE' : 'DEFAITE'}
                  </span>
                  <span className="text-text-secondary/20">|</span>
                  <span className="text-text-secondary/40 text-xs">{timeAgo(match.playedAt)}</span>
                </div>
              </div>

              {/* LP */}
              <div className="text-right flex-shrink-0">
                <span className={`font-beaufort text-lg ${match.lpChange >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                  {match.lpChange >= 0 ? '+' : ''}{match.lpChange}
                </span>
                <span className="text-text-secondary/40 text-xs ml-1">LP</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Total */}
        <motion.p
          className="text-center text-text-secondary/30 text-xs mt-8 uppercase tracking-widest"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
        >
          {totalMatches} parties au total vers le Master
        </motion.p>
      </motion.div>
    </section>
  )
}
