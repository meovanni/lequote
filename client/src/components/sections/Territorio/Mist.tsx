import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { CanvasTexture, Group, SRGBColorSpace } from 'three'

// Banchi di foschia sulle cime (Gran Sasso, Maiella, Velino e Sirente), come il fumo nei plastici
// fotografati: macchie bianche morbide che respirano piano.
const BANKS: { position: [number, number, number]; size: number; phase: number }[] = [
  { position: [-33, 12, -21], size: 30, phase: 0 },
  { position: [12, 11, 24], size: 26, phase: 3.1 },
  { position: [-46, 10, 8], size: 24, phase: 2.3 },
]

function puffTexture() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const context = canvas.getContext('2d')!
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,0.85)')
  gradient.addColorStop(0.45, 'rgba(255,255,255,0.35)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

export function Mist({ opacity = 0.22 }: { opacity?: number }) {
  const texture = useMemo(puffTexture, [])
  const group = useRef<Group>(null)
  useEffect(() => () => texture.dispose(), [texture])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    group.current?.children.forEach((sprite, i) => {
      const bank = BANKS[i]
      sprite.position.x = bank.position[0] + Math.sin(t * 0.05 + bank.phase) * 3
      sprite.position.y = bank.position[1] + Math.sin(t * 0.08 + bank.phase) * 0.6
    })
  })

  return (
    <group ref={group}>
      {BANKS.map((bank, i) => (
        <sprite key={i} position={bank.position} scale={[bank.size, bank.size * 0.45, 1]}>
          <spriteMaterial map={texture} transparent opacity={opacity} depthWrite={false} fog={false} />
        </sprite>
      ))}
    </group>
  )
}
