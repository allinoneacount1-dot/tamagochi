import { useGameState } from './useGameState'
import GameScene from './components/GameScene'
import Hud from './components/Hud'

export default function App() {
  const game = useGameState()

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center overflow-hidden select-none">
      <div className="relative w-[400px] h-[660px] bg-[#0f3460] rounded-[32px] border-[3px] border-[#e94560] shadow-[0_0_60px_rgba(233,69,96,0.3)] overflow-hidden">
        <div className="absolute inset-[5px] rounded-[27px] bg-[#1a1a2e] overflow-hidden">
          <div className="h-[300px]">
            <GameScene dexNumber={game.dexNumber} />
          </div>
          <Hud
            pokemonName={game.pokemonName}
            stage={game.stage}
            stats={game.stats}
            age={game.age}
            isSleeping={game.isSleeping}
            onFeed={game.feed}
            onPlay={game.play}
            onClean={game.clean}
            onToggleSleep={game.toggleSleep}
          />
        </div>
      </div>
    </div>
  )
}
