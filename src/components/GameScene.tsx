import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, ContactShadows, Html } from '@react-three/drei'
import type { Object3D, Mesh } from 'three'
import * as THREE from 'three'
import type { Mood } from '../useGameState'
import { useMemo } from 'react'

const MODEL_BASE = '/models'

;[1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(n => useGLTF.preload(`${MODEL_BASE}/${n}.glb`))

const MOOD_COLORS: Record<Mood, string> = {
  happy: '#FFD700',
  sad: '#4A90D9',
  angry: '#FF4444',
  tired: '#888899',
  neutral: '#44DDBB',
}

function Poop({ position }: { position: [number, number, number] }) {
  const ref = useRef<Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y += 0.005
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.01
  })
  return (
    <mesh ref={ref} position={position}>
      <cylinderGeometry args={[0.08, 0.12, 0.1, 8]} />
      <meshStandardMaterial color="#5C4033" roughness={0.9} />
    </mesh>
  )
}

function MoodRing({ mood }: { mood: Mood }) {
  const ref = useRef<Mesh>(null)
  const color = MOOD_COLORS[mood]
  useFrame((state) => {
    if (!ref.current) return
    const mat = ref.current.material as THREE.Material
    mat.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 1.5) * 0.1
    ref.current.rotation.z = state.clock.elapsedTime * 0.1
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, 0]}>
      <ringGeometry args={[0.6, 0.75, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.25} side={THREE.DoubleSide} />
    </mesh>
  )
}

function PokemonModel({ dexNumber, mood, isSleeping }: { dexNumber: number; mood: Mood; isSleeping: boolean }) {
  const url = `${MODEL_BASE}/${dexNumber}.glb`
  const { scene } = useGLTF(url)
  const ref = useRef<Object3D>(null)

  useFrame((state, delta) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime()

    if (isSleeping) {
      ref.current.rotation.x = Math.sin(t * 0.6) * 0.2
      ref.current.rotation.z = Math.sin(t * 0.6) * 0.15
      ref.current.rotation.y = Math.sin(t * 0.4) * 0.1
      ref.current.position.y = -0.1 + Math.sin(t * 0.5) * 0.02
      ref.current.scale.setScalar((1 + Math.sin(t * 0.8) * 0.01) * 2)
      return
    }

    const speed = mood === 'tired' ? 0.4 : mood === 'angry' ? 1.5 : mood === 'happy' ? 1.3 : 1
    const amp = mood === 'sad' ? 0.5 : mood === 'angry' ? 1.5 : 1

    ref.current.position.y = Math.sin(t * 0.8 * speed) * 0.08 * amp
    ref.current.rotation.y += delta * 0.3 * speed
    ref.current.rotation.z = Math.sin(t * 0.5 * speed) * 0.03 * amp
    const breath = 1 + Math.sin(t * 1.2 * speed) * 0.015
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

export default function GameScene({ dexNumber, mood, isSleeping, pooCount }: { dexNumber: number; mood: Mood; isSleeping: boolean; pooCount: number }) {
  const pooPositions = useMemo(() => {
    return [[-0.3, -0.15, 0.2], [0.3, -0.15, -0.15], [0, -0.15, -0.35]] as [number, number, number][]
  }, [])

  return (
    <Canvas camera={{ position: [0, 1.5, 4], fov: 40 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} />
      <Suspense fallback={<Loader />}>
        <PokemonModel key={dexNumber} dexNumber={dexNumber} mood={mood} isSleeping={isSleeping} />
        <MoodRing mood={mood} />
        {pooPositions.slice(0, pooCount).map((pos, i) => (
          <Poop key={i} position={pos} />
        ))}
        <ContactShadows position={[0, -0.5, 0]} opacity={0.5} scale={4} blur={2.5} />
      </Suspense>
      <OrbitControls enablePan={false} enableZoom={true} minDistance={2} maxDistance={8} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 1.8} />
    </Canvas>
  )
}
