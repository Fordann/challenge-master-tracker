'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import TimerDisplay from './TimerDisplay'

interface MountainChartProps {
  tier: string
  rank: string
  lp: number
  lpToMaster: number
  estimatedGames: number | string
}

const MILESTONES = [
  { label: 'Emerald I', tier: 'EMERALD', rank: 'I', x: 57, y: 58 },
  { label: 'Diamond IV', tier: 'DIAMOND', rank: 'IV', x: 66, y: 47 },
  { label: 'Diamond III', tier: 'DIAMOND', rank: 'III', x: 70, y: 42 },
  { label: 'Diamond II', tier: 'DIAMOND', rank: 'II', x: 73, y: 37 },
  { label: 'Diamond I', tier: 'DIAMOND', rank: 'I', x: 76, y: 32 },
  { label: 'Master', tier: 'MASTER', rank: '', x: 88, y: 13 },
]

function getMilestoneIndex(tier: string, rank: string): number {
  for (let i = 0; i < MILESTONES.length; i++) {
    const m = MILESTONES[i]
    if (m.tier === tier && m.rank === rank) return i
  }
  if (tier === 'MASTER' || tier === 'GRANDMASTER' || tier === 'CHALLENGER') {
    return MILESTONES.length - 1
  }
  return -1
}

function getProgressPosition(tier: string, rank: string, lp: number): { x: number; y: number } {
  const idx = getMilestoneIndex(tier, rank)
  if (idx < 0) return { x: MILESTONES[0].x, y: MILESTONES[0].y }
  if (idx >= MILESTONES.length - 1) return { x: MILESTONES[MILESTONES.length - 1].x, y: MILESTONES[MILESTONES.length - 1].y }

  const current = MILESTONES[idx]
  const next = MILESTONES[idx + 1]
  const t = Math.min(1, Math.max(0, lp / 100))
  return {
    x: current.x + (next.x - current.x) * t,
    y: current.y + (next.y - current.y) * t,
  }
}

function buildPathD(): string {
  if (MILESTONES.length < 2) return ''
  let d = `M ${MILESTONES[0].x} ${MILESTONES[0].y}`
  for (let i = 1; i < MILESTONES.length; i++) {
    const prev = MILESTONES[i - 1]
    const curr = MILESTONES[i]
    const cx = (prev.x + curr.x) / 2
    const cy = Math.min(prev.y, curr.y) - 3
    d += ` Q ${cx} ${cy} ${curr.x} ${curr.y}`
  }
  return d
}

export default function MountainChart({ tier, rank, lp, lpToMaster, estimatedGames }: MountainChartProps) {
  const pos = getProgressPosition(tier, rank, lp)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    let raf: number

    const onMove = (e: MouseEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2
      target.y = (e.clientY / window.innerHeight - 0.5) * 2
    }

    const lerp = () => {
      current.x += (target.x - current.x) * 0.06
      current.y += (target.y - current.y) * 0.06
      setMouse({ x: current.x, y: current.y })
      raf = requestAnimationFrame(lerp)
    }

    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(lerp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  const pathD = buildPathD()

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-end items-center pt-[60px] overflow-hidden"
    >
      {/* Parallax layer 1 — Background image (slow) */}
      <div
        className="absolute inset-[-40px]"
        style={{
          transform: `translate(${mouse.x * 8}px, ${mouse.y * 5}px)`,
          transition: 'transform 0.15s linear',
        }}
      >
        <Image
          src="/background-image.png"
          alt="Ranked Mountain"
          fill
          className="object-cover object-center"
          priority
          unoptimized
        />
      </div>

      {/* Parallax layer 2 — Mid overlay (medium speed) */}
      <div
        className="absolute inset-[-20px] pointer-events-none"
        style={{
          transform: `translate(${mouse.x * 14}px, ${mouse.y * 9}px)`,
          transition: 'transform 0.15s linear',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent opacity-70" />
      </div>

      {/* Parallax layer 3 — Foreground atmospheric glow (fast) */}
      <div
        className="absolute inset-[-30px] pointer-events-none"
        style={{
          transform: `translate(${mouse.x * 25}px, ${mouse.y * 16}px)`,
          transition: 'transform 0.15s linear',
        }}
      >
        <div className="absolute w-96 h-96 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(11,196,227,0.3), transparent 70%)',
            left: '60%',
            top: '30%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      {/* Top/bottom edge fades */}
      <div className="absolute inset-0 pointer-events-none z-[3]">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0A0A0F] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0A0A0F] to-transparent" />
      </div>

      {/* Dotted path SVG between milestones */}
      <svg
        className="absolute inset-0 w-full h-full z-[5] pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          transform: `translate(${mouse.x * 12}px, ${mouse.y * 7}px)`,
          transition: 'transform 0.15s linear',
        }}
      >
        <defs>
          <linearGradient id="pathGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C89B3C" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#0BC4E3" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#9D48E0" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        {/* Glow trail */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#pathGrad)"
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeDasharray="1.5 2.5"
          opacity="0.25"
        />
        {/* Main dotted line */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#pathGrad)"
          strokeWidth="0.18"
          strokeLinecap="round"
          strokeDasharray="0.6 1.4"
        />
        {/* Milestone dots */}
        {MILESTONES.map((m, i) => (
          <circle
            key={i}
            cx={m.x}
            cy={m.y}
            r="0.5"
            fill={i === MILESTONES.length - 1 ? '#9D48E0' : '#C89B3C'}
            opacity="0.5"
          />
        ))}
      </svg>

      {/* Progress cursor — pulsing dot */}
      <motion.div
        className="absolute z-10"
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          transform: `translate(calc(-50% + ${mouse.x * 12}px), calc(-50% + ${mouse.y * 7}px))`,
          transition: 'transform 0.15s linear',
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="relative">
          <motion.div
            className="w-4 h-4 rounded-full"
            style={{ background: 'radial-gradient(circle, #0BC4E3, #0BC4E380)' }}
            animate={{
              boxShadow: [
                '0 0 8px 2px rgba(11,196,227,0.6)',
                '0 0 24px 8px rgba(11,196,227,0.2)',
                '0 0 8px 2px rgba(11,196,227,0.6)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 w-4 h-4 rounded-full border border-accent-blue/40"
            animate={{ scale: [1, 3], opacity: [0.5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 w-4 h-4 rounded-full border border-accent-blue/20"
            animate={{ scale: [1, 4.5], opacity: [0.3, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Stats + Timer — bottom center */}
      <motion.div
        className="relative z-10 flex flex-col items-center w-full max-w-4xl px-6 mb-16"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="flex gap-12 md:gap-20 mb-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-text-secondary/50 text-[10px] uppercase tracking-[0.2em] mb-1">LP Restants</p>
            <p className="font-beaufort text-3xl md:text-4xl text-accent-gold">{lpToMaster.toLocaleString()}</p>
          </motion.div>
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-text-secondary/50 text-[10px] uppercase tracking-[0.2em] mb-1">Parties Est.</p>
            <p className="font-beaufort text-3xl md:text-4xl text-accent-gold">
              {typeof estimatedGames === 'number' ? `~${estimatedGames}` : '--'}
            </p>
          </motion.div>
        </div>

        <TimerDisplay />
      </motion.div>
    </section>
  )
}
