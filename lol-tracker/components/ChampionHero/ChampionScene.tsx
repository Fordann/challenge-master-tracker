'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useParallax, PARALLAX_DEPTH } from './useParallax'
import AtmosphereEngine from './AtmosphereEngine'
import { getAtmosphere, AtmosphereConfig } from './useAtmosphere'

interface ChampionSceneProps {
  championName: string
  skinId: number
  splashPath: string
  cutoutPath: string
  win: boolean
  lpChange: number
  tier: string
  rank: string
  lp: number
  playedAgo: string
  sessionWinRate: number
  ddragonVersion: string
  lpToMaster: number
  estimatedGames: number | string
}

export default function ChampionScene({
  championName,
  splashPath,
  cutoutPath,
  win,
  lpChange,
  tier,
  rank,
  lp,
  playedAgo,
  sessionWinRate,
  ddragonVersion,
  lpToMaster,
  estimatedGames,
}: ChampionSceneProps) {
  const mouse = useParallax()
  const atmosphere: AtmosphereConfig = getAtmosphere(tier, rank, sessionWinRate)

  const ddragonSplash = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championName}_0.jpg`
  const [activeSplashSrc, setActiveSplashSrc] = useState(splashPath)

  const sign = lpChange >= 0 ? '+' : ''
  const resultColor = win ? 'text-accent-green' : 'text-accent-red'
  const resultGlow = win ? 'glow-win' : 'glow-lose'

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Atmosphere particles + gradient */}
      <AtmosphereEngine config={atmosphere} />

      {/* LAYER 1 — Background (deepest, slowest) */}
      <div
        className="absolute inset-[-30px]"
        style={{
          transform: `translate(${mouse.x * PARALLAX_DEPTH.background.x}px, ${mouse.y * PARALLAX_DEPTH.background.y}px)`,
          transition: 'transform 0.12s linear',
        }}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 0.35, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.2 }}
        >
          <Image
            src={activeSplashSrc}
            alt="Background"
            fill
            className="object-cover blur-[2px]"
            unoptimized
            onError={() => setActiveSplashSrc(ddragonSplash)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/30 to-[#0A0A0F]/70" />
        </motion.div>
      </div>

      {/* LAYER 2a — Background (deepest, very slow parallax) */}
      <div
        className="absolute inset-[-30px]"
        style={{
          transform: `translate(${mouse.x * PARALLAX_DEPTH.background.x * 0.3}px, ${mouse.y * PARALLAX_DEPTH.background.y * 0.3}px)`,
          transition: 'transform 0.15s linear',
        }}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 0.2, scale: 1.05 }}
          transition={{ duration: 1.8, delay: 0.1 }}
        >
          <Image
            src={activeSplashSrc}
            alt="Background"
            fill
            className="object-cover blur-[8px]"
            unoptimized
            onError={() => setActiveSplashSrc(ddragonSplash)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/40 to-[#0A0A0F]/80" />
        </motion.div>
      </div>

      {/* LAYER 2b — Bust/Torso (medium parallax, main focus) */}
      <div
        className="absolute inset-[-20px]"
        style={{
          transform: `translate(${mouse.x * PARALLAX_DEPTH.champion.x}px, ${mouse.y * PARALLAX_DEPTH.champion.y}px)`,
          transition: 'transform 0.12s linear',
        }}
      >
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.6, type: 'spring', stiffness: 60 }}
        >
          {/* Center crop — bust/torso region with better isolation */}
          <div className="relative w-[600px] h-[650px] md:w-[850px] md:h-[850px]">
            <Image
              src={activeSplashSrc}
              alt={championName}
              fill
              className="object-cover object-center"
              style={{
                clipPath: 'ellipse(38% 48% at 50% 38%)',
                filter: 'brightness(1.2) contrast(1.08)',
              }}
              unoptimized
              priority
              onError={() => setActiveSplashSrc(ddragonSplash)}
            />
          </div>
        </motion.div>
      </div>

      {/* LAYER 2c — Weapon/Hand (fastest parallax, top layer) */}
      <div
        className="absolute inset-[-40px]"
        style={{
          transform: `translate(${mouse.x * PARALLAX_DEPTH.foreground.x}px, ${mouse.y * PARALLAX_DEPTH.foreground.y}px)`,
          transition: 'transform 0.1s linear',
        }}
      >
        <motion.div
          className="absolute inset-0 flex items-center justify-start"
          initial={{ opacity: 0, scale: 1.25, rotateZ: -5 }}
          animate={{ opacity: 0.75, scale: 1, rotateZ: 0 }}
          transition={{ duration: 0.9, delay: 1.0 }}
        >
          {/* Left side weapon/hand — sharp edge */}
          <div className="relative w-[450px] h-[500px] md:w-[600px] md:h-[700px] -ml-32 md:-ml-48">
            <Image
              src={activeSplashSrc}
              alt=""
              fill
              className="object-cover object-right"
              style={{
                clipPath: 'polygon(0 30%, 30% 0, 40% 20%, 35% 60%, 20% 100%, 0 100%)',
                filter: 'brightness(1.25) saturate(1.1)',
              }}
              unoptimized
              onError={() => setActiveSplashSrc(ddragonSplash)}
            />
          </div>
        </motion.div>
      </div>

      {/* LAYER 4 — Effects overlay (lighting, bloom) */}
      <div
        className="absolute inset-0 pointer-events-none z-[5]"
        style={{
          transform: `translate(${mouse.x * PARALLAX_DEPTH.effects.x}px, ${mouse.y * PARALLAX_DEPTH.effects.y}px)`,
          transition: 'transform 0.1s linear',
        }}
      >
        {/* Radial light source that follows the champion */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: win
              ? 'radial-gradient(circle, rgba(60,185,94,0.06), transparent 70%)'
              : 'radial-gradient(circle, rgba(212,75,75,0.06), transparent 70%)',
            left: '50%',
            top: '35%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      {/* Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none z-[6]"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10,10,15,0.6) 100%)',
        }}
      />

      {/* Text overlay card — IMPROVED POSITIONING & VISIBILITY */}
      <motion.div
        className="absolute bottom-24 left-8 md:left-16 z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.8 }}
      >
        <div className="glass-card p-6 max-w-sm border border-text-secondary/20 backdrop-blur-lg shadow-lg shadow-accent-gold-dark/20">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-full overflow-hidden border-2 flex-shrink-0 ${win ? 'border-accent-green shadow-lg shadow-accent-green/50' : 'border-accent-red shadow-lg shadow-accent-red/50'} ${resultGlow}`}>
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/${championName}.png`}
                alt={championName}
                width={48}
                height={48}
                unoptimized
              />
            </div>
            <div className="min-w-0">
              <p className="font-beaufort text-xl text-accent-gold-light leading-tight">{championName}</p>
              <p className="text-xs text-text-secondary">Derniere partie · il y a {playedAgo}</p>
            </div>
          </div>
          {/* Result section with better visibility */}
          <div className="space-y-2 border-t border-text-secondary/20 pt-3">
            <div className="flex items-center justify-between">
              <span className={`font-beaufort text-2xl font-bold ${resultColor}`}>
                {win ? '✓ VICTOIRE' : '✗ DÉFAITE'}
              </span>
              <span className={`font-beaufort text-2xl font-bold ${resultColor} px-3 py-1 rounded-lg border ${win ? 'border-accent-green/50 bg-accent-green/10' : 'border-accent-red/50 bg-accent-red/10'}`}>
                {sign}{lpChange} LP
              </span>
            </div>
            <div className="text-xs text-text-secondary">
              {tier} {rank} → {tier} {rank} {lp} LP
            </div>
          </div>
        </div>
      </motion.div>

      {/* LP Path Progress — BOTTOM RIGHT */}
      <motion.div
        className="absolute bottom-24 right-8 md:right-16 z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 2.0 }}
      >
        <div className="glass-card p-4 max-w-xs border border-text-secondary/20 backdrop-blur-lg">
          <p className="text-accent-gold-light font-beaufort text-sm mb-3 uppercase tracking-[0.1em]">Chemin vers Master</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-secondary">LP restants:</span>
              <span className="font-beaufort text-accent-cyan text-lg font-bold">{lpToMaster}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-secondary">Parties estimées:</span>
              <span className="font-beaufort text-accent-gold text-lg font-bold">{estimatedGames}</span>
            </div>
            <div className="h-1 bg-text-secondary/10 rounded-full overflow-hidden mt-3">
              <motion.div
                className="h-full bg-gradient-to-r from-accent-green via-accent-cyan to-accent-gold"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, ((2800 - lpToMaster) / 2800) * 100)}%` }}
                transition={{ duration: 1.2, delay: 2.2 }}
              />
            </div>
            <p className="text-xs text-text-secondary/70 mt-2">
              {((2800 - lpToMaster) / 2800 * 100).toFixed(1)}% progression
            </p>
          </div>
        </div>
      </motion.div>

      {/* Atmosphere label */}
      <motion.div
        className="absolute top-20 right-8 z-10 text-xs text-text-secondary/30 font-beaufort tracking-widest"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        {atmosphere.label}
      </motion.div>
    </section>
  )
}
