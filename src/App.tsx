import { useState, useCallback, useRef } from 'react'
import { useGameState } from './useGameState'
import type { StarterId } from './constants'
import GameScene from './components/GameScene'
import Hud from './components/Hud'
import BattleUI from './components/BattleUI'
import StarterSelect from './components/StarterSelect'
import { sfx } from './audio'

function Game({ starterId }: { starterId: StarterId }) {
  const game = useGameState(starterId)
  const [playerAttacking, setPlayerAttacking] = useState(false)
  const [wildAttacking, setWildAttacking] = useState(false)
  const [playerHit, setPlayerHit] = useState(false)
  const [wildHit, setWildHit] = useState(false)
  const prevPhaseRef = useRef(game.phase)

  if (prevPhaseRef.current !== 'battle' && game.phase === 'battle') {
    prevPhaseRef.current = 'battle'
    sfx.encounter()
  }
  if (prevPhaseRef.current !== 'evolution' && game.phase === 'evolution') {
    prevPhaseRef.current = 'evolution'
    sfx.evolution()
  }
  prevPhaseRef.current = game.phase

  const handleAttack = useCallback(() => {
    if (!game.wildPokemon) return
    sfx.attack()
    setPlayerAttacking(true)
    setTimeout(() => {
      setPlayerAttacking(false)
      setWildHit(true)
      sfx.hit()
      game.battleAttack()
      setTimeout(() => setWildHit(false), 300)
    }, 300)
  }, [game])

  const handleHeal = useCallback(() => {
    if (!game.wildPokemon) return
    sfx.click()
    setWildAttacking(true)
    setTimeout(() => {
      setWildAttacking(false)
      setPlayerHit(true)
      sfx.hit()
      game.battleHeal()
      setTimeout(() => setPlayerHit(false), 300)
    }, 500)
  }, [game])

  const handleRun = useCallback(() => {
    sfx.click()
    game.battleRun()
  }, [game])

  if (game.phase === 'evolution') {
    sfx.evolution()
    return (
      <div className="w-screen h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">✨</div>
          <h2 className="text-white font-bold text-3xl mb-2">Evolution!</h2>
          <p className="text-white/60 text-lg mb-6">{game.pokemonName} evolved to {game.stage} stage!</p>
          <div className="w-[200px] h-[200px] mx-auto relative">
            <GameScene phase="normal" dexNumber={game.dexNumber} mood="happy" isSleeping={false} pooCount={0} />
          </div>
          <button onClick={game.dismissEvolution} className="mt-6 bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-semibold transition-all">
            Continue
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen bg-[#0a0a1a] overflow-hidden select-none relative">
      <GameScene
        phase={game.phase}
        dexNumber={game.dexNumber}
        mood={game.mood}
        isSleeping={game.isSleeping}
        pooCount={game.pooCount}
        wildDex={game.wildPokemon?.dex}
        playerAttacking={playerAttacking}
        wildAttacking={wildAttacking}
        playerHit={playerHit}
        wildHit={wildHit}
      />

      {game.phase === 'normal' && (
        <Hud
          pokemonName={game.pokemonName}
          stage={game.stage}
          stats={game.stats}
          mood={game.mood}
          level={game.level}
          xp={game.xp}
          xpToNext={game.xpToNext}
          hp={game.hp}
          maxHp={game.maxHp}
          age={game.age}
          isSleeping={game.isSleeping}
          isDead={game.isDead}
          pooCount={game.pooCount}
          potions={game.potions}
          onFeed={game.feed}
          onPlay={game.play}
          onClean={game.clean}
          onToggleSleep={game.toggleSleep}
          onReset={game.reset}
        />
      )}

      {game.phase === 'battle' && game.wildPokemon && (
        <BattleUI
          playerName={game.pokemonName}
          playerHp={game.hp}
          playerMaxHp={game.maxHp}
          playerLevel={game.level}
          wildPokemon={game.wildPokemon}
          battleLog={game.battleLog}
          potions={game.potions}
          onAttack={handleAttack}
          onHeal={handleHeal}
          onRun={handleRun}
        />
      )}
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
      return d.starterId && ['bulbasaur', 'charmander', 'squirtle'].includes(d.starterId) ? d.starterId : null
    } catch { return null }
  })

  if (!starterId) return <StarterScreen onSelect={setStarterId} />
  return <Game key={starterId} starterId={starterId} />
}
