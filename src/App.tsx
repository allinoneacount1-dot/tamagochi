import { useState, useCallback } from 'react'
import { useGameState } from './useGameState'
import type { StarterId } from './constants'
import GameScene from './components/GameScene'
import Hud from './components/Hud'
import StarterSelect from './components/StarterSelect'
import MiniGame from './components/MiniGame'
import { sfx } from './audio'

function Game({ starterId }: { starterId: StarterId }) {
  const game = useGameState(starterId)

  const handleEndMiniGame = useCallback((score: number) => {
    game.endMiniGame(score)
  }, [game])

  if (game.inMiniGame) {
    return <MiniGame onEnd={handleEndMiniGame} />
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center overflow-hidden select-none">
      <div className="relative w-[400px] h-[660px] bg-[#0f3460] rounded-[32px] border-[3px] border-[#e94560] shadow-[0_0_60px_rgba(233,69,96,0.3)] overflow-hidden">
        <div className="absolute inset-[5px] rounded-[27px] bg-[#1a1a2e] overflow-hidden">
          <div className="h-[300px]">
            <GameScene dexNumber={game.dexNumber} mood={game.mood} isSleeping={game.isSleeping} pooCount={game.pooCount} />
          </div>
          <Hud
            pokemonName={game.pokemonName}
            stage={game.stage}
            stats={game.stats}
            mood={game.mood}
            age={game.age}
            isSleeping={game.isSleeping}
            isDead={game.isDead}
            pooCount={game.pooCount}
            onFeed={game.feed}
            onPlay={game.play}
            onClean={game.clean}
            onToggleSleep={game.toggleSleep}
            onMiniGame={game.startMiniGame}
            onReset={game.reset}
          />
        </div>
      </div>
    </div>
  )
}

function StarterScreen({ onSelect }: { onSelect: (id: StarterId) => void }) {
  return (
    <div className="w-screen h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center overflow-hidden">
      <StarterSelect onSelect={(id) => { sfx.select(); onSelect(id) }} />
    </div>
  )
}

export default function App() {
  const [starterId, setStarterId] = useState<StarterId | null>(() => {
    try {
      const raw = localStorage.getItem('poketchi_save')
      if (!raw) return null
      const d = JSON.parse(raw)
      return (d.starterId && ['bulbasaur', 'charmander', 'squirtle'].includes(d.starterId)) ? d.starterId : null
    } catch { return null }
  })

  if (!starterId) {
    return <StarterScreen onSelect={setStarterId} />
  }

  return <Game key={starterId} starterId={starterId} />
}
