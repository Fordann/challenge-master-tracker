import PQueue from 'p-queue'

const queue = new PQueue({
  intervalCap: 18,
  interval: 1000,
  carryoverConcurrencyCount: true,
})

const RIOT_API_KEY = process.env.RIOT_API_KEY!

async function riotFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { 'X-Riot-Token': RIOT_API_KEY },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Riot API error ${res.status}: ${res.statusText} for ${url} - ${body}`)
  }
  return res.json()
}

function queuedFetch<T>(url: string): Promise<T> {
  return queue.add(() => riotFetch<T>(url)) as Promise<T>
}

export interface RiotAccount {
  puuid: string
  gameName: string
  tagLine: string
}

export interface Summoner {
  puuid: string
  profileIconId: number
  revisionDate: number
  summonerLevel: number
}

export interface LeagueEntry {
  leagueId: string
  summonerId: string
  queueType: string
  tier: string
  rank: string
  leaguePoints: number
  wins: number
  losses: number
}

export interface MatchParticipant {
  puuid: string
  championName: string
  championId: number
  win: boolean
  // skin number used in the match (maps to Data Dragon skin index)
  item0: number
  teamId: number
  // The actual fields we need
  [key: string]: unknown
}

export interface MatchInfo {
  gameId: number
  gameDuration: number
  gameStartTimestamp: number
  gameEndTimestamp: number
  queueId: number
  participants: MatchParticipant[]
}

export interface MatchData {
  metadata: { matchId: string; participants: string[] }
  info: MatchInfo
}

export async function getAccountByRiotId(gameName: string, tagLine: string): Promise<RiotAccount> {
  return queuedFetch<RiotAccount>(
    `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
  )
}

export async function getSummonerByPuuid(puuid: string): Promise<Summoner> {
  return queuedFetch<Summoner>(
    `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`
  )
}

export async function getLeagueEntriesByPuuid(puuid: string): Promise<LeagueEntry[]> {
  return queuedFetch<LeagueEntry[]>(
    `https://euw1.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`
  )
}

export async function getMatchIds(puuid: string, count = 20, start = 0): Promise<string[]> {
  return queuedFetch<string[]>(
    `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&start=${start}&count=${count}`
  )
}

export async function getMatch(matchId: string): Promise<MatchData> {
  return queuedFetch<MatchData>(
    `https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}`
  )
}

export function getSoloQueueEntry(entries: LeagueEntry[]): LeagueEntry | undefined {
  return entries.find((e) => e.queueType === 'RANKED_SOLO_5x5')
}

// Data Dragon helpers
let cachedVersion: string | null = null

export async function getLatestVersion(): Promise<string> {
  if (cachedVersion) return cachedVersion
  const versions = await fetch('https://ddragon.leagueoflegends.com/api/versions.json').then(
    (r) => r.json() as Promise<string[]>
  )
  cachedVersion = versions[0]
  return cachedVersion
}

export function getSplashArtUrl(championName: string, skinId: number): string {
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championName}_${skinId}.jpg`
}

export async function getChampionIconUrl(championName: string): Promise<string> {
  const version = await getLatestVersion()
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championName}.png`
}
