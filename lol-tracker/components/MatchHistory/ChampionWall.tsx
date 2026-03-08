'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface WallMatch {
  champion: string
  win: boolean
}

interface ChampionWallProps {
  matches: WallMatch[]
  ddragonVersion: string
}

export default function ChampionWall({ matches, ddragonVersion }: ChampionWallProps) {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20"
      style={{ background: '#050508' }}
    >
      <motion.div
        className="max-w-4xl w-full"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-14 gap-2 justify-center">
          {matches.map((match, i) => (
            <motion.div
              key={i}
              className={`relative w-12 h-12 rounded-full overflow-hidden border-2 ${
                match.win ? 'border-accent-green/60' : 'border-accent-red/60'
              }`}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
                delay: i * 0.02,
              }}
            >
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/${match.champion}.png`}
                alt={match.champion}
                width={48}
                height={48}
                className="object-cover"
                unoptimized
              />
              {/* Win/loss emoji overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-sm">
                {match.win ? '😊' : '😢'}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-center text-text-secondary mt-8 text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          {matches.length} parties jouées vers le Master
        </motion.p>
      </motion.div>
    </section>
  )
}
