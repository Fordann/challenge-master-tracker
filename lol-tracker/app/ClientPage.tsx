'use client'

import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar/Navbar'
import MountainChart from '@/components/MountainSection/MountainChart'
import SessionDashboard from '@/components/SessionDashboard/SessionDashboard'
import ChampionWall from '@/components/MatchHistory/ChampionWall'

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
  lpHistory: {
    lpAfter: number
    tier: string
    rank: string
    playedAt: string
  }[]
  totalMatches: number
  lastSyncAt: string
}

export default function ClientPage({ data }: { data: PageData }) {
  return (
    <main className="noise-overlay">
      <Navbar
        tier={data.tier}
        rank={data.rank}
        lp={data.lp}
        lastSyncAt={new Date(data.lastSyncAt)}
      />

      {/* Section 1 — Mountain parallax */}
      <MountainChart
        tier={data.tier}
        rank={data.rank}
        lp={data.lp}
        lpToMaster={data.lpToMaster}
        estimatedGames={data.estimatedGames}
        lpHistory={data.lpHistory}
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

      {/* Divider */}
      <div className="section-divider" />

      {/* Section 3 — Session Dashboard (replaces match history) */}
      <SessionDashboard
        matches={data.displayMatches}
        totalMatches={data.totalMatches}
        ddragonVersion={data.ddragonVersion}
        sessionData={data.sessionData}
        currentStreak={data.currentStreak}
        streakType={data.streakType}
      />

      {/* Divider */}
      <div className="section-divider" />

      {/* Section 4 — Champion Wall */}
      {data.wallMatches.length > 0 && (
        <ChampionWall matches={data.wallMatches} ddragonVersion={data.ddragonVersion} />
      )}
    </main>
  )
}
