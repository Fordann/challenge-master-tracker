'use client'

import { useEffect, useRef, useState } from 'react'

interface Position {
  x: number
  y: number
}

export function useParallax() {
  const [mouse, setMouse] = useState<Position>({ x: 0, y: 0 })
  const targetRef = useRef<Position>({ x: 0, y: 0 })
  const currentRef = useRef<Position>({ x: 0, y: 0 })
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2
      targetRef.current = { x, y }
    }

    const handleMouseLeave = () => {
      targetRef.current = { x: 0, y: 0 }
    }

    const lerp = () => {
      const lerpFactor = 0.08
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * lerpFactor
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * lerpFactor
      setMouse({ ...currentRef.current })
      rafRef.current = requestAnimationFrame(lerp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    rafRef.current = requestAnimationFrame(lerp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return mouse
}

export const PARALLAX_DEPTH = {
  background: { x: 8, y: 5 },
  midground: { x: 18, y: 12 },
  effects: { x: 28, y: 18 },
  champion: { x: 22, y: 15 },
  foreground: { x: 40, y: 25 },
}
