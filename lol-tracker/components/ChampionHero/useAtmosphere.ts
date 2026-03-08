export type AtmosphereType =
  | 'pre_challenge'
  | 'chaos_abyssal'
  | 'frozen_night'
  | 'starry_sky'
  | 'cosmos_nascent'
  | 'purple_storm'
  | 'cosmic_mist'
  | 'purple_nebula'
  | 'cosmos_intense'
  | 'master_celestial'

export interface AtmosphereConfig {
  type: AtmosphereType
  gradient: string
  particleColor: string
  particleCount: number
  label: string
}

const ATMOSPHERES: Record<AtmosphereType, AtmosphereConfig> = {
  pre_challenge: {
    type: 'pre_challenge',
    gradient: 'linear-gradient(180deg, #050508, #0A0A12, #0F0F1E)',
    particleColor: '#A0A0B0',
    particleCount: 20,
    label: 'Pré-Défi',
  },
  chaos_abyssal: {
    type: 'chaos_abyssal',
    gradient: 'linear-gradient(180deg, #050005, #0A000A, #150015)',
    particleColor: '#D44B4B',
    particleCount: 60,
    label: 'Chaos Abyssal',
  },
  frozen_night: {
    type: 'frozen_night',
    gradient: 'linear-gradient(180deg, #020510, #050A1A, #08102A)',
    particleColor: '#ADD8E6',
    particleCount: 40,
    label: 'Nuit Glacée',
  },
  starry_sky: {
    type: 'starry_sky',
    gradient: 'linear-gradient(180deg, #050510, #0A0A20, #0F0F35)',
    particleColor: '#FFFFFF',
    particleCount: 100,
    label: 'Ciel Étoilé',
  },
  cosmos_nascent: {
    type: 'cosmos_nascent',
    gradient: 'linear-gradient(180deg, #020208, #050515, #08081F)',
    particleColor: '#0BC4E3',
    particleCount: 80,
    label: 'Cosmos Naissant',
  },
  purple_storm: {
    type: 'purple_storm',
    gradient: 'linear-gradient(180deg, #080010, #100020, #180030)',
    particleColor: '#9D48E0',
    particleCount: 80,
    label: 'Tempête Violette',
  },
  cosmic_mist: {
    type: 'cosmic_mist',
    gradient: 'linear-gradient(180deg, #050510, #0A0A20, #100A25)',
    particleColor: '#B8B8D0',
    particleCount: 50,
    label: 'Brume Cosmique',
  },
  purple_nebula: {
    type: 'purple_nebula',
    gradient: 'linear-gradient(180deg, #08050F, #100A1E, #180F2D)',
    particleColor: '#C89B3C',
    particleCount: 90,
    label: 'Nébuleuse Violette',
  },
  cosmos_intense: {
    type: 'cosmos_intense',
    gradient: 'linear-gradient(180deg, #05020A, #0A0515, #100A20)',
    particleColor: '#FFD700',
    particleCount: 120,
    label: 'Cosmos Intense',
  },
  master_celestial: {
    type: 'master_celestial',
    gradient: 'linear-gradient(180deg, #08050A, #120A18, #1A0F28)',
    particleColor: '#FFD700',
    particleCount: 150,
    label: 'Céleste Master',
  },
}

export function getAtmosphere(tier: string, rank: string, winRate: number): AtmosphereConfig {
  if (tier === 'MASTER') return ATMOSPHERES.master_celestial

  const isDiamondHigh = tier === 'DIAMOND' && ['II', 'I'].includes(rank)
  const isDiamondLow = tier === 'DIAMOND' && ['IV', 'III'].includes(rank)

  if (!isDiamondLow && !isDiamondHigh) return ATMOSPHERES.pre_challenge

  if (isDiamondLow) {
    if (winRate < 0.4) return ATMOSPHERES.chaos_abyssal
    if (winRate < 0.6) return ATMOSPHERES.frozen_night
    if (winRate < 0.8) return ATMOSPHERES.starry_sky
    return ATMOSPHERES.cosmos_nascent
  }

  // isDiamondHigh
  if (winRate < 0.4) return ATMOSPHERES.purple_storm
  if (winRate < 0.6) return ATMOSPHERES.cosmic_mist
  if (winRate < 0.8) return ATMOSPHERES.purple_nebula
  return ATMOSPHERES.cosmos_intense
}

export default ATMOSPHERES
