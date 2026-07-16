/**
 * Abre el flujo de reserva en una pestaña nueva.
 * Hoy dirige al login (la reserva requiere cuenta); al conectar el
 * portal del cliente basta con cambiar la ruta destino.
 */
export function openReservation() {
  window.open('/login', '_blank', 'noopener,noreferrer')
}
