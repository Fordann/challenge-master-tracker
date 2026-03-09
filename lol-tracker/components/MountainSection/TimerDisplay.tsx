'use client'

import { useState, useEffect } from 'react'

const CHALLENGE_START = process.env.NEXT_PUBLIC_CHALLENGE_START || '2026-03-08T00:00:00+01:00'
const CHALLENGE_DEADLINE = process.env.NEXT_PUBLIC_CHALLENGE_DEADLINE || '2026-03-16T00:00:00+01:00'

export default function TimerDisplay() {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, percentElapsed: 0, totalMs: 1 })

  useEffect(() => {
    const update = () => {
      const start = new Date(CHALLENGE_START).getTime()
      const deadline = new Date(CHALLENGE_DEADLINE).getTime()
      const now = Date.now()
      const totalMs = Math.max(0, deadline - now)
      const totalDuration = deadline - start
      const elapsed = now - start
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
        <p className="font-beaufort text-2xl text-text-secondary">DÉFI TERMINÉ</p>
      </div>
    )
  }

  const timerClass = isCritical ? 'timer-critical' : isUrgent ? 'timer-urgent' : ''

  return (
    <div className="text-right">
      <p className="text-text-secondary text-sm mb-2">IL RESTE</p>
      <div className={`font-beaufort text-3xl md:text-4xl text-accent-gold ${timerClass}`}>
        <span>{String(time.days).padStart(2, '0')}j</span>{' '}
        <span>{String(time.hours).padStart(2, '0')}h</span>{' '}
        <span>{String(time.minutes).padStart(2, '0')}m</span>{' '}
        <span className="text-2xl">{String(time.seconds).padStart(2, '0')}s</span>
      </div>
      <p className="text-text-secondary text-xs mt-1">pour atteindre le Master</p>

      {isLastHour && (
        <p className="text-accent-red font-beaufort text-lg mt-2 animate-pulse">
          DERNIERE HEURE
        </p>
      )}

      {/* Progress bar */}
      <div className="mt-3 w-full h-2 bg-bg-card rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${time.percentElapsed}%`,
            background: time.percentElapsed > 70
              ? 'linear-gradient(90deg, #D44B4B, #FF4500)'
              : 'linear-gradient(90deg, #3CB95E, #0BC4E3)',
          }}
        />
      </div>
      <p className="text-text-secondary text-xs mt-1">
        {Math.round(time.percentElapsed)}% du temps écoulé
      </p>
    </div>
  )
}
