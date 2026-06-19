import { useRef, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, ContactShadows, Html } from '@react-three/drei'
import type { Object3D, Mesh, Points } from 'three'
import * as THREE from 'three'
import type { Mood } from '../useGameState'

const MODEL_BASE = '/models'
const ALL_MODELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 13, 16, 19, 21, 41]
ALL_MODELS.forEach(n => useGLTF.preload(`${MODEL_BASE}/${n}.glb`))

const MOOD_COLORS: Record<Mood, number> = {
  happy: 0xFFD700, sad: 0x4A90D9, angry: 0xFF4444, tired: 0x888899, neutral: 0x44DDBB,
}

function Particles({ mood, count = 30 }: { mood: Mood; count?: number }) {
  const ref = useRef<Points>(null)
  const color = MOOD_COLORS[mood]

  const [positions, sizes, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const siz = new Float32Array(count)
    const spd = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 3
      pos[i * 3 + 1] = Math.random() * 2.5 - 0.5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3
      siz[i] = Math.random() * 0.04 + 0.01
      spd[i] = Math.random() * 0.5 + 0.2
    }
    return [pos, siz, spd]
  }, [count])

  useFrame((state) => {
    if (!ref.current) return
    const geo = ref.current.geometry
    const pos = geo.attributes.position.array as Float32Array
    const t = state.clock.elapsedTime
    for (let i = 0; i < count; i++) {
      const j = i * 3
      pos[j + 1] += Math.sin(t * speeds[i] + i) * 0.002
      if (pos[j + 1] > 2) pos[j + 1] = -0.5
    }
    geo.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color={color} transparent opacity={0.5} sizeAttenuation />
    </points>
  )
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

export function PokemonModel({ dexNumber, mood = 'neutral', isSleeping = false, isAttacking = false, isHit = false, isWild = false }: { dexNumber: number; mood?: Mood; isSleeping?: boolean; isAttacking?: boolean; isHit?: boolean; isWild?: boolean }) {
  const url = `${MODEL_BASE}/${dexNumber}.glb`
  const { scene } = useGLTF(url)
  const ref = useRef<Object3D>(null)
  const hitTimer = useRef(0)

  useFrame((state, delta) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime()

    if (isHit) {
      hitTimer.current = 0.3
    }
    if (hitTimer.current > 0) {
      hitTimer.current -= delta
      ref.current.position.x = (isWild ? 1 : -1) * 0.5 + Math.sin(t * 40) * 0.08
      ref.current.rotation.z = Math.sin(t * 40) * 0.1
      return
    }

    if (isAttacking) {
      const lunge = Math.sin(t * 6) * 0.4
      ref.current.position.x = (isWild ? -1 : 1) * lunge
      ref.current.rotation.z = (isWild ? -1 : 1) * Math.sin(t * 6) * 0.1
      return
    }

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
    ref.current.rotation.x = Math.sin(t * 0.4 * speed) * 0.03 * amp
    ref.current.rotation.z = Math.sin(t * 0.5 * speed) * 0.03 * amp
    const breath = 1 + Math.sin(t * 1.2 * speed) * 0.015
    const squash = 1 + Math.sin(t * 2.4 * speed) * 0.01
    ref.current.scale.set(breath * 2 * squash, breath * 2 / squash, breath * 2)
  })

  return <primitive ref={ref} object={scene} scale={2} position={isWild ? [1, 0, 0] : [-1, 0, 0]} />
}

function Loader() { return <Html center><div className="text-white/60 text-sm">Loading...</div></Html> }

function NormalScene({ dexNumber, mood, isSleeping, pooCount }: { dexNumber: number; mood: Mood; isSleeping: boolean; pooCount: number }) {
  const pooPositions = useMemo(() => [[-0.3, -0.15, 0.2], [0.3, -0.15, -0.15], [0, -0.15, -0.35]] as [number, number, number][], [])
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />
      <PokemonModel dexNumber={dexNumber} mood={mood} isSleeping={isSleeping} />
      <MoodRing mood={mood} />
      <Particles mood={mood} />
      {pooPositions.slice(0, pooCount).map((pos, i) => <Poop key={i} position={pos} />)}
      <ContactShadows position={[0, -0.5, 0]} opacity={0.5} scale={4} blur={2.5} />
    </>
  )
}

function BattleScene({ playerDex, wildDex, playerAttacking, wildAttacking, playerHit, wildHit }: { playerDex: number; wildDex: number; playerAttacking: boolean; wildAttacking: boolean; playerHit: boolean; wildHit: boolean }) {
  return (
    <>
      <color attach="background" args={['#0a0a1a']} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 5, 3]} intensity={0.6} />
      <spotLight position={[0, 5, 0]} angle={0.5} penumbra={0.5} intensity={0.5} color="#ff6644" />
      <PokemonModel dexNumber={playerDex} mood="neutral" isAttacking={playerAttacking} isHit={playerHit} />
      <PokemonModel dexNumber={wildDex} mood="angry" isAttacking={wildAttacking} isHit={wildHit} isWild />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <circleGeometry args={[3, 32]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
    </>
  )
}

export default function GameScene({ phase, dexNumber, mood, isSleeping, pooCount, wildDex, playerAttacking, wildAttacking, playerHit, wildHit }: {
  phase: string; dexNumber: number; mood: Mood; isSleeping: boolean; pooCount: number;
  wildDex?: number; playerAttacking?: boolean; wildAttacking?: boolean; playerHit?: boolean; wildHit?: boolean
}) {
  return (
    <Canvas camera={{ position: phase === 'battle' ? [0, 1, 5] : [0, 1.5, 4], fov: 40 }} dpr={[1, 1.5]}>
      <Suspense fallback={<Loader />}>
        {phase === 'battle' ? (
          <BattleScene playerDex={dexNumber} wildDex={wildDex ?? 10} playerAttacking={playerAttacking ?? false} wildAttacking={wildAttacking ?? false} playerHit={playerHit ?? false} wildHit={wildHit ?? false} />
        ) : (
          <NormalScene dexNumber={dexNumber} mood={mood} isSleeping={isSleeping} pooCount={pooCount} />
        )}
      </Suspense>
      {phase !== 'battle' && (
        <OrbitControls enablePan={false} enableZoom={true} minDistance={2} maxDistance={8} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 1.8} />
      )}
    </Canvas>
  )
}
