import { useRef, Suspense, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, ContactShadows, Html } from '@react-three/drei'
import type { Object3D } from 'three'

const MODEL_BASE = '/models'

;[172, 25, 26].forEach(n => useGLTF.preload(`${MODEL_BASE}/${n}.glb`))

type Reaction = 'none' | 'bounce' | 'spin' | 'shake'

function PokemonModel({ dexNumber, actionTrigger, isSleeping }: { dexNumber: number; actionTrigger: number; isSleeping: boolean }) {
  const url = `${MODEL_BASE}/${dexNumber}.glb`
  const { scene } = useGLTF(url)
  const ref = useRef<Object3D>(null)
  const reaction = useRef<{ type: Reaction; time: number }>({ type: 'none', time: 0 })
  const prevTrigger = useRef(actionTrigger)

  useEffect(() => {
    if (actionTrigger !== prevTrigger.current) {
      prevTrigger.current = actionTrigger
      reaction.current = { type: 'bounce', time: 1 }
    }
  }, [actionTrigger])

  useFrame((state, delta) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime()

    if (isSleeping) {
      const rock = Math.sin(t * 0.6) * 0.15
      ref.current.rotation.x = rock * 0.3
      ref.current.rotation.z = rock
      ref.current.rotation.y = Math.sin(t * 0.4) * 0.1
      ref.current.position.y = -0.1 + Math.sin(t * 0.5) * 0.03
      const s = 1 + Math.sin(t * 0.8) * 0.01
      ref.current.scale.setScalar(s * 2)
      return
    }

    const r = reaction.current
    if (r.time > 0) {
      r.time -= delta * 2.5
      const p = Math.max(0, r.time)
      const ease = Math.sin(p * Math.PI)

      switch (r.type) {
        case 'bounce':
          ref.current.position.y = ease * 0.6
          ref.current.rotation.z = Math.sin(t * 8) * 0.08 * ease
          break
        case 'spin':
          ref.current.rotation.y += delta * 10 * ease
          break
        case 'shake':
          ref.current.position.x = Math.sin(t * 20) * 0.08 * ease
          ref.current.rotation.z = Math.sin(t * 20) * 0.05 * ease
          break
      }
      if (r.time <= 0) r.type = 'none'
    }

    ref.current.position.y += (Math.sin(t * 0.8) * 0.1 - 0.05) * delta * 2
    ref.current.rotation.y += delta * 0.3 + Math.sin(t * 0.3) * 0.002
    ref.current.rotation.z = Math.sin(t * 0.5) * 0.03
    const breath = 1 + Math.sin(t * 1.2) * 0.015
    ref.current.scale.setScalar(breath * 2)
  })

  return <primitive ref={ref} object={scene} scale={2} />
}

function Loader() {
  return (
    <Html center>
      <div className="text-white/60 text-sm">Loading...</div>
    </Html>
  )
}

export default function GameScene({ dexNumber, actionTrigger, isSleeping }: { dexNumber: number; actionTrigger: number; isSleeping: boolean }) {
  return (
    <Canvas camera={{ position: [0, 1.5, 4], fov: 40 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} />
      <Suspense fallback={<Loader />}>
        <PokemonModel key={dexNumber} dexNumber={dexNumber} actionTrigger={actionTrigger} isSleeping={isSleeping} />
        <ContactShadows position={[0, -0.5, 0]} opacity={0.5} scale={4} blur={2.5} />
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={2}
        maxDistance={8}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.8}
      />
    </Canvas>
  )
}
