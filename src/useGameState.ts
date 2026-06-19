import { useState, useEffect, useCallback, useRef } from 'react'
import type { StarterId, Stage } from './constants'
import { STARTERS, EVOLUTION_LEVEL, WILD_POKEMON, XP_PER_LEVEL, SAVE_KEY } from './constants'

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
  level: number
  xp: number
  hp: number
  maxHp: number
  attack: number
  defense: number
  potions: number
}

export type Mood = 'happy' | 'sad' | 'angry' | 'tired' | 'neutral'
export type GamePhase = 'normal' | 'battle' | 'evolution'

export interface WildPokemon {
  name: string
  dex: number
  level: number
  hp: number
  maxHp: number
  attack: number
  defense: number
}

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
  level: number
  xp: number
  xpToNext: number
  hp: number
  maxHp: number
  attack: number
  defense: number
  potions: number
  phase: GamePhase
  wildPokemon: WildPokemon | null
  battleLog: string
  feed: () => void
  play: () => void
  clean: () => void
  toggleSleep: () => void
  battleAttack: () => void
  battleHeal: () => void
  battleRun: () => void
  dismissBattle: () => void
  dismissEvolution: () => void
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

function stageForLevel(level: number): Stage {
  if (level >= EVOLUTION_LEVEL[2]) return 'Adult'
  if (level >= EVOLUTION_LEVEL[1]) return 'Child'
  return 'Baby'
}

function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const d = JSON.parse(raw)
    if (d?.starterId && d?.stats) return d as SaveData
    return null
  } catch { return null }
}

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }

