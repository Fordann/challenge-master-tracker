# LoL Master Tracker — Documentation Technique

## Vue d'ensemble

Application web full-stack de suivi en temps réel de la progression ranked de **AbatJourBleu#EUW11** sur League of Legends (EUW), avec pour objectif d'atteindre le **Master** en Solo/Duo Queue.

- **Défi** : 8 mars 2026 00h00 → 15 mars 2026 23h59 (7 jours)
- **Stack** : Next.js 14 · MariaDB · Three.js · n8n · Coolify

---

## Table des matières

1. [Architecture](#1-architecture)
2. [Installation & Démarrage](#2-installation--démarrage)
3. [Variables d'environnement](#3-variables-denvironnement)
4. [Base de données (Prisma / MariaDB)](#4-base-de-données)
5. [API Riot Games](#5-api-riot-games)
6. [API Routes internes](#6-api-routes-internes)
7. [Synchronisation automatique (Cron)](#7-synchronisation-automatique)
8. [Logique de session](#8-logique-de-session)
9. [Calcul des LP](#9-calcul-des-lp)
10. [Interface utilisateur](#10-interface-utilisateur)
11. [Système d'atmosphères](#11-système-datmosphères)
12. [Rendu Champion 2.5D](#12-rendu-champion-25d)
13. [Notifications WhatsApp](#13-notifications-whatsapp)
14. [Page Admin](#14-page-admin)
15. [Docker & Déploiement](#15-docker--déploiement)
16. [Thème visuel](#16-thème-visuel)
17. [Points d'attention](#17-points-dattention)

---

## 1. Architecture

```
┌─────────────────────────────────────────────────────┐
│                    COOLIFY (Docker)                  │
│                                                     │
│  ┌──────────┐   ┌──────────┐   ┌──────────────┐    │
│  │ Next.js  │──▶│ MariaDB  │   │     n8n      │    │
│  │ :3000    │   │ :3306    │   │    :5678     │    │
│  └────┬─────┘   └──────────┘   └──────┬───────┘    │
│       │                               │             │
│       │  POST webhook                 │             │
│       └───────────────────────────────┘             │
│       │                                             │
│       │  Riot API (toutes les 5 min)                │
│       ▼                                             │
│  ┌──────────────────────┐                           │
│  │ Riot Games API       │                           │
│  │ (europe / euw1)      │                           │
│  └──────────────────────┘                           │
└─────────────────────────────────────────────────────┘
```

### Structure du projet

```
lol-tracker/
├── app/
│   ├── page.tsx                        # Page serveur (data fetching)
│   ├── ClientPage.tsx                  # Orchestrateur client (toutes les sections)
│   ├── layout.tsx                      # Layout global (dark theme, fonts)
│   ├── globals.css                     # Variables CSS, animations, thème LoL
│   ├── admin/
│   │   └── notifications/page.tsx      # Gestion destinataires WhatsApp
│   └── api/
│       ├── sync/route.ts               # POST — sync manuelle
│       ├── matches/route.ts            # GET — historique paginé
│       ├── session/route.ts            # GET — session active
│       ├── rank/route.ts               # GET — rang + snapshots
│       └── admin/recipients/route.ts   # CRUD — destinataires notifications
│
├── components/
│   ├── Navbar/Navbar.tsx               # Barre sticky avec rang et sync
│   ├── MountainSection/
│   │   ├── MountainChart.tsx           # SVG montagne + paliers lumineux
│   │   └── TimerDisplay.tsx            # Countdown + barre progression
│   ├── ChampionHero/
│   │   ├── ChampionScene.tsx           # Orchestrateur parallax + overlay texte
│   │   ├── ParallaxLayer.tsx           # Calque générique avec translation
│   │   ├── ChampionCutout.tsx          # Image champion isolée
│   │   ├── AtmosphereEngine.tsx        # Canvas 2D particules + effets
│   │   ├── useAtmosphere.ts            # Matrice atmosphère (tier × winrate)
│   │   └── useParallax.ts              # Hook mousemove → positions lerpées
│   ├── SessionCard/
│   │   ├── SessionCard.tsx             # Card glassmorphism session active
│   │   └── encouragementMessage.ts     # Messages dynamiques selon contexte
│   ├── StreakDisplay/
│   │   └── StreakFlame.tsx             # Flamme SVG animée style Duolingo
│   ├── MatchHistory/
│   │   ├── MatchTable.tsx              # Liste paginée avec "Voir plus"
│   │   ├── MatchRow.tsx                # Ligne-carte par partie
│   │   └── ChampionWall.tsx            # Mosaïque d'icônes champions
│   └── ui/
│       └── GlowCard.tsx                # Card glassmorphism réutilisable
│
├── lib/
│   ├── riot.ts                         # Client Riot API + p-queue
│   ├── db.ts                           # Singleton Prisma
│   ├── session.ts                      # Logique session (détection + clôture)
│   ├── lpCalculator.ts                 # LP total, LP to Master, estimations
│   ├── notifications.ts               # POST webhook n8n + formatters
│   ├── removebg.ts                     # Client Remove.bg + cache FS/DB
│   └── cron.ts                         # node-cron (sync 5min, recap 23h30)
│
├── prisma/schema.prisma
├── instrumentation.ts                  # Démarrage cron au boot Next.js
├── docker-compose.yml
├── Dockerfile
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## 2. Installation & Démarrage

### Prérequis

- Node.js 20+
- MariaDB 11 (ou via Docker)
- Clé API Riot Games ([developer.riotgames.com](https://developer.riotgames.com))

### Installation locale

```bash
cd lol-tracker
npm install --legacy-peer-deps

# Configurer les variables d'environnement
cp .env.local.example .env.local
# Éditer .env.local avec vos clés

# Pousser le schéma en BDD
npx prisma db push

# Lancer en dev
npm run dev
```

### Démarrage via Docker

```bash
# Configurer le .env à la racine
docker compose up -d

# La BDD est initialisée automatiquement
# L'app est accessible sur http://localhost:3000
# n8n est accessible sur http://localhost:5678
```

---

## 3. Variables d'environnement

| Variable | Description | Exemple |
|---|---|---|
| `RIOT_API_KEY` | Clé API Riot Games | `RGAPI-xxxx-xxxx-xxxx` |
| `DATABASE_URL` | URL de connexion MariaDB | `mysql://loltracker:password@mariadb:3306/loltracker` |
| `N8N_WEBHOOK_URL` | URL du webhook n8n | `http://n8n:5678/webhook/lol-notify` |
| `N8N_WEBHOOK_SECRET` | Secret partagé pour l'auth webhook | `changeme` |
| `REMOVEBG_API_KEY` | Clé API Remove.bg (optionnel) | `xxxx` |
| `CHALLENGE_START` | Date de début du défi (ISO 8601) | `2026-03-08T00:00:00+01:00` |
| `CHALLENGE_DEADLINE` | Date limite du défi (ISO 8601) | `2026-03-15T23:59:00+01:00` |
| `CRON_INTERVAL_MINUTES` | Intervalle de sync en minutes | `5` |
| `ADMIN_PASSWORD` | Mot de passe page admin | `changeme` |

---

## 4. Base de données

### Modèles Prisma

#### `Player`
Joueur suivi. Créé automatiquement au premier démarrage via résolution du Riot ID.

| Champ | Type | Description |
|---|---|---|
| `puuid` | String | Identifiant universel Riot |
| `summonerId` | String | ID invocateur EUW |
| `gameName` | String | `AbatJourBleu` |
| `tagLine` | String | `EUW11` |

#### `Match`
Chaque partie ranked Solo/Duo enregistrée.

| Champ | Type | Description |
|---|---|---|
| `matchId` | String | ID unique Riot (`EUW1_xxxxx`) |
| `playedAt` | DateTime | Timestamp de début |
| `champion` | String | Nom du champion joué |
| `championId` | Int | ID numérique du champion |
| `skinId` | Int | Skin utilisée (pour splash art) |
| `win` | Boolean | Victoire ou défaite |
| `lpBefore` / `lpAfter` | Int | LP avant/après la partie |
| `lpChange` | Int | Différence de LP |
| `tier` / `rank` | String | Rang au moment de la partie |
| `duration` | Int | Durée en secondes |
| `sessionId` | Int? | Rattachement à une session |

#### `Session`
Regroupement de parties consécutives (écart < 2h).

| Champ | Type | Description |
|---|---|---|
| `startedAt` | DateTime | Début de session |
| `endedAt` | DateTime? | Fin de session (null si active) |
| `isActive` | Boolean | Session en cours |

#### `RankSnapshot`
Historique du rang, capturé à chaque changement détecté lors d'un sync.

#### `ChampionAsset`
Cache des assets champions découpés via Remove.bg. Clé unique : `(championName, skinId)`.

#### `NotificationRecipient`
Destinataires des notifications WhatsApp (nom, téléphone, clé Callmebot, actif/inactif).

---

## 5. API Riot Games

### Fichier : `lib/riot.ts`

#### Rate Limiting
Utilise `p-queue` avec :
- **18 requêtes / seconde** (marge sous la limite de 20)
- File d'attente séquentielle avec `carryoverConcurrencyCount`

#### Endpoints utilisés

| # | Endpoint | Description |
|---|---|---|
| 1 | `GET /riot/account/v1/accounts/by-riot-id/{name}/{tag}` | Résolution Riot ID → PUUID |
| 2 | `GET /lol/summoner/v4/summoners/by-puuid/{puuid}` | PUUID → summonerId |
| 3 | `GET /lol/league/v4/entries/by-summoner/{id}` | Rang actuel (tier, rank, LP) |
| 4 | `GET /lol/match/v5/matches/by-puuid/{puuid}/ids?queue=420` | IDs des parties ranked |
| 5 | `GET /lol/match/v5/matches/{matchId}` | Détails d'une partie |

#### Serveurs

- **Compte** : `europe.api.riotgames.com`
- **Summoner / League** : `euw1.api.riotgames.com`
- **Matches** : `europe.api.riotgames.com`

#### Helpers Data Dragon

```typescript
getLatestVersion()           // Version actuelle du patch (cachée en mémoire)
getSplashArtUrl(name, skin)  // URL splash art HD
getChampionIconUrl(name)     // URL icône carrée
```

---

## 6. API Routes internes

### `POST /api/sync`

Déclenche une synchronisation manuelle. Appelé par le bouton Refresh de la navbar.

**Réponse** :
```json
{ "success": true, "newMatches": 2, "rank": "DIAMOND II 45 LP" }
```

### `GET /api/matches?page=0&limit=20`

Retourne l'historique paginé des parties.

**Réponse** :
```json
{
  "matches": [{ "matchId": "...", "champion": "Jinx", "win": true, ... }],
  "total": 47
}
```

### `GET /api/session`

Retourne la session active avec ses statistiques.

**Réponse** :
```json
{
  "session": {
    "id": 5,
    "isActive": true,
    "matches": [...],
    "stats": { "total": 4, "wins": 3, "losses": 1, "winRate": 75, ... }
  }
}
```

### `GET /api/rank`

Retourne le rang actuel, LP vers Master, streak, et historique des snapshots.

**Réponse** :
```json
{
  "rank": {
    "tier": "DIAMOND", "rank": "II", "lp": 45,
    "lpToMaster": 355, "estimatedGames": 18,
    "currentStreak": 3, "streakType": "win",
    "lastMatch": { ... }
  },
  "snapshots": [...]
}
```

### `CRUD /api/admin/recipients`

Authentifié via header `X-Admin-Password`. Gère les destinataires de notifications.

---

## 7. Synchronisation automatique

### Fichier : `lib/cron.ts`

#### Démarrage

Le cron est initialisé via le fichier `instrumentation.ts` de Next.js, qui s'exécute au démarrage du serveur :

```typescript
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initCron } = await import('./lib/cron')
    await initCron()
  }
}
```

#### Tâches planifiées

| Schedule | Tâche | Description |
|---|---|---|
| `*/5 * * * *` | `syncRiotData()` | Sync rang + nouvelles parties |
| `30 23 * * *` | `sendDailyRecap()` | Récapitulatif journalier WhatsApp |

#### Flux de synchronisation

1. Récupérer ou créer le joueur (résolution Riot ID au premier lancement)
2. Fetch du rang actuel via League API
3. Créer un `RankSnapshot` si le rang a changé
4. Détecter changement de division → notification
5. Fetch des 20 derniers match IDs ranked
6. Pour chaque nouveau match :
   - Récupérer les détails
   - Créer l'entrée `Match` en BDD
   - Assigner à une session
   - Pré-cacher les assets champion (Remove.bg)
7. Fermer les sessions inactives (> 2h sans partie)
8. Envoyer notification de fin de session si applicable

---

## 8. Logique de session

### Fichier : `lib/session.ts`

**Règle** : un écart > 2 heures entre deux parties consécutives = nouvelle session.

#### Algorithme `assignMatchToSession()`

```
1. Chercher la session active du joueur
2. Si aucune → créer nouvelle session
3. Si session active :
   a. Calculer l'écart avec la dernière partie de la session
   b. Si écart > 2h → clore session + créer nouvelle
   c. Sinon → rattacher la partie
```

#### `closeStaleSession()`

Appelé à chaque sync. Vérifie si la session active n'a pas eu de partie depuis > 2h et la ferme si c'est le cas. Utile en cas de redémarrage du cron.

#### `getSessionStats()`

Retourne les statistiques d'une session :
- Victoires / défaites / win rate
- LP début → fin et changement net
- Meilleur streak de victoires dans la session

---

## 9. Calcul des LP

### Fichier : `lib/lpCalculator.ts`

#### Système de points

Chaque tier vaut 400 LP (4 divisions × 100 LP). Total Iron IV 0 LP = 0, Master 0 LP = 2800.

```
LP Total = (tierIndex × 400) + (rankIndex × 100) + LP actuels
```

| Tier | Index |
|---|---|
| IRON | 0 |
| BRONZE | 1 |
| SILVER | 2 |
| GOLD | 3 |
| PLATINUM | 4 |
| EMERALD | 5 |
| DIAMOND | 6 |
| MASTER | 7 |

#### `getLPToMaster(tier, rank, lp)`

```
2800 - getTotalLP(tier, rank, lp)
```

#### `getEstimatedGames(lpToMaster, avgLpChange)`

Moyenne des 5 dernières parties (victoires ET défaites). Si la moyenne est ≤ 0, retourne le message `"Redresse la barre d'abord 💀"`.

#### `isOnPace(lpGained, lpRemaining, percentElapsed)`

Compare le rythme actuel avec le rythme nécessaire pour finir à temps. Utilisé pour colorer la barre de progression du timer.

---

## 10. Interface utilisateur

### Page unique `/` — Scroll cinématique

6 sections en scroll vertical, chacune ≥ 100vh, révélées progressivement avec Framer Motion.

#### Section 1 — Montagne (`MountainChart.tsx`)

- SVG pleine largeur avec silhouette de montagne
- Marqueurs de tier colorés le long du chemin
- Point lumineux pulsant à la position actuelle
- Chiffres clés : LP restants, parties estimées
- Timer du défi intégré (countdown en temps réel)
- Barre de progression temporelle (vert si on pace, rouge sinon)

**Comportements d'urgence du timer** :
| Temps restant | Effet |
|---|---|
| > 48h | Normal |
| ≤ 48h | Pulse orange |
| ≤ 24h | Pulse rouge + particules accélérées |
| ≤ 1h | Message "DERNIÈRE HEURE 🔥" |
| 0 | "DÉFI TERMINÉ" (figé) |

#### Section 2 — Hero Champion 2.5D (`ChampionScene.tsx`)

Dernier champion joué avec la skin utilisée. Voir §12 pour le détail du rendu parallax.

Overlay texte en bas à gauche :
```
[Icône]  ChampionName
         Dernière partie · il y a Xmin
         WIN/LOSE  ±XX LP  →  Tier Rank · XX LP
```

#### Section 3 — Session actuelle (`SessionCard.tsx`)

Card glassmorphism avec :
- Nombre de parties (gros chiffre dominant)
- W/L/WR
- LP change net
- Message dynamique contextuel (voir `encouragementMessage.ts`)

#### Section 4 — Streak Flamme (`StreakFlame.tsx`)

Flamme SVG centrée sur fond noir total.

| Streak | Taille | Animation | Couleur |
|---|---|---|---|
| 0 | Éteinte | Fumée (smoke puff) | `#606060` |
| 1-2 | Petite | Douce, lente | `#FF8C00` |
| 3-4 | Moyenne | Vive, rythmée | `#FF4500` |
| 5+ | Grande | Frénétique + particules | `#FFD700` |

#### Section 5 — Historique (`MatchTable.tsx` + `MatchRow.tsx`)

Lignes-cartes avec :
- Icône champion avec bordure colorée (vert/rouge)
- Nom champion
- WIN/LOSE avec glow
- LP change
- Durée
- Temps écoulé depuis la partie
- Stagger animation (50ms entre chaque ligne)
- Bouton "Voir plus" pour pagination

#### Section 6 — Champion Wall (`ChampionWall.tsx`)

Mosaïque dense :
- Icônes 48×48px en cercle
- Bordure colorée (vert victoire, rouge défaite)
- Emoji overlay semi-transparent (😊/😢)
- Apparition au scroll une par une (stagger 20ms, spring)
- Compteur total en bas

### Navbar sticky (`Navbar.tsx`)

```
⚔️ AbatJourBleu   [Gold II — 67 LP]   [↻ Refresh]   ⏱ sync il y a 3min
```

- Fond noir semi-transparent + `backdrop-blur(8px)`
- Badge rang coloré dynamiquement par tier
- Bouton Refresh : rotation 360° (600ms), glow bleu au hover
- Temps de dernière sync mis à jour toutes les 10s

---

## 11. Système d'atmosphères

### Fichier : `components/ChampionHero/useAtmosphere.ts`

Le fond de la section Hero est une scène météorologique dynamique basée sur deux variables :
- **Variable A** : win rate de la session (ou 10 dernières parties si pas de session)
- **Variable B** : tier actuel

#### Matrice

```
                         WIN RATE SESSION
                   < 40%          40-60%         60-80%         > 80%
               ┌──────────────┬──────────────┬──────────────┬──────────────┐
  DIAMOND IV-III│ Chaos        │ Nuit         │ Ciel         │ Cosmos       │
               │ Abyssal      │ Glacée       │ Étoilé       │ Naissant     │
               ├──────────────┼──────────────┼──────────────┼──────────────┤
  DIAMOND II-I │ Tempête      │ Brume        │ Nébuleuse    │ Cosmos       │
               │ Violette     │ Cosmique     │ Violette     │ Intense      │
               ├──────────────┴──────────────┴──────────────┴──────────────┤
  MASTER       │              CÉLESTE MASTER (unique)                      │
               └──────────────────────────────────────────────────────────┘
  < Diamond    → Pré-Défi (fond neutre)
```

#### Atmosphères détaillées

| Type | Gradient | Particules | Effets spéciaux |
|---|---|---|---|
| `pre_challenge` | `#050508 → #0F0F1E` | 20 grises | Étoiles fixes discrètes |
| `chaos_abyssal` | `#050005 → #150015` | 60 rouges | Éclairs violets aléatoires |
| `frozen_night` | `#020510 → #08102A` | 40 bleu clair | Givre dérivant |
| `starry_sky` | `#050510 → #0F0F35` | 100 blanches | Scintillement twinkle |
| `cosmos_nascent` | `#020208 → #08081F` | 80 cyan | Étoiles filantes |
| `purple_storm` | `#080010 → #180030` | 80 violettes | Éclairs intenses |
| `cosmic_mist` | `#050510 → #100A25` | 50 grises | Brouillard ondulant |
| `purple_nebula` | `#08050F → #180F2D` | 90 dorées | Nébuleuse pulsante |
| `cosmos_intense` | `#05020A → #100A20` | 120 dorées | Nébuleuse + étoiles filantes |
| `master_celestial` | `#08050A → #1A0F28` | 150 dorées | Aurore boréale SVG |

### Rendu : `AtmosphereEngine.tsx`

Canvas 2D avec :
- Particules animées (drift, twinkle, glow)
- Éclairs aléatoires (chaos + storm)
- Aurore boréale sinusoïdale (master)
- Responsive : max 50 particules sur mobile
- Transition entre atmosphères via crossfade CSS (2000ms)

---

## 12. Rendu Champion 2.5D

### Concept

Le splash art est séparé en calques de profondeur qui se déplacent indépendamment selon la position de la souris, créant un effet de parallax 3D.

### Calques et profondeurs

| Calque | Contenu | Déplacement X | Déplacement Y |
|---|---|---|---|
| Background | Splash art flouté (opacity 0.3) | ±8px | ±5px |
| Midground | — | ±18px | ±12px |
| Effects | — | ±28px | ±18px |
| Champion | Cutout champion (PNG transparent) | ±22px | ±15px |
| Foreground | — | ±40px | ±25px |

### Hook `useParallax()`

1. Écoute `mousemove` sur `window`
2. Normalise la position de la souris entre -1 et +1
3. Applique un lerp (facteur 0.08) pour fluidité
4. Boucle d'animation via `requestAnimationFrame`
5. Retour en position neutre si souris hors écran (ease-out 1000ms)

### Rotation 3D globale

```css
perspective(1000px) rotateX(mouseY * 2deg) rotateY(mouseX * -2deg)
```

### Cinématique d'ouverture

| Temps | Action |
|---|---|
| 200ms | Arrière-plan fade in (opacity 0→1, scale 1.1→1.0) |
| 900ms | Champion fade in (scale 1.15→1.0) |
| 1800ms | Overlay texte glisse depuis le bas |

### Découpe champion (`lib/removebg.ts`)

1. Nouvelle partie détectée → vérifier cache `ChampionAsset`
2. Si pas en cache :
   - Télécharger splash HD depuis Data Dragon
   - POST vers Remove.bg → PNG transparent
   - Stocker dans `/public/champion-cache/`
   - Enregistrer en BDD
3. **Fallback** si Remove.bg indisponible : utiliser le splash art complet

---

## 13. Notifications WhatsApp

### Architecture

```
Next.js (cron/sync) → POST webhook n8n → n8n Workflow → Callmebot → WhatsApp
```

### Triggers

| Événement | Condition | Message type |
|---|---|---|
| Division change | tier ou rank change | `⬆️ {ancien} → {nouveau} !` |
| Master atteint | tier = MASTER | `🏆 MASTER ATTEINT !` |
| Fin de session | Écart > 2h détecté | Récap complet |
| Récap journalier | Cron 23h30 | Récap de la journée |

### Format récap de session

```
🎮 Session terminée — AbatJourBleu

📊 Résultats
- Parties : 5 (3W / 2L)
- Win rate : 60%
- LP : 35 → 67 (+32 LP)
- Rang : DIAMOND II
- 🔥 Meilleur streak : 3

🏔️ LP restants pour Master : 233
- ~12 parties à ce rythme

⏳ Temps restant dans le défi : 4j 16h
```

### Setup Callmebot (par destinataire)

1. Ajouter `+34 644 59 87 48` dans ses contacts WhatsApp
2. Envoyer le message : `I allow callmebot to send me messages`
3. Recevoir sa `apikey` personnelle
4. Configurer dans la page admin `/admin/notifications`

**Limite** : ~50 messages/jour par numéro (plan gratuit).

### Sécurité webhook

Tous les appels Next.js → n8n incluent le header `X-Webhook-Secret`.

---

## 14. Page Admin

### URL : `/admin/notifications`

Protégée par mot de passe simple (variable `ADMIN_PASSWORD`), transmis via header `X-Admin-Password`.

#### Fonctionnalités

- **Ajouter** un destinataire (nom, numéro, clé API Callmebot)
- **Activer/Désactiver** un destinataire
- **Supprimer** un destinataire

---

## 15. Docker & Déploiement

### Services Docker Compose

| Service | Image | Port | Description |
|---|---|---|---|
| `app` | Build local (Dockerfile) | 3000 | Application Next.js |
| `mariadb` | `mariadb:11` | 3306 | Base de données |
| `n8n` | `n8nio/n8n:latest` | 5678 | Orchestrateur de workflows |

### Dockerfile

Build multi-stage :
1. **deps** — `npm ci` + `prisma generate`
2. **builder** — `next build`
3. **runner** — Copie du standalone output, exécution avec `node server.js`

### Volumes persistants

- `mariadb_data` — Données MariaDB
- `n8n_data` — Workflows n8n
- `champion_cache` — Assets champions mis en cache

### Healthcheck MariaDB

Le service `app` attend que MariaDB soit healthy avant de démarrer :
```yaml
healthcheck:
  test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]
  interval: 10s
  timeout: 5s
  retries: 5
```

---

## 16. Thème visuel

### Palette de couleurs

| Variable | Hex | Usage |
|---|---|---|
| `--bg-primary` | `#0A0A0F` | Fond principal (noir profond) |
| `--bg-secondary` | `#0F1923` | Bleu nuit LoL |
| `--bg-card` | `#1A1F2E` | Fond des cards |
| `--accent-gold` | `#C89B3C` | Or LoL (titres, accents) |
| `--accent-gold-light` | `#F0E6C8` | Or clair / texte principal |
| `--accent-blue` | `#0BC4E3` | Bleu Hextech |
| `--accent-red` | `#D44B4B` | Défaite |
| `--accent-green` | `#3CB95E` | Victoire |
| `--text-secondary` | `#A0A0B0` | Texte secondaire |

### Typographie

- **Titres / Chiffres** : Beaufort for LOL → fallback Cinzel
- **Corps** : Spiegel → fallback Inter

### Effets UI

| Effet | CSS |
|---|---|
| Glassmorphism | `background: rgba(15,25,35,0.6); backdrop-filter: blur(12px)` |
| Glow Hextech | `box-shadow: 0 0 12px rgba(11,196,227,0.4)` |
| Glow Victoire | `box-shadow: 0 0 8px rgba(60,185,94,0.5)` |
| Glow Défaite | `box-shadow: 0 0 8px rgba(212,75,75,0.5)` |

### Animations clés

| Élément | Animation | Durée |
|---|---|---|
| Sections au scroll | fadeInUp (translateY 40px → 0) | 600ms ease-out |
| Stagger historique | Délai 50ms entre lignes | — |
| Champion Wall | scale 0 → 1, spring | 200ms + stagger 20ms |
| Streak flamme | scale 0 → 1.1 → 1 | 500ms spring |
| Bouton Refresh | rotation 360° | 600ms |
| Atmosphère | crossfade deux fonds | 2000ms |

### Responsive

- Sections en colonne sur mobile
- Textes réduits de 20%
- Champion Wall : 6 colonnes (au lieu de 14)
- Parallax souris → animation idle automatique sur mobile
- Particules : max 50 (au lieu de 150)

---

## 17. Points d'attention

### Riot API
- **Rate limiting** : utiliser `p-queue`, ne jamais dépasser 100 req/2min
- **Clé de dev** : expire toutes les 24h, demander une clé de production pour usage permanent
- **LP tracking** : l'API ne retourne pas le LP change par partie — comparer les `RankSnapshot` avant/après

### Performances
- **Three.js + Next.js** : import dynamique avec `{ ssr: false }` obligatoire
- **Particules** : `BufferGeometry` uniquement, max 150 desktop / 50 mobile
- **Data Dragon** : cacher la version et la liste des champions en mémoire
- **Lerp loop** : utiliser `requestAnimationFrame`, jamais `setInterval`

### Données
- **skinId** : récupéré dans `info.participants[n]` du détail de la partie
- **Atmosphère** : recalculer uniquement après détection d'une nouvelle partie
- **Timer** : `setInterval` côté client uniquement, deadline depuis env, jamais hardcodée
- **Master Céleste** : animation unique, stocker un flag `masterAnimationPlayed` en localStorage

### Notifications
- **Callmebot** : ~50 messages/jour gratuit par numéro, grouper si triggers simultanés
- **n8n sécurité** : header `X-Webhook-Secret` sur tous les appels
- **Session edge case** : au redémarrage du cron, fermer les sessions ouvertes sans partie depuis > 2h

### Remove.bg
- Plan gratuit = 50 crédits/mois
- Cache agressif : 1 cutout par couple `(championName, skinId)`, jamais régénéré
- Fallback automatique si quota épuisé (utilise le splash art complet)
