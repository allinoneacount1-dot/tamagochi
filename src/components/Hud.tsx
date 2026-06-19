import { motion } from 'motion/react'

interface Stats {
  hunger: number
  happiness: number
  energy: number
  hygiene: number
  health: number
}

interface HudProps {
  pokemonName: string
  stage: string
  stats: Stats
  age: number
  isSleeping: boolean
  onFeed: () => void
  onPlay: () => void
  onClean: () => void
  onToggleSleep: () => void
}

const stages: Record<string, string> = {
  baby: 'Baby',
  child: 'Child',
  adult: 'Adult',
}

export default function Hud({
  pokemonName, stage, stats, age, isSleeping,
  onFeed, onPlay, onClean, onToggleSleep,
}: HudProps) {
  const bars = [
    { label: 'HP', value: stats.health, color: 'from-purple-500 to-purple-400' },
    { label: 'Hunger', value: stats.hunger, color: 'from-red-500 to-red-400' },
    { label: 'Happy', value: stats.happiness, color: 'from-yellow-400 to-yellow-300' },
    { label: 'Energy', value: stats.energy, color: 'from-green-500 to-green-400' },
    { label: 'Clean', value: stats.hygiene, color: 'from-blue-500 to-blue-400' },
  ]

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
      <div className="flex justify-between items-center mb-3">
        <span className="text-white font-bold text-lg drop-shadow-md">{pokemonName}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
            {stages[stage] ?? stage}
          </span>
          <span className="text-white/40 text-[10px]">{age}s</span>
        </div>
      </div>

      <div className="space-y-1.5 mb-4">
        {bars.map(bar => (
          <div key={bar.label} className="flex items-center gap-2">
            <span className="text-white/60 text-[10px] w-9 shrink-0 uppercase tracking-wide">{bar.label}</span>
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${bar.color}`}
                initial={false}
                animate={{ width: `${Math.max(0, bar.value)}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              />
            </div>
            <span className="text-white/40 text-[10px] w-5 text-right font-mono">
              {Math.round(Math.max(0, bar.value))}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={onFeed}
          disabled={isSleeping}
          className="bg-red-600/70 hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed text-white py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
        >
          Feed
        </button>
        <button
          onClick={onPlay}
          disabled={isSleeping}
          className="bg-yellow-500/70 hover:bg-yellow-500 disabled:opacity-30 disabled:cursor-not-allowed text-white py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
        >
          Play
        </button>
        <button
          onClick={onClean}
          disabled={isSleeping}
          className="bg-blue-500/70 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
        >
          Clean
        </button>
        <button
          onClick={onToggleSleep}
          className={`py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 text-white ${
            isSleeping ? 'bg-cyan-500/70 hover:bg-cyan-500' : 'bg-gray-500/70 hover:bg-gray-500'
          }`}
        >
          {isSleeping ? 'Wake' : 'Sleep'}
        </button>
      </div>
    </div>
  )
}
