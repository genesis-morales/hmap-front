import type { ReactNode } from 'react'

const base = {
  width: 30,
  height: 30,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

/** Íconos de línea para las comodidades (mismo trazo, estilo uniforme). */
export const amenityIcons: Record<string, ReactNode> = {
  wifi: (
    <svg {...base}>
      <path d="M5 12.5a10 10 0 0 1 14 0" />
      <path d="M8.5 16a5 5 0 0 1 7 0" />
      <circle cx="12" cy="19" r="0.6" fill="currentColor" />
    </svg>
  ),
  pool: (
    <svg {...base}>
      <path d="M2 18c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1" />
      <path d="M2 14c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1" />
      <path d="M8 12V6a2 2 0 0 1 4 0M14 12V6a2 2 0 0 1 4 0" />
    </svg>
  ),
  fridge: (
    <svg {...base}>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M6 10h12M10 6v1M10 13v3" />
    </svg>
  ),
  tv: (
    <svg {...base}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M8 3l4 3 4-3" />
    </svg>
  ),
  hotwater: (
    <svg {...base}>
      <path d="M12 21a5 5 0 0 0 5-5c0-3-5-8-5-8s-5 5-5 8a5 5 0 0 0 5 5Z" />
      <path d="M12 3c1 1 1 2 0 3" />
    </svg>
  ),
}
