import { useState, useEffect, useCallback, useRef } from 'react'

const STAGE_CONFIG = {
  baby: { name: 'Pichu', dex: 172 },
  child: { name: 'Pikachu', dex: 25 },
  adult: { name: 'Raichu', dex: 26 },
} as const

type Stage = keyof typeof STAGE_CONFIG

interface Stats {
  hunger: number
  happiness: number
  energy: number
  hygiene: number
  health: number
}

export interface GameAPI {
  stage: Stage
  stats: Stats
  age: number
  isSleeping: boolean
  pokemonName: string
  dexNumber: number
  feed: () => void
  play: () => void
  clean: () => void
  toggleSleep: () => void
}

const INITIAL_STATS: Stats = {
  hunger: 80,
  happiness: 80,
  energy: 80,
  hygiene: 80,
  health: 100,
}

function computeHealth(s: Omit<Stats, 'health'>): number {
  const avg = (s.hunger + s.happiness + s.energy + s.hygiene) / 4
  const penalty = Object.values(s).filter(v => v <= 0).length * 20
  return Math.max(0, Math.min(100, Math.round(avg - penalty)))
}

export function useGameState(): GameAPI {
  const [stage, setStage] = useState<Stage>('baby')
  const [stats, setStats] = useState<Stats>(INITIAL_STATS)
  const [age, setAge] = useState(0)
  const [isSleeping, setIsSleeping] = useState(false)
  const ageRef = useRef(0)

  useEffect(() => {
    const id = setInterval(() => {
      ageRef.current += 1
      setAge(ageRef.current)
      if (ageRef.current >= 180) setStage('adult')
      else if (ageRef.current >= 60) setStage('child')
    }, 1000)
    return () => clearInterval(id)
  }, [])

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

  useEffect(() => {
    if (!isSleeping) return
    const id = setInterval(() => {
      setStats(prev => {
        const next = {
          ...prev,
          energy: Math.min(100, prev.energy + 5),
          hygiene: prev.hygiene,
          health: Math.min(100, prev.health + 1),
        }
        return next
      })
    }, 3000)
    return () => clearInterval(id)
  }, [isSleeping])

  const feed = useCallback(() => {
    setStats(prev => {
      const next = { ...prev, hunger: Math.min(100, prev.hunger + 25) }
      next.health = computeHealth(next)
      return next
    })
  }, [])

  const play = useCallback(() => {
    setStats(prev => {
      if (prev.energy < 10) return prev
      const next = {
        ...prev,
        happiness: Math.min(100, prev.happiness + 25),
        energy: Math.max(0, prev.energy - 15),
      }
      next.health = computeHealth(next)
      return next
    })
  }, [])

  const clean = useCallback(() => {
    setStats(prev => {
      const next = { ...prev, hygiene: Math.min(100, prev.hygiene + 35) }
      next.health = computeHealth(next)
      return next
    })
  }, [])

  const toggleSleep = useCallback(() => {
    setIsSleeping(prev => !prev)
  }, [])

  const config = STAGE_CONFIG[stage]

  return {
    stage,
    stats,
    age,
    isSleeping,
    pokemonName: config.name,
    dexNumber: config.dex,
    feed,
    play,
    clean,
    toggleSleep,
  }
}
