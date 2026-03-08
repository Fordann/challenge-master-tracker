'use client'

import { useEffect, useRef, useMemo } from 'react'
import { AtmosphereConfig } from './useAtmosphere'

interface AtmosphereEngineProps {
  config: AtmosphereConfig
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  twinkleSpeed: number
  twinklePhase: number
}

export default function AtmosphereEngine({ config }: AtmosphereEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const prevConfigRef = useRef(config.type)

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const maxParticles = isMobile ? Math.min(50, config.particleCount) : config.particleCount

  const particles = useMemo(() => {
    const arr: Particle[] = []
    for (let i = 0; i < maxParticles; i++) {
      arr.push({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.5 - 0.1,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
      })
    }
    return arr
  }, [maxParticles])

  useEffect(() => {
    particlesRef.current = particles
  }, [particles])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let time = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result
        ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
        : { r: 255, g: 255, b: 255 }
    }

    const rgb = hexToRgb(config.particleColor)

    const render = () => {
      time += 0.016
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const scaleX = canvas.width / 1920
      const scaleY = canvas.height / 1080

      for (const p of particlesRef.current) {
        p.x += p.vx
        p.y += p.vy

        // Wrap around
        if (p.y < -10) p.y = 1090
        if (p.y > 1090) p.y = -10
        if (p.x < -10) p.x = 1930
        if (p.x > 1930) p.x = -10

        const twinkle = Math.sin(time * p.twinkleSpeed * 60 + p.twinklePhase)
        const alpha = p.opacity * (0.5 + twinkle * 0.5)

        ctx.beginPath()
        ctx.arc(p.x * scaleX, p.y * scaleY, p.size * Math.min(scaleX, scaleY), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
        ctx.fill()

        // Glow for larger particles
        if (p.size > 1.5) {
          ctx.beginPath()
          ctx.arc(p.x * scaleX, p.y * scaleY, p.size * 3 * Math.min(scaleX, scaleY), 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * 0.15})`
          ctx.fill()
        }
      }

      // Lightning for storm atmospheres
      if (config.type === 'chaos_abyssal' || config.type === 'purple_storm') {
        if (Math.random() < 0.002) {
          ctx.fillStyle = config.type === 'purple_storm'
            ? 'rgba(157, 72, 224, 0.15)'
            : 'rgba(212, 75, 75, 0.1)'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
      }

      // Aurora for master celestial
      if (config.type === 'master_celestial') {
        for (let i = 0; i < 3; i++) {
          const y = canvas.height * 0.3 + Math.sin(time * 0.5 + i * 2) * canvas.height * 0.1
          const gradient = ctx.createLinearGradient(0, y - 50, 0, y + 50)
          const colors = ['rgba(157,72,224,0.05)', 'rgba(200,155,60,0.08)', 'rgba(11,196,227,0.05)']
          gradient.addColorStop(0, 'transparent')
          gradient.addColorStop(0.5, colors[i % 3])
          gradient.addColorStop(1, 'transparent')
          ctx.fillStyle = gradient
          ctx.fillRect(0, y - 50, canvas.width, 100)
        }
      }

      animationId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [config])

  useEffect(() => {
    prevConfigRef.current = config.type
  }, [config.type])

  return (
    <>
      <div
        className="absolute inset-0 transition-opacity duration-[2000ms]"
        style={{ background: config.gradient }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.8 }}
      />
    </>
  )
}
