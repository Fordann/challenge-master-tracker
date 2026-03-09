'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Hardcoded challenge dates — March 8 to March 15 midnight Paris time
const CHALLENGE_START = new Date('2026-03-08T00:00:00+01:00').getTime()
const CHALLENGE_DEADLINE = new Date('2026-03-16T00:00:00+01:00').getTime()

export default function TimerDisplay() {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, percentElapsed: 0, totalMs: 1 })

  useEffect(() => {
    const update = () => {
      const now = Date.now()
      const totalMs = Math.max(0, CHALLENGE_DEADLINE - now)
      const totalDuration = CHALLENGE_DEADLINE - CHALLENGE_START
      const elapsed = now - CHALLENGE_START
      const percentElapsed = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))

      setTime({
        days: Math.floor(totalMs / (1000 * 60 * 60 * 24)),
        hours: Math.floor((totalMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((totalMs % (1000 * 60)) / 1000),
        percentElapsed,
        totalMs,
      })
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  const isUrgent = time.totalMs <= 48 * 60 * 60 * 1000
  const isCritical = time.totalMs <= 24 * 60 * 60 * 1000
  const isLastHour = time.totalMs <= 60 * 60 * 1000
  const isOver = time.totalMs <= 0

  if (isOver) {
    return (
      <div className="text-center">
        <p className="font-beaufort text-2xl text-text-secondary">DEFI TERMINE</p>
      </div>
    )
  }

  const timerClass = isCritical ? 'timer-critical' : isUrgent ? 'timer-urgent' : ''

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1 }}
    >
      <p className="text-text-secondary/60 text-xs uppercase tracking-[0.3em] mb-3">Il reste</p>
      <div className={`font-beaufort text-4xl md:text-5xl tracking-wider ${timerClass}`}>
        <span className="text-accent-gold">{String(time.days).padStart(2, '0')}</span>
        <span className="text-text-secondary/40 text-2xl mx-1">j</span>
        <span className="text-accent-gold">{String(time.hours).padStart(2, '0')}</span>
        <span className="text-text-secondary/40 text-2xl mx-1">h</span>
        <span className="text-accent-gold">{String(time.minutes).padStart(2, '0')}</span>
        <span className="text-text-secondary/40 text-2xl mx-1">m</span>
        <span className="text-accent-gold/60 text-2xl">{String(time.seconds).padStart(2, '0')}</span>
        <span className="text-text-secondary/30 text-lg">s</span>
      </div>
      <p className="text-text-secondary/40 text-xs mt-2 uppercase tracking-widest">pour atteindre le Master</p>

      {isLastHour && (
        <p className="text-accent-red font-beaufort text-lg mt-3 animate-pulse">
          DERNIERE HEURE
        </p>
      )}

      {/* Progress bar */}
      <div className="mt-4 w-64 mx-auto h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${time.percentElapsed}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{
            background: time.percentElapsed > 70
              ? 'linear-gradient(90deg, #D44B4B, #FF4500)'
              : 'linear-gradient(90deg, #C89B3C, #0BC4E3)',
          }}
        />
      </div>
      <p className="text-text-secondary/30 text-[10px] mt-1.5 tracking-wider">
        {Math.round(time.percentElapsed)}% du temps ecoule
      </p>
    </motion.div>
  )
}
