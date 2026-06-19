import type { StarterId } from '../constants'
import { STARTERS } from '../constants'

const MODEL_BASE = '/models'

export default function StarterSelect({ onSelect }: { onSelect: (id: StarterId) => void }) {
  return (
    <div className="w-screen h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex flex-col items-center justify-center overflow-hidden select-none gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white tracking-tight">PokéTchi</h1>
        <p className="text-white/40 text-sm mt-2 tracking-wide">Choose your starter Pokémon</p>
      </div>

      <div className="flex gap-5">
        {(Object.entries(STARTERS) as [StarterId, typeof STARTERS[StarterId]][]).map(([id, s]) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className="group relative w-[180px] bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 p-5 flex flex-col items-center gap-3 cursor-pointer"
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
              style={{ background: `radial-gradient(circle, ${s.color}33 0%, transparent 70%)` }}
            >
              <img src={`${MODEL_BASE}/${s.dex[0]}.glb`} alt="" className="w-20 h-20 object-contain opacity-0" />
              <span className="text-5xl absolute">
                {id === 'bulbasaur' ? '🌱' : id === 'charmander' ? '🔥' : '💧'}
              </span>
            </div>
            <div className="text-center">
              <div className="text-white font-bold text-lg">{s.name}</div>
              <div className="text-white/40 text-xs">{s.desc}</div>
            </div>
            <div className="flex gap-1.5 mt-1">
              {s.dex.map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-white/20"
                  style={{ backgroundColor: i === 0 ? s.color : undefined, opacity: i === 0 ? 1 : 0.3 }}
                />
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
