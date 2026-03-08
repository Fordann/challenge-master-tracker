'use client'

import { CSSProperties, ReactNode } from 'react'

interface ParallaxLayerProps {
  mouseX: number
  mouseY: number
  depthX: number
  depthY: number
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export default function ParallaxLayer({
  mouseX,
  mouseY,
  depthX,
  depthY,
  children,
  className = '',
  style = {},
}: ParallaxLayerProps) {
  const transform = `translate(${mouseX * depthX}px, ${mouseY * depthY}px)`

  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={{
        transform,
        transition: 'transform 0.1s linear',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
