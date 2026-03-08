'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useParallax, PARALLAX_DEPTH } from './useParallax'
import ParallaxLayer from './ParallaxLayer'
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
}: ChampionSceneProps) {
  const mouse = useParallax()
  const atmosphere: AtmosphereConfig = getAtmosphere(tier, rank, sessionWinRate)

  const sign = lpChange >= 0 ? '+' : ''
  const resultColor = win ? 'text-accent-green' : 'text-accent-red'
  const resultGlow = win ? 'glow-win' : 'glow-lose'

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Atmosphere background */}
      <AtmosphereEngine config={atmosphere} />

      {/* Background splash layer */}
      <ParallaxLayer
        mouseX={mouse.x} mouseY={mouse.y}
        depthX={PARALLAX_DEPTH.background.x}
        depthY={PARALLAX_DEPTH.background.y}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
        >
          <Image
            src={splashPath}
            alt="Background"
            fill
            className="object-cover blur-sm"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-bg-primary/80" />
        </motion.div>
      </ParallaxLayer>

      {/* Champion cutout layer */}
      <ParallaxLayer
        mouseX={mouse.x} mouseY={mouse.y}
        depthX={PARALLAX_DEPTH.champion.x}
        depthY={PARALLAX_DEPTH.champion.y}
      >
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <div className="relative w-[600px] h-[600px] md:w-[800px] md:h-[800px]">
            <Image
              src={cutoutPath}
              alt={championName}
              fill
              className="object-contain"
              unoptimized
              priority
            />
          </div>
        </motion.div>
      </ParallaxLayer>

      {/* 3D rotation wrapper */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `perspective(1000px) rotateX(${mouse.y * 2}deg) rotateY(${mouse.x * -2}deg)`,
          transition: 'transform 0.1s linear',
        }}
      />

      {/* Text overlay */}
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
                src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${championName}.png`}
                alt={championName}
                width={40}
                height={40}
                unoptimized
              />
            </div>
            <div>
              <p className="font-beaufort text-lg text-accent-gold-light">{championName}</p>
              <p className="text-xs text-text-secondary">Dernière partie · il y a {playedAgo}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className={`font-beaufort text-lg ${resultColor}`}>
              {win ? 'WIN' : 'LOSE'}
            </span>
            <span className={`font-beaufort ${resultColor}`}>
              {sign}{lpChange} LP
            </span>
            <span className="text-text-secondary">→</span>
            <span className="text-accent-gold-light text-sm">
              {tier.charAt(0) + tier.slice(1).toLowerCase()} {rank} · {lp} LP
            </span>
          </div>
        </div>
      </motion.div>

      {/* Atmosphere label */}
      <motion.div
        className="absolute top-20 right-8 z-10 text-xs text-text-secondary/40 font-beaufort"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        {atmosphere.label}
      </motion.div>
    </section>
  )
}
