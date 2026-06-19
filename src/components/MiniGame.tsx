import { useState, useEffect, useCallback, useRef } from 'react'
import { sfx } from '../audio'

interface Target {
  id: number
  x: number
  y: number
}

export default function MiniGame({ onEnd }: { onEnd: (score: number) => void }) {
  const [targets, setTargets] = useState<Target[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(20)
  const idRef = useRef(0)

  const spawn = useCallback(() => {
    idRef.current += 1
    const t: Target = { id: idRef.current, x: Math.random() * 80 + 10, y: Math.random() * 70 + 15 }
    setTargets(prev => [...prev, t])
    setTimeout(() => {
      setTargets(prev => prev.filter(x => x.id !== t.id))
    }, 1200)
  }, [])

  useEffect(() => {
    const spawner = setInterval(spawn, 600)
    return () => clearInterval(spawner)
  }, [spawn])

  useEffect(() => {
    if (timeLeft <= 0) {
      sfx.success()
      onEnd(score)
      return
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft, score, onEnd])

  const hit = useCallback((id: number) => {
    sfx.click()
    setTargets(prev => prev.filter(t => t.id !== id))
    setScore(s => s + 1)
  }, [])

  return (
    <div className="absolute inset-0 z-50 bg-black/70 flex flex-col items-center justify-center">
      <div className="relative w-full h-full">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-6 z-10">
          <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2 text-white font-bold text-lg">
            ⭐ {score}
          </div>
          <div className={`bg-white/10 backdrop-blur rounded-xl px-4 py-2 font-bold text-lg ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
            {timeLeft}s
          </div>
        </div>

        {targets.map(t => (
          <button
            key={t.id}
            onClick={() => hit(t.id)}
            className="absolute w-14 h-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 shadow-[0_0_20px_rgba(255,200,0,0.5)] animate-pulse cursor-pointer transition-transform hover:scale-110 active:scale-90 border-2 border-yellow-200/50"
            style={{ left: `${t.x}%`, top: `${t.y}%` }}
          />
        ))}
      </div>
    </div>
  )
}
