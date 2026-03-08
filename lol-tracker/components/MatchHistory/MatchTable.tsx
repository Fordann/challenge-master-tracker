'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import MatchRow from './MatchRow'

interface Match {
  id: number
  matchId: string
  champion: string
  win: boolean
  lpChange: number
  duration: number
  playedAt: string
}

interface MatchTableProps {
  initialMatches: Match[]
  totalMatches: number
}

export default function MatchTable({ initialMatches, totalMatches }: MatchTableProps) {
  const [matches, setMatches] = useState<Match[]>(initialMatches)
  const [loading, setLoading] = useState(false)

  const hasMore = matches.length < totalMatches

  const loadMore = async () => {
    setLoading(true)
    try {
      const page = Math.floor(matches.length / 20)
      const res = await fetch(`/api/matches?page=${page}&limit=20`)
      const data = await res.json()
      setMatches((prev) => [...prev, ...data.matches])
    } catch { /* ignore */ }
    setLoading(false)
  }

  return (
    <section className="min-h-screen px-6 py-20" style={{ background: '#0A0A0F' }}>
      <motion.div
        className="max-w-3xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="font-beaufort text-2xl text-accent-gold-light mb-8">
          Historique des parties
        </h2>

        <div className="space-y-1">
          {matches.map((match, i) => (
            <MatchRow
              key={match.matchId}
              champion={match.champion}
              win={match.win}
              lpChange={match.lpChange}
              duration={match.duration}
              playedAt={match.playedAt}
              index={i}
            />
          ))}
        </div>

        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loading}
            className="mt-8 mx-auto block px-6 py-2 rounded-lg border border-accent-gold/30 text-accent-gold hover:bg-accent-gold/10 transition-colors disabled:opacity-50"
          >
            {loading ? 'Chargement...' : 'Voir plus'}
          </button>
        )}
      </motion.div>
    </section>
  )
}
