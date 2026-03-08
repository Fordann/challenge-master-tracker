'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface MatchRowProps {
  champion: string
  win: boolean
  lpChange: number
  duration: number
  playedAt: string
  index: number
  ddragonVersion: string
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `il y a ${days}j`
}

export default function MatchRow({ champion, win, lpChange, duration, playedAt, index, ddragonVersion }: MatchRowProps) {
  const sign = lpChange >= 0 ? '+' : ''

  return (
    <motion.div
      className="match-row flex items-center gap-4 px-4 py-3"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      {/* Champion icon */}
      <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${win ? 'border-accent-green/60' : 'border-accent-red/60'}`}>
        <Image
          src={`https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/${champion}.png`}
          alt={champion}
          width={40}
          height={40}
          className="object-cover"
          unoptimized
        />
      </div>

      {/* Champion name */}
      <span className="text-accent-gold-light text-sm w-24 truncate">{champion}</span>

      {/* Result */}
      <span className={`font-beaufort text-sm w-12 ${win ? 'text-accent-green glow-win' : 'text-accent-red glow-lose'}`}>
        {win ? 'WIN' : 'LOSE'}
      </span>

      {/* LP change */}
      <span className={`font-beaufort text-sm w-16 ${lpChange >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
        {sign}{lpChange} LP
      </span>

      {/* Duration */}
      <span className="text-text-secondary text-sm w-14">{formatDuration(duration)}</span>

      {/* Time ago */}
      <span className="text-text-secondary text-xs ml-auto">{timeAgo(playedAt)}</span>
    </motion.div>
  )
}
