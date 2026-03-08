export function getEncouragementMessage(
  winRate: number,
  currentStreak: number,
  streakType: 'win' | 'loss' | null
): string {
  if (streakType === 'win' && currentStreak >= 3) {
    const messages = [
      "T'es en feu ! Continue comme ça 🔥",
      "Inarrêtable. Le Master tremble.",
      "Machine. Les LP pleuvent.",
      "Streak de ouf, profite du momentum !",
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  if (streakType === 'loss' && currentStreak >= 3) {
    const messages = [
      "⚠️ Tilt alert — prends une pause, tu reviendras plus fort.",
      "3 défaites d'affilée... Respire, bois un verre d'eau.",
      "Le mental est plus important que le LP. Fais une pause.",
      "Stop loss activé. Reviens dans 30 min.",
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  if (winRate > 60) {
    const messages = [
      "T'es chaud, continue comme ça.",
      "Solide session, le climb avance bien !",
      "Win rate de dingue, le Master est proche.",
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  if (winRate < 40) {
    const messages = [
      "Session compliquée... Peut-être prendre une pause ?",
      "Ça passe pas aujourd'hui. Pas grave, ça ira mieux demain.",
      "Les LP ça se récupère. Le mental, faut le protéger.",
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  const messages = [
    "Session équilibrée. Chaque game compte.",
    "On avance, petit à petit.",
    "Régulier et constant, c'est la clé du climb.",
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}
