'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface LpDataPoint {
  lpAfter: number
  tier: string
  rank: string
  playedAt: string
}

interface LpGraphProps {
  data: LpDataPoint[]
}

// Convert tier/rank/lp to absolute LP value for graph Y axis
function toAbsoluteLp(tier: string, rank: string, lp: number): number {
  const tierBase: Record<string, number> = {
    IRON: 0, BRONZE: 400, SILVER: 800, GOLD: 1200,
    PLATINUM: 1600, EMERALD: 2000, DIAMOND: 2400, MASTER: 2800,
  }
  const rankOffset: Record<string, number> = { IV: 0, III: 100, II: 200, I: 300 }
  const base = tierBase[tier] ?? 2000
  const rOff = rankOffset[rank] ?? 0
  return base + rOff + lp
}

// Tier threshold lines to display
const TIER_LINES = [
  { label: 'Master', absLp: 2800, color: '#9D48E0' },
  { label: 'Diamond I', absLp: 2700, color: '#576BCE' },
  { label: 'Diamond II', absLp: 2600, color: '#576BCE' },
  { label: 'Diamond III', absLp: 2500, color: '#576BCE' },
  { label: 'Diamond IV', absLp: 2400, color: '#576BCE' },
  { label: 'Emerald I', absLp: 2300, color: '#00A86B' },
]

export default function LpGraph({ data }: LpGraphProps) {
  const { points, minLp, maxLp, svgPath, areaPath } = useMemo(() => {
    if (data.length === 0) return { points: [], minLp: 2000, maxLp: 2800, svgPath: '', areaPath: '' }

    // Sort oldest first
    const sorted = [...data].sort((a, b) => new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime())

    const pts = sorted.map((d, i) => ({
      x: i,
      y: toAbsoluteLp(d.tier, d.rank, d.lpAfter),
    }))

    const yValues = pts.map((p) => p.y)
    const rawMin = Math.min(...yValues)
    const rawMax = Math.max(...yValues)
    // Add padding and snap to tier boundaries
    const mn = Math.floor((rawMin - 50) / 100) * 100
    const mx = Math.ceil((rawMax + 50) / 100) * 100

    // Scale to SVG viewBox (400x200)
    const W = 400
    const H = 180
    const padX = 10
    const padY = 10

    const scaleX = (pts.length > 1) ? (W - padX * 2) / (pts.length - 1) : 0
    const scaleY = (mx - mn > 0) ? (H - padY * 2) / (mx - mn) : 1

    const scaledPts = pts.map((p, i) => ({
      sx: padX + i * scaleX,
      sy: padY + (mx - p.y) * scaleY,
    }))

    // Build smooth SVG path using cardinal spline
    let path = ''
    if (scaledPts.length === 1) {
      path = `M ${scaledPts[0].sx} ${scaledPts[0].sy}`
    } else {
      path = `M ${scaledPts[0].sx} ${scaledPts[0].sy}`
      for (let i = 1; i < scaledPts.length; i++) {
        const prev = scaledPts[i - 1]
        const curr = scaledPts[i]
        const cx = (prev.sx + curr.sx) / 2
        path += ` C ${cx} ${prev.sy} ${cx} ${curr.sy} ${curr.sx} ${curr.sy}`
      }
    }

    // Area fill path
    const lastPt = scaledPts[scaledPts.length - 1]
    const firstPt = scaledPts[0]
    const area = `${path} L ${lastPt.sx} ${H} L ${firstPt.sx} ${H} Z`

    return { points: scaledPts, minLp: mn, maxLp: mx, svgPath: path, areaPath: area }
  }, [data])

  if (data.length < 2) return null

  // Filter tier lines that are in range
  const visibleLines = TIER_LINES.filter(
    (t) => t.absLp >= minLp && t.absLp <= maxLp
  )

  const H = 180
  const padY = 10
  const scaleY = (maxLp - minLp > 0) ? (H - padY * 2) / (maxLp - minLp) : 1

  return (
    <motion.div
      className="absolute bottom-24 right-6 z-20 w-72 md:w-80"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 1.2 }}
    >
      <div className="glass-card p-4 backdrop-blur-xl">
        <p className="text-text-secondary/50 text-[9px] uppercase tracking-[0.2em] mb-2">Progression LP</p>
        <svg viewBox="0 0 400 200" className="w-full" style={{ filter: 'drop-shadow(0 0 4px rgba(11,196,227,0.2))' }}>
          {/* Tier threshold lines */}
          {visibleLines.map((tier) => {
            const y = padY + (maxLp - tier.absLp) * scaleY
            return (
              <g key={tier.label}>
                <line
                  x1="10" y1={y} x2="390" y2={y}
                  stroke={tier.color}
                  strokeWidth="0.5"
                  strokeDasharray="6 4"
                  opacity="0.25"
                />
                <text
                  x="12" y={y - 4}
                  fill={tier.color}
                  fontSize="8"
                  opacity="0.5"
                  fontFamily="'Beaufort for LOL', sans-serif"
                >
                  {tier.label}
                </text>
              </g>
            )
          })}

          {/* Area fill */}
          <defs>
            <linearGradient id="lpAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0BC4E3" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0BC4E3" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lpLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00A86B" />
              <stop offset="50%" stopColor="#0BC4E3" />
              <stop offset="100%" stopColor="#576BCE" />
            </linearGradient>
          </defs>

          <motion.path
            d={areaPath}
            fill="url(#lpAreaGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
          />

          {/* LP line */}
          <motion.path
            d={svgPath}
            fill="none"
            stroke="url(#lpLineGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1.5, ease: 'easeInOut' }}
          />

          {/* Current position dot */}
          {points.length > 0 && (
            <motion.circle
              cx={points[points.length - 1].sx}
              cy={points[points.length - 1].sy}
              r="4"
              fill="#0BC4E3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 3.5, type: 'spring' }}
            />
          )}
        </svg>
      </div>
    </motion.div>
  )
}
