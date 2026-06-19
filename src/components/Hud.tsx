import { motion } from 'motion/react'
import type { Mood, Stats } from '../useGameState'
import { sfx } from '../audio'

interface HudProps {
  pokemonName: string
  stage: string
  stats: Stats
  mood: Mood
  age: number
  isSleeping: boolean
  isDead: boolean
  pooCount: number
  onFeed: () => void
  onPlay: () => void
  onClean: () => void
  onToggleSleep: () => void
  onMiniGame: () => void
  onReset: () => void
}

const MOOD_ICON: Record<Mood, string> = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  tired: '😴',
  neutral: '😐',
}

const STAGE_LABEL: Record<string, string> = { Baby: 'Baby', Child: 'Child', Adult: 'Adult' }

const bars = [
  { label: 'HP', key: 'health' as const, color: 'from-purple-500 to-purple-400' },
  { label: 'Hunger', key: 'hunger' as const, color: 'from-red-500 to-red-400' },
  { label: 'Happy', key: 'happiness' as const, color: 'from-yellow-400 to-yellow-300' },
  { label: 'Energy', key: 'energy' as const, color: 'from-green-500 to-green-400' },
  { label: 'Clean', key: 'hygiene' as const, color: 'from-blue-500 to-blue-400' },
]

export default function Hud({
  pokemonName, stage, stats, mood, age, isSleeping, isDead, pooCount,
  onFeed, onPlay, onClean, onToggleSleep, onMiniGame, onReset,
}: HudProps) {
  const handleFeed = () => { sfx.feed(); onFeed() }
  const handlePlay = () => { sfx.play(); onPlay() }
  const handleClean = () => { sfx.clean(); onClean() }
  const handleSleep = () => { onToggleSleep() }
  const handleMiniGame = () => { onMiniGame() }

  if (isDead) {
    return (
      <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-4">
        <span className="text-6xl">💀</span>
        <div className="text-red-400 font-bold text-2xl">{pokemonName} fainted!</div>
        <p className="text-white/40 text-sm">Your Pokémon has been neglected too long.</p>
        <button
          onClick={onReset}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-semibold transition-all"
        >
          New Game
        </button>
      </div>
    )
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-lg drop-shadow-md">{pokemonName}</span>
          <span className="text-lg">{MOOD_ICON[mood]}</span>
        </div>
        <div className="flex items-center gap-2">
          {pooCount > 0 && (
            <span className="text-xs" title="💩 x{pooCount}">
              {'💩'.repeat(pooCount)}
            </span>
          )}
          <span className="text-[10px] uppercase tracking-wider text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
            {STAGE_LABEL[stage] ?? stage}
          </span>
          <span className="text-white/40 text-[10px]">{Math.floor(age / 60)}m {age % 60}s</span>
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        {bars.map(bar => {
          const val = Math.max(0, stats[bar.key])
          return (
            <div key={bar.key} className="flex items-center gap-2">
              <span className="text-white/60 text-[10px] w-9 shrink-0 uppercase tracking-wide">{bar.label}</span>
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${bar.color}`}
                  initial={false}
                  animate={{ width: `${val}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                />
              </div>
              <span className="text-white/40 text-[10px] w-5 text-right font-mono">{Math.round(val)}</span>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        <button onClick={handleFeed} disabled={isSleeping} className="bg-red-600/70 hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed text-white py-2 rounded-xl text-[11px] font-semibold transition-all active:scale-95">Feed</button>
        <button onClick={handlePlay} disabled={isSleeping} className="bg-yellow-500/70 hover:bg-yellow-500 disabled:opacity-30 disabled:cursor-not-allowed text-white py-2 rounded-xl text-[11px] font-semibold transition-all active:scale-95">Play</button>
        <button onClick={handleClean} disabled={isSleeping} className="bg-blue-500/70 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white py-2 rounded-xl text-[11px] font-semibold transition-all active:scale-95">Clean</button>
        <button onClick={handleSleep} className={`py-2 rounded-xl text-[11px] font-semibold transition-all active:scale-95 text-white ${isSleeping ? 'bg-cyan-500/70 hover:bg-cyan-500' : 'bg-gray-500/70 hover:bg-gray-500'}`}>{isSleeping ? 'Wake' : 'Sleep'}</button>
        <button onClick={handleMiniGame} disabled={isSleeping} className="bg-emerald-500/70 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white py-2 rounded-xl text-[11px] font-semibold transition-all active:scale-95">Game</button>
      </div>
    </div>
  )
}
