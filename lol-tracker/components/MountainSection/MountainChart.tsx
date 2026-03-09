'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import TimerDisplay from './TimerDisplay'
import LpGraph from './LpGraph'

interface LpDataPoint {
  lpAfter: number
  tier: string
  rank: string
  playedAt: string
}

interface MountainChartProps {
  tier: string
  rank: string
  lp: number
  lpToMaster: number
  estimatedGames: number | string
  lpHistory: LpDataPoint[]
}

// Positions calibrated to background-image.png landmarks
// The path follows the right side of the mountain from bottom-right to top
const MILESTONES = [
  { label: 'Emerald I', tier: 'EMERALD', rank: 'I', x: 70, y: 62 },
  { label: 'Diamond IV', tier: 'DIAMOND', rank: 'IV', x: 73, y: 53 },
  { label: 'Diamond III', tier: 'DIAMOND', rank: 'III', x: 70, y: 47 },
  { label: 'Diamond II', tier: 'DIAMOND', rank: 'II', x: 75, y: 42 },
  { label: 'Diamond I', tier: 'DIAMOND', rank: 'I', x: 80, y: 36 },
  { label: 'Master', tier: 'MASTER', rank: '', x: 90, y: 18 },
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
    const cy = Math.min(prev.y, curr.y) - 2
    d += ` Q ${cx} ${cy} ${curr.x} ${curr.y}`
  }
  return d
}

export default function MountainChart({ tier, rank, lp, lpToMaster, estimatedGames, lpHistory }: MountainChartProps) {
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
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#0A0A0F] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#0A0A0F] to-transparent" />
      </div>

      {/* Dotted path SVG — high visibility */}
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
            <stop offset="0%" stopColor="#C89B3C" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#0BC4E3" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#9D48E0" stopOpacity="0.7" />
          </linearGradient>
          <filter id="pathGlow">
            <feGaussianBlur stdDeviation="0.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Wide glow trail behind */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#pathGrad)"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeDasharray="2 3"
          opacity="0.35"
          filter="url(#pathGlow)"
        />
        {/* Main dotted line — bright */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#pathGrad)"
          strokeWidth="0.25"
          strokeLinecap="round"
          strokeDasharray="0.8 1.5"
          opacity="0.8"
        />
        {/* Milestone dots — larger and brighter */}
        {MILESTONES.map((m, i) => (
          <g key={i}>
            {/* Outer glow */}
            <circle
              cx={m.x}
              cy={m.y}
              r="1.2"
              fill={i === MILESTONES.length - 1 ? '#9D48E0' : '#C89B3C'}
              opacity="0.2"
            />
            {/* Inner dot */}
            <circle
              cx={m.x}
              cy={m.y}
              r="0.6"
              fill={i === MILESTONES.length - 1 ? '#9D48E0' : '#F0E6C8'}
              opacity="0.8"
            />
          </g>
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
            className="w-5 h-5 rounded-full"
            style={{ background: 'radial-gradient(circle, #0BC4E3, #0BC4E360)' }}
            animate={{
              boxShadow: [
                '0 0 10px 3px rgba(11,196,227,0.7)',
                '0 0 28px 10px rgba(11,196,227,0.25)',
                '0 0 10px 3px rgba(11,196,227,0.7)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 w-5 h-5 rounded-full border-2 border-accent-blue/50"
            animate={{ scale: [1, 3], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 w-5 h-5 rounded-full border border-accent-blue/25"
            animate={{ scale: [1, 5], opacity: [0.3, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      </motion.div>

      {/* LP Graph — bottom right */}
      <LpGraph data={lpHistory} />

      {/* Stats + Timer — bottom left */}
      <motion.div
        className="relative z-10 flex flex-col items-start w-full max-w-5xl px-8 mb-12"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="glass-card px-8 py-6 backdrop-blur-xl">
          <div className="flex gap-10 md:gap-16 mb-6">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-text-secondary/60 text-[10px] uppercase tracking-[0.2em] mb-1">LP Restants</p>
              <p className="font-beaufort text-3xl md:text-4xl text-accent-gold drop-shadow-[0_0_8px_rgba(200,155,60,0.3)]">
                {lpToMaster.toLocaleString()}
              </p>
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-text-secondary/60 text-[10px] uppercase tracking-[0.2em] mb-1">Parties Est.</p>
              <p className="font-beaufort text-3xl md:text-4xl text-accent-gold drop-shadow-[0_0_8px_rgba(200,155,60,0.3)]">
                {typeof estimatedGames === 'number' ? `~${estimatedGames}` : '--'}
              </p>
            </motion.div>
          </div>

          <TimerDisplay />
        </div>
      </motion.div>
    </section>
  )
}
