import { useState, useEffect, useCallback, useRef } from 'react'
import type { StarterId, Stage } from './constants'
import { STARTERS, EVOLUTION_AGE, SAVE_KEY } from './constants'

export interface Stats {
  hunger: number
  happiness: number
  energy: number
  hygiene: number
  health: number
}

export interface SaveData {
  starterId: StarterId
  stage: Stage
  stats: Stats
  age: number
  isSleeping: boolean
  pooCount: number
}

export type Mood = 'happy' | 'sad' | 'angry' | 'tired' | 'neutral'

export interface GameAPI {
  starterId: StarterId
  stage: Stage
  stats: Stats
  age: number
  isSleeping: boolean
  pooCount: number
  mood: Mood
  pokemonName: string
  dexNumber: number
  isDead: boolean
  feed: () => void
  play: () => void
  clean: () => void
  toggleSleep: () => void
  startMiniGame: () => void
  endMiniGame: (score: number) => void
  inMiniGame: boolean
  reset: () => void
}

const INITIAL_STATS: Stats = { hunger: 80, happiness: 80, energy: 80, hygiene: 80, health: 100 }

function computeHealth(s: Omit<Stats, 'health'>): number {
  const avg = (s.hunger + s.happiness + s.energy + s.hygiene) / 4
  const penalty = Object.values(s).filter(v => v <= 0).length * 20
  return Math.max(0, Math.min(100, Math.round(avg - penalty)))
}

function getMood(stats: Stats): Mood {
  if (stats.hunger <= 0 || stats.happiness <= 0 || stats.health <= 0) return 'angry'
  if (stats.energy < 20) return 'tired'
  if (stats.happiness < 30 || stats.hunger < 30) return 'sad'
  if (stats.happiness > 60 && stats.hunger > 60 && stats.energy > 60) return 'happy'
  return 'neutral'
}

function stageForAge(age: number): Stage {
  if (age >= EVOLUTION_AGE[2]) return 'Adult'
  if (age >= EVOLUTION_AGE[1]) return 'Child'
  return 'Baby'
}

function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data && data.starterId && data.stage && data.stats) return data as SaveData
    return null
  } catch {
    return null
  }
}

function writeSave(data: SaveData) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)) } catch {}
}

export function useGameState(starterId: StarterId): GameAPI {
  const saved = loadSave()
  const isFresh = saved?.starterId !== starterId

  const [stage, setStage] = useState<Stage>(isFresh ? 'Baby' : saved!.stage)
  const [stats, setStats] = useState<Stats>(isFresh ? INITIAL_STATS : saved!.stats)
  const [age, setAge] = useState(isFresh ? 0 : saved!.age)
  const [isSleeping, setIsSleeping] = useState(isFresh ? false : saved!.isSleeping)
  const [pooCount, setPooCount] = useState(isFresh ? 0 : saved!.pooCount)
  const [inMiniGame, setInMiniGame] = useState(false)
  const ageRef = useRef(isFresh ? 0 : saved!.age)

  const starter = STARTERS[starterId]
  // Persist
  const saveRef = useRef({ starterId, stage, stats, age, isSleeping, pooCount })
  useEffect(() => {
    const data: SaveData = { starterId, stage, stats, age, isSleeping, pooCount }
    saveRef.current = data
    writeSave(data)
  })

  // Age tick
  useEffect(() => {
    const id = setInterval(() => {
      ageRef.current += 1
      setAge(ageRef.current)
      setStage(stageForAge(ageRef.current))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // Stat decay (awake)
  useEffect(() => {
    if (isSleeping) return
    const id = setInterval(() => {
      setStats(prev => {
        const next = {
          hunger: Math.max(0, prev.hunger - 2),
          happiness: Math.max(0, prev.happiness - 1.5),
          energy: Math.max(0, prev.energy - 0.5),
          hygiene: Math.max(0, prev.hygiene - 1),
          health: prev.health,
        }
        next.health = computeHealth(next)
        return next
      })
    }, 3000)
    return () => clearInterval(id)
  }, [isSleeping])

  // Sleep recovery
  useEffect(() => {
    if (!isSleeping) return
    const id = setInterval(() => {
      setStats(prev => {
        const next = { ...prev, energy: Math.min(100, prev.energy + 5), health: Math.min(100, prev.health + 1) }
        return next
      })
    }, 3000)
    return () => clearInterval(id)
  }, [isSleeping])

  // Poo generation
  useEffect(() => {
    if (isSleeping || stats.hygiene > 50 || pooCount >= 3) return
    const id = setInterval(() => {
      if (Math.random() < 0.3) {
        setPooCount(prev => Math.min(3, prev + 1))
      }
    }, 12000)
    return () => clearInterval(id)
  }, [isSleeping, stats.hygiene, pooCount])

  // Health penalty from poo (every 10s)
  useEffect(() => {
    if (pooCount === 0) return
    const id = setInterval(() => {
      setStats(prev => {
        const penalty = pooCount * 5
        return { ...prev, health: Math.max(0, prev.health - penalty) }
      })
    }, 10000)
    return () => clearInterval(id)
  }, [pooCount])

  const isDead = stats.health <= 0

  const feed = useCallback(() => {
    if (isDead) return
    setStats(prev => {
      const next = { ...prev, hunger: Math.min(100, prev.hunger + 25) }
      next.health = computeHealth(next)
      return next
    })
  }, [isDead])

  const play = useCallback(() => {
    if (isDead) return
    setStats(prev => {
      if (prev.energy < 10) return prev
      const next = { ...prev, happiness: Math.min(100, prev.happiness + 25), energy: Math.max(0, prev.energy - 15) }
      next.health = computeHealth(next)
      return next
    })
  }, [isDead])

  const clean = useCallback(() => {
    if (isDead) return
    setStats(prev => {
      const next = { ...prev, hygiene: 100 }
      next.health = computeHealth(next)
      return next
    })
    setPooCount(0)
  }, [isDead])

  const toggleSleep = useCallback(() => {
    if (isDead) return
    setIsSleeping(prev => !prev)
  }, [isDead])

  const startMiniGame = useCallback(() => {
    if (isDead || isSleeping || stats.energy < 10) return
    setInMiniGame(true)
  }, [isDead, isSleeping, stats.energy])

  const endMiniGame = useCallback((score: number) => {
    setInMiniGame(false)
    setStats(prev => {
      const gain = Math.min(40, score * 5)
      const next = { ...prev, happiness: Math.min(100, prev.happiness + gain), energy: Math.max(0, prev.energy - 10) }
      next.health = computeHealth(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    localStorage.removeItem(SAVE_KEY)
    window.location.reload()
  }, [])

  const mood = getMood(stats)
  const stageIdx0 = stage === 'Baby' ? 0 : stage === 'Child' ? 1 : 2

  return {
    starterId,
    stage,
    stats,
    age,
    isSleeping,
    pooCount,
    mood,
    pokemonName: starter.name,
    dexNumber: starter.dex[stageIdx0],
    isDead,
    feed,
    play,
    clean,
    toggleSleep,
    startMiniGame,
    endMiniGame,
    inMiniGame,
    reset,
  }
}
