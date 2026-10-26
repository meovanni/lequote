import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { CanvasTexture, Group, SRGBColorSpace, type Sprite, type SpriteMaterial } from 'three'

// Banchi di foschia sulle cime (Gran Sasso, Maiella, Velino), come il fumo nei plastici
// fotografati. Ogni banco è fatto di qualche sbuffo che scorre piano col vento: compare in
// dissolvenza, attraversa la montagna, svanisce e riparte, cambiando appena forma.
const BANKS: { position: [number, number, number]; size: number }[] = [
  { position: [-33, 12, -21], size: 30 },
  { position: [12, 11, 24], size: 26 },
  { position: [-46, 10, 8], size: 24 },
]
const PUFFS_PER_BANK = 3
/** Vento da ovest-sud-ovest: gli sbuffi vanno verso est, un poco a nord. */
const WIND: [number, number] = [0.96, -0.28]
/** km al secondo nel mondo del diorama: si vede scorrere, senza fretta (un passaggio dura ~30 s). */
const WIND_SPEED = 2
/** Tratto che uno sbuffo percorre prima di svanire e ripartire. */
const DRIFT_KM = 60

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

const PUFFS = BANKS.flatMap((bank, b) =>
  Array.from({ length: PUFFS_PER_BANK }, (_, p) => ({
    bank,
    // Sbuffi sfalsati nel ciclo, così il banco non sparisce mai tutto insieme.
    offset: (p / PUFFS_PER_BANK + b * 0.17) % 1,
    lift: (p - 1) * 0.8,
    scale: 0.7 + ((p * 37 + b * 11) % 10) / 25,
    seed: b * 3.1 + p * 1.7,
  })),
)

export function Mist({ opacity = 0.3 }: { opacity?: number }) {
  const texture = useMemo(puffTexture, [])
  const group = useRef<Group>(null)
  useEffect(() => () => texture.dispose(), [texture])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    group.current?.children.forEach((child, i) => {
      const puff = PUFFS[i]
      const sprite = child as Sprite
      // Fase 0-1 lungo il tratto: entra al centro di sinistra del banco, esce a destra.
      const phase = (puff.offset + (t * WIND_SPEED) / DRIFT_KM) % 1
      const along = (phase - 0.5) * DRIFT_KM
      const [x, y, z] = puff.bank.position
      sprite.position.set(x + WIND[0] * along, y + puff.lift + Math.sin(t * 0.3 + puff.seed) * 0.4, z + WIND[1] * along)
      const breathe = 1 + Math.sin(t * 0.35 + puff.seed) * 0.16
      const size = puff.bank.size * puff.scale
      sprite.scale.set(size * breathe, size * 0.45 * (2 - breathe), 1)
      ;(sprite.material as SpriteMaterial).opacity = opacity * Math.sin(Math.PI * phase)
    })
  })

  return (
    <group ref={group}>
      {PUFFS.map((puff, i) => (
        <sprite key={i} position={puff.bank.position}>
          <spriteMaterial map={texture} transparent opacity={0} depthWrite={false} fog={false} />
        </sprite>
      ))}
    </group>
  )
}
