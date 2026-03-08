'use client'

import { ReactNode } from 'react'

interface GlowCardProps {
  children: ReactNode
  className?: string
  variant?: 'hextech' | 'win' | 'lose' | 'gold'
}

const GLOW_CLASSES = {
  hextech: 'glow-hextech',
  win: 'glow-win',
  lose: 'glow-lose',
  gold: 'glow-gold',
}

export default function GlowCard({ children, className = '', variant = 'hextech' }: GlowCardProps) {
  return (
    <div className={`glass-card ${GLOW_CLASSES[variant]} ${className}`}>
      {children}
    </div>
  )
}
