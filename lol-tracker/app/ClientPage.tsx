'use client'

import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar/Navbar'
import MountainChart from '@/components/MountainSection/MountainChart'
import SessionCard from '@/components/SessionCard/SessionCard'
import StreakFlame from '@/components/StreakDisplay/StreakFlame'
import MatchTable from '@/components/MatchHistory/MatchTable'
import ChampionWall from '@/components/MatchHistory/ChampionWall'

// Dynamic import for Three.js / heavy client components
const ChampionScene = dynamic(
  () => import('@/components/ChampionHero/ChampionScene'),
  { ssr: false }
)

interface PageData {
  tier: string
  rank: string
  lp: number
  lpToMaster: number
  estimatedGames: number | string
  currentStreak: number
  streakType: 'win' | 'loss' | null
  sessionData: {
    total: number
    wins: number
    losses: number
    winRate: number
    lpChange: number
    tier: string
    rank: string
    lp: number
  } | null
  sessionWinRate: number
  ddragonVersion: string
  lastMatch: {
    champion: string
    skinId: number
    win: boolean
    lpChange: number
    playedAgo: string
    cutoutPath: string
    splashPath: string
  } | null
  displayMatches: {
    id: number
    matchId: string
    champion: string
    win: boolean
    lpChange: number
    duration: number
    playedAt: string
  }[]
  wallMatches: {
    champion: string
    win: boolean
  }[]
  totalMatches: number
  lastSyncAt: string
}

export default function ClientPage({ data }: { data: PageData }) {
  return (
    <main>
      <Navbar
        tier={data.tier}
        rank={data.rank}
        lp={data.lp}
        lastSyncAt={new Date(data.lastSyncAt)}
      />

      {/* Section 1 — Montagne */}
      <MountainChart
        tier={data.tier}
        rank={data.rank}
        lp={data.lp}
        lpToMaster={data.lpToMaster}
        estimatedGames={data.estimatedGames}
      />

      {/* Section 2 — Hero Champion 2.5D */}
      {data.lastMatch && (
        <ChampionScene
          championName={data.lastMatch.champion}
          skinId={data.lastMatch.skinId}
          splashPath={data.lastMatch.splashPath}
          cutoutPath={data.lastMatch.cutoutPath}
          win={data.lastMatch.win}
          lpChange={data.lastMatch.lpChange}
          tier={data.tier}
          rank={data.rank}
          lp={data.lp}
          playedAgo={data.lastMatch.playedAgo}
          sessionWinRate={data.sessionWinRate}
          ddragonVersion={data.ddragonVersion}
        />
      )}

      {/* Section 3 — Session actuelle */}
      {data.sessionData && (
        <SessionCard
          total={data.sessionData.total}
          wins={data.sessionData.wins}
          losses={data.sessionData.losses}
          winRate={data.sessionData.winRate}
          lpChange={data.sessionData.lpChange}
          tier={data.sessionData.tier}
          rank={data.sessionData.rank}
          lp={data.sessionData.lp}
          currentStreak={data.currentStreak}
          streakType={data.streakType}
        />
      )}

      {/* Section 4 — Streak Flamme */}
      <StreakFlame
        streak={data.currentStreak}
        type={data.streakType}
      />

      {/* Section 5 — Historique des parties */}
      <MatchTable
        initialMatches={data.displayMatches}
        totalMatches={data.totalMatches}
        ddragonVersion={data.ddragonVersion}
      />

      {/* Section 6 — Champion Wall */}
      {data.wallMatches.length > 0 && (
        <ChampionWall matches={data.wallMatches} ddragonVersion={data.ddragonVersion} />
      )}
    </main>
  )
}
