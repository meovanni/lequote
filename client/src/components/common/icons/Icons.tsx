interface IconProps {
  className?: string
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function CameraIcon({ className }: IconProps) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="3" y="8" width="22" height="15" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="14" cy="15.5" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 8l1.6-2.6h6.8L19 8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

export function VideoIcon({ className }: IconProps) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="3" y="6" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M19 11.5l6-3.5v12l-6-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9.5 11l4 3-4 3v-6Z" fill="currentColor" />
    </svg>
  )
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2.5v11M2.5 8h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function MinusIcon({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.5 8h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function PinIcon({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M9 16.5S3.5 11.2 3.5 7.2a5.5 5.5 0 1 1 11 0c0 4-5.5 9.3-5.5 9.3Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="9" cy="7.2" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
