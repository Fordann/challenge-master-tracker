import { prisma } from './db'
import { getSplashArtUrl } from './riot'
import * as fs from 'fs'
import * as path from 'path'

const CACHE_DIR = path.join(process.cwd(), 'public', 'champion-cache')

export async function getChampionCutout(
  championName: string,
  skinId: number
): Promise<{ cutoutPath: string; splashPath: string }> {
  // Check cache
  const cached = await prisma.championAsset.findUnique({
    where: { championName_skinId: { championName, skinId } },
  })

  if (cached) {
    return {
      cutoutPath: cached.cutoutPath,
      splashPath: `/champion-cache/${championName}_${skinId}_splash.jpg`,
    }
  }

  // Ensure cache directory exists
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
  }

  // Download splash art
  const splashUrl = getSplashArtUrl(championName, skinId)
  const splashResponse = await fetch(splashUrl)
  const splashBuffer = Buffer.from(await splashResponse.arrayBuffer())
  const splashFilename = `${championName}_${skinId}_splash.jpg`
  const splashPath = path.join(CACHE_DIR, splashFilename)
  fs.writeFileSync(splashPath, splashBuffer)

  // Try Remove.bg
  let cutoutFilename = `${championName}_${skinId}_cutout.png`
  let cutoutRelPath = `/champion-cache/${cutoutFilename}`

  const apiKey = process.env.REMOVEBG_API_KEY
  if (apiKey && apiKey !== 'xxxxxxxxxxxxxxxx') {
    try {
      const formData = new FormData()
      formData.append('image_url', splashUrl)
      formData.append('size', 'auto')

      const rbgRes = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: { 'X-Api-Key': apiKey },
        body: formData,
      })

      if (rbgRes.ok) {
        const cutoutBuffer = Buffer.from(await rbgRes.arrayBuffer())
        fs.writeFileSync(path.join(CACHE_DIR, cutoutFilename), cutoutBuffer)
      } else {
        console.warn(`Remove.bg failed (${rbgRes.status}), using splash fallback`)
        cutoutRelPath = `/champion-cache/${splashFilename}`
      }
    } catch {
      console.warn('Remove.bg error, using splash fallback')
      cutoutRelPath = `/champion-cache/${splashFilename}`
    }
  } else {
    // No Remove.bg key — use splash as fallback
    cutoutRelPath = `/champion-cache/${splashFilename}`
  }

  // Store in DB
  await prisma.championAsset.create({
    data: {
      championName,
      skinId,
      cutoutPath: cutoutRelPath,
    },
  })

  return {
    cutoutPath: cutoutRelPath,
    splashPath: `/champion-cache/${splashFilename}`,
  }
}
