interface NotificationPayload {
  event: string
  message: string
  data?: Record<string, unknown>
}

export async function sendNotification(payload: NotificationPayload): Promise<void> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET

  if (!webhookUrl) {
    console.warn('N8N_WEBHOOK_URL not configured, skipping notification')
    return
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': webhookSecret || '',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      console.error(`Notification webhook failed: ${res.status}`)
    }
  } catch (error) {
    console.error('Failed to send notification:', error)
  }
}

export function formatSessionRecap(stats: {
  total: number
  wins: number
  losses: number
  winRate: number
  lpStart: number
  lpEnd: number
  lpChange: number
  bestStreak: number
  tier: string
  rank: string
  lpToMaster: number
  estimatedGames: number | string
  daysLeft: number
  hoursLeft: number
}): string {
  const sign = stats.lpChange >= 0 ? '+' : ''
  return [
    `🎮 Session terminée — AbatJourBleu`,
    ``,
    `📊 Résultats`,
    `- Parties : ${stats.total} (${stats.wins}W / ${stats.losses}L)`,
    `- Win rate : ${stats.winRate}%`,
    `- LP : ${stats.lpStart} → ${stats.lpEnd} (${sign}${stats.lpChange} LP)`,
    `- Rang : ${stats.tier} ${stats.rank}`,
    `- 🔥 Meilleur streak : ${stats.bestStreak}`,
    ``,
    `🏔️ LP restants pour Master : ${stats.lpToMaster}`,
    `- ~${stats.estimatedGames} parties à ce rythme`,
    ``,
    `⏳ Temps restant dans le défi : ${stats.daysLeft}j ${stats.hoursLeft}h`,
  ].join('\n')
}

export function formatDailyRecap(stats: {
  date: string
  totalGames: number
  wins: number
  losses: number
  winRate: number
  lpChange: number
  currentLP: number
  tier: string
  rank: string
  bestDailyStreak: number
  championsList: string
  lpToMaster: number
  estimatedGames: number | string
  daysLeft: number
  hoursLeft: number
}): string {
  const sign = stats.lpChange >= 0 ? '+' : ''
  return [
    `📅 Récap du ${stats.date} — AbatJourBleu`,
    ``,
    `🎮 ${stats.totalGames} parties | ✅ ${stats.wins}W ❌ ${stats.losses}L`,
    `📈 Win rate : ${stats.winRate}%`,
    `💎 ${sign}${stats.lpChange} LP aujourd'hui → ${stats.currentLP} LP (${stats.tier} ${stats.rank})`,
    `🔥 Meilleur streak du jour : ${stats.bestDailyStreak}`,
    `🗡️ Champions : ${stats.championsList}`,
    ``,
    `🏔️ LP restants : ${stats.lpToMaster} (~${stats.estimatedGames} parties)`,
    `⏳ Il reste ${stats.daysLeft}j ${stats.hoursLeft}h dans le défi`,
  ].join('\n')
}