export function useGameState(starterId: StarterId): GameAPI {
  const saved = loadSave()
  const isFresh = saved?.starterId !== starterId

  const [stage, setStage] = useState<Stage>(isFresh ? 'Baby' : saved!.stage)
  const [stats, setStats] = useState<Stats>(isFresh ? INITIAL_STATS : saved!.stats)
  const [age, setAge] = useState(isFresh ? 0 : saved!.age)
  const [isSleeping, setIsSleeping] = useState(isFresh ? false : saved!.isSleeping)
  const [pooCount, setPooCount] = useState(isFresh ? 0 : saved!.pooCount)
  const [level, setLevel] = useState(isFresh ? 1 : saved!.level)
  const [xp, setXp] = useState(isFresh ? 0 : saved!.xp)
  const [hp, setHp] = useState(isFresh ? 40 : saved!.hp)
  const [maxHp, setMaxHp] = useState(isFresh ? 40 : saved!.maxHp)
  const [attack, setAttack] = useState(isFresh ? 8 : saved!.attack)
  const [defense, setDefense] = useState(isFresh ? 5 : saved!.defense)
  const [potions, setPotions] = useState(isFresh ? 3 : saved!.potions)

  const [phase, setPhase] = useState<GamePhase>('normal')
  const [wildPokemon, setWildPokemon] = useState<WildPokemon | null>(null)
  const [battleLog, setBattleLog] = useState('')
  const ageRef = useRef(isFresh ? 0 : saved!.age)

  const starter = STARTERS[starterId]
  const stageIdx0 = stage === 'Baby' ? 0 : stage === 'Child' ? 1 : 2
  const xpToNext = level * XP_PER_LEVEL

  const mood = getMood(stats)
  const isDead = stats.health <= 0 || hp <= 0

  // persist
  useEffect(() => {
    const data: SaveData = { starterId, stage, stats, age, isSleeping, pooCount, level, xp, hp, maxHp, attack, defense, potions }
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)) } catch {}
  })

  // age tick
  useEffect(() => {
    const id = setInterval(() => { ageRef.current += 1; setAge(ageRef.current) }, 1000)
    return () => clearInterval(id)
  }, [])

  // stat decay
  useEffect(() => {
    if (isSleeping) return
    const id = setInterval(() => {
      setStats(prev => {
        const next = { hunger: Math.max(0, prev.hunger - 2), happiness: Math.max(0, prev.happiness - 1.5), energy: Math.max(0, prev.energy - 0.5), hygiene: Math.max(0, prev.hygiene - 1), health: prev.health }
        next.health = computeHealth(next); return next
      })
    }, 3000)
    return () => clearInterval(id)
  }, [isSleeping])

  // sleep recovery
  useEffect(() => {
    if (!isSleeping) return
    const id = setInterval(() => {
      setStats(prev => ({ ...prev, energy: Math.min(100, prev.energy + 5), health: Math.min(100, prev.health + 1) }))
      setHp(prev => Math.min(maxHp, prev + 3))
    }, 3000)
    return () => clearInterval(id)
  }, [isSleeping, maxHp])

  // poo generation
  useEffect(() => {
    if (isSleeping || stats.hygiene > 50 || pooCount >= 3) return
    const id = setInterval(() => { if (Math.random() < 0.3) setPooCount(prev => Math.min(3, prev + 1)) }, 12000)
    return () => clearInterval(id)
  }, [isSleeping, stats.hygiene, pooCount])

  // poo health damage
  useEffect(() => {
    if (pooCount === 0) return
    const id = setInterval(() => setStats(prev => ({ ...prev, health: Math.max(0, prev.health - pooCount * 5) })), 10000)
    return () => clearInterval(id)
  }, [pooCount])

  // random encounter timer
  useEffect(() => {
    if (phase !== 'normal' || isSleeping || isDead) return
    let counter = 0
    const id = setInterval(() => {
      counter += 1
      if (counter >= rand(30, 60)) {
        counter = 0
        const w = WILD_POKEMON[rand(0, WILD_POKEMON.length - 1)]
        const wLv = rand(Math.max(1, level - 1), level + 2)
        setWildPokemon({ name: w.name, dex: w.dex, level: wLv, hp: wLv * 8 + 20, maxHp: wLv * 8 + 20, attack: wLv * 2 + 3, defense: wLv + 2 })
        setPhase('battle')
        setBattleLog(`Wild ${w.name} (Lv.${wLv}) appeared!`)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [phase, isSleeping, isDead, level])

  const addXp = useCallback((amount: number) => {
    setXp(prev => {
      const total = prev + amount
      const needed = level * XP_PER_LEVEL
      if (total >= needed) {
        setLevel(l => {
          const newLv = l + 1
          setMaxHp(m => m + 8)
          setHp(m => m + 8)
          setAttack(a => a + 2)
          setDefense(d => d + 1)
          const newStage = stageForLevel(newLv)
          if (newStage !== stage) {
            setStage(newStage)
            setPhase('evolution')
          }
          return newLv
        })
        return total - needed
      }
      return total
    })
  }, [level, stage])

  const feed = useCallback(() => {
    setStats(prev => { const next = { ...prev, hunger: Math.min(100, prev.hunger + 25) }; next.health = computeHealth(next); return next })
    addXp(10)
    setHp(prev => Math.min(maxHp, prev + 5))
  }, [addXp, maxHp])

  const play = useCallback(() => {
    setStats(prev => {
      if (prev.energy < 10) return prev
      const next = { ...prev, happiness: Math.min(100, prev.happiness + 25), energy: Math.max(0, prev.energy - 15) }
      next.health = computeHealth(next); return next
    })
    addXp(15)
  }, [addXp])

  const clean = useCallback(() => {
    setStats(prev => { const next = { ...prev, hygiene: 100 }; next.health = computeHealth(next); return next })
    setPooCount(0)
    addXp(5)
  }, [addXp])

  const toggleSleep = useCallback(() => setIsSleeping(prev => !prev), [])

  const battleAttack = useCallback(() => {
    if (!wildPokemon || phase !== 'battle') return
    const dmg = Math.max(1, attack + rand(0, 4) - Math.floor(wildPokemon.defense / 2))
    const wDmg = Math.max(1, wildPokemon.attack + rand(0, 3) - Math.floor(defense / 2))

    setWildPokemon(prev => prev ? { ...prev, hp: prev.hp - dmg } : null)
    setHp(prev => prev - wDmg)
    setBattleLog(`${starter.name} dealt ${dmg} damage! Wild ${wildPokemon.name} dealt ${wDmg} damage!`)

    const newWildHp = wildPokemon.hp - dmg
    const newMyHp = hp - wDmg

    if (newWildHp <= 0) {
      const reward = wildPokemon.level * 15 + 20
      addXp(reward)
      setStats(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 10) }))
      setBattleLog(`Wild ${wildPokemon.name} fainted! +${reward}XP`)
      setTimeout(() => { setPhase('normal'); setWildPokemon(null) }, 1500)
    } else if (newMyHp <= 0) {
      setHp(0)
      setStats(prev => ({ ...prev, happiness: Math.max(0, prev.happiness - 20), health: Math.max(0, prev.health - 30) }))
      setBattleLog(`${starter.name} fainted...`)
      setTimeout(() => { setPhase('normal'); setWildPokemon(null) }, 2000)
    }
  }, [phase, wildPokemon, hp, attack, defense, starter, addXp])

  const battleHeal = useCallback(() => {
    if (!wildPokemon || phase !== 'battle' || potions <= 0) return
    setPotions(prev => prev - 1)
    const heal = 25
    setHp(prev => Math.min(maxHp, prev + heal))

    const wDmg = Math.max(1, wildPokemon.attack + rand(0, 3) - Math.floor(defense / 2))
    setHp(prev => prev - wDmg)
    setBattleLog(`Used Potion! HP +${heal}. Wild ${wildPokemon.name} dealt ${wDmg} damage!`)

    if (hp - wDmg <= 0) {
      setHp(0)
      setStats(prev => ({ ...prev, happiness: Math.max(0, prev.happiness - 20), health: Math.max(0, prev.health - 30) }))
      setBattleLog(`${starter.name} fainted...`)
      setTimeout(() => { setPhase('normal'); setWildPokemon(null) }, 2000)
    }
  }, [phase, wildPokemon, hp, maxHp, attack, defense, potions, starter])

  const battleRun = useCallback(() => {
    if (phase !== 'battle') return
    if (Math.random() < 0.6) {
      setBattleLog('Got away safely!')
      setStats(prev => ({ ...prev, happiness: Math.max(0, prev.happiness - 5) }))
      setTimeout(() => { setPhase('normal'); setWildPokemon(null) }, 800)
    } else {
      const wDmg = Math.max(1, (wildPokemon?.attack ?? 3) + rand(0, 3) - Math.floor(defense / 2))
      setHp(prev => prev - wDmg)
      setBattleLog(`Couldn't escape! Took ${wDmg} damage!`)
      if (hp - wDmg <= 0) {
        setHp(0)
        setTimeout(() => { setPhase('normal'); setWildPokemon(null) }, 2000)
      }
    }
  }, [phase, wildPokemon, hp, defense])

  const dismissBattle = useCallback(() => { setPhase('normal'); setWildPokemon(null) }, [])
  const dismissEvolution = useCallback(() => setPhase('normal'), [])

  const reset = useCallback(() => { localStorage.removeItem(SAVE_KEY); window.location.reload() }, [])

  return {
    starterId, stage, stats, age, isSleeping, pooCount, mood,
    pokemonName: starter.name, dexNumber: starter.dex[stageIdx0],
    isDead, level, xp, xpToNext, hp, maxHp, attack, defense, potions,
    phase, wildPokemon, battleLog,
    feed, play, clean, toggleSleep,
    battleAttack, battleHeal, battleRun, dismissBattle, dismissEvolution, reset,
  }
}
