/** Iniciales para el avatar: 'Alejandro' + 'Morales' → 'AM'. */
export function getInitials(name: string, lastName: string): string {
  return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}
