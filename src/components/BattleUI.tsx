import type { WildPokemon } from '../useGameState'

interface BattleUIProps {
  playerName: string
  playerHp: number
  playerMaxHp: number
  playerLevel: number
  wildPokemon: WildPokemon
  battleLog: string
  potions: number
  onAttack: () => void
  onHeal: () => void
  onRun: () => void
}

export default function BattleUI({ playerName, playerHp, playerMaxHp, playerLevel, wildPokemon, battleLog, potions, onAttack, onHeal, onRun }: BattleUIProps) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end pointer-events-none">
      <div className="pointer-events-auto bg-gradient-to-t from-black/95 via-black/70 to-transparent px-5 pt-12 pb-5">
        <div className="mb-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-white font-bold text-sm">{playerName} Lv.{playerLevel}</span>
            <span className="text-white/50 text-xs">HP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-300" style={{ width: `${(playerHp / playerMaxHp) * 100}%` }} />
            </div>
            <span className="text-white/60 text-xs font-mono w-14 text-right">{playerHp}/{playerMaxHp}</span>
          </div>
        </div>

        <div className="mb-3 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-red-300 font-bold text-sm">Wild {wildPokemon.name} Lv.{wildPokemon.level}</span>
            <span className="text-red-300/50 text-xs">HP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-300" style={{ width: `${(wildPokemon.hp / wildPokemon.maxHp) * 100}%` }} />
            </div>
            <span className="text-red-300/60 text-xs font-mono w-14 text-right">{wildPokemon.hp}/{wildPokemon.maxHp}</span>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg px-3 py-2 mb-3 min-h-[36px] flex items-center">
          <p className="text-white/70 text-xs leading-relaxed">{battleLog}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button onClick={onAttack} className="bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-red-600/30">
            ⚔️ Fight
          </button>
          <button onClick={onHeal} disabled={potions <= 0} className="bg-green-600 hover:bg-green-500 disabled:opacity-30 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-green-600/30">
            💊 Heal ({potions})
          </button>
          <button onClick={onRun} className="bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-gray-600/30">
            🏃 Run
          </button>
        </div>
      </div>
    </div>
  )
}
