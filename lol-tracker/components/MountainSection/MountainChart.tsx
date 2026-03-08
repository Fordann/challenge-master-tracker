'use client'

import { motion } from 'framer-motion'
import TimerDisplay from './TimerDisplay'

interface MountainChartProps {
  tier: string
  rank: string
  lp: number
  lpToMaster: number
  estimatedGames: number | string
}

const TIERS = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND', 'MASTER']
const TIER_COLORS: Record<string, string> = {
  IRON: '#6B6B6B',
  BRONZE: '#8B5E3C',
  SILVER: '#A0A0B0',
  GOLD: '#C89B3C',
  PLATINUM: '#21A882',
  EMERALD: '#00A86B',
  DIAMOND: '#576BCE',
  MASTER: '#9D48E0',
}

function getTierProgress(tier: string, rank: string, lp: number): number {
  const tierIndex = TIERS.indexOf(tier)
  if (tierIndex === -1) return 0
  const rankMap: Record<string, number> = { IV: 0, III: 1, II: 2, I: 3 }
  const rankProgress = rankMap[rank] ?? 0
  const totalLP = tierIndex * 400 + rankProgress * 100 + lp
  const masterLP = 7 * 400
  return Math.min(1, totalLP / masterLP)
}

export default function MountainChart({ tier, rank, lp, lpToMaster, estimatedGames }: MountainChartProps) {
  const progress = getTierProgress(tier, rank, lp)

  // Mountain SVG path points
  const mountainPath = 'M0,500 L50,480 L120,420 L180,440 L250,350 L320,370 L400,280 L480,300 L550,200 L620,220 L700,130 L780,100 L850,50 L900,30 L950,20 L1000,10 L1000,500 Z'

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center px-6 pt-[60px]"
      style={{ background: 'linear-gradient(180deg, #0A0A0F 0%, #1A1F2E 100%)' }}
    >
      {/* Mountain SVG */}
      <div className="absolute inset-0 bottom-0 overflow-hidden">
        <svg viewBox="0 0 1000 500" className="absolute bottom-0 w-full" preserveAspectRatio="xMidYMax slice">
          <defs>
            <linearGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1A1F2E" />
              <stop offset="100%" stopColor="#0F1923" />
            </linearGradient>
          </defs>

          <motion.path
            d={mountainPath}
            fill="url(#mountainGrad)"
            stroke="rgba(200,155,60,0.15)"
            strokeWidth="1"
            initial={{ translateY: 100, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />

          {/* Tier markers on the mountain */}
          {TIERS.map((t, i) => {
            const x = 50 + (i / (TIERS.length - 1)) * 900
            const y = 480 - (i / (TIERS.length - 1)) * 470
            const isCurrentTier = t === tier
            const color = TIER_COLORS[t]

            return (
              <g key={t}>
                <circle
                  cx={x} cy={y} r={isCurrentTier ? 6 : 3}
                  fill={color}
                  opacity={isCurrentTier ? 1 : 0.4}
                />
                {isCurrentTier && (
                  <motion.circle
                    cx={x} cy={y} r={12}
                    fill="none"
                    stroke="#0BC4E3"
                    strokeWidth={1.5}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                <text
                  x={x} y={y - 15}
                  textAnchor="middle"
                  fill={isCurrentTier ? color : 'rgba(160,160,176,0.4)'}
                  fontSize={isCurrentTier ? 12 : 9}
                  fontFamily="serif"
                >
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </text>
              </g>
            )
          })}

          {/* Progress dot along mountain */}
          <motion.circle
            cx={50 + progress * 900}
            cy={480 - progress * 470}
            r={8}
            fill="#0BC4E3"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
          </motion.circle>
        </svg>
      </div>

      {/* Stats overlay */}
      <motion.div
        className="relative z-10 flex flex-col md:flex-row items-end justify-between w-full max-w-5xl mt-auto mb-32"
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
              {typeof estimatedGames === 'number' ? `~ ${estimatedGames}` : '—'}
            </p>
          </div>
        </div>

        <TimerDisplay />
      </motion.div>

      {typeof estimatedGames === 'string' && (
        <motion.p
          className="absolute bottom-8 text-text-secondary text-sm italic"
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
