import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, ContactShadows, Html } from '@react-three/drei'
import type { Object3D } from 'three'

const MODEL_BASE = 'https://raw.githubusercontent.com/Pokemon-3D-api/assets/main/models/opt/regular'

;[172, 25, 26].forEach(n => useGLTF.preload(`${MODEL_BASE}/${n}.glb`))

function PokemonModel({ dexNumber }: { dexNumber: number }) {
  const url = `${MODEL_BASE}/${dexNumber}.glb`
  const { scene } = useGLTF(url)
  const ref = useRef<Object3D>(null)

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.08
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

export default function GameScene({ dexNumber }: { dexNumber: number }) {
  return (
    <Canvas camera={{ position: [0, 1.5, 4], fov: 40 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} />
      <Suspense fallback={<Loader />}>
        <PokemonModel key={dexNumber} dexNumber={dexNumber} />
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
