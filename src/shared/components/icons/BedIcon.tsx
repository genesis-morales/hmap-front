/** Ícono de línea "cama" (antd no incluye uno). Mismo trazo que RoomDetailModal. */
export function BedIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`anticon ${className}`}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 14h18M6 10V8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2" />
    </svg>
  )
}
