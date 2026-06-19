import { motion } from 'motion/react'
import type { Mood, Stats } from '../useGameState'
import { sfx } from '../audio'

interface HudProps {
  pokemonName: string
  stage: string
  stats: Stats
  mood: Mood
  level: number
  xp: number
  xpToNext: number
  hp: number
  maxHp: number
  age: number
  isSleeping: boolean
  isDead: boolean
  pooCount: number
  potions: number
  onFeed: () => void
  onPlay: () => void
  onClean: () => void
  onToggleSleep: () => void
  onReset: () => void
}

const MOOD_ICON: Record<Mood, string> = { happy: '😊', sad: '😢', angry: '😠', tired: '😴', neutral: '😐' }
const STAGE_LABEL: Record<string, string> = { Baby: 'Baby', Child: 'Child', Adult: 'Adult' }

const bars = [
  { label: 'Hunger', key: 'hunger' as const, color: 'from-red-500 to-red-400' },
  { label: 'Happy', key: 'happiness' as const, color: 'from-yellow-400 to-yellow-300' },
  { label: 'Energy', key: 'energy' as const, color: 'from-green-500 to-green-400' },
  { label: 'Clean', key: 'hygiene' as const, color: 'from-blue-500 to-blue-400' },
]

export default function Hud({
  pokemonName, stage, stats, mood, level, xp, xpToNext, hp, maxHp,
  isSleeping, isDead, pooCount,
  onFeed, onPlay, onClean, onToggleSleep, onReset,
}: HudProps) {
  if (isDead) {
    return (
      <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-4 z-50">
        <span className="text-7xl">💀</span>
        <div className="text-red-400 font-bold text-3xl">{pokemonName} fainted!</div>
        <p className="text-white/40 text-sm">Your Pokémon has been neglected too long.</p>
        <button onClick={onReset} className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-semibold transition-all text-lg">New Game</button>
      </div>
    )
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30">
      <div className="bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pt-10 pb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-xl drop-shadow-md">{pokemonName}</span>
            <span className="text-xl">{MOOD_ICON[mood]}</span>
          </div>
          <div className="flex items-center gap-2">
            {pooCount > 0 && <span className="text-xs">{'💩'.repeat(pooCount)}</span>}
            <span className="text-[10px] uppercase tracking-wider text-white/50 bg-white/10 px-2 py-0.5 rounded-full">{STAGE_LABEL[stage] ?? stage}</span>
          </div>
        </div>

        {/* HP + Level row */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-white/60 text-[10px] uppercase w-5">HP</span>
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500"
                initial={false}
                animate={{ width: `${(hp / maxHp) * 100}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              />
            </div>
            <span className="text-white/40 text-[10px] font-mono w-12 text-right">{Math.round(hp)}/{maxHp}</span>
          </div>
          <div className="text-white/50 text-xs font-mono bg-white/5 rounded-full px-2 py-0.5">Lv.{level}</div>
        </div>

        {/* XP bar */}
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-white/40 text-[10px] uppercase w-5">XP</span>
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
              initial={false}
              animate={{ width: `${(xp / xpToNext) * 100}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            />
          </div>
          <span className="text-white/30 text-[9px] font-mono">{xp}/{xpToNext}</span>
        </div>

        {/* Stat bars */}
        <div className="space-y-1 mb-2.5">
          {bars.map(bar => {
            const val = Math.max(0, stats[bar.key])
            return (
              <div key={bar.key} className="flex items-center gap-2">
                <span className="text-white/50 text-[9px] w-10 shrink-0 uppercase tracking-wide">{bar.label}</span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div className={`h-full rounded-full bg-gradient-to-r ${bar.color}`} initial={false} animate={{ width: `${val}%` }} transition={{ type: 'spring', stiffness: 120, damping: 18 }} />
                </div>
                <span className="text-white/30 text-[9px] w-4 text-right font-mono">{Math.round(val)}</span>
              </div>
            )
          })}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-5 gap-1.5">
          <button onClick={() => { sfx.feed(); onFeed() }} disabled={isSleeping} className="bg-red-600/70 hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95">Feed</button>
          <button onClick={() => { sfx.play(); onPlay() }} disabled={isSleeping} className="bg-yellow-500/70 hover:bg-yellow-500 disabled:opacity-30 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95">Play</button>
          <button onClick={() => { sfx.clean(); onClean() }} disabled={isSleeping} className="bg-blue-500/70 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95">Clean</button>
          <button onClick={onToggleSleep} className={`py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 text-white ${isSleeping ? 'bg-cyan-500/70 hover:bg-cyan-500' : 'bg-gray-500/70 hover:bg-gray-500'}`}>{isSleeping ? 'Wake' : 'Sleep'}</button>
          <button className="bg-emerald-500/70 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 opacity-50 cursor-not-allowed" disabled>Bag</button>
        </div>
      </div>
    </div>
  )
}
