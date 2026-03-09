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

      {/* LAYER 2 — Mid/Body (champion main body, medium speed) */}
      <div
        className="absolute inset-[-20px]"
        style={{
          transform: `translate(${mouse.x * PARALLAX_DEPTH.champion.x}px, ${mouse.y * PARALLAX_DEPTH.champion.y}px)`,
          transition: 'transform 0.12s linear',
        }}
      >
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, y: 40, scale: 1.05 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          {/* Center crop — bust/torso region */}
          <div className="relative w-[700px] h-[700px] md:w-[900px] md:h-[900px]">
            <Image
              src={activeSplashSrc}
              alt={championName}
              fill
              className="object-cover object-top"
              style={{
                clipPath: 'ellipse(45% 50% at 50% 40%)',
                filter: 'brightness(1.1) contrast(1.05)',
              }}
              unoptimized
              priority
              onError={() => setActiveSplashSrc(ddragonSplash)}
            />
          </div>
        </motion.div>
      </div>

      {/* LAYER 3 — Foreground elements (fastest parallax, edges/weapons) */}
      <div
        className="absolute inset-[-40px]"
        style={{
          transform: `translate(${mouse.x * PARALLAX_DEPTH.foreground.x}px, ${mouse.y * PARALLAX_DEPTH.foreground.y}px)`,
          transition: 'transform 0.1s linear',
        }}
      >
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          {/* Foreground crop — bottom portion (hands/weapons) */}
          <div className="relative w-[800px] h-[400px] md:w-[1000px] md:h-[500px] mt-[300px]">
            <Image
              src={activeSplashSrc}
              alt=""
              fill
              className="object-cover object-bottom"
              style={{
                clipPath: 'polygon(10% 40%, 90% 40%, 100% 100%, 0% 100%)',
                filter: 'brightness(1.15)',
                maskImage: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
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

      {/* Text overlay card */}
      <motion.div
        className="absolute bottom-16 left-8 md:left-16 z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.8 }}
      >
        <div className="glass-card p-6 max-w-md">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${win ? 'border-accent-green' : 'border-accent-red'} ${resultGlow}`}>
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/${championName}.png`}
                alt={championName}
                width={40}
                height={40}
                unoptimized
              />
            </div>
            <div>
              <p className="font-beaufort text-lg text-accent-gold-light">{championName}</p>
              <p className="text-xs text-text-secondary">Derniere partie · il y a {playedAgo}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className={`font-beaufort text-lg ${resultColor}`}>
              {win ? 'WIN' : 'LOSE'}
            </span>
            <span className={`font-beaufort ${resultColor}`}>
              {sign}{lpChange} LP
            </span>
            <span className="text-text-secondary/50">{'->'}</span>
            <span className="text-accent-gold-light text-sm">
              {tier.charAt(0) + tier.slice(1).toLowerCase()} {rank} · {lp} LP
            </span>
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
