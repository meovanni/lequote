import styles from './HexPattern.module.css'

interface HexPatternProps {
  className?: string
}

const HEX_ID = 'hex-pattern'

export function HexPattern({ className }: HexPatternProps) {
  return (
    <svg
      className={[styles.svg, className].filter(Boolean).join(' ')}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id={HEX_ID} width="56" height="97" patternUnits="userSpaceOnUse" patternTransform="scale(1)">
          <path
            d="M28 0 L56 16 L56 48 L28 64 L0 48 L0 16 Z M28 64 L56 80 L56 97 M28 64 L0 80 L0 97"
            fill="none"
            stroke="var(--color-miele)"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${HEX_ID})`} />
    </svg>
  )
}
