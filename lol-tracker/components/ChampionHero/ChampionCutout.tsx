'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface ChampionCutoutProps {
  cutoutPath: string
  championName: string
}

export default function ChampionCutout({ cutoutPath, championName }: ChampionCutoutProps) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0, scale: 1.15 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.9 }}
    >
      <Image
        src={cutoutPath}
        alt={championName}
        fill
        className="object-contain"
        priority
        unoptimized
      />
    </motion.div>
  )
}
