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

function getIconSize(count: number): number {
  if (count <= 20) return 48
  if (count <= 40) return 40
  if (count <= 60) return 32
  if (count <= 100) return 28
  return 24
}

function getColumns(count: number): string {
  const size = getIconSize(count)
  return `repeat(auto-fill, minmax(${size}px, 1fr))`
}

export default function ChampionWall({ matches, ddragonVersion }: ChampionWallProps) {
  const iconSize = getIconSize(matches.length)

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20"
      style={{ background: '#050508' }}
    >
      <motion.div
        className="max-w-5xl w-full"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div
          className="grid gap-2 justify-center"
          style={{ gridTemplateColumns: getColumns(matches.length) }}
        >
          {matches.map((match, i) => (
            <motion.div
              key={i}
              className={`relative rounded-full overflow-hidden border-2 ${
                match.win ? 'border-accent-green/60' : 'border-accent-red/60'
              }`}
              style={{ width: iconSize, height: iconSize }}
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
                width={iconSize}
                height={iconSize}
                className="object-cover"
                unoptimized
              />
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
          {matches.length} parties jouees vers le Master
        </motion.p>
      </motion.div>
    </section>
  )
}
