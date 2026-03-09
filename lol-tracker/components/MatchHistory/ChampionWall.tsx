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
  if (count <= 20) return 52
  if (count <= 40) return 44
  if (count <= 60) return 36
  if (count <= 100) return 30
  return 26
}

function getColumns(count: number): string {
  const size = getIconSize(count)
  return `repeat(auto-fill, minmax(${size}px, 1fr))`
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.015 },
  },
}

const iconVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 20 },
  },
}

export default function ChampionWall({ matches, ddragonVersion }: ChampionWallProps) {
  const iconSize = getIconSize(matches.length)

  return (
    <section className="relative px-6 py-20 overflow-hidden">
      <motion.div
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <p className="text-text-secondary/40 text-[10px] uppercase tracking-[0.3em] mb-8 text-center">
          Tous les champions joues
        </p>

        {/* Animated border container */}
        <div className="relative p-[1px] rounded-2xl champion-wall-border">
          <div className="relative rounded-2xl p-6 overflow-hidden"
            style={{ background: 'rgba(10, 10, 15, 0.8)' }}
          >
            {/* Inner glow */}
            <div className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
              style={{
                boxShadow: 'inset 0 0 60px rgba(200, 155, 60, 0.05), inset 0 0 120px rgba(11, 196, 227, 0.03)',
              }}
            />

            <motion.div
              className="grid gap-2 justify-center relative z-10"
              style={{ gridTemplateColumns: getColumns(matches.length) }}
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
            >
              {matches.map((match, i) => (
                <motion.div
                  key={i}
                  className="relative group"
                  style={{ width: iconSize, height: iconSize }}
                  variants={iconVariants}
                >
                  <div
                    className="w-full h-full rounded-lg overflow-hidden"
                    style={{
                      border: `1.5px solid ${match.win ? 'rgba(60,185,94,0.4)' : 'rgba(212,75,75,0.4)'}`,
                      boxShadow: match.win
                        ? '0 0 6px rgba(60,185,94,0.15)'
                        : '0 0 6px rgba(212,75,75,0.15)',
                    }}
                  >
                    <Image
                      src={`https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/${match.champion}.png`}
                      alt={match.champion}
                      width={iconSize}
                      height={iconSize}
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      unoptimized
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        <motion.p
          className="text-center text-text-secondary/30 text-xs mt-6 uppercase tracking-widest"
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
