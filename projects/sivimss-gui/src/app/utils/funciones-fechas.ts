export function obtenerHoraActual(): string {
  const fechaActual: Date = new Date();
  const horaActual: string = fechaActual.getHours().toString().padStart(2, '0');
  const minutosActuales: string = fechaActual.getMinutes().toString().padStart(2, '0');
  const amPm: 'a.m.' | 'p.m.' = +horaActual >= 12 ? 'p.m.' : 'a.m.';
  const horaFormateada: string = (+horaActual % 12 || 12).toString().padStart(2, '0');
  return `${horaFormateada}:${minutosActuales} ${amPm}`;
}

export function obtenerFechaActual(): string {
  const fechaActual: Date = new Date();
  const diaActual: string = fechaActual.getDate().toString().padStart(2, '0');
  const mesActual: string = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
  const anioActual: string = fechaActual.getFullYear().toString();
  return `${diaActual}-${mesActual}-${anioActual}`;
}
