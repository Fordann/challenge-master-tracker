const TIER_ORDER: Record<string, number> = {
  IRON: 0,
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
  PLATINUM: 4,
  EMERALD: 5,
  DIAMOND: 6,
  MASTER: 7,
  GRANDMASTER: 8,
  CHALLENGER: 9,
}

const RANK_ORDER: Record<string, number> = {
  IV: 0,
  III: 1,
  II: 2,
  I: 3,
}

export function getTotalLP(tier: string, rank: string, lp: number): number {
  const tierIndex = TIER_ORDER[tier] ?? 0
  const rankIndex = RANK_ORDER[rank] ?? 0
  return tierIndex * 400 + rankIndex * 100 + lp
}

export function getLPToMaster(tier: string, rank: string, lp: number): number {
  const masterLP = TIER_ORDER['MASTER'] * 400
  const currentTotal = getTotalLP(tier, rank, lp)
  return Math.max(0, masterLP - currentTotal)
}

export function getEstimatedGames(
  lpToMaster: number,
  avgLpChange: number
): string | number {
  if (avgLpChange <= 0) return 'Redresse la barre d\'abord 💀'
  return Math.ceil(lpToMaster / avgLpChange)
}

export function getAvgLpChange(matches: { lpChange: number }[]): number {
  if (matches.length === 0) return 0
  const last5 = matches.slice(0, 5)
  return last5.reduce((sum, m) => sum + m.lpChange, 0) / last5.length
}

export function getTierRankDisplay(tier: string, rank: string, lp: number): string {
  if (tier === 'MASTER' || tier === 'GRANDMASTER' || tier === 'CHALLENGER') {
    return `${tier.charAt(0)}${tier.slice(1).toLowerCase()} ${lp} LP`
  }
  return `${tier.charAt(0)}${tier.slice(1).toLowerCase()} ${rank} — ${lp} LP`
}

export function getChallengeTimeRemaining(): {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalMs: number
  percentElapsed: number
} {
  const start = new Date(process.env.CHALLENGE_START || '2026-03-08T00:00:00+01:00').getTime()
  const deadline = new Date(process.env.CHALLENGE_DEADLINE || '2026-03-15T23:59:00+01:00').getTime()
  const now = Date.now()
  const totalMs = Math.max(0, deadline - now)
  const totalDuration = deadline - start
  const elapsed = now - start
  const percentElapsed = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))

  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((totalMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((totalMs % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds, totalMs, percentElapsed }
}

export function isOnPace(
  lpGainedSinceStart: number,
  lpRemaining: number,
  percentElapsed: number
): boolean {
  if (percentElapsed === 0) return true
  const percentRemaining = 100 - percentElapsed
  const pace = lpGainedSinceStart / percentElapsed
  const neededPace = lpRemaining / percentRemaining
  return pace >= neededPace
}
