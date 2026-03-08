'use client'

import { motion } from 'framer-motion'

interface StreakFlameProps {
  streak: number
  type: 'win' | 'loss' | null
}

function getFlameConfig(streak: number) {
  if (streak === 0) return { color: '#606060', size: 40, animation: '', label: 'Éteinte' }
  if (streak <= 2) return { color: '#FF8C00', size: 60, animation: 'flame-gentle', label: 'Petite flamme' }
  if (streak <= 4) return { color: '#FF4500', size: 80, animation: 'flame-vivid', label: 'Flamme vive' }
  return { color: '#FFD700', size: 100, animation: 'flame-intense', label: 'Inferno' }
}

export default function StreakFlame({ streak, type }: StreakFlameProps) {
  const isWinStreak = type === 'win'
  const displayStreak = isWinStreak ? streak : 0
  const config = getFlameConfig(displayStreak)

  return (
    <section className="min-h-screen flex items-center justify-center"
      style={{ background: '#0A0A0F' }}
    >
      <motion.div
        className="text-center"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, duration: 0.5 }}
      >
        {/* Flame SVG */}
        <div className={`mx-auto mb-6 ${config.animation}`} style={{ width: config.size * 1.5, height: config.size * 2 }}>
          <svg viewBox="0 0 100 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {displayStreak === 0 ? (
              // Smoke puff for extinct flame
              <>
                <circle cx="50" cy="120" r="8" fill="#404040" opacity="0.3" />
                <motion.circle
                  cx="50" cy="100"
                  r="12"
                  fill="#505050"
                  opacity="0.2"
                  animate={{ cy: [100, 80], opacity: [0.2, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.circle
                  cx="55" cy="90"
                  r="8"
                  fill="#404040"
                  opacity="0.15"
                  animate={{ cy: [90, 60], opacity: [0.15, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                />
              </>
            ) : (
              // Flame
              <>
                <defs>
                  <radialGradient id="flameGlow" cx="50%" cy="70%" r="60%">
                    <stop offset="0%" stopColor={config.color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={config.color} stopOpacity="0" />
                  </radialGradient>
                </defs>
                <ellipse cx="50" cy="100" rx="40" ry="60" fill="url(#flameGlow)" />
                <path
                  d="M50 20 C50 20 20 60 25 100 C28 120 35 140 50 145 C65 140 72 120 75 100 C80 60 50 20 50 20Z"
                  fill={config.color}
                  opacity="0.9"
                />
                <path
                  d="M50 40 C50 40 35 65 37 95 C38 110 43 130 50 135 C57 130 62 110 63 95 C65 65 50 40 50 40Z"
                  fill="white"
                  opacity="0.3"
                />
                {/* Particles for intense */}
                {displayStreak >= 5 && (
                  <>
                    <motion.circle
                      cx="30" cy="70" r="2" fill={config.color}
                      animate={{ cy: [70, 20], opacity: [0.8, 0], cx: [30, 25] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                    />
                    <motion.circle
                      cx="70" cy="80" r="1.5" fill={config.color}
                      animate={{ cy: [80, 30], opacity: [0.7, 0], cx: [70, 75] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                    />
                    <motion.circle
                      cx="45" cy="60" r="1.5" fill={config.color}
                      animate={{ cy: [60, 10], opacity: [0.6, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                    />
                    <motion.circle
                      cx="60" cy="65" r="2" fill={config.color}
                      animate={{ cy: [65, 15], opacity: [0.8, 0], cx: [60, 65] }}
                      transition={{ duration: 1.1, repeat: Infinity, delay: 0.9 }}
                    />
                  </>
                )}
              </>
            )}
          </svg>
        </div>

        {/* Streak number */}
        <motion.p
          className="font-beaufort"
          style={{
            fontSize: displayStreak >= 5 ? '100px' : '80px',
            color: config.color,
            lineHeight: 1,
            textShadow: displayStreak >= 5 ? `0 0 30px ${config.color}60` : 'none',
          }}
          initial={{ scale: 0 }}
          whileInView={{ scale: [0, 1.1, 1] }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {displayStreak}
        </motion.p>

        <p className="text-text-secondary mt-2 text-lg">
          {isWinStreak ? 'victoires d\'affilée' : type === 'loss' ? 'Streak de défaites...' : 'Pas de streak'}
        </p>

        {!isWinStreak && type === 'loss' && streak > 0 && (
          <p className="text-accent-red/60 text-sm mt-1">{streak} défaites d&apos;affilée</p>
        )}
      </motion.div>
    </section>
  )
}
