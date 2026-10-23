import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Color, DoubleSide, Float32BufferAttribute, Group, SphereGeometry, type Object3D } from 'three'

// Ape segnaposto di Cerchio in volo stazionario, in unità "ape" (lunga circa 1) e poi scalata.
// Corpo lungo x: dalla camera, a sud, si vede di fianco. Ali che battono veloci, piccolo
// ondeggiare su e giù.
const YELLOW = new Color('#e0a528')
const BLACK = new Color('#2b2420')
const STRIPES = 6

/** Addome a righe: ellissoide colorato per fasce lungo x. */
function makeAbdomen() {
  const geometry = new SphereGeometry(1, 28, 16)
  geometry.scale(0.34, 0.24, 0.24)
  const positions = geometry.attributes.position
  const colors = new Float32Array(positions.count * 3)
  for (let i = 0; i < positions.count; i++) {
    const band = Math.floor(((positions.getX(i) + 0.34) / 0.68) * STRIPES)
    const color = band % 2 === 0 ? BLACK : YELLOW
    colors.set([color.r, color.g, color.b], i * 3)
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
  return geometry
}

export function Bee({ scale, anchor }: { scale: number; anchor: (object: Object3D | null) => void }) {
  const body = useRef<Group>(null)
  const leftWing = useRef<Group>(null)
  const rightWing = useRef<Group>(null)
  const abdomen = useMemo(makeAbdomen, [])
  useEffect(() => () => abdomen.dispose(), [abdomen])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (body.current) {
      body.current.position.y = Math.sin(t * 2.3) * 0.12
      body.current.rotation.y = Math.sin(t * 0.6) * 0.25
      body.current.rotation.z = Math.sin(t * 2.3 + 0.8) * 0.06
    }
    const flap = 0.35 + Math.sin(t * 48) * 0.65
    if (leftWing.current) leftWing.current.rotation.x = flap
    if (rightWing.current) rightWing.current.rotation.x = -flap
  })

  return (
    <group scale={scale}>
      <group ref={body}>
        <mesh geometry={abdomen} position={[-0.3, 0, 0]} rotation={[0, 0, 0.15]} castShadow>
          <meshStandardMaterial vertexColors roughness={0.6} />
        </mesh>
        <mesh position={[0.08, 0.02, 0]} castShadow>
          <sphereGeometry args={[0.17, 18, 12]} />
          <meshStandardMaterial color="#5a4128" roughness={0.95} />
        </mesh>
        <mesh position={[0.3, 0.02, 0]} castShadow>
          <sphereGeometry args={[0.12, 16, 12]} />
          <meshStandardMaterial color={BLACK} roughness={0.5} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[0.4, 0.13, side * 0.05]} rotation={[side * 0.3, 0, -0.6]}>
            <cylinderGeometry args={[0.008, 0.008, 0.18, 4]} />
            <meshBasicMaterial color={BLACK} />
          </mesh>
        ))}
        {[leftWing, rightWing].map((wing, i) => {
          const side = i === 0 ? 1 : -1
          return (
            <group key={side} ref={wing} position={[0.04, 0.15, side * 0.05]}>
              <mesh position={[-0.06, 0, side * 0.24]} rotation={[-Math.PI / 2, 0, -0.25 * side]} scale={[1, 0.5, 1]}>
                <circleGeometry args={[0.26, 24]} />
                <meshStandardMaterial color="#dde8ef" transparent opacity={0.72} side={DoubleSide} depthWrite={false} roughness={0.2} />
              </mesh>
            </group>
          )
        })}
      </group>
      <object3D ref={anchor} position={[0, 0.5, 0]} />
    </group>
  )
}
